import { useState, useEffect } from "react"
import { nanoid } from "nanoid"
import Confetti from "react-confetti"
import Dice from "./Dice"

export default function App() {

  const [dice, setDice] = useState(allNewDice())
  const [tenzies, setTenzies] = useState(false)
  const [rollCount, setRollCount] = useState(0)
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);

  useEffect(() => {
    const allHeld = dice.every(die => die.isHeld)
    const allSameValue = dice.every(die => die.value === dice[0].value)

    if (allHeld && allSameValue) {
      setTenzies(true)
    }
  }, [dice])


  useEffect(() => {
    let interval = null;

    if (!tenzies && rollCount > 0) {
      if (rollCount === 1) {
        setStartTime(Date.now());
      }

      interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [tenzies, rollCount]);


  function generateNewDice() {
    return {
      value: Math.ceil(Math.random() * 6),
      isHeld: false,
      id: nanoid()
    }
  }

  function allNewDice() {
    const newDice = []
    for (let i = 0; i < 10; i++) {
      newDice.push(generateNewDice())
    }
    return newDice
  }


  function rollDice() {
    if (tenzies) {
      setTenzies(false)
      setDice(allNewDice())
      setRollCount(0)
      return
    }

    setDice(oldDice => oldDice.map(die => {
      return die.isHeld ? die : generateNewDice()
    }))
    setRollCount(rollCount + 1)
  }

  function holdDice(id) {
    setDice(oldDice => oldDice.map(die => {
      return die.id === id
        ? { ...die, isHeld: !die.isHeld }
        : die
    }))
  }

  function formatTime(time) {
    if (!time) {
      return "00:00";
    }

    const difference = time - startTime;
    let seconds = Math.floor((difference / 1000) % 60);
    let minutes = Math.floor((difference / (1000 * 60)) % 60);

    seconds = seconds < 10 ? `0${seconds}` : seconds;
    minutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${minutes}:${seconds}`;
  }


  const diceElements = dice.map(die => (
    <Dice
      key={die.id}
      value={die.value}
      isHeld={die.isHeld}
      holdDice={() => holdDice(die.id)}
    />
  ))

  return (
    <main>
      {tenzies && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      {
        rollCount
          ?
          <>
            <div className="roll-count">
              <p>Time: {formatTime(currentTime)}</p>
              <p>Roll: {rollCount}</p>
            </div>
          </>
          :
          <>
            <h1 className="title">Tenzies</h1>
            <p className="instructions">Roll until all dice are the same.
              Click each die to freeze it at its current value between rolls.</p>
          </>
      }
      <div className="dice-container">
        {diceElements}
      </div>
      <button
        className="roll-dice"
        onClick={rollDice}
      >
        {tenzies ? "New Game" : "Roll"}
      </button>
    </main>
  )
}
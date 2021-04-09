import "./styles.css";
import Toggle from "react-toggle";
import "react-toggle/style.css";
import { useEffect, useState } from "react";
const SIZE = 10;

export default function App() {
  const [state, setState] = useState(
    new Array(SIZE).fill(undefined).map((a) => {
      return new Array(SIZE).fill(false);
    })
  );
  const [gameEnded, setGameEnded] = useState(false);
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 3, y: 0 },
    { x: 3, y: 1 },
    { x: 3, y: 2 }
  ]);
  const isOnSnake = (row: number, col: number) => {
    return snake.filter((val) => val.x === row && val.y === col).length > 0;
  };
  const getFood = () => {
    // Select a random number and set that as food, if the toggle is not true
    // TODO Add case for no food found
    while (true) {
      const randomRow = Math.floor(Math.random() * SIZE);
      const randomCol = Math.floor(Math.random() * SIZE);
      if (!state[randomRow][randomCol] && !isOnSnake(randomRow, randomCol)) {
        return {
          x: randomRow,
          y: randomCol
        };
      }
    }
  };
  // x is left and y is down
  const [velocity, setVelocity] = useState<{ x: number; y: number }>({
    x: 1,
    y: 0
  });
  const [food, setFood] = useState(() => getFood());
  const [changingDirection, setChangingDirection] = useState(false);
  const isFood = (point: { x: number; y: number }) =>
    point.x === food.x && point.y === food.y;

  useEffect(() => {
    const moveSnake = () => {
      // TODO Add logic of wall detection, currently snake starts from next wall
      setSnake((prevSnake) => {
        const { x: dx, y: dy } = velocity;
        const head = {
          x: (prevSnake[0].x + dx + SIZE) % SIZE,
          y: (prevSnake[0].y + dy + SIZE) % SIZE
        };
        const newSnake = [...prevSnake];
        // Add the new head to the beginning of snake body
        newSnake.unshift(head);
        if (isOnSnake(head.x, head.y)) {
          console.log("Game Ended");
          setGameEnded(true);
        } else if (!isFood(head)) {
          newSnake.pop();
        } else {
          setFood(getFood());
        }
        // newSnake[0].x = (newSnake[0].x + velocity.x + SIZE) % SIZE;
        return newSnake;
      });
    };
    const interval = setInterval(() => {
      if (!gameEnded) {
        moveSnake();
        if (changingDirection) {
          setChangingDirection(false);
        }
      }
    }, 500);
    return () => {
      clearInterval(interval);
    };
  }, [velocity, gameEnded, changingDirection]);

  useEffect(() => {
    const keyPress = document.addEventListener("keydown", (e) => {
      const KEY_TO_VELOCITY = {
        ArrowUp: { x: -1, y: 0 },
        ArrowRight: { x: 0, y: 1 },
        ArrowLeft: { x: 0, y: -1 },
        ArrowDown: { x: 1, y: 0 }
      };
      const possibleValues = Object.keys(KEY_TO_VELOCITY).join(" ");
      if (possibleValues.includes(e.key) && !changingDirection) {
        switch (e.key) {
          case "ArrowLeft": {
            if (
              velocity.x !== KEY_TO_VELOCITY["ArrowRight"].x &&
              velocity.y !== KEY_TO_VELOCITY["ArrowRight"].y
            ) {
              setChangingDirection(true);
              setVelocity({ x: 0, y: -1 });
            }
            break;
          }
          case "ArrowDown": {
            if (
              velocity.x !== KEY_TO_VELOCITY["ArrowUp"].x &&
              velocity.y !== KEY_TO_VELOCITY["ArrowUp"].y
            ) {
              setChangingDirection(true);
              setVelocity({ x: 1, y: 0 });
            }
            break;
          }
          case "ArrowUp": {
            if (
              velocity.x !== KEY_TO_VELOCITY["ArrowDown"].x &&
              velocity.y !== KEY_TO_VELOCITY["ArrowDown"].y
            ) {
              setChangingDirection(true);
              setVelocity({ x: -1, y: 0 });
            }
            break;
          }
          case "ArrowRight": {
            if (
              velocity.x !== KEY_TO_VELOCITY["ArrowLeft"].x &&
              velocity.y !== KEY_TO_VELOCITY["ArrowLeft"].y
            ) {
              setChangingDirection(true);
              setVelocity({ x: 0, y: 1 });
            }
            break;
          }
        }
      }
    });

    return () => {
      document.removeEventListener("keydown", keyPress);
    };
  }, [velocity]);

  return (
    <div className="App">
      <h1>Snake Toggles</h1>
      <h2>Score : {snake.length}</h2>
      {gameEnded ? <h2>Game Ended</h2> : null}
      {state.map((line, row) => {
        return (
          <div key={`ROW_${row}`}>
            {line.map((cell, column) => {
              return (
                <label key={`COL_${column}`}>
                  <Toggle
                    icons={false}
                    checked={
                      isFood({ x: row, y: column }) || isOnSnake(row, column)
                    }
                  />
                </label>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

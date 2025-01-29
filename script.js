const squares = document.querySelectorAll(".square");
const roundDisplay = document.getElementById("round");
const recordDisplay = document.getElementById("record");
const startButton = document.querySelector(".startButton");
const difficultyButtons = document.querySelectorAll(".difficulties div");
//const gameIntro = document.getElementById("game-intro")

class SimonSays {
  constructor(squares, roundDisplay, recordDisplay, startButton, difficultyButtons) {
    this.squares = squares;
    this.roundDisplay = roundDisplay;
    this.recordDisplay = recordDisplay;
    this.startButton = startButton;
    this.difficultyButtons = difficultyButtons;

    this.sequence = [];
    this.playerSequence = [];
    this.difficulty = null;
    this.unlockedDifficulties = ["normal"];

    this.difficulties = {
      normal: { speed: 1000, record: 0, round: 0 },
      medium: { speed: 500, record: 0, round: 0 },
      hard: { speed: 200, record: 0, round: 0 },
      impossible: { speed: 1000, record: 0, round: 0 },
    };

    this.errorSound = new Audio("")

    this.buttonSounds = [
      new Audio ("./sounds/sounds_1.mp3"),
      new Audio ("./sounds/sounds_2.mp3"),
      new Audio ("./sounds/sounds_3.mp3"),
      new Audio ("./sounds/sounds_4.mp3")
    ]

    this.addDifficultyListeners();
    this.addStartButtonListener();
  }

  addDifficultyListeners() {
    this.difficultyButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const difficulty = button.id.replace("-difficulty", "");
        if (this.unlockedDifficulties.includes(difficulty)) {
          this.difficulty = difficulty;

          this.difficulties[difficulty].round = 0;
          this.updateDisplay();

          if (difficulty !== "hard") {
            this.resetButtonRotation();
          }

          this.difficultyButtons.forEach((btn) => (btn.style.color = "gray"));
          button.style.color = "white";
        }
      });
    });
  }

  addStartButtonListener() {
    this.startButton.addEventListener("click", () => {
      if (!this.difficulty) {
        return;
      }
      this.resetGame();
      this.startGame();
    });
  }

  startGame() {
    this.addStepToSequence();
    this.playSequence();
  }

  resetGame() {
    this.sequence = [];
    this.playerSequence = [];
    this.difficulties[this.difficulty].round = 0;
    this.updateDisplay();
  }

  addStepToSequence() {
    const randomIndex = Math.floor(Math.random() * this.squares.length);
    this.sequence.push(this.squares[randomIndex]);
    this.difficulties[this.difficulty].round++;
    this.updateDisplay();

    if (this.difficulty === "hard") {
      this.rotateButtons();
    }
  }

  rotateButtons() {
    const buttonContainer = document.querySelector(".buttonContainer");
    const buttons = Array.from(buttonContainer.querySelectorAll(".square"));

    if (buttons.length === 0) return;

    const lastButton = buttons[buttons.length - 1];
    buttonContainer.insertBefore(lastButton, buttons[0]);
  }

  resetButtonRotation() {
    const buttonContainer = document.querySelector(".buttonContainer");
    buttonContainer.innerHTML = "";
    this.squares.forEach((square) => {
      buttonContainer.appendChild(square);
    });
  }

  playSequence() {
    let delay = 0;
    this.disablePlayerInput();

    this.sequence.forEach((square) => {
      setTimeout(() => {
        if (this.difficulty !== "impossible") {
          this.activateSquare(square);
        }
      }, delay);
      delay += this.difficulties[this.difficulty].speed;
    });

    setTimeout(() => {
      this.enablePlayerInput();
    }, delay);
  }

  activateSquare(square) {
    square.classList.add("active");
    setTimeout(() => {
      square.classList.remove("active");
    }, this.difficulties[this.difficulty].speed / 2);
  }

  enablePlayerInput() {
    this.playerSequence = [];
    this.squares.forEach((square) => {
      square.addEventListener("click", this.handlePlayerInput);
      
    });
  }

  disablePlayerInput() {
    this.squares.forEach((square) => {
      square.removeEventListener("click", this.handlePlayerInput);
    });
  }

  handlePlayerInput = (event) => {
    const square = event.target;
    const index = this.playerSequence.length;

    if (square === this.sequence[index]) {
      if (this.difficulty === "impossible") {
        this.activateSquare(square);
      }

      this.playerSequence.push(square);

      if (this.playerSequence.length === this.sequence.length) {
        this.disablePlayerInput();
        const currentDifficulty = this.difficulties[this.difficulty];

        if (currentDifficulty.round > currentDifficulty.record) {
          currentDifficulty.record = currentDifficulty.round;
          this.updateDisplay();
          this.checkAndUnlockDifficulties();
        }
        setTimeout(() => {
          this.addStepToSequence();
          this.playSequence();
        }, 1000);
      }
    } else {
      this.resetGame();
    }
    console.log("prueba click")
  };

  checkAndUnlockDifficulties() {
    if (this.difficulties[this.difficulty].record === 1) {
      if (this.difficulty === "normal" && !this.unlockedDifficulties.includes("medium")) {
        this.unlockedDifficulties.push("medium");
        this.updateDifficultyButton("medium-difficulty");
      } else if (this.difficulty === "medium" && !this.unlockedDifficulties.includes("hard")) {
        this.unlockedDifficulties.push("hard");
        this.updateDifficultyButton("hard-difficulty");
      } else if (this.difficulty === "hard" && !this.unlockedDifficulties.includes("impossible")) {
        this.unlockedDifficulties.push("impossible");
        this.updateDifficultyButton("impossible-difficulty");
      }
    }
  }

  updateDifficultyButton(buttonId) {
    const button = document.getElementById(buttonId);
    button.textContent = button.textContent.replace("🔒", "");
    button.style.color = "white";
    button.style.cursor = "pointer";
  }

  updateDisplay() {
    const currentDifficulty = this.difficulties[this.difficulty];
    this.roundDisplay.textContent = `ROUND: ${currentDifficulty.round}`;
    this.recordDisplay.textContent = `RECORD: ${currentDifficulty.record}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new SimonSays(squares, roundDisplay, recordDisplay, startButton, difficultyButtons);
});

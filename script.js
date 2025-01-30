//DOM
const squares = document.querySelectorAll(".square");
const roundDisplay = document.getElementById("round");
const recordDisplay = document.getElementById("record");
const startButton = document.querySelector(".startButton");
const difficultyButtons = document.querySelectorAll(".difficulties div");
const gameIntro = document.getElementById("game-intro");
const startGameButton = document.getElementById("startGame");
const backToMenuButton = document.querySelector(".backToMenu button");
const simonGameDiv = document.querySelector(".simon");
const cyberpunkMusic = document.getElementById("cyberpunk-music");
const playerNameInput = document.getElementById("playerName");

//clase
class SimonSays {
    constructor(squares, roundDisplay, recordDisplay, startButton, difficultyButtons, startGameButton) {
        // inicializa las propiedades del juego
        this.squares = squares;
        this.roundDisplay = roundDisplay;
        this.recordDisplay = recordDisplay;
        this.startButton = startButton;
        this.difficultyButtons = difficultyButtons;
        this.startGameButton = startGameButton;

        // secuencia que el jugador debe seguir
        this.sequence = [];
        // secuencia ingresada por el jugador
        this.playerSequence = [];
        // dificultad actual del juego
        this.difficulty = "normal";
        // dificultades desbloqueadas por el jugador
        this.unlockedDifficulties = ["normal"];
        // nombre del jugador
        this.playerName = "";

        // configuración de las dificultades disponibles
        this.difficulties = {
            normal: { speed: 1000, record: 0, round: 0 },
            medium: { speed: 500, record: 0, round: 0 },
            hard: { speed: 200, record: 0, round: 0 },
            impossible: { speed: 1000, record: 0, round: 0 },
        };

        // sonidos asociados a cada cuadrado
        this.buttonSounds = [
            new Audio("./sounds/sounds_1.mp3"),
            new Audio("./sounds/sounds_2.mp3"),
            new Audio("./sounds/sounds_3.mp3"),
            new Audio("./sounds/sounds_4.mp3"),
        ];

        // sonido de error cuando el jugador falla
        this.errorSound = new Audio("./sounds/error.mp3");

        // asigna un sonido a cada cuadrado
        this.squares.forEach((square, index) => {
            square.sound = this.buttonSounds[index];
        });

        // añade listeners para los botones de dificultad y de inicio
        addDifficultyListeners(this.difficultyButtons, this);
        addStartButtonListener(this.startButton, this);
        addStartGameButtonListener(this.startGameButton, gameIntro);

        // deshabilita los botones de dificultad no desbloqueados
        this.disableDifficultyButtons();
    }

    // método para iniciar el juego
    startGame() {
        // obtiene el nombre del jugador
        this.playerName = playerNameInput.value.trim();
        if (!this.playerName) {
            alert("Please enter your name!");
            return;
        }
        // reinicia el juego y comienza una nueva secuencia
        this.resetGame();
        this.addStepToSequence();
        this.playSequence();
    }

    // método para reiniciar el juego
    resetGame() {
        this.sequence = [];
        this.playerSequence = [];
        this.difficulties[this.difficulty].round = 0;
        this.updateDisplay();
    }

    // método para agregar un nuevo paso a la secuencia
    addStepToSequence() {
        const randomIndex = Math.floor(Math.random() * this.squares.length);
        this.sequence.push(this.squares[randomIndex]);
        this.difficulties[this.difficulty].round++;
        this.updateDisplay();

        // si la dificultad es "hard", rota los botones
        if (this.difficulty === "hard") {
            rotateButtons(this.squares);
        }
    }

    // método para reproducir la secuencia actual
    playSequence() {
        let delay = 0;
        this.disablePlayerInput();

        this.sequence.forEach((square) => {
            setTimeout(() => {
                square.sound.play();
                if (this.difficulty !== "impossible") {
                    activateSquare(square, this.difficulties[this.difficulty].speed);
                }
            }, delay);
            delay += this.difficulties[this.difficulty].speed;
        });

        setTimeout(() => {
            this.enablePlayerInput();
        }, delay);
    }

    // método para habilitar la entrada del jugador
    enablePlayerInput() {
        this.playerSequence = [];
        this.squares.forEach((square) => {
            square.addEventListener("click", this.handlePlayerInput);
        });
    }

    // método para deshabilitar la entrada del jugador
    disablePlayerInput() {
        this.squares.forEach((square) => {
            square.removeEventListener("click", this.handlePlayerInput);
        });
    }

    // método que maneja la entrada del jugador
    handlePlayerInput = (event) => {
        const square = event.target;
        const index = this.playerSequence.length;

        // verifica si el jugador hizo clic en el cuadrado correcto
        if (square === this.sequence[index]) {
            if (this.difficulty !== "impossible") {
                activateSquare(square, this.difficulties[this.difficulty].speed);
            }

            this.playerSequence.push(square);
            square.sound.play();

            // si el jugador completó la secuencia, agrega un nuevo paso
            if (this.playerSequence.length === this.sequence.length) {
                this.disablePlayerInput();
                const currentDifficulty = this.difficulties[this.difficulty];

                // actualiza el récord si es necesario
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
            // si el jugador falla, reproduce el sonido de error y reinicia el juego
            this.errorSound.play();
            this.resetGame();
        }
    };

    // método para verificar y desbloquear nuevas dificultades
    checkAndUnlockDifficulties() {
        if (this.difficulties[this.difficulty].record === 5) {
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

    // método para actualizar el estilo de los botones de dificultad desbloqueados
    updateDifficultyButton(buttonId) {
        const button = document.getElementById(buttonId);
        button.textContent = button.textContent.replace("🔒", "");
        button.style.color = "white";
        button.style.cursor = "pointer";

        button.classList.add("unlocked-animation");

        setTimeout(() => {
            button.classList.remove("unlocked-animation");
        }, 1500);
    }

    // método para actualizar la pantalla con la ronda y el récord actual
    updateDisplay() {
        const currentDifficulty = this.difficulties[this.difficulty];
        this.roundDisplay.textContent = `ROUND: ${currentDifficulty.round}`;
        this.recordDisplay.textContent = `RECORD: ${currentDifficulty.record}`;
    }

    // método para deshabilitar los botones de dificultad no desbloqueados
    disableDifficultyButtons() {
        this.difficultyButtons.forEach((button) => {
            if (!this.unlockedDifficulties.includes(button.id.replace("-difficulty", ""))) {
                button.style.pointerEvents = "none";
            }
        });
    }

    // método para habilitar todos los botones de dificultad
    enableDifficultyButtons() {
        this.difficultyButtons.forEach((button) => {
            button.style.pointerEvents = "auto";
        });
    }
}

// función para activar visualmente un cuadrado
function activateSquare(square, speed) {
    square.classList.add("active");
    setTimeout(() => {
        square.classList.remove("active");
    }, speed / 2);
}

// función para rotar los botones en la dificultad "hard"
function rotateButtons(squares) {
    const buttonContainer = document.querySelector(".buttonContainer");
    const buttons = Array.from(buttonContainer.querySelectorAll(".square"));

    if (buttons.length === 0) return;

    const lastButton = buttons[buttons.length - 1];
    buttonContainer.insertBefore(lastButton, buttons[0]);
}

// función para restablecer la rotación de los botones
function resetButtonRotation(squares) {
    const buttonContainer = document.querySelector(".buttonContainer");
    buttonContainer.innerHTML = "";
    squares.forEach((square) => {
        buttonContainer.appendChild(square);
    });
}

// función para añadir listeners a los botones de dificultad
function addDifficultyListeners(difficultyButtons, simonGame) {
    difficultyButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const difficulty = button.id.replace("-difficulty", "");
            if (simonGame.unlockedDifficulties.includes(difficulty)) {
                simonGame.difficulty = difficulty;
                simonGame.resetGame();
                simonGame.updateDisplay();

                if (difficulty !== "hard") {
                    resetButtonRotation(simonGame.squares);
                }

                difficultyButtons.forEach((btn) => (btn.style.color = "gray"));
                button.style.color = "white";
            }
        });
    });
}

// función para añadir un listener al botón de inicio
function addStartButtonListener(startButton, simonGame) {
    startButton.addEventListener("click", () => {
        if (!simonGame.difficulty) {
            return;
        }
        simonGame.startGame();
        simonGame.enableDifficultyButtons();
    });
}

// función para añadir un listener al botón de comenzar el juego
function addStartGameButtonListener(startGameButton, gameIntro) {
    startGameButton.addEventListener("click", () => {
        showSimonGame();
    });
}

// función para mostrar la pantalla del juego
function showSimonGame() {
    gameIntro.style.display = "none";
    simonGameDiv.style.display = "block";
    cyberpunkMusic.pause();
}

// función para mostrar la pantalla de introducción
function showGameIntro() {
    simonGameDiv.style.display = "none";
    gameIntro.style.display = "flex";
    cyberpunkMusic.play();
}

// añade un listener al botón de comenzar el juego para mostrar la pantalla del juego
startGameButton.addEventListener("click", showSimonGame);

// añade un listener al botón de volver al menú para mostrar la pantalla de introducción
backToMenuButton.addEventListener("click", showGameIntro);

// muestra la pantalla de introducción al cargar la página
showGameIntro();

// cuando el DOM está completamente cargado, inicializa el juego
document.addEventListener("DOMContentLoaded", () => {
    const simonGame = new SimonSays(
        squares,
        roundDisplay,
        recordDisplay,
        startButton,
        difficultyButtons,
        startGameButton
    );

    backToMenuButton.addEventListener("click", showGameIntro);

    if (gameIntro.style.display !== "none") {
        cyberpunkMusic.play();
    }
});
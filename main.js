/***********************
 *   GLOBAL VARIABLES  *
 ***********************/
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");
const scoreDisplay = document.getElementById("scoreDisplay");
const scoreForm = document.getElementById("scoreForm");
const playerNameInput = document.getElementById("playerName");
const submitScoreBtn = document.getElementById("submitScoreBtn");
const gameModeSelector = document.getElementById("gameModeSelector");
const modeInstructions = document.getElementById("modeInstructions");
const playerInstructions = document.getElementById("playerInstructions");
const globalLeaderboardEl = document.getElementById("globalLeaderboard");
const localLeaderboardEl = document.getElementById("localLeaderboard");
const mobileControls = document.getElementById("mobileControls");
const btnUp = document.getElementById("btnUp");
const btnDown = document.getElementById("btnDown");
const btnLeft = document.getElementById("btnLeft");
const btnRight = document.getElementById("btnRight");
const pauseButton = document.getElementById("pauseButton");
const toggleMusicBtn = document.getElementById("toggleMusic");
const bgMusic = document.getElementById("bgMusic");

// Grid settings.
const cellSize = 20;
const gridWidth = canvas.width / cellSize;
const gridHeight = canvas.height / cellSize;

let snake = [];
let apple = {};
let score = 0;
let gameLoop;
let paused = false;

// Game mode: "AI" or "Player"
let gameMode = gameModeSelector.value; // default from selector

// For Player mode – track current direction (default right).
let currentDirection = { x: 1, y: 0 };

// Define movement directions.
const directions = [
  { x: 0, y: -1 }, // up
  { x: 1, y: 0 },  // right
  { x: 0, y: 1 },  // down
  { x: -1, y: 0 }  // left
];

// Leaderboard keys and Global API endpoint.
const LOCAL_LEADERBOARD_KEY = "snakeLocalLeaderboard";
const GLOBAL_API_ENDPOINT = ""; // Set your global API endpoint here if available

/***********************
 *  GAME INITIALIZATION *
 ***********************/
function initGame() {
  // Reset snake: start with three segments centered.
  snake = [
    { x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) },
    { x: Math.floor(gridWidth / 2) - 1, y: Math.floor(gridHeight / 2) },
    { x: Math.floor(gridWidth / 2) - 2, y: Math.floor(gridHeight / 2) }
  ];
  score = 0;
  updateScore();
  currentDirection = { x: 1, y: 0 };
  spawnApple();
  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(update, 150);
  paused = false;
  restartBtn.style.display = "none";
  scoreForm.style.display = "none";
  playerNameInput.value = "";
  // Show mobile controls only in Player mode.
  mobileControls.style.display = (gameMode === "Player") ? "block" : "none";
  pauseButton.textContent = "Pause";
  draw();
}

/***********************
 *      GAME LOGIC     *
 ***********************/
function updateScore() {
  scoreDisplay.textContent = "Score: " + score;
}

function spawnApple() {
  let valid = false;
  while (!valid) {
    apple = {
      x: Math.floor(Math.random() * gridWidth),
      y: Math.floor(Math.random() * gridHeight)
    };
    if (!snake.some(segment => segment.x === apple.x && segment.y === apple.y)) {
      valid = true;
    }
  }
}

function isSafe(x, y) {
  if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) return false;
  if (x === apple.x && y === apple.y) {
    if (snake.some(segment => segment.x === x && segment.y === y)) return false;
    return true;
  } else {
    for (let i = 0; i < snake.length - 1; i++) {
      if (snake[i].x === x && snake[i].y === y) return false;
    }
    return true;
  }
}

function getNextDirection() {
  const head = snake[0];
  let possibleMoves = directions.filter(dir => {
    const newX = head.x + dir.x;
    const newY = head.y + dir.y;
    return isSafe(newX, newY);
  });
  if (possibleMoves.length === 0) return null;
  let bestMove = possibleMoves[0];
  let bestDistance =
    Math.abs(head.x + bestMove.x - apple.x) +
    Math.abs(head.y + bestMove.y - apple.y);
  for (let i = 1; i < possibleMoves.length; i++) {
    const move = possibleMoves[i];
    const distance =
      Math.abs(head.x + move.x - apple.x) +
      Math.abs(head.y + move.y - apple.y);
    if (distance < bestDistance) {
      bestMove = move;
      bestDistance = distance;
    }
  }
  return bestMove;
}

function update() {
  if (paused) {
    draw();
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Paused", canvas.width / 2, canvas.height / 2);
    return;
  }
  const head = snake[0];
  let nextMove;
  if (gameMode === "AI") {
    nextMove = getNextDirection();
  } else if (gameMode === "Player") {
    nextMove = currentDirection;
    if (!isSafe(head.x + nextMove.x, head.y + nextMove.y)) {
      nextMove = null;
    }
  }
  if (nextMove === null) {
    gameOver();
    return;
  }
  const newHead = {
    x: head.x + nextMove.x,
    y: head.y + nextMove.y
  };
  snake.unshift(newHead);
  if (newHead.x === apple.x && newHead.y === apple.y) {
    score++;
    updateScore();
    spawnApple();
  } else {
    snake.pop();
  }
  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw apple with neon effects.
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#FF1493"; // Neon pink
  ctx.fillStyle = "#FF1493";
  ctx.fillRect(apple.x * cellSize, apple.y * cellSize, cellSize, cellSize);
  // Draw snake with neon effects.
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#39FF14"; // Neon green
  ctx.fillStyle = "#39FF14";
  snake.forEach(segment => {
    ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
  });
  ctx.shadowBlur = 0;
  // (The score is also updated in the overlay's scoreDisplay.)
}

function gameOver() {
  clearInterval(gameLoop);
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 20);
  restartBtn.style.display = "inline-block";
  scoreForm.style.display = "block";
}

/***********************
 *   PLAYER CONTROLS   *
 ***********************/
document.addEventListener("keydown", (e) => {
  if (gameMode === "Player") {
    if (e.key === "ArrowUp" && currentDirection.y !== 1) {
      currentDirection = { x: 0, y: -1 };
    } else if (e.key === "ArrowDown" && currentDirection.y !== -1) {
      currentDirection = { x: 0, y: 1 };
    } else if (e.key === "ArrowLeft" && currentDirection.x !== 1) {
      currentDirection = { x: -1, y: 0 };
    } else if (e.key === "ArrowRight" && currentDirection.x !== -1) {
      currentDirection = { x: 1, y: 0 };
    }
  }
  if (e.key.toLowerCase() === "p") {
    paused = !paused;
    pauseButton.textContent = paused ? "Resume" : "Pause";
  }
});

// Mobile control listeners.
btnUp.addEventListener("touchstart", (e) => {
  e.preventDefault();
  if (gameMode === "Player" && currentDirection.y !== 1) {
    currentDirection = { x: 0, y: -1 };
  }
});
btnDown.addEventListener("touchstart", (e) => {
  e.preventDefault();
  if (gameMode === "Player" && currentDirection.y !== -1) {
    currentDirection = { x: 0, y: 1 };
  }
});
btnLeft.addEventListener("touchstart", (e) => {
  e.preventDefault();
  if (gameMode === "Player" && currentDirection.x !== 1) {
    currentDirection = { x: -1, y: 0 };
  }
});
btnRight.addEventListener("touchstart", (e) => {
  e.preventDefault();
  if (gameMode === "Player" && currentDirection.x !== -1) {
    currentDirection = { x: 1, y: 0 };
  }
});
// Also support click events.
btnUp.addEventListener("click", () => {
  if (gameMode === "Player" && currentDirection.y !== 1) {
    currentDirection = { x: 0, y: -1 };
  }
});
btnDown.addEventListener("click", () => {
  if (gameMode === "Player" && currentDirection.y !== -1) {
    currentDirection = { x: 0, y: 1 };
  }
});
btnLeft.addEventListener("click", () => {
  if (gameMode === "Player" && currentDirection.x !== 1) {
    currentDirection = { x: -1, y: 0 };
  }
});
btnRight.addEventListener("click", () => {
  if (gameMode === "Player" && currentDirection.x !== -1) {
    currentDirection = { x: 1, y: 0 };
  }
});
// Pause button for mobile/desktop.
pauseButton.addEventListener("click", () => {
  paused = !paused;
  pauseButton.textContent = paused ? "Resume" : "Pause";
});

/***********************
 *   MODE SELECTION    *
 ***********************/
gameModeSelector.addEventListener("change", () => {
  gameMode = gameModeSelector.value;
  if (gameMode === "Player") {
    modeInstructions.textContent = "Mode: Player – Use on‑screen controls or arrow keys.";
    playerInstructions.style.display = "block";
    mobileControls.style.display = "block";
  } else {
    modeInstructions.textContent = "Mode: AI – The snake plays itself.";
    playerInstructions.style.display = "none";
    mobileControls.style.display = "none";
  }
  initGame();
});

/***********************
 *   LEADERBOARD LOGIC *
 ***********************/
function saveLocalScore(name, scoreValue) {
  const entry = { name: name, score: scoreValue };
  let leaderboard = JSON.parse(localStorage.getItem(LOCAL_LEADERBOARD_KEY)) || [];
  leaderboard.push(entry);
  leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(leaderboard));
}

function updateLocalLeaderboardDisplay() {
  let leaderboard = JSON.parse(localStorage.getItem(LOCAL_LEADERBOARD_KEY)) || [];
  localLeaderboardEl.innerHTML = "";
  leaderboard.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.name}: ${entry.score}`;
    localLeaderboardEl.appendChild(li);
  });
}

async function fetchGlobalLeaderboard() {
  if (!GLOBAL_API_ENDPOINT) {
    globalLeaderboardEl.innerHTML = "<li>Global leaderboard not available.</li>";
    return;
  }
  try {
    const res = await fetch(GLOBAL_API_ENDPOINT);
    const leaderboard = await res.json();
    globalLeaderboardEl.innerHTML = "";
    leaderboard.forEach(entry => {
      const li = document.createElement("li");
      li.textContent = `${entry.name}: ${entry.score}`;
      globalLeaderboardEl.appendChild(li);
    });
  } catch (err) {
    globalLeaderboardEl.innerHTML = "<li>Error fetching global leaderboard.</li>";
  }
}

async function submitGlobalScore(name, scoreValue) {
  if (!GLOBAL_API_ENDPOINT) return;
  const entry = { name: name, score: scoreValue };
  try {
    await fetch(GLOBAL_API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry)
    });
    fetchGlobalLeaderboard();
  } catch (err) {
    console.error("Error submitting global score:", err);
  }
}

function submitScore() {
  const name = playerNameInput.value.trim();
  if (name === "") {
    alert("Please enter your name.");
    return;
  }
  saveLocalScore(name, score);
  updateLocalLeaderboardDisplay();
  submitGlobalScore(name, score);
  scoreForm.style.display = "none";
}

/***********************
 *   MUSIC CONTROLS    *
 ***********************/
toggleMusicBtn.addEventListener("click", () => {
  if (bgMusic.paused) {
    bgMusic.play();
    toggleMusicBtn.textContent = "Pause Music";
  } else {
    bgMusic.pause();
    toggleMusicBtn.textContent = "Play Music";
  }
});

/***********************
 *   EVENT LISTENERS   *
 ***********************/
restartBtn.addEventListener("click", initGame);
submitScoreBtn.addEventListener("click", submitScore);

/***********************
 *   INITIALIZATION    *
 ***********************/
updateLocalLeaderboardDisplay();
fetchGlobalLeaderboard();
initGame();

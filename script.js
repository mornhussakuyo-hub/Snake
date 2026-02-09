const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const restartBtn = document.getElementById("restart");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const moveInterval = 120;
let loopId = null;
let paused = false;
let gameOver = true;
let pendingDirection = null;

let snake = [];
let direction = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let bestScore = Number(localStorage.getItem("snakeBest") || 0);

bestEl.textContent = bestScore;

const getRandomPosition = () => {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (snake.some((segment) => segment.x === position.x && segment.y === position.y));
  return position;
};

const resetGame = () => {
  snake = [
    { x: Math.floor(tileCount / 2) + 1, y: Math.floor(tileCount / 2) },
    { x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) },
    { x: Math.floor(tileCount / 2) - 1, y: Math.floor(tileCount / 2) },
  ];
  direction = { x: 1, y: 0 };
  pendingDirection = null;
  score = 0;
  scoreEl.textContent = score;
  food = getRandomPosition();
  paused = false;
  gameOver = false;
  overlay.classList.add("hidden");
  updateLoop();
  draw();
};

const updateLoop = () => {
  if (loopId) {
    clearInterval(loopId);
  }
  loopId = setInterval(() => {
    if (paused || gameOver) {
      return;
    }
    step();
  }, moveInterval);
};

const step = () => {
  if (pendingDirection) {
    direction = pendingDirection;
    pendingDirection = null;
  }

  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    endGame("撞到墙壁了！");
    return;
  }

  if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
    endGame("撞到自己了！");
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    food = getRandomPosition();
  } else {
    snake.pop();
  }

  draw();
};

const drawGrid = () => {
  ctx.strokeStyle = "rgba(148, 163, 184, 0.12)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= tileCount; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * gridSize);
    ctx.lineTo(canvas.width, i * gridSize);
    ctx.stroke();
  }
};

const drawSnake = () => {
  snake.forEach((segment, index) => {
    const isHead = index === 0;
    ctx.fillStyle = isHead ? "#38bdf8" : "#22d3ee";
    ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
  });
};

const drawFood = () => {
  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  ctx.arc(
    food.x * gridSize + gridSize / 2,
    food.y * gridSize + gridSize / 2,
    gridSize / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
};

const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawFood();
  drawSnake();
};

const endGame = (reason) => {
  gameOver = true;
  overlayTitle.textContent = "游戏结束";
  overlayText.textContent = `${reason} 按重新开始或方向键再来一局。`;
  overlay.classList.remove("hidden");
  if (score > bestScore) {
    bestScore = score;
    bestEl.textContent = bestScore;
    localStorage.setItem("snakeBest", bestScore);
  }
};

const togglePause = () => {
  if (gameOver) {
    return;
  }
  paused = !paused;
  if (paused) {
    overlayTitle.textContent = "已暂停";
    overlayText.textContent = "按空格键继续游戏。";
    overlay.classList.remove("hidden");
  } else {
    overlay.classList.add("hidden");
  }
};

const handleDirection = (nextDirection) => {
  if (gameOver) {
    resetGame();
  }

  const opposite = direction.x + nextDirection.x === 0 && direction.y + nextDirection.y === 0;
  if (opposite) {
    return;
  }
  pendingDirection = nextDirection;
};

window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
    case "w":
    case "W":
      handleDirection({ x: 0, y: -1 });
      break;
    case "ArrowDown":
    case "s":
    case "S":
      handleDirection({ x: 0, y: 1 });
      break;
    case "ArrowLeft":
    case "a":
    case "A":
      handleDirection({ x: -1, y: 0 });
      break;
    case "ArrowRight":
    case "d":
    case "D":
      handleDirection({ x: 1, y: 0 });
      break;
    case " ":
      togglePause();
      break;
    default:
      break;
  }
});

restartBtn.addEventListener("click", () => {
  resetGame();
});

overlay.addEventListener("click", () => {
  if (gameOver) {
    resetGame();
  } else if (paused) {
    togglePause();
  }
});

const init = () => {
  overlayTitle.textContent = "按任意方向键开始";
  overlayText.textContent = "吃到食物加分，撞到墙壁或自己则游戏结束。";
  overlay.classList.remove("hidden");
  draw();
};

init();

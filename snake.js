// 贪吃蛇游戏 JavaScript 代码
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

// 游戏配置
const gridSize = 20;
const gridWidth = canvas.width / gridSize;
const gridHeight = canvas.height / gridSize;

// 游戏状态
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let gameSpeed = 333; // 毫秒
let gameRunning = false;
let gameLoop;

// 初始化游戏
function initGame() {
    // 初始化蛇的位置（从中间开始）
    snake = [
        {x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2)},
        {x: Math.floor(gridWidth / 2) - 1, y: Math.floor(gridHeight / 2)},
        {x: Math.floor(gridWidth / 2) - 2, y: Math.floor(gridHeight / 2)}
    ];
    
    // 生成食物
    generateFood();
    
    // 重置游戏状态
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    gameSpeed = 150;
    scoreElement.textContent = score;
}

// 生成食物
function generateFood() {
    food = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight)
    };
    
    // 确保食物不会生成在蛇身上
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            return generateFood();
        }
    }
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        if (index === 0) {
            // 蛇头用不同颜色
            ctx.fillStyle = '#4CAF50';
        } else {
            // 蛇身用稍暗的颜色
            ctx.fillStyle = '#8BC34A';
        }
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        
        // 添加边框
        ctx.strokeStyle = '#666';
        ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
    
    // 绘制食物
    ctx.fillStyle = '#FF5252';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    ctx.strokeStyle = '#666';
    ctx.strokeRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

// 更新游戏状态
function update() {
    // 更新方向
    direction = nextDirection;
    
    // 计算新头部位置
    const head = {...snake[0]};
    
    switch (direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // 检查碰撞边界
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        gameOver();
        return;
    }
    
    // 检查碰撞自身
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            gameOver();
            return;
        }
    }
    
    // 添加新头部
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += 10;
        scoreElement.textContent = score;
        
        // 加快速度（但不能太快）
        if (gameSpeed > 50) {
            gameSpeed -= 2;
        }
        
        // 生成新食物
        generateFood();
    } else {
        // 移除尾部
        snake.pop();
    }
    
    // 重新绘制
    draw();
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    alert(`游戏结束！你的得分是：${score}`);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// 开始游戏
function startGame() {
    if (gameRunning) return;
    
    initGame();
    draw();
    gameRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    gameLoop = setInterval(update, gameSpeed);
}

// 暂停/继续游戏
function togglePause() {
    if (!gameRunning) return;
    
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
        pauseBtn.textContent = '继续';
    } else {
        gameLoop = setInterval(update, gameSpeed);
        pauseBtn.textContent = '暂停';
    }
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    switch (e.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
});

// 按钮事件
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);

// 初始化按钮状态
pauseBtn.disabled = true;
// Canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Canvas dimensions
canvas.width = 800;
canvas.height = 400;

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;
const gameSpeed = 5;

// Player paddle
const playerPaddle = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

// Computer paddle
const computerPaddle = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4.5
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: gameSpeed,
    dy: gameSpeed,
    size: ballSize,
    maxSpeed: 8
};

// Score
let playerScore = 0;
let computerScore = 0;

// Game state
let gameRunning = false;
let gamePaused = false;
let keys = {};

// Input handling
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse tracking for paddle control
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    // Move paddle towards mouse position
    const paddleCenter = playerPaddle.y + playerPaddle.height / 2;
    if (Math.abs(mouseY - paddleCenter) > 5) {
        if (mouseY < paddleCenter) {
            playerPaddle.dy = -playerPaddle.speed;
        } else {
            playerPaddle.dy = playerPaddle.speed;
        }
    } else {
        playerPaddle.dy = 0;
    }
});

// Button controls
document.getElementById('startBtn').addEventListener('click', () => {
    if (!gameRunning) {
        startGame();
    }
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    if (gameRunning) {
        gamePaused = !gamePaused;
        document.getElementById('pauseBtn').textContent = gamePaused ? 'Resume' : 'Pause';
    }
});

// Start game
function startGame() {
    gameRunning = true;
    gamePaused = false;
    playerScore = 0;
    computerScore = 0;
    resetBall();
    updateScoreboard();
    document.getElementById('pauseBtn').textContent = 'Pause';
    gameLoop();
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = gameSpeed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = gameSpeed * (Math.random() * 2 - 1);
}

// Update scoreboard display
function updateScoreboard() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Move player paddle with arrow keys
function movePlayerPaddle() {
    if (keys['ArrowUp']) {
        playerPaddle.dy = -playerPaddle.speed;
    } else if (keys['ArrowDown']) {
        playerPaddle.dy = playerPaddle.speed;
    } else {
        playerPaddle.dy = 0;
    }
}

// Update player paddle position
function updatePlayerPaddle() {
    movePlayerPaddle();
    playerPaddle.y += playerPaddle.dy;
    
    // Wall collision for player paddle
    if (playerPaddle.y < 0) {
        playerPaddle.y = 0;
    }
    if (playerPaddle.y + playerPaddle.height > canvas.height) {
        playerPaddle.y = canvas.height - playerPaddle.height;
    }
}

// Update computer paddle (AI)
function updateComputerPaddle() {
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    const ballCenterY = ball.y;
    
    // AI logic: follow the ball with some offset
    if (ballCenterY < computerCenter - 35) {
        computerPaddle.dy = -computerPaddle.speed;
    } else if (ballCenterY > computerCenter + 35) {
        computerPaddle.dy = computerPaddle.speed;
    } else {
        computerPaddle.dy = computerPaddle.speed * 0.3;
    }
    
    computerPaddle.y += computerPaddle.dy;
    
    // Wall collision for computer paddle
    if (computerPaddle.y < 0) {
        computerPaddle.y = 0;
    }
    if (computerPaddle.y + computerPaddle.height > canvas.height) {
        computerPaddle.y = canvas.height - computerPaddle.height;
    }
}

// Ball collision detection with paddles
function checkPaddleCollision(paddle) {
    if (ball.x - ball.size < paddle.x + paddle.width &&
        ball.x + ball.size > paddle.x &&
        ball.y - ball.size < paddle.y + paddle.height &&
        ball.y + ball.size > paddle.y) {
        
        // Reverse horizontal direction
        ball.dx = -ball.dx * 1.05; // Slight speed increase
        
        // Add spin based on where ball hits paddle
        const collidePoint = ball.y - (paddle.y + paddle.height / 2);
        collidePoint > 0 ? ball.dy += 2 : ball.dy -= 2;
        
        // Clamp ball speed
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        if (speed > ball.maxSpeed) {
            ball.dx = (ball.dx / speed) * ball.maxSpeed;
            ball.dy = (ball.dy / speed) * ball.maxSpeed;
        }
        
        // Move ball away from paddle to avoid multiple collisions
        ball.dx > 0 ? ball.x = paddle.x + paddle.width + ball.size :
                      ball.x = paddle.x - ball.size;
    }
}

// Ball collision detection with walls
function checkWallCollision() {
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        
        if (ball.y - ball.size < 0) {
            ball.y = ball.size;
        } else {
            ball.y = canvas.height - ball.size;
        }
    }
}

// Check if ball is out of bounds (score update)
function checkScore() {
    if (ball.x - ball.size < 0) {
        computerScore++;
        updateScoreboard();
        resetBall();
    } else if (ball.x + ball.size > canvas.width) {
        playerScore++;
        updateScoreboard();
        resetBall();
    }
}

// Update game state
function update() {
    if (!gameRunning || gamePaused) return;
    
    // Update paddles
    updatePlayerPaddle();
    updateComputerPaddle();
    
    // Update ball
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Collision detection
    checkWallCollision();
    checkPaddleCollision(playerPaddle);
    checkPaddleCollision(computerPaddle);
    checkScore();
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = 'rgba(0, 255, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;
}

function drawBall() {
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'rgba(255, 255, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGameStatus() {
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Click "Start Game" to begin', canvas.width / 2, canvas.height / 2);
    }
    
    if (gamePaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Click "Resume" to continue', canvas.width / 2, canvas.height / 2 + 40);
    }
}

// Draw game
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw elements
    drawCenterLine();
    drawPaddle(playerPaddle);
    drawPaddle(computerPaddle);
    drawBall();
    drawGameStatus();
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize
draw();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const scoreElement = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreElement = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

// Game State
let gameState = 'START'; // START, PLAYING, GAMEOVER
let frames = 0;
let score = 0;
let highScore = localStorage.getItem('flappyHighScore') || 0;
let gameSpeed = 3; // Speed of pipes moving left

// Resize handling
function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', resize);
resize();

// Assets (Using basic shapes for now to ensure standalone function, could be replaced by images)
const birdColor = '#FFEB3B';
const pipeColor = '#4CAF50';

class Bird {
    constructor() {
        this.x = 50;
        this.y = 150;
        this.velocity = 0;
        this.gravity = 0.25;
        this.jumpStrength = -4.5;
        this.radius = 15;
    }

    draw() {
        ctx.fillStyle = birdColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        // Eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x + 8, this.y - 6, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + 10, this.y - 6, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Wing
        ctx.fillStyle = '#FBC02D';
        ctx.beginPath();
        ctx.ellipse(this.x - 5, this.y + 5, 8, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        // Floor collision
        if (this.y + this.radius >= canvas.height) {
            endGame();
        }
        
        // Ceiling collision (optional, but good for gameplay)
        if (this.y - this.radius <= 0) {
            this.y = this.radius;
            this.velocity = 0;
        }
    }

    flap() {
        this.velocity = this.jumpStrength;
    }
}

const pipes = [];
const pipeWidth = 50;
const pipeGap = 150; // Vertical gap between pipes
const pipeFrequency = 120; // Frames between new pipes

class Pipe {
    constructor() {
        this.x = canvas.width;
        // Randomize the gap position
        // Minimum pipe height is 50px
        const minPipeHeight = 50;
        const maxPos = canvas.height - minPipeHeight - pipeGap;
        const minPos = minPipeHeight;
        this.topHeight = Math.floor(Math.random() * (maxPos - minPos + 1)) + minPos;
        this.bottomY = this.topHeight + pipeGap;
        this.passed = false;
    }

    draw() {
        ctx.fillStyle = pipeColor;
        ctx.strokeStyle = '#2E7D32'; // Darker green border
        ctx.lineWidth = 2;

        // Top Pipe
        ctx.fillRect(this.x, 0, pipeWidth, this.topHeight);
        ctx.strokeRect(this.x, 0, pipeWidth, this.topHeight);
        
        // Pipe Cap (Top)
        ctx.fillRect(this.x - 2, this.topHeight - 20, pipeWidth + 4, 20);
        ctx.strokeRect(this.x - 2, this.topHeight - 20, pipeWidth + 4, 20);

        // Bottom Pipe
        ctx.fillRect(this.x, this.bottomY, pipeWidth, canvas.height - this.bottomY);
        ctx.strokeRect(this.x, this.bottomY, pipeWidth, canvas.height - this.bottomY);

         // Pipe Cap (Bottom)
         ctx.fillRect(this.x - 2, this.bottomY, pipeWidth + 4, 20);
         ctx.strokeRect(this.x - 2, this.bottomY, pipeWidth + 4, 20);
    }

    update() {
        this.x -= gameSpeed;

        // Collision Logic
        // X Check
        if (bird.x + bird.radius > this.x && bird.x - bird.radius < this.x + pipeWidth) {
            // Y Check (hitting top pipe OR hitting bottom pipe)
            if (bird.y - bird.radius < this.topHeight || bird.y + bird.radius > this.bottomY) {
                endGame();
            }
        }

        // Score
        if (!this.passed && bird.x > this.x + pipeWidth) {
            score++;
            scoreElement.innerText = score;
            this.passed = true;
            // Slightly increase speed
             if (score % 5 === 0) gameSpeed += 0.2;
        }
    }
}

// Background clouds for parallax
const clouds = [];
class Cloud {
    constructor() {
        this.x = canvas.width + Math.random() * 200;
        this.y = Math.random() * (canvas.height / 2);
        this.speed = Math.random() * 0.5 + 0.5;
        this.size = Math.random() * 0.5 + 0.5;
    }
    draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 30 * this.size, 0, Math.PI * 2);
        ctx.arc(this.x + 25 * this.size, this.y - 10 * this.size, 35 * this.size, 0, Math.PI * 2);
        ctx.arc(this.x + 50 * this.size, this.y, 30 * this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    update() {
        this.x -= this.speed;
    }
}


let bird = new Bird();

function initGame() {
    bird = new Bird();
    pipes.length = 0;
    clouds.length = 0;
    score = 0;
    frames = 0;
    gameSpeed = 3;
    scoreElement.innerText = 0;
    gameState = 'START';
    
    startScreen.classList.remove('hidden');
    startScreen.classList.add('active');
    gameOverScreen.classList.remove('active');
    gameOverScreen.classList.add('hidden');
    
    // reset bird pos for visuals
    bird.y = canvas.height / 2;
    bird.velocity = 0;
}

function startGame() {
    if (gameState === 'PLAYING') return;
    gameState = 'PLAYING';
    startScreen.classList.remove('active');
    startScreen.classList.add('hidden');
    bird.flap();
}

function endGame() {
    gameState = 'GAMEOVER';
    finalScoreElement.innerText = score;
    gameOverScreen.classList.remove('hidden');
    gameOverScreen.classList.add('active');
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    // Background update
    if (frames % 100 === 0) {
        clouds.push(new Cloud());
    }
    for (let i = clouds.length - 1; i >= 0; i--) {
        clouds[i].draw();
        clouds[i].update();
        if (clouds[i].x < -100) clouds.splice(i, 1);
    }


    if (gameState === 'PLAYING') {
        bird.update();
        
        // Pipe Spawning
        if (frames % pipeFrequency === 0) {
            pipes.push(new Pipe());
        }

        // Pipe Management
        for (let i = pipes.length - 1; i >= 0; i--) {
            pipes[i].draw();
            pipes[i].update();
            
            // Remove off-screen pipes
            if (pipes[i].x + pipeWidth < 0) {
                pipes.splice(i, 1);
            }
        }

        frames++;
    } else if (gameState === 'START') {
        // Bobbing animation for bird at start
        bird.y = (canvas.height / 2) + Math.sin(Date.now() / 300) * 10;
    }

    bird.draw();
    requestAnimationFrame(animate);
}

// Input Handling
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (gameState === 'START') startGame();
        else if (gameState === 'PLAYING') bird.flap();
        else if (gameState === 'GAMEOVER') initGame();
    }
});

window.addEventListener('mousedown', () => {
    if (gameState === 'START') startGame();
    else if (gameState === 'PLAYING') bird.flap();
});

window.addEventListener('touchstart', (e) => {
    e.preventDefault(); // prevent zoom/scroll
    if (gameState === 'START') startGame();
    else if (gameState === 'PLAYING') bird.flap();
}, { passive: false });

restartBtn.addEventListener('click', () => {
    initGame();
});

// Start
initGame();
animate();

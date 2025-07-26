const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const startButton = document.getElementById('startButton');
const scoreDisplay = document.getElementById('scoreDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const musicOn = document.getElementById('musicOn');
const musicOff = document.getElementById('musicOff');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Görseller
const backgroundImage = new Image();
backgroundImage.src = 'assets/fon.png';
const feedImage = new Image();
feedImage.src = 'assets/feed.png';
const snakeHeadImage = new Image();
snakeHeadImage.src = 'assets/snake.png';

// Sesler
const backgroundMusic = new Audio('assets/fon.mp3');
backgroundMusic.loop = true; // Sürekli çalsın
const feedSound = new Audio('assets/feed.mp3');
let isMusicOn = true; // Varsayılan: müzik açık

let snake = [
    {x: 390, y: 300},
    {x: 360, y: 300},
    {x: 330, y: 300},
    {x: 300, y: 300},
    {x: 270, y: 300}
];
let bait = generateBait();
let direction = 'right';
let gameStarted = false;
let gameInterval;
let score = 0;
let scoreEffects = [];
let timer = 0;
let timerInterval;

function generateBait() {
    let newBait;
    do {
        newBait = {x: Math.floor(Math.random() * 27) * 30, y: Math.floor(Math.random() * 20) * 30};
    } while (snake.some(s => s.x === newBait.x && s.y === newBait.y));
    return newBait;
}

function formatTime(seconds) {
    let hrs = Math.floor(seconds / 3600);
    let mins = Math.floor((seconds % 3600) / 60);
    let secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    // Yılan
    for (let i = 0; i < snake.length; i++) {
        if (i === 0 && snakeHeadImage.complete) {
            ctx.drawImage(snakeHeadImage, snake[i].x, snake[i].y, 30, 30);
        } else {
            ctx.fillStyle = 'green';
            ctx.fillRect(snake[i].x, snake[i].y, 30, 30);
        }
    }

    // Yem
    if (feedImage.complete) {
        ctx.drawImage(feedImage, bait.x, bait.y, 30, 30);
    } else {
        ctx.fillStyle = 'red';
        ctx.fillRect(bait.x, bait.y, 30, 30);
    }

    // +10 efektleri
    ctx.font = '20px Press Start 2P';
    ctx.fillStyle = '#0f0';
    ctx.textAlign = 'center';
    scoreEffects = scoreEffects.filter(effect => Date.now() - effect.time < 1000);
    scoreEffects.forEach(effect => {
        ctx.fillText('+10', effect.x + 15, effect.y);
    });
}

function update() {
    for (let i = snake.length - 1; i > 0; i--) {
        snake[i] = {x: snake[i - 1].x, y: snake[i - 1].y};
    }
    if (direction === 'right') {
        snake[0].x += 30;
    } else if (direction === 'left') {
        snake[0].x -= 30;
    } else if (direction === 'up') {
        snake[0].y -= 30;
    } else if (direction === 'down') {
        snake[0].y += 30;
    }

    if (snake[0].x === bait.x && snake[0].y === bait.y) {
        scoreEffects.push({x: bait.x, y: bait.y, time: Date.now()});
        if (isMusicOn) feedSound.play(); // Yem sesi
        bait = generateBait();
        snake.push({x: snake[snake.length - 1].x, y: snake[snake.length - 1].y});
        score += 10;
        scoreDisplay.textContent = `Score: ${score}`;
    }

    if (snake[0].x < 0 || snake[0].x >= canvas.width || snake[0].y < 0 || snake[0].y >= canvas.height || checkCollision()) {
        alert(`Game Over! Score: ${score}`);
        snake = [
            {x: 390, y: 300},
            {x: 360, y: 300},
            {x: 330, y: 300},
            {x: 300, y: 300},
            {x: 270, y: 300}
        ];
        bait = generateBait();
        direction = 'right';
        score = 0;
        scoreDisplay.textContent = `Score: ${score}`;
        timer = 0;
        timerDisplay.textContent = formatTime(timer);
        clearInterval(timerInterval);
        if (isMusicOn) backgroundMusic.pause(); // Müzik durdur
        backgroundMusic.currentTime = 0; // Sıfırla
        gameStarted = false;
        clearInterval(gameInterval);
        startButton.style.display = 'block';
        musicOn.style.display = 'block';
        musicOff.style.display = 'none';
    }
}

function checkCollision() {
    for (let i = 1; i < snake.length; i++) {
        if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
            return true;
        }
    }
    return false;
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && startScreen.style.display !== 'none') {
        startScreen.style.display = 'none';
        gameScreen.style.display = 'flex';
    } else if (gameStarted) {
        if (e.key === 'ArrowRight' && direction !== 'left') {
            direction = 'right';
        } else if (e.key === 'ArrowLeft' && direction !== 'right') {
            direction = 'left';
        } else if (e.key === 'ArrowUp' && direction !== 'down') {
            direction = 'up';
        } else if (e.key === 'ArrowDown' && direction !== 'up') {
            direction = 'down';
        }
    }
});

startButton.addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        startButton.style.display = 'none';
        timer = 0;
        timerDisplay.textContent = formatTime(timer);
        timerInterval = setInterval(() => {
            timer++;
            timerDisplay.textContent = formatTime(timer);
        }, 1000);
        if (isMusicOn) backgroundMusic.play(); // Müzik başlat
        gameInterval = setInterval(() => {
            update();
            draw();
        }, 100);
    }
});

musicOn.addEventListener('click', () => {
    isMusicOn = false;
    backgroundMusic.pause();
    musicOn.style.display = 'none';
    musicOff.style.display = 'block';
});

musicOff.addEventListener('click', () => {
    isMusicOn = true;
    if (gameStarted) backgroundMusic.play();
    musicOn.style.display = 'block';
    musicOff.style.display = 'none';
});
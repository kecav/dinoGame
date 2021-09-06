const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// retrieve data from local storage
const retrieveHighScore = () => {
    const retrievedScore = localStorage.getItem("highScore");
    return localStorage.getItem("highScore") ?
        JSON.parse(retrievedScore).score :
        0;
};

// game varibales
const ctxBg = "#000";
const width = canvas.width;
const height = canvas.height;
let isNewGame = true;
let countScoreInterval;
let pulsatingText;
let jumpAnimation;
let gameAnimation;
let isJumping;
let dy;

// road
const roadY = (height * 3) / 4;
const roadColor = "#fff";

//dino
const dinoImg = document.getElementById("dinoImg");
const dinoWidth = 50;
const dinoHeight = 50;
const dinoX = 50;
let dinoColor = "#00f";
let dinoY = roadY - dinoHeight;

// obstacles
const obsImg1 = new Image();
const obsImg2 = new Image();
obsImg1.src = "./Assets/obstacle1.png";
obsImg2.src = "./Assets/obstacle3.png";
const obsWidth = 30;
const obsHeight = 50;
const obsColor = "#f00";
let obsX = width;
let obsY = roadY - obsHeight;
let obsDx;

// score
let score = 0;
let dScore = 1;
let highScore = retrieveHighScore();
let isGameOver = false;
const liveScoreX = 20;
const liveScoreY = 30;
const highScoreX = width - 20;
const highScoreY = 30;

// Calculates score and obstacle speed
const counter = () => {
    countScoreInterval = setInterval(() => {
        score += dScore;
        dScore += 0.002 * dScore;
        obsDx += 0.002 * obsDx;
        if (score >= highScore) {
            highScore = score;
        }
    }, 100);
};

// Pulsating Effect
const beginPulse = () => {
    let pulseColor = "#fff";

    // renders Score Text
    if (!isNewGame) {
        ctx.fillStyle = pulseColor;
        ctx.font = "16px Monospace";
        ctx.textAlign = "center";
        ctx.fillText(`SCORE : ${Math.floor(score)}`, width / 2, height / 4);
        ctx.fillText(
            `HIGHSCORE : ${Math.floor(highScore)}`,
            width / 2,
            height / 4 + 20
        );
    }

    pulsatingText = setInterval(() => {
        // Cover
        ctx.fillStyle = ctxBg;
        ctx.fillRect(width / 5, height / 3, (width * 3) / 5, 35);

        // changes pulse color
        pulseColor = pulseColor === "#fff" ? "#000" : "#fff";

        // renders text
        const text = isNewGame ? "START" : "RESTART";
        ctx.fillStyle = pulseColor;
        ctx.font = "italic 20px Monospace";
        ctx.textAlign = "center";
        ctx.fillText(`PRESS SPACEBAR TO ${text}`, width / 2, height / 3 + 25);
    }, 250);
};

// Algorithm to make dino jump
const jump = () => {
    dinoY -= dy;
    dy -= 1;
    if (dinoY >= roadY - dinoHeight) {
        cancelAnimationFrame(jumpAnimation);
        isJumping = false;
        dy = 15;
        return;
    }
    jumpAnimation = requestAnimationFrame(jump);
};

// Obstacle velocity
const obsVelo = () => {
    obsX -= obsDx;
    if (obsX + obsWidth <= 0) {
        obsX = width;
    }
};

// detect collision
const checkCollision = () => {
    // 
    if (dinoX < obsX + obsWidth &&
        dinoX + dinoWidth > obsX &&
        dinoY < obsY + obsHeight &&
        dinoY + dinoHeight > obsY) {
        return true;
    }
    return false;
};

// paints the game on canvas
const renderCanvas = () => {
    // console.log("RENDER CANVAS");
    ctx.clearRect(0, 0, width, height);

    // canvas background
    ctx.fillStyle = ctxBg;
    ctx.fillRect(0, 0, width, height);

    // road
    ctx.beginPath();
    ctx.moveTo(0, roadY);
    ctx.lineTo(width, roadY);
    ctx.strokeStyle = roadColor;
    ctx.stroke();

    // dino Character
    ctx.fillStyle = dinoColor;
    ctx.drawImage(dinoImg, dinoX, dinoY, dinoWidth, dinoHeight);
    // ctx.fillRect(dinoX, dinoY, dinoWidth, dinoHeight);

    // score
    ctx.fillStyle = "#fff";
    ctx.font = "14px Monospace";
    ctx.textAlign = "left";
    ctx.fillText(`SCORE : ${Math.floor(score)}`, liveScoreX, liveScoreY);
    ctx.font = "14px Monospace";
    ctx.textAlign = "right";
    ctx.fillText(`HIGHSCORE: ${Math.floor(highScore)}`, highScoreX, highScoreY);

    // obstacles
    ctx.fillStyle = obsColor;
    ctx.drawImage(obsImg1, obsX, obsY, obsWidth, obsHeight);
    // ctx.drawImage(obsImg2, obsX + 100, obsY, obsWidth * 2, obsHeight);
    // ctx.fillRect(obsX, obsY, obsWidth, obsHeight);
};

// Save to localStorage
const saveToStorage = () => {
    if (score < highScore) {
        return;
    }
    // Getting preferred date format
    let dateEl = new Date();
    const time = dateEl.toLocaleString("en-IN", { timeZone: "Asia/Calcutta" });
    // console.log(dateStr);
    score = Math.floor(score);

    // Making Local Storage
    const highScoreObj = { time, score };
    localStorage.setItem("highScore", JSON.stringify(highScoreObj));
    console.log("Saved");
};

// Listening to jump buttons
window.addEventListener("keydown", (e) => {
    if (isJumping) {
        return;
    }
    if ((isGameOver || isNewGame) && e.code === "Space") {
        isNewGame = false;
        isGameOver = false;
        init();
        return;
    }
    isJumping = true;
    jump();
});

const resetValues = () => {
    // initial values
    dy = 15;
    isJumping = false;
    dinoY = roadY - dinoHeight;
    obsX = width;
    obsDx = 5;
    score = 0;
    dScore = 1;
    clearInterval(pulsatingText);
};

const firstScreen = () => {
    renderCanvas();
    beginPulse();
};

// Initialize game
const init = () => {
    resetValues();
    renderGame();
    counter();
};

// Renders game
const renderGame = () => {
    renderCanvas();
    obsVelo();
    if (checkCollision()) {
        cancelAnimationFrame(gameAnimation);
        terminate();
        return;
    }
    gameAnimation = requestAnimationFrame(renderGame);
};

const terminate = () => {
    clearInterval(countScoreInterval);
    saveToStorage();
    retrieveHighScore();
    beginPulse();
    isJumping = false;
    isGameOver = true;
};

// Paint Game board Initially
firstScreen();
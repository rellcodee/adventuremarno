import Player from './classes/Player.js';
import InputHandler from './classes/InputHandler.js';
import Coin from './classes/Coin.js';
import { levels } from './level.js';
// main.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d'); // This is our drawing tool
let currentCoins = [];

let currentLevel = 1;
const background = new Image();

// Set the resolution (Standard HD ratio)
const levelWidth = 3000;
const canvasWidth = 1280;
canvas.width = canvasWidth;
canvas.height = 720;
const player = new Player(canvas.width, canvas.height, levelWidth);
const input = new InputHandler();

let lastTime = 0;

const camera = {
    x: 0,
    width: canvasWidth,
    // This keeps the player centered
    update: function (playerX) {
        let targetX = playerX - this.width / 2;
        // Don't show past the left edge
        if (targetX < 0) targetX = 0;
        // Clamp the camera so it doesn't show past the start of the level
        // Don't show past the right edge (levelWidth - screenWidth)
        if (targetX > levelWidth - this.width) {
            targetX = levelWidth - this.width;
        }

        this.x = targetX;
    }
};

// Function to load level assets [cite: 313, 539]
function loadLevel(levelNumber) {
    const config = levels[levelNumber];
    background.src = config.background; // This replaces "bgNight"

    if (config.coins) {
        currentCoins = config.coins.map(c => new Coin(c.x, c.y));
    }
}

loadLevel(currentLevel);

function animate(timestamp) {
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Update logic
    player.update(input.keys, dt);
    camera.update(player.x); // Tell camera where player is

    ctx.save();
    ctx.translate(-camera.x, 0);

    // 2. Draw Background (DO NOT TRANSLATE THIS)
    // This makes the background stay still while you walk
    for (let i = 0; i < levelWidth / canvas.width; i++) {
        ctx.drawImage(background, i * canvas.width, 0, canvas.width, canvas.height);
    }

    currentCoins = currentCoins.filter(coin => !coin.markedForDeletion);
    currentCoins.forEach(coin => {
        coin.update(player);
        coin.draw(ctx);
    });

    player.draw(ctx);
    ctx.restore();
    // Draw
    drawUI(ctx, player);

    requestAnimationFrame(animate);
    checkLevelComplete();
}
animate(0);

function drawUI(ctx, player) {
    const startX = 20;
    const startY = 20;
    const barWidth = 200;
    const barHeight = 30;

    ctx.font = '20px Arial';
    ctx.textBaseline = 'top';

    // 1. CONTAINER DESIGN (Background box for all bars)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Transparent black
    ctx.fillRect(startX - 10, startY - 10, 250, 130);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX - 10, startY - 10, 250, 130);

    // 2. HEALTH BAR (Red)
    ctx.fillStyle = '#333';
    ctx.fillRect(startX, startY, barWidth, barHeight);
    ctx.fillStyle = '#ff4d4d';
    ctx.fillRect(startX, startY, (player.health / 3) * barWidth, barHeight);
    ctx.fillStyle = 'white';
    ctx.fillText(`HP: ${player.health}/3`, startX + 5, startY + 5);

    // 3. COIN COUNT (Gold)
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`🪙 Coins: ${player.coins}`, startX, startY + 45);

    // 4. POINT BAR (Blue/White)
    ctx.fillStyle = '#00d4ff';
    ctx.fillText(`✨ Score: ${Math.floor(player.score)}`, startX, startY + 80);
}

function checkLevelComplete() {
    // If player reaches the end of the 3000px forest
    if (player.x > levelWidth - 60) {
        currentLevel++;

        if (currentLevel <= 5) {
            console.log("Loading Level: " + currentLevel);
            loadLevel(currentLevel); // Re-run our loader

            // Transform the player
            player.x = 80;
            player.maxReachedX = 80;
            // Note: We DON'T reset player.score or player.coins
        } else {
            alert("Congratulations! You finished all levels!");
            currentLevel = 1;
            loadLevel(1);
        }
    }
}
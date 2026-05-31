import Player from './classes/Player.js';
import InputHandler from './classes/InputHandler.js';
import Coin from './classes/Coin.js';
import { levels } from './level.js';
import Obstacle from './classes/Obstacle.js';
import Enemy from './classes/Enemy.js';

// main.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d'); // This is our drawing tool
let currentCoins = [];
let currentObstacles = [];
let currentEnemies = [];

let currentLevel = 3;
const background = new Image();

let isTransitioning = false;
let transitionAlpha = 0; // 0 is transparent, 1 is black

let isIntermission = false;
const nextButton = { x: 0, y: 0, w: 200, h: 60 };

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
    if (!config) return;

    background.src = config.background;

    // Reset Player Stats for the new level
    player.coins = 0;
    player.score = 0;
    player.health = 3;

    // Reset Camera immediately
    camera.x = 0;

    // Set background
    background.src = config.background;

    // Reset player position
    player.x = 80;
    player.maxReachedX = 80;

    // Reset Objects
    currentCoins = config.coins.map(c => new Coin(c.x, c.y));

    // Load Obstacles
    currentObstacles = config.obstacles ? config.obstacles.map(o => {
        // Create an HTML Image element for the obstacle background base (pipe/rock)
        let baseImage = new Image();
        baseImage.src = o.src;

        // Create an HTML Image element for the snake head if enabled
        let sImage = null;
        if (o.hasSnake) {
            sImage = new Image();
            sImage.src = '../assets/obstacles/headsnake.png';
        }

        // Return the config configuration structure cleanly
        return new Obstacle({
            x: o.x,
            y: o.y,
            w: o.w,
            h: o.h,
            type: o.type,
            image: baseImage,
            hasSnake: o.hasSnake,
            snakeImage: sImage
        });
    }) : [];

    // Load Enemies
    currentEnemies = config.enemies ? config.enemies.map(e =>
        new Enemy(e.x, e.y, e.w, e.h, e.type, e.speed, e.src)
    ) : [];
}

loadLevel(currentLevel);

function animate(timestamp) {
    if (!isIntermission && !isTransitioning) {
        const dt = (timestamp - lastTime) / 1000 || 0;
        lastTime = timestamp;

        // 1. Reset status
        player.isOnPlatform = false;

        // 2. Check collisions FIRST (to set isOnPlatform)
        currentObstacles.forEach(obs => {
            obs.update(dt);
            obs.checkCollision(player);
        });

        currentEnemies.forEach(enemy => {
            // Pass ALL THREE: dt, player, and currentObstacles
            enemy.update(dt, player, currentObstacles);
            if (!player.isDead) enemy.checkCollision(player);
        });

        if (player.health <= 0) {
            alert("GAME OVER!");
            window.location.reload();
        }

        player.update(input.keys, dt);

        // Only check collisions if the player is alive
        if (!player.isDead) {
            camera.update(player.x);
            checkLevelComplete();
        }

        // Restart level if player falls off screen after death
        if (player.y > canvas.height + 200) {
            alert("Level Failed!");
            loadLevel(currentLevel); // Reset
        }

        camera.update(player.x);
        checkLevelComplete();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- DRAW WORLD ---
    ctx.save();
    ctx.translate(-camera.x, 0);

    // FIX: Redraw background tiles so it moves with the camera
    for (let i = 0; i < levelWidth / canvas.width; i++) {
        ctx.drawImage(background, i * canvas.width, 0, canvas.width, canvas.height);
    }

    currentObstacles.forEach(obs => obs.draw(ctx));
    currentEnemies.forEach(e => e.draw(ctx));

    // UPDATE & DRAW COINS
    currentCoins = currentCoins.filter(coin => !coin.markedForDeletion);
    currentCoins.forEach(coin => {
        coin.update(player); // Add update here so player can pick them up!
        coin.draw(ctx);
    });

    player.draw(ctx);
    ctx.restore();
    // --- END WORLD ---

    drawUI(ctx, player);

    // DRAW OVERLAYS
    if (isIntermission) {
        drawIntermissionScreen(ctx);
    }

    // FIX: Only draw fader if it's actually visible
    if (transitionAlpha > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${transitionAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Show text ONLY when screen is fully black
        if (isIntermission && transitionAlpha >= 0.9) {
            drawIntermissionScreen(ctx);
        }
    }

    requestAnimationFrame(animate);
}
animate(0);

function drawUI(ctx, player) {
    const startX = 20;
    const startY = 20;
    const barWidth = 200;
    const barHeight = 30;

    ctx.font = "18px 'Press Start 2P'";
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

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
    if (player.x > levelWidth - 60 && !isTransitioning) {
        startTransition();
    }
}

function startTransition() {
    isTransitioning = true;

    let fadeInterval = setInterval(() => {
        transitionAlpha += 0.05;
        if (transitionAlpha >= 1) {
            clearInterval(fadeInterval);

            // Check if we just finished Level 5
            if (currentLevel >= 5) {
                currentLevel = 6; // State for "Game Won"
            } else {
                currentLevel++;
                loadLevel(currentLevel);
            }

            nextButton.x = canvas.width / 2 - 125;
            nextButton.y = 450;
            nextButton.w = 250;
            isIntermission = true;
            // 3. We keep alpha at 1.0 until the player clicks "Next"
        }
    }, 30);
}

// Update the Click Listener to trigger the Fade Out
canvas.addEventListener('click', (e) => {
    if (isIntermission) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (mouseX > nextButton.x && mouseX < nextButton.x + nextButton.w &&
            mouseY > nextButton.y && mouseY < nextButton.y + nextButton.h) {

            if (currentLevel > 5) {
                // Option 1: Hard Refresh (Cleanest)
                window.location.reload();
            } else {
                // Option 2: Continue to next level
                isIntermission = false;
                endTransition();
            }
        }
    }
});

function endTransition() {
    let fadeInterval = setInterval(() => {
        transitionAlpha -= 0.05;
        if (transitionAlpha <= 0) {
            transitionAlpha = 0;
            isTransitioning = false;
            clearInterval(fadeInterval);
        }
    }, 30);
}

function drawIntermissionScreen(ctx) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = "center";
    ctx.fillStyle = "white";

    if (currentLevel <= 5) {
        // --- NORMAL INTERMISSION ---
        ctx.font = "30px 'Press Start 2P'";
        ctx.fillText(`STAGE ${currentLevel - 1} CLEAR!`, canvas.width / 2, 250);

        ctx.fillStyle = "#4CAF50";
        ctx.fillRect(nextButton.x, nextButton.y, nextButton.w, nextButton.h);
        ctx.fillStyle = "white";
        ctx.font = "16px 'Press Start 2P'";
        ctx.fillText("NEXT LEVEL", canvas.width / 2, nextButton.y + 40);
    } else {
        // --- GAME COMPLETE POPUP (Level 6) ---
        ctx.font = "40px 'Press Start 2P'";
        ctx.fillStyle = "#ffd700"; // Gold
        ctx.fillText("YOU ARE A HERO!", canvas.width / 2, 200);

        ctx.font = "16px 'Press Start 2P'";
        ctx.fillStyle = "white";
        ctx.fillText("You finished all 5 levels.", canvas.width / 2, 280);
        ctx.fillText(`Total Coins: ${player.coins}`, canvas.width / 2, 330);

        // Restart Button
        ctx.fillStyle = "#007BFF"; // Blue
        ctx.fillRect(nextButton.x, nextButton.y, nextButton.w, nextButton.h);
        ctx.fillStyle = "white";
        ctx.fillText("PLAY AGAIN", canvas.width / 2, nextButton.y + 40);
    }
}
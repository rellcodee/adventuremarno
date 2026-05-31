export default class Obstacle {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.width = config.w || config.width;
        this.height = config.h || config.height;
        this.image = config.image;
        this.type = config.type || 'pipe';

        // --- SNAKE CONFIGURATION ---
        this.hasSnake = (this.type === 'pipe') ? (config.hasSnake || false) : false;

        if (this.hasSnake) {
            this.snakeState = 'hidden';
            this.snakeTimer = 0;
            this.snakeYOffset = 0;
            this.maxSnakeHeight = 55;
            this.snakeImage = config.snakeImage;
        }
    }

    update(dt) {
        if (!this.hasSnake) return;

        this.snakeTimer += dt;
        const slideSpeed = 130;

        switch (this.snakeState) {
            case 'hidden':
                if (this.snakeYOffset > 0) {
                    this.snakeYOffset -= slideSpeed * dt;
                    if (this.snakeYOffset < 0) this.snakeYOffset = 0;
                }
                if (this.snakeTimer > 2.0) {
                    this.snakeState = 'rising';
                    this.snakeTimer = 0;
                }
                break;
            case 'rising':
                if (this.snakeYOffset < this.maxSnakeHeight) {
                    this.snakeYOffset += slideSpeed * dt;
                } else {
                    this.snakeYOffset = this.maxSnakeHeight;
                    this.snakeState = 'active';
                    this.snakeTimer = 0;
                }
                break;
            case 'active':
                this.snakeYOffset = this.maxSnakeHeight;
                if (this.snakeTimer > 1.5) {
                    this.snakeState = 'hiding';
                    this.snakeTimer = 0;
                }
                break;
            case 'hiding':
                if (this.snakeYOffset > 0) {
                    this.snakeYOffset -= slideSpeed * dt;
                } else {
                    this.snakeYOffset = 0;
                    this.snakeState = 'hidden';
                    this.snakeTimer = 0;
                }
                break;
        }
    }

    draw(ctx) {
        // 1. SAFETY: If the main obstacle image (the pipe/rock) hasn't loaded, don't draw anything
        if (!this.image) return;

        // 2. LAYER 1 (BACK): Draw the snake head poking out
        // This only runs when the snake is active, rising, or hiding!
        if (this.hasSnake && this.snakeYOffset > 0 && this.snakeImage) {
            ctx.drawImage(
                this.snakeImage,
                this.x + (this.width - 60) / 2, // Centered horizontally inside the pipe rim
                this.y - this.snakeYOffset,     // Smoothly slides UPWARDS out of the pipe
                60,                             // Width of the snake head asset
                this.snakeYOffset               // Height grows based on the animation timer
            );
        }

        // 3. LAYER 2 (FRONT): Draw the solid pipe or rock base
        // This runs ALL THE TIME, so your pipe never vanishes!
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    checkCollision(player) {
        let pLeft = player.x;
        let pRight = player.x + player.width;
        let pTop = player.y;
        let pBottom = player.y + player.height;

        let oLeft = this.x;
        let oRight = this.x + this.width;
        let oTop = this.y;
        let oBottom = this.y + this.height;

        // Check if bounding boxes overlap at all
        if (pRight > oLeft && pLeft < oRight && pBottom > oTop && pTop < oBottom) {

            // Calculate overlap depths
            let overlapX = Math.min(pRight - oLeft, oRight - pLeft);
            let overlapY = Math.min(pBottom - oTop, oBottom - pTop);

            if (overlapX < overlapY) {
                // COLLISION FROM SIDES (Push player back out horizontally)
                if (pLeft + player.width / 2 < oLeft + this.width / 2) {
                    player.x -= overlapX; // Hit left wall
                } else {
                    player.x += overlapX; // Hit right wall
                }
            } else {
                // COLLISION FROM TOP OR BOTTOM
                if (pBottom - player.vy <= oTop + 15 && player.vy >= 0) {
                    // Landed on top safely
                    player.y = oTop - player.height;
                    player.vy = 0;
                    player.isOnPlatform = true;

                    // Trigger bite damage if snake is active
                    if (this.hasSnake && this.snakeState === 'active') {
                        player.takeDamage();
                    }
                } else if (pTop - player.vy >= oBottom - 15) {
                    // Hit ceiling (bottom of obstacle)
                    player.y = oBottom;
                    player.vy = 0;
                }
            }
        }
    }
}
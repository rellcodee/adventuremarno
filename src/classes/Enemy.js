export default class Enemy {
    constructor(x, y, width, height, type, speed = 100, src) {
        this.x = x;
        this.y = y;
        this.initialY = y; // For Eagle/Snake resets
        this.width = width;
        this.height = height;
        this.type = type;
        this.speed = speed;
        this.direction = -1;
        this.markedForDeletion = false;
        this.timer = 0;

        this.isRight = true;
        this.facing = 'right';
        // Assets Container
        this.assets = {};
        this.loadAssets();

        // The image you passed in level.js
        this.mainImage = new Image();
        this.mainImage.src = src;

        // Behavior States
        this.state = (type === 'snake') ? 'hidden' : 'active';
    }

    loadAssets() {
        if (this.type === 'turtle') {
            this.assets.walkA = new Image();
            this.assets.walkA.src = '../assets/turtle/walkA.png';
            this.assets.walkB = new Image();
            this.assets.walkB.src = '../assets/turtle/walkB.png';
            this.assets.hide = new Image();
            this.assets.hide.src = '../assets/turtle/sleep.png';
            this.currentSprite = this.assets.walkA;
        } else if (this.type === 'snake') {
            this.assets.empty = new Image();
            this.assets.empty.src = '../assets/obstacles/pipesnake.png';
            this.assets.half = new Image();
            this.assets.half.src = '../assets/obstacles/halfsnake.png';
            this.assets.full = new Image();
            this.assets.full.src = '../assets/obstacles/snake.png';
            this.currentSprite = this.assets.empty;
        } else if (this.type === 'eagle') {
            this.assets.flyA = new Image();
            this.assets.flyA.src = '../assets/obstacles/eagle.png';
            this.assets.flyB = new Image();
            this.assets.flyB.src = '../assets/obstacles/eagleB.png';
            this.assets.dive = new Image();
            this.assets.dive.src = '../assets/obstacles/eagledive.png';
            this.currentSprite = this.assets.flyA;
        }
    }

    update(dt, player, obstacles) {
        this.timer += dt;

        if (this.type === 'turtle') this.updateTurtle(dt, obstacles);
        if (this.type === 'snake') this.updateSnake(dt);
        if (this.type === 'eagle') this.updateEagle(dt, player);
    }

    // --- TURTLE BEHAVIOR: PATROL & BOUNCE ---
    updateTurtle(dt, obstacles) {
        if (this.state === 'active') {
            this.x += this.speed * this.direction * dt;

            // Animation
            this.currentSprite = (Math.floor(this.timer * 5) % 2 === 0) ? this.assets.walkA : this.assets.walkB;

            // Bounce off obstacles
            obstacles.forEach(obs => {
                if (this.checkRectCollision(this, obs)) {
                    // THE FLIP: Reverse direction
                    this.direction *= -1;

                    // THE REBOUND: Push out of the obstacle so it doesn't vibrate
                    if (this.direction === 1) {
                        this.x = obs.x + obs.width + 1; // Snap to right side of pipe
                    } else {
                        this.x = obs.x - this.width - 1; // Snap to left side of pipe
                    }
                }
            });


        } else if (this.state === 'hidden') {
            this.currentSprite = this.assets.hide;
            if (this.timer > 5) { // Wake up after 5s
                this.state = 'active';
                this.timer = 0;
            }
        }

    }

    // --- SNAKE BEHAVIOR: TIMED PIPE TRAP ---
    updateSnake(dt) {
        if (this.state === 'hidden' && this.timer > 2) {
            this.state = 'rising';
            this.currentSprite = this.assets.half;
            this.timer = 0;
        } else if (this.state === 'rising' && this.timer > 0.6) {
            this.state = 'active';

            this.currentSprite = this.assets.full;
            this.timer = 0;
        } else if (this.state === 'active' && this.timer > 2) {
            this.state = 'hidden';
            this.currentSprite = this.assets.empty;
            this.timer = 0;
        }
    }

    // --- EAGLE BEHAVIOR: DIVE & DISAPPEAR ---
    updateEagle(dt, player) {
        if (this.state === 'active') {
            // Cruise in the sky
            this.x += (this.speed * 0.5) * this.direction * dt;
            this.currentSprite = (Math.floor(this.timer * 5) % 2 === 0) ? this.assets.flyA : this.assets.flyB;

            // Trigger Dive if player is nearby (300 pixels)
            if (Math.abs(this.x - player.x) < 300) {
                this.state = 'diving';
                this.currentSprite = this.assets.dive;
            }
        } else if (this.state === 'diving') {
            // High speed diagonal dive
            this.x += this.speed * 2.5 * this.direction * dt;
            this.y += this.speed * 2 * dt;

            // Disappear if hits ground (approx 620 pixels down)
            if (this.y > 620) {
                this.markedForDeletion = true;
            }
        }
    }

    checkCollision(player) {
        if (this.markedForDeletion) return;

        const isColliding = this.checkRectCollision(this, player);

        if (isColliding) {
            if (this.type === 'turtle') {
                if (player.vy > 0 && player.y + player.height < this.y + 20) {
                    this.state = 'hidden';
                    this.timer = 0;
                    player.vy = -400; // Bounce player
                } else if (this.state !== 'hidden') {
                    player.takeDamage();
                }
            } else if (this.type === 'snake') {
                // Dangerous only when NOT hidden
                if (this.state !== 'hidden') player.takeDamage();
            } else if (this.type === 'eagle') {
                player.takeDamage();
            }
        }
    }

    checkRectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y;
    }

    draw(ctx) {
        if (!this.currentSprite || !this.currentSprite.complete) return;



        ctx.save();

        if (this.direction === 1) {
            // --- FACE RIGHT ---
            // 1. Move to the right side of where the turtle should be
            ctx.translate(this.x + this.width, this.y);
            // 2. Flip the horizontal axis
            ctx.scale(-1, 1);
            // 3. Draw at 0,0 (because we translated)
            ctx.drawImage(this.currentSprite, 0, 0, this.width, this.height);
        } else {
            // --- FACE LEFT (Default) ---
            ctx.drawImage(this.currentSprite, this.x, this.y, this.width, this.height);
        }

        ctx.restore();
    }
}
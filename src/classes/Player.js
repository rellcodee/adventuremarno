export default class Player {
    constructor(gameWidth, gameHeight, levelWidth) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;

        this.health = 3;
        this.coins = 0;
        this.score = 0;

        this.levelWidth = levelWidth;
        // 1. Mario-size scale
        this.width = 48;
        this.height = 64;
        this.x = 80;

        this.maxReachedX = this.x;

        const groundMargin = 100;
        this.y = this.gameHeight - this.height - groundMargin;


        // 2. Asset Loading (Only Right-facing needed!)
        this.assets = {
            stand: new Image(),
            walkA: new Image(),
            walkB: new Image(),
            jump: new Image()
        };
        this.assets.stand.src = '../assets/player/stand.png'; // Add your stand file
        this.assets.walkA.src = '../assets/player/walkA.png';
        this.assets.walkB.src = '../assets/player/walkB.png';
        this.assets.jump.src = '../assets/player/jump.png';


        // 3. Physics (GDD Specs)
        this.vy = 0;
        this.weight = 920;
        this.maxSpeed = 210;
        this.speed = 0;

        // 4. Animation State
        this.currentSprite = this.assets.stand;
        this.frameTimer = 0;
        this.frameInterval = 200;
        this.isWalkingA = true;
        this.facing = 'right'; // Track direction for the flip
    }

    update(input, dt) {
        // --- HORIZONTAL MOVEMENT ---
        if (input.includes('ArrowRight')) {
            this.speed = this.maxSpeed;
            this.facing = 'right';
        } else if (input.includes('ArrowLeft')) {
            this.speed = -this.maxSpeed;
            this.facing = 'left';
        } else {
            this.speed = 0;
        }

        this.x += this.speed * dt;

        // --- SCORE LOGIC ---
        // Only give points if the current X is greater than the record
        if (this.x > this.maxReachedX) {
            let distanceMoved = this.x - this.maxReachedX;

            // 10 pixels = 1 point (you can change this number)
            this.score += distanceMoved / 5;
            // Update the record so we don't get points for the same spot twice
            this.maxReachedX = this.x;
        }

        // --- THE STATE CONTROLLER (Asset Swapping) ---
        if (!this.onGround()) {
            // Priority 1: Jumping
            this.currentSprite = this.assets.jump;
        } else if (this.speed !== 0) {
            // Priority 2: Walking
            this.animateWalk(dt);
        } else {
            // Priority 3: Standing
            this.currentSprite = this.assets.stand;
            this.frameTimer = 0; // Reset timer so walk starts fresh
        }

        // Boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > this.levelWidth - this.width) {
            this.x = this.levelWidth - this.width;
        }

        // --- VERTICAL MOVEMENT (JUMP) ---
        this.y += this.vy * dt;

        if (!this.onGround()) {
            this.vy += this.weight * dt;
        } else {
            this.vy = 0;
            this.y = this.gameHeight - this.height - 100; // Snap to floor
        }

        if (input.includes('ArrowUp') && this.onGround()) {
            this.vy = -530; // Jump force
        }

        // Inside Player.js update()
        if (this.x > this.maxReachedX) {
            // Player moved to a "new road"
            let distanceMoved = this.x - this.maxReachedX;
            this.score += Math.floor(distanceMoved / 10); // 1 point per 10 pixels
            this.maxReachedX = this.x;
        }
    }

    animateWalk(dt) {
        if (this.frameTimer > this.frameInterval) {
            this.isWalkingA = !this.isWalkingA;
            this.currentSprite = this.isWalkingA ? this.assets.walkA : this.assets.walkB;
            this.frameTimer = 0;
        } else {
            this.frameTimer += dt * 1000;
        }
    }

    onGround() {
        return this.y >= this.gameHeight - this.height - 100;
    }

    draw(context) {
        context.save();

        // HERO TRICK: The Flip Logic
        if (this.facing === 'left') {
            // Move drawing context to player, flip it, then draw at 0,0
            context.translate(this.x + this.width, this.y);
            context.scale(-1, 1);
            context.drawImage(
                this.currentSprite, 0, 0, this.currentSprite.width, this.currentSprite.height,
                0, 0, this.width, this.height
            );
        } else {
            context.drawImage(
                this.currentSprite, 0, 0, this.currentSprite.width, this.currentSprite.height,
                this.x, this.y, this.width, this.height
            );
        }

        context.restore();
    }
}
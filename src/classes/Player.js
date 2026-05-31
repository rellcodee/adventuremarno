export default class Player {
    constructor(gameWidth, gameHeight, levelWidth) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;

        this.health = 3;
        this.coins = 0;
        this.score = 0;

        this.isDead = false;
        this.isHit = false;
        this.hitTimer = 0;

        this.levelWidth = levelWidth;
        // 1. Mario-size scale
        this.width = 48;
        this.height = 64;
        this.x = 80;

        // Inside Player.js constructor
        this.isOnPlatform = false;

        this.maxReachedX = this.x;

        const groundMargin = 100;
        this.y = this.gameHeight - this.height - groundMargin;


        // 2. Asset Loading (Only Right-facing needed!)
        this.assets = {
            stand: new Image(),
            walkA: new Image(),
            walkB: new Image(),
            jump: new Image(),
            damage: new Image(),
            dead: new Image()
        };
        this.assets.stand.src = '../assets/player/stand.png'; // Add your stand file
        this.assets.walkA.src = '../assets/player/walkA.png';
        this.assets.walkB.src = '../assets/player/walkB.png';
        this.assets.jump.src = '../assets/player/jump.png';
        this.assets.damage.src = '../assets/player/sick.png';
        this.assets.dead.src = '../assets/player/death.png';

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

    takeDamage() {
        if (this.isHit || this.isDead) return; // Invulnerability frames

        this.health--;
        if (this.health <= 0) {
            this.die();
        } else {
            this.isHit = true;
            this.hitTimer = 0;
            this.vy = -400; // Small jump when hit
            this.speed = -150; // Optional: knockback speed
        }
    }

    die() {
        this.isDead = true;
        this.vy = -600; // Death jump (classic Mario style)
        this.currentSprite = this.assets.dead;
    }

    update(input, dt) {

        if (this.isDead) {
            this.y += this.vy * dt;
            this.vy += this.weight * dt; // Fall off screen
            return; // Skip all other logic
        }


        // Handle hit stun duration
        if (this.isHit) {
            this.hitTimer += dt;
            if (this.hitTimer > 0.8) { // 0.8 seconds of "sick" pose
                this.isHit = false;
            }
        }

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
            // FIX: Only snap to floor if we aren't on a platform
            if (!this.isOnPlatform) {
                this.vy = 0;
                const groundY = this.gameHeight - this.height - 100;
                this.y = groundY;
            } else {
                // Just stop falling, let Obstacle.js handle the position
                this.vy = 0;
            }
        }
        // --- 2. JUMP LOGIC (MUST BE LAST) ---
        // We check onGround() here. If it's true, we set a fresh -530 velocity.
        if (input.includes('ArrowUp') && this.onGround()) {
            this.vy = -530;
            this.isOnPlatform = false; // "Launch" off the platform
        }

        // Force a tiny bit of "Stickiness"
        if (this.isOnPlatform) {
            this.vy = 0; // Lock velocity
        }

        // --- THE FINAL ANIMATION CONTROLLER (DO NOT DUPLICATE) ---
        // Priority: 1. Death, 2. Damage, 3. Air/Jump, 4. Walk, 5. Stand
        if (this.isDead) {
            this.currentSprite = this.assets.dead;
        } else if (this.isHit) {
            // This MUST come before the !onGround check
            this.currentSprite = this.assets.damage;
        } else if (!this.onGround()) {
            this.currentSprite = this.assets.jump;
        } else if (this.speed !== 0) {
            this.animateWalk(dt);
        } else {
            this.currentSprite = this.assets.stand;
            this.frameTimer = 0;
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
        const isAtFloor = this.y >= (this.gameHeight - this.height - 102);
        return isAtFloor || this.isOnPlatform;
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
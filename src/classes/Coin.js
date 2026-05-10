export default class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.image = new Image();
        this.image.src = '../assets/obstacles/coint.png'; // Make sure you have a coin image!
        this.markedForDeletion = false;
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update(player) {
        // Simple circle-based or box-based collision
        if (
            player.x < this.x + this.width &&
            player.x + player.width > this.x &&
            player.y < this.y + this.height &&
            player.y + player.height > this.y
        ) {
            this.markedForDeletion = true;
            player.coins += 1; // Update the UI data
        }
    }
}
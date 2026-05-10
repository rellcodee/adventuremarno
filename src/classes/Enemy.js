import Entity from './Entity.js';

export default class Enemy extends Entity {
    constructor(x, y, width, height, imageSrc, speed = 0) {
        super(x, y, width, height, imageSrc);
        this.speed = speed; // Eagle can fly (speed > 0)
        this.damage = 1;
    }
    update(dt) {
        this.x -= this.speed * dt; // Enemies move left towards the player
    }
}
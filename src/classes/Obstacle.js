import Entity from './Entity.js';

export default class Obstacle extends Entity {
    constructor(x, y, width, height, imageSrc) {
        super(x, y, width, height, imageSrc);
        this.type = 'solid';
    }
}
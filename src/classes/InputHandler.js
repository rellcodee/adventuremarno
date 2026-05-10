// src/InputHandler.js
export default class InputHandler {
    constructor() {
        this.keys = [];
        window.addEventListener('keydown', e => {
            // Check if the key is one of our game controls
            if ((e.key === 'ArrowLeft' ||
                e.key === 'ArrowRight' ||
                e.key === 'ArrowUp' ||
                e.key === 'ArrowDown') // We add Down just in case
                && this.keys.indexOf(e.key) === -1) {

                this.keys.push(e.key);

                // HERO STEP: This stops the browser from scrolling!
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', e => {
            if (e.key === 'ArrowLeft' ||
                e.key === 'ArrowRight' ||
                e.key === 'ArrowUp' ||
                e.key === 'ArrowDown') {
                this.keys.splice(this.keys.indexOf(e.key), 1);
            }
        });
    }
}
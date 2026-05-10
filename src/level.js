export const levels = {
    1: {
        background: '../assets/pagi.png',
        width: 3000,
        // Define exact X positions for coins in the "intro" level
        coins: [
            { x: 400, y: 550 },
            { x: 600, y: 550 },
            { x: 800, y: 450 }, // A high coin to teach jumping!
            { x: 1000, y: 550 },
            { x: 2500, y: 550 } // A reward at the end
        ],
        obstacles: [], // Level 1 is safe
        enemies: []
    },
    2: {
        background: '../assets/pagi.png',
        width: 3500,
        coins: [400, 900],
        // Define where stones or pipes are placed
        obstacles: [
            { x: 600, type: 'stone' },
            { x: 1400, type: 'pipe' },
            { x: 2000, type: 'stone' }
        ],
        enemies: []
    }
};
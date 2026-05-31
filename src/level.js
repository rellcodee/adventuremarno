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
        width: 3500,
        background: '../assets/pagi.png',
        coins: [{ x: 500, y: 550 }, { x: 1200, y: 550 }],
        obstacles: [
            { x: 1000, y: 570, w: 80, h: 50, src: '../assets/obstacles/rock.png', type: 'rock' },
            { x: 1800, y: 470, w: 100, h: 150, src: '../assets/obstacles/pipe.png', type: 'pipe' },
            { x: 2500, y: 570, w: 80, h: 50, src: '../assets/obstacles/rock.png', type: 'rock' }
        ],
        enemies: []
    },
    3: {
        width: 4000,
        background: '../assets/siang.png',
        coins: [{ x: 500, y: 550 }, { x: 1200, y: 550 }],
        obstacles: [
            { x: 1000, y: 570, w: 80, h: 50, src: '../assets/obstacles/rock.png', type: 'rock' },
            { x: 1800, y: 470, w: 100, h: 150, src: '../assets/obstacles/pipe.png', type: 'pipe' },
            { x: 1400, y: 470, w: 100, h: 150, src: '../assets/obstacles/pipe.png', type: 'pipe', hasSnake: true },
            { x: 2500, y: 570, w: 80, h: 50, src: '../assets/obstacles/rock.png', type: 'rock' }
        ],
        enemies: [
            { x: 2000, y: 554, w: 64, h: 64, src: '../assets/turtle/walkA.png', type: 'turtle', speed: 80 },
            { x: 1500, y: 100, w: 64, h: 64, src: '../assets/obstacles/eagle.png', type: 'eagle', speed: 150 },
            { x: 1600, y: 100, w: 64, h: 64, src: '../assets/obstacles/eagle.png', type: 'eagle', speed: 150 },
            { x: 1700, y: 100, w: 64, h: 64, src: '../assets/obstacles/eagle.png', type: 'eagle', speed: 150 },

        ]

    },
    4: {
        width: 4000,
        background: '../assets/siang.png',
        coins: [{ x: 500, y: 550 }, { x: 1000, y: 550 }],
        obstacles: [

        ],
        enemies: [

        ]

    },
    5: {
        width: 3500,
        background: '../assets/malam.png',
        coins: [{ x: 500, y: 550 }, { x: 1200, y: 550 }],
        obstacles: [
            { x: 1000, y: 570, w: 80, h: 50, src: '../assets/obstacles/rock.png', type: 'rock' },
            { x: 1800, y: 470, w: 100, h: 150, src: '../assets/obstacles/pipe.png', type: 'pipe' },
            { x: 1400, y: 470, w: 100, h: 150, src: '../assets/obstacles/pipe.png', type: 'pipe', hasSnake: true },
            { x: 2500, y: 570, w: 80, h: 50, src: '../assets/obstacles/rock.png', type: 'rock' }
        ],
        enemies: [
            { x: 2000, y: 554, w: 64, h: 64, src: '../assets/turtle/walkA.png', type: 'turtle', speed: 80 },
            { x: 1500, y: 100, w: 64, h: 64, src: '../assets/obstacles/eagle.png', type: 'eagle', speed: 150 },
            { x: 1600, y: 100, w: 64, h: 64, src: '../assets/obstacles/eagle.png', type: 'eagle', speed: 150 },
            { x: 1700, y: 100, w: 64, h: 64, src: '../assets/obstacles/eagle.png', type: 'eagle', speed: 150 },

        ]

    },

};
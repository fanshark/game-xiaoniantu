// world.js - Map/zone definitions and tile system
const TILE_SIZE = 32;

const ZONES = {
    start: {
        name: '起始小路',
        width: 38,
        height: 30,
        bgColor: '#4a7c4f',
        portals: {
            east: { zone: 'grassland', spawnX: 2, spawnY: 15 },
        },
        entrances: [
            { x: 18, y: 8, dest: { zone: 'cozy_home', spawnX: 8, spawnY: 9 } },
        ],
        generateMap() {
            const map = [];
            for (let y = 0; y < this.height; y++) {
                map[y] = [];
                for (let x = 0; x < this.width; x++) {
                    if (y === 0 || y === this.height - 1 || x === 0) {
                        map[y][x] = 'tree';
                    } else if (x === this.width - 1) {
                        map[y][x] = (y >= 14 && y <= 17) ? 'portal' : 'tree';
                    } else if (x >= 5 && x <= 8 && y >= 12 && y <= 18) {
                        map[y][x] = 'path';
                    } else if (x >= 8 && x <= this.width - 2 && y >= 14 && y <= 17) {
                        map[y][x] = 'path';
                    } else {
                        map[y][x] = 'grass';
                    }
                }
            }
            // Cozy home entrance
            map[8][18] = 'entrance';
            return map;
        },
        spawnItems() {
            return [
                { type: 'clay', x: 12, y: 9 },
                { type: 'clay', x: 18, y: 21 },
                { type: 'clay', x: 9, y: 6 },
                { type: 'clay', x: 23, y: 11 },
                { type: 'clay', x: 27, y: 23 },
                { type: 'coin', x: 15, y: 5 },
                { type: 'coin', x: 30, y: 8 },
            ];
        },
        spawnNPCs() {
            return [
                { id: 'guide', type: 'good', x: 8, y: 15, dialogue: 'guide_start' },
            ];
        },
        spawnEnemies() {
            return [];
        }
    },

    grassland: {
        name: '翠绿草原',
        width: 45,
        height: 38,
        bgColor: '#3d8b37',
        portals: {
            west: { zone: 'start', spawnX: 33, spawnY: 15 },
            east: { zone: 'beach', spawnX: 2, spawnY: 18 },
            south: { zone: 'desert', spawnX: 23, spawnY: 2 },
        },
        entrances: [
            { x: 30, y: 8, dest: { zone: 'shop_interior', spawnX: 8, spawnY: 12 } },
            { x: 15, y: 17, dest: { zone: 'museum', spawnX: 11, spawnY: 12 } },
        ],
        generateMap() {
            const map = [];
            // Use seeded positions for trees to avoid blocking paths
            const treePositions = [
                [5,5],[8,8],[11,5],[14,11],[18,6],[21,12],[26,5],[29,9],
                [33,6],[38,11],[6,23],[12,30],[17,26],[24,30],[30,24],
                [36,21],[39,30],[9,33],[20,33],[32,33],[41,5],[41,26]
            ];
            for (let y = 0; y < this.height; y++) {
                map[y] = [];
                for (let x = 0; x < this.width; x++) {
                    if (y === 0 || (x === 0 && !(y >= 9 && y <= 11))) {
                        map[y][x] = 'tree';
                    } else if (x === this.width - 1 && !(y >= 17 && y <= 20)) {
                        map[y][x] = 'tree';
                    } else if (x === this.width - 1 && y >= 17 && y <= 20) {
                        map[y][x] = 'portal';
                    } else if (x === 0 && y >= 14 && y <= 17) {
                        map[y][x] = 'portal';
                    } else if (y === this.height - 1 && !(x >= 21 && x <= 24)) {
                        map[y][x] = 'tree';
                    } else if (y === this.height - 1 && x >= 21 && x <= 24) {
                        map[y][x] = 'portal';
                    } else {
                        map[y][x] = 'grass';
                    }
                }
            }
            // Place trees at fixed positions (avoids blocking portals/paths)
            treePositions.forEach(([tx, ty]) => {
                if (tx > 0 && tx < this.width - 1 && ty > 0 && ty < this.height - 1) {
                    map[ty][tx] = 'tree';
                }
            });
            // Shop entrance (building you can enter)
            map[8][30] = 'entrance';
            // Museum entrance
            map[17][15] = 'entrance';
            return map;
        },
        spawnItems() {
            return [
                { type: 'clay', x: 8, y: 6 }, { type: 'clay', x: 14, y: 9 },
                { type: 'clay', x: 21, y: 5 }, { type: 'clay', x: 27, y: 14 },
                { type: 'clay', x: 35, y: 8 }, { type: 'clay', x: 11, y: 21 },
                { type: 'clay', x: 18, y: 27 }, { type: 'clay', x: 24, y: 18 },
                { type: 'clay', x: 30, y: 30 }, { type: 'clay', x: 39, y: 23 },
                { type: 'clay', x: 6, y: 32 }, { type: 'clay', x: 15, y: 17 },
                { type: 'coin', x: 9, y: 12 }, { type: 'coin', x: 23, y: 23 },
                { type: 'coin', x: 33, y: 15 }, { type: 'coin', x: 41, y: 29 },
                { type: 'coin', x: 17, y: 32 },
            ];
        },
        spawnNPCs() {
            return [
                { id: 'farmer', type: 'good', x: 15, y: 12, dialogue: 'farmer' },
                { id: 'stranger1', type: 'bad', x: 33, y: 27, dialogue: 'bad_npc' },
                { id: 'spy1', type: 'spy', x: 23, y: 8, dialogue: 'spy_intro' },
            ];
        },
        spawnEnemies() {
            return [
                { type: 'slime', x: 27, y: 21, hp: 10, maxHp: 10, damage: 1, level: 1 },
                { type: 'slime', x: 12, y: 27, hp: 10, maxHp: 10, damage: 1, level: 1 },
                { type: 'slime', x: 38, y: 12, hp: 10, maxHp: 10, damage: 1, level: 1 },
                { type: 'slime', x: 8, y: 20, hp: 12, maxHp: 12, damage: 2, level: 2 },
                { type: 'slime', x: 21, y: 30, hp: 12, maxHp: 12, damage: 2, level: 2 },
                { type: 'slime', x: 39, y: 24, hp: 15, maxHp: 15, damage: 2, level: 2 },
            ];
        }
    },

    beach: {
        name: '海边沙滩',
        width: 42,
        height: 30,
        bgColor: '#87ceeb',
        portals: {
            west: { zone: 'grassland', spawnX: 41, spawnY: 18 },
        },
        entrances: [
            { x: 8, y: 6, dest: { zone: 'hidden_cave', spawnX: 11, spawnY: 15 } },
            { x: 24, y: 11, dest: { zone: 'library', spawnX: 9, spawnY: 12 } },
        ],
        generateMap() {
            const map = [];
            for (let y = 0; y < this.height; y++) {
                map[y] = [];
                for (let x = 0; x < this.width; x++) {
                    if (x === 0 && y >= 17 && y <= 20) {
                        map[y][x] = 'portal';
                    } else if (y === 0 || y === this.height - 1) {
                        map[y][x] = 'wall';
                    } else if (x === 0 || (x >= this.width - 6)) {
                        map[y][x] = 'water';
                    } else if (x >= this.width - 10 && x < this.width - 6) {
                        map[y][x] = 'sand';
                    } else if (x < 3) {
                        map[y][x] = 'grass';
                    } else {
                        // Deterministic pattern for beach terrain
                        map[y][x] = ((x + y * 3) % 5 === 0) ? 'sand' : 'grass';
                    }
                }
            }
            // Hidden cave entrance
            map[6][8] = 'entrance';
            // Library entrance
            map[11][24] = 'entrance';
            return map;
        },
        spawnItems() {
            return [
                { type: 'coin', x: 15, y: 12 },
                { type: 'coin', x: 23, y: 8 }, { type: 'coin', x: 12, y: 21 },
                { type: 'coin', x: 27, y: 15 }, { type: 'coin', x: 18, y: 24 },
                { type: 'coin', x: 30, y: 11 }, { type: 'coin', x: 9, y: 17 },
                { type: 'clay', x: 11, y: 9 }, { type: 'clay', x: 21, y: 18 },
                { type: 'clay', x: 29, y: 6 }, { type: 'clay', x: 17, y: 23 },
                { type: 'clay', x: 24, y: 14 },
            ];
        },
        spawnNPCs() {
            return [
                { id: 'fisher', type: 'good', x: 18, y: 12, dialogue: 'fisher' },
                { id: 'super_npc1', type: 'super_good', x: 12, y: 21, dialogue: 'super_good_npc' },
            ];
        },
        spawnEnemies() {
            return [
                { type: 'slime', x: 23, y: 8, hp: 12, maxHp: 12, damage: 2, level: 2 },
                { type: 'slime', x: 30, y: 18, hp: 15, maxHp: 15, damage: 2, level: 2 },
            ];
        }
    },

    desert: {
        name: '危险沙漠',
        width: 45,
        height: 38,
        bgColor: '#c4a03f',
        isDangerous: true,
        portals: {
            north: { zone: 'grassland', spawnX: 23, spawnY: 33 },
            south: { zone: 'fungus_cave', spawnX: 23, spawnY: 2 },
        },
        entrances: [
            { x: 15, y: 12, dest: { zone: 'oasis', spawnX: 8, spawnY: 2 } },
        ],
        generateMap() {
            const map = [];
            for (let y = 0; y < this.height; y++) {
                map[y] = [];
                for (let x = 0; x < this.width; x++) {
                    if (y === 0 && x >= 21 && x <= 24) {
                        map[y][x] = 'portal';
                    } else if (y === this.height - 1 && x >= 21 && x <= 24) {
                        map[y][x] = 'portal';
                    } else if (y === 0 || y === this.height - 1) {
                        map[y][x] = 'wall';
                    } else if (x === 0 || x === this.width - 1) {
                        map[y][x] = 'wall';
                    } else {
                        map[y][x] = 'sand';
                    }
                }
            }
            // Oasis entrance
            map[12][15] = 'entrance';
            // Some safe path spots
            map[8][11] = 'path';
            map[15][20] = 'path';
            map[15][21] = 'path';
            map[12][5] = 'path';
            // Danger house
            map[18][25] = 'house_danger';
            return map;
        },
        spawnItems() {
            return [
                { type: 'clay', x: 30, y: 23 },
                { type: 'coin', x: 8, y: 18 },
            ];
        },
        spawnNPCs() {
            return [
                { id: 'desert_bad', type: 'bad', x: 30, y: 15, dialogue: 'bad_npc' },
            ];
        },
        spawnEnemies() {
            return [
                { type: 'slime', x: 12, y: 9, hp: 18, maxHp: 18, damage: 3, level: 3 },
                { type: 'slime', x: 33, y: 27, hp: 18, maxHp: 18, damage: 3, level: 3 },
                { type: 'slime', x: 8, y: 23, hp: 20, maxHp: 20, damage: 3, level: 3 },
                { type: 'slime', x: 38, y: 8, hp: 22, maxHp: 22, damage: 4, level: 4 },
                { type: 'slime', x: 23, y: 30, hp: 20, maxHp: 20, damage: 3, level: 3 },
            ];
        }
    },

    fungus_cave: {
        name: '菌窟深处',
        width: 38,
        height: 30,
        bgColor: '#1a1a2e',
        portals: {
            north: { zone: 'desert', spawnX: 23, spawnY: 33 },
            east: { zone: 'mountain', spawnX: 2, spawnY: 15 },
        },
        generateMap() {
            const map = [];
            for (let y = 0; y < this.height; y++) {
                map[y] = [];
                for (let x = 0; x < this.width; x++) {
                    if (y === 0 && !(x >= 14 && x <= 16)) {
                        map[y][x] = 'wall';
                    } else if (y === 0 && x >= 21 && x <= 24) {
                        map[y][x] = 'portal';
                    } else if (x === this.width - 1 && y >= 14 && y <= 17) {
                        map[y][x] = 'portal';
                    } else if (y === this.height - 1 || x === 0 || x === this.width - 1) {
                        map[y][x] = 'wall';
                    } else {
                        map[y][x] = 'cave';
                    }
                }
            }
            return map;
        },
        spawnItems() {
            return [];
        },
        spawnNPCs() {
            return [];
        },
        spawnEnemies() {
            // Fungi spawn in waves, handled by combat system
            return [
                { type: 'fungi', x: 15, y: 12, hp: 8, maxHp: 8, damage: 1, level: 1 },
                { type: 'fungi', x: 23, y: 18, hp: 8, maxHp: 8, damage: 1, level: 1 },
                { type: 'fungi', x: 12, y: 23, hp: 8, maxHp: 8, damage: 1, level: 1 },
                { type: 'fungi', x: 27, y: 9, hp: 10, maxHp: 10, damage: 2, level: 2 },
                { type: 'fungi', x: 18, y: 15, hp: 10, maxHp: 10, damage: 2, level: 2 },
            ];
        }
    },

    mountain: {
        name: '山林终极区',
        width: 38,
        height: 30,
        bgColor: '#2d3436',
        requireSize: 15000, // 15m = 15000mm
        portals: {
            west: { zone: 'fungus_cave', spawnX: 33, spawnY: 15 },
        },
        generateMap() {
            const map = [];
            for (let y = 0; y < this.height; y++) {
                map[y] = [];
                for (let x = 0; x < this.width; x++) {
                    if (x === 0 && y >= 14 && y <= 17) {
                        map[y][x] = 'portal';
                    } else if (y === 0 || y === this.height - 1 || x === 0 || x === this.width - 1) {
                        map[y][x] = 'mountain';
                    } else if (x > this.width - 6 && y > 7 && y < 13) {
                        map[y][x] = 'cave'; // Boss arena area
                    } else {
                        // Ensure a clear path from spawn to boss
                        if (y >= 9 && y <= 11) {
                            map[y][x] = 'cave'; // Clear corridor
                        } else {
                            map[y][x] = ((x + y) % 7 === 0) ? 'mountain' : 'cave';
                        }
                    }
                }
            }
            return map;
        },
        spawnItems() {
            return [
                { type: 'clay', x: 8, y: 8 },
                { type: 'clay', x: 8, y: 23 },
            ];
        },
        spawnNPCs() {
            return [];
        },
        spawnEnemies() {
            return [
                { type: 'boss', x: 30, y: 15, hp: 200, maxHp: 200, damage: 8, isBoss: true, level: 5 },
            ];
        }
    },

    // === SUB-MAPS (Indoor/Small areas) ===
    
    shop_interior: {
        name: '粘土补给商店',
        width: 18,
        height: 15,
        bgColor: '#3d2b1f',
        isSubMap: true,
        parentZone: 'grassland',
        parentSpawn: { x: 30, y: 9 },
        portals: {
            south: { zone: 'grassland', spawnX: 30, spawnY: 9 },
        },
        generateMap() {
            const map = [];
            for (let y = 0; y < this.height; y++) {
                map[y] = [];
                for (let x = 0; x < this.width; x++) {
                    if (y === this.height - 1 && x >= 8 && x <= 9) {
                        map[y][x] = 'portal';
                    } else if (y === 0 || y === this.height - 1 || x === 0 || x === this.width - 1) {
                        map[y][x] = 'wall';
                    } else if (y === 1 && x >= 2 && x <= 9) {
                        map[y][x] = 'shop'; // Counter
                    } else {
                        map[y][x] = 'path';
                    }
                }
            }
            return map;
        },
        spawnItems() {
            return [];
        },
        spawnNPCs() {
            return [
                { id: 'shopkeeper', type: 'good', x: 8, y: 3, dialogue: 'shopkeeper' },
            ];
        },
        spawnEnemies() { return []; }
    },

    hidden_cave: {
        name: '隐藏洞穴',
        width: 23,
        height: 18,
        bgColor: '#1a1a2e',
        isSubMap: true,
        parentZone: 'beach',
        parentSpawn: { x: 8, y: 8 },
        portals: {
            south: { zone: 'beach', spawnX: 8, spawnY: 8 },
        },
        generateMap() {
            const map = [];
            for (let y = 0; y < this.height; y++) {
                map[y] = [];
                for (let x = 0; x < this.width; x++) {
                    if (y === this.height - 1 && x >= 9 && x <= 12) {
                        map[y][x] = 'portal';
                    } else if (y === 0 || y === this.height - 1 || x === 0 || x === this.width - 1) {
                        map[y][x] = 'wall';
                    } else {
                        map[y][x] = 'cave';
                    }
                }
            }
            return map;
        },
        spawnItems() {
            return [
                { type: 'clay', x: 5, y: 5 }, { type: 'clay', x: 11, y: 8 },
                { type: 'clay', x: 17, y: 5 }, { type: 'clay', x: 8, y: 12 },
                { type: 'clay', x: 14, y: 11 }, { type: 'clay', x: 18, y: 14 },
                { type: 'coin', x: 11, y: 3 }, { type: 'coin', x: 15, y: 9 },
            ];
        },
        spawnNPCs() {
            return [
                { id: 'cave_hermit', type: 'super_good', x: 11, y: 5, dialogue: 'cave_hermit' },
            ];
        },
        spawnEnemies() {
            return [
                { type: 'slime', x: 6, y: 11, hp: 15, maxHp: 15, damage: 2, level: 2 },
                { type: 'slime', x: 15, y: 8, hp: 15, maxHp: 15, damage: 2, level: 2 },
            ];
        }
    },

    oasis: {
        name: '沙漠绿洲',
        width: 18,
        height: 18,
        bgColor: '#2e7d32',
        isSubMap: true,
        parentZone: 'desert',
        parentSpawn: { x: 15, y: 12 },
        portals: {
            north: { zone: 'desert', spawnX: 15, spawnY: 14 },
        },
        generateMap() {
            const map = [];
            for (let y = 0; y < this.height; y++) {
                map[y] = [];
                for (let x = 0; x < this.width; x++) {
                    if (y === 0 && x >= 5 && x <= 6) {
                        map[y][x] = 'portal';
                    } else if (y === 0 || y === this.height - 1 || x === 0 || x === this.width - 1) {
                        map[y][x] = 'tree';
                    } else if ((x >= 4 && x <= 7) && (y >= 5 && y <= 7)) {
                        map[y][x] = 'water';
                    } else {
                        map[y][x] = 'grass';
                    }
                }
            }
            return map;
        },
        spawnItems() {
            return [
                { type: 'clay', x: 3, y: 5 }, { type: 'clay', x: 14, y: 6 },
                { type: 'clay', x: 5, y: 14 }, { type: 'clay', x: 12, y: 12 },
                { type: 'coin', x: 8, y: 3 }, { type: 'coin', x: 14, y: 14 },
            ];
        },
        spawnNPCs() {
            return [
                { id: 'oasis_npc', type: 'good', x: 9, y: 5, dialogue: 'oasis_npc' },
            ];
        },
        spawnEnemies() { return []; }
    },

    spy_hideout: {
        name: '假商店（陷阱！）',
        width: 15,
        height: 12,
        bgColor: '#2c0033',
        isSubMap: true,
        parentZone: 'grassland',
        parentSpawn: { x: 23, y: 9 },
        portals: {
            south: { zone: 'grassland', spawnX: 23, spawnY: 9 },
        },
        generateMap() {
            const map = [];
            for (let y = 0; y < this.height; y++) {
                map[y] = [];
                for (let x = 0; x < this.width; x++) {
                    if (y === this.height - 1 && x >= 6 && x <= 8) {
                        map[y][x] = 'portal';
                    } else if (y === 0 || y === this.height - 1 || x === 0 || x === this.width - 1) {
                        map[y][x] = 'wall';
                    } else {
                        map[y][x] = 'path';
                    }
                }
            }
            return map;
        },
        spawnItems() { return []; },
        spawnNPCs() {
            return [
                { id: 'fake_shopkeeper', type: 'bad', x: 8, y: 3, dialogue: 'fake_shopkeeper' },
            ];
        },
        spawnEnemies() {
            return [
                { type: 'slime', x: 5, y: 6, hp: 18, maxHp: 18, damage: 3, level: 3 },
                { type: 'slime', x: 11, y: 6, hp: 18, maxHp: 18, damage: 3, level: 3 },
            ];
        }
    },

    // === NEW BUILDINGS ===

    cozy_home: {
        name: '温暖小屋',
        width: 15,
        height: 12,
        bgColor: '#5d4037',
        isSubMap: true,
        parentZone: 'start',
        parentSpawn: { x: 18, y: 9 },
        portals: {
            south: { zone: 'start', spawnX: 18, spawnY: 9 },
        },
        generateMap() {
            const map = [];
            for (let y = 0; y < this.height; y++) {
                map[y] = [];
                for (let x = 0; x < this.width; x++) {
                    if (y === this.height - 1 && x >= 6 && x <= 8) {
                        map[y][x] = 'portal';
                    } else if (y === 0 || y === this.height - 1 || x === 0 || x === this.width - 1) {
                        map[y][x] = 'wall';
                    } else if (x === 3 && y === 3) {
                        map[y][x] = 'furniture'; // bed
                    } else if (x === 11 && y === 3) {
                        map[y][x] = 'furniture'; // table
                    } else if (x === 8 && y === 1) {
                        map[y][x] = 'wall'; // fireplace
                    } else {
                        map[y][x] = 'path';
                    }
                }
            }
            return map;
        },
        spawnItems() {
            return [
                { type: 'clay', x: 5, y: 8 },
                { type: 'coin', x: 11, y: 8 },
            ];
        },
        spawnNPCs() {
            return [
                { id: 'home_npc', type: 'good', x: 8, y: 5, dialogue: 'home_resident' },
            ];
        },
        spawnEnemies() { return []; }
    },

    museum: {
        name: '粘土博物馆',
        width: 21,
        height: 15,
        bgColor: '#37474f',
        isSubMap: true,
        parentZone: 'grassland',
        parentSpawn: { x: 15, y: 18 },
        portals: {
            south: { zone: 'grassland', spawnX: 15, spawnY: 18 },
        },
        generateMap() {
            const map = [];
            for (let y = 0; y < this.height; y++) {
                map[y] = [];
                for (let x = 0; x < this.width; x++) {
                    if (y === this.height - 1 && x >= 9 && x <= 11) {
                        map[y][x] = 'portal';
                    } else if (y === 0 || y === this.height - 1 || x === 0 || x === this.width - 1) {
                        map[y][x] = 'wall';
                    } else if ((x === 5 || x === 11 || x === 17) && y === 3) {
                        map[y][x] = 'furniture'; // display cases
                    } else if ((x === 5 || x === 11 || x === 17) && y === 8) {
                        map[y][x] = 'furniture'; // display cases row 2
                    } else {
                        map[y][x] = 'path';
                    }
                }
            }
            return map;
        },
        spawnItems() {
            return [
                { type: 'clay', x: 8, y: 5 },
                { type: 'clay', x: 14, y: 5 },
                { type: 'coin', x: 8, y: 9 },
                { type: 'coin', x: 14, y: 9 },
            ];
        },
        spawnNPCs() {
            return [
                { id: 'curator', type: 'good', x: 11, y: 6, dialogue: 'museum_curator' },
            ];
        },
        spawnEnemies() { return []; }
    },

    library: {
        name: '知识图书馆',
        width: 18,
        height: 15,
        bgColor: '#4e342e',
        isSubMap: true,
        parentZone: 'beach',
        parentSpawn: { x: 24, y: 12 },
        portals: {
            south: { zone: 'beach', spawnX: 24, spawnY: 12 },
        },
        generateMap() {
            const map = [];
            for (let y = 0; y < this.height; y++) {
                map[y] = [];
                for (let x = 0; x < this.width; x++) {
                    if (y === this.height - 1 && x >= 5 && x <= 6) {
                        map[y][x] = 'portal';
                    } else if (y === 0 || y === this.height - 1 || x === 0 || x === this.width - 1) {
                        map[y][x] = 'wall';
                    } else if ((x === 3 || x === 8 || x === 12) && y >= 3 && y <= 6) {
                        map[y][x] = 'furniture'; // bookshelves
                    } else {
                        map[y][x] = 'path';
                    }
                }
            }
            return map;
        },
        spawnItems() {
            return [
                { type: 'clay', x: 5, y: 9 },
                { type: 'clay', x: 14, y: 9 },
                { type: 'coin', x: 9, y: 5 },
            ];
        },
        spawnNPCs() {
            return [
                { id: 'librarian', type: 'good', x: 9, y: 8, dialogue: 'librarian' },
            ];
        },
        spawnEnemies() { return []; }
    }
};

// World management
const World = {
    currentZone: null,
    currentMap: null,
    items: [],
    waterDrops: [], // desert effect

    loadZone(zoneName) {
        const zone = ZONES[zoneName];
        if (!zone) return false;
        
        this.currentZone = zoneName;
        this.currentMap = zone.generateMap();
        this.items = zone.spawnItems();
        this.waterDrops = [];
        
        return true;
    },

    getTile(x, y) {
        if (!this.currentMap) return 'wall';
        if (y < 0 || y >= this.currentMap.length || x < 0 || x >= this.currentMap[0].length) {
            return 'wall';
        }
        return this.currentMap[y][x];
    },

    isWalkable(tileX, tileY) {
        const tile = this.getTile(tileX, tileY);
        return tile !== 'wall' && tile !== 'tree' && tile !== 'mountain' && tile !== 'water' && tile !== 'portal' && tile !== 'entrance' && tile !== 'furniture';
    },

    isPortal(tileX, tileY) {
        const tile = this.getTile(tileX, tileY);
        return tile === 'portal' || tile === 'entrance';
    },

    getPortalDestination(tileX, tileY) {
        const zone = ZONES[this.currentZone];
        if (!zone || !zone.portals) return null;
        
        const map = this.currentMap;
        const tile = this.getTile(tileX, tileY);
        
        // Check for entrance tiles (sub-map entrances stored in zone.entrances)
        if (tile === 'entrance' && zone.entrances) {
            for (const entrance of zone.entrances) {
                if (entrance.x === tileX && entrance.y === tileY) {
                    return entrance.dest;
                }
            }
        }
        
        // Edge-based portals
        if (tileX === 0) return zone.portals.west;
        if (tileX === map[0].length - 1) return zone.portals.east;
        if (tileY === 0) return zone.portals.north;
        if (tileY === map.length - 1) return zone.portals.south;
        return null;
    },

    isDesert() {
        return ZONES[this.currentZone]?.isDangerous === true;
    },

    addWaterDrop(x, y) {
        this.waterDrops.push({ x, y, alpha: 1.0, time: 0 });
    },

    updateWaterDrops(dt) {
        for (let i = this.waterDrops.length - 1; i >= 0; i--) {
            this.waterDrops[i].alpha -= dt * 0.3;
            this.waterDrops[i].time += dt;
            if (this.waterDrops[i].alpha <= 0) {
                this.waterDrops.splice(i, 1);
            }
        }
    },

    collectItem(tileX, tileY) {
        for (let i = this.items.length - 1; i >= 0; i--) {
            if (this.items[i].x === tileX && this.items[i].y === tileY) {
                const item = this.items.splice(i, 1)[0];
                return item;
            }
        }
        return null;
    },

    // Check if near an item (within 1 tile)
    getNearbyItem(tileX, tileY) {
        for (let i = 0; i < this.items.length; i++) {
            const dx = Math.abs(this.items[i].x - tileX);
            const dy = Math.abs(this.items[i].y - tileY);
            if (dx <= 0 && dy <= 0) {
                return i;
            }
        }
        return -1;
    }
};

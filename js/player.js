// player.js - Player state, movement, and growth
const Player = {
    // Position (in tile coordinates)
    tileX: 4,
    tileY: 10,
    // Pixel position for smooth movement
    pixelX: 0,
    pixelY: 0,
    // Movement
    speed: 3.0, // tiles per second base (fast movement)
    moving: false,
    targetX: 0,
    targetY: 0,
    moveProgress: 0,
    lastMoveTime: 0,
    direction: 'down', // up, down, left, right
    
    // Stats
    sizeMM: 5, // starts at 5mm
    maxHP: 100,
    hp: 100,
    coins: 0,
    attackPower: 5,
    weapon: null, // current equipped weapon
    weaponBonus: 0, // attack bonus from weapon
    
    // Growth stage (0-4): tiny, small, medium, large, giant
    get stage() {
        if (this.sizeMM >= 15000) return 4;
        if (this.sizeMM >= 5000) return 3;
        if (this.sizeMM >= 1000) return 2;
        if (this.sizeMM >= 100) return 1;
        return 0;
    },
    
    // Pet
    hasPet: false,
    petPower: 0,
    
    // Flags
    hasGiantClay: false,
    fungiDefeated: 0,
    fungiChallengeActive: false,
    fungiChallengeComplete: false,
    fungiChallengeTriggered: false,
    bossDefeated: false,
    friendRescued: false,
    visitedZones: new Set(['start']),
    
    // Desert step tracking
    lastDesertTile: null,

    init() {
        this.pixelX = this.tileX * TILE_SIZE + TILE_SIZE / 2;
        this.pixelY = this.tileY * TILE_SIZE + TILE_SIZE / 2;
        this.targetX = this.pixelX;
        this.targetY = this.pixelY;
    },

    // Get effective speed (slower when tiny, faster when big)
    getSpeed() {
        const stageBonus = this.stage * 0.3;
        return (this.speed + stageBonus) * TILE_SIZE;
    },

    // Growth
    grow(amount) {
        this.sizeMM = Math.max(1, this.sizeMM + amount);
        // Update attack power based on size + weapon
        this.attackPower = 5 + Math.floor(this.sizeMM / 100) * 2 + this.petPower + this.weaponBonus;
    },

    shrink(amount) {
        this.sizeMM = Math.max(1, this.sizeMM - amount);
        if (this.sizeMM <= 1) {
            // Game over check
            return true;
        }
        return false;
    },

    // Take damage
    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        return this.hp <= 0;
    },

    heal(amount) {
        this.hp = Math.min(this.maxHP, this.hp + amount);
    },

    // Equip weapon
    equipWeapon(weaponData) {
        this.weapon = weaponData;
        this.weaponBonus = weaponData.attackBonus;
        // Recalculate attack power
        this.attackPower = 5 + Math.floor(this.sizeMM / 100) * 2 + this.petPower + this.weaponBonus;
    },

    // Movement
    tryMove(dx, dy) {
        if (this.moving) return false;
        
        const newTileX = this.tileX + dx;
        const newTileY = this.tileY + dy;
        
        // Set direction
        if (dx > 0) this.direction = 'right';
        else if (dx < 0) this.direction = 'left';
        else if (dy > 0) this.direction = 'down';
        else if (dy < 0) this.direction = 'up';
        
        if (!World.isWalkable(newTileX, newTileY)) {
            // Check if it's a portal
            if (World.isPortal(newTileX, newTileY)) {
                return { type: 'portal', tileX: newTileX, tileY: newTileY };
            }
            return false;
        }
        
        this.moving = true;
        this.targetX = newTileX * TILE_SIZE + TILE_SIZE / 2;
        this.targetY = newTileY * TILE_SIZE + TILE_SIZE / 2;
        this.moveProgress = 0;
        this.tileX = newTileX;
        this.tileY = newTileY;
        
        return { type: 'move' };
    },

    update(dt) {
        if (this.moving) {
            const speed = this.getSpeed();
            const dx = this.targetX - this.pixelX;
            const dy = this.targetY - this.pixelY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 1) {
                this.moving = false;
                this.pixelX = this.targetX;
                this.pixelY = this.targetY;
            } else {
                const step = Math.min(speed * dt, dist);
                this.pixelX += (dx / dist) * step;
                this.pixelY += (dy / dist) * step;
            }
        }
    },

    // Get display size text
    getSizeDisplay() {
        if (this.sizeMM >= 10000) {
            return (this.sizeMM / 1000).toFixed(1) + 'm';
        } else if (this.sizeMM >= 1000) {
            return (this.sizeMM / 10).toFixed(0) + 'cm';
        }
        return this.sizeMM + 'mm';
    },

    // Serialization for save
    serialize() {
        return {
            tileX: this.tileX,
            tileY: this.tileY,
            sizeMM: this.sizeMM,
            hp: this.hp,
            maxHP: this.maxHP,
            coins: this.coins,
            hasPet: this.hasPet,
            petPower: this.petPower,
            hasGiantClay: this.hasGiantClay,
            fungiDefeated: this.fungiDefeated,
            fungiChallengeComplete: this.fungiChallengeComplete,
            bossDefeated: this.bossDefeated,
            friendRescued: this.friendRescued,
            visitedZones: [...this.visitedZones],
            currentZone: World.currentZone,
            weapon: this.weapon,
            weaponBonus: this.weaponBonus,
        };
    },

    deserialize(data) {
        if (!data) return;
        this.tileX = data.tileX;
        this.tileY = data.tileY;
        this.sizeMM = data.sizeMM;
        this.hp = data.hp;
        this.maxHP = data.maxHP || 100;
        this.coins = data.coins;
        this.hasPet = data.hasPet;
        this.petPower = data.petPower;
        this.hasGiantClay = data.hasGiantClay;
        this.fungiDefeated = data.fungiDefeated;
        this.fungiChallengeComplete = data.fungiChallengeComplete || false;
        this.bossDefeated = data.bossDefeated;
        this.friendRescued = data.friendRescued;
        this.visitedZones = new Set(data.visitedZones || ['start']);
        this.weapon = data.weapon || null;
        this.weaponBonus = data.weaponBonus || 0;
        this.pixelX = this.tileX * TILE_SIZE + TILE_SIZE / 2;
        this.pixelY = this.tileY * TILE_SIZE + TILE_SIZE / 2;
        this.targetX = this.pixelX;
        this.targetY = this.pixelY;
        // Recalculate attack power
        this.attackPower = 5 + Math.floor(this.sizeMM / 100) * 2 + this.petPower + this.weaponBonus;
    }
};

// combat.js - Combat system with enemy AI movement
const Combat = {
    active: false,
    enemies: [],
    currentEnemy: null,
    playerAttackCooldown: 0,
    enemyAttackCooldown: 0,
    fungiWave: 0,
    fungiTotal: 0,
    enemyMoveTimer: 0,
    
    PLAYER_ATTACK_RATE: 0.4, // seconds between attacks
    ENEMY_ATTACK_RATE: 2.5, // seconds between enemy attacks (slower = fairer)
    ENEMY_MOVE_RATE: 1.5, // seconds between enemy movements (slower chase)

    loadEnemies(zoneName) {
        const zone = ZONES[zoneName];
        if (!zone) return;
        this.enemies = zone.spawnEnemies().map((e, i) => ({
            ...e,
            id: i,
            alive: true,
            attackTimer: 0,
            hitFlash: 0,
            moveTimer: Math.random() * this.ENEMY_MOVE_RATE,
            pixelX: e.x * TILE_SIZE + TILE_SIZE / 2,
            pixelY: e.y * TILE_SIZE + TILE_SIZE / 2,
        }));
    },

    getEnemyNear(tileX, tileY, range = 2) {
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            const dx = Math.abs(enemy.x - tileX);
            const dy = Math.abs(enemy.y - tileY);
            if (dx <= range && dy <= range) {
                return enemy;
            }
        }
        return null;
    },

    startCombat(enemy) {
        this.active = true;
        this.currentEnemy = enemy;
        this.playerAttackCooldown = 0;
        this.enemyAttackCooldown = 0;
    },

    endCombat() {
        this.active = false;
        this.currentEnemy = null;
    },

    playerAttack() {
        if (!this.active || !this.currentEnemy || this.playerAttackCooldown > 0) return null;
        
        const damage = Player.attackPower + (Player.hasPet ? Player.petPower : 0);
        this.currentEnemy.hp -= damage;
        this.currentEnemy.hitFlash = 0.2;
        this.playerAttackCooldown = this.PLAYER_ATTACK_RATE;
        
        if (this.currentEnemy.hp <= 0) {
            const enemy = this.currentEnemy;
            this.currentEnemy.alive = false;
            const rewards = this.getKillRewards(this.currentEnemy);
            this.endCombat();
            return { type: 'kill', rewards, damage, enemy };
        }
        
        return { type: 'hit', damage };
    },

    update(dt) {
        if (!this.active || !this.currentEnemy) return null;
        
        // Cooldowns
        if (this.playerAttackCooldown > 0) {
            this.playerAttackCooldown -= dt;
        }
        
        // Enemy attacks
        this.enemyAttackCooldown -= dt;
        if (this.enemyAttackCooldown <= 0) {
            this.enemyAttackCooldown = this.ENEMY_ATTACK_RATE;
            const enemyX = this.currentEnemy.pixelX || (this.currentEnemy.x * TILE_SIZE + TILE_SIZE / 2);
            const enemyY = this.currentEnemy.pixelY || (this.currentEnemy.y * TILE_SIZE + TILE_SIZE / 2);
            // Cap damage: max 8 per hit, never more than 10% of player maxHP
            const rawDmg = this.currentEnemy.damage;
            const maxDmg = Math.min(rawDmg, 8, Math.ceil(Player.maxHP * 0.1));
            const finalDmg = Math.max(1, maxDmg);
            const dead = Player.takeDamage(finalDmg);
            if (dead) {
                return { type: 'player_dead', damage: finalDmg, enemyX, enemyY };
            }
            return { type: 'enemy_attack', damage: finalDmg, enemyX, enemyY };
        }
        
        // Hit flash
        if (this.currentEnemy.hitFlash > 0) {
            this.currentEnemy.hitFlash -= dt;
        }
        
        return null;
    },

    updateEnemyMovement(dt) {
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            if (enemy.isBoss) continue; // Boss doesn't wander
            
            enemy.moveTimer -= dt;
            if (enemy.moveTimer <= 0) {
                enemy.moveTimer = this.ENEMY_MOVE_RATE + Math.random() * 0.5;
                
                // Move toward player if close, else random
                const distToPlayer = Math.abs(enemy.x - Player.tileX) + Math.abs(enemy.y - Player.tileY);
                let dx = 0, dy = 0;
                
                if (distToPlayer <= 3) {
                    // Chase player (reduced range from 5 to 3)
                    dx = Math.sign(Player.tileX - enemy.x);
                    dy = Math.sign(Player.tileY - enemy.y);
                    // Pick one direction
                    if (Math.random() > 0.5) dx = 0;
                    else dy = 0;
                } else {
                    // Random walk
                    const dir = Math.floor(Math.random() * 4);
                    if (dir === 0) dx = 1;
                    else if (dir === 1) dx = -1;
                    else if (dir === 2) dy = 1;
                    else dy = -1;
                }
                
                const newX = enemy.x + dx;
                const newY = enemy.y + dy;
                
                if (World.isWalkable(newX, newY)) {
                    enemy.x = newX;
                    enemy.y = newY;
                    enemy.pixelX = newX * TILE_SIZE + TILE_SIZE / 2;
                    enemy.pixelY = newY * TILE_SIZE + TILE_SIZE / 2;
                }
            }
        }
    },

    getKillRewards(enemy) {
        const rewards = { coins: 0, clay: 0, message: '' };
        
        switch (enemy.type) {
            case 'slime':
                rewards.coins = 3 + Math.floor(Math.random() * 5);
                rewards.clay = 2 + Math.floor(Math.random() * 3);
                rewards.message = `击败史莱姆！+${rewards.coins}金币 +${rewards.clay}mm`;
                break;
            case 'fungi':
                rewards.coins = 2;
                rewards.clay = 1;
                Player.fungiDefeated++;
                rewards.message = `击败小菌！(${Player.fungiDefeated}/30) +${rewards.coins}金币`;
                
                if (Player.fungiDefeated >= 30 && !Player.hasGiantClay) {
                    rewards.giantClay = true;
                    rewards.message = '🎉 击败30只小菌！获得【巨型粘土】！体型 +10米！！！';
                    Player.hasGiantClay = true;
                    Player.grow(10000);
                    Player.fungiChallengeActive = false;
                    Player.fungiChallengeComplete = true;
                }
                break;
            case 'boss':
                rewards.message = '🎉🎉🎉 击败了山林巨兽！！！快去救你的朋友！';
                Player.bossDefeated = true;
                break;
        }
        
        Player.coins += rewards.coins;
        Player.grow(rewards.clay);
        
        return rewards;
    },

    spawnFungiWave() {
        if (Player.fungiDefeated >= 30) return;
        
        const remaining = 30 - Player.fungiDefeated;
        const waveSize = Math.min(5, remaining);
        
        for (let i = 0; i < waveSize; i++) {
            const x = 4 + Math.floor(Math.random() * 17);
            const y = 3 + Math.floor(Math.random() * 14);
            // Level scales with progress: 1-2 early, 2-3 late
            const level = Math.min(3, 1 + Math.floor(Player.fungiDefeated / 12));
            this.enemies.push({
                type: 'fungi',
                x: x,
                y: y,
                hp: 6 + level * 2,
                maxHp: 6 + level * 2,
                damage: level,
                level: level,
                id: this.enemies.length,
                alive: true,
                attackTimer: 0,
                hitFlash: 0,
                moveTimer: Math.random() * this.ENEMY_MOVE_RATE,
                pixelX: x * TILE_SIZE + TILE_SIZE / 2,
                pixelY: y * TILE_SIZE + TILE_SIZE / 2,
            });
        }
    },

    needsNewWave() {
        if (!Player.fungiChallengeActive) return false;
        if (Player.fungiDefeated >= 30) return false;
        const aliveFungi = this.enemies.filter(e => e.type === 'fungi' && e.alive);
        return aliveFungi.length === 0;
    }
};

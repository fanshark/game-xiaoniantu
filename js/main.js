// main.js - Main game loop and state management
const Game = {
    state: 'intro', // intro, playing, dialogue, shop, combat, gameover
    canvas: null,
    ctx: null,
    lastTime: 0,
    gameTime: 0,
    keys: {},
    moveTimer: 0,
    MOVE_DELAY: 0.08, // seconds between moves (fast)
    combatGrace: 0, // invincibility after combat ends (seconds)
    camera: { x: 0, y: 0 },
    saveKey: 'xiaoniantu_save',
    
    // Visual effects
    effects: [],
    screenFlash: 0,
    screenFlashColor: '#ff0000',

    init() {
        // Setup game canvas
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1200;
        this.canvas.height = 900;

        // Setup audio
        Audio.init();

        // Preload speech synthesis voices
        if (window.speechSynthesis) {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
        }

        // Setup intro
        Animation.init();
        // Start intro music
        Audio.resume();
        Audio.startIntroMusic();

        // Setup input
        this.setupInput();
        UI.setupDialogueInput();

        // Setup buttons
        document.getElementById('skip-intro').onclick = () => {
            Animation.skip();
            this.startGame();
        };

        document.getElementById('shop-close').onclick = () => {
            Shop.closeShop();
        };

        document.getElementById('gameover-restart').onclick = () => {
            this.resetGame();
        };

        // Try to load save
        this.checkSave();

        // Start game loop
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
    },

    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;

            // Skip intro on any key during title phase
            if (this.state === 'intro' && Animation.phase >= Animation.phases.length - 1) {
                Animation.skip();
                this.startGame();
            }

            // Resume audio on first interaction
            if (typeof Audio !== 'undefined' && Audio.ctx) {
                Audio.resume();
                if (!Audio.musicPlaying && this.state === 'playing') {
                    Audio.startMusic();
                }
            }

            // Combat attack
            if (this.state === 'playing' && Combat.active && (e.key === ' ' || e.key === 'z' || e.key === 'Z')) {
                this.handleCombatAttack();
            }

            // Interact with NPC
            if (this.state === 'playing' && !Combat.active && (e.key === 'e' || e.key === 'E' || e.key === 'Enter')) {
                this.handleInteract();
            }

            // Help key
            if (e.key === 'h' || e.key === 'H') {
                if (this.state === 'playing' || this.state === 'dialogue') {
                    this.toggleHelp();
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    },

    checkSave() {
        try {
            const save = localStorage.getItem(this.saveKey);
            if (save) {
                const data = JSON.parse(save);
                // We have a save, will ask player if they want to continue
                this.hasSave = true;
                this.saveData = data;
            }
        } catch (e) {
            this.hasSave = false;
        }
    },

    saveGame() {
        try {
            const data = Player.serialize();
            localStorage.setItem(this.saveKey, JSON.stringify(data));
        } catch (e) {
            // Save failed, ignore
        }
    },

    loadGame() {
        if (this.saveData) {
            Player.deserialize(this.saveData);
            World.loadZone(this.saveData.currentZone || 'start');
            NPCSystem.loadNPCs(World.currentZone);
            Combat.loadEnemies(World.currentZone);
        }
    },

    resetGame() {
        localStorage.removeItem(this.saveKey);
        // Reset player
        Player.tileX = 4;
        Player.tileY = 10;
        Player.sizeMM = 5;
        Player.hp = 100;
        Player.maxHP = 100;
        Player.coins = 0;
        Player.hasPet = false;
        Player.petPower = 0;
        Player.attackPower = 5;
        Player.hasGiantClay = false;
        Player.fungiDefeated = 0;
        Player.fungiChallengeActive = false;
        Player.fungiChallengeComplete = false;
        Player.fungiChallengeTriggered = false;
        Player.bossDefeated = false;
        Player.friendRescued = false;
        Player.visitedZones = new Set(['start']);
        Player.moving = false;

        // Hide game over
        document.getElementById('gameover-screen').classList.remove('active');
        document.getElementById('gameover-screen').classList.add('hidden');

        this.startGame();
    },

    startGame() {
        // Stop intro music, start game music
        Audio.stopIntroMusic();

        // Hide intro, show game
        document.getElementById('intro-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');

        if (this.hasSave) {
            this.loadGame();
        } else {
            // New game
            World.loadZone('start');
            NPCSystem.loadNPCs('start');
            Combat.loadEnemies('start');
            Player.init();
        }

        this.state = 'playing';
        UI.updateHUD();
        UI.drawMinimap();
    },

    gameLoop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;
        this.gameTime += dt;

        this.update(dt);
        this.render();

        requestAnimationFrame((t) => this.gameLoop(t));
    },

    update(dt) {
        switch (this.state) {
            case 'intro':
                if (Animation.update(dt)) {
                    this.startGame();
                }
                break;

            case 'playing':
                this.updatePlaying(dt);
                break;

            case 'dialogue':
                // Game paused during dialogue, only update visuals
                Player.update(dt);
                World.updateWaterDrops(dt);
                break;
        }
    },

    updatePlaying(dt) {
        // Handle movement (block during shop/dialogue overlays)
        this.moveTimer -= dt;
        if (this.moveTimer <= 0 && !Combat.active && !Shop.isOpen) {
            let dx = 0, dy = 0;
            if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) dy = -1;
            else if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) dy = 1;
            else if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) dx = -1;
            else if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) dx = 1;

            if (dx !== 0 || dy !== 0) {
                const result = Player.tryMove(dx, dy);
                if (result) {
                    this.moveTimer = this.MOVE_DELAY;

                    if (result.type === 'portal') {
                        this.handlePortal(result.tileX, result.tileY);
                    } else if (result.type === 'move') {
                        this.handlePlayerMoved();
                    }
                }
            }
        }

        // Update player smooth movement
        Player.update(dt);

        // Update camera
        this.updateCamera();

        // Always update enemy movement
        Combat.updateEnemyMovement(dt);

        // Combat update
        if (Combat.active) {
            const combatResult = Combat.update(dt);
            if (combatResult) {
                this.handleCombatResult(combatResult);
            }
        }

        // Check for nearby enemies (with grace period after combat)
        if (!Combat.active) {
            if (this.combatGrace > 0) {
                this.combatGrace -= dt;
            } else {
                const enemy = Combat.getEnemyNear(Player.tileX, Player.tileY, 1);
                if (enemy) {
                    Combat.startCombat(enemy);
                    UI.showCombatHUD(enemy);
                }
            }
        }

        // Fungi wave spawning
        if (Player.fungiChallengeActive && Combat.needsNewWave()) {
            Combat.spawnFungiWave();
        }

        // Water drops in desert
        World.updateWaterDrops(dt);

        // Update visual effects
        this.updateEffects(dt);
        if (this.screenFlash > 0) this.screenFlash -= dt * 4;

        // Auto-save every 30 seconds
        if (Math.floor(this.gameTime) % 30 === 0 && Math.floor(this.gameTime) !== this.lastSaveTime) {
            this.lastSaveTime = Math.floor(this.gameTime);
            this.saveGame();
        }

        // Update HUD
        UI.updateHUD();
    },

    handlePlayerMoved() {
        const tileX = Player.tileX;
        const tileY = Player.tileY;

        // Collect items
        const itemIdx = World.getNearbyItem(tileX, tileY);
        if (itemIdx >= 0) {
            const item = World.items[itemIdx];
            World.items.splice(itemIdx, 1);
            if (item.type === 'clay') {
                Player.grow(1);
                Audio.playSFX('collect');
                UI.showNotification('+1mm 粘土！');
            } else if (item.type === 'coin') {
                Player.coins += 5;
                Audio.playSFX('coin');
                UI.showNotification('+5 金币！');
            } else if (item.type === 'weapon') {
                const weaponData = WEAPONS[item.weaponId];
                if (weaponData) {
                    const newWeapon = { ...weaponData, id: item.weaponId };
                    // Add to inventory
                    const alreadyHas = Player.weaponInventory.find(w => w.id === item.weaponId);
                    if (!alreadyHas) {
                        Player.weaponInventory.push(newWeapon);
                    }
                    // Auto-equip if better than current
                    if (!Player.weapon || newWeapon.attackBonus > Player.weapon.attackBonus) {
                        Player.equipWeapon(newWeapon);
                    }
                    Audio.playSFX('collect');
                    UI.showNotification(`⚔️ 获得【${weaponData.name}】！攻击力+${weaponData.attackBonus}（按H管理装备）`);
                    UI.updateHUD();
                }
            }
        }

        // Desert shrink
        if (World.isDesert()) {
            if (Shop.desertShield > 0) {
                Shop.desertShield--;
                UI.showNotification(`防沙护盾保护中... (${Shop.desertShield}步剩余)`);
            } else {
                const dead = Player.shrink(1);
                World.addWaterDrop(tileX * TILE_SIZE + TILE_SIZE / 2, tileY * TILE_SIZE + TILE_SIZE / 2);
                if (Player.sizeMM % 10 === 0) {
                    UI.showNotification(`💧 沙漠消耗！体型: ${Player.getSizeDisplay()}`);
                }
                if (dead) {
                    this.gameOver(false);
                }
            }
        }

        // Check special tiles
        const tile = World.getTile(tileX, tileY);
        if (tile === 'shop') {
            Shop.openRealShop();
        }

        // Danger house
        if (tile === 'house_danger') {
            const dialogue = NPCSystem.startDialogue('danger_house');
            if (dialogue) {
                this.state = 'dialogue';
                UI.showDialogue(dialogue, (result) => this.handleDialogueResult(result, 'danger_house'));
            }
        }

        // Fungi cave trigger
        if (World.currentZone === 'fungus_cave' && !Player.fungiChallengeActive && !Player.fungiChallengeComplete && !Player.fungiChallengeTriggered) {
            if (tileX > 5 && tileY > 5) {
                Player.fungiChallengeTriggered = true;
                const dialogue = NPCSystem.startDialogue('fungi_challenge');
                if (dialogue) {
                    this.state = 'dialogue';
                    UI.showDialogue(dialogue, (result) => this.handleDialogueResult(result, 'fungi_challenge'));
                }
            }
        }

        // Boss encounter
        if (World.currentZone === 'mountain' && !Player.bossDefeated) {
            const boss = Combat.enemies.find(e => e.type === 'boss' && e.alive);
            if (boss && Math.abs(boss.x - tileX) <= 3 && Math.abs(boss.y - tileY) <= 3) {
                if (Player.sizeMM < 15000) {
                    UI.showNotification('⚠️ 你还不够强大！需要15米才能挑战巨兽！');
                } else if (!Combat.active) {
                    const dialogue = NPCSystem.startDialogue('boss_encounter');
                    if (dialogue) {
                        this.state = 'dialogue';
                        UI.showDialogue(dialogue, (result) => this.handleDialogueResult(result, 'boss_encounter'));
                    }
                }
            }
        }

        // Minimap update
        UI.drawMinimap();
    },

    handlePortal(tileX, tileY) {
        const dest = World.getPortalDestination(tileX, tileY);
        if (!dest) return;

        // Check size requirement
        const destZone = ZONES[dest.zone];
        if (destZone && destZone.requireSize && Player.sizeMM < destZone.requireSize) {
            UI.showNotification(`⚠️ 需要体型达到 ${destZone.requireSize >= 1000 ? (destZone.requireSize/1000) + '米' : destZone.requireSize + 'mm'} 才能进入！`);
            // Move back
            Player.tileX -= (tileX - Player.tileX);
            Player.tileY -= (tileY - Player.tileY);
            Player.pixelX = Player.tileX * TILE_SIZE + TILE_SIZE / 2;
            Player.pixelY = Player.tileY * TILE_SIZE + TILE_SIZE / 2;
            return;
        }

        // Transition to new zone
        World.loadZone(dest.zone);
        NPCSystem.loadNPCs(dest.zone);
        Combat.loadEnemies(dest.zone);
        Player.tileX = dest.spawnX;
        Player.tileY = dest.spawnY;
        Player.pixelX = Player.tileX * TILE_SIZE + TILE_SIZE / 2;
        Player.pixelY = Player.tileY * TILE_SIZE + TILE_SIZE / 2;
        Player.targetX = Player.pixelX;
        Player.targetY = Player.pixelY;
        Player.moving = false;
        Player.visitedZones.add(dest.zone);

        UI.showZoneTransition(ZONES[dest.zone].name);
        Audio.playSFX('portal');
        UI.updateHUD();
        UI.drawMinimap();
        this.saveGame();
    },

    handleInteract() {
        const npc = NPCSystem.getNPCAt(Player.tileX, Player.tileY);
        if (npc) {
            const dialogue = NPCSystem.startDialogue(npc.dialogue);
            if (dialogue) {
                this.state = 'dialogue';
                UI.showDialogue(dialogue, (result) => this.handleDialogueResult(result, npc.dialogue));
            }
        }
    },

    handleDialogueResult(result, dialogueId) {
        if (result.type === 'choice') {
            const choice = result.choice;

            // Apply effect
            if (choice.effect) {
                NPCSystem.applyEffect(choice.effect);

                // Special effects
                if (choice.effect.combat) {
                    this.state = 'playing';
                    // Start combat with bad NPC
                    const fakeEnemy = {
                        type: 'slime', x: Player.tileX, y: Player.tileY + 1,
                        hp: 30, maxHp: 30, damage: 5, alive: true, id: 999, hitFlash: 0
                    };
                    Combat.enemies.push(fakeEnemy);
                    Combat.startCombat(fakeEnemy);
                    UI.showCombatHUD(fakeEnemy);
                    return;
                }

                if (choice.effect.startFungiChallenge) {
                    Player.fungiChallengeActive = true;
                    Combat.spawnFungiWave();
                    this.state = 'playing';
                    UI.showNotification('🍄 菌窟挑战开始！击败30只小菌！');
                    return;
                }

                if (choice.effect.startBoss) {
                    const boss = Combat.enemies.find(e => e.type === 'boss' && e.alive);
                    if (boss) {
                        Combat.startCombat(boss);
                        UI.showCombatHUD(boss);
                    }
                    this.state = 'playing';
                    return;
                }

                if (choice.effect.victory) {
                    this.gameOver(true);
                    return;
                }
            }

            // Continue to next dialogue
            if (choice.next) {
                const nextDialogue = NPCSystem.getDialogue(choice.next);
                if (nextDialogue) {
                    UI.showDialogue(nextDialogue, (r) => this.handleDialogueResult(r, choice.next));
                    return;
                }
            }
        } else if (result.type === 'text') {
            // Handle typed input
            const response = NPCSystem.processKeywordInput(result.text, dialogueId);
            if (response) {
                if (response.next) {
                    const nextDialogue = NPCSystem.getDialogue(response.next);
                    if (nextDialogue) {
                        UI.showDialogue(nextDialogue, (r) => this.handleDialogueResult(r, response.next));
                        return;
                    }
                }
                // Show response as a simple dialogue
                UI.showDialogue({
                    speaker: '回应',
                    text: response.text,
                    choices: [{ text: '（继续）', next: null }]
                }, (r) => {
                    if (response.effect) NPCSystem.applyEffect(response.effect);
                    this.state = 'playing';
                });
                return;
            }
        }

        // Return to playing
        this.state = 'playing';
        UI.updateHUD();
    },

    handleCombatAttack() {
        const result = Combat.playerAttack();
        if (!result) return;

        // Spawn pink attack wave effect
        const enemy = Combat.currentEnemy || result.enemy;
        if (enemy) {
            const ex = enemy.pixelX || (enemy.x * TILE_SIZE + TILE_SIZE / 2);
            const ey = enemy.pixelY || (enemy.y * TILE_SIZE + TILE_SIZE / 2);
            this.spawnAttackEffect(Player.pixelX, Player.pixelY, ex, ey, 'player_attack');
            this.spawnDamageNumber(ex, ey, result.damage || 0, false);
            Audio.playSFX('hit');
        }

        if (result.type === 'kill') {
            UI.hideCombatHUD();
            UI.showNotification(result.rewards.message);
            UI.updateHUD();
            this.combatGrace = 1.5; // 1.5s grace period after killing enemy

            // Check boss defeat
            if (Player.bossDefeated) {
                setTimeout(() => {
                    const dialogue = NPCSystem.startDialogue('victory');
                    if (dialogue) {
                        this.state = 'dialogue';
                        UI.showDialogue(dialogue, (r) => this.handleDialogueResult(r, 'victory'));
                    }
                }, 1000);
            }

            // Update fungi counter
            if (Player.fungiChallengeActive) {
                UI.updateFungiCount();
                if (Player.fungiDefeated >= 30) {
                    UI.showNotification('🎉 恭喜！获得巨型粘土！+10米！');
                }
            }
        } else if (result.type === 'hit') {
            UI.updateEnemyHP(Combat.currentEnemy);
        }
    },

    handleCombatResult(result) {
        if (result.type === 'player_dead') {
            // Final death hit effect
            Audio.playSFX('damage');
            this.spawnAttackEffect(
                result.enemyX || Player.pixelX, result.enemyY || Player.pixelY,
                Player.pixelX, Player.pixelY, 'enemy_attack'
            );
            this.spawnDamageNumber(Player.pixelX, Player.pixelY, result.damage || 0, true);
            Combat.endCombat();
            UI.hideCombatHUD();
            setTimeout(() => this.gameOver(false), 500);
        } else if (result.type === 'enemy_attack') {
            // Enemy hits player - red wave + damage sound
            Audio.playSFX('damage');
            this.spawnAttackEffect(
                result.enemyX || Player.pixelX, result.enemyY || Player.pixelY,
                Player.pixelX, Player.pixelY, 'enemy_attack'
            );
            this.spawnDamageNumber(Player.pixelX, Player.pixelY, result.damage, true);
            this.screenFlash = 1;
            this.screenFlashColor = '#ff0000';
            UI.updateHUD();
        }
    },

    updateCamera() {
        const zone = ZONES[World.currentZone];
        if (!zone) return;

        const targetCamX = Player.pixelX - this.canvas.width / 2;
        const targetCamY = Player.pixelY - this.canvas.height / 2;

        // Clamp camera
        const maxX = zone.width * TILE_SIZE - this.canvas.width;
        const maxY = zone.height * TILE_SIZE - this.canvas.height;

        this.camera.x += (targetCamX - this.camera.x) * 0.1;
        this.camera.y += (targetCamY - this.camera.y) * 0.1;

        this.camera.x = Math.max(0, Math.min(maxX, this.camera.x));
        this.camera.y = Math.max(0, Math.min(maxY, this.camera.y));
    },

    render() {
        switch (this.state) {
            case 'intro':
                Animation.render();
                break;

            case 'playing':
            case 'dialogue':
            case 'shop':
            case 'combat':
                this.renderGame();
                break;
        }
    },

    renderGame() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Clear
        ctx.fillStyle = ZONES[World.currentZone]?.bgColor || '#333';
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);

        // Draw tiles
        const startTileX = Math.floor(this.camera.x / TILE_SIZE);
        const startTileY = Math.floor(this.camera.y / TILE_SIZE);
        const endTileX = startTileX + Math.ceil(w / TILE_SIZE) + 1;
        const endTileY = startTileY + Math.ceil(h / TILE_SIZE) + 1;

        for (let y = startTileY; y <= endTileY; y++) {
            for (let x = startTileX; x <= endTileX; x++) {
                const tile = World.getTile(x, y);
                if (tile) {
                    Assets.drawTile(ctx, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, tile);
                }
            }
        }

        // Draw water drops (desert)
        World.waterDrops.forEach(drop => {
            Assets.drawWaterDrop(ctx, drop.x, drop.y, drop.alpha);
        });

        // Draw items
        World.items.forEach(item => {
            const ix = item.x * TILE_SIZE + TILE_SIZE / 2;
            const iy = item.y * TILE_SIZE + TILE_SIZE / 2;
            if (item.type === 'clay') {
                Assets.drawClayDrop(ctx, ix, iy, this.gameTime);
            } else if (item.type === 'coin') {
                Assets.drawCoin(ctx, ix, iy, this.gameTime);
            } else if (item.type === 'giant_clay') {
                Assets.drawGiantClay(ctx, ix, iy, this.gameTime);
            } else if (item.type === 'weapon') {
                this.drawWeaponItem(ctx, ix, iy, item.weaponId);
            }
        });

        // Draw NPCs
        NPCSystem.npcs.forEach(npc => {
            const nx = npc.x * TILE_SIZE + TILE_SIZE / 2;
            const ny = npc.y * TILE_SIZE + TILE_SIZE / 2;
            Assets.drawNPC(ctx, nx, ny, npc.type, this.gameTime);
        });

        // Draw enemies
        Combat.enemies.forEach(enemy => {
            if (!enemy.alive) return;
            const ex = enemy.pixelX || (enemy.x * TILE_SIZE + TILE_SIZE / 2);
            const ey = enemy.pixelY || (enemy.y * TILE_SIZE + TILE_SIZE / 2);

            if (enemy.hitFlash > 0) {
                ctx.globalAlpha = 0.5 + Math.sin(this.gameTime * 20) * 0.5;
            }
            Assets.drawEnemy(ctx, ex, ey, enemy.type, this.gameTime, enemy.hp, enemy.maxHp);
            ctx.globalAlpha = 1;

            // Draw power level above enemy head
            if (enemy.level) {
                const levelColors = ['', '#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#f44336'];
                const lvl = enemy.level;
                ctx.font = 'bold 11px Microsoft YaHei';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#000';
                ctx.fillText(`⚔${lvl}`, ex + 1, ey - 18 + 1);
                ctx.fillStyle = levelColors[lvl] || '#fff';
                ctx.fillText(`⚔${lvl}`, ex, ey - 18);
            }
        });

        // Draw player
        Assets.drawPlayer(ctx, Player.pixelX, Player.pixelY, Player.sizeMM, Player.stage);

        // Draw pet
        if (Player.hasPet) {
            const petOffsetX = Math.cos(this.gameTime * 2) * 20;
            const petOffsetY = Math.sin(this.gameTime * 2) * 15;
            Assets.drawPet(ctx, Player.pixelX + petOffsetX, Player.pixelY - 20 + petOffsetY, Player.petPower, this.gameTime);
        }

        // Draw attack/damage effects
        this.renderEffects(ctx);

        ctx.restore();

        // Draw interaction hint
        if (!Combat.active) {
            const npc = NPCSystem.getNPCAt(Player.tileX, Player.tileY);
            if (npc) {
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.fillRect(w/2 - 80, h - 40, 160, 30);
                ctx.fillStyle = '#ffb6c1';
                ctx.font = '13px Microsoft YaHei';
                ctx.textAlign = 'center';
                ctx.fillText('按 E 或 Enter 对话', w/2, h - 20);
            }
        }

        // Combat hint
        if (Combat.active) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(w/2 - 100, h - 40, 200, 30);
            ctx.fillStyle = '#ff6666';
            ctx.font = '13px Microsoft YaHei';
            ctx.textAlign = 'center';
            ctx.fillText('按 空格/Z 攻击！', w/2, h - 20);
        }

        // Screen damage flash
        if (this.screenFlash > 0) {
            ctx.globalAlpha = this.screenFlash * 0.3;
            ctx.fillStyle = this.screenFlashColor;
            ctx.fillRect(0, 0, w, h);
            ctx.globalAlpha = 1;
        }
    },

    // Draw weapon item on the map
    drawWeaponItem(ctx, x, y, weaponId) {
        const weapon = WEAPONS[weaponId];
        if (!weapon) return;
        const color = weapon.color;
        const t = this.gameTime;
        const bob = Math.sin(t * 3) * 2;
        const glow = 0.4 + Math.sin(t * 4) * 0.2;

        // Glow effect
        ctx.save();
        ctx.globalAlpha = glow;
        ctx.beginPath();
        ctx.arc(x, y + bob, 14, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();

        // Weapon shape based on type
        ctx.save();
        ctx.translate(x, y + bob);
        ctx.rotate(Math.sin(t * 2) * 0.15);

        if (weaponId === 'wooden_stick') {
            // Stick
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(-2, -12, 4, 24);
            ctx.fillStyle = '#A0522D';
            ctx.fillRect(-3, -12, 6, 4);
        } else if (weaponId === 'stone_hammer') {
            // Hammer handle + head
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(-2, -4, 4, 18);
            ctx.fillStyle = '#696969';
            ctx.fillRect(-7, -10, 14, 8);
            ctx.fillStyle = '#808080';
            ctx.fillRect(-6, -9, 12, 6);
        } else if (weaponId === 'iron_sword') {
            // Sword blade + guard + handle
            ctx.fillStyle = '#C0C0C0';
            ctx.fillRect(-2, -14, 4, 18);
            ctx.fillStyle = '#E8E8E8';
            ctx.fillRect(-1, -14, 2, 16);
            ctx.fillStyle = '#DAA520';
            ctx.fillRect(-5, 4, 10, 3);
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(-2, 7, 4, 6);
        } else if (weaponId === 'magic_staff') {
            // Staff with orb
            ctx.fillStyle = '#4B0082';
            ctx.fillRect(-2, -4, 4, 20);
            ctx.beginPath();
            ctx.arc(0, -8, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#9B59B6';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(-2, -10, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#E8DAEF';
            ctx.fill();
        } else if (weaponId === 'star_blade') {
            // Golden star blade
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(-2, -14, 4, 20);
            ctx.fillStyle = '#FFF8DC';
            ctx.fillRect(-1, -14, 2, 18);
            // Star guard
            ctx.beginPath();
            ctx.moveTo(0, 4);
            ctx.lineTo(-7, 8); ctx.lineTo(-3, 8);
            ctx.lineTo(0, 12); ctx.lineTo(3, 8);
            ctx.lineTo(7, 8); ctx.closePath();
            ctx.fillStyle = '#FFD700';
            ctx.fill();
            // Tip glow
            ctx.beginPath();
            ctx.arc(0, -14, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 215, 0, ${0.5 + Math.sin(t * 6) * 0.3})`;
            ctx.fill();
        }
        ctx.restore();

        // Weapon name label
        ctx.font = 'bold 9px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000';
        ctx.fillText(weapon.name, x + 1, y + 18 + bob + 1);
        ctx.fillStyle = color;
        ctx.fillText(weapon.name, x, y + 18 + bob);
    },

    // === Visual Effects System ===
    spawnAttackEffect(fromX, fromY, toX, toY, type) {
        // type: 'player_attack' (pink wave) or 'enemy_attack' (red wave)
        const color = type === 'player_attack' ? '#ff69b4' : '#ff3333';
        const color2 = type === 'player_attack' ? '#ffb6c1' : '#ff6666';
        
        // Expanding ring wave
        this.effects.push({
            type: 'wave',
            x: toX,
            y: toY,
            radius: 5,
            maxRadius: 40,
            alpha: 1,
            color: color,
            color2: color2,
            life: 0.4,
            maxLife: 0.4,
        });
        
        // Particles flying from attacker to target
        const dx = toX - fromX;
        const dy = toY - fromY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        for (let i = 0; i < 6; i++) {
            const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.8;
            const speed = 150 + Math.random() * 100;
            this.effects.push({
                type: 'particle',
                x: fromX,
                y: fromY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                color: color,
                size: 3 + Math.random() * 4,
                life: 0.3 + Math.random() * 0.2,
                maxLife: 0.5,
            });
        }
        
        // Impact flash at target
        this.effects.push({
            type: 'flash',
            x: toX,
            y: toY,
            alpha: 1,
            size: 20,
            color: color2,
            life: 0.2,
            maxLife: 0.2,
        });
    },

    spawnDamageNumber(x, y, damage, isPlayer) {
        this.effects.push({
            type: 'damage_number',
            x: x + (Math.random() - 0.5) * 10,
            y: y - 10,
            vy: -60,
            text: `-${damage}`,
            color: isPlayer ? '#ff3333' : '#ffff00',
            alpha: 1,
            life: 0.8,
            maxLife: 0.8,
        });
    },

    updateEffects(dt) {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const e = this.effects[i];
            e.life -= dt;
            if (e.life <= 0) {
                this.effects.splice(i, 1);
                continue;
            }
            
            const progress = 1 - (e.life / e.maxLife);
            e.alpha = e.life / e.maxLife;
            
            switch (e.type) {
                case 'wave':
                    e.radius = 5 + (e.maxRadius - 5) * progress;
                    break;
                case 'particle':
                    e.x += e.vx * dt;
                    e.y += e.vy * dt;
                    e.size *= 0.95;
                    break;
                case 'flash':
                    e.size = 20 * (1 + progress * 0.5);
                    break;
                case 'damage_number':
                    e.y += e.vy * dt;
                    e.vy += 30 * dt;
                    break;
            }
        }
    },

    renderEffects(ctx) {
        for (const e of this.effects) {
            ctx.globalAlpha = e.alpha;
            switch (e.type) {
                case 'wave':
                    // Double ring for extra oomph
                    ctx.beginPath();
                    ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
                    ctx.strokeStyle = e.color;
                    ctx.lineWidth = 3;
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(e.x, e.y, e.radius * 0.6, 0, Math.PI * 2);
                    ctx.strokeStyle = e.color2;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    break;
                case 'particle':
                    ctx.beginPath();
                    ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
                    ctx.fillStyle = e.color;
                    ctx.fill();
                    break;
                case 'flash':
                    const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size);
                    grad.addColorStop(0, e.color);
                    grad.addColorStop(1, 'transparent');
                    ctx.beginPath();
                    ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
                    ctx.fillStyle = grad;
                    ctx.fill();
                    break;
                case 'damage_number':
                    ctx.font = 'bold 14px Microsoft YaHei';
                    ctx.textAlign = 'center';
                    ctx.fillStyle = e.color;
                    ctx.fillText(e.text, e.x, e.y);
                    // Outline for readability
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 1;
                    ctx.strokeText(e.text, e.x, e.y);
                    break;
            }
        }
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1;
    },

    gameOver(victory) {
        this.state = 'gameover';
        if (victory) {
            Audio.playSFX('victory');
            this.saveGame();
        } else {
            localStorage.removeItem(this.saveKey);
        }
        UI.showGameOver(victory);
    },

    helpVisible: false,
    childrenMode: false,
    hoverReadTimer: null,
    hoverTarget: null,

    toggleHelp() {
        this.helpVisible = !this.helpVisible;
        if (this.helpVisible) {
            UI.showHelp(this.getProgressHint(), this.childrenMode);
        } else {
            UI.hideHelp();
        }
    },

    toggleChildrenMode() {
        this.childrenMode = !this.childrenMode;
        if (this.childrenMode) {
            this.setupHoverRead();
            UI.showNotification('🧒 儿童模式已开启！鼠标悬停文字2秒后会朗读');
        } else {
            this.removeHoverRead();
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            UI.showNotification('儿童模式已关闭');
        }
        // Refresh help overlay if visible
        if (this.helpVisible) {
            UI.showHelp(this.getProgressHint(), this.childrenMode);
        }
    },

    setupHoverRead() {
        // Add hover listeners to the game container
        const container = document.getElementById('game-container') || document.body;
        container.addEventListener('mouseover', this._hoverReadHandler = (e) => {
            if (!this.childrenMode) return;
            const target = e.target;
            if (!target || !target.textContent || target.textContent.trim().length < 2) return;
            // Only read text elements (not the whole container)
            if (target.tagName === 'DIV' && target.children.length > 3) return;
            
            this.hoverTarget = target;
            clearTimeout(this.hoverReadTimer);
            this.hoverReadTimer = setTimeout(() => {
                if (this.hoverTarget === target && this.childrenMode) {
                    this.speakText(target.textContent.trim());
                }
            }, 2000);
        });
        container.addEventListener('mouseout', this._hoverOutHandler = (e) => {
            clearTimeout(this.hoverReadTimer);
            this.hoverTarget = null;
        });
    },

    removeHoverRead() {
        const container = document.getElementById('game-container') || document.body;
        if (this._hoverReadHandler) {
            container.removeEventListener('mouseover', this._hoverReadHandler);
            container.removeEventListener('mouseout', this._hoverOutHandler);
        }
        clearTimeout(this.hoverReadTimer);
    },

    speakText(text) {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        
        // Limit text length
        const readText = text.length > 100 ? text.substring(0, 100) + '...' : text;
        
        const utterance = new SpeechSynthesisUtterance(readText);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8;    // Natural speaking pace, not too fast
        utterance.pitch = 1.2;   // Slightly higher, warm & gentle like 温柔桃子
        utterance.volume = 0.85; // Soft and comfortable
        
        // Find the best Chinese female voice (closest to 温柔桃子 feel)
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = 
            // macOS: prefer "Ting-Ting" which is soft and natural
            voices.find(v => v.name.includes('Ting-Ting')) ||
            // Other soft Chinese voices
            voices.find(v => v.lang === 'zh-CN' && /ting|xiao|mei|liang|female/i.test(v.name)) ||
            voices.find(v => v.lang === 'zh-CN') ||
            voices.find(v => v.lang.startsWith('zh')) ||
            null;
        if (preferredVoice) utterance.voice = preferredVoice;
        
        window.speechSynthesis.speak(utterance);
    },

    // === Save Slot System (10 slots) ===
    SAVE_SLOTS_KEY: 'xiaoniantu_slots',
    MAX_SLOTS: 10,

    getSaveSlots() {
        try {
            const data = localStorage.getItem(this.SAVE_SLOTS_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    },

    saveToSlot(slotId) {
        const slots = this.getSaveSlots();
        const data = Player.serialize();
        data.savedAt = new Date().toLocaleString('zh-CN');
        data.slotName = `存档 ${slotId}`;
        slots[slotId] = data;
        try {
            localStorage.setItem(this.SAVE_SLOTS_KEY, JSON.stringify(slots));
            UI.showNotification(`💾 已保存到存档 ${slotId}！`);
            Audio.playSFX('collect');
        } catch (e) {
            UI.showNotification('❌ 保存失败！');
        }
        // Refresh help if open
        if (this.helpVisible) {
            UI.showHelp(this.getProgressHint(), this.childrenMode);
        }
    },

    loadFromSlot(slotId) {
        const slots = this.getSaveSlots();
        const data = slots[slotId];
        if (!data) {
            UI.showNotification('❌ 该存档为空！');
            return;
        }
        Player.deserialize(data);
        World.loadZone(data.currentZone || 'start');
        NPCSystem.loadNPCs(World.currentZone);
        Combat.loadEnemies(World.currentZone);
        Player.updateStage();
        this.updateCamera();
        UI.updateHUD();
        UI.showNotification(`📂 已读取存档 ${slotId}！`);
        Audio.playSFX('portal');
        // Close help
        this.helpVisible = false;
        UI.hideHelp();
    },

    deleteSlot(slotId) {
        const slots = this.getSaveSlots();
        if (!slots[slotId]) return;
        delete slots[slotId];
        try {
            localStorage.setItem(this.SAVE_SLOTS_KEY, JSON.stringify(slots));
            UI.showNotification(`🗑️ 存档 ${slotId} 已删除`);
        } catch (e) {}
        // Refresh help
        if (this.helpVisible) {
            UI.showHelp(this.getProgressHint(), this.childrenMode);
        }
    },

    getProgressHint() {
        const size = Player.sizeMM;
        const zone = World.currentZone;
        let hint = '';

        if (size < 50) {
            hint = '💡 当前目标：在草原收集粘土球成长！每个+1mm。往右走去草原探索。';
        } else if (size < 200 && !Player.hasPet) {
            hint = '💡 去海边沙滩找到金色NPC获得宠物伙伴！往草原东边走。';
        } else if (size < 200) {
            hint = '💡 继续收集粘土成长，准备好再去沙漠。建议体型200mm以上再去南边沙漠。';
        } else if (zone !== 'fungus_cave' && !Player.fungiChallengeComplete && size < 5000) {
            hint = '💡 穿过沙漠去菌窟！击败30只小菌可获得巨型粘土(+10米)。沙漠每步-1mm，做好准备！';
        } else if (Player.fungiChallengeActive) {
            hint = `💡 菌窟挑战中！已击败 ${Player.fungiDefeated}/30 只小菌。继续战斗！`;
        } else if (Player.hasGiantClay && size < 15000) {
            hint = '💡 已获得巨型粘土！继续收集粘土达到15米，然后去山林挑战终极Boss！';
        } else if (size >= 15000 && !Player.bossDefeated) {
            hint = '💡 你已经15米了！去山林终极区挑战大怪兽，救出你的好朋友！';
        } else if (Player.bossDefeated) {
            hint = '💡 你打败了怪兽！找到好朋友完成救援！';
        } else {
            hint = '💡 探索地图，收集粘土成长，对话NPC获取线索。目标：15米打败Boss！';
        }

        return hint;
    }
};

// Start the game when page loads
window.addEventListener('load', () => {
    Game.init();
});

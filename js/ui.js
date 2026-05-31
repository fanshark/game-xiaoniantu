// ui.js - UI management, HUD, dialogue, notifications
const UI = {
    notifications: [],
    dialogueCallback: null,

    updateHUD() {
        document.getElementById('size-display').textContent = Player.getSizeDisplay();
        document.getElementById('coins-display').textContent = Player.coins;
        document.getElementById('hp-display').textContent = `${Player.hp}/${Player.maxHP}`;
        document.getElementById('pet-display').textContent = Player.hasPet ? 
            `⭐ 战力 ${Player.petPower}` : '无';
        document.getElementById('weapon-display').textContent = Player.weapon ? 
            `⚔️ ${Player.weapon.name} (+${Player.weapon.attackBonus})` : '无';
        document.getElementById('zone-display').textContent = 
            ZONES[World.currentZone]?.name || '';
    },

    showNotification(text) {
        const container = document.getElementById('game-screen');
        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.textContent = text;
        container.appendChild(notif);
        
        setTimeout(() => {
            if (notif.parentNode) {
                notif.parentNode.removeChild(notif);
            }
        }, 2200);
    },

    showZoneTransition(zoneName) {
        const container = document.getElementById('game-screen');
        const transition = document.createElement('div');
        transition.className = 'zone-transition';
        transition.textContent = zoneName;
        container.appendChild(transition);
        
        setTimeout(() => {
            if (transition.parentNode) {
                transition.parentNode.removeChild(transition);
            }
        }, 1600);
    },

    // Dialogue system
    showDialogue(dialogue, callback) {
        const overlay = document.getElementById('dialogue-overlay');
        const speaker = document.getElementById('dialogue-speaker');
        const text = document.getElementById('dialogue-text');
        const choices = document.getElementById('dialogue-choices');
        const inputArea = document.getElementById('dialogue-input-area');
        
        overlay.classList.remove('hidden');
        speaker.textContent = dialogue.speaker;
        text.textContent = dialogue.text;
        choices.innerHTML = '';
        this.dialogueCallback = callback;
        
        // Render choices
        if (dialogue.choices) {
            dialogue.choices.forEach((choice, i) => {
                const btn = document.createElement('button');
                btn.textContent = choice.text;
                btn.onclick = () => {
                    this.hideDialogue();
                    if (callback) callback({ type: 'choice', index: i, choice });
                };
                choices.appendChild(btn);
            });
        }
        
        // Show typing input if allowed
        if (dialogue.allowTyping) {
            inputArea.classList.remove('hidden');
            const input = document.getElementById('dialogue-input');
            input.value = '';
            input.focus();
        } else {
            inputArea.classList.add('hidden');
        }
    },

    hideDialogue() {
        document.getElementById('dialogue-overlay').classList.add('hidden');
        document.getElementById('dialogue-input-area').classList.add('hidden');
        this.dialogueCallback = null;
    },

    setupDialogueInput() {
        const input = document.getElementById('dialogue-input');
        const sendBtn = document.getElementById('dialogue-send');
        
        const sendMessage = () => {
            const text = input.value.trim();
            if (!text) return;
            input.value = '';
            
            if (this.dialogueCallback) {
                this.dialogueCallback({ type: 'text', text });
            }
        };
        
        sendBtn.onclick = sendMessage;
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        };
    },

    // Combat UI
    showCombatHUD(enemy) {
        const overlay = document.getElementById('combat-overlay');
        overlay.classList.remove('hidden');
        document.getElementById('enemy-name').textContent = 
            enemy.type === 'boss' ? '🔥 山林巨兽' :
            enemy.type === 'fungi' ? '🍄 小菌' : '👾 史莱姆';
        this.updateEnemyHP(enemy);
        
        // Show fungi counter if in cave
        const counter = document.getElementById('combat-counter');
        if (Player.fungiChallengeActive) {
            counter.classList.remove('hidden');
            document.getElementById('fungi-count').textContent = Player.fungiDefeated;
        } else {
            counter.classList.add('hidden');
        }
    },

    updateEnemyHP(enemy) {
        const fill = document.getElementById('enemy-hp-fill');
        fill.style.width = `${(enemy.hp / enemy.maxHp) * 100}%`;
    },

    hideCombatHUD() {
        document.getElementById('combat-overlay').classList.add('hidden');
    },

    updateFungiCount() {
        document.getElementById('fungi-count').textContent = Player.fungiDefeated;
    },

    // Help overlay
    showHelp(progressHint, childrenMode) {
        let helpDiv = document.getElementById('help-overlay');
        if (!helpDiv) {
            helpDiv = document.createElement('div');
            helpDiv.id = 'help-overlay';
            helpDiv.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:200;display:flex;justify-content:center;align-items:center;color:#fff;overflow-y:auto;';
            document.getElementById('game-screen').appendChild(helpDiv);
        }
        helpDiv.style.display = 'flex';
        const childBtnStyle = childrenMode 
            ? 'background:#ff69b4;color:#fff;border:2px solid #fff;' 
            : 'background:rgba(255,105,180,0.2);color:#ffb6c1;border:2px solid #ffb6c1;';
        const childBtnText = childrenMode ? '🧒 儿童模式：已开启 ✓' : '🧒 儿童模式：已关闭';
        
        // Build save slots HTML
        const slots = Game.getSaveSlots();
        let slotsHTML = '';
        for (let i = 1; i <= 10; i++) {
            const slot = slots[i];
            if (slot) {
                const zoneName = ZONES[slot.currentZone]?.name || slot.currentZone;
                const sizeDisplay = slot.sizeMM >= 1000 ? (slot.sizeMM / 1000).toFixed(1) + '米' : slot.sizeMM + 'mm';
                slotsHTML += `<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 8px;margin:2px 0;background:rgba(255,182,193,0.1);border-radius:6px;">
                    <span style="font-size:12px;color:#eee;">📁 ${i}. ${zoneName} | ${sizeDisplay} | ${slot.savedAt || ''}</span>
                    <span>
                        <button class="slot-save-btn" data-slot="${i}" style="background:#FF9800;color:#fff;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:11px;">覆盖</button>
                        <button class="slot-load-btn" data-slot="${i}" style="background:#4CAF50;color:#fff;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:11px;margin-left:2px;">读取</button>
                        <button class="slot-del-btn" data-slot="${i}" style="background:#f44336;color:#fff;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:11px;margin-left:2px;">删除</button>
                    </span>
                </div>`;
            } else {
                slotsHTML += `<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 8px;margin:2px 0;background:rgba(100,100,100,0.1);border-radius:6px;">
                    <span style="font-size:12px;color:#666;">💿 ${i}. (空)</span>
                    <button class="slot-save-btn" data-slot="${i}" style="background:#2196F3;color:#fff;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:11px;">保存</button>
                </div>`;
            }
        }

        helpDiv.innerHTML = `
            <div style="max-width:620px;max-height:90vh;overflow-y:auto;padding:25px;background:rgba(30,30,50,0.95);border:2px solid #ffb6c1;border-radius:12px;">
                <h2 style="color:#ffb6c1;text-align:center;margin-bottom:12px;">📖 帮助 / Help</h2>
                <div style="margin-bottom:12px;padding:8px;background:rgba(255,182,193,0.1);border-radius:8px;">
                    <p style="color:#ffd700;font-weight:bold;margin-bottom:4px;">🎯 当前进度提示：</p>
                    <p style="color:#eee;font-size:13px;">${progressHint}</p>
                </div>
                <div style="display:flex;gap:20px;">
                    <div style="flex:1;">
                        <h3 style="color:#ffb6c1;margin-bottom:6px;font-size:13px;">⌨️ 操作：</h3>
                        <table style="width:100%;font-size:12px;line-height:1.8;">
                            <tr><td style="color:#ffd700;">方向键/WASD</td><td>移动</td></tr>
                            <tr><td style="color:#ffd700;">E / Enter</td><td>对话/进入</td></tr>
                            <tr><td style="color:#ffd700;">空格 / Z</td><td>攻击</td></tr>
                            <tr><td style="color:#ffd700;">H</td><td>帮助</td></tr>
                        </table>
                    </div>
                    <div style="flex:1;">
                        <h3 style="color:#ffb6c1;margin-bottom:6px;font-size:13px;">📊 状态：</h3>
                        <table style="width:100%;font-size:12px;line-height:1.8;">
                            <tr><td>体型：</td><td style="color:#ff69b4;">${Player.getSizeDisplay()}</td></tr>
                            <tr><td>金币：</td><td style="color:#ffd700;">${Player.coins}</td></tr>
                            <tr><td>宠物：</td><td>${Player.hasPet ? '⭐' + Player.petPower : '❌'}</td></tr>
                            <tr><td>区域：</td><td>${ZONES[World.currentZone]?.name || ''}</td></tr>
                        </table>
                    </div>
                </div>
                <h3 style="color:#ffb6c1;margin:12px 0 6px;font-size:13px;">💾 存档管理 (${Object.keys(slots).length}/10)：</h3>
                <div id="save-slots-container" style="max-height:200px;overflow-y:auto;border:1px solid rgba(255,182,193,0.3);border-radius:8px;padding:6px;">
                    ${slotsHTML}
                </div>
                <div style="text-align:center;margin-top:12px;">
                    <button id="children-mode-btn" style="${childBtnStyle}padding:6px 16px;border-radius:20px;font-size:13px;cursor:pointer;font-weight:bold;">${childBtnText}</button>
                </div>
                <p style="text-align:center;margin-top:6px;color:#aaa;font-size:10px;">${childrenMode ? '🔊 鼠标悬停文字2秒后自动朗读' : '开启儿童模式后悬停文字会朗读'}</p>
                <p style="text-align:center;margin-top:8px;color:#888;font-size:11px;">按 H 关闭</p>
            </div>
        `;
        // Attach button handlers
        const btn = document.getElementById('children-mode-btn');
        if (btn) btn.onclick = () => Game.toggleChildrenMode();
        
        // Save slot buttons
        document.querySelectorAll('.slot-save-btn').forEach(b => {
            b.onclick = () => {
                const slot = parseInt(b.dataset.slot);
                const slots = Game.getSaveSlots();
                if (slots[slot]) {
                    if (confirm('此存档位已有数据，确定覆盖保存吗？')) {
                        Game.saveToSlot(slot);
                    }
                } else {
                    Game.saveToSlot(slot);
                }
            };
        });
        document.querySelectorAll('.slot-load-btn').forEach(b => {
            b.onclick = () => {
                if (confirm('确定要读取此存档吗？当前未保存的进度将丢失。')) {
                    Game.loadFromSlot(parseInt(b.dataset.slot));
                }
            };
        });
        document.querySelectorAll('.slot-del-btn').forEach(b => {
            b.onclick = () => {
                if (confirm('确定删除此存档？删除后不可恢复！')) {
                    Game.deleteSlot(parseInt(b.dataset.slot));
                }
            };
        });
    },

    hideHelp() {
        const helpDiv = document.getElementById('help-overlay');
        if (helpDiv) helpDiv.style.display = 'none';
    },

    // Game over screen
    showGameOver(victory) {
        const screen = document.getElementById('gameover-screen');
        const title = document.getElementById('gameover-title');
        const text = document.getElementById('gameover-text');
        
        screen.classList.remove('hidden');
        screen.classList.add('active');
        
        if (victory) {
            title.textContent = '🎉 通关成功！';
            title.style.color = '#ffd700';
            text.textContent = `恭喜！你成功从${Player.getSizeDisplay()}的小粘土成长为巨人，打败了山林巨兽，救出了你最好的朋友！\n冒险总用时：精彩的旅程！`;
        } else {
            title.textContent = '💀 冒险失败...';
            title.style.color = '#ff4444';
            text.textContent = '小粘土的力量被消耗殆尽了...但不要放弃！重新开始，这次一定能成功！';
        }
    },

    // Minimap
    drawMinimap() {
        const canvas = document.getElementById('minimap-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 150;
        canvas.height = 120;
        
        const zone = ZONES[World.currentZone];
        if (!zone || !World.currentMap) return;
        
        const tileW = canvas.width / zone.width;
        const tileH = canvas.height / zone.height;
        
        // Draw tiles
        for (let y = 0; y < zone.height; y++) {
            for (let x = 0; x < zone.width; x++) {
                const tile = World.currentMap[y][x];
                let color;
                switch(tile) {
                    case 'grass': color = '#4caf50'; break;
                    case 'sand': color = '#f4d03f'; break;
                    case 'water': color = '#42a5f5'; break;
                    case 'path': color = '#a0855b'; break;
                    case 'cave': color = '#37474f'; break;
                    case 'mountain': color = '#455a64'; break;
                    case 'wall': color = '#5d4037'; break;
                    case 'tree': color = '#2e7d32'; break;
                    case 'portal': color = '#64b5f6'; break;
                    case 'entrance': color = '#8d6e63'; break;
                    case 'shop': color = '#ffd700'; break;
                    case 'house_danger': color = '#9c27b0'; break;
                    default: color = '#333';
                }
                ctx.fillStyle = color;
                ctx.fillRect(x * tileW, y * tileH, tileW, tileH);
            }
        }
        
        // Draw player position
        ctx.fillStyle = '#ff69b4';
        ctx.beginPath();
        ctx.arc(Player.tileX * tileW + tileW/2, Player.tileY * tileH + tileH/2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw NPCs
        NPCSystem.npcs.forEach(npc => {
            ctx.fillStyle = npc.type === 'bad' ? '#ff4444' : '#4fc3f7';
            ctx.fillRect(npc.x * tileW, npc.y * tileH, tileW, tileH);
        });
        
        // Draw enemies
        Combat.enemies.forEach(enemy => {
            if (!enemy.alive) return;
            ctx.fillStyle = '#9c27b0';
            ctx.fillRect(enemy.x * tileW, enemy.y * tileH, tileW, tileH);
        });
    }
};

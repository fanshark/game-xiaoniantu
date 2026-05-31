// shop.js - Real and fake shop systems
const Shop = {
    isOpen: false,
    isFake: false,

    realShopItems: [
        { id: 'food1', name: '粘土面包', price: 10, desc: '恢复 30 HP', effect: { hp: 30 } },
        { id: 'food2', name: '能量果汁', price: 20, desc: '恢复 60 HP', effect: { hp: 60 } },
        { id: 'clay1', name: '浓缩粘土', price: 15, desc: '体型 +20mm', effect: { size: 20 } },
        { id: 'clay2', name: '高级粘土块', price: 30, desc: '体型 +50mm', effect: { size: 50 } },
        { id: 'shield', name: '防沙护盾', price: 25, desc: '进入沙漠前5步不减体型', effect: { desertShield: 5 } },
        { id: 'petfood', name: '星星零食', price: 40, desc: '宠物战力 +5', effect: { petPower: 5 } },
    ],

    fakeShopItems: [
        { id: 'fake1', name: '超级粘土（假）', price: 30, desc: '看起来很划算...', effect: { size: -30, coins: -10 } },
        { id: 'fake2', name: '神秘药水（假）', price: 20, desc: '闻起来怪怪的...', effect: { hp: -20 } },
        { id: 'fake3', name: '黄金护符（假）', price: 50, desc: '闪闪发光！', effect: { coins: -30 } },
    ],

    desertShield: 0, // steps protected in desert

    openRealShop() {
        this.isOpen = true;
        this.isFake = false;
        this.renderShop();
    },

    openFakeShop() {
        this.isOpen = true;
        this.isFake = true;
        this.renderShop();
    },

    renderShop() {
        const overlay = document.getElementById('shop-overlay');
        const title = document.getElementById('shop-title');
        const itemsDiv = document.getElementById('shop-items');
        
        overlay.classList.remove('hidden');
        
        if (this.isFake) {
            title.textContent = '🏪 超值好店（？）';
            title.style.color = '#ff6666';
        } else {
            title.textContent = '🏪 粘土补给商店';
            title.style.color = '#ffd700';
        }
        
        const items = this.isFake ? this.fakeShopItems : this.realShopItems;
        itemsDiv.innerHTML = '';
        
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'shop-item';
            div.innerHTML = `
                <div class="item-name">${item.name}</div>
                <div class="item-price">💰 ${item.price} 金币</div>
                <div class="item-desc">${item.desc}</div>
            `;
            div.onclick = () => this.buyItem(item);
            itemsDiv.appendChild(div);
        });
    },

    buyItem(item) {
        if (Player.coins < item.price) {
            UI.showNotification('金币不够！');
            return;
        }
        
        Player.coins -= item.price;
        
        if (item.effect.hp) {
            if (item.effect.hp > 0) {
                Player.heal(item.effect.hp);
            } else {
                Player.takeDamage(-item.effect.hp);
            }
        }
        if (item.effect.size) {
            Player.grow(item.effect.size);
        }
        if (item.effect.coins) {
            Player.coins = Math.max(0, Player.coins + item.effect.coins);
        }
        if (item.effect.petPower && Player.hasPet) {
            Player.petPower += item.effect.petPower;
            Player.attackPower += item.effect.petPower;
        }
        if (item.effect.desertShield) {
            this.desertShield += item.effect.desertShield;
        }
        
        if (this.isFake) {
            UI.showNotification('💀 你被骗了！这是假商店！');
        } else {
            UI.showNotification(`购买成功：${item.name}`);
        }
        
        UI.updateHUD();
    },

    closeShop() {
        this.isOpen = false;
        document.getElementById('shop-overlay').classList.add('hidden');
    },

    // Check if player steps on shop tile
    checkShopTile(tileX, tileY) {
        const tile = World.getTile(tileX, tileY);
        if (tile === 'shop') {
            return 'real';
        }
        return null;
    }
};

// assets.js - Programmatic sprite/asset generation
const Assets = {
    // Color palette
    colors: {
        pink: '#ff69b4',
        pinkLight: '#ffb6c1',
        pinkDark: '#c71585',
        grass: '#4caf50',
        grassDark: '#388e3c',
        sand: '#f4d03f',
        sandDark: '#d4ac0f',
        water: '#42a5f5',
        waterDark: '#1976d2',
        rock: '#78909c',
        tree: '#2e7d32',
        treeTrunk: '#5d4037',
        cave: '#37474f',
        mountain: '#455a64',
        gold: '#ffd700',
        heart: '#ff1744',
        enemy: '#7b1fa2',
        fungi: '#9c27b0',
        boss: '#b71c1c',
    },

    // Draw the pink clay player at different growth stages
    drawPlayer(ctx, x, y, size, stage) {
        // stage: 0-4 (tiny, small, medium, large, giant)
        const radius = 8 + stage * 4;
        const bodyColor = this.colors.pink;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(0, radius * 0.8, radius * 0.8, radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Body (soft blob shape)
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius, radius * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.ellipse(-radius * 0.3, -radius * 0.3, radius * 0.3, radius * 0.25, -0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(-radius * 0.25, -radius * 0.1, 2 + stage * 0.5, 0, Math.PI * 2);
        ctx.arc(radius * 0.25, -radius * 0.1, 2 + stage * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Smile
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, radius * 0.15, radius * 0.25, 0.1, Math.PI - 0.1);
        ctx.stroke();
        
        // Blush
        ctx.fillStyle = 'rgba(255, 100, 150, 0.4)';
        ctx.beginPath();
        ctx.ellipse(-radius * 0.5, radius * 0.1, radius * 0.15, radius * 0.1, 0, 0, Math.PI * 2);
        ctx.ellipse(radius * 0.5, radius * 0.1, radius * 0.15, radius * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        return radius;
    },

    // Draw clay drop collectible (subtle, partially hidden)
    drawClayDrop(ctx, x, y, time) {
        ctx.save();
        ctx.translate(x, y);
        const bounce = Math.sin(time * 2) * 1;
        ctx.translate(0, bounce);
        
        // Very subtle glow
        ctx.fillStyle = 'rgba(255, 182, 193, 0.15)';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Small clay ball
        ctx.fillStyle = 'rgba(255, 150, 180, 0.7)';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Tiny shine
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.arc(-1, -1, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    },

    // Draw Giant Clay (special item)
    drawGiantClay(ctx, x, y, time) {
        ctx.save();
        ctx.translate(x, y);
        const pulse = 1 + Math.sin(time * 2) * 0.1;
        ctx.scale(pulse, pulse);
        
        // Glow ring
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.stroke();
        
        // Big clay ball
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 14);
        gradient.addColorStop(0, '#ffb6c1');
        gradient.addColorStop(1, '#ff69b4');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        
        // Star sparkles
        ctx.fillStyle = '#ffd700';
        for (let i = 0; i < 4; i++) {
            const angle = time * 2 + (i * Math.PI / 2);
            const sx = Math.cos(angle) * 16;
            const sy = Math.sin(angle) * 16;
            ctx.beginPath();
            ctx.arc(sx, sy, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    },

    // Draw coin
    drawCoin(ctx, x, y, time) {
        ctx.save();
        ctx.translate(x, y);
        const spin = Math.abs(Math.cos(time * 2));
        
        ctx.fillStyle = this.colors.gold;
        ctx.beginPath();
        ctx.ellipse(0, 0, 5 * spin, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#b8860b';
        ctx.font = '7px bold sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (spin > 0.3) ctx.fillText('$', 0, 0);
        
        ctx.restore();
    },

    // Draw NPC
    drawNPC(ctx, x, y, type, time) {
        // type: 'good', 'bad', 'super_good', 'spy'
        ctx.save();
        ctx.translate(x, y);
        
        const colors = {
            good: '#4fc3f7',
            bad: '#ef5350',
            super_good: '#ffd700',
            spy: '#4fc3f7', // looks like good
        };
        
        const color = colors[type] || '#888';
        const radius = 12;
        
        // Body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, 2, radius, radius * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-4, -2, 3, 0, Math.PI * 2);
        ctx.arc(4, -2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(-4, -2, 1.5, 0, Math.PI * 2);
        ctx.arc(4, -2, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Heart indicator (good NPCs have heart in pocket area)
        if (type === 'good' || type === 'super_good') {
            ctx.fillStyle = this.colors.heart;
            ctx.beginPath();
            ctx.moveTo(0, 8);
            ctx.bezierCurveTo(-3, 5, -5, 7, -5, 9);
            ctx.bezierCurveTo(-5, 11, 0, 14, 0, 14);
            ctx.bezierCurveTo(0, 14, 5, 11, 5, 9);
            ctx.bezierCurveTo(5, 7, 3, 5, 0, 8);
            ctx.fill();
        }
        
        // Spy has a slightly glitching heart (flickers)
        if (type === 'spy') {
            if (Math.sin(time * 5) > 0.3) {
                ctx.fillStyle = this.colors.heart;
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.moveTo(0, 8);
                ctx.bezierCurveTo(-3, 5, -5, 7, -5, 9);
                ctx.bezierCurveTo(-5, 11, 0, 14, 0, 14);
                ctx.bezierCurveTo(0, 14, 5, 11, 5, 9);
                ctx.bezierCurveTo(5, 7, 3, 5, 0, 8);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }
        
        // Super good NPC has golden aura
        if (type === 'super_good') {
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, radius + 5 + Math.sin(time * 3) * 2, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Bad NPC has angry eyebrows
        if (type === 'bad') {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-7, -6);
            ctx.lineTo(-2, -4);
            ctx.moveTo(7, -6);
            ctx.lineTo(2, -4);
            ctx.stroke();
        }
        
        ctx.restore();
    },

    // Draw enemy
    drawEnemy(ctx, x, y, type, time, hp, maxHp) {
        ctx.save();
        ctx.translate(x, y);
        
        if (type === 'slime') {
            // Small slime enemy
            ctx.fillStyle = '#7b1fa2';
            ctx.beginPath();
            const squish = 1 + Math.sin(time * 4) * 0.1;
            ctx.ellipse(0, 2, 10 * squish, 10 / squish, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(-3, -1, 2, 0, Math.PI * 2);
            ctx.arc(3, -1, 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (type === 'fungi') {
            // Fungi enemy
            ctx.fillStyle = '#9c27b0';
            ctx.beginPath();
            ctx.ellipse(0, 4, 8, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            // Cap
            ctx.fillStyle = '#e91e63';
            ctx.beginPath();
            ctx.ellipse(0, -4, 10, 8, 0, Math.PI, Math.PI * 2);
            ctx.fill();
            // Dots
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(-4, -6, 2, 0, Math.PI * 2);
            ctx.arc(3, -5, 1.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (type === 'boss') {
            // Final boss - large monster
            const bossRadius = 30;
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.ellipse(0, 0, bossRadius, bossRadius * 1.2, 0, 0, Math.PI * 2);
            ctx.fill();
            // Red eyes
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(-10, -8, 5, 0, Math.PI * 2);
            ctx.arc(10, -8, 5, 0, Math.PI * 2);
            ctx.fill();
            // Horns
            ctx.fillStyle = '#4a0000';
            ctx.beginPath();
            ctx.moveTo(-15, -25);
            ctx.lineTo(-8, -10);
            ctx.lineTo(-20, -10);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(15, -25);
            ctx.lineTo(8, -10);
            ctx.lineTo(20, -10);
            ctx.closePath();
            ctx.fill();
            // Mouth
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 10, 12, 0.2, Math.PI - 0.2);
            ctx.stroke();
        }
        
        // HP bar above enemy
        if (hp !== undefined && hp < maxHp) {
            const barWidth = 24;
            ctx.fillStyle = '#333';
            ctx.fillRect(-barWidth/2, -20, barWidth, 4);
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(-barWidth/2, -20, barWidth * (hp / maxHp), 4);
        }
        
        ctx.restore();
    },

    // Draw pet companion
    drawPet(ctx, x, y, power, time) {
        ctx.save();
        ctx.translate(x, y);
        const float = Math.sin(time * 3) * 3;
        ctx.translate(0, float);
        
        // Small star-shaped pet
        const color = power > 50 ? '#ffd700' : power > 25 ? '#ff69b4' : '#87ceeb';
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI / 5) - Math.PI / 2;
            const r = i % 2 === 0 ? 8 : 4;
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(-2, 0, 1, 0, Math.PI * 2);
        ctx.arc(2, 0, 1, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    },

    // Draw water drop (desert effect)
    drawWaterDrop(ctx, x, y, alpha) {
        ctx.save();
        ctx.translate(x, y);
        ctx.globalAlpha = alpha;
        
        ctx.fillStyle = '#42a5f5';
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.bezierCurveTo(-4, 0, -4, 4, 0, 6);
        ctx.bezierCurveTo(4, 4, 4, 0, 0, -5);
        ctx.fill();
        
        ctx.restore();
    },

    // Tile drawing
    drawTile(ctx, x, y, tileSize, tileType) {
        ctx.save();
        switch(tileType) {
            case 'grass':
                ctx.fillStyle = '#6ab04c';
                ctx.fillRect(x, y, tileSize, tileSize);
                // Random grass blades
                ctx.fillStyle = '#4caf50';
                ctx.fillRect(x + 5, y + 3, 2, 6);
                ctx.fillRect(x + 12, y + 8, 2, 5);
                ctx.fillRect(x + 20, y + 2, 2, 7);
                break;
            case 'sand':
                ctx.fillStyle = '#f4d03f';
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.fillStyle = '#d4ac0f';
                ctx.fillRect(x + 8, y + 12, 3, 2);
                ctx.fillRect(x + 18, y + 5, 2, 2);
                break;
            case 'water':
                ctx.fillStyle = '#42a5f5';
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fillRect(x + 4, y + 8, 8, 2);
                ctx.fillRect(x + 14, y + 14, 6, 2);
                break;
            case 'path':
                ctx.fillStyle = '#a0855b';
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.fillStyle = '#8B7355';
                ctx.fillRect(x + 6, y + 4, 4, 3);
                ctx.fillRect(x + 16, y + 16, 3, 3);
                break;
            case 'cave':
                ctx.fillStyle = '#37474f';
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.fillStyle = '#263238';
                ctx.fillRect(x + 3, y + 3, 5, 5);
                ctx.fillRect(x + 15, y + 12, 4, 4);
                break;
            case 'mountain':
                ctx.fillStyle = '#455a64';
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.fillStyle = '#37474f';
                ctx.beginPath();
                ctx.moveTo(x + 12, y + 2);
                ctx.lineTo(x + 4, y + 20);
                ctx.lineTo(x + 20, y + 20);
                ctx.closePath();
                ctx.fill();
                break;
            case 'wall':
                ctx.fillStyle = '#5d4037';
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.strokeStyle = '#3e2723';
                ctx.strokeRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
                break;
            case 'tree':
                ctx.fillStyle = '#6ab04c';
                ctx.fillRect(x, y, tileSize, tileSize);
                // Trunk
                ctx.fillStyle = '#5d4037';
                ctx.fillRect(x + 10, y + 14, 4, 10);
                // Canopy
                ctx.fillStyle = '#2e7d32';
                ctx.beginPath();
                ctx.arc(x + 12, y + 10, 8, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'shop':
                ctx.fillStyle = '#a0855b';
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.fillStyle = '#795548';
                ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
                ctx.fillStyle = '#ffd700';
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('🏪', x + 12, y + 16);
                break;
            case 'house_danger':
                ctx.fillStyle = '#a0855b';
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.fillStyle = '#4a148c';
                ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
                ctx.fillStyle = '#ff0000';
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('🏚️', x + 12, y + 16);
                break;
            case 'portal':
                ctx.fillStyle = '#6ab04c';
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(x + 12, y + 12, 8, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'entrance':
                ctx.fillStyle = '#5d4037';
                ctx.fillRect(x, y, tileSize, tileSize);
                // Door shape
                ctx.fillStyle = '#3e2723';
                ctx.fillRect(x + 8, y + 4, 16, 24);
                // Door handle
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(x + 20, y + 16, 2, 0, Math.PI * 2);
                ctx.fill();
                // Arrow hint
                ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('▼', x + 16, y + 30);
                break;
            case 'furniture':
                ctx.fillStyle = '#a0855b';
                ctx.fillRect(x, y, tileSize, tileSize);
                // Wooden furniture block
                ctx.fillStyle = '#6d4c41';
                ctx.fillRect(x + 4, y + 4, tileSize - 8, tileSize - 8);
                ctx.fillStyle = '#8d6e63';
                ctx.fillRect(x + 6, y + 6, tileSize - 12, tileSize - 12);
                // Decorative top line
                ctx.fillStyle = '#4e342e';
                ctx.fillRect(x + 4, y + 4, tileSize - 8, 3);
                break;
            default:
                ctx.fillStyle = '#333';
                ctx.fillRect(x, y, tileSize, tileSize);
        }
        ctx.restore();
    }
};

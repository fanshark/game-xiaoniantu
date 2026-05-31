// animation.js - Opening cutscene animation
const Animation = {
    canvas: null,
    ctx: null,
    phase: 0,
    timer: 0,
    complete: false,
    skipped: false,
    particles: [],

    // Animation phases (dramatic pacing)
    phases: [
        { duration: 5, name: 'spin' },        // Pink clay spinning with particles
        { duration: 7, name: 'story1' },       // Intro story - happy world
        { duration: 7, name: 'story2' },       // Friend kidnapped - dramatic
        { duration: 7, name: 'story3' },       // Determination - inspiring
        { duration: 6, name: 'preview' },      // Adventure preview - epic
        { duration: 4, name: 'title' },        // Title display - grand
    ],

    storyTexts: [
        '在软软甜甜的粘土世界里，\n生活着一只小小的粉色粘土。\n它每天和最好的朋友一起散步、玩耍...',
        '可是有一天，\n山林深处的巨大怪兽突然出现！\n偷偷绑架了小粘土的好朋友，\n把好朋友关在漆黑的深山里...',
        '虽然身体弱小，\n但小粘土非常勇敢，下定决心：\n"我一定要长到15米，\n打败怪兽，救出好朋友！"',
        '危险的沙漠...\n神秘的菌窟...\n伪装的间谍...\n隐藏的陷阱...\n一段史诗般的冒险即将开始！',
    ],

    init() {
        this.canvas = document.getElementById('intro-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1200;
        this.canvas.height = 900;
        this.phase = 0;
        this.timer = 0;
        this.complete = false;
        this.particles = [];
        // Pre-generate particles
        for (let i = 0; i < 60; i++) {
            this.particles.push({
                x: Math.random() * 1200,
                y: Math.random() * 900,
                size: 2 + Math.random() * 4,
                speed: 0.3 + Math.random() * 1,
                angle: Math.random() * Math.PI * 2,
                color: `hsl(${330 + Math.random() * 40}, 80%, ${60 + Math.random() * 30}%)`,
                alpha: 0.3 + Math.random() * 0.5,
            });
        }
    },

    skip() {
        this.skipped = true;
        this.complete = true;
    },

    update(dt) {
        if (this.complete) return true;
        
        this.timer += dt;
        const currentPhase = this.phases[this.phase];
        
        // Update particles
        this.particles.forEach(p => {
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed;
            if (p.x < 0) p.x = 1200;
            if (p.x > 1200) p.x = 0;
            if (p.y < 0) p.y = 900;
            if (p.y > 900) p.y = 0;
        });
        
        if (this.timer >= currentPhase.duration) {
            this.timer = 0;
            this.phase++;
            if (this.phase >= this.phases.length) {
                this.complete = true;
                return true;
            }
        }
        
        return false;
    },

    render() {
        if (this.complete) return;
        
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const currentPhase = this.phases[this.phase];
        const progress = this.timer / currentPhase.duration;
        
        // Clear
        ctx.fillStyle = '#0a0a1e';
        ctx.fillRect(0, 0, w, h);
        
        switch (currentPhase.name) {
            case 'spin':
                this.renderSpin(ctx, w, h, progress);
                break;
            case 'story1':
                this.renderStory(ctx, w, h, 0, progress);
                break;
            case 'story2':
                this.renderStory(ctx, w, h, 1, progress);
                break;
            case 'story3':
                this.renderStory(ctx, w, h, 2, progress);
                break;
            case 'preview':
                this.renderStory(ctx, w, h, 3, progress);
                break;
            case 'title':
                this.renderTitle(ctx, w, h, progress);
                break;
        }
    },

    renderParticles(ctx, w, h) {
        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha * (0.5 + Math.sin(this.timer * 2 + p.x) * 0.3);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    },

    renderSpin(ctx, w, h, progress) {
        // Background with radial gradient
        const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, 400);
        grad.addColorStop(0, '#2d1b4e');
        grad.addColorStop(0.5, '#1a1035');
        grad.addColorStop(1, '#0a0a1e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Floating particles
        this.renderParticles(ctx, w, h);

        // Spinning light rings
        for (let ring = 0; ring < 3; ring++) {
            ctx.save();
            ctx.translate(w/2, h/2);
            ctx.rotate(this.timer * (1 + ring * 0.5) + ring * 2);
            ctx.strokeStyle = `rgba(255, 105, 180, ${0.2 - ring * 0.05})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, 0, 120 + ring * 50, 80 + ring * 30, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Spinning pink clay (larger, more detailed)
        const angle = progress * Math.PI * 6;
        const scale = 1.2 + Math.sin(progress * Math.PI * 3) * 0.15;
        const bounce = Math.sin(progress * Math.PI * 4) * 10;
        
        ctx.save();
        ctx.translate(w/2, h/2 + bounce);
        ctx.rotate(angle * 0.3);
        ctx.scale(scale, scale);
        
        // Outer glow
        const glowGrad = ctx.createRadialGradient(0, 0, 30, 0, 0, 80);
        glowGrad.addColorStop(0, 'rgba(255, 105, 180, 0.4)');
        glowGrad.addColorStop(1, 'rgba(255, 105, 180, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 80, 0, Math.PI * 2);
        ctx.fill();

        // Draw large pink clay body
        const radius = 50;
        ctx.fillStyle = '#ff69b4';
        ctx.beginPath();
        ctx.ellipse(0, 0, radius, radius * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Shiny highlight
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.ellipse(-radius * 0.3, -radius * 0.35, radius * 0.4, radius * 0.25, -0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes (sparkly)
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(-14, -8, 6, 0, Math.PI * 2);
        ctx.arc(14, -8, 6, 0, Math.PI * 2);
        ctx.fill();
        // Eye sparkle
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-12, -10, 2.5, 0, Math.PI * 2);
        ctx.arc(16, -10, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Big happy smile
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 8, 16, 0.15, Math.PI - 0.15);
        ctx.stroke();
        
        // Blush
        ctx.fillStyle = 'rgba(255, 80, 130, 0.6)';
        ctx.beginPath();
        ctx.ellipse(-26, 8, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(26, 8, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // Text below with fade in
        const textAlpha = Math.min(1, progress * 3);
        ctx.fillStyle = `rgba(255, 200, 220, ${textAlpha})`;
        ctx.font = 'bold 28px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('✨ 粉色小粘土准备出发 ✨', w/2, h/2 + 130);

        // Subtitle
        if (progress > 0.5) {
            ctx.fillStyle = `rgba(200, 200, 200, ${(progress - 0.5) * 2})`;
            ctx.font = '18px Microsoft YaHei';
            ctx.fillText('一段充满勇气的冒险故事...', w/2, h/2 + 170);
        }
    },

    renderStory(ctx, w, h, storyIndex, progress) {
        // Fade in effect
        const alpha = Math.min(1, progress * 4);
        
        // Background scene based on story
        this.drawStoryBackground(ctx, w, h, storyIndex, progress);
        
        // Floating particles
        this.renderParticles(ctx, w, h);

        // Text box at bottom (bigger, more dramatic)
        const boxY = h - 220;
        const boxH = 180;
        ctx.fillStyle = `rgba(0, 0, 0, ${0.8 * alpha})`;
        ctx.fillRect(40, boxY, w - 80, boxH);
        // Glowing border
        ctx.shadowColor = '#ff69b4';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = `rgba(255, 182, 193, ${0.9 * alpha})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(40, boxY, w - 80, boxH);
        ctx.shadowBlur = 0;
        
        // Story text with typewriter effect (BIGGER font)
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.font = 'bold 26px Microsoft YaHei';
        ctx.textAlign = 'center';
        
        const text = this.storyTexts[storyIndex];
        const lines = text.split('\n');
        const charsToShow = Math.floor(progress * text.length * 1.8);
        let charCount = 0;
        
        lines.forEach((line, i) => {
            let displayLine = '';
            for (let c = 0; c < line.length; c++) {
                if (charCount < charsToShow) {
                    displayLine += line[c];
                    charCount++;
                }
            }
            charCount++;
            // Color based on story mood
            if (storyIndex === 1) ctx.fillStyle = `rgba(255, 150, 150, ${alpha})`;
            else if (storyIndex === 2) ctx.fillStyle = `rgba(255, 220, 150, ${alpha})`;
            else ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillText(displayLine, w/2, boxY + 40 + i * 36);
        });
    },

    drawStoryBackground(ctx, w, h, storyIndex, progress) {
        switch(storyIndex) {
            case 0: // Happy life - beautiful garden
                const grad1 = ctx.createLinearGradient(0, 0, 0, h);
                grad1.addColorStop(0, '#6ec6ff');
                grad1.addColorStop(0.6, '#87ceeb');
                grad1.addColorStop(1, '#4caf50');
                ctx.fillStyle = grad1;
                ctx.fillRect(0, 0, w, h);
                
                // Sun with rays
                ctx.save();
                ctx.translate(900, 120);
                const sunGlow = ctx.createRadialGradient(0, 0, 20, 0, 0, 100);
                sunGlow.addColorStop(0, 'rgba(255, 230, 100, 0.8)');
                sunGlow.addColorStop(1, 'rgba(255, 200, 50, 0)');
                ctx.fillStyle = sunGlow;
                ctx.beginPath();
                ctx.arc(0, 0, 100, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffe066';
                ctx.beginPath();
                ctx.arc(0, 0, 40, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                // Pretty trees with varying sizes
                for (let i = 0; i < 8; i++) {
                    const tx = 60 + i * 140 + Math.sin(i * 3) * 30;
                    const ty = h - 280 + Math.sin(i * 2) * 20;
                    const tsize = 30 + Math.sin(i) * 10;
                    ctx.fillStyle = '#2e7d32';
                    ctx.beginPath();
                    ctx.arc(tx, ty, tsize, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#1b5e20';
                    ctx.beginPath();
                    ctx.arc(tx - 5, ty - 10, tsize * 0.7, 0, Math.PI * 2);
                    ctx.fill();
                    // Trunk
                    ctx.fillStyle = '#5d4037';
                    ctx.fillRect(tx - 4, ty + tsize - 5, 8, 20);
                }
                
                // Flowers
                for (let i = 0; i < 12; i++) {
                    const fx = 80 + i * 95;
                    const fy = h - 250 + Math.sin(i * 1.5) * 15 + Math.cos(progress * 3 + i) * 3;
                    ctx.fillStyle = ['#ff69b4', '#ff9ff3', '#feca57', '#ff6b6b'][i % 4];
                    ctx.beginPath();
                    ctx.arc(fx, fy, 5, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Two clays walking together with bounce
                const walkBounce = Math.sin(progress * Math.PI * 6) * 4;
                const walkX = w * 0.3 + progress * w * 0.3;
                // Pink clay
                ctx.fillStyle = '#ff69b4';
                ctx.beginPath();
                ctx.arc(walkX, h - 290 + walkBounce, 22, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.beginPath();
                ctx.ellipse(walkX - 7, h - 297 + walkBounce, 7, 5, -0.3, 0, Math.PI * 2);
                ctx.fill();
                // Blue friend clay
                ctx.fillStyle = '#4fc3f7';
                ctx.beginPath();
                ctx.arc(walkX + 50, h - 290 - walkBounce, 20, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.beginPath();
                ctx.ellipse(walkX + 44, h - 296 - walkBounce, 6, 4, -0.3, 0, Math.PI * 2);
                ctx.fill();
                // Hearts between them
                ctx.fillStyle = `rgba(255, 100, 150, ${0.5 + Math.sin(progress * 8) * 0.3})`;
                ctx.font = '16px serif';
                ctx.fillText('❤', walkX + 25, h - 310);
                break;
                
            case 1: // Monster appears - dark and scary
                const grad2 = ctx.createLinearGradient(0, 0, 0, h);
                grad2.addColorStop(0, '#0a0015');
                grad2.addColorStop(0.5, '#1a0a2e');
                grad2.addColorStop(1, '#0d0d0d');
                ctx.fillStyle = grad2;
                ctx.fillRect(0, 0, w, h);
                
                // Lightning flash
                if (Math.sin(progress * 20) > 0.95) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                    ctx.fillRect(0, 0, w, h);
                }

                // Dark mountains
                ctx.fillStyle = '#1a1a2e';
                ctx.beginPath();
                ctx.moveTo(0, h * 0.5);
                ctx.lineTo(200, h * 0.2);
                ctx.lineTo(400, h * 0.4);
                ctx.lineTo(600, h * 0.15);
                ctx.lineTo(800, h * 0.35);
                ctx.lineTo(1000, h * 0.2);
                ctx.lineTo(1200, h * 0.4);
                ctx.lineTo(1200, h);
                ctx.lineTo(0, h);
                ctx.fill();
                
                // Monster (big and menacing, breathing animation)
                const breathe = Math.sin(progress * 4) * 8;
                ctx.save();
                ctx.translate(w/2, h * 0.35);
                // Shadow under monster
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.beginPath();
                ctx.ellipse(0, 100 + breathe, 120, 20, 0, 0, Math.PI * 2);
                ctx.fill();
                // Body
                ctx.fillStyle = '#1a0a0a';
                ctx.beginPath();
                ctx.ellipse(0, breathe, 100 + breathe/2, 130, 0, 0, Math.PI * 2);
                ctx.fill();
                // Horns
                ctx.fillStyle = '#2d0000';
                ctx.beginPath();
                ctx.moveTo(-40, -100 + breathe);
                ctx.lineTo(-60, -160);
                ctx.lineTo(-30, -110 + breathe);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(40, -100 + breathe);
                ctx.lineTo(60, -160);
                ctx.lineTo(30, -110 + breathe);
                ctx.fill();
                // Glowing red eyes
                const eyeGlow = 0.7 + Math.sin(progress * 6) * 0.3;
                ctx.shadowColor = '#ff0000';
                ctx.shadowBlur = 20;
                ctx.fillStyle = `rgba(255, 0, 0, ${eyeGlow})`;
                ctx.beginPath();
                ctx.arc(-30, -30 + breathe, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(30, -30 + breathe, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                // Scary mouth
                ctx.strokeStyle = '#ff3333';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0, 20 + breathe, 30, 0.2, Math.PI - 0.2);
                ctx.stroke();
                ctx.restore();
                
                // Scared friend at bottom
                ctx.fillStyle = '#4fc3f7';
                ctx.beginPath();
                ctx.arc(w/2, h * 0.65, 15, 0, Math.PI * 2);
                ctx.fill();
                // Tear drop
                ctx.fillStyle = 'rgba(100, 200, 255, 0.7)';
                ctx.beginPath();
                ctx.arc(w/2 + 8, h * 0.65 + 5, 3, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 2: // Determination - sunrise, inspiring
                const grad3 = ctx.createLinearGradient(0, 0, 0, h);
                grad3.addColorStop(0, '#ff6b6b');
                grad3.addColorStop(0.3, '#ffa07a');
                grad3.addColorStop(0.6, '#ffd700');
                grad3.addColorStop(1, '#fff3e0');
                ctx.fillStyle = grad3;
                ctx.fillRect(0, 0, w, h);
                
                // Radiating light beams from center
                ctx.save();
                ctx.translate(w/2, h * 0.4);
                for (let i = 0; i < 12; i++) {
                    ctx.rotate(Math.PI / 6);
                    ctx.fillStyle = `rgba(255, 255, 200, ${0.1 + Math.sin(progress * 4 + i) * 0.05})`;
                    ctx.beginPath();
                    ctx.moveTo(-8, 0);
                    ctx.lineTo(-2, -300);
                    ctx.lineTo(2, -300);
                    ctx.lineTo(8, 0);
                    ctx.fill();
                }
                ctx.restore();
                
                // Determined pink clay (growing bigger with progress)
                const detScale = 1.5 + progress * 0.8;
                ctx.save();
                ctx.translate(w/2, h * 0.4);
                ctx.scale(detScale, detScale);
                // Power aura
                const auraGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, 50);
                auraGrad.addColorStop(0, 'rgba(255, 105, 180, 0.4)');
                auraGrad.addColorStop(1, 'rgba(255, 105, 180, 0)');
                ctx.fillStyle = auraGrad;
                ctx.beginPath();
                ctx.arc(0, 0, 50, 0, Math.PI * 2);
                ctx.fill();
                // Body
                ctx.fillStyle = '#ff69b4';
                ctx.beginPath();
                ctx.ellipse(0, 0, 30, 33, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.beginPath();
                ctx.ellipse(-10, -12, 10, 7, -0.4, 0, Math.PI * 2);
                ctx.fill();
                // Determined eyes (angry/focused)
                ctx.fillStyle = '#222';
                ctx.beginPath();
                ctx.arc(-10, -5, 5, 0, Math.PI * 2);
                ctx.arc(10, -5, 5, 0, Math.PI * 2);
                ctx.fill();
                // Eye sparkle
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(-8, -7, 2, 0, Math.PI * 2);
                ctx.arc(12, -7, 2, 0, Math.PI * 2);
                ctx.fill();
                // Determined mouth
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(-8, 8);
                ctx.lineTo(8, 8);
                ctx.stroke();
                ctx.restore();
                
                // Arrow path ahead
                ctx.fillStyle = 'rgba(255, 200, 100, 0.5)';
                for (let i = 0; i < 5; i++) {
                    const ay = h * 0.65 + i * 40;
                    const ax = w/2;
                    const asize = 15 - i * 2;
                    ctx.beginPath();
                    ctx.moveTo(ax, ay);
                    ctx.lineTo(ax - asize, ay + asize);
                    ctx.lineTo(ax + asize, ay + asize);
                    ctx.closePath();
                    ctx.fill();
                }
                break;
                
            case 3: // Adventure preview - epic montage
                // Four zone panels with cool transitions
                const zones = [
                    { color1: '#f4d03f', color2: '#e67e22', name: '🏜️ 沙漠', icon: '☀️' },
                    { color1: '#2c3e50', color2: '#1a1a2e', name: '🍄 菌窟', icon: '🍄' },
                    { color1: '#3498db', color2: '#2980b9', name: '🌊 海边', icon: '🐚' },
                    { color1: '#27ae60', color2: '#1a5032', name: '⛰️ 山林', icon: '🌲' },
                ];
                
                const panelW = w / 4;
                zones.forEach((zone, i) => {
                    const reveal = Math.max(0, Math.min(1, (progress * 5 - i) * 0.8));
                    if (reveal <= 0) return;
                    
                    ctx.save();
                    ctx.globalAlpha = reveal;
                    const zGrad = ctx.createLinearGradient(i * panelW, 0, i * panelW, h - 230);
                    zGrad.addColorStop(0, zone.color1);
                    zGrad.addColorStop(1, zone.color2);
                    ctx.fillStyle = zGrad;
                    ctx.fillRect(i * panelW, 0, panelW, h - 230);
                    
                    // Zone icon (big)
                    ctx.font = '60px serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(zone.icon, i * panelW + panelW/2, h/2 - 80);
                    
                    // Zone name
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 22px Microsoft YaHei';
                    ctx.fillText(zone.name, i * panelW + panelW/2, h/2 - 20);
                    ctx.restore();
                });

                // Divider lines
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 2;
                for (let i = 1; i < 4; i++) {
                    ctx.beginPath();
                    ctx.moveTo(i * panelW, 0);
                    ctx.lineTo(i * panelW, h - 230);
                    ctx.stroke();
                }
                break;
        }
    },

    renderTitle(ctx, w, h, progress) {
        // Grand title reveal with epic background
        const scale = 0.3 + progress * 0.7;
        const alpha = Math.min(1, progress * 2.5);
        
        // Background - deep space with pink nebula
        const bgGrad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, 500);
        bgGrad.addColorStop(0, 'rgba(255, 105, 180, 0.3)');
        bgGrad.addColorStop(0.4, 'rgba(100, 50, 120, 0.2)');
        bgGrad.addColorStop(1, '#0a0a1e');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Stars
        for (let i = 0; i < 40; i++) {
            const sx = (i * 137.5) % w;
            const sy = (i * 97.3) % h;
            const twinkle = 0.3 + Math.sin(this.timer * 3 + i) * 0.4;
            ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
            ctx.beginPath();
            ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Floating particles
        this.renderParticles(ctx, w, h);
        
        // Title with shadow and glow
        ctx.save();
        ctx.translate(w/2, h/2 - 50);
        ctx.scale(scale, scale);
        ctx.globalAlpha = alpha;
        
        // Glow behind text
        ctx.shadowColor = '#ff69b4';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#ff69b4';
        ctx.font = 'bold 72px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('小黏土走走走', 0, 0);
        ctx.shadowBlur = 0;
        
        // Outline
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeText('小黏土走走走', 0, 0);
        
        // Subtitle
        ctx.fillStyle = '#ffd1dc';
        ctx.font = 'bold 28px Microsoft YaHei';
        ctx.fillText('Little Clay Go Go Go', 0, 55);
        
        ctx.restore();
        
        // "Press any key" prompt
        if (progress > 0.4) {
            const blink = Math.sin(this.timer * 4) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 255, 255, ${blink * (progress - 0.4) * 2})`;
            ctx.font = 'bold 24px Microsoft YaHei';
            ctx.textAlign = 'center';
            ctx.fillText('✨ 按任意键开始冒险 ✨', w/2, h/2 + 120);
        }
    }
};

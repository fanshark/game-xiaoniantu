// animation.js - Opening cutscene animation
const Animation = {
    canvas: null,
    ctx: null,
    phase: 0,
    timer: 0,
    complete: false,
    skipped: false,

    // Animation phases (slowed to half speed)
    phases: [
        { duration: 6, name: 'spin' },        // Pink clay spinning
        { duration: 8, name: 'story1' },       // Intro story
        { duration: 8, name: 'story2' },       // Friend kidnapped
        { duration: 8, name: 'story3' },       // Determination
        { duration: 6, name: 'preview' },      // Adventure preview
        { duration: 4, name: 'title' },        // Title display
    ],

    storyTexts: [
        '在软软甜甜的粘土世界里，\n生活着一只只有5毫米的粉色小粘土。\n它每天和最好的朋友一起散步、玩耍...',
        '可是有一天，山林深处的巨大怪兽突然出现，\n偷偷绑架了小粘土的好朋友，\n把好朋友关在漆黑的深山里...',
        '虽然只有5毫米，力量弱小，\n但小粘土非常勇敢，下定决心：\n"我一定要长到15米，打败怪兽，救出好朋友！"',
        '危险的沙漠...神秘的菌窟...\n伪装的间谍...隐藏的陷阱...\n漫长的冒险即将开始！',
    ],

    init() {
        this.canvas = document.getElementById('intro-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1200;
        this.canvas.height = 900;
        this.phase = 0;
        this.timer = 0;
        this.complete = false;
    },

    skip() {
        this.skipped = true;
        this.complete = true;
    },

    update(dt) {
        if (this.complete) return true;
        
        this.timer += dt;
        const currentPhase = this.phases[this.phase];
        
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
        ctx.fillStyle = '#1a1a2e';
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

    renderSpin(ctx, w, h, progress) {
        // Background with soft particles
        for (let i = 0; i < 20; i++) {
            const px = (w/2) + Math.cos(i * 0.5 + this.timer) * (100 + i * 10);
            const py = (h/2) + Math.sin(i * 0.7 + this.timer) * (80 + i * 8);
            ctx.fillStyle = `rgba(255, 182, 193, ${0.1 + Math.sin(i + this.timer) * 0.05})`;
            ctx.beginPath();
            ctx.arc(px, py, 3 + i * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Spinning pink clay
        const angle = progress * Math.PI * 4; // Two full rotations
        const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.1;
        
        ctx.save();
        ctx.translate(w/2, h/2);
        ctx.rotate(angle);
        ctx.scale(scale, scale);
        
        // Draw large pink clay
        const radius = 40;
        ctx.fillStyle = '#ff69b4';
        ctx.beginPath();
        ctx.ellipse(0, 0, radius, radius * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.ellipse(-radius * 0.3, -radius * 0.3, radius * 0.35, radius * 0.25, -0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(-10, -5, 4, 0, Math.PI * 2);
        ctx.arc(10, -5, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Smile
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 5, 12, 0.2, Math.PI - 0.2);
        ctx.stroke();
        
        // Blush
        ctx.fillStyle = 'rgba(255, 100, 150, 0.5)';
        ctx.beginPath();
        ctx.ellipse(-20, 5, 6, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(20, 5, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // Text below
        ctx.fillStyle = 'rgba(255, 255, 255, ' + Math.min(1, progress * 2) + ')';
        ctx.font = '16px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('粉色小粘土准备出发...', w/2, h/2 + 80);
    },

    renderStory(ctx, w, h, storyIndex, progress) {
        // Fade in effect
        const alpha = Math.min(1, progress * 3);
        
        // Background scene based on story
        this.drawStoryBackground(ctx, w, h, storyIndex, progress);
        
        // Text box at bottom
        ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * alpha})`;
        ctx.fillRect(50, h - 160, w - 100, 130);
        ctx.strokeStyle = `rgba(255, 182, 193, ${0.8 * alpha})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(50, h - 160, w - 100, 130);
        
        // Story text with typewriter effect
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.font = '16px Microsoft YaHei';
        ctx.textAlign = 'center';
        
        const text = this.storyTexts[storyIndex];
        const lines = text.split('\n');
        const charsToShow = Math.floor(progress * text.length * 1.5);
        let charCount = 0;
        
        lines.forEach((line, i) => {
            let displayLine = '';
            for (let c = 0; c < line.length; c++) {
                if (charCount < charsToShow) {
                    displayLine += line[c];
                    charCount++;
                }
            }
            charCount++; // For newline
            ctx.fillText(displayLine, w/2, h - 130 + i * 30);
        });
    },

    drawStoryBackground(ctx, w, h, storyIndex, progress) {
        switch(storyIndex) {
            case 0: // Happy life
                // Blue sky gradient
                const grad1 = ctx.createLinearGradient(0, 0, 0, h);
                grad1.addColorStop(0, '#87ceeb');
                grad1.addColorStop(1, '#4caf50');
                ctx.fillStyle = grad1;
                ctx.fillRect(0, 0, w, h);
                
                // Simple houses/trees
                ctx.fillStyle = '#2e7d32';
                for (let i = 0; i < 5; i++) {
                    ctx.beginPath();
                    ctx.arc(100 + i * 150, h - 200, 30, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Two small clays walking together
                ctx.fillStyle = '#ff69b4';
                const walkOffset = Math.sin(progress * Math.PI * 4) * 5;
                ctx.beginPath();
                ctx.arc(w/2 - 30 + walkOffset, h - 230, 15, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#4fc3f7';
                ctx.beginPath();
                ctx.arc(w/2 + 30 - walkOffset, h - 230, 15, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 1: // Monster appears
                // Dark sky
                const grad2 = ctx.createLinearGradient(0, 0, 0, h);
                grad2.addColorStop(0, '#1a1a2e');
                grad2.addColorStop(1, '#2d3436');
                ctx.fillStyle = grad2;
                ctx.fillRect(0, 0, w, h);
                
                // Monster silhouette
                ctx.fillStyle = 'rgba(20, 0, 0, 0.9)';
                ctx.beginPath();
                ctx.ellipse(w/2, h/2 - 50, 80 + Math.sin(progress * 3) * 5, 100, 0, 0, Math.PI * 2);
                ctx.fill();
                // Red eyes
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.arc(w/2 - 25, h/2 - 70, 8, 0, Math.PI * 2);
                ctx.arc(w/2 + 25, h/2 - 70, 8, 0, Math.PI * 2);
                ctx.fill();
                
                // Scared friend
                ctx.fillStyle = '#4fc3f7';
                ctx.beginPath();
                ctx.arc(w/2, h/2 + 60, 12, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 2: // Determination
                // Sunrise gradient
                const grad3 = ctx.createLinearGradient(0, 0, 0, h);
                grad3.addColorStop(0, '#ff9a9e');
                grad3.addColorStop(1, '#fad0c4');
                ctx.fillStyle = grad3;
                ctx.fillRect(0, 0, w, h);
                
                // Determined pink clay (larger)
                const detScale = 1 + progress * 0.3;
                ctx.save();
                ctx.translate(w/2, h/2 - 50);
                ctx.scale(detScale, detScale);
                ctx.fillStyle = '#ff69b4';
                ctx.beginPath();
                ctx.ellipse(0, 0, 25, 28, 0, 0, Math.PI * 2);
                ctx.fill();
                // Determined eyes
                ctx.fillStyle = '#333';
                ctx.beginPath();
                ctx.arc(-8, -3, 4, 0, Math.PI * 2);
                ctx.arc(8, -3, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                
                // Path ahead
                ctx.fillStyle = '#a0855b';
                ctx.beginPath();
                ctx.moveTo(w/2 - 20, h/2 + 30);
                ctx.lineTo(w/2 + 20, h/2 + 30);
                ctx.lineTo(w - 50, h);
                ctx.lineTo(50, h);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 3: // Adventure preview
                // Split screen showing different zones
                const zoneColors = ['#f4d03f', '#37474f', '#42a5f5', '#2e7d32'];
                const zoneNames = ['沙漠', '菌窟', '海边', '山林'];
                for (let i = 0; i < 4; i++) {
                    ctx.fillStyle = zoneColors[i];
                    ctx.fillRect(i * w/4, 0, w/4, h - 170);
                    ctx.fillStyle = 'rgba(0,0,0,0.3)';
                    ctx.font = '14px Microsoft YaHei';
                    ctx.textAlign = 'center';
                    ctx.fillText(zoneNames[i], i * w/4 + w/8, 30);
                }
                break;
        }
    },

    renderTitle(ctx, w, h, progress) {
        // Grand title reveal
        const scale = 0.5 + progress * 0.5;
        const alpha = Math.min(1, progress * 2);
        
        // Background
        const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, 300);
        grad.addColorStop(0, 'rgba(255, 105, 180, 0.3)');
        grad.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        
        // Title
        ctx.save();
        ctx.translate(w/2, h/2 - 30);
        ctx.scale(scale, scale);
        ctx.globalAlpha = alpha;
        
        ctx.fillStyle = '#ff69b4';
        ctx.font = 'bold 48px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('小黏土走走走', 0, 0);
        
        ctx.fillStyle = '#ffb6c1';
        ctx.font = '20px Microsoft YaHei';
        ctx.fillText('Little Clay Go Go Go', 0, 40);
        
        ctx.restore();
        
        // Subtitle
        if (progress > 0.5) {
            ctx.fillStyle = `rgba(255, 255, 255, ${(progress - 0.5) * 2})`;
            ctx.font = '16px Microsoft YaHei';
            ctx.textAlign = 'center';
            ctx.fillText('按任意键开始冒险...', w/2, h/2 + 80);
        }
    }
};

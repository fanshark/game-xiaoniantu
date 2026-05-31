// audio.js - Procedural game music and sound effects using Web Audio API
const Audio = {
    ctx: null,
    musicGain: null,
    sfxGain: null,
    musicPlaying: false,
    currentNotes: [],
    noteIndex: 0,
    nextNoteTime: 0,
    tempo: 120, // BPM

    // Pentatonic scale notes (frequencies) for cute/adventure feel
    melodyNotes: [
        523.25, 587.33, 659.25, 783.99, 880.00, // C5, D5, E5, G5, A5
        1046.50, 987.77, 880.00, 783.99, 659.25, // C6, B5, A5, G5, E5
        523.25, 587.33, 783.99, 880.00, 659.25, // variation
        783.99, 659.25, 587.33, 523.25, 440.00, // descending
    ],

    bassNotes: [
        130.81, 130.81, 164.81, 164.81, // C3, C3, E3, E3
        174.61, 174.61, 196.00, 196.00, // F3, F3, G3, G3
        130.81, 164.81, 196.00, 174.61, // C3, E3, G3, F3
        220.00, 196.00, 164.81, 130.81, // A3, G3, E3, C3
    ],

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.15;
            this.musicGain.connect(this.ctx.destination);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.3;
            this.sfxGain.connect(this.ctx.destination);
        } catch (e) {
            // Audio not supported
        }
    },

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    startMusic() {
        if (!this.ctx || this.musicPlaying) return;
        this.musicPlaying = true;
        this.noteIndex = 0;
        this.nextNoteTime = this.ctx.currentTime;
        this.scheduleMusic();
    },

    stopMusic() {
        this.musicPlaying = false;
    },

    // Intro cutscene music - gentle, dreamy lullaby
    introMusicPlaying: false,
    introNoteIndex: 0,
    introNextNoteTime: 0,

    introMelody: [
        392.00, 440.00, 523.25, 587.33, 523.25, 440.00, // G4 A4 C5 D5 C5 A4
        392.00, 349.23, 329.63, 349.23, 392.00, 440.00, // G4 F4 E4 F4 G4 A4
        523.25, 587.33, 659.25, 587.33, 523.25, 440.00, // C5 D5 E5 D5 C5 A4
        392.00, 440.00, 523.25, 392.00, 349.23, 329.63, // G4 A4 C5 G4 F4 E4
    ],
    introBass: [
        196.00, 196.00, 220.00, 220.00, 261.63, 261.63, // G3 G3 A3 A3 C4 C4
        174.61, 174.61, 164.81, 164.81, 196.00, 196.00, // F3 F3 E3 E3 G3 G3
        261.63, 261.63, 293.66, 293.66, 261.63, 261.63, // C4 C4 D4 D4 C4 C4
        196.00, 196.00, 174.61, 174.61, 164.81, 164.81, // G3 G3 F3 F3 E3 E3
    ],

    startIntroMusic() {
        if (!this.ctx || this.introMusicPlaying) return;
        this.introMusicPlaying = true;
        this.introNoteIndex = 0;
        this.introNextNoteTime = this.ctx.currentTime;
        this.scheduleIntroMusic();
    },

    stopIntroMusic() {
        this.introMusicPlaying = false;
    },

    scheduleIntroMusic() {
        if (!this.introMusicPlaying || !this.ctx) return;

        const beatDuration = 60 / 72; // Slow tempo (72 BPM)

        while (this.introNextNoteTime < this.ctx.currentTime + 0.5) {
            const melodyNote = this.introMelody[this.introNoteIndex % this.introMelody.length];
            const bassNote = this.introBass[this.introNoteIndex % this.introBass.length];

            // Melody - sine wave (soft, dreamlike)
            this.playTone(melodyNote, this.introNextNoteTime, beatDuration * 1.2, 'sine', 0.1);
            // Bass - triangle wave (warm)
            this.playTone(bassNote, this.introNextNoteTime, beatDuration * 1.5, 'triangle', 0.06);
            // Shimmer - high octave sine (twinkle)
            if (this.introNoteIndex % 3 === 0) {
                this.playTone(melodyNote * 2, this.introNextNoteTime + beatDuration * 0.3, beatDuration * 0.6, 'sine', 0.03);
            }

            this.introNoteIndex++;
            this.introNextNoteTime += beatDuration;
        }

        if (this.introMusicPlaying) {
            setTimeout(() => this.scheduleIntroMusic(), 200);
        }
    },

    scheduleMusic() {
        if (!this.musicPlaying || !this.ctx) return;

        const beatDuration = 60 / this.tempo;

        while (this.nextNoteTime < this.ctx.currentTime + 0.5) {
            const melodyNote = this.melodyNotes[this.noteIndex % this.melodyNotes.length];
            const bassNote = this.bassNotes[this.noteIndex % this.bassNotes.length];

            // Melody (square wave - 8-bit feel)
            this.playTone(melodyNote, this.nextNoteTime, beatDuration * 0.8, 'square', 0.08);
            // Bass (triangle wave - soft)
            this.playTone(bassNote, this.nextNoteTime, beatDuration * 0.9, 'triangle', 0.1);

            this.noteIndex++;
            this.nextNoteTime += beatDuration;
        }

        if (this.musicPlaying) {
            setTimeout(() => this.scheduleMusic(), 200);
        }
    },

    playTone(freq, startTime, duration, type, volume) {
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(volume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);
    },

    // Sound effects
    playSFX(type) {
        if (!this.ctx) return;
        this.resume();

        switch (type) {
            case 'collect':
                this.playChirp(880, 1100, 0.1);
                break;
            case 'coin':
                this.playChirp(1200, 1500, 0.08);
                setTimeout(() => this.playChirp(1500, 1800, 0.08), 80);
                break;
            case 'hit':
                // Pink wave attack sound - rising chirp
                this.playChirp(600, 1200, 0.08);
                setTimeout(() => this.playChirp(900, 1400, 0.06), 50);
                break;
            case 'damage':
                this.playChirp(300, 150, 0.15);
                this.playNoise(0.08);
                break;
            case 'grow':
                this.playChirp(400, 800, 0.2);
                break;
            case 'portal':
                this.playChirp(500, 1000, 0.3);
                setTimeout(() => this.playChirp(700, 1200, 0.2), 150);
                break;
            case 'error':
                this.playChirp(300, 200, 0.15);
                setTimeout(() => this.playChirp(200, 150, 0.15), 100);
                break;
            case 'victory':
                [0, 100, 200, 300, 400].forEach((delay, i) => {
                    setTimeout(() => this.playChirp(600 + i * 100, 800 + i * 150, 0.15), delay);
                });
                break;
        }
    },

    playChirp(startFreq, endFreq, duration) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(endFreq, this.ctx.currentTime + duration);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration + 0.01);
    },

    playNoise(duration) {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        source.buffer = buffer;
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        source.connect(gain);
        gain.connect(this.sfxGain);
        source.start();
    },

    setMusicVolume(v) {
        if (this.musicGain) this.musicGain.gain.value = v;
    },

    setSFXVolume(v) {
        if (this.sfxGain) this.sfxGain.gain.value = v;
    }
};

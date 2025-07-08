class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.8;
        this.effectsVolume = 0.7;
        this.voiceVolume = 0.9;
        this.isMuted = false;
        
        this.sounds = {
            success: null,
            error: null,
            tick: null,
            gameOver: null,
            start: null
        };
        
        this.speechSynthesis = window.speechSynthesis;
        this.currentVoice = null;
        
        this.initializeAudio();
        this.initializeVoice();
    }
    
    async initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            console.log('🔊 Audio system initialized');
        } catch (error) {
            console.error('❌ Audio initialization failed:', error);
        }
    }
    
    initializeVoice() {
        if (!this.speechSynthesis) {
            console.error('❌ Speech synthesis not supported');
            return;
        }
        
        // Wait for voices to load
        const setVoice = () => {
            const voices = this.speechSynthesis.getVoices();
            
            // Prefer English voices
            this.currentVoice = voices.find(voice => 
                voice.lang.startsWith('en') && 
                (voice.name.includes('Google') || voice.name.includes('Microsoft'))
            ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
            
            console.log(`🗣️ Voice selected: ${this.currentVoice?.name || 'Default'}`);
        };
        
        if (this.speechSynthesis.getVoices().length === 0) {
            this.speechSynthesis.onvoiceschanged = setVoice;
        } else {
            setVoice();
        }
    }
    
    announceCommand(command) {
        if (this.isMuted) return;
        
        const commandText = `${command} IT!`;
        
        // Cancel any ongoing speech
        this.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(commandText);
        utterance.voice = this.currentVoice;
        utterance.volume = this.voiceVolume * this.masterVolume;
        utterance.rate = 1.2; // Slightly faster for urgency
        utterance.pitch = 1.1; // Slightly higher for energy
        
        utterance.onstart = () => {
            console.log(`🗣️ Announcing: "${commandText}"`);
        };
        
        utterance.onerror = (event) => {
            console.error('❌ Speech error:', event.error);
        };
        
        this.speechSynthesis.speak(utterance);
    }
    
    playSound(soundName) {
        if (this.isMuted || !this.audioContext) return;
        
        // Create simple sound effects using Web Audio API
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        const volume = this.effectsVolume * this.masterVolume;
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        
        switch (soundName) {
            case 'success':
                // Happy chord progression
                oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2); // G5
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                break;
                
            case 'error':
                // Descending error sound
                oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime); // A3
                oscillator.frequency.exponentialRampToValueAtTime(110, this.audioContext.currentTime + 0.5); // A2
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                break;
                
            case 'tick':
                // Quick tick sound
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                break;
                
            case 'gameOver':
                // Game over sound
                oscillator.frequency.setValueAtTime(165, this.audioContext.currentTime); // E3
                oscillator.frequency.setValueAtTime(139, this.audioContext.currentTime + 0.2); // C#3
                oscillator.frequency.setValueAtTime(110, this.audioContext.currentTime + 0.4); // A2
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
                break;
                
            case 'start':
                // Start game sound
                oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4
                oscillator.frequency.setValueAtTime(554.37, this.audioContext.currentTime + 0.1); // C#5
                oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.2); // E5
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                break;
        }
        
        oscillator.type = 'sine';
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 1);
    }
    
    playTickSound() {
        this.playSound('tick');
    }
    
    playSuccessSound() {
        this.playSound('success');
    }
    
    playErrorSound() {
        this.playSound('error');
    }
    
    playGameOverSound() {
        this.playSound('gameOver');
    }
    
    playStartSound() {
        this.playSound('start');
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    
    setEffectsVolume(volume) {
        this.effectsVolume = Math.max(0, Math.min(1, volume));
    }
    
    setVoiceVolume(volume) {
        this.voiceVolume = Math.max(0, Math.min(1, volume));
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.speechSynthesis.cancel();
        }
        
        return this.isMuted;
    }
    
    stopAllSounds() {
        this.speechSynthesis.cancel();
    }
    
    getSettings() {
        return {
            masterVolume: this.masterVolume,
            effectsVolume: this.effectsVolume,
            voiceVolume: this.voiceVolume,
            isMuted: this.isMuted
        };
    }
}

export default AudioManager;
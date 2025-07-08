import GameEngine from './GameEngine.js';
import VoiceRecognition from './VoiceRecognition.js';
import AudioManager from './AudioManager.js';

class BopItGame {
    constructor() {
        this.gameEngine = new GameEngine();
        this.voiceRecognition = new VoiceRecognition();
        this.audioManager = new AudioManager();
        
        this.isVoiceEnabled = false;
        this.elements = this.initializeElements();
        
        this.setupEventListeners();
        this.setupGameEngineCallbacks();
        this.setupVoiceCallbacks();
        this.updateUI();
        
        console.log('🎮 Bop-It game initialized!');
    }
    
    initializeElements() {
        return {
            // Score elements
            currentScore: document.getElementById('current-score'),
            currentRound: document.getElementById('current-round'),
            highScore: document.getElementById('high-score'),
            speedLevel: document.getElementById('speed-level'),
            
            // Game display
            commandDisplay: document.getElementById('command-display'),
            currentCommand: document.getElementById('current-command'),
            commandStatus: document.getElementById('command-status'),
            timerFill: document.getElementById('timer-fill'),
            
            // Controls
            startBtn: document.getElementById('start-btn'),
            voiceBtn: document.getElementById('voice-btn'),
            soundBtn: document.getElementById('sound-btn'),
            
            // Voice status
            voiceStatus: document.getElementById('voice-status'),
            voiceIndicator: document.getElementById('voice-indicator'),
            voiceText: document.getElementById('voice-text'),
            
            // Command buttons
            commandButtons: document.getElementById('command-buttons'),
            
            // Game over screen
            gameOverScreen: document.getElementById('game-over-screen'),
            finalScore: document.getElementById('final-score'),
            finalRounds: document.getElementById('final-rounds'),
            highScoreAnnouncement: document.getElementById('high-score-announcement'),
            playAgainBtn: document.getElementById('play-again-btn'),
            closeGameOverBtn: document.getElementById('close-game-over-btn')
        };
    }
    
    setupEventListeners() {
        // Control buttons
        this.elements.startBtn.addEventListener('click', () => this.handleStartGame());
        this.elements.voiceBtn.addEventListener('click', () => this.handleVoiceToggle());
        this.elements.soundBtn.addEventListener('click', () => this.handleSoundToggle());
        
        // Command buttons (fallback for voice)
        this.elements.commandButtons.addEventListener('click', (e) => {
            if (e.target.dataset.command) {
                this.handleCommandInput(e.target.dataset.command);
            }
        });
        
        // Game over screen
        this.elements.playAgainBtn.addEventListener('click', () => this.handlePlayAgain());
        this.elements.closeGameOverBtn.addEventListener('click', () => this.hideGameOver());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    setupGameEngineCallbacks() {
        this.gameEngine.onCommandGenerated = (command) => {
            this.displayCommand(command);
            this.highlightCommandButton(command);
            this.audioManager.announceCommand(command);
        };
        
        this.gameEngine.onScoreUpdate = (score, round) => {
            this.updateScore(score, round);
            this.audioManager.playSuccessSound();
        };
        
        this.gameEngine.onGameEnd = (score, rounds, reason, isHighScore) => {
            this.showGameOver(score, rounds, reason, isHighScore);
            this.audioManager.playGameOverSound();
        };
        
        this.gameEngine.onTimerUpdate = (remainingTime, totalTime) => {
            this.updateTimer(remainingTime, totalTime);
            
            // Play tick sound when time is running low
            if (remainingTime <= 1000 && remainingTime > 900) {
                this.audioManager.playTickSound();
            }
        };
    }
    
    setupVoiceCallbacks() {
        this.voiceRecognition.onCommandRecognized = (command) => {
            this.handleCommandInput(command);
        };
        
        this.voiceRecognition.onVoiceStart = () => {
            this.updateVoiceStatus(true, 'Listening...');
        };
        
        this.voiceRecognition.onVoiceEnd = () => {
            this.updateVoiceStatus(false, 'Voice Ready');
        };
        
        this.voiceRecognition.onError = (error) => {
            this.handleVoiceError(error);
        };
    }
    
    handleStartGame() {
        if (this.gameEngine.state === 'PLAYING') {
            this.gameEngine.resetGame();
            this.elements.startBtn.innerHTML = '<span>🎮</span><span>Start Game</span>';
            this.elements.currentCommand.textContent = 'Ready?';
            this.elements.commandStatus.textContent = 'Click "Start Game" to begin!';
            this.clearCommandHighlight();
            return;
        }
        
        this.gameEngine.startGame();
        this.elements.startBtn.innerHTML = '<span>⏹️</span><span>Stop Game</span>';
        this.audioManager.playStartSound();
        
        // Start voice recognition if enabled
        if (this.isVoiceEnabled) {
            this.voiceRecognition.startListening();
        }
    }
    
    async handleVoiceToggle() {
        if (!this.voiceRecognition.isSupported()) {
            alert('Voice recognition is not supported in this browser. Please use Chrome, Safari, or Edge.');
            return;
        }
        
        if (this.isVoiceEnabled) {
            this.voiceRecognition.stopListening();
            this.isVoiceEnabled = false;
            this.elements.voiceBtn.innerHTML = '<span>🎤</span><span>Enable Voice</span>';
            this.updateVoiceStatus(false, 'Voice Disabled');
        } else {
            // Request microphone permission
            const hasPermission = await this.voiceRecognition.requestPermission();
            if (hasPermission) {
                this.isVoiceEnabled = true;
                this.elements.voiceBtn.innerHTML = '<span>🔇</span><span>Disable Voice</span>';
                this.updateVoiceStatus(false, 'Voice Ready');
                
                // Start listening if game is running
                if (this.gameEngine.state === 'PLAYING') {
                    this.voiceRecognition.startListening();
                }
            } else {
                alert('Microphone access is required for voice commands. Please allow microphone access and try again.');
            }
        }
    }
    
    handleSoundToggle() {
        const isMuted = this.audioManager.toggleMute();
        this.elements.soundBtn.innerHTML = isMuted ? 
            '<span>🔇</span><span>Sound Off</span>' : 
            '<span>🔊</span><span>Sound On</span>';
    }
    
    handleCommandInput(command) {
        if (this.gameEngine.state !== 'PLAYING') return;
        
        const isCorrect = this.gameEngine.processPlayerResponse(command);
        
        if (isCorrect) {
            this.showCommandFeedback(command, true);
        } else {
            this.showCommandFeedback(command, false);
            this.audioManager.playErrorSound();
        }
    }
    
    handleKeyboard(e) {
        if (this.gameEngine.state !== 'PLAYING') return;
        
        const keyMap = {
            'KeyB': 'BOP',
            'KeyT': 'TWIST',
            'KeyP': 'PULL',
            'KeyF': 'FLICK',
            'KeyS': 'SPIN',
            'KeyA': 'PASS'  // A for pAss
        };
        
        const command = keyMap[e.code];
        if (command) {
            this.handleCommandInput(command);
        }
    }
    
    displayCommand(command) {
        this.elements.currentCommand.textContent = `${command} IT!`;
        this.elements.commandStatus.textContent = `Say "${command}" now!`;
        
        // Add animation
        this.elements.currentCommand.style.animation = 'none';
        setTimeout(() => {
            this.elements.currentCommand.style.animation = 'pulse 2s infinite';
        }, 10);
    }
    
    highlightCommandButton(command) {
        this.clearCommandHighlight();
        
        const button = document.querySelector(`[data-command="${command}"]`);
        if (button) {
            button.classList.add('active');
        }
    }
    
    clearCommandHighlight() {
        document.querySelectorAll('.command-btn').forEach(btn => {
            btn.classList.remove('active', 'correct', 'incorrect');
        });
    }
    
    showCommandFeedback(command, isCorrect) {
        const button = document.querySelector(`[data-command="${command}"]`);
        if (button) {
            button.classList.add(isCorrect ? 'correct' : 'incorrect');
            
            setTimeout(() => {
                button.classList.remove('correct', 'incorrect');
            }, 600);
        }
    }
    
    updateScore(score, round) {
        this.elements.currentScore.textContent = score;
        this.elements.currentRound.textContent = round;
        
        // Update speed level display
        this.updateSpeedLevel(round);
    }
    
    updateSpeedLevel(round) {
        let speedLevel = 'Slow';
        if (round <= 2) {
            speedLevel = 'Slow';
        } else if (round <= 4) {
            speedLevel = 'Normal';
        } else if (round <= 6) {
            speedLevel = 'Fast';
        } else if (round <= 8) {
            speedLevel = 'Very Fast';
        } else if (round <= 10) {
            speedLevel = 'Blazing';
        } else if (round <= 12) {
            speedLevel = 'Lightning';
        } else if (round <= 15) {
            speedLevel = 'Extreme';
        } else {
            speedLevel = 'INSANE';
        }
        
        this.elements.speedLevel.textContent = speedLevel;
        
        // Change color based on speed
        if (round <= 4) {
            this.elements.speedLevel.style.color = '#FFD700'; // Gold
        } else if (round <= 8) {
            this.elements.speedLevel.style.color = '#FFA500'; // Orange
        } else if (round <= 12) {
            this.elements.speedLevel.style.color = '#FF6347'; // Red
        } else {
            this.elements.speedLevel.style.color = '#DC143C'; // Dark red
        }
    }
    
    updateTimer(remainingTime, totalTime) {
        const percentage = (remainingTime / totalTime) * 100;
        this.elements.timerFill.style.width = `${Math.max(0, percentage)}%`;
        
        // Change color based on remaining time
        if (percentage > 50) {
            this.elements.timerFill.style.background = 'linear-gradient(90deg, #FFD700, #1E90FF)';
        } else if (percentage > 25) {
            this.elements.timerFill.style.background = 'linear-gradient(90deg, #FFA500, #FF8C00)';
        } else {
            this.elements.timerFill.style.background = 'linear-gradient(90deg, #FF6347, #DC143C)';
        }
    }
    
    updateVoiceStatus(isListening, message) {
        this.elements.voiceText.textContent = `Voice: ${message}`;
        
        if (isListening) {
            this.elements.voiceIndicator.classList.add('active');
        } else {
            this.elements.voiceIndicator.classList.remove('active');
        }
    }
    
    handleVoiceError(error) {
        console.error('Voice error:', error);
        
        switch (error) {
            case 'PERMISSION_DENIED':
                this.updateVoiceStatus(false, 'Permission Denied');
                break;
            case 'BROWSER_NOT_SUPPORTED':
                this.updateVoiceStatus(false, 'Not Supported');
                break;
            default:
                this.updateVoiceStatus(false, 'Error');
        }
    }
    
    showGameOver(score, rounds, reason, isHighScore) {
        this.elements.finalScore.textContent = score;
        this.elements.finalRounds.textContent = rounds;
        
        if (isHighScore) {
            this.elements.highScoreAnnouncement.classList.remove('hidden');
        } else {
            this.elements.highScoreAnnouncement.classList.add('hidden');
        }
        
        this.elements.gameOverScreen.classList.remove('hidden');
        
        // Reset start button
        this.elements.startBtn.innerHTML = '<span>🎮</span><span>Start Game</span>';
        
        // Stop voice recognition
        this.voiceRecognition.stopListening();
        
        // Clear command display
        this.elements.currentCommand.textContent = 'Game Over';
        this.elements.commandStatus.textContent = 'Better luck next time!';
        this.clearCommandHighlight();
    }
    
    hideGameOver() {
        this.elements.gameOverScreen.classList.add('hidden');
    }
    
    handlePlayAgain() {
        this.hideGameOver();
        this.gameEngine.resetGame();
        this.elements.currentCommand.textContent = 'Ready?';
        this.elements.commandStatus.textContent = 'Click "Start Game" to begin!';
        this.elements.timerFill.style.width = '100%';
        this.handleStartGame();
    }
    
    updateUI() {
        const state = this.gameEngine.getCurrentState();
        this.elements.highScore.textContent = state.highScore;
        this.elements.currentScore.textContent = state.score;
        this.elements.currentRound.textContent = state.round;
        
        this.updateSpeedLevel(state.round);
        this.updateVoiceStatus(false, this.voiceRecognition.isSupported() ? 'Voice Ready' : 'Not Supported');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BopItGame();
});

// Export for potential external use
window.BopItGame = BopItGame;
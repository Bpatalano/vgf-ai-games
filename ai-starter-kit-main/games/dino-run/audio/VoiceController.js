/**
 * Voice Controller - Main interface for voice commands in games
 * Handles speech recognition, visual feedback, and game integration
 */
class VoiceController {
    constructor() {
        this.speechRecognizer = new SpeechRecognizer();
        this.isEnabled = false;
        this.visualIndicator = null;
        this.permissionGranted = false;
        
        // Voice activity detection
        this.isVoiceActive = false;
        this.lastVoiceActivity = 0;
        this.voiceTimeout = 2000; // ms
        
        // Command statistics
        this.commandStats = {
            totalCommands: 0,
            successfulCommands: 0,
            jumpCommands: 0,
            flapCommands: 0
        };
        
        this.setupEventHandlers();
        this.createVisualIndicator();
        
        console.log('🎮 Voice Controller initialized');
    }

    setupEventHandlers() {
        // Handle voice commands
        this.speechRecognizer.onCommand('jump', (data) => {
            this.handleJumpCommand(data);
        });

        this.speechRecognizer.onCommand('flap', (data) => {
            this.handleFlapCommand(data);
        });

        // Handle voice events
        this.speechRecognizer.onEvent('voiceDetected', (data) => {
            this.handleVoiceDetected(data);
        });

        this.speechRecognizer.onEvent('soundStart', () => {
            this.isVoiceActive = true;
            this.lastVoiceActivity = Date.now();
            this.updateVisualIndicator();
        });

        this.speechRecognizer.onEvent('soundEnd', () => {
            setTimeout(() => {
                if (Date.now() - this.lastVoiceActivity > this.voiceTimeout) {
                    this.isVoiceActive = false;
                    this.updateVisualIndicator();
                }
            }, this.voiceTimeout);
        });

        this.speechRecognizer.onEvent('interim', (transcript) => {
            this.handleInterimResult(transcript);
        });

        // Handle errors
        this.speechRecognizer.onEvent('error', (errorType) => {
            this.handleError(errorType);
        });

        this.speechRecognizer.onEvent('listeningStarted', () => {
            this.updateVisualIndicator();
        });

        this.speechRecognizer.onEvent('listeningStopped', () => {
            this.updateVisualIndicator();
        });
    }

    createVisualIndicator() {
        this.visualIndicator = new VoiceIndicator();
        this.updateVisualIndicator();
    }

    handleJumpCommand(data) {
        console.log('🦘 Voice JUMP command received!', data);
        
        this.commandStats.totalCommands++;
        this.commandStats.jumpCommands++;
        
        // Flash visual feedback
        this.visualIndicator.flashCommand('JUMP', data.confidence);
        
        // Trigger game action
        if (this.gameCallbacks && this.gameCallbacks.jump) {
            const success = this.gameCallbacks.jump();
            if (success) {
                this.commandStats.successfulCommands++;
                this.visualIndicator.showSuccess();
            }
        }
    }

    handleFlapCommand(data) {
        console.log('🪶 Voice FLAP command received!', data);
        
        this.commandStats.totalCommands++;
        this.commandStats.flapCommands++;
        
        // Flash visual feedback
        this.visualIndicator.flashCommand('FLAP', data.confidence);
        
        // Trigger game action
        if (this.gameCallbacks && this.gameCallbacks.flap) {
            const success = this.gameCallbacks.flap();
            if (success) {
                this.commandStats.successfulCommands++;
                this.visualIndicator.showSuccess();
            }
        }
    }

    handleVoiceDetected(data) {
        this.isVoiceActive = true;
        this.lastVoiceActivity = Date.now();
        this.updateVisualIndicator();
    }

    handleInterimResult(transcript) {
        // Show interim results for real-time feedback
        if (transcript) {
            this.visualIndicator.showInterim(transcript);
        }
    }

    handleError(errorType) {
        switch (errorType) {
            case 'not-supported':
                this.visualIndicator.showError('Voice recognition not supported in this browser');
                break;
            case 'permission-denied':
                this.visualIndicator.showError('Microphone permission denied');
                break;
            case 'microphone-access':
                this.visualIndicator.showError('Cannot access microphone');
                break;
            default:
                this.visualIndicator.showError('Voice recognition error');
        }
    }

    updateVisualIndicator() {
        if (!this.visualIndicator) return;

        const status = {
            enabled: this.isEnabled,
            listening: this.speechRecognizer.isListeningActive(),
            supported: this.speechRecognizer.isRecognitionSupported(),
            voiceActive: this.isVoiceActive,
            permissionGranted: this.permissionGranted
        };

        this.visualIndicator.updateStatus(status);
    }

    // Public methods
    async enable() {
        if (!this.speechRecognizer.isRecognitionSupported()) {
            console.warn('❌ Cannot enable voice control - not supported');
            this.visualIndicator.showError('Voice recognition not supported');
            return false;
        }

        try {
            // Request permission first
            const permission = await this.speechRecognizer.requestPermission();
            
            if (!permission.granted) {
                console.warn('❌ Microphone permission denied');
                this.visualIndicator.showError('Microphone permission required');
                return false;
            }

            this.permissionGranted = true;
            this.isEnabled = true;
            
            // Start listening
            const started = this.speechRecognizer.startListening();
            if (started) {
                console.log('✅ Voice control enabled');
                this.visualIndicator.showMessage('Voice control enabled! Say "JUMP"', 'success');
                this.updateVisualIndicator();
                return true;
            } else {
                this.isEnabled = false;
                return false;
            }
            
        } catch (error) {
            console.error('❌ Failed to enable voice control:', error);
            this.visualIndicator.showError('Failed to enable voice control');
            return false;
        }
    }

    disable() {
        this.isEnabled = false;
        this.speechRecognizer.stopListening();
        console.log('🔇 Voice control disabled');
        this.visualIndicator.showMessage('Voice control disabled', 'info');
        this.updateVisualIndicator();
    }

    toggle() {
        if (this.isEnabled) {
            this.disable();
            return false;
        } else {
            return this.enable();
        }
    }

    // Game integration
    setGameCallbacks(callbacks) {
        this.gameCallbacks = callbacks;
        console.log('🎮 Game callbacks registered for voice control');
    }

    // Utility methods
    setDebugMode(enabled) {
        this.speechRecognizer.setDebugMode(enabled);
    }

    getStatus() {
        return {
            enabled: this.isEnabled,
            supported: this.speechRecognizer.isRecognitionSupported(),
            listening: this.speechRecognizer.isListeningActive(),
            permissionGranted: this.permissionGranted,
            voiceActive: this.isVoiceActive,
            stats: { ...this.commandStats }
        };
    }

    getCommandStats() {
        return { ...this.commandStats };
    }

    resetStats() {
        this.commandStats = {
            totalCommands: 0,
            successfulCommands: 0,
            jumpCommands: 0,
            flapCommands: 0
        };
    }
}

/**
 * Voice Indicator - Visual feedback for voice recognition
 */
class VoiceIndicator {
    constructor() {
        this.container = null;
        this.statusElement = null;
        this.feedbackElement = null;
        this.messageElement = null;
        this.commandElement = null;
        
        this.createUI();
        console.log('👁️ Voice indicator UI created');
    }

    createUI() {
        // Create main container
        this.container = document.createElement('div');
        this.container.className = 'voice-indicator';
        this.container.innerHTML = `
            <div class="voice-status" id="voiceStatus">
                <div class="voice-icon">🎤</div>
                <div class="voice-info">
                    <div class="voice-state">Voice: OFF</div>
                    <div class="voice-feedback" id="voiceFeedback"></div>
                </div>
                <button class="voice-toggle" id="voiceToggle">Enable Voice</button>
            </div>
            <div class="voice-commands" id="voiceCommands">
                <div class="command-hint">Say: "JUMP" or "HOP"</div>
                <div class="command-detected" id="commandDetected"></div>
            </div>
            <div class="voice-message" id="voiceMessage"></div>
        `;

        // Add to page
        document.body.appendChild(this.container);

        // Get references
        this.statusElement = document.getElementById('voiceStatus');
        this.feedbackElement = document.getElementById('voiceFeedback');
        this.messageElement = document.getElementById('voiceMessage');
        this.commandElement = document.getElementById('commandDetected');

        // Setup toggle button
        document.getElementById('voiceToggle').addEventListener('click', () => {
            if (window.viiSportsArcade && window.viiSportsArcade.voiceController) {
                window.viiSportsArcade.voiceController.toggle();
            }
        });

        this.applyStyles();
    }

    applyStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .voice-indicator {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                border-radius: 12px;
                padding: 15px;
                font-family: Arial, sans-serif;
                font-size: 14px;
                z-index: 1000;
                min-width: 250px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                border: 2px solid #333;
            }

            .voice-status {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
            }

            .voice-icon {
                font-size: 20px;
                animation: pulse 2s infinite;
            }

            .voice-info {
                flex: 1;
            }

            .voice-state {
                font-weight: bold;
                margin-bottom: 2px;
            }

            .voice-feedback {
                font-size: 12px;
                color: #aaa;
                min-height: 16px;
            }

            .voice-toggle {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
                transition: background-color 0.3s;
            }

            .voice-toggle:hover {
                background: #45a049;
            }

            .voice-indicator.listening .voice-toggle {
                background: #f44336;
            }

            .voice-indicator.listening .voice-toggle:hover {
                background: #da190b;
            }

            .voice-indicator.listening .voice-icon {
                animation: listening 0.5s infinite alternate;
            }

            .voice-commands {
                border-top: 1px solid #444;
                padding-top: 8px;
                margin-top: 8px;
            }

            .command-hint {
                font-size: 12px;
                color: #888;
                margin-bottom: 5px;
            }

            .command-detected {
                background: #2196F3;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-weight: bold;
                text-align: center;
                min-height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }

            .command-detected.flash {
                animation: commandFlash 0.5s;
            }

            .command-detected.success {
                background: #4CAF50;
            }

            .command-detected.interim {
                background: #FF9800;
                opacity: 0.7;
            }

            .voice-message {
                margin-top: 8px;
                padding: 6px;
                border-radius: 4px;
                font-size: 12px;
                text-align: center;
                transition: all 0.3s;
            }

            .voice-message.success {
                background: rgba(76, 175, 80, 0.2);
                color: #4CAF50;
                border: 1px solid #4CAF50;
            }

            .voice-message.error {
                background: rgba(244, 67, 54, 0.2);
                color: #f44336;
                border: 1px solid #f44336;
            }

            .voice-message.info {
                background: rgba(33, 150, 243, 0.2);
                color: #2196F3;
                border: 1px solid #2196F3;
            }

            .voice-indicator.voice-active {
                border-color: #4CAF50;
                box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
            }

            .voice-indicator.voice-active .voice-icon {
                color: #4CAF50;
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            @keyframes listening {
                0% { transform: scale(1); color: #fff; }
                100% { transform: scale(1.2); color: #4CAF50; }
            }

            @keyframes commandFlash {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); background: #FFD700; }
                100% { transform: scale(1); }
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .voice-indicator {
                    bottom: 10px;
                    right: 10px;
                    left: 10px;
                    min-width: auto;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    updateStatus(status) {
        // Update container classes
        this.container.className = 'voice-indicator';
        if (status.listening) this.container.classList.add('listening');
        if (status.voiceActive) this.container.classList.add('voice-active');

        // Update status text
        const stateElement = this.container.querySelector('.voice-state');
        if (status.enabled && status.listening) {
            stateElement.textContent = 'Voice: LISTENING';
        } else if (status.enabled) {
            stateElement.textContent = 'Voice: ENABLED';
        } else {
            stateElement.textContent = 'Voice: OFF';
        }

        // Update toggle button
        const toggleButton = document.getElementById('voiceToggle');
        if (status.enabled) {
            toggleButton.textContent = 'Disable Voice';
        } else {
            toggleButton.textContent = 'Enable Voice';
        }

        // Update feedback
        if (!status.supported) {
            this.feedbackElement.textContent = 'Not supported in this browser';
        } else if (!status.permissionGranted) {
            this.feedbackElement.textContent = 'Permission required';
        } else if (status.listening) {
            this.feedbackElement.textContent = 'Listening for commands...';
        } else {
            this.feedbackElement.textContent = 'Ready';
        }
    }

    flashCommand(command, confidence) {
        this.commandElement.textContent = `${command}!`;
        this.commandElement.className = 'command-detected flash';
        
        if (confidence && confidence > 0.8) {
            this.commandElement.classList.add('success');
        }

        setTimeout(() => {
            this.commandElement.className = 'command-detected';
            setTimeout(() => {
                this.commandElement.textContent = '';
            }, 1000);
        }, 500);
    }

    showSuccess() {
        this.commandElement.classList.add('success');
        setTimeout(() => {
            this.commandElement.classList.remove('success');
        }, 1000);
    }

    showInterim(transcript) {
        this.commandElement.textContent = transcript;
        this.commandElement.className = 'command-detected interim';
        
        // Clear after short delay
        setTimeout(() => {
            if (this.commandElement.classList.contains('interim')) {
                this.commandElement.textContent = '';
                this.commandElement.className = 'command-detected';
            }
        }, 1000);
    }

    showMessage(message, type = 'info') {
        this.messageElement.textContent = message;
        this.messageElement.className = `voice-message ${type}`;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.messageElement.textContent = '';
            this.messageElement.className = 'voice-message';
        }, 3000);
    }

    showError(message) {
        this.showMessage(message, 'error');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VoiceController, VoiceIndicator };
}
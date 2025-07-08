/**
 * Speech Recognizer - Web Speech API wrapper for voice commands
 * Handles browser compatibility and voice command detection
 */
class SpeechRecognizer {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.isSupported = false;
        this.callbacks = {};
        this.lastCommandTime = 0;
        this.commandCooldown = 300; // ms between commands
        
        // Recognition settings
        this.language = 'en-US';
        this.continuous = true;
        this.interimResults = true;
        this.maxAlternatives = 3;
        
        // Debug mode
        this.debugMode = false;
        
        this.initializeRecognition();
        console.log('🎤 Speech Recognizer initialized');
    }

    initializeRecognition() {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('❌ Speech Recognition not supported in this browser');
            this.isSupported = false;
            return;
        }

        this.isSupported = true;
        this.recognition = new SpeechRecognition();
        
        // Configure recognition
        this.recognition.continuous = this.continuous;
        this.recognition.interimResults = this.interimResults;
        this.recognition.lang = this.language;
        this.recognition.maxAlternatives = this.maxAlternatives;
        
        this.setupEventHandlers();
        console.log('✅ Speech Recognition configured');
    }

    setupEventHandlers() {
        // Handle recognition results
        this.recognition.onresult = (event) => {
            this.handleResults(event);
        };

        // Handle recognition end
        this.recognition.onend = () => {
            if (this.debugMode) {
                console.log('🎤 Recognition ended');
            }
            
            // Restart recognition if it was supposed to be listening
            if (this.isListening) {
                setTimeout(() => {
                    this.startListening();
                }, 100);
            }
        };

        // Handle recognition start
        this.recognition.onstart = () => {
            if (this.debugMode) {
                console.log('🎤 Recognition started');
            }
        };

        // Handle errors
        this.recognition.onerror = (event) => {
            console.warn(`🎤 Speech recognition error: ${event.error}`);
            
            // Handle specific errors
            switch (event.error) {
                case 'no-speech':
                    if (this.debugMode) {
                        console.log('🔇 No speech detected');
                    }
                    break;
                case 'audio-capture':
                    console.error('❌ Microphone access denied or unavailable');
                    this.triggerCallback('error', 'microphone-access');
                    break;
                case 'not-allowed':
                    console.error('❌ Microphone permission denied');
                    this.triggerCallback('error', 'permission-denied');
                    break;
                case 'network':
                    console.warn('⚠️ Network error during speech recognition');
                    break;
                default:
                    console.warn(`⚠️ Unknown speech recognition error: ${event.error}`);
            }
        };

        // Handle sound detection
        this.recognition.onsoundstart = () => {
            if (this.debugMode) {
                console.log('🔊 Sound detected');
            }
            this.triggerCallback('soundStart');
        };

        this.recognition.onsoundend = () => {
            if (this.debugMode) {
                console.log('🔇 Sound ended');
            }
            this.triggerCallback('soundEnd');
        };
    }

    handleResults(event) {
        const currentTime = Date.now();
        
        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            
            if (result.isFinal) {
                const transcript = result[0].transcript.toLowerCase().trim();
                const confidence = result[0].confidence;
                
                if (this.debugMode) {
                    console.log(`🎤 Heard: "${transcript}" (confidence: ${confidence?.toFixed(2) || 'unknown'})`);
                }
                
                // Check cooldown to prevent spam
                if (currentTime - this.lastCommandTime < this.commandCooldown) {
                    if (this.debugMode) {
                        console.log('⏰ Command ignored - too soon after last command');
                    }
                    continue;
                }
                
                // Process the command
                this.processCommand(transcript, confidence);
                this.lastCommandTime = currentTime;
            } else {
                // Interim results for real-time feedback
                const interimTranscript = result[0].transcript.toLowerCase().trim();
                if (interimTranscript && this.debugMode) {
                    console.log(`🎤 Interim: "${interimTranscript}"`);
                }
                this.triggerCallback('interim', interimTranscript);
            }
        }
    }

    processCommand(transcript, confidence) {
        // Define command mappings with variations
        const commandMappings = {
            jump: [
                'jump', 'jumped', 'jumping',
                'hop', 'hopped', 'hopping',
                'up', 'leap', 'go up',
                'jup', 'jump up', 'hop up'
            ],
            flap: [
                'flap', 'flapped', 'flapping',
                'fly', 'flying', 'go',
                'flab', 'flag', 'clap'  // Common misheard words
            ]
        };

        // Check for jump commands
        if (this.matchesCommand(transcript, commandMappings.jump)) {
            console.log(`🦘 JUMP command detected: "${transcript}"`);
            this.triggerCallback('jump', { transcript, confidence });
            this.triggerCallback('voiceDetected', { command: 'jump', transcript, confidence });
            return;
        }

        // Check for flap commands (for future Flappy Bird)
        if (this.matchesCommand(transcript, commandMappings.flap)) {
            console.log(`🪶 FLAP command detected: "${transcript}"`);
            this.triggerCallback('flap', { transcript, confidence });
            this.triggerCallback('voiceDetected', { command: 'flap', transcript, confidence });
            return;
        }

        // Log unrecognized speech in debug mode
        if (this.debugMode) {
            console.log(`❓ Unrecognized command: "${transcript}"`);
        }
    }

    matchesCommand(transcript, commandWords) {
        // Check if transcript contains any of the command words
        return commandWords.some(word => {
            // Exact match
            if (transcript === word) return true;
            
            // Contains word with word boundaries
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            return regex.test(transcript);
        });
    }

    // Public methods
    startListening() {
        if (!this.isSupported) {
            console.warn('❌ Cannot start listening - Speech Recognition not supported');
            this.triggerCallback('error', 'not-supported');
            return false;
        }

        if (this.isListening) {
            if (this.debugMode) {
                console.log('⚠️ Already listening');
            }
            return true;
        }

        try {
            this.recognition.start();
            this.isListening = true;
            console.log('🎤 Started listening for voice commands');
            this.triggerCallback('listeningStarted');
            return true;
        } catch (error) {
            console.error('❌ Failed to start listening:', error);
            this.triggerCallback('error', 'start-failed');
            return false;
        }
    }

    stopListening() {
        if (!this.isListening) {
            return;
        }

        this.isListening = false;
        
        try {
            this.recognition.stop();
            console.log('🔇 Stopped listening for voice commands');
            this.triggerCallback('listeningStopped');
        } catch (error) {
            console.warn('⚠️ Error stopping recognition:', error);
        }
    }

    toggleListening() {
        if (this.isListening) {
            this.stopListening();
            return false;
        } else {
            return this.startListening();
        }
    }

    // Event handling
    onCommand(command, callback) {
        this.callbacks[command] = callback;
    }

    onEvent(eventName, callback) {
        this.callbacks[eventName] = callback;
    }

    triggerCallback(eventName, data) {
        if (this.callbacks[eventName]) {
            this.callbacks[eventName](data);
        }
    }

    // Utility methods
    isListeningActive() {
        return this.isListening;
    }

    isRecognitionSupported() {
        return this.isSupported;
    }

    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`🐛 Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    getStatus() {
        return {
            supported: this.isSupported,
            listening: this.isListening,
            language: this.language,
            debugMode: this.debugMode
        };
    }

    // Request microphone permission explicitly
    async requestPermission() {
        if (!this.isSupported) {
            return { granted: false, error: 'not-supported' };
        }

        try {
            // Try to access microphone
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Stop the stream immediately - we just needed permission
            stream.getTracks().forEach(track => track.stop());
            
            console.log('✅ Microphone permission granted');
            return { granted: true };
        } catch (error) {
            console.error('❌ Microphone permission denied:', error);
            return { granted: false, error: error.name };
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpeechRecognizer;
}
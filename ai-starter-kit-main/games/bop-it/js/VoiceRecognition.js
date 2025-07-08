class VoiceRecognition {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.commands = ['BOP', 'TWIST', 'PULL', 'FLICK', 'SPIN', 'PASS'];
        this.lastRecognitionTime = 0;
        this.confidenceThreshold = 0.7;
        
        this.onCommandRecognized = null;
        this.onVoiceStart = null;
        this.onVoiceEnd = null;
        this.onError = null;
        
        this.initializeRecognition();
    }
    
    initializeRecognition() {
        // Check for browser support
        if (!window.webkitSpeechRecognition && !window.SpeechRecognition) {
            console.error('❌ Speech recognition not supported in this browser');
            if (this.onError) {
                this.onError('BROWSER_NOT_SUPPORTED');
            }
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure recognition settings
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 3;
        
        // Set up event handlers
        this.setupEventHandlers();
        
        console.log('🎤 Voice recognition initialized');
    }
    
    setupEventHandlers() {
        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('🎤 Voice recognition started');
            if (this.onVoiceStart) {
                this.onVoiceStart();
            }
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            console.log('🎤 Voice recognition ended');
            if (this.onVoiceEnd) {
                this.onVoiceEnd();
            }
            
            // Auto-restart if we should still be listening
            if (this.shouldRestart) {
                setTimeout(() => {
                    this.startListening();
                }, 100);
            }
        };
        
        this.recognition.onresult = (event) => {
            this.handleSpeechResult(event);
        };
        
        this.recognition.onerror = (event) => {
            console.error('🎤 Voice recognition error:', event.error);
            
            if (event.error === 'not-allowed') {
                if (this.onError) {
                    this.onError('PERMISSION_DENIED');
                }
            } else if (event.error === 'no-speech') {
                // This is normal, just restart
                return;
            } else {
                if (this.onError) {
                    this.onError('RECOGNITION_ERROR');
                }
            }
        };
    }
    
    handleSpeechResult(event) {
        const now = Date.now();
        
        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript.trim().toUpperCase();
            const confidence = result[0].confidence || 0;
            const isFinal = result.isFinal;
            
            // Log for debugging
            console.log(`🎤 ${isFinal ? 'Final' : 'Interim'}: \"${transcript}\" (confidence: ${confidence.toFixed(2)})`);
            
            // Check if transcript contains any of our commands
            const recognizedCommand = this.extractCommand(transcript);
            
            if (recognizedCommand) {
                // Prevent duplicate rapid-fire commands
                if (now - this.lastRecognitionTime < 500) {
                    console.log('🎤 Ignoring rapid duplicate command');
                    continue;
                }
                
                // Check confidence for final results
                if (isFinal && confidence < this.confidenceThreshold) {
                    console.log(`🎤 Low confidence (${confidence.toFixed(2)}), ignoring`);
                    continue;
                }
                
                // For interim results, be more lenient to improve responsiveness
                if (!isFinal && confidence > 0.5) {
                    this.processRecognizedCommand(recognizedCommand);
                    this.lastRecognitionTime = now;
                } else if (isFinal) {
                    this.processRecognizedCommand(recognizedCommand);
                    this.lastRecognitionTime = now;
                }
            }
        }
    }
    
    extractCommand(transcript) {
        // Clean up transcript
        const cleanTranscript = transcript.replace(/[^A-Z\\s]/g, '');
        
        // Check for exact matches first
        for (const command of this.commands) {
            if (cleanTranscript === command) {
                return command;
            }
        }
        
        // Check for partial matches (useful for quick responses)
        for (const command of this.commands) {
            // Check if command is at the start of transcript
            if (cleanTranscript.startsWith(command)) {
                return command;
            }
            
            // Check if command is a separate word in transcript
            const words = cleanTranscript.split(/\\s+/);
            if (words.includes(command)) {
                return command;
            }
            
            // Check for partial word matches (minimum 3 characters)
            if (command.length >= 3) {
                const partial = command.substring(0, 3);
                if (words.some(word => word.startsWith(partial))) {
                    return command;
                }
            }
        }
        
        return null;
    }
    
    processRecognizedCommand(command) {
        console.log(`✅ Command recognized: ${command}`);
        
        if (this.onCommandRecognized) {
            this.onCommandRecognized(command);
        }
    }
    
    startListening() {
        if (!this.recognition) {
            console.error('❌ Voice recognition not initialized');
            return false;
        }
        
        if (this.isListening) {
            return true;
        }
        
        try {
            this.shouldRestart = true;
            this.recognition.start();
            return true;
        } catch (error) {
            console.error('❌ Failed to start voice recognition:', error);
            if (this.onError) {
                this.onError('START_FAILED');
            }
            return false;
        }
    }
    
    stopListening() {
        if (!this.recognition || !this.isListening) {
            return;
        }
        
        this.shouldRestart = false;
        this.recognition.stop();
    }
    
    async requestPermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Stop the stream immediately, we just needed permission
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.error('❌ Microphone permission denied:', error);
            return false;
        }
    }
    
    isSupported() {
        return !!(window.webkitSpeechRecognition || window.SpeechRecognition);
    }
    
    getStatus() {
        return {
            isSupported: this.isSupported(),
            isListening: this.isListening,
            hasRecognition: !!this.recognition
        };
    }
}

export default VoiceRecognition;
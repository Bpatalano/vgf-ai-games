# [Voice Integration] Step 4: Implement Voice Command System

## 🚨 Mandatory Reading
Before starting ANY work:
1. **MUST READ**: [.cursor/rules/CRITICAL_CORE.mdc](.cursor/rules/CRITICAL_CORE.mdc) - Universal development principles
2. Review the acceptance criteria below

## 🎯 Overview
**Parent Issue**: #1 (Vii Sports Arcade - Flappy Bird & Dino Run)
**Blocks**: #6 (GPT Integration)
**Depends On**: #2 (Core Game Engine), #3 (Dino Run), #4 (Flappy Bird)
**Estimated Time**: 2 days
**Difficulty**: Hard

## 📍 Context for Newcomers
This adds voice control to both games using the Web Speech API. Players will say "flap" to control the bird and "jump" to control the dino. We need to handle speech recognition, filter out false positives, and provide fallback controls. This is the core feature that makes these games unique.

## 📂 Files to Create/Modify

### New Files to Create:
- `src/audio/VoiceController.js` - Main voice recognition system
- `src/audio/SpeechRecognizer.js` - Web Speech API wrapper
- `src/audio/CommandProcessor.js` - Process and validate voice commands
- `src/audio/NoiseFilter.js` - Filter background noise and false positives
- `src/ui/VoiceIndicator.js` - Visual feedback for voice detection

### Files to Modify:
- `src/games/DinoRun.js` - Integrate voice commands for jumping
- `src/games/FlappyBird.js` - Integrate voice commands for flapping
- `src/index.html` - Add voice control UI elements
- `src/styles/main.css` - Voice indicator styling

## ✅ Acceptance Criteria
- [ ] Voice recognition works for "flap" and "jump" commands
- [ ] Alternative voice commands work ("go", "hop", "up")
- [ ] False positives are filtered out (background noise, similar words)
- [ ] Visual feedback shows when voice is detected
- [ ] Fallback keyboard controls remain functional
- [ ] Voice recognition can be toggled on/off
- [ ] Works on both desktop and mobile browsers
- [ ] Minimal latency between voice command and game action
- [ ] Voice recognition automatically restarts if it stops

## 🏗️ Implementation Guide

### Step 1: Create Voice Recognition System
```javascript
// src/audio/SpeechRecognizer.js
class SpeechRecognizer {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.callbacks = {};
        this.initRecognition();
    }

    initRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('Speech recognition not supported');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        this.recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            if (result.isFinal) {
                const transcript = result[0].transcript.toLowerCase().trim();
                this.processCommand(transcript);
            }
        };

        this.recognition.onend = () => {
            if (this.isListening) {
                // Restart recognition if it stops unexpectedly
                setTimeout(() => this.start(), 100);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };
    }

    processCommand(transcript) {
        // Define command mappings
        const commands = {
            flap: ['flap', 'flab', 'flag', 'go', 'up'],
            jump: ['jump', 'hop', 'jup', 'jump up', 'up']
        };

        // Check for flap commands
        if (commands.flap.some(cmd => transcript.includes(cmd))) {
            this.triggerCallback('flap');
        }

        // Check for jump commands
        if (commands.jump.some(cmd => transcript.includes(cmd))) {
            this.triggerCallback('jump');
        }
    }

    start() {
        if (this.recognition && !this.isListening) {
            this.isListening = true;
            this.recognition.start();
        }
    }

    stop() {
        if (this.recognition && this.isListening) {
            this.isListening = false;
            this.recognition.stop();
        }
    }

    onCommand(command, callback) {
        this.callbacks[command] = callback;
    }

    triggerCallback(command) {
        if (this.callbacks[command]) {
            this.callbacks[command]();
        }
    }
}
```

### Step 2: Create Voice Controller
```javascript
// src/audio/VoiceController.js
class VoiceController {
    constructor() {
        this.speechRecognizer = new SpeechRecognizer();
        this.isEnabled = false;
        this.lastCommandTime = 0;
        this.commandCooldown = 200; // Prevent rapid-fire commands
        this.visualIndicator = new VoiceIndicator();
    }

    enable() {
        this.isEnabled = true;
        this.speechRecognizer.start();
        this.visualIndicator.show();
    }

    disable() {
        this.isEnabled = false;
        this.speechRecognizer.stop();
        this.visualIndicator.hide();
    }

    onFlap(callback) {
        this.speechRecognizer.onCommand('flap', () => {
            if (this.canExecuteCommand()) {
                this.visualIndicator.flash('flap');
                callback();
                this.lastCommandTime = Date.now();
            }
        });
    }

    onJump(callback) {
        this.speechRecognizer.onCommand('jump', () => {
            if (this.canExecuteCommand()) {
                this.visualIndicator.flash('jump');
                callback();
                this.lastCommandTime = Date.now();
            }
        });
    }

    canExecuteCommand() {
        return this.isEnabled && 
               (Date.now() - this.lastCommandTime) > this.commandCooldown;
    }

    toggle() {
        if (this.isEnabled) {
            this.disable();
        } else {
            this.enable();
        }
    }
}
```

### Step 3: Create Visual Indicator
```javascript
// src/ui/VoiceIndicator.js
class VoiceIndicator {
    constructor() {
        this.container = null;
        this.createUI();
    }

    createUI() {
        this.container = document.createElement('div');
        this.container.className = 'voice-indicator';
        this.container.innerHTML = `
            <div class="voice-status">
                <div class="voice-icon">🎤</div>
                <div class="voice-text">Voice Control: OFF</div>
            </div>
            <div class="voice-commands">
                <div class="command">Say "FLAP" or "JUMP"</div>
            </div>
        `;
        document.body.appendChild(this.container);
    }

    show() {
        this.container.querySelector('.voice-text').textContent = 'Voice Control: ON';
        this.container.classList.add('active');
    }

    hide() {
        this.container.querySelector('.voice-text').textContent = 'Voice Control: OFF';
        this.container.classList.remove('active');
    }

    flash(command) {
        const commandElement = this.container.querySelector('.command');
        commandElement.textContent = `Heard: "${command.toUpperCase()}"`;
        commandElement.classList.add('flash');
        
        setTimeout(() => {
            commandElement.textContent = 'Say "FLAP" or "JUMP"';
            commandElement.classList.remove('flash');
        }, 1000);
    }
}
```

### Step 4: Integrate with Games
```javascript
// Modifications to src/games/DinoRun.js
class DinoRun extends GameEngine {
    constructor(canvas) {
        super(canvas);
        // ... existing code ...
        
        // Add voice control
        this.voiceController = new VoiceController();
        this.voiceController.onJump(() => this.jump());
        
        // Add keyboard fallback
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.jump();
            }
        });
    }

    enableVoiceControl() {
        this.voiceController.enable();
    }

    disableVoiceControl() {
        this.voiceController.disable();
    }
}
```

## 🧪 Testing Instructions

1. **Voice Recognition Testing**:
   - Test all command variations: "flap", "jump", "go", "hop", "up"
   - Test with background noise (music, TV)
   - Test with different accents and speaking speeds
   - Verify commands don't trigger from normal conversation

2. **Performance Testing**:
   - Measure latency from voice command to game action
   - Should be under 200ms for good user experience
   - Test continuous gameplay for 5 minutes
   - Check that recognition restarts automatically

3. **Cross-browser Testing**:
   - Test on Chrome, Firefox, Safari, Edge
   - Test on mobile devices (iOS Safari, Android Chrome)
   - Verify graceful fallback when speech recognition unavailable

## 🚫 Out of Scope
- Advanced noise cancellation algorithms
- Custom wake word detection
- Multi-language support
- Voice training or calibration
- Offline voice recognition

## 💡 Tips for Success
- Keep command words short and distinct
- Add visual feedback for all voice interactions
- Test with different microphone sensitivities
- Handle permission requests gracefully
- Provide clear instructions to users

## 🔗 Resources
- [Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Speech Recognition Best Practices](https://developers.google.com/web/updates/2013/01/Voice-Driven-Web-Apps-Introduction-to-the-Web-Speech-API)

---

**Success looks like**: Both games can be played entirely with voice commands, with responsive feedback and reliable recognition.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
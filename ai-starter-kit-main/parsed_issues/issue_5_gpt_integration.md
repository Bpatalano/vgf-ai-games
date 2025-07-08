# [GPT Integration] Step 5: Add AI Commentary and Reactions

## 🚨 Mandatory Reading
Before starting ANY work:
1. **MUST READ**: [.cursor/rules/CRITICAL_CORE.mdc](.cursor/rules/CRITICAL_CORE.mdc) - Universal development principles
2. Review the acceptance criteria below

## 🎯 Overview
**Parent Issue**: #1 (Vii Sports Arcade - Flappy Bird & Dino Run)
**Blocks**: #6 (Final Integration and Polish)
**Depends On**: #2 (Core Game Engine), #3 (Dino Run), #4 (Flappy Bird), #5 (Voice Integration)
**Estimated Time**: 2 days
**Difficulty**: Hard

## 📍 Context for Newcomers
This adds GPT-4o integration to provide real-time commentary and reactions during gameplay. The AI will react to player performance, provide encouragement, and add humor to make the games more engaging. Think of it as having a witty commentator watching you play.

## 📂 Files to Create/Modify

### New Files to Create:
- `src/ai/GPTController.js` - Main GPT integration controller
- `src/ai/GameAnalyzer.js` - Analyzes gameplay for AI context
- `src/ai/CommentaryGenerator.js` - Generates contextual comments
- `src/ai/TextToSpeech.js` - Converts AI responses to speech
- `src/ui/CommentaryDisplay.js` - Shows AI comments on screen

### Files to Modify:
- `src/games/DinoRun.js` - Integrate AI commentary
- `src/games/FlappyBird.js` - Integrate AI commentary
- `src/index.html` - Add commentary UI elements
- `src/styles/main.css` - Commentary styling

## ✅ Acceptance Criteria
- [ ] GPT provides contextual commentary during gameplay
- [ ] AI reacts to close calls, crashes, and achievements
- [ ] Commentary is humorous and encouraging
- [ ] AI can be toggled on/off during gameplay
- [ ] Text-to-speech works for AI commentary
- [ ] Commentary doesn't interfere with game performance
- [ ] AI responses are appropriate and family-friendly
- [ ] Commentary adapts to player skill level
- [ ] Rate limiting prevents excessive API calls

## 🏗️ Implementation Guide

### Step 1: Create GPT Controller
```javascript
// src/ai/GPTController.js
class GPTController {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.isEnabled = false;
        this.lastCommentTime = 0;
        this.commentCooldown = 3000; // 3 seconds between comments
        this.gameAnalyzer = new GameAnalyzer();
        this.commentaryGenerator = new CommentaryGenerator();
        this.textToSpeech = new TextToSpeech();
        this.display = new CommentaryDisplay();
    }

    enable() {
        this.isEnabled = true;
        this.display.show();
        this.display.addComment("AI Commentary enabled! Let's see what you've got! 🎮");
    }

    disable() {
        this.isEnabled = false;
        this.display.hide();
    }

    async analyzeGameEvent(event, gameState) {
        if (!this.isEnabled || !this.canComment()) return;

        const context = this.gameAnalyzer.analyzeEvent(event, gameState);
        const commentary = await this.commentaryGenerator.generateComment(context);
        
        if (commentary) {
            this.display.addComment(commentary);
            this.textToSpeech.speak(commentary);
            this.lastCommentTime = Date.now();
        }
    }

    canComment() {
        return (Date.now() - this.lastCommentTime) > this.commentCooldown;
    }

    async callGPT(prompt) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a witty game commentator. Keep responses under 15 words. Be encouraging and humorous.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 50,
                    temperature: 0.8
                })
            });

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('GPT API error:', error);
            return null;
        }
    }
}
```

### Step 2: Create Game Analyzer
```javascript
// src/ai/GameAnalyzer.js
class GameAnalyzer {
    constructor() {
        this.previousState = null;
        this.events = [];
    }

    analyzeEvent(event, gameState) {
        const context = {
            event: event,
            score: gameState.score,
            strikes: gameState.strikes,
            gameSpeed: gameState.gameSpeed || 1,
            difficulty: this.calculateDifficulty(gameState),
            performance: this.calculatePerformance(gameState)
        };

        // Store event for pattern analysis
        this.events.push({ ...context, timestamp: Date.now() });
        
        // Keep only recent events
        if (this.events.length > 20) {
            this.events = this.events.slice(-20);
        }

        this.previousState = gameState;
        return context;
    }

    calculateDifficulty(gameState) {
        if (gameState.gameSpeed) {
            // Dino Run - difficulty increases with speed
            return Math.min(gameState.gameSpeed, 3);
        } else {
            // Flappy Bird - difficulty based on score
            if (gameState.score < 5) return 'easy';
            if (gameState.score < 15) return 'medium';
            return 'hard';
        }
    }

    calculatePerformance(gameState) {
        const recentEvents = this.events.slice(-5);
        const crashes = recentEvents.filter(e => e.event === 'collision').length;
        const closeCallsEvents = recentEvents.filter(e => e.event === 'close_call').length;
        
        if (crashes > 2) return 'struggling';
        if (closeCallsEvents > 3) return 'risky';
        if (gameState.score > 10) return 'skilled';
        return 'learning';
    }
}
```

### Step 3: Create Commentary Generator
```javascript
// src/ai/CommentaryGenerator.js
class CommentaryGenerator {
    constructor() {
        this.gptController = null;
        this.localComments = {
            collision: [
                "Ouch! That's gonna leave a mark! 🤕",
                "Well, that didn't go as planned! 😅",
                "Physics: 1, Player: 0",
                "That cactus came out of nowhere! 🌵"
            ],
            close_call: [
                "Phew! That was close! 😰",
                "Threading the needle! Nice! 🎯",
                "My heart skipped a beat! 💓",
                "Millimeter perfect! 🎖️"
            ],
            achievement: [
                "Now we're cooking! 🔥",
                "Look at you go! 🚀",
                "You're in the zone! ⚡",
                "Unstoppable! 💪"
            ],
            game_over: [
                "Good run! Ready for round two? 🎮",
                "Practice makes perfect! 🎯",
                "You've got this! Try again! 💪",
                "Every failure is a lesson! 📚"
            ]
        };
    }

    setGPTController(gptController) {
        this.gptController = gptController;
    }

    async generateComment(context) {
        // Use GPT for special moments, local comments for frequent events
        if (this.shouldUseGPT(context)) {
            return await this.generateGPTComment(context);
        } else {
            return this.getLocalComment(context);
        }
    }

    shouldUseGPT(context) {
        // Use GPT for high scores, comebacks, or unique situations
        return context.score > 15 || 
               context.performance === 'skilled' ||
               context.event === 'streak' ||
               Math.random() < 0.3; // 30% chance for variety
    }

    async generateGPTComment(context) {
        if (!this.gptController) return null;

        const prompt = `Player just ${context.event} in a voice-controlled game. 
                       Score: ${context.score}, Strikes: ${context.strikes}, 
                       Performance: ${context.performance}, Difficulty: ${context.difficulty}. 
                       Give a short, encouraging comment.`;

        return await this.gptController.callGPT(prompt);
    }

    getLocalComment(context) {
        const comments = this.localComments[context.event];
        if (!comments) return null;
        
        return comments[Math.floor(Math.random() * comments.length)];
    }
}
```

### Step 4: Create Text-to-Speech
```javascript
// src/ai/TextToSpeech.js
class TextToSpeech {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.voice = null;
        this.isEnabled = true;
        this.initVoice();
    }

    initVoice() {
        if (!this.synthesis) return;

        const voices = this.synthesis.getVoices();
        // Prefer English voices
        this.voice = voices.find(v => v.lang.includes('en')) || voices[0];
        
        if (!this.voice) {
            // Wait for voices to load
            this.synthesis.onvoiceschanged = () => {
                const voices = this.synthesis.getVoices();
                this.voice = voices.find(v => v.lang.includes('en')) || voices[0];
            };
        }
    }

    speak(text) {
        if (!this.isEnabled || !this.synthesis || !this.voice) return;

        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.voice;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.7;

        this.synthesis.speak(utterance);
    }

    toggle() {
        this.isEnabled = !this.isEnabled;
        if (!this.isEnabled) {
            this.synthesis.cancel();
        }
    }
}
```

### Step 5: Integrate with Games
```javascript
// Modifications to src/games/DinoRun.js
class DinoRun extends GameEngine {
    constructor(canvas) {
        super(canvas);
        // ... existing code ...
        
        // Add GPT commentary
        this.gptController = new GPTController('your-api-key-here');
        this.lastScore = 0;
        this.consecutiveJumps = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // ... existing update code ...
        
        // Analyze game events for AI commentary
        this.analyzeGameEvents();
    }

    analyzeGameEvents() {
        // Score milestone reached
        if (Math.floor(this.score / 10) > Math.floor(this.lastScore / 10)) {
            this.gptController.analyzeGameEvent('achievement', {
                score: Math.floor(this.score),
                strikes: this.dino.strikes,
                gameSpeed: this.gameSpeed
            });
        }

        this.lastScore = this.score;
    }

    jump() {
        super.jump();
        this.consecutiveJumps++;
        
        // Detect close calls (jumping just in time)
        const nearbyObstacles = this.obstacles.filter(obs => 
            Math.abs(obs.position.x - this.dino.position.x) < 100
        );
        
        if (nearbyObstacles.length > 0) {
            this.gptController.analyzeGameEvent('close_call', {
                score: Math.floor(this.score),
                strikes: this.dino.strikes,
                gameSpeed: this.gameSpeed
            });
        }
    }

    gameOver() {
        super.gameOver();
        this.gptController.analyzeGameEvent('game_over', {
            score: Math.floor(this.score),
            strikes: this.dino.strikes,
            gameSpeed: this.gameSpeed
        });
    }
}
```

## 🧪 Testing Instructions

1. **AI Commentary Testing**:
   - Play both games and verify appropriate comments
   - Test different performance levels (beginner, skilled)
   - Verify comments don't spam or interrupt gameplay
   - Check that text-to-speech works clearly

2. **API Integration Testing**:
   - Test with valid API key
   - Test with invalid API key (should fall back to local comments)
   - Verify rate limiting prevents excessive API calls
   - Test offline behavior

3. **Performance Testing**:
   - Commentary should not affect game frame rate
   - API calls should be asynchronous
   - Test with slow internet connection

## 🚫 Out of Scope
- Advanced AI training or machine learning
- Custom voice synthesis
- Multi-language commentary
- Player profiling or data collection
- Real-time strategy suggestions

## 💡 Tips for Success
- Keep API calls minimal to avoid rate limits
- Use local fallbacks for common events
- Test with various API response times
- Make commentary optional and easily disabled
- Ensure family-friendly content

## 🔗 Resources
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Web Speech API - Text to Speech](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)

---

**Success looks like**: Both games have engaging AI commentary that enhances the experience without disrupting gameplay.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
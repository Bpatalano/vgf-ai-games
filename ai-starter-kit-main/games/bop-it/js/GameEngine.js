class GameEngine {
    constructor() {
        this.state = 'START'; // START, PLAYING, GAME_OVER
        this.score = 0;
        this.round = 1;
        this.currentCommand = null;
        this.commandStartTime = 0;
        this.responseTimeLimit = 3000; // milliseconds
        this.commands = ['BOP', 'TWIST', 'PULL', 'FLICK', 'SPIN', 'PASS'];
        this.lastCommand = null;
        this.gameTimer = null;
        this.highScore = this.getHighScore();
        
        this.onCommandGenerated = null;
        this.onScoreUpdate = null;
        this.onGameEnd = null;
        this.onTimerUpdate = null;
    }
    
    startGame() {
        this.state = 'PLAYING';
        this.score = 0;
        this.round = 1;
        this.updateResponseTime();
        this.generateNextCommand();
        
        if (this.onScoreUpdate) {
            this.onScoreUpdate(this.score, this.round);
        }
        
        console.log('🎮 Game Started!');
    }
    
    generateNextCommand() {
        if (this.state !== 'PLAYING') return;
        
        // Generate new command (avoid consecutive duplicates)
        let newCommand;
        do {
            newCommand = this.commands[Math.floor(Math.random() * this.commands.length)];
        } while (newCommand === this.lastCommand && this.commands.length > 1);
        
        this.currentCommand = newCommand;
        this.lastCommand = newCommand;
        this.commandStartTime = Date.now();
        
        // Notify listeners
        if (this.onCommandGenerated) {
            this.onCommandGenerated(this.currentCommand);
        }
        
        // Start response timer
        this.startResponseTimer();
        
        console.log(`📢 Command: ${this.currentCommand}! (Round ${this.round})`);
    }
    
    startResponseTimer() {
        if (this.gameTimer) {
            clearTimeout(this.gameTimer);
        }
        
        const updateInterval = 50; // Update every 50ms for smooth timer
        let remainingTime = this.responseTimeLimit;
        
        const timerInterval = setInterval(() => {
            remainingTime -= updateInterval;
            
            if (this.onTimerUpdate) {
                this.onTimerUpdate(remainingTime, this.responseTimeLimit);
            }
            
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                this.handleTimeout();
            }
        }, updateInterval);
        
        // Store the interval for cleanup
        this.gameTimer = timerInterval;
    }
    
    handleTimeout() {
        console.log('⏰ Time out! Game Over');
        this.endGame('TIME_OUT');
    }
    
    processPlayerResponse(response) {
        if (this.state !== 'PLAYING' || !this.currentCommand) {
            return false;
        }
        
        const responseTime = Date.now() - this.commandStartTime;
        const isCorrect = response.toUpperCase() === this.currentCommand;
        
        if (this.gameTimer) {
            clearTimeout(this.gameTimer);
            this.gameTimer = null;
        }
        
        if (isCorrect) {
            // Calculate score with time bonus
            const timeBonus = Math.max(0, Math.floor((this.responseTimeLimit - responseTime) / 100));
            this.score += 1 + timeBonus;
            this.round++;
            
            console.log(`✅ Correct! Score: ${this.score} (Time bonus: ${timeBonus})`);
            
            // Update response time for next round
            this.updateResponseTime();
            
            // Notify score update
            if (this.onScoreUpdate) {
                this.onScoreUpdate(this.score, this.round);
            }
            
            // Generate next command after a brief delay (faster progression)
            const delayTime = Math.max(300, 1000 - (this.round * 50)); // Gets faster each round
            setTimeout(() => {
                this.generateNextCommand();
            }, delayTime);
            
            return true;
        } else {
            console.log(`❌ Wrong answer! Expected: ${this.currentCommand}, Got: ${response}`);
            this.endGame('WRONG_ANSWER');
            return false;
        }
    }
    
    updateResponseTime() {
        // Aggressive progressive difficulty - gets faster every round
        if (this.round <= 2) {
            this.responseTimeLimit = 3000; // 3 seconds (only first 2 rounds)
        } else if (this.round <= 4) {
            this.responseTimeLimit = 2500; // 2.5 seconds
        } else if (this.round <= 6) {
            this.responseTimeLimit = 2000; // 2 seconds
        } else if (this.round <= 8) {
            this.responseTimeLimit = 1500; // 1.5 seconds
        } else if (this.round <= 10) {
            this.responseTimeLimit = 1200; // 1.2 seconds
        } else if (this.round <= 12) {
            this.responseTimeLimit = 1000; // 1 second
        } else if (this.round <= 15) {
            this.responseTimeLimit = 800; // 0.8 seconds
        } else {
            this.responseTimeLimit = 600; // 0.6 seconds - extremely fast!
        }
        
        console.log(`🚀 Round ${this.round}: Response time limit set to ${this.responseTimeLimit}ms`);
    }
    
    endGame(reason) {
        this.state = 'GAME_OVER';
        
        if (this.gameTimer) {
            clearTimeout(this.gameTimer);
            this.gameTimer = null;
        }
        
        // Check for high score
        const isHighScore = this.score > this.highScore;
        if (isHighScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        
        if (this.onGameEnd) {
            this.onGameEnd(this.score, this.round - 1, reason, isHighScore);
        }
        
        console.log(`🎮 Game Over! Final Score: ${this.score}, Rounds: ${this.round - 1}, Reason: ${reason}`);
    }
    
    resetGame() {
        this.state = 'START';
        this.score = 0;
        this.round = 1;
        this.currentCommand = null;
        this.lastCommand = null;
        
        if (this.gameTimer) {
            clearTimeout(this.gameTimer);
            this.gameTimer = null;
        }
    }
    
    getHighScore() {
        const saved = localStorage.getItem('bop-it-high-score');
        return saved ? parseInt(saved) : 0;
    }
    
    saveHighScore() {
        localStorage.setItem('bop-it-high-score', this.score.toString());
    }
    
    getCurrentState() {
        return {
            state: this.state,
            score: this.score,
            round: this.round,
            currentCommand: this.currentCommand,
            responseTimeLimit: this.responseTimeLimit,
            highScore: this.highScore
        };
    }
}

export default GameEngine;
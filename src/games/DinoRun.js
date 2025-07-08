/**
 * Dino Run Game - Main game class that brings everything together
 * Handles game loop, collision detection, scoring, and progression
 */
class DinoRun extends GameEngine {
    constructor(canvas) {
        super(canvas);
        
        // Game state
        this.gameState = 'ready'; // 'ready', 'playing', 'paused', 'gameOver'
        this.score = 0;
        this.distance = 0;
        this.gameTime = 0;
        this.highScore = parseInt(localStorage.getItem('dinoRunHighScore') || '0');
        
        // Game objects
        this.dino = null;
        this.obstacles = [];
        this.ground = null;
        this.background = null;
        this.obstacleSpawner = null;
        
        // Game mechanics
        this.gameSpeed = 1.0;
        this.baseScrollSpeed = 200;
        this.difficultyIncrease = 0.05; // Speed increase per level
        
        // UI elements
        this.showInstructions = true;
        this.lastScoreUpdate = 0;
        
        // Controls
        this.keys = {};
        this.jumpKeyPressed = false;
        this.voiceController = null;
        
        this.initializeGame();
        this.setupVoiceControl();
        console.log('🦕 Dino Run game initialized!');
    }

    initializeGame() {
        // Create game objects
        this.dino = new Dino(100, 400);
        this.background = new Background();
        this.ground = new Ground();
        this.obstacleSpawner = new ObstacleSpawner();
        
        // Add background elements to engine
        this.addEntity(this.background);
        this.addEntity(this.ground);
        this.addEntity(this.dino);
        
        // Set up event listeners
        this.setupControls();
        
        console.log('🎮 Game objects created and ready!');
    }

    setupVoiceControl() {
        try {
            this.voiceController = new VoiceController();
            
            // Set up voice callbacks
            this.voiceController.setGameCallbacks({
                jump: () => {
                    return this.handleVoiceJump();
                }
            });
            
            console.log('🎤 Voice control integrated with Dino Run');
        } catch (error) {
            console.warn('⚠️ Voice control not available:', error.message);
        }
    }

    handleVoiceJump() {
        if (this.gameState === 'ready') {
            this.startGame();
            return true;
        } else if (this.gameState === 'playing') {
            return this.dino.jump();
        } else if (this.gameState === 'gameOver') {
            this.restartGame();
            return true;
        }
        return false;
    }

    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
                e.preventDefault();
                this.handleJump();
            }
            
            if (e.code === 'KeyR' && this.gameState === 'gameOver') {
                this.restartGame();
            }
            
            if (e.code === 'KeyP') {
                this.togglePause();
            }
            
            if (e.code === 'KeyV') {
                this.toggleVoiceControl();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
                this.jumpKeyPressed = false;
            }
        });

        // Canvas click for mobile
        this.canvas.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleJump();
        });

        // Touch controls
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleJump();
        });
    }

    handleJump() {
        if (this.gameState === 'ready') {
            this.startGame();
        } else if (this.gameState === 'playing' && !this.jumpKeyPressed) {
            this.jumpKeyPressed = true;
            if (this.dino.jump()) {
                console.log('🦘 Player jumped!');
            }
        } else if (this.gameState === 'gameOver') {
            this.restartGame();
        }
    }

    startGame() {
        this.gameState = 'playing';
        this.showInstructions = false;
        this.start(); // Start the engine
        
        console.log('🚀 Game started!');
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.stop();
            console.log('⏸️ Game paused');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.start();
            console.log('▶️ Game resumed');
        }
    }

    restartGame() {
        console.log('🔄 Restarting game...');
        
        // Reset game state
        this.gameState = 'ready';
        this.score = 0;
        this.distance = 0;
        this.gameTime = 0;
        this.gameSpeed = 1.0;
        this.showInstructions = true;
        
        // Reset game objects
        this.dino.reset();
        this.obstacleSpawner.reset();
        
        // Clear obstacles
        this.obstacles.forEach(obstacle => obstacle.destroy());
        this.obstacles = [];
        
        // Reset entity positions
        this.ground.position.x = 0;
        this.background.clouds.forEach(cloud => {
            cloud.x = Math.random() * 1000;
        });
        
        this.stop(); // Stop the engine until player starts again
        
        console.log('✅ Game reset complete');
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') {
            return; // Don't update during pause or game over
        }

        // Update game time and distance
        this.gameTime += deltaTime;
        this.distance += this.baseScrollSpeed * this.gameSpeed * deltaTime / 100;
        
        // Update difficulty
        this.updateDifficulty();
        
        // Spawn obstacles
        const newObstacle = this.obstacleSpawner.update(deltaTime, this.gameTime);
        if (newObstacle) {
            this.obstacles.push(newObstacle);
            this.addEntity(newObstacle);
        }
        
        // Update parent (handles entity updates)
        super.update(deltaTime);
        
        // Check collisions
        this.checkCollisions();
        
        // Update score
        this.updateScore();
        
        // Clean up off-screen obstacles
        this.cleanupObstacles();
        
        // Check for game over
        if (this.dino.isGameOver()) {
            this.gameOver();
        }
    }

    updateDifficulty() {
        // Increase speed every 30 seconds
        const targetSpeed = 1.0 + Math.floor(this.gameTime / 30) * this.difficultyIncrease;
        
        if (targetSpeed > this.gameSpeed) {
            this.gameSpeed = Math.min(targetSpeed, 2.5); // Cap maximum speed
            
            // Update all scrolling elements
            this.ground.updateSpeed(-this.baseScrollSpeed * this.gameSpeed);
            this.background.updateSpeed(this.gameSpeed);
            
            console.log(`📈 Speed increased to ${this.gameSpeed.toFixed(1)}x`);
        }
    }

    checkCollisions() {
        const dinoBounds = this.dino.getBounds();
        
        for (const obstacle of this.obstacles) {
            if (obstacle.collidesWith(this.dino)) {
                console.log(`💥 Collision with ${obstacle.type}!`);
                
                const gameOver = this.dino.takeDamage();
                if (gameOver) {
                    return; // Game over will be handled in next update
                }
                
                // Remove the obstacle that was hit
                obstacle.destroy();
                break; // Only one collision per frame
            }
        }
    }

    updateScore() {
        // Score based on distance
        const newScore = Math.floor(this.distance);
        
        if (newScore > this.score) {
            this.score = newScore;
        }
        
        // Bonus points for passing obstacles
        for (const obstacle of this.obstacles) {
            const points = obstacle.checkPassed(this.dino.position.x);
            if (points > 0) {
                this.score += points;
                console.log(`🎯 Obstacle passed! +${points} points`);
            }
        }
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('dinoRunHighScore', this.highScore.toString());
        }
    }

    cleanupObstacles() {
        // Remove obstacles marked for removal
        this.obstacles = this.obstacles.filter(obstacle => {
            if (obstacle.shouldRemove) {
                this.removeEntity(obstacle);
                return false;
            }
            return true;
        });
    }

    gameOver() {
        this.gameState = 'gameOver';
        this.stop();
        
        console.log(`🎮 Game Over! Final Score: ${this.score} (High Score: ${this.highScore})`);
    }

    render() {
        // Render all entities
        super.render();
        
        // Render UI overlay
        this.renderUI();
    }

    renderUI() {
        const ctx = this.ctx;
        
        // Score display
        ctx.fillStyle = '#000';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(`Score: ${this.score}`, 20, 40);
        
        // High score
        if (this.highScore > 0) {
            ctx.font = 'bold 18px Arial';
            ctx.fillText(`High: ${this.highScore}`, 20, 70);
        }
        
        // Distance
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`Distance: ${Math.floor(this.distance)}m`, 20, 95);
        
        // Speed indicator
        ctx.fillText(`Speed: ${this.gameSpeed.toFixed(1)}x`, 20, 115);
        
        // Strikes
        ctx.fillStyle = this.dino.strikes > 0 ? '#FF4444' : '#000';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`❤️ ${3 - this.dino.strikes}`, this.canvas.width - 100, 40);
        
        // Game state specific UI
        if (this.gameState === 'ready') {
            this.renderReadyScreen();
        } else if (this.gameState === 'paused') {
            this.renderPausedScreen();
        } else if (this.gameState === 'gameOver') {
            this.renderGameOverScreen();
        }
    }

    renderReadyScreen() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Title
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🦕 DINO RUN', centerX, centerY - 100);
        
        // Custom character notice
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('Starring: YOU!', centerX, centerY - 60);
        
        // Instructions
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#FFF';
        ctx.fillText('Jump over obstacles and survive!', centerX, centerY - 20);
        
        // Voice control status
        const voiceStatus = this.getVoiceStatus();
        if (voiceStatus.supported) {
            ctx.fillText('🎤 Say "JUMP" or press SPACE', centerX, centerY + 20);
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = '#FFD700';
            ctx.fillText('Press V to enable voice control', centerX, centerY + 45);
        } else {
            ctx.fillText('SPACE / CLICK / TAP to jump', centerX, centerY + 20);
        }
        
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#FFF';
        ctx.fillText('You have 3 lives', centerX, centerY + 70);
        
        // Start prompt
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#4CAF50';
        ctx.fillText('Press SPACE or CLICK to start!', centerX, centerY + 100);
        
        ctx.textAlign = 'left'; // Reset alignment
    }

    renderPausedScreen() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Paused text
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⏸️ PAUSED', centerX, centerY);
        
        ctx.font = 'bold 20px Arial';
        ctx.fillText('Press P to resume', centerX, centerY + 40);
        
        ctx.textAlign = 'left'; // Reset alignment
    }

    renderGameOverScreen() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Game Over text
        ctx.fillStyle = '#FF4444';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', centerX, centerY - 60);
        
        // Final score
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(`Final Score: ${this.score}`, centerX, centerY - 20);
        ctx.fillText(`Distance: ${Math.floor(this.distance)}m`, centerX, centerY + 10);
        
        // High score
        if (this.score === this.highScore && this.highScore > 0) {
            ctx.fillStyle = '#FFD700';
            ctx.fillText('🏆 NEW HIGH SCORE! 🏆', centerX, centerY + 50);
        } else if (this.highScore > 0) {
            ctx.fillStyle = '#AAA';
            ctx.fillText(`High Score: ${this.highScore}`, centerX, centerY + 50);
        }
        
        // Restart instructions
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('Press R or CLICK to restart', centerX, centerY + 100);
        
        ctx.textAlign = 'left'; // Reset alignment
    }

    // Public methods for external control
    jump() {
        return this.dino.jump();
    }

    getGameState() {
        return {
            state: this.gameState,
            score: this.score,
            highScore: this.highScore,
            distance: Math.floor(this.distance),
            strikes: this.dino.strikes,
            maxStrikes: this.dino.maxStrikes,
            gameSpeed: this.gameSpeed,
            gameTime: this.gameTime
        };
    }

    // Voice control methods
    enableVoiceControl() {
        if (this.voiceController) {
            return this.voiceController.enable();
        }
        return false;
    }

    disableVoiceControl() {
        if (this.voiceController) {
            this.voiceController.disable();
        }
    }

    toggleVoiceControl() {
        if (this.voiceController) {
            const enabled = this.voiceController.toggle();
            console.log(`🎤 Voice control ${enabled ? 'enabled' : 'disabled'}`);
            return enabled;
        }
        return false;
    }

    getVoiceStatus() {
        if (this.voiceController) {
            return this.voiceController.getStatus();
        }
        return { enabled: false, supported: false };
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DinoRun;
}
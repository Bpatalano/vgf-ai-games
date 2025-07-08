/**
 * Main Application Entry Point
 * Tests the game engine and provides development interface
 */

// Test Entity class for engine testing
class TestEntity extends Entity {
    constructor(x, y, color = '#FF6B6B') {
        super(x, y, 40, 40);
        this.color = color;
        this.hasGravity = true;
        this.canJump = true;
        this.type = 'test-entity';
        this.bounceCount = 0;
        this.maxBounces = 3;
    }

    customUpdate(deltaTime) {
        // Bounce off bottom of screen
        if (this.position.y + this.dimensions.height >= 600) {
            this.position.y = 600 - this.dimensions.height;
            this.velocity.y = -Math.abs(this.velocity.y) * 0.7; // Bounce with energy loss
            this.bounceCount++;
            
            // Remove after several bounces
            if (this.bounceCount >= this.maxBounces) {
                this.destroy();
            }
        }

        // Bounce off sides
        if (this.position.x <= 0 || this.position.x + this.dimensions.width >= 800) {
            this.velocity.x *= -1;
            this.position.x = Math.max(0, Math.min(this.position.x, 800 - this.dimensions.width));
        }
    }

    customRender(ctx) {
        // Gradient fill
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.dimensions.width / 2);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, this.darkenColor(this.color, 0.3));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
            -this.dimensions.width / 2,
            -this.dimensions.height / 2,
            this.dimensions.width,
            this.dimensions.height
        );

        // Add a border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            -this.dimensions.width / 2,
            -this.dimensions.height / 2,
            this.dimensions.width,
            this.dimensions.height
        );
    }

    darkenColor(color, factor) {
        // Simple color darkening
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        return `rgb(${Math.floor(r * (1 - factor))}, ${Math.floor(g * (1 - factor))}, ${Math.floor(b * (1 - factor))})`;
    }
}

// Application class
class ViiSportsArcade {
    constructor() {
        this.engine = null;
        this.canvas = null;
        this.isInitialized = false;
        this.testEntityColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
        this.currentGame = null;
        this.gameMode = 'test'; // 'test', 'dino-run', 'flappy-bird'
        this.voiceController = null;
        
        this.initializeApp();
    }

    async initializeApp() {
        try {
            this.showLoadingScreen();
            
            // Wait a moment for visual effect
            await this.delay(1000);
            
            this.setupCanvas();
            this.setupEngine();
            this.setupEventListeners();
            this.setupUI();
            
            this.hideLoadingScreen();
            this.isInitialized = true;
            
            this.log('🎮 Vii Sports Arcade initialized successfully!', 'info');
            this.log('🔧 Engine ready for testing', 'info');
            
        } catch (error) {
            this.log(`❌ Initialization failed: ${error.message}`, 'error');
            console.error('Initialization error:', error);
        }
    }

    setupCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            throw new Error('Game canvas not found');
        }
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.log('🎨 Canvas initialized (800x600)', 'info');
    }

    setupEngine() {
        this.engine = new GameEngine(this.canvas);
        this.log('⚙️ Game engine created', 'info');
    }

    setupEventListeners() {
        // Test controls
        document.getElementById('startEngineBtn').addEventListener('click', () => {
            this.startEngine();
        });

        document.getElementById('stopEngineBtn').addEventListener('click', () => {
            this.stopEngine();
        });

        document.getElementById('addTestEntityBtn').addEventListener('click', () => {
            this.addTestEntity();
        });

        document.getElementById('toggleDebugBtn').addEventListener('click', () => {
            this.toggleDebug();
        });

        // Game controls
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restart();
        });

        document.getElementById('debugBtn').addEventListener('click', () => {
            this.toggleDebug();
        });

        // Add Dino Run game button
        const dinoRunBtn = document.createElement('button');
        dinoRunBtn.textContent = '🦕 Play Dino Run';
        dinoRunBtn.className = 'test-btn';
        dinoRunBtn.addEventListener('click', () => {
            this.startDinoRun();
        });
        document.querySelector('.test-controls').appendChild(dinoRunBtn);

        // Add voice control test button
        const voiceTestBtn = document.createElement('button');
        voiceTestBtn.textContent = '🎤 Test Voice Control';
        voiceTestBtn.className = 'test-btn';
        voiceTestBtn.addEventListener('click', () => {
            this.testVoiceControl();
        });
        document.querySelector('.test-controls').appendChild(voiceTestBtn);

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });

        // Canvas click for adding entities
        this.canvas.addEventListener('click', (e) => {
            this.handleCanvasClick(e);
        });

        this.log('🎮 Event listeners set up', 'info');
    }

    setupUI() {
        // Start performance monitoring
        this.startPerformanceMonitoring();
        this.log('📊 UI monitoring started', 'info');
    }

    startEngine() {
        if (!this.engine.isRunning) {
            this.engine.start();
            this.log('▶️ Engine started', 'info');
        } else {
            this.log('⚠️ Engine already running', 'warn');
        }
    }

    stopEngine() {
        if (this.engine.isRunning) {
            this.engine.stop();
            this.log('⏹️ Engine stopped', 'info');
        } else {
            this.log('⚠️ Engine already stopped', 'warn');
        }
    }

    addTestEntity() {
        if (!this.engine) return;

        const x = Math.random() * (800 - 40);
        const y = Math.random() * 200; // Spawn in upper area
        const color = this.testEntityColors[Math.floor(Math.random() * this.testEntityColors.length)];
        
        const entity = new TestEntity(x, y, color);
        
        // Add some random velocity
        entity.velocity.x = (Math.random() - 0.5) * 200;
        entity.velocity.y = Math.random() * -100; // Upward velocity
        
        this.engine.addEntity(entity);
        this.log(`🎯 Test entity added at (${Math.floor(x)}, ${Math.floor(y)})`, 'info');
    }

    toggleDebug() {
        if (this.engine) {
            this.engine.toggleDebugInfo();
            const status = this.engine.showDebugInfo ? 'enabled' : 'disabled';
            this.log(`🐛 Debug mode ${status}`, 'info');
        }
    }

    togglePause() {
        if (this.engine) {
            if (this.engine.isRunning) {
                this.stopEngine();
            } else {
                this.startEngine();
            }
        }
    }

    restart() {
        this.log('🔄 Restarting engine...', 'info');
        this.stopEngine();
        
        // Clear all entities
        if (this.engine) {
            this.engine.entities = [];
        }
        
        setTimeout(() => {
            this.startEngine();
            this.log('✅ Engine restarted', 'info');
        }, 100);
    }

    handleKeyPress(e) {
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.addTestEntity();
                break;
            case 'KeyD':
                this.toggleDebug();
                break;
            case 'KeyR':
                this.restart();
                break;
            case 'KeyP':
                this.togglePause();
                break;
        }
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const color = this.testEntityColors[Math.floor(Math.random() * this.testEntityColors.length)];
        const entity = new TestEntity(x - 20, y - 20, color);
        
        if (this.engine) {
            this.engine.addEntity(entity);
            this.log(`👆 Entity added by click at (${Math.floor(x)}, ${Math.floor(y)})`, 'info');
        }
    }

    startPerformanceMonitoring() {
        setInterval(() => {
            if (this.engine) {
                const stats = this.engine.getPerformanceStats();
                this.updatePerformanceDisplay(stats);
            }
        }, 100); // Update every 100ms
    }

    updatePerformanceDisplay(stats) {
        document.getElementById('fpsCounter').textContent = stats.fps;
        document.getElementById('entityCounter').textContent = stats.entityCount;
        document.getElementById('updateTime').textContent = `${stats.updateTime.toFixed(2)}ms`;
        document.getElementById('renderTime').textContent = `${stats.renderTime.toFixed(2)}ms`;
    }

    showLoadingScreen() {
        document.getElementById('loadingScreen').style.display = 'flex';
        document.getElementById('gameContainer').style.display = 'none';
    }

    hideLoadingScreen() {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'flex';
    }

    log(message, type = 'info') {
        const logContent = document.getElementById('logContent');
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        logContent.appendChild(logEntry);
        logContent.scrollTop = logContent.scrollHeight;
        
        // Keep only last 50 entries
        while (logContent.children.length > 50) {
            logContent.removeChild(logContent.firstChild);
        }
        
        // Also log to console
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    startDinoRun() {
        this.log('🦕 Starting Dino Run game...', 'info');
        
        try {
            // Stop current engine if running
            if (this.engine && this.engine.isRunning) {
                this.stopEngine();
            }
            
            // Create new Dino Run game
            this.currentGame = new DinoRun(this.canvas);
            this.gameMode = 'dino-run';
            
            // Hide test area
            document.getElementById('testArea').style.display = 'none';
            
            this.log('✅ Dino Run started! Use SPACE to jump', 'info');
            
        } catch (error) {
            this.log(`❌ Failed to start Dino Run: ${error.message}`, 'error');
        }
    }

    stopCurrentGame() {
        if (this.currentGame) {
            if (this.currentGame.stop) {
                this.currentGame.stop();
            }
            this.currentGame = null;
        }
        
        // Show test area again
        document.getElementById('testArea').style.display = 'block';
        this.gameMode = 'test';
        
        this.log('🎮 Game stopped, back to test mode', 'info');
    }

    testVoiceControl() {
        this.log('🎤 Testing voice control system...', 'info');
        
        try {
            if (!this.voiceController) {
                this.voiceController = new VoiceController();
                
                // Set up test callbacks
                this.voiceController.setGameCallbacks({
                    jump: () => {
                        this.log('🦘 Voice JUMP detected in test mode!', 'info');
                        this.addTestEntity(); // Add entity when voice detected
                        return true;
                    }
                });
            }
            
            const enabled = this.voiceController.toggle();
            if (enabled) {
                this.log('✅ Voice control enabled! Say "JUMP" to test', 'info');
            } else {
                this.log('🔇 Voice control disabled', 'info');
            }
            
        } catch (error) {
            this.log(`❌ Voice control error: ${error.message}`, 'error');
        }
    }
}

// Initialize the application when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.viiSportsArcade = new ViiSportsArcade();
});

// Global error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    if (window.viiSportsArcade) {
        window.viiSportsArcade.log(`💥 Error: ${e.error.message}`, 'error');
    }
});

// Performance warning
if (typeof requestAnimationFrame === 'undefined') {
    console.warn('requestAnimationFrame not supported - performance may be poor');
}
/**
 * Core Game Engine - Handles game loop, entity management, and rendering
 * Provides foundation for both Flappy Bird and Dino Run games
 */
class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isRunning = false;
        this.lastTime = 0;
        this.entities = [];
        this.targetFPS = 60;
        this.deltaTime = 0;
        this.frameCount = 0;
        this.fpsDisplay = 0;
        this.lastFPSUpdate = 0;
        
        // Performance monitoring
        this.performanceStats = {
            updateTime: 0,
            renderTime: 0,
            entityCount: 0
        };
    }

    /**
     * Start the game engine
     */
    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
        console.log('Game engine started');
    }

    /**
     * Stop the game engine
     */
    stop() {
        this.isRunning = false;
        console.log('Game engine stopped');
    }

    /**
     * Main game loop - runs at 60 FPS
     */
    gameLoop = (currentTime = 0) => {
        if (!this.isRunning) return;

        // Calculate delta time
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Cap delta time to prevent large jumps
        this.deltaTime = Math.min(this.deltaTime, 1/30);

        // Update game state
        const updateStart = performance.now();
        this.update(this.deltaTime);
        this.performanceStats.updateTime = performance.now() - updateStart;

        // Render game
        const renderStart = performance.now();
        this.render();
        this.performanceStats.renderTime = performance.now() - renderStart;

        // Update FPS counter
        this.updateFPS(currentTime);

        // Continue loop
        requestAnimationFrame(this.gameLoop);
    };

    /**
     * Update all game entities and systems
     */
    update(deltaTime) {
        // Update all entities
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            
            if (entity.update) {
                entity.update(deltaTime);
            }

            // Remove entities marked for removal
            if (entity.shouldRemove) {
                this.removeEntity(entity);
            }
        }

        this.performanceStats.entityCount = this.entities.length;
    }

    /**
     * Render all game entities
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render all entities
        this.entities.forEach(entity => {
            if (entity.render) {
                entity.render(this.ctx);
            }
        });

        // Render debug info in development
        if (this.showDebugInfo) {
            this.renderDebugInfo();
        }
    }

    /**
     * Add entity to the game
     */
    addEntity(entity) {
        this.entities.push(entity);
        if (entity.onAdded) {
            entity.onAdded(this);
        }
    }

    /**
     * Remove entity from the game
     */
    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
            if (entity.onRemoved) {
                entity.onRemoved();
            }
        }
    }

    /**
     * Find entities by type or filter function
     */
    findEntities(filter) {
        if (typeof filter === 'string') {
            return this.entities.filter(entity => entity.type === filter);
        }
        return this.entities.filter(filter);
    }

    /**
     * Update FPS counter
     */
    updateFPS(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastFPSUpdate >= 1000) {
            this.fpsDisplay = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdate = currentTime;
        }
    }

    /**
     * Render debug information
     */
    renderDebugInfo() {
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = '16px monospace';
        this.ctx.fillText(`FPS: ${this.fpsDisplay}`, 10, 25);
        this.ctx.fillText(`Entities: ${this.performanceStats.entityCount}`, 10, 45);
        this.ctx.fillText(`Update: ${this.performanceStats.updateTime.toFixed(2)}ms`, 10, 65);
        this.ctx.fillText(`Render: ${this.performanceStats.renderTime.toFixed(2)}ms`, 10, 85);
    }

    /**
     * Toggle debug information display
     */
    toggleDebugInfo() {
        this.showDebugInfo = !this.showDebugInfo;
    }

    /**
     * Resize canvas and maintain aspect ratio
     */
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Notify entities of resize
        this.entities.forEach(entity => {
            if (entity.onResize) {
                entity.onResize(width, height);
            }
        });
    }

    /**
     * Get current performance statistics
     */
    getPerformanceStats() {
        return {
            ...this.performanceStats,
            fps: this.fpsDisplay,
            deltaTime: this.deltaTime
        };
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
}
/**
 * Obstacle System - Cacti and Birds for Dino Run
 * Handles different obstacle types with varying difficulty
 */
class Obstacle extends Entity {
    constructor(x, y, type = 'cactus') {
        // Set dimensions based on obstacle type
        const dimensions = Obstacle.getDimensions(type);
        super(x, y, dimensions.width, dimensions.height);
        
        this.type = type;
        this.obstacleType = type; // For collision detection
        this.speed = -300; // Move left across screen
        this.velocity.x = this.speed;
        
        // Visual properties
        this.animationFrame = 0;
        this.animationSpeed = 0.2;
        this.animationTimer = 0;
        
        // Scoring
        this.passed = false; // For score counting
        this.points = this.getPointValue();
        
        console.log(`🌵 ${type} obstacle created at (${x}, ${y})`);
    }

    static getDimensions(type) {
        switch (type) {
            case 'cactus_small':
                return { width: 20, height: 40 };
            case 'cactus_large':
                return { width: 30, height: 60 };
            case 'cactus_double':
                return { width: 35, height: 55 };
            case 'bird_low':
                return { width: 35, height: 25 };
            case 'bird_high':
                return { width: 35, height: 25 };
            default:
                return { width: 25, height: 50 };
        }
    }

    getPointValue() {
        switch (this.type) {
            case 'cactus_small': return 10;
            case 'cactus_large': return 15;
            case 'cactus_double': return 20;
            case 'bird_low': return 25;
            case 'bird_high': return 20;
            default: return 10;
        }
    }

    customUpdate(deltaTime) {
        // Update animation for birds
        if (this.type.includes('bird')) {
            this.animationTimer += deltaTime;
            if (this.animationTimer >= this.animationSpeed) {
                this.animationFrame = (this.animationFrame + 1) % 3;
                this.animationTimer = 0;
            }
        }

        // Remove if off screen
        if (this.position.x + this.dimensions.width < -50) {
            this.shouldRemove = true;
        }

        // Update speed based on game progression (will be set by game)
        if (this.gameSpeed) {
            this.velocity.x = this.speed * this.gameSpeed;
        }
    }

    customRender(ctx) {
        const x = -this.dimensions.width / 2;
        const y = -this.dimensions.height / 2;
        
        switch (this.type) {
            case 'cactus_small':
                this.drawSmallCactus(ctx, x, y);
                break;
            case 'cactus_large':
                this.drawLargeCactus(ctx, x, y);
                break;
            case 'cactus_double':
                this.drawDoubleCactus(ctx, x, y);
                break;
            case 'bird_low':
            case 'bird_high':
                this.drawBird(ctx, x, y);
                break;
            default:
                this.drawSmallCactus(ctx, x, y);
        }
    }

    drawSmallCactus(ctx, x, y) {
        const w = this.dimensions.width;
        const h = this.dimensions.height;
        
        // Main stem
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(x + w * 0.4, y, w * 0.2, h);
        
        // Arms
        ctx.fillRect(x + w * 0.1, y + h * 0.3, w * 0.3, w * 0.15);
        ctx.fillRect(x + w * 0.6, y + h * 0.5, w * 0.3, w * 0.15);
        
        // Spikes
        ctx.fillStyle = '#1B5E20';
        for (let i = 0; i < 3; i++) {
            const spikeY = y + (h / 4) * i + 5;
            ctx.fillRect(x + w * 0.35, spikeY, 2, 3);
            ctx.fillRect(x + w * 0.65, spikeY, 2, 3);
        }
    }

    drawLargeCactus(ctx, x, y) {
        const w = this.dimensions.width;
        const h = this.dimensions.height;
        
        // Main stem (thicker)
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(x + w * 0.35, y, w * 0.3, h);
        
        // Multiple arms
        ctx.fillRect(x + w * 0.05, y + h * 0.25, w * 0.3, w * 0.15);
        ctx.fillRect(x + w * 0.05, y + h * 0.6, w * 0.25, w * 0.15);
        ctx.fillRect(x + w * 0.65, y + h * 0.4, w * 0.3, w * 0.15);
        
        // More spikes
        ctx.fillStyle = '#1B5E20';
        for (let i = 0; i < 5; i++) {
            const spikeY = y + (h / 6) * i + 3;
            ctx.fillRect(x + w * 0.3, spikeY, 2, 4);
            ctx.fillRect(x + w * 0.7, spikeY, 2, 4);
        }
    }

    drawDoubleCactus(ctx, x, y) {
        const w = this.dimensions.width;
        const h = this.dimensions.height;
        
        // Two stems
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(x + w * 0.2, y, w * 0.2, h * 0.8);
        ctx.fillRect(x + w * 0.6, y + h * 0.2, w * 0.2, h * 0.8);
        
        // Arms for both
        ctx.fillRect(x, y + h * 0.3, w * 0.2, w * 0.12);
        ctx.fillRect(x + w * 0.8, y + h * 0.5, w * 0.2, w * 0.12);
        
        // Spikes
        ctx.fillStyle = '#1B5E20';
        for (let i = 0; i < 4; i++) {
            const spikeY = y + (h / 5) * i + 5;
            ctx.fillRect(x + w * 0.15, spikeY, 2, 3);
            ctx.fillRect(x + w * 0.45, spikeY, 2, 3);
            ctx.fillRect(x + w * 0.55, spikeY + h * 0.2, 2, 3);
            ctx.fillRect(x + w * 0.85, spikeY + h * 0.2, 2, 3);
        }
    }

    drawBird(ctx, x, y) {
        const w = this.dimensions.width;
        const h = this.dimensions.height;
        
        // Bird body
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.4);
        
        // Head
        ctx.fillRect(x + w * 0.1, y + h * 0.2, w * 0.3, h * 0.3);
        
        // Beak
        ctx.fillStyle = '#FF8F00';
        ctx.fillRect(x, y + h * 0.35, w * 0.15, h * 0.1);
        
        // Wings (animated)
        ctx.fillStyle = '#3E2723';
        const wingFlap = this.animationFrame % 2 === 0 ? 0 : -3;
        
        // Wing shapes based on animation frame
        if (this.animationFrame === 0) {
            // Wings up
            ctx.fillRect(x + w * 0.25, y + h * 0.1 + wingFlap, w * 0.5, h * 0.2);
        } else if (this.animationFrame === 1) {
            // Wings middle
            ctx.fillRect(x + w * 0.2, y + h * 0.25, w * 0.6, h * 0.15);
        } else {
            // Wings down
            ctx.fillRect(x + w * 0.25, y + h * 0.4 - wingFlap, w * 0.5, h * 0.2);
        }
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(x + w * 0.15, y + h * 0.25, 2, 2);
        
        // Tail
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(x + w * 0.7, y + h * 0.35, w * 0.3, h * 0.15);
    }

    // Check if obstacle has been passed by dino (for scoring)
    checkPassed(dinoX) {
        if (!this.passed && this.position.x + this.dimensions.width < dinoX) {
            this.passed = true;
            return this.points;
        }
        return 0;
    }

    // Get collision bounds (slightly smaller for fairer gameplay)
    getBounds() {
        const margin = 3; // Make collision slightly more forgiving
        return {
            x: this.position.x + margin,
            y: this.position.y + margin,
            width: this.dimensions.width - (margin * 2),
            height: this.dimensions.height - (margin * 2)
        };
    }

    // Update obstacle speed (called by game when difficulty increases)
    updateSpeed(newSpeed) {
        this.speed = newSpeed;
        this.velocity.x = this.speed;
    }
}

/**
 * Obstacle Spawner - Manages obstacle generation and difficulty
 */
class ObstacleSpawner {
    constructor() {
        this.lastSpawnTime = 0;
        this.minSpawnInterval = 1.5; // Minimum seconds between obstacles
        this.maxSpawnInterval = 3.0; // Maximum seconds between obstacles
        this.nextSpawnTime = this.getRandomSpawnTime();
        
        // Difficulty progression
        this.gameSpeed = 1.0;
        this.difficultyLevel = 1;
        
        // Obstacle probabilities (will change with difficulty)
        this.obstacleProbabilities = {
            cactus_small: 0.4,
            cactus_large: 0.3,
            cactus_double: 0.2,
            bird_low: 0.07,
            bird_high: 0.03
        };
    }

    update(deltaTime, gameTime) {
        this.lastSpawnTime += deltaTime;
        
        // Update difficulty based on game time
        this.updateDifficulty(gameTime);
        
        // Check if it's time to spawn
        if (this.lastSpawnTime >= this.nextSpawnTime) {
            return this.spawnObstacle();
        }
        
        return null;
    }

    spawnObstacle() {
        const obstacleType = this.chooseObstacleType();
        const x = 850; // Spawn off right side of screen
        let y;
        
        // Set Y position based on obstacle type
        switch (obstacleType) {
            case 'bird_high':
                y = 320; // High flying bird
                break;
            case 'bird_low':
                y = 380; // Low flying bird
                break;
            default:
                y = 400; // Ground level for cacti
        }
        
        const obstacle = new Obstacle(x, y, obstacleType);
        obstacle.gameSpeed = this.gameSpeed;
        
        // Reset spawn timer
        this.lastSpawnTime = 0;
        this.nextSpawnTime = this.getRandomSpawnTime();
        
        console.log(`🎯 Spawned ${obstacleType} obstacle`);
        return obstacle;
    }

    chooseObstacleType() {
        const random = Math.random();
        let cumulative = 0;
        
        for (const [type, probability] of Object.entries(this.obstacleProbabilities)) {
            cumulative += probability;
            if (random <= cumulative) {
                return type;
            }
        }
        
        return 'cactus_small'; // Fallback
    }

    getRandomSpawnTime() {
        const min = this.minSpawnInterval / this.gameSpeed;
        const max = this.maxSpawnInterval / this.gameSpeed;
        return Math.random() * (max - min) + min;
    }

    updateDifficulty(gameTime) {
        // Increase difficulty every 30 seconds
        const newDifficultyLevel = Math.floor(gameTime / 30) + 1;
        
        if (newDifficultyLevel > this.difficultyLevel) {
            this.difficultyLevel = newDifficultyLevel;
            this.gameSpeed = Math.min(1 + (this.difficultyLevel - 1) * 0.1, 2.0); // Cap at 2x speed
            
            // Adjust obstacle probabilities
            this.adjustProbabilities();
            
            console.log(`📈 Difficulty increased! Level ${this.difficultyLevel}, Speed: ${this.gameSpeed.toFixed(1)}x`);
        }
    }

    adjustProbabilities() {
        // As difficulty increases, add more birds and complex cacti
        const birdIncrease = Math.min(this.difficultyLevel * 0.02, 0.15);
        
        this.obstacleProbabilities = {
            cactus_small: Math.max(0.4 - birdIncrease, 0.2),
            cactus_large: 0.3,
            cactus_double: Math.min(0.2 + this.difficultyLevel * 0.01, 0.3),
            bird_low: Math.min(0.07 + birdIncrease * 0.6, 0.15),
            bird_high: Math.min(0.03 + birdIncrease * 0.4, 0.1)
        };
    }

    reset() {
        this.lastSpawnTime = 0;
        this.gameSpeed = 1.0;
        this.difficultyLevel = 1;
        this.nextSpawnTime = this.getRandomSpawnTime();
        
        // Reset probabilities
        this.obstacleProbabilities = {
            cactus_small: 0.4,
            cactus_large: 0.3,
            cactus_double: 0.2,
            bird_low: 0.07,
            bird_high: 0.03
        };
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Obstacle, ObstacleSpawner };
}
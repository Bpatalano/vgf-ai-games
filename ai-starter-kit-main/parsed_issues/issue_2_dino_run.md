# [Dino Run] Step 2: Implement Dino Run Game Logic

## 🚨 Mandatory Reading
Before starting ANY work:
1. **MUST READ**: [.cursor/rules/CRITICAL_CORE.mdc](.cursor/rules/CRITICAL_CORE.mdc) - Universal development principles
2. Review the acceptance criteria below

## 🎯 Overview
**Parent Issue**: #1 (Vii Sports Arcade - Flappy Bird & Dino Run)
**Blocks**: #4 (Voice Integration), #6 (GPT Integration)
**Depends On**: #2 (Core Game Engine)
**Estimated Time**: 2 days
**Difficulty**: Medium

## 📍 Context for Newcomers
This implements the Dino Run game mechanics - a dino that runs automatically and jumps over obstacles. Think Chrome's offline dino game but controlled by voice commands. The dino runs forward continuously, obstacles spawn and move toward it, and the player must time jumps to avoid collisions.

## 📂 Files to Create/Modify

### New Files to Create:
- `src/games/DinoRun.js` - Main Dino Run game class
- `src/entities/Dino.js` - Dino character with jumping mechanics
- `src/entities/Obstacle.js` - Cactus and bird obstacles
- `src/entities/Ground.js` - Scrolling ground/terrain
- `src/systems/ObstacleSpawner.js` - Manages obstacle generation
- `src/systems/ScoreSystem.js` - Tracks distance and scoring

### Files to Modify:
- `src/index.html` - Add Dino Run game container
- `src/styles/main.css` - Game-specific styling

## ✅ Acceptance Criteria
- [ ] Dino runs forward automatically at consistent speed
- [ ] Dino can jump with realistic arc physics
- [ ] Obstacles spawn at random intervals
- [ ] Collision detection works between dino and obstacles
- [ ] 3-strike system implemented (game continues after hits)
- [ ] Score increases based on distance traveled
- [ ] Game speed increases gradually over time
- [ ] Ground scrolls continuously creating running effect
- [ ] Game can be reset after game over

## 🏗️ Implementation Guide

### Step 1: Create the Dino Character
```javascript
// src/entities/Dino.js
class Dino extends Entity {
    constructor(x, y) {
        super(x, y, 40, 50);
        this.hasGravity = true;
        this.isOnGround = false;
        this.jumpPower = -400;
        this.color = '#8B4513';
        this.strikes = 0;
        this.maxStrikes = 3;
    }

    jump() {
        if (this.isOnGround) {
            this.velocity.y = this.jumpPower;
            this.isOnGround = false;
        }
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Check if dino is on ground
        if (this.position.y >= 400) { // Ground level
            this.position.y = 400;
            this.velocity.y = 0;
            this.isOnGround = true;
        }
    }

    takeDamage() {
        this.strikes++;
        return this.strikes >= this.maxStrikes;
    }
}
```

### Step 2: Implement Obstacle System
```javascript
// src/entities/Obstacle.js
class Obstacle extends Entity {
    constructor(x, y, type = 'cactus') {
        const dimensions = type === 'cactus' ? 
            { width: 30, height: 60 } : 
            { width: 40, height: 30 };
        
        super(x, y, dimensions.width, dimensions.height);
        this.type = type;
        this.speed = -300; // Move left
        this.velocity.x = this.speed;
        this.color = type === 'cactus' ? '#2E8B57' : '#696969';
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Remove if off screen
        if (this.position.x < -this.dimensions.width) {
            this.shouldRemove = true;
        }
    }
}
```

### Step 3: Create Game Loop
```javascript
// src/games/DinoRun.js
class DinoRun extends GameEngine {
    constructor(canvas) {
        super(canvas);
        this.dino = new Dino(100, 400);
        this.obstacles = [];
        this.score = 0;
        this.gameSpeed = 1.0;
        this.lastObstacleTime = 0;
        this.entities.push(this.dino);
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Spawn obstacles
        this.spawnObstacles(deltaTime);
        
        // Check collisions
        this.checkCollisions();
        
        // Update score
        this.score += deltaTime * 10 * this.gameSpeed;
        
        // Increase difficulty
        this.gameSpeed += deltaTime * 0.01;
        
        // Clean up off-screen obstacles
        this.obstacles = this.obstacles.filter(obs => !obs.shouldRemove);
    }

    spawnObstacles(deltaTime) {
        this.lastObstacleTime += deltaTime;
        
        if (this.lastObstacleTime > 2.0 / this.gameSpeed) {
            const obstacleType = Math.random() < 0.7 ? 'cactus' : 'bird';
            const obstacle = new Obstacle(800, obstacleType === 'cactus' ? 400 : 350, obstacleType);
            
            this.obstacles.push(obstacle);
            this.entities.push(obstacle);
            this.lastObstacleTime = 0;
        }
    }

    checkCollisions() {
        for (let obstacle of this.obstacles) {
            if (Physics.checkCollision(this.dino.getBounds(), obstacle.getBounds())) {
                const gameOver = this.dino.takeDamage();
                if (gameOver) {
                    this.gameOver();
                }
                break;
            }
        }
    }

    jump() {
        this.dino.jump();
    }

    gameOver() {
        this.stop();
        // Game over logic here
    }
}
```

## 🧪 Testing Instructions

1. **Manual Testing**:
   - Dino should run in place while ground scrolls
   - Jump should create realistic arc
   - Obstacles should spawn at reasonable intervals
   - Collision detection should be accurate but fair

2. **Game Balance Testing**:
   - Play for 30 seconds - should be challenging but fair
   - Verify 3-strike system works correctly
   - Check that game speed increases gradually

3. **Validation**:
   - Game should feel responsive
   - No lag or stuttering
   - Visual feedback for collisions

## 🚫 Out of Scope
- Voice input (handled in issue #4)
- GPT integration (handled in issue #6)
- Sound effects
- Advanced animations or sprites
- Multiple game modes

## 💡 Tips for Success
- Keep obstacle spacing fair but challenging
- Test jump timing thoroughly
- Use visual feedback for successful jumps
- Consider adding brief invincibility after hits

## 🔗 Resources
- [Chrome Dino Game Reference](https://chromedino.com/)
- [Game Balance Principles](https://www.gamasutra.com/view/feature/134768/game_balance_and_the_ten_.php)

---

**Success looks like**: A playable Dino Run game with keyboard controls that feels like the Chrome offline game.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
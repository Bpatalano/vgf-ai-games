# [Flappy Bird] Step 3: Implement Flappy Bird Game Logic

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
This implements the Flappy Bird game mechanics - a bird that flaps upward when controlled and falls due to gravity. The bird must navigate through pipes without crashing. This is the classic mobile game but will be controlled by voice commands in later issues.

## 📂 Files to Create/Modify

### New Files to Create:
- `src/games/FlappyBird.js` - Main Flappy Bird game class
- `src/entities/Bird.js` - Bird character with flapping mechanics
- `src/entities/Pipe.js` - Pipe obstacles with gaps
- `src/systems/PipeSpawner.js` - Manages pipe generation and movement
- `src/systems/GameUI.js` - Score display and game over screen

### Files to Modify:
- `src/index.html` - Add Flappy Bird game container
- `src/styles/main.css` - Game-specific styling

## ✅ Acceptance Criteria
- [ ] Bird flaps upward when controlled (keyboard for now)
- [ ] Bird falls due to gravity when not flapping
- [ ] Pipes spawn with consistent gaps
- [ ] Collision detection works between bird and pipes
- [ ] 3-strike system implemented (game continues after hits)
- [ ] Score increases when bird passes through pipes
- [ ] Game speed remains constant (unlike Dino Run)
- [ ] Game can be reset after game over
- [ ] Bird stays within screen boundaries

## 🏗️ Implementation Guide

### Step 1: Create the Bird Character
```javascript
// src/entities/Bird.js
class Bird extends Entity {
    constructor(x, y) {
        super(x, y, 30, 30);
        this.hasGravity = true;
        this.flapPower = -300;
        this.color = '#FFD700';
        this.strikes = 0;
        this.maxStrikes = 3;
        this.rotation = 0;
    }

    flap() {
        this.velocity.y = this.flapPower;
        // Add slight rotation for visual feedback
        this.rotation = -0.3;
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Gradually return to normal rotation
        this.rotation += deltaTime * 2;
        this.rotation = Math.min(this.rotation, 0.5);
        
        // Keep bird within screen bounds
        if (this.position.y < 0) {
            this.position.y = 0;
            this.velocity.y = 0;
        }
        
        if (this.position.y > 600) { // Ground level
            this.position.y = 600;
            this.velocity.y = 0;
            this.takeDamage();
        }
    }

    render(ctx) {
        ctx.save();
        ctx.translate(
            this.position.x + this.dimensions.width / 2,
            this.position.y + this.dimensions.height / 2
        );
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.fillRect(
            -this.dimensions.width / 2,
            -this.dimensions.height / 2,
            this.dimensions.width,
            this.dimensions.height
        );
        ctx.restore();
    }

    takeDamage() {
        this.strikes++;
        return this.strikes >= this.maxStrikes;
    }
}
```

### Step 2: Implement Pipe System
```javascript
// src/entities/Pipe.js
class Pipe extends Entity {
    constructor(x, y, height, isTop = false) {
        super(x, y, 80, height);
        this.speed = -200; // Move left
        this.velocity.x = this.speed;
        this.color = '#228B22';
        this.isTop = isTop;
        this.passed = false;
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Remove if off screen
        if (this.position.x < -this.dimensions.width) {
            this.shouldRemove = true;
        }
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.position.x,
            this.position.y,
            this.dimensions.width,
            this.dimensions.height
        );
        
        // Add pipe cap
        ctx.fillStyle = '#2F4F2F';
        if (this.isTop) {
            ctx.fillRect(
                this.position.x - 5,
                this.position.y + this.dimensions.height - 20,
                this.dimensions.width + 10,
                20
            );
        } else {
            ctx.fillRect(
                this.position.x - 5,
                this.position.y,
                this.dimensions.width + 10,
                20
            );
        }
    }
}
```

### Step 3: Create Game Loop
```javascript
// src/games/FlappyBird.js
class FlappyBird extends GameEngine {
    constructor(canvas) {
        super(canvas);
        this.bird = new Bird(100, 300);
        this.pipes = [];
        this.score = 0;
        this.lastPipeTime = 0;
        this.pipeSpacing = 3.0; // seconds between pipes
        this.entities.push(this.bird);
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Spawn pipes
        this.spawnPipes(deltaTime);
        
        // Check collisions
        this.checkCollisions();
        
        // Update score
        this.updateScore();
        
        // Clean up off-screen pipes
        this.pipes = this.pipes.filter(pipe => !pipe.shouldRemove);
    }

    spawnPipes(deltaTime) {
        this.lastPipeTime += deltaTime;
        
        if (this.lastPipeTime > this.pipeSpacing) {
            const gapSize = 150;
            const gapPosition = Math.random() * (400 - gapSize) + 100;
            
            // Top pipe
            const topPipe = new Pipe(800, 0, gapPosition, true);
            this.pipes.push(topPipe);
            this.entities.push(topPipe);
            
            // Bottom pipe
            const bottomPipe = new Pipe(800, gapPosition + gapSize, 600 - gapPosition - gapSize, false);
            this.pipes.push(bottomPipe);
            this.entities.push(bottomPipe);
            
            this.lastPipeTime = 0;
        }
    }

    checkCollisions() {
        for (let pipe of this.pipes) {
            if (Physics.checkCollision(this.bird.getBounds(), pipe.getBounds())) {
                const gameOver = this.bird.takeDamage();
                if (gameOver) {
                    this.gameOver();
                }
                break;
            }
        }
    }

    updateScore() {
        for (let pipe of this.pipes) {
            if (!pipe.passed && pipe.position.x + pipe.dimensions.width < this.bird.position.x) {
                if (!pipe.isTop) { // Only count bottom pipes to avoid double counting
                    this.score++;
                }
                pipe.passed = true;
            }
        }
    }

    flap() {
        this.bird.flap();
    }

    gameOver() {
        this.stop();
        // Game over logic here
    }

    render() {
        super.render();
        
        // Render score
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '36px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 20, 50);
        
        // Render strikes
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Strikes: ${this.bird.strikes}/${this.bird.maxStrikes}`, 20, 80);
    }
}
```

## 🧪 Testing Instructions

1. **Manual Testing**:
   - Bird should flap upward when spacebar is pressed
   - Bird should fall smoothly due to gravity
   - Pipes should spawn with consistent gaps
   - Collision detection should be accurate but fair

2. **Game Balance Testing**:
   - Play for 1 minute - should be challenging but fair
   - Verify 3-strike system works correctly
   - Check that pipe gaps are consistently navigable

3. **Visual Testing**:
   - Bird rotation should provide visual feedback
   - Pipes should have consistent visual style
   - Score should update correctly

## 🚫 Out of Scope
- Voice input (handled in issue #4)
- GPT integration (handled in issue #6)
- Sound effects
- Advanced animations or sprites
- Multiple difficulty levels

## 💡 Tips for Success
- Keep pipe gaps consistent and fair
- Test flap timing thoroughly
- Use visual feedback for successful flaps
- Consider adding brief invincibility after hits

## 🔗 Resources
- [Original Flappy Bird Reference](https://flappybird.io/)
- [Canvas Rotation Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rotate)

---

**Success looks like**: A playable Flappy Bird game with keyboard controls that feels like the original mobile game.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
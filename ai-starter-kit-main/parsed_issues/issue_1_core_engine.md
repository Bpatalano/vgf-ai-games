# [Dino Run] Step 1: Core Game Engine and Physics

## 🚨 Mandatory Reading
Before starting ANY work:
1. **MUST READ**: [.cursor/rules/CRITICAL_CORE.mdc](.cursor/rules/CRITICAL_CORE.mdc) - Universal development principles
2. Review the acceptance criteria below

## 🎯 Overview
**Parent Issue**: #1 (Vii Sports Arcade - Flappy Bird & Dino Run)
**Blocks**: #3, #4, #5 (all other game features need this foundation)
**Depends On**: None (starting point)
**Estimated Time**: 2 days
**Difficulty**: Medium

## 📍 Context for Newcomers
This creates the foundation for both voice-controlled arcade games. We're building a game engine that handles physics, collision detection, and basic game loop mechanics. Think of it as the "skeleton" that both Flappy Bird and Dino Run will use - the physics for gravity, jumping, and collision detection are shared between both games.

## 📂 Files to Create/Modify

### New Files to Create:
- `src/engine/GameEngine.js` - Core game loop and state management
- `src/engine/Physics.js` - Gravity, velocity, and collision detection
- `src/engine/Entity.js` - Base class for game objects (bird, dino, obstacles)
- `src/engine/CollisionSystem.js` - Handles collision detection between entities
- `src/utils/GameMath.js` - Mathematical utilities for game calculations

### Files to Modify:
- `src/index.html` - Add canvas element and game container
- `src/styles/main.css` - Basic game styling and layout

## ✅ Acceptance Criteria
- [ ] Game engine runs at stable 60 FPS
- [ ] Physics system applies gravity consistently
- [ ] Collision detection works between rectangular objects
- [ ] Entity system supports position, velocity, and dimensions
- [ ] Game loop handles update/render cycles properly
- [ ] Canvas renders basic shapes (rectangles) smoothly
- [ ] Game can be started and stopped programmatically
- [ ] No memory leaks during continuous gameplay

## 🏗️ Implementation Guide

### Step 1: Create the Core Game Engine
```javascript
// src/engine/GameEngine.js
class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isRunning = false;
        this.lastTime = 0;
        this.entities = [];
        this.targetFPS = 60;
        this.deltaTime = 0;
    }

    start() {
        this.isRunning = true;
        this.gameLoop();
    }

    stop() {
        this.isRunning = false;
    }

    gameLoop = (currentTime = 0) => {
        if (!this.isRunning) return;

        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.update(this.deltaTime);
        this.render();

        requestAnimationFrame(this.gameLoop);
    };

    update(deltaTime) {
        // Update all entities
        this.entities.forEach(entity => {
            if (entity.update) {
                entity.update(deltaTime);
            }
        });
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render all entities
        this.entities.forEach(entity => {
            if (entity.render) {
                entity.render(this.ctx);
            }
        });
    }
}
```

### Step 2: Implement Physics System
```javascript
// src/engine/Physics.js
class Physics {
    static GRAVITY = 800; // pixels per second squared
    static TERMINAL_VELOCITY = 600; // max fall speed

    static applyGravity(entity, deltaTime) {
        if (entity.hasGravity) {
            entity.velocity.y += Physics.GRAVITY * deltaTime;
            entity.velocity.y = Math.min(entity.velocity.y, Physics.TERMINAL_VELOCITY);
        }
    }

    static updatePosition(entity, deltaTime) {
        entity.position.x += entity.velocity.x * deltaTime;
        entity.position.y += entity.velocity.y * deltaTime;
    }

    static checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
}
```

### Step 3: Create Entity Base Class
```javascript
// src/engine/Entity.js
class Entity {
    constructor(x, y, width, height) {
        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.dimensions = { width, height };
        this.hasGravity = false;
        this.color = '#000';
    }

    update(deltaTime) {
        if (this.hasGravity) {
            Physics.applyGravity(this, deltaTime);
        }
        Physics.updatePosition(this, deltaTime);
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.position.x,
            this.position.y,
            this.dimensions.width,
            this.dimensions.height
        );
    }

    getBounds() {
        return {
            x: this.position.x,
            y: this.position.y,
            width: this.dimensions.width,
            height: this.dimensions.height
        };
    }
}
```

## 🧪 Testing Instructions

1. **Performance Testing**:
   - Open browser dev tools Performance tab
   - Run game for 30 seconds
   - Verify consistent 60 FPS with no dropped frames
   - Check memory usage remains stable

2. **Physics Testing**:
   - Create test entity with gravity enabled
   - Verify it accelerates downward at correct rate
   - Test collision detection with overlapping rectangles
   - Verify non-overlapping rectangles return false

3. **Visual Testing**:
   - Canvas should render without flicker
   - Entities should move smoothly
   - Game loop should start/stop cleanly

## 🚫 Out of Scope
- Game-specific logic (bird flapping, dino running)
- Voice input handling (that's issue #4)
- GPT integration (that's issue #6)
- Sound effects or music
- Advanced graphics or animations
- Multiple levels or game modes

## 💡 Tips for Success
- Use `requestAnimationFrame` for smooth animation
- Keep physics calculations simple but accurate
- Test collision detection thoroughly with edge cases
- Consider using a fixed timestep for physics consistency

## 🔗 Resources
- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Game Loop Patterns](https://gameprogrammingpatterns.com/game-loop.html)

---

**Success looks like**: A canvas displays smoothly animated rectangles that fall due to gravity and can detect collisions with each other.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
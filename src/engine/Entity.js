/**
 * Entity Base Class - Foundation for all game objects
 * Used by birds, dinos, obstacles, and other game elements
 */
class Entity {
    constructor(x = 0, y = 0, width = 32, height = 32) {
        // Position and dimensions
        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.dimensions = { width, height };
        
        // Physics properties
        this.hasGravity = false;
        this.hasAirResistance = false;
        this.canJump = false;
        
        // Visual properties
        this.color = '#000000';
        this.rotation = 0;
        this.scale = { x: 1, y: 1 };
        this.opacity = 1;
        this.visible = true;
        
        // Entity state
        this.type = 'entity';
        this.shouldRemove = false;
        this.isActive = true;
        this.age = 0; // Time since creation
        
        // Collision properties
        this.solid = true;
        this.collisionMargin = 0; // Pixels to shrink collision box
        
        // Animation properties
        this.animationFrame = 0;
        this.animationSpeed = 0;
        this.animationTimer = 0;
        
        // Game engine reference (set when added to engine)
        this.engine = null;
    }

    /**
     * Update entity - called every frame
     */
    update(deltaTime) {
        // Age the entity
        this.age += deltaTime;
        
        // Apply physics if enabled
        if (this.hasGravity) {
            Physics.applyGravity(this, deltaTime);
        }
        
        if (this.hasAirResistance) {
            Physics.applyAirResistance(this, deltaTime);
        }
        
        // Update position based on velocity
        Physics.updatePosition(this, deltaTime);
        
        // Update animation
        this.updateAnimation(deltaTime);
        
        // Override in subclasses for custom behavior
        this.customUpdate(deltaTime);
    }

    /**
     * Render entity - called every frame
     */
    render(ctx) {
        if (!this.visible) return;

        ctx.save();
        
        // Apply transformations
        this.applyTransforms(ctx);
        
        // Apply opacity
        ctx.globalAlpha = this.opacity;
        
        // Render the entity
        this.customRender(ctx);
        
        ctx.restore();
        
        // Render debug info if enabled
        if (this.engine && this.engine.showDebugInfo) {
            this.renderDebugInfo(ctx);
        }
    }

    /**
     * Apply position, rotation, and scale transforms
     */
    applyTransforms(ctx) {
        // Translate to position
        ctx.translate(
            this.position.x + this.dimensions.width / 2,
            this.position.y + this.dimensions.height / 2
        );
        
        // Apply rotation
        if (this.rotation !== 0) {
            ctx.rotate(this.rotation);
        }
        
        // Apply scale
        if (this.scale.x !== 1 || this.scale.y !== 1) {
            ctx.scale(this.scale.x, this.scale.y);
        }
    }

    /**
     * Custom rendering - override in subclasses
     */
    customRender(ctx) {
        // Default rectangle rendering
        ctx.fillStyle = this.color;
        ctx.fillRect(
            -this.dimensions.width / 2,
            -this.dimensions.height / 2,
            this.dimensions.width,
            this.dimensions.height
        );
    }

    /**
     * Custom update logic - override in subclasses
     */
    customUpdate(deltaTime) {
        // Override in subclasses
    }

    /**
     * Update animation frame
     */
    updateAnimation(deltaTime) {
        if (this.animationSpeed > 0) {
            this.animationTimer += deltaTime;
            if (this.animationTimer >= this.animationSpeed) {
                this.animationFrame++;
                this.animationTimer = 0;
            }
        }
    }

    /**
     * Get bounding box for collision detection
     */
    getBounds() {
        const margin = this.collisionMargin;
        return {
            x: this.position.x + margin,
            y: this.position.y + margin,
            width: this.dimensions.width - (margin * 2),
            height: this.dimensions.height - (margin * 2)
        };
    }

    /**
     * Get center point of entity
     */
    getCenter() {
        return {
            x: this.position.x + this.dimensions.width / 2,
            y: this.position.y + this.dimensions.height / 2
        };
    }

    /**
     * Check collision with another entity
     */
    collidesWith(other) {
        if (!this.solid || !other.solid) return false;
        return Physics.checkCollision(this.getBounds(), other.getBounds());
    }

    /**
     * Check collision with rectangle
     */
    collidesWithRect(rect) {
        if (!this.solid) return false;
        return Physics.checkCollision(this.getBounds(), rect);
    }

    /**
     * Set position
     */
    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
    }

    /**
     * Set velocity
     */
    setVelocity(x, y) {
        this.velocity.x = x;
        this.velocity.y = y;
    }

    /**
     * Add velocity (impulse)
     */
    addVelocity(x, y) {
        this.velocity.x += x;
        this.velocity.y += y;
    }

    /**
     * Stop entity movement
     */
    stop() {
        this.velocity.x = 0;
        this.velocity.y = 0;
    }

    /**
     * Mark entity for removal
     */
    destroy() {
        this.shouldRemove = true;
        this.onDestroy();
    }

    /**
     * Check if entity is off screen
     */
    isOffScreen(screenWidth, screenHeight) {
        return this.position.x + this.dimensions.width < 0 ||
               this.position.x > screenWidth ||
               this.position.y + this.dimensions.height < 0 ||
               this.position.y > screenHeight;
    }

    /**
     * Constrain entity to screen bounds
     */
    constrainToScreen(screenWidth, screenHeight) {
        Physics.constrainToBounds(this, screenWidth, screenHeight);
    }

    /**
     * Render debug information
     */
    renderDebugInfo(ctx) {
        ctx.save();
        
        // Draw bounding box
        const bounds = this.getBounds();
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 1;
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        
        // Draw center point
        const center = this.getCenter();
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(center.x - 2, center.y - 2, 4, 4);
        
        // Draw velocity vector
        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(center.x, center.y);
            ctx.lineTo(
                center.x + this.velocity.x * 0.1,
                center.y + this.velocity.y * 0.1
            );
            ctx.stroke();
        }
        
        ctx.restore();
    }

    /**
     * Called when entity is added to game engine
     */
    onAdded(engine) {
        this.engine = engine;
    }

    /**
     * Called when entity is removed from game engine
     */
    onRemoved() {
        this.engine = null;
    }

    /**
     * Called when entity is destroyed
     */
    onDestroy() {
        // Override in subclasses for cleanup
    }

    /**
     * Called when canvas is resized
     */
    onResize(width, height) {
        // Override in subclasses if needed
    }

    /**
     * Create a copy of this entity
     */
    clone() {
        const clone = new this.constructor(
            this.position.x,
            this.position.y,
            this.dimensions.width,
            this.dimensions.height
        );
        
        // Copy properties
        clone.velocity = { ...this.velocity };
        clone.color = this.color;
        clone.rotation = this.rotation;
        clone.scale = { ...this.scale };
        clone.hasGravity = this.hasGravity;
        clone.hasAirResistance = this.hasAirResistance;
        clone.type = this.type;
        
        return clone;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Entity;
}
/**
 * Physics System - Handles gravity, velocity, and collision detection
 * Shared by both Flappy Bird and Dino Run games
 */
class Physics {
    // Constants for realistic physics
    static GRAVITY = 800; // pixels per second squared
    static TERMINAL_VELOCITY = 600; // max fall speed
    static AIR_RESISTANCE = 0.98; // slight air resistance

    /**
     * Apply gravity to an entity
     */
    static applyGravity(entity, deltaTime) {
        if (entity.hasGravity) {
            entity.velocity.y += Physics.GRAVITY * deltaTime;
            entity.velocity.y = Math.min(entity.velocity.y, Physics.TERMINAL_VELOCITY);
        }
    }

    /**
     * Update entity position based on velocity
     */
    static updatePosition(entity, deltaTime) {
        entity.position.x += entity.velocity.x * deltaTime;
        entity.position.y += entity.velocity.y * deltaTime;
    }

    /**
     * Apply air resistance to entity velocity
     */
    static applyAirResistance(entity, deltaTime) {
        if (entity.hasAirResistance) {
            entity.velocity.x *= Math.pow(Physics.AIR_RESISTANCE, deltaTime);
        }
    }

    /**
     * Basic AABB (Axis-Aligned Bounding Box) collision detection
     */
    static checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    /**
     * More precise collision detection with optional margin
     */
    static checkCollisionWithMargin(rect1, rect2, margin = 0) {
        const m = margin;
        return (rect1.x + m) < (rect2.x + rect2.width - m) &&
               (rect1.x + rect1.width - m) > (rect2.x + m) &&
               (rect1.y + m) < (rect2.y + rect2.height - m) &&
               (rect1.y + rect1.height - m) > (rect2.y + m);
    }

    /**
     * Check if entity is within screen bounds
     */
    static isInBounds(entity, screenWidth, screenHeight) {
        return entity.position.x + entity.dimensions.width >= 0 &&
               entity.position.x <= screenWidth &&
               entity.position.y + entity.dimensions.height >= 0 &&
               entity.position.y <= screenHeight;
    }

    /**
     * Constrain entity to screen bounds
     */
    static constrainToBounds(entity, screenWidth, screenHeight) {
        // Left boundary
        if (entity.position.x < 0) {
            entity.position.x = 0;
            entity.velocity.x = Math.max(0, entity.velocity.x);
        }
        
        // Right boundary
        if (entity.position.x + entity.dimensions.width > screenWidth) {
            entity.position.x = screenWidth - entity.dimensions.width;
            entity.velocity.x = Math.min(0, entity.velocity.x);
        }
        
        // Top boundary
        if (entity.position.y < 0) {
            entity.position.y = 0;
            entity.velocity.y = Math.max(0, entity.velocity.y);
        }
        
        // Bottom boundary
        if (entity.position.y + entity.dimensions.height > screenHeight) {
            entity.position.y = screenHeight - entity.dimensions.height;
            entity.velocity.y = Math.min(0, entity.velocity.y);
        }
    }

    /**
     * Calculate distance between two points
     */
    static distance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculate distance between centers of two entities
     */
    static distanceBetweenEntities(entity1, entity2) {
        const center1 = {
            x: entity1.position.x + entity1.dimensions.width / 2,
            y: entity1.position.y + entity1.dimensions.height / 2
        };
        const center2 = {
            x: entity2.position.x + entity2.dimensions.width / 2,
            y: entity2.position.y + entity2.dimensions.height / 2
        };
        return Physics.distance(center1, center2);
    }

    /**
     * Apply impulse (instant velocity change) to entity
     */
    static applyImpulse(entity, impulseX, impulseY) {
        entity.velocity.x += impulseX;
        entity.velocity.y += impulseY;
    }

    /**
     * Check if entity is on ground (useful for jump mechanics)
     */
    static isOnGround(entity, groundY, tolerance = 5) {
        const entityBottom = entity.position.y + entity.dimensions.height;
        return Math.abs(entityBottom - groundY) <= tolerance && entity.velocity.y >= 0;
    }

    /**
     * Bounce entity off surface
     */
    static bounce(entity, surface, restitution = 0.7) {
        if (surface === 'horizontal') {
            entity.velocity.y = -entity.velocity.y * restitution;
        } else if (surface === 'vertical') {
            entity.velocity.x = -entity.velocity.x * restitution;
        }
    }

    /**
     * Simulate jump with realistic physics
     */
    static jump(entity, jumpPower) {
        if (entity.canJump) {
            entity.velocity.y = -jumpPower; // Negative for upward movement
            entity.canJump = false; // Prevent double jumping
        }
    }

    /**
     * Check collision between moving entity and static rectangle
     * Returns collision info with normal and penetration depth
     */
    static detailedCollision(movingEntity, staticRect) {
        const entity = movingEntity.getBounds();
        
        if (!Physics.checkCollision(entity, staticRect)) {
            return null;
        }

        // Calculate overlap on each axis
        const overlapX = Math.min(entity.x + entity.width - staticRect.x, 
                                 staticRect.x + staticRect.width - entity.x);
        const overlapY = Math.min(entity.y + entity.height - staticRect.y, 
                                 staticRect.y + staticRect.height - entity.y);

        // Find the axis with minimum overlap (separation axis)
        if (overlapX < overlapY) {
            // Horizontal collision
            const normal = entity.x < staticRect.x ? { x: -1, y: 0 } : { x: 1, y: 0 };
            return {
                normal: normal,
                penetration: overlapX,
                axis: 'horizontal'
            };
        } else {
            // Vertical collision
            const normal = entity.y < staticRect.y ? { x: 0, y: -1 } : { x: 0, y: 1 };
            return {
                normal: normal,
                penetration: overlapY,
                axis: 'vertical'
            };
        }
    }

    /**
     * Resolve collision by separating entities
     */
    static resolveCollision(entity, collision) {
        if (!collision) return;

        // Separate entities
        entity.position.x -= collision.normal.x * collision.penetration;
        entity.position.y -= collision.normal.y * collision.penetration;

        // Adjust velocity based on collision normal
        if (collision.axis === 'horizontal') {
            entity.velocity.x = 0;
        } else {
            entity.velocity.y = 0;
            // If landing on ground, allow jumping again
            if (collision.normal.y === -1) {
                entity.canJump = true;
            }
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Physics;
}
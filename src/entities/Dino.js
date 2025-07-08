/**
 * Dino Character - Custom character based on player's face
 * Handles running, jumping, and taking damage with personality
 */
class Dino extends Entity {
    constructor(x = 100, y = 400) {
        super(x, y, 50, 60); // Slightly larger for character details
        
        // Physics properties
        this.hasGravity = true;
        this.canJump = true;
        this.isOnGround = false;
        this.jumpPower = -450; // Strong jump for obstacles
        this.groundY = 400; // Ground level
        
        // Game mechanics
        this.strikes = 0;
        this.maxStrikes = 3;
        this.isInvulnerable = false;
        this.invulnerabilityTime = 1.5; // seconds
        this.invulnerabilityTimer = 0;
        
        // Animation properties
        this.animationState = 'running';
        this.frameTime = 0;
        this.currentFrame = 0;
        this.animationSpeed = 0.15; // seconds per frame
        
        // Visual properties
        this.type = 'dino';
        this.facingDirection = 1; // 1 for right, -1 for left
        
        // Character personality (based on the photo)
        this.expression = 'happy'; // happy, focused, surprised, hurt
        this.hasBeard = true;
        this.hasSmile = true;
        
        console.log('🦕 Custom Dino character created!');
    }

    customUpdate(deltaTime) {
        // Update invulnerability
        if (this.isInvulnerable) {
            this.invulnerabilityTimer -= deltaTime;
            if (this.invulnerabilityTimer <= 0) {
                this.isInvulnerable = false;
                this.expression = 'happy';
            }
        }

        // Ground collision
        if (this.position.y >= this.groundY) {
            this.position.y = this.groundY;
            this.velocity.y = 0;
            this.isOnGround = true;
            this.canJump = true;
            
            // Return to running animation when landing
            if (this.animationState === 'jumping') {
                this.animationState = 'running';
            }
        } else {
            this.isOnGround = false;
        }

        // Update animation
        this.updateAnimation(deltaTime);
    }

    updateAnimation(deltaTime) {
        this.frameTime += deltaTime;
        
        if (this.frameTime >= this.animationSpeed) {
            this.currentFrame++;
            this.frameTime = 0;
            
            // Reset animation cycles
            switch (this.animationState) {
                case 'running':
                    if (this.currentFrame >= 4) this.currentFrame = 0;
                    break;
                case 'jumping':
                    if (this.currentFrame >= 2) this.currentFrame = 1; // Hold jump pose
                    break;
                case 'hurt':
                    if (this.currentFrame >= 3) {
                        this.currentFrame = 0;
                        this.animationState = 'running';
                        this.expression = 'focused';
                    }
                    break;
            }
        }
    }

    customRender(ctx) {
        const centerX = -this.dimensions.width / 2;
        const centerY = -this.dimensions.height / 2;
        
        // Apply invulnerability flashing
        if (this.isInvulnerable && Math.floor(this.age * 10) % 2) {
            ctx.globalAlpha = 0.5;
        }

        // Draw character based on current animation state
        this.drawCharacter(ctx, centerX, centerY);
        
        ctx.globalAlpha = 1; // Reset alpha
    }

    drawCharacter(ctx, x, y) {
        const w = this.dimensions.width;
        const h = this.dimensions.height;
        
        // Calculate bounce for running animation
        const runBounce = this.animationState === 'running' ? 
            Math.sin(this.currentFrame * Math.PI / 2) * 3 : 0;
        
        // Calculate jump pose
        const jumpOffset = this.animationState === 'jumping' ? -5 : 0;
        
        const bodyY = y + runBounce + jumpOffset;
        
        // Body (shirt/torso)
        ctx.fillStyle = '#4A90E2'; // Blue shirt
        ctx.fillRect(x + w * 0.2, bodyY + h * 0.4, w * 0.6, h * 0.4);
        
        // Arms (running pose)
        this.drawArms(ctx, x, bodyY, w, h);
        
        // Legs (running/jumping pose)
        this.drawLegs(ctx, x, bodyY, w, h);
        
        // Head (based on the photo features)
        this.drawHead(ctx, x, bodyY, w, h);
    }

    drawHead(ctx, x, y, w, h) {
        const headX = x + w * 0.25;
        const headY = y;
        const headW = w * 0.5;
        const headH = h * 0.4;
        
        // Face/skin
        ctx.fillStyle = '#FFDBAC'; // Skin tone
        ctx.fillRect(headX, headY, headW, headH);
        
        // Hair (dark brown, slightly messy like in photo)
        ctx.fillStyle = '#3D2914';
        ctx.fillRect(headX - 2, headY - 5, headW + 4, 12);
        // Hair sides
        ctx.fillRect(headX - 3, headY + 3, 3, 8);
        ctx.fillRect(headX + headW, headY + 3, 3, 8);
        
        // Eyes (happy/focused based on expression)
        ctx.fillStyle = '#000';
        const eyeY = headY + 8;
        
        if (this.expression === 'happy' || this.expression === 'focused') {
            // Normal eyes
            ctx.fillRect(headX + 6, eyeY, 3, 2);
            ctx.fillRect(headX + headW - 9, eyeY, 3, 2);
        } else if (this.expression === 'surprised') {
            // Wide eyes
            ctx.fillRect(headX + 5, eyeY - 1, 4, 4);
            ctx.fillRect(headX + headW - 9, eyeY - 1, 4, 4);
        }
        
        // Smile (based on photo's great smile!)
        if (this.expression === 'happy') {
            ctx.fillStyle = '#000';
            ctx.fillRect(headX + 8, headY + 16, 8, 1);
            // Smile curves
            ctx.fillRect(headX + 7, headY + 17, 2, 1);
            ctx.fillRect(headX + headW - 9, headY + 17, 2, 1);
        }
        
        // Beard (key feature from photo!)
        if (this.hasBeard) {
            ctx.fillStyle = '#2A1A0A'; // Dark beard
            // Chin beard
            ctx.fillRect(headX + 4, headY + headH - 3, headW - 8, 6);
            // Side beard
            ctx.fillRect(headX - 1, headY + 12, 4, 8);
            ctx.fillRect(headX + headW - 3, headY + 12, 4, 8);
            // Mustache
            ctx.fillRect(headX + 6, headY + 14, headW - 12, 2);
        }
        
        // Expression details
        if (this.expression === 'hurt') {
            // X eyes
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(headX + 5, eyeY, 5, 1);
            ctx.fillRect(headX + 7, eyeY - 2, 1, 5);
            ctx.fillRect(headX + headW - 10, eyeY, 5, 1);
            ctx.fillRect(headX + headW - 8, eyeY - 2, 1, 5);
        }
    }

    drawArms(ctx, x, y, w, h) {
        const armSwing = this.animationState === 'running' ? 
            Math.sin(this.currentFrame * Math.PI / 2) * 3 : 0;
        
        ctx.fillStyle = '#FFDBAC'; // Skin tone
        
        // Left arm
        ctx.fillRect(x + w * 0.1, y + h * 0.45 + armSwing, 4, h * 0.2);
        
        // Right arm  
        ctx.fillRect(x + w * 0.85, y + h * 0.45 - armSwing, 4, h * 0.2);
    }

    drawLegs(ctx, x, y, w, h) {
        ctx.fillStyle = '#2C3E50'; // Dark pants
        
        if (this.animationState === 'running') {
            // Running leg animation
            const legSwing = Math.sin(this.currentFrame * Math.PI / 2) * 4;
            
            // Left leg
            ctx.fillRect(x + w * 0.3, y + h * 0.8, 6, h * 0.25 + legSwing);
            
            // Right leg
            ctx.fillRect(x + w * 0.6, y + h * 0.8, 6, h * 0.25 - legSwing);
        } else if (this.animationState === 'jumping') {
            // Jumping pose - legs bent
            ctx.fillRect(x + w * 0.3, y + h * 0.85, 6, h * 0.15);
            ctx.fillRect(x + w * 0.6, y + h * 0.85, 6, h * 0.15);
        }
        
        // Shoes
        ctx.fillStyle = '#000';
        ctx.fillRect(x + w * 0.25, y + h * 1.05, 10, 4);
        ctx.fillRect(x + w * 0.55, y + h * 1.05, 10, 4);
    }

    jump() {
        if (this.canJump && this.isOnGround && !this.isInvulnerable) {
            this.velocity.y = this.jumpPower;
            this.isOnGround = false;
            this.canJump = false;
            this.animationState = 'jumping';
            this.currentFrame = 0;
            this.expression = 'focused';
            
            console.log('🦘 Dino jumped!');
            return true;
        }
        return false;
    }

    takeDamage() {
        if (this.isInvulnerable) return false;
        
        this.strikes++;
        this.isInvulnerable = true;
        this.invulnerabilityTimer = this.invulnerabilityTime;
        this.animationState = 'hurt';
        this.currentFrame = 0;
        this.expression = 'hurt';
        
        console.log(`💥 Dino hit! Strikes: ${this.strikes}/${this.maxStrikes}`);
        
        // Check for game over
        if (this.strikes >= this.maxStrikes) {
            console.log('☠️ Game Over - Max strikes reached!');
            return true; // Game over
        }
        
        return false; // Continue playing
    }

    reset() {
        this.strikes = 0;
        this.isInvulnerable = false;
        this.invulnerabilityTimer = 0;
        this.animationState = 'running';
        this.expression = 'happy';
        this.position.x = 100;
        this.position.y = this.groundY;
        this.velocity.x = 0;
        this.velocity.y = 0;
        
        console.log('🔄 Dino reset for new game!');
    }

    getStrikesDisplay() {
        return `${this.strikes}/${this.maxStrikes}`;
    }

    isGameOver() {
        return this.strikes >= this.maxStrikes;
    }

    // Special celebration animation for good plays
    celebrate() {
        this.expression = 'happy';
        // Could add special celebration animation here
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Dino;
}
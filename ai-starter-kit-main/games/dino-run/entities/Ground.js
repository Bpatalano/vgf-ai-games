/**
 * Scrolling Ground System - Creates infinite running terrain
 * Handles ground texture, clouds, and background elements
 */
class Ground extends Entity {
    constructor(x = 0, y = 460) {
        super(x, y, 800, 140); // Full screen width, bottom portion
        
        this.type = 'ground';
        this.solid = false; // Not for collision, just visual
        
        // Scrolling properties
        this.scrollSpeed = -200; // Base scroll speed
        this.velocity.x = this.scrollSpeed;
        
        // Visual elements
        this.groundTexture = [];
        this.generateGroundTexture();
        
        // Ground line position
        this.groundLineY = 460;
        
        console.log('🌍 Ground system created');
    }

    generateGroundTexture() {
        // Generate random ground texture elements
        this.groundTexture = [];
        
        for (let x = 0; x < this.dimensions.width + 100; x += 20) {
            // Random small rocks and details
            if (Math.random() < 0.3) {
                this.groundTexture.push({
                    x: x,
                    y: Math.random() * 20 + 10,
                    type: 'rock',
                    size: Math.random() * 3 + 2
                });
            }
            
            // Grass patches
            if (Math.random() < 0.2) {
                this.groundTexture.push({
                    x: x,
                    y: Math.random() * 5 + 2,
                    type: 'grass',
                    size: Math.random() * 4 + 3
                });
            }
        }
    }

    customUpdate(deltaTime) {
        // Update scroll position
        this.position.x += this.velocity.x * deltaTime;
        
        // Reset position when completely off screen for infinite scrolling
        if (this.position.x <= -this.dimensions.width) {
            this.position.x = 0;
            this.generateGroundTexture(); // Generate new texture details
        }
    }

    customRender(ctx) {
        const x = -this.dimensions.width / 2;
        const y = -this.dimensions.height / 2;
        
        // Draw ground base
        this.drawGroundBase(ctx, x, y);
        
        // Draw ground line
        this.drawGroundLine(ctx, x, y);
        
        // Draw ground texture details
        this.drawGroundTexture(ctx, x, y);
    }

    drawGroundBase(ctx, x, y) {
        // Ground gradient
        const gradient = ctx.createLinearGradient(0, y, 0, y + this.dimensions.height);
        gradient.addColorStop(0, '#8D6E63');
        gradient.addColorStop(0.3, '#6D4C41');
        gradient.addColorStop(1, '#4E342E');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, this.dimensions.width, this.dimensions.height);
    }

    drawGroundLine(ctx, x, y) {
        // Main ground line
        ctx.strokeStyle = '#5D4037';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + this.dimensions.width, y);
        ctx.stroke();
        
        // Subtle ground details line
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + 3);
        ctx.lineTo(x + this.dimensions.width, y + 3);
        ctx.stroke();
    }

    drawGroundTexture(ctx, x, y) {
        for (const element of this.groundTexture) {
            const elementX = x + element.x + this.position.x % this.dimensions.width;
            const elementY = y + element.y;
            
            // Only draw if element is visible
            if (elementX > x - 20 && elementX < x + this.dimensions.width + 20) {
                if (element.type === 'rock') {
                    this.drawRock(ctx, elementX, elementY, element.size);
                } else if (element.type === 'grass') {
                    this.drawGrass(ctx, elementX, elementY, element.size);
                }
            }
        }
    }

    drawRock(ctx, x, y, size) {
        ctx.fillStyle = '#424242';
        ctx.fillRect(x, y, size, size);
        
        // Rock highlight
        ctx.fillStyle = '#616161';
        ctx.fillRect(x, y, size - 1, 1);
    }

    drawGrass(ctx, x, y, size) {
        ctx.fillStyle = '#4CAF50';
        for (let i = 0; i < 3; i++) {
            const grassX = x + i * 2;
            const grassHeight = size + Math.random() * 2;
            ctx.fillRect(grassX, y - grassHeight, 1, grassHeight);
        }
    }

    updateSpeed(newSpeed) {
        this.scrollSpeed = newSpeed;
        this.velocity.x = this.scrollSpeed;
    }
}

/**
 * Background System - Clouds and distant elements
 */
class Background extends Entity {
    constructor() {
        super(0, 0, 800, 460); // Full sky area
        
        this.type = 'background';
        this.solid = false;
        
        // Background elements
        this.clouds = [];
        this.mountains = [];
        
        this.generateClouds();
        this.generateMountains();
        
        console.log('☁️ Background system created');
    }

    generateClouds() {
        this.clouds = [];
        
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * 1000,
                y: Math.random() * 200 + 50,
                size: Math.random() * 40 + 30,
                speed: -20 - Math.random() * 30, // Slow parallax scrolling
                opacity: 0.3 + Math.random() * 0.4
            });
        }
    }

    generateMountains() {
        this.mountains = [];
        
        for (let i = 0; i < 8; i++) {
            this.mountains.push({
                x: i * 120 + Math.random() * 50,
                y: 300 + Math.random() * 100,
                width: 60 + Math.random() * 80,
                height: 100 + Math.random() * 60,
                speed: -50, // Slower than ground for parallax
                color: `hsl(${200 + Math.random() * 40}, 20%, ${30 + Math.random() * 20}%)`
            });
        }
    }

    customUpdate(deltaTime) {
        // Update clouds
        for (const cloud of this.clouds) {
            cloud.x += cloud.speed * deltaTime;
            
            // Reset cloud when off screen
            if (cloud.x < -cloud.size) {
                cloud.x = 850 + Math.random() * 200;
                cloud.y = Math.random() * 200 + 50;
            }
        }
        
        // Update mountains
        for (const mountain of this.mountains) {
            mountain.x += mountain.speed * deltaTime;
            
            // Reset mountain when off screen
            if (mountain.x < -mountain.width) {
                mountain.x = 850 + Math.random() * 100;
            }
        }
    }

    customRender(ctx) {
        const x = -this.dimensions.width / 2;
        const y = -this.dimensions.height / 2;
        
        // Draw sky gradient
        this.drawSky(ctx, x, y);
        
        // Draw mountains (back layer)
        this.drawMountains(ctx, x, y);
        
        // Draw clouds (front layer)
        this.drawClouds(ctx, x, y);
    }

    drawSky(ctx, x, y) {
        const gradient = ctx.createLinearGradient(0, y, 0, y + this.dimensions.height);
        gradient.addColorStop(0, '#87CEEB');   // Sky blue
        gradient.addColorStop(0.7, '#98FB98'); // Light green
        gradient.addColorStop(1, '#90EE90');   // Lighter green
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, this.dimensions.width, this.dimensions.height);
    }

    drawMountains(ctx, x, y) {
        for (const mountain of this.mountains) {
            ctx.fillStyle = mountain.color;
            
            // Draw simple triangle mountain
            ctx.beginPath();
            ctx.moveTo(x + mountain.x, y + mountain.y + mountain.height);
            ctx.lineTo(x + mountain.x + mountain.width / 2, y + mountain.y);
            ctx.lineTo(x + mountain.x + mountain.width, y + mountain.y + mountain.height);
            ctx.closePath();
            ctx.fill();
        }
    }

    drawClouds(ctx, x, y) {
        for (const cloud of this.clouds) {
            ctx.save();
            ctx.globalAlpha = cloud.opacity;
            ctx.fillStyle = '#FFFFFF';
            
            // Draw cloud with multiple circles
            const cloudX = x + cloud.x;
            const cloudY = y + cloud.y;
            const size = cloud.size;
            
            // Main cloud body
            ctx.beginPath();
            ctx.arc(cloudX, cloudY, size * 0.6, 0, 2 * Math.PI);
            ctx.arc(cloudX + size * 0.4, cloudY, size * 0.5, 0, 2 * Math.PI);
            ctx.arc(cloudX - size * 0.4, cloudY, size * 0.5, 0, 2 * Math.PI);
            ctx.arc(cloudX + size * 0.2, cloudY - size * 0.3, size * 0.4, 0, 2 * Math.PI);
            ctx.arc(cloudX - size * 0.2, cloudY - size * 0.3, size * 0.4, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.restore();
        }
    }

    updateSpeed(gameSpeed) {
        // Update cloud and mountain speeds based on game speed
        for (const cloud of this.clouds) {
            cloud.speed = (-20 - Math.random() * 30) * gameSpeed * 0.3; // Slower parallax
        }
        
        for (const mountain of this.mountains) {
            mountain.speed = -50 * gameSpeed * 0.5; // Medium parallax
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Ground, Background };
}
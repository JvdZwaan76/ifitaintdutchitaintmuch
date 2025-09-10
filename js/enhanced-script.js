/**
 * Enhanced Dutch Mystery Website - Interactive JavaScript
 * Mysterious entrance portal with advanced effects and interactions
 */

class DutchMysteryPortal {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.stars = [];
        this.floatingElements = [];
        this.mousePosition = { x: 0, y: 0 };
        this.isLoaded = false;
        
        // Configuration
        this.config = {
            particles: {
                count: 150,
                maxSpeed: 2,
                colors: ['#FF9500', '#00BFFF', '#00FFFF', '#FFD700'],
                sizes: { min: 1, max: 4 }
            },
            stars: {
                count: 200,
                twinkleSpeed: 0.02,
                colors: ['#FFFFFF', '#FFD700', '#00BFFF', '#FF9500']
            },
            floatingElements: {
                count: 30,
                symbols: ['🌷', '🏛️', '⚡', '🔮', '💎', '🌟'],
                speed: { min: 0.5, max: 2 }
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initCanvas();
        this.createParticles();
        this.createStars();
        this.createFloatingElements();
        this.startAnimationLoop();
        this.handleLoading();
        this.initFormEffects();
        this.initAccessibilityFeatures();
    }
    
    setupEventListeners() {
        // Mouse tracking for interactive effects
        document.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
            this.updateInteractiveEffects();
        });
        
        // Touch events for mobile
        document.addEventListener('touchmove', (e) => {
            if (e.touches[0]) {
                this.mousePosition.x = e.touches[0].clientX;
                this.mousePosition.y = e.touches[0].clientY;
                this.updateInteractiveEffects();
            }
        });
        
        // Window resize handling
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Visibility API for performance
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
        
        // Keyboard accessibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('feature-card')) {
                e.target.click();
            }
        });
    }
    
    initCanvas() {
        this.canvas = document.getElementById('background-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.handleResize();
        
        // Enable high DPI displays
        const devicePixelRatio = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * devicePixelRatio;
        this.canvas.height = rect.height * devicePixelRatio;
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.config.particles.count; i++) {
            this.particles.push(this.createParticle());
        }
    }
    
    createParticle() {
        return {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * this.config.particles.maxSpeed,
            vy: (Math.random() - 0.5) * this.config.particles.maxSpeed,
            size: Math.random() * (this.config.particles.sizes.max - this.config.particles.sizes.min) + this.config.particles.sizes.min,
            color: this.config.particles.colors[Math.floor(Math.random() * this.config.particles.colors.length)],
            opacity: Math.random() * 0.5 + 0.1,
            life: Math.random() * 200 + 100,
            maxLife: Math.random() * 200 + 100
        };
    }
    
    createStars() {
        this.stars = [];
        for (let i = 0; i < this.config.stars.count; i++) {
            this.stars.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 2 + 0.5,
                color: this.config.stars.colors[Math.floor(Math.random() * this.config.stars.colors.length)],
                twinkle: Math.random(),
                twinkleDirection: Math.random() > 0.5 ? 1 : -1
            });
        }
    }
    
    createFloatingElements() {
        this.floatingElements = [];
        const container = document.querySelector('.floating-elements');
        if (!container) return;
        
        for (let i = 0; i < this.config.floatingElements.count; i++) {
            const element = document.createElement('div');
            element.className = 'floating-element';
            element.textContent = this.config.floatingElements.symbols[Math.floor(Math.random() * this.config.floatingElements.symbols.length)];
            element.style.cssText = `
                position: absolute;
                font-size: ${Math.random() * 20 + 15}px;
                opacity: ${Math.random() * 0.3 + 0.1};
                pointer-events: none;
                z-index: 1;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: floatMystery ${Math.random() * 10 + 15}s infinite linear;
            `;
            
            container.appendChild(element);
            this.floatingElements.push({
                element: element,
                speed: Math.random() * (this.config.floatingElements.speed.max - this.config.floatingElements.speed.min) + this.config.floatingElements.speed.min,
                direction: Math.random() * Math.PI * 2
            });
        }
        
        // Add floating animation keyframes
        if (!document.getElementById('floating-styles')) {
            const style = document.createElement('style');
            style.id = 'floating-styles';
            style.textContent = `
                @keyframes floatMystery {
                    0% { transform: translateY(100vh) rotate(0deg); }
                    100% { transform: translateY(-100px) rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    updateParticles() {
        if (!this.ctx) return;
        
        this.particles.forEach((particle, index) => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Mouse interaction
            const dx = this.mousePosition.x - particle.x;
            const dy = this.mousePosition.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.vx += dx * force * 0.01;
                particle.vy += dy * force * 0.01;
            }
            
            // Boundary wrapping
            if (particle.x < 0) particle.x = window.innerWidth;
            if (particle.x > window.innerWidth) particle.x = 0;
            if (particle.y < 0) particle.y = window.innerHeight;
            if (particle.y > window.innerHeight) particle.y = 0;
            
            // Update life
            particle.life--;
            particle.opacity = (particle.life / particle.maxLife) * 0.5;
            
            // Respawn particle if dead
            if (particle.life <= 0) {
                this.particles[index] = this.createParticle();
            }
        });
    }
    
    updateStars() {
        this.stars.forEach(star => {
            star.twinkle += this.config.stars.twinkleSpeed * star.twinkleDirection;
            if (star.twinkle >= 1 || star.twinkle <= 0) {
                star.twinkleDirection *= -1;
            }
        });
    }
    
    drawParticles() {
        if (!this.ctx) return;
        
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = particle.color;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    drawStars() {
        if (!this.ctx) return;
        
        this.stars.forEach(star => {
            this.ctx.save();
            this.ctx.globalAlpha = star.twinkle * 0.8;
            this.ctx.fillStyle = star.color;
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = star.color;
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    drawConnections() {
        if (!this.ctx) return;
        
        // Draw connections between nearby particles
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 80) {
                    this.ctx.save();
                    this.ctx.strokeStyle = '#FF9500';
                    this.ctx.globalAlpha = (80 - distance) / 80 * 0.2;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                    this.ctx.restore();
                }
            }
        }
    }
    
    updateInteractiveEffects() {
        // Update cursor glow effect
        const cursor = document.querySelector('.cursor-glow') || this.createCursorGlow();
        if (cursor) {
            cursor.style.left = this.mousePosition.x - 50 + 'px';
            cursor.style.top = this.mousePosition.y - 50 + 'px';
        }
        
        // Update particle attraction
        this.particles.forEach(particle => {
            const dx = this.mousePosition.x - particle.x;
            const dy = this.mousePosition.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                const attraction = (150 - distance) / 150 * 0.05;
                particle.vx += dx * attraction * 0.01;
                particle.vy += dy * attraction * 0.01;
            }
        });
    }
    
    createCursorGlow() {
        const cursor = document.createElement('div');
        cursor.className = 'cursor-glow';
        cursor.style.cssText = `
            position: fixed;
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, rgba(255, 149, 0, 0.1) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(cursor);
        
        document.addEventListener('mousemove', () => {
            cursor.style.opacity = '1';
        });
        
        return cursor;
    }
    
    startAnimationLoop() {
        const animate = () => {
            if (this.ctx) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.updateStars();
                this.updateParticles();
                
                this.drawStars();
                this.drawParticles();
                this.drawConnections();
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    handleResize() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Redistribute particles and stars
        this.createParticles();
        this.createStars();
    }
    
    handleLoading() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const loadingScreen = document.getElementById('loadingScreen');
                if (loadingScreen) {
                    loadingScreen.classList.add('fade-out');
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                        this.isLoaded = true;
                        this.triggerEntryAnimations();
                    }, 1000);
                }
            }, 2000); // Extended loading for mystery effect
        });
    }
    
    triggerEntryAnimations() {
        // Stagger element animations
        const elements = [
            '.neon-title',
            '.teaser',
            '.login-form',
            '.features-preview',
            '.neon-footer'
        ];
        
        elements.forEach((selector, index) => {
            const element = document.querySelector(selector);
            if (element) {
                setTimeout(() => {
                    element.style.animation = `fadeInUp 1s ease-out forwards`;
                }, index * 200);
            }
        });
        
        // Add fadeInUp keyframes if not present
        if (!document.getElementById('entry-animations')) {
            const style = document.createElement('style');
            style.id = 'entry-animations';
            style.textContent = `
                @keyframes fadeInUp {
                    0% { opacity: 0; transform: translateY(30px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    initFormEffects() {
        const form = document.getElementById('loginForm');
        const message = document.getElementById('message');
        
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            
            if (!username || !password) {
                this.showMessage('The void requires both identity and secret...', 'warning');
                return;
            }
            
            // Add loading animation to button
            const button = form.querySelector('.void-button');
            const originalText = button.querySelector('.button-text').textContent;
            button.querySelector('.button-text').textContent = 'Entering...';
            button.disabled = true;
            button.style.opacity = '0.7';
            
            try {
                // Simulate API call with enhanced feedback
                const response = await this.simulateLogin(username, password);
                
                if (response.success) {
                    this.showMessage('✨ Access Granted. Welcome to the mystery...', 'success');
                    this.triggerSuccessEffects();
                    
                    // Simulate redirect after success
                    setTimeout(() => {
                        this.showMessage('Preparing your journey into the Dutch void...', 'info');
                    }, 2000);
                } else {
                    this.showMessage('🔒 Access Denied. The mystery remains sealed...', 'error');
                    this.triggerErrorEffects();
                }
            } catch (error) {
                this.showMessage('⚠️ Error connecting to the void. Try again...', 'error');
            } finally {
                // Restore button
                setTimeout(() => {
                    button.querySelector('.button-text').textContent = originalText;
                    button.disabled = false;
                    button.style.opacity = '1';
                }, 1000);
            }
        });
        
        // Enhanced input effects
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                this.createInputParticles(e.target);
            });
            
            input.addEventListener('blur', (e) => {
                this.removeInputParticles(e.target);
            });
            
            // Real-time validation feedback
            input.addEventListener('input', (e) => {
                this.validateInput(e.target);
            });
        });
        
        // Feature card interactions
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.addEventListener('click', () => {
                this.triggerFeaturePreview(card);
            });
            
            card.addEventListener('mouseenter', () => {
                this.createCardGlow(card);
            });
            
            card.addEventListener('mouseleave', () => {
                this.removeCardGlow(card);
            });
        });
    }
    
    simulateLogin(username, password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Check if there's an existing login API
                fetch('/functions/api/login.js')
                    .then(response => {
                        if (response.ok) {
                            // Use existing login API
                            return fetch('/api/login', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ username, password })
                            }).then(res => res.json());
                        } else {
                            throw new Error('No existing API found');
                        }
                    })
                    .catch(() => {
                        // Fallback to simulation if no API exists
                        console.log('🔄 Using simulated login (no API endpoint found)');
                        
                        // Enhanced login simulation with different responses
                        const validCombos = [
                            { username: 'dutch', password: 'mystery' },
                            { username: 'amsterdam', password: 'techno' },
                            { username: 'windmill', password: 'tulip' },
                            { username: 'void', password: 'enter' },
                            { username: 'portal', password: 'access' },
                            { username: 'mystery', password: 'dutch' }
                        ];
                        
                        const isValid = validCombos.some(combo => 
                            combo.username === username.toLowerCase() && 
                            combo.password === password.toLowerCase()
                        );
                        
                        return { 
                            success: isValid,
                            message: isValid ? 'Welcome to the Dutch mystery' : 'Invalid credentials'
                        };
                    })
                    .then(result => {
                        resolve(result);
                    })
                    .catch(error => {
                        console.error('Login error:', error);
                        resolve({ 
                            success: false,
                            message: 'Connection error - try again'
                        });
                    });
            }, Math.random() * 1000 + 500); // Shorter delay for better UX
        });
    }
    
    showMessage(text, type = 'info') {
        const message = document.getElementById('message');
        if (!message) return;
        
        message.textContent = text;
        message.className = `show ${type}`;
        
        // Auto-hide after delay
        setTimeout(() => {
            message.classList.remove('show');
        }, 5000);
        
        // Accessibility announcement
        this.announceToScreenReader(text);
    }
    
    triggerSuccessEffects() {
        // Create success particle burst
        this.createParticleBurst(window.innerWidth / 2, window.innerHeight / 2, '#00FF00');
        
        // Flash screen effect
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, #00FF00, #00FFFF);
            opacity: 0;
            pointer-events: none;
            z-index: 9998;
            animation: flashSuccess 0.5s ease-out;
        `;
        
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 500);
        
        // Add success animation styles
        if (!document.getElementById('success-styles')) {
            const style = document.createElement('style');
            style.id = 'success-styles';
            style.textContent = `
                @keyframes flashSuccess {
                    0% { opacity: 0; }
                    50% { opacity: 0.3; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    triggerErrorEffects() {
        // Screen shake effect
        document.body.style.animation = 'screenShake 0.5s ease-in-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
        
        // Add error animation styles
        if (!document.getElementById('error-styles')) {
            const style = document.createElement('style');
            style.id = 'error-styles';
            style.textContent = `
                @keyframes screenShake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    createParticleBurst(x, y, color) {
        const burstParticles = [];
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const speed = Math.random() * 5 + 2;
            
            burstParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 4 + 2,
                color: color,
                opacity: 1,
                life: 60
            });
        }
        
        const animateBurst = () => {
            if (!this.ctx) return;
            
            burstParticles.forEach((particle, index) => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vx *= 0.98;
                particle.vy *= 0.98;
                particle.opacity -= 0.02;
                particle.life--;
                
                if (particle.life > 0) {
                    this.ctx.save();
                    this.ctx.globalAlpha = particle.opacity;
                    this.ctx.fillStyle = particle.color;
                    this.ctx.shadowBlur = 10;
                    this.ctx.shadowColor = particle.color;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.restore();
                } else {
                    burstParticles.splice(index, 1);
                }
            });
            
            if (burstParticles.length > 0) {
                requestAnimationFrame(animateBurst);
            }
        };
        
        animateBurst();
    }
    
    createInputParticles(input) {
        const rect = input.getBoundingClientRect();
        const particles = [];
        
        for (let i = 0; i < 10; i++) {
            particles.push({
                x: rect.left + Math.random() * rect.width,
                y: rect.top + rect.height,
                vy: -Math.random() * 2 - 1,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.5,
                life: 60
            });
        }
        
        input._particles = particles;
        this.animateInputParticles(input);
    }
    
    animateInputParticles(input) {
        if (!input._particles) return;
        
        const animate = () => {
            if (!input._particles || input._particles.length === 0) return;
            
            input._particles.forEach((particle, index) => {
                particle.y += particle.vy;
                particle.opacity -= 0.02;
                particle.life--;
                
                if (particle.life <= 0) {
                    input._particles.splice(index, 1);
                }
            });
            
            if (input._particles.length > 0) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    removeInputParticles(input) {
        if (input._particles) {
            input._particles = [];
        }
    }
    
    validateInput(input) {
        const value = input.value.trim();
        const inputGroup = input.closest('.input-group');
        
        if (inputGroup) {
            inputGroup.classList.remove('valid', 'invalid');
            
            if (value.length > 0) {
                inputGroup.classList.add('valid');
            }
        }
    }
    
    createCardGlow(card) {
        if (card._glowElement) return;
        
        const glow = document.createElement('div');
        glow.style.cssText = `
            position: absolute;
            top: -10px;
            left: -10px;
            right: -10px;
            bottom: -10px;
            background: radial-gradient(circle, rgba(0, 191, 255, 0.2) 0%, transparent 70%);
            border-radius: 20px;
            z-index: -1;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        card.style.position = 'relative';
        card.appendChild(glow);
        card._glowElement = glow;
        
        setTimeout(() => {
            glow.style.opacity = '1';
        }, 50);
    }
    
    removeCardGlow(card) {
        if (card._glowElement) {
            card._glowElement.style.opacity = '0';
            setTimeout(() => {
                if (card._glowElement) {
                    card._glowElement.remove();
                    card._glowElement = null;
                }
            }, 300);
        }
    }
    
    triggerFeaturePreview(card) {
        const feature = card.dataset.feature;
        const messages = {
            merchandise: '🛍️ Heritage Collection: Exclusive Dutch-inspired apparel awaits beyond the portal...',
            events: '🎵 Underground Access: Secret Amsterdam techno experiences for the initiated...',
            culture: '🔮 Cultural Secrets: Hidden treasures of Dutch heritage revealed to explorers...'
        };
        
        this.showMessage(messages[feature] || 'Mystery feature revealed...', 'info');
        
        // Add special effect
        this.createParticleBurst(
            card.getBoundingClientRect().left + card.offsetWidth / 2,
            card.getBoundingClientRect().top + card.offsetHeight / 2,
            '#FFD700'
        );
    }
    
    initAccessibilityFeatures() {
        // Keyboard navigation for feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
        });
        
        // Skip link for accessibility
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link sr-only';
        skipLink.textContent = 'Skip to main content';
        skipLink.style.cssText = `
            position: fixed;
            top: -40px;
            left: 6px;
            background: #000;
            color: #fff;
            padding: 8px;
            text-decoration: none;
            z-index: 10000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
            skipLink.classList.remove('sr-only');
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
            skipLink.classList.add('sr-only');
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add main content ID
        const container = document.querySelector('.container');
        if (container) {
            container.id = 'main-content';
        }
    }
    
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
    
    pauseAnimations() {
        // Reduce animation intensity when tab is not visible
        this.config.particles.count = Math.floor(this.config.particles.count * 0.5);
        this.particles = this.particles.slice(0, this.config.particles.count);
    }
    
    resumeAnimations() {
        // Restore full animation intensity
        this.config.particles.count = 150;
        this.createParticles();
    }
}

// Enhanced Smoke Particle System
class SmokeSystem {
    constructor() {
        this.container = document.querySelector('.smoke');
        this.particles = [];
        this.maxParticles = 25;
        this.init();
    }
    
    init() {
        if (!this.container) return;
        
        this.createParticles();
        setInterval(() => {
            this.createParticle();
        }, 800);
    }
    
    createParticles() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createParticle();
            }, i * 200);
        }
    }
    
    createParticle() {
        if (this.particles.length >= this.maxParticles) return;
        
        const particle = document.createElement('div');
        particle.className = 'smoke-particle';
        
        const size = Math.random() * 120 + 60;
        const startX = Math.random() * 100;
        const endX = startX + (Math.random() - 0.5) * 40;
        const opacity = Math.random() * 0.4 + 0.1;
        const duration = Math.random() * 20000 + 15000;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, rgba(255, 149, 0, ${opacity}) 0%, transparent 70%);
            border-radius: 50%;
            left: ${startX}%;
            top: 100%;
            pointer-events: none;
            filter: blur(${Math.random() * 15 + 10}px);
            z-index: 1;
        `;
        
        this.container.appendChild(particle);
        this.particles.push(particle);
        
        const animation = particle.animate([
            {
                transform: 'translateY(0) scale(0.5) rotate(0deg)',
                opacity: opacity
            },
            {
                transform: `translateY(-${window.innerHeight + 100}px) translateX(${endX - startX}%) scale(${Math.random() + 1.5}) rotate(${Math.random() * 360}deg)`,
                opacity: 0
            }
        ], {
            duration: duration,
            easing: 'ease-out'
        });
        
        animation.onfinish = () => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
            const index = this.particles.indexOf(particle);
            if (index > -1) {
                this.particles.splice(index, 1);
            }
        };
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main portal system
    const portal = new DutchMysteryPortal();
    
    // Initialize smoke system
    const smokeSystem = new SmokeSystem();
    
    // Enhanced error handling
    window.addEventListener('error', (e) => {
        console.warn('Dutch Mystery Portal:', e.error?.message || 'Unknown error');
    });
    
    // Performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            if (loadTime > 3000) {
                console.warn('Portal loading slowly. Consider reducing effects for better performance.');
            }
        });
    }
    
    // Add custom CSS for dynamic effects
    const dynamicStyles = document.createElement('style');
    dynamicStyles.textContent = `
        .input-group.valid input {
            border-color: #00FF00;
            box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
        }
        
        .input-group.invalid input {
            border-color: #FF0000;
            box-shadow: 0 0 15px rgba(255, 0, 0, 0.3);
        }
        
        #message.success {
            color: #00FF00;
            text-shadow: 0 0 10px #00FF00;
        }
        
        #message.error {
            color: #FF0000;
            text-shadow: 0 0 10px #FF0000;
        }
        
        #message.warning {
            color: #FFD700;
            text-shadow: 0 0 10px #FFD700;
        }
        
        #message.info {
            color: #00BFFF;
            text-shadow: 0 0 10px #00BFFF;
        }
        
        .skip-link:focus {
            background: #000 !important;
            color: #fff !important;
            text-decoration: none !important;
            border: 2px solid #fff !important;
        }
    `;
    document.head.appendChild(dynamicStyles);
    
    console.log('🌷 Dutch Mystery Portal initialized. Enter if you dare...');
});

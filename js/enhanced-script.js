/**
 * Enhanced Dutch Mystery Website - Interactive JavaScript
 * Clean version without duplicated classes
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
        this.animationId = null;
        this.isVisible = true;
        this.isMobile = this.detectMobile();
        this.performanceMode = this.isMobile;
        
        this.config = {
            particles: {
                count: this.performanceMode ? 50 : 150,
                maxSpeed: this.performanceMode ? 1 : 2,
                colors: ['#FF9500', '#00BFFF', '#00FFFF', '#FFD700'],
                sizes: { min: 1, max: this.performanceMode ? 3 : 4 }
            },
            stars: {
                count: this.performanceMode ? 100 : 200,
                twinkleSpeed: 0.02,
                colors: ['#FFFFFF', '#FFD700', '#00BFFF', '#FF9500']
            },
            floatingElements: {
                count: this.performanceMode ? 15 : 30,
                symbols: ['🌷', '🛠️', '⚡', '🔮', '💎', '🌟'],
                speed: { min: 0.5, max: 2 }
            }
        };
        
        this.init();
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768 ||
               ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0);
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
        this.initMobileOptimizations();
    }
    
    setupEventListeners() {
        let mouseMoveThrottled = this.throttle((e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
            if (!this.isMobile) {
                this.updateInteractiveEffects();
            }
        }, 16);
        
        if (!this.isMobile) {
            document.addEventListener('mousemove', mouseMoveThrottled);
        }
        
        if (this.isMobile) {
            let touchMoveThrottled = this.throttle((e) => {
                if (e.touches[0]) {
                    this.mousePosition.x = e.touches[0].clientX;
                    this.mousePosition.y = e.touches[0].clientY;
                }
            }, 32);
            
            document.addEventListener('touchmove', touchMoveThrottled, { passive: true });
        }
        
        let resizeDebounced = this.debounce(() => {
            this.handleResize();
        }, 250);
        
        window.addEventListener('resize', resizeDebounced);
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 200);
        });
        
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (this.isVisible) {
                this.resumeAnimations();
            } else {
                this.pauseAnimations();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('feature-card')) {
                e.preventDefault();
                e.target.click();
            }
            
            if (e.key === 'Escape') {
                this.resetInteractiveStates();
            }
        });
        
        let scrollThrottled = this.throttle(() => {
            this.handleScroll();
        }, 16);
        
        window.addEventListener('scroll', scrollThrottled, { passive: true });
    }
    
    initCanvas() {
        this.canvas = document.getElementById('background-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        
        if (this.isMobile) {
            this.ctx.imageSmoothingEnabled = false;
        }
        
        this.handleResize();
    }
    
    handleResize() {
        if (!this.canvas || !this.ctx) return;
        
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        const devicePixelRatio = window.devicePixelRatio || 1;
        const backingStoreRatio = this.ctx.webkitBackingStorePixelRatio ||
                                  this.ctx.mozBackingStorePixelRatio ||
                                  this.ctx.msBackingStorePixelRatio ||
                                  this.ctx.oBackingStorePixelRatio ||
                                  this.ctx.backingStorePixelRatio || 1;
        
        const ratio = devicePixelRatio / backingStoreRatio;
        
        this.canvas.width = width * ratio;
        this.canvas.height = height * ratio;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        this.ctx.scale(ratio, ratio);
        
        this.redistributeElements();
    }
    
    redistributeElements() {
        this.particles.forEach(particle => {
            if (particle.x > window.innerWidth) particle.x = window.innerWidth;
            if (particle.y > window.innerHeight) particle.y = window.innerHeight;
        });
        
        this.stars.forEach(star => {
            if (star.x > window.innerWidth) star.x = window.innerWidth;
            if (star.y > window.innerHeight) star.y = window.innerHeight;
        });
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
        
        container.innerHTML = '';
        
        for (let i = 0; i < this.config.floatingElements.count; i++) {
            const element = document.createElement('div');
            element.className = 'floating-element';
            element.textContent = this.config.floatingElements.symbols[Math.floor(Math.random() * this.config.floatingElements.symbols.length)];
            element.style.cssText = `
                position: absolute;
                font-size: ${Math.random() * (this.isMobile ? 15 : 20) + (this.isMobile ? 10 : 15)}px;
                opacity: ${Math.random() * 0.3 + 0.1};
                pointer-events: none;
                z-index: 1;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: floatMystery ${Math.random() * 10 + 15}s infinite linear;
                will-change: transform;
            `;
            
            container.appendChild(element);
        }
        
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
    
    startAnimationLoop() {
        let lastTime = 0;
        let frameCount = 0;
        let fps = 60;
        
        const animate = (currentTime) => {
            if (!this.isVisible) {
                this.animationId = requestAnimationFrame(animate);
                return;
            }
            
            const deltaTime = currentTime - lastTime;
            const targetFrameTime = this.isMobile ? 33.33 : 16.67;
            
            if (deltaTime >= targetFrameTime) {
                frameCount++;
                
                if (frameCount % 60 === 0) {
                    fps = Math.round(1000 / deltaTime);
                    
                    if (fps < 25 && !this.performanceMode) {
                        this.enablePerformanceMode();
                    } else if (fps > 50 && this.performanceMode && !this.isMobile) {
                        this.disablePerformanceMode();
                    }
                }
                
                if (this.ctx) {
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    
                    this.updateStars();
                    this.updateParticles();
                    
                    this.drawStars();
                    this.drawParticles();
                    
                    if (!this.isMobile && !this.performanceMode) {
                        this.drawConnections();
                    }
                }
                
                lastTime = currentTime;
            }
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        this.animationId = requestAnimationFrame(animate);
    }
    
    updateParticles() {
        if (!this.ctx) return;
        
        this.particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (!this.isMobile) {
                const dx = this.mousePosition.x - particle.x;
                const dy = this.mousePosition.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const force = (100 - distance) / 100;
                    particle.vx += dx * force * 0.01;
                    particle.vy += dy * force * 0.01;
                }
            }
            
            if (particle.x < 0) particle.x = window.innerWidth;
            if (particle.x > window.innerWidth) particle.x = 0;
            if (particle.y < 0) particle.y = window.innerHeight;
            if (particle.y > window.innerHeight) particle.y = 0;
            
            particle.life--;
            particle.opacity = (particle.life / particle.maxLife) * 0.5;
            
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
            
            if (!this.performanceMode) {
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = particle.color;
            }
            
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
            
            if (!this.performanceMode) {
                this.ctx.shadowBlur = 5;
                this.ctx.shadowColor = star.color;
            }
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    drawConnections() {
        if (!this.ctx || this.performanceMode) return;
        
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
    
    handleScroll() {
        if (this.isMobile) return;
        
        const scrollY = window.pageYOffset;
        const scrollPercent = scrollY / (document.body.scrollHeight - window.innerHeight);
        
        const backgroundGradient = document.querySelector('.background-gradient');
        if (backgroundGradient) {
            backgroundGradient.style.transform = `translateY(${scrollY * 0.3}px)`;
        }
        
        this.particles.forEach(particle => {
            particle.vy += scrollPercent * 0.1;
        });
    }
    
    updateInteractiveEffects() {
        if (this.isMobile) return;
        
        const cursor = document.querySelector('.cursor-glow') || this.createCursorGlow();
        if (cursor) {
            cursor.style.left = this.mousePosition.x - 50 + 'px';
            cursor.style.top = this.mousePosition.y - 50 + 'px';
        }
    }
    
    createCursorGlow() {
        if (this.isMobile) return null;
        
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
            will-change: transform;
        `;
        
        document.body.appendChild(cursor);
        
        document.addEventListener('mousemove', () => {
            cursor.style.opacity = '1';
        });
        
        return cursor;
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
            }, this.isMobile ? 1000 : 2000);
        });
    }
    
    triggerEntryAnimations() {
        const elements = [
            '.neon-title',
            '.teaser',
            '.audio-mystery',
            '.access-request-section',
            '.login-form',
            '.features-preview',
            '.neon-footer'
        ];
        
        elements.forEach((selector, index) => {
            const element = document.querySelector(selector);
            if (element) {
                setTimeout(() => {
                    element.style.animation = `fadeInUp 1s ease-out forwards`;
                }, index * (this.isMobile ? 100 : 200));
            }
        });
        
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
        
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                if (!this.isMobile) {
                    this.createInputParticles(e.target);
                }
            });
            
            input.addEventListener('blur', (e) => {
                if (!this.isMobile) {
                    this.removeInputParticles(e.target);
                }
            });
            
            input.addEventListener('input', (e) => {
                this.validateInput(e.target);
            });
        });
        
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.addEventListener('click', () => {
                this.triggerFeaturePreview(card);
            });
            
            if (!this.isMobile) {
                card.addEventListener('mouseenter', () => {
                    this.createCardGlow(card);
                });
                
                card.addEventListener('mouseleave', () => {
                    this.removeCardGlow(card);
                });
            }
        });
    }
    
    initMobileOptimizations() {
        if (!this.isMobile) return;
        
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
                }
            });
            
            input.addEventListener('blur', () => {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    viewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
                }
            });
        });
        
        if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
            const setViewportHeight = () => {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            };
            
            setViewportHeight();
            window.addEventListener('resize', setViewportHeight);
            window.addEventListener('orientationchange', () => {
                setTimeout(setViewportHeight, 200);
            });
        }
        
        document.addEventListener('touchstart', () => {}, { passive: true });
        document.addEventListener('touchmove', () => {}, { passive: true });
        document.addEventListener('touchend', () => {}, { passive: true });
    }
    
    showMessage(text, type = 'info') {
        const message = document.getElementById('message');
        if (!message) return;
        
        message.textContent = text;
        message.className = `show ${type}`;
        
        setTimeout(() => {
            message.classList.remove('show');
        }, this.isMobile ? 3000 : 5000);
        
        this.announceToScreenReader(text);
    }
    
    triggerSuccessEffects() {
        this.createParticleBurst(window.innerWidth / 2, window.innerHeight / 2, '#00FF00');
        
        if (!this.isMobile) {
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
        }
        
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
        if (this.isMobile) {
            if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
            }
        } else {
            document.body.style.animation = 'screenShake 0.5s ease-in-out';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 500);
        }
        
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
        if (this.performanceMode) return;
        
        const burstParticles = [];
        const particleCount = this.isMobile ? 10 : 20;
        
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
                life: this.isMobile ? 30 : 60
            });
        }
        
        const animateBurst = () => {
            if (!this.ctx) return;
            
            burstParticles.forEach((particle, index) => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vx *= 0.98;
                particle.vy *= 0.98;
                particle.opacity -= this.isMobile ? 0.04 : 0.02;
                particle.life--;
                
                if (particle.life > 0) {
                    this.ctx.save();
                    this.ctx.globalAlpha = particle.opacity;
                    this.ctx.fillStyle = particle.color;
                    
                    if (!this.performanceMode) {
                        this.ctx.shadowBlur = 10;
                        this.ctx.shadowColor = particle.color;
                    }
                    
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
    
    enablePerformanceMode() {
        this.performanceMode = true;
        this.config.particles.count = Math.floor(this.config.particles.count * 0.5);
        this.config.stars.count = Math.floor(this.config.stars.count * 0.5);
        this.particles = this.particles.slice(0, this.config.particles.count);
        this.stars = this.stars.slice(0, this.config.stars.count);
        console.log('Performance mode enabled');
    }
    
    disablePerformanceMode() {
        this.performanceMode = false;
        this.config.particles.count = this.isMobile ? 50 : 150;
        this.config.stars.count = this.isMobile ? 100 : 200;
        this.createParticles();
        this.createStars();
        console.log('Performance mode disabled');
    }
    
    createInputParticles(input) {
        if (this.isMobile || this.performanceMode) return;
        
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
        if (card._glowElement || this.isMobile) return;
        
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
            will-change: opacity;
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
            merchandise: 'Heritage Collection: Exclusive Dutch-inspired apparel awaits beyond the portal...',
            events: 'Underground Access: Secret Amsterdam techno experiences for the initiated...',
            culture: 'Cultural Secrets: Hidden treasures of Dutch heritage revealed to explorers...'
        };
        
        this.showMessage(messages[feature] || 'Mystery feature revealed...', 'info');
        
        if (!this.isMobile) {
            this.createParticleBurst(
                card.getBoundingClientRect().left + card.offsetWidth / 2,
                card.getBoundingClientRect().top + card.offsetHeight / 2,
                '#FFD700'
            );
        }
    }
    
    initAccessibilityFeatures() {
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
        });
        
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.style.cssText += `
                position: fixed;
                top: -40px;
                left: 6px;
                background: #000;
                color: #fff;
                padding: 8px;
                text-decoration: none;
                z-index: 10000;
                transition: top 0.3s;
                border: 2px solid #fff;
            `;
            
            skipLink.addEventListener('focus', () => {
                skipLink.style.top = '6px';
            });
            
            skipLink.addEventListener('blur', () => {
                skipLink.style.top = '-40px';
            });
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
            if (announcement.parentNode) {
                document.body.removeChild(announcement);
            }
        }, 1000);
    }
    
    pauseAnimations() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    resumeAnimations() {
        if (!this.animationId) {
            this.startAnimationLoop();
        }
    }
    
    resetInteractiveStates() {
        const message = document.getElementById('message');
        if (message) {
            message.classList.remove('show');
        }
        
        const tempElements = document.querySelectorAll('.cursor-glow, [id*="success-"], [id*="error-"]');
        tempElements.forEach(el => el.remove());
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
}

// Enhanced Smoke Particle System
class SmokeSystem {
    constructor() {
        this.container = document.querySelector('.smoke');
        this.particles = [];
        this.maxParticles = this.detectMobile() ? 10 : 25;
        this.isMobile = this.detectMobile();
        this.init();
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }
    
    init() {
        if (!this.container) return;
        
        this.createParticles();
        setInterval(() => {
            this.createParticle();
        }, this.isMobile ? 1500 : 800);
    }
    
    createParticles() {
        const initialCount = this.isMobile ? 2 : 5;
        for (let i = 0; i < initialCount; i++) {
            setTimeout(() => {
                this.createParticle();
            }, i * 200);
        }
    }
    
    createParticle() {
        if (this.particles.length >= this.maxParticles) return;
        
        const particle = document.createElement('div');
        particle.className = 'smoke-particle';
        
        const size = Math.random() * (this.isMobile ? 80 : 120) + (this.isMobile ? 40 : 60);
        const startX = Math.random() * 100;
        const endX = startX + (Math.random() - 0.5) * 40;
        const opacity = Math.random() * 0.4 + 0.1;
        const duration = Math.random() * (this.isMobile ? 15000 : 20000) + (this.isMobile ? 10000 : 15000);
        
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
            will-change: transform;
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
    window.DutchMysteryPortal = new DutchMysteryPortal();
    const smokeSystem = new SmokeSystem();
    
    window.addEventListener('error', (e) => {
        console.warn('Dutch Mystery Portal:', e.error?.message || 'Unknown error');
    });
    
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            if (loadTime > 5000) {
                console.warn('Portal loading slowly. Consider reducing effects for better performance.');
            }
        });
    }
    
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
        
        @media (max-width: 768px) {
            .cursor-glow {
                display: none !important;
            }
        }
        
        @media (prefers-reduced-motion: reduce) {
            .floating-element {
                animation: none !important;
            }
            
            .smoke-particle {
                animation: none !important;
            }
        }
    `;
    document.head.appendChild(dynamicStyles);
    
    console.log('Dutch Mystery Portal initialized.');
});

// Global functions for HTML interactions
function showComingSoon() {
    if (window.DutchMysteryPortal) {
        window.DutchMysteryPortal.showMessage('More Dutch mysteries are being crafted... Stay tuned for exclusive releases!', 'info');
    }
}

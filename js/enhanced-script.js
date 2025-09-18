/**
 * Enhanced Dutch Underground Techno Website - PRODUCTION VERSION
 * Version: 4.2.0 - Authentication Fixed + Complete Blog Integration
 */

class DutchUndergroundPortal {
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
        
        // API Configuration
        this.API_BASE = window.location.origin;
        this.endpoints = {
            accessRequest: '/api/access-request',
            adminLogin: '/api/admin/login',
            health: '/api/health',
            blog: '/blog'
        };
        
        this.config = {
            particles: {
                count: this.performanceMode ? 30 : 100,
                maxSpeed: this.performanceMode ? 1 : 2,
                colors: ['#FF9500', '#00BFFF', '#00FFFF', '#FFD700'],
                sizes: { min: 1, max: this.performanceMode ? 3 : 4 }
            },
            stars: {
                count: this.performanceMode ? 50 : 150,
                twinkleSpeed: 0.02,
                colors: ['#FFFFFF', '#FFD700', '#00BFFF', '#FF9500']
            },
            floatingElements: {
                count: this.performanceMode ? 10 : 20,
                symbols: ['⚡', '🔊', '🏭', '🎛️', '💎', '🌟'],
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
        console.log('Dutch Underground Portal v4.2.0 initializing...');
        
        this.handleLoadingScreen();
        this.setupEventListeners();
        this.initBackgroundVideo();
        this.initCanvas();
        this.createParticles();
        this.createStars();
        this.createFloatingElements();
        this.startAnimationLoop();
        this.initFormEffects();
        this.initAccessibilityFeatures();
        this.initMobileOptimizations();
        this.initBackendIntegration();
        
        // Check if user is already authenticated on page load
        this.checkAuthenticationState();
        
        console.log('Dutch Underground Portal initialized successfully');
    }

    /**
     * FIXED: Check authentication state on page load
     */
    checkAuthenticationState() {
        const isAuthenticated = this.isUserAuthenticated();
        console.log('Current authentication state:', isAuthenticated);
        
        if (isAuthenticated) {
            console.log('User is authenticated, updating UI...');
            this.updateUIForAuthenticatedUser();
        }
    }

    /**
     * FIXED: Check if user is authenticated
     */
    isUserAuthenticated() {
        // Check multiple authentication methods
        
        // Method 1: Session storage
        const sessionAuth = sessionStorage.getItem('dutchPortalAuth');
        if (sessionAuth === 'authenticated') {
            console.log('Found session storage authentication');
            return true;
        }
        
        // Method 2: Local storage (fallback)
        const localAuth = localStorage.getItem('dutchPortalAuth');
        if (localAuth === 'authenticated') {
            console.log('Found local storage authentication');
            return true;
        }
        
        // Method 3: Cookie
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'dutchPortalAuth' && value === 'authenticated') {
                console.log('Found cookie authentication');
                return true;
            }
        }
        
        console.log('No authentication found');
        return false;
    }

    /**
     * FIXED: Set authentication state properly
     */
    setAuthenticated(username = 'void') {
        const authData = {
            username: username,
            loginTime: new Date().toISOString(),
            sessionId: this.generateSessionId()
        };
        
        // Set in multiple places to ensure worker can detect it
        
        // 1. Session storage
        sessionStorage.setItem('dutchPortalAuth', 'authenticated');
        sessionStorage.setItem('dutchPortalUser', JSON.stringify(authData));
        sessionStorage.setItem('dutchPortalTime', new Date().toISOString());
        
        // 2. Local storage (backup)
        localStorage.setItem('dutchPortalAuth', 'authenticated');
        localStorage.setItem('dutchPortalUser', JSON.stringify(authData));
        
        // 3. Cookies that the worker can read
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + (24 * 60 * 60 * 1000)); // 24 hours
        
        document.cookie = `dutchPortalAuth=authenticated; expires=${expiryDate.toUTCString()}; path=/; secure; samesite=strict`;
        document.cookie = `dutchPortalUser=${encodeURIComponent(JSON.stringify(authData))}; expires=${expiryDate.toUTCString()}; path=/; secure; samesite=strict`;
        document.cookie = `dutchPortalSession=${authData.sessionId}; expires=${expiryDate.toUTCString()}; path=/; secure; samesite=strict`;
        
        console.log('✅ Authentication state set successfully');
        console.log('Session ID:', authData.sessionId);
        console.log('Cookies set:', document.cookie);
        
        // Update UI
        this.updateUIForAuthenticatedUser();
    }

    /**
     * FIXED: Clear authentication state
     */
    clearAuthentication() {
        // Clear session storage
        sessionStorage.removeItem('dutchPortalAuth');
        sessionStorage.removeItem('dutchPortalUser');
        sessionStorage.removeItem('dutchPortalTime');
        sessionStorage.removeItem('dutchPortalSession');
        
        // Clear local storage
        localStorage.removeItem('dutchPortalAuth');
        localStorage.removeItem('dutchPortalUser');
        
        // Clear cookies
        const expiredDate = 'Thu, 01 Jan 1970 00:00:01 GMT';
        document.cookie = `dutchPortalAuth=; expires=${expiredDate}; path=/;`;
        document.cookie = `dutchPortalUser=; expires=${expiredDate}; path=/;`;
        document.cookie = `dutchPortalSession=; expires=${expiredDate}; path=/;`;
        
        console.log('🔓 Authentication cleared');
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return 'dutch_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    }

    /**
     * Update UI for authenticated users
     */
    updateUIForAuthenticatedUser() {
        console.log('UI updated for authenticated user');
        
        // Update navigation if we're on a page with navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (link.href.includes('/blog')) {
                link.style.opacity = '1';
                link.style.pointerEvents = 'auto';
            }
        });
    }

    handleLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        
        if (loadingScreen) {
            const maxLoadTime = this.isMobile ? 2000 : 3000;
            
            const removeLoadingScreen = () => {
                console.log('Removing loading screen...');
                loadingScreen.classList.add('fade-out');
                
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    this.isLoaded = true;
                    this.triggerEntryAnimations();
                    console.log('Loading screen removed, entry animations triggered');
                }, 1000);
            };
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(removeLoadingScreen, 500);
                });
            } else {
                setTimeout(removeLoadingScreen, 500);
            }
            
            setTimeout(() => {
                if (loadingScreen && !loadingScreen.classList.contains('fade-out')) {
                    console.warn('Loading screen removal fallback triggered');
                    removeLoadingScreen();
                }
            }, maxLoadTime);
            
            window.addEventListener('load', () => {
                setTimeout(() => {
                    if (loadingScreen && !loadingScreen.classList.contains('fade-out')) {
                        removeLoadingScreen();
                    }
                }, 200);
            });
        } else {
            console.warn('Loading screen element not found');
            this.isLoaded = true;
            this.triggerEntryAnimations();
        }
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
                this.closeAdminLogin();
            }
        });
        
        let scrollThrottled = this.throttle(() => {
            this.handleScroll();
        }, 16);
        
        window.addEventListener('scroll', scrollThrottled, { passive: true });
    }
    
    initBackgroundVideo() {
        const video = document.getElementById('backgroundVideo');
        
        if (!video) {
            console.warn('Background video element not found');
            return;
        }
        
        console.log('Initializing background video...');
        
        video.muted = true;
        video.playsInline = true;
        video.controls = false;
        video.preload = 'auto';
        
        if (this.isMobile) {
            video.style.opacity = '0.4';
            video.style.filter = 'brightness(0.6) contrast(1.0)';
        }
        
        video.addEventListener('loadstart', () => {
            console.log('Underground video loading started');
        });
        
        video.addEventListener('canplay', () => {
            console.log('Underground video ready to play');
            video.style.transition = 'opacity 1s ease-in-out';
        });
        
        video.addEventListener('error', (e) => {
            console.error('Video loading error:', e);
            const videoContainer = document.querySelector('.video-background');
            if (videoContainer) {
                videoContainer.style.display = 'none';
            }
        });
        
        const playVideo = () => {
            video.play().then(() => {
                console.log('Underground video started playing successfully');
            }).catch((error) => {
                console.error('Video autoplay failed:', error.name, error.message);
            });
        };
        
        if (video.readyState >= 3) {
            playVideo();
        } else {
            video.addEventListener('canplay', playVideo, { once: true });
        }
    }
    
    initCanvas() {
        this.canvas = document.getElementById('background-canvas');
        if (!this.canvas) {
            console.warn('Background canvas not found');
            return;
        }
        
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
                animation: floatUnderground ${Math.random() * 10 + 15}s infinite linear;
                will-change: transform;
            `;
            
            container.appendChild(element);
        }
        
        if (!document.getElementById('floating-styles')) {
            const style = document.createElement('style');
            style.id = 'floating-styles';
            style.textContent = `
                @keyframes floatUnderground {
                    0% { transform: translateY(100vh) rotate(0deg); }
                    100% { transform: translateY(-100px) rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    startAnimationLoop() {
        if (!this.canvas || !this.ctx) {
            console.warn('Canvas not available for animation loop');
            return;
        }
        
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
                
                try {
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    
                    this.updateStars();
                    this.updateParticles();
                    
                    this.drawStars();
                    this.drawParticles();
                    
                    if (!this.isMobile && !this.performanceMode) {
                        this.drawConnections();
                    }
                } catch (error) {
                    console.error('Animation error:', error);
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
    
    triggerEntryAnimations() {
        console.log('Triggering entry animations...');
        
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
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLoginSubmission(form);
        });
    }

    /**
     * FIXED: Handle Login Submission with Proper Authentication
     */
    handleLoginSubmission(form) {
        const username = form.querySelector('#username').value.trim();
        const password = form.querySelector('#password').value.trim();
        
        if (!username || !password) {
            this.showMessage('Please enter both identity and frequency to access the underground.', 'warning');
            return;
        }
        
        // FIXED: Updated login credentials and proper authentication setting
        if (username.toLowerCase() === 'void' && password === 'enter') {
            console.log('✅ Login successful for user:', username);
            
            // FIXED: Set authentication state BEFORE showing success
            this.setAuthenticated(username);
            
            this.showMessage('Access granted! Welcome to the underground collective...', 'success');
            this.triggerSuccessEffects();
            
            setTimeout(() => {
                this.showMessage('Authentication confirmed. Redirecting to exclusive content...', 'info');
                setTimeout(() => {
                    // Force page reload to ensure worker detects authentication
                    window.location.href = '/ade-2025-guide?auth=1';
                }, 1000);
            }, 2000);
        } else {
            console.log('❌ Login failed for user:', username);
            this.showMessage('Invalid credentials. The underground remains sealed.', 'error');
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
                    viewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=yes';
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

    initBackendIntegration() {
        console.log('Initializing backend integration...');
        
        this.initAccessRequestForm();
        this.initAdminAuth();
        this.performHealthCheck();
        
        console.log('Backend integration initialized');
    }

    initAccessRequestForm() {
        const form = document.getElementById('accessRequestForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAccessRequest(form);
        });

        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    async handleAccessRequest(form) {
        console.log('Submitting access request...');
        
        try {
            if (!this.validateAccessForm(form)) {
                this.showMessage('Please fix the validation errors before submitting.', 'error');
                return;
            }

            this.setFormLoading(true);

            const formData = new FormData(form);
            const requestData = {
                fullName: formData.get('fullName').trim(),
                email: formData.get('email').trim().toLowerCase(),
                phone: formData.get('phone').trim(),
                country: formData.get('country'),
                requestDate: new Date().toISOString(),
                userAgent: navigator.userAgent,
                referrer: document.referrer || null
            };

            const response = await fetch(this.endpoints.accessRequest, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.showFormSuccess();
                this.triggerSuccessEffects();
                this.showMessage('Access request submitted successfully! Check your email for confirmation.', 'success');
                
                this.trackEvent('access_request_submitted', {
                    country: requestData.country,
                    timestamp: new Date().toISOString()
                });
            } else {
                const errorMessage = result.message || 'Failed to submit access request';
                console.error('Access request failed:', errorMessage);
                this.showMessage(errorMessage, 'error');
                
                if (result.fieldErrors) {
                    Object.keys(result.fieldErrors).forEach(field => {
                        this.showFieldError(field, result.fieldErrors[field]);
                    });
                }
            }

        } catch (error) {
            console.error('Access request error:', error);
            this.showMessage('Network error. Please check your connection and try again.', 'error');
        } finally {
            this.setFormLoading(false);
        }
    }

    validateAccessForm(form) {
        const requiredFields = ['fullName', 'email', 'phone', 'country'];
        let isValid = true;

        requiredFields.forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        this.clearFieldError(field);

        if (!value) {
            errorMessage = `${this.getFieldDisplayName(fieldName)} is required`;
            isValid = false;
        } else {
            switch (fieldName) {
                case 'fullName':
                    if (value.length < 2) {
                        errorMessage = 'Full name must be at least 2 characters';
                        isValid = false;
                    } else if (value.length > 100) {
                        errorMessage = 'Full name must be less than 100 characters';
                        isValid = false;
                    }
                    break;

                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        errorMessage = 'Please enter a valid email address';
                        isValid = false;
                    } else if (value.length > 150) {
                        errorMessage = 'Email must be less than 150 characters';
                        isValid = false;
                    }
                    break;

                case 'phone':
                    if (value.length < 8) {
                        errorMessage = 'Phone number must be at least 8 characters';
                        isValid = false;
                    } else if (value.length > 20) {
                        errorMessage = 'Phone number must be less than 20 characters';
                        isValid = false;
                    }
                    break;

                case 'country':
                    if (!value) {
                        errorMessage = 'Please select your country';
                        isValid = false;
                    }
                    break;
            }
        }

        if (!isValid) {
            this.showFieldError(fieldName, errorMessage);
            field.parentElement.classList.add('invalid');
        } else {
            field.parentElement.classList.add('valid');
        }

        return isValid;
    }

    getFieldDisplayName(fieldName) {
        const displayNames = {
            fullName: 'Full name',
            email: 'Email address',
            phone: 'Phone number',
            country: 'Country'
        };
        return displayNames[fieldName] || fieldName;
    }

    showFieldError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    clearFieldError(field) {
        const fieldName = field.name;
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        field.parentElement.classList.remove('invalid', 'valid');
    }

    setFormLoading(loading) {
        const overlay = document.getElementById('accessLoadingOverlay');
        const submitBtn = document.getElementById('accessSubmitBtn');
        const submitText = document.getElementById('submitBtnText');

        if (overlay) {
            overlay.style.display = loading ? 'flex' : 'none';
        }

        if (submitBtn) {
            submitBtn.disabled = loading;
            submitBtn.style.opacity = loading ? '0.7' : '1';
        }

        if (submitText) {
            submitText.textContent = loading ? 'Transmitting to Underground...' : '🌟 Request Underground Access';
        }
    }

    showFormSuccess() {
        const form = document.getElementById('accessRequestForm');
        const successDiv = document.getElementById('accessFormSuccess');

        if (form) form.style.display = 'none';
        if (successDiv) successDiv.style.display = 'block';
    }

    initAdminAuth() {
        const adminForm = document.getElementById('adminLoginForm');
        if (adminForm) {
            adminForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleAdminLogin();
            });
        }

        this.checkAdminSession();
    }

    async handleAdminLogin() {
        console.log('Processing admin login...');

        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value.trim();

        if (!username || !password) {
            this.showAdminError('Please enter both username and password');
            return;
        }

        try {
            const response = await fetch(this.endpoints.adminLogin, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                console.log('Admin login successful');
                
                this.storeAdminSession(result);
                this.closeAdminLogin();
                
                this.showMessage('Login successful! Redirecting to admin panel...', 'success');
                setTimeout(() => {
                    window.location.href = '/admin';
                }, 1500);

            } else {
                console.log('Admin login failed:', result.error);
                this.showAdminError(result.error || 'Invalid credentials');
            }

        } catch (error) {
            console.error('Admin login error:', error);
            this.showAdminError('Login failed. Please try again.');
        }
    }

    storeAdminSession(sessionData) {
        sessionStorage.setItem('dutchAdminAuth', JSON.stringify({
            sessionToken: sessionData.sessionToken,
            user: sessionData.user,
            expiresAt: sessionData.expiresAt,
            timestamp: new Date().toISOString()
        }));

        document.cookie = `dutchAdminAuth=${sessionData.sessionToken}; path=/; secure; samesite=strict`;
    }

    checkAdminSession() {
        try {
            const session = JSON.parse(sessionStorage.getItem('dutchAdminAuth') || '{}');
            if (session.sessionToken && session.expiresAt) {
                const expiry = new Date(session.expiresAt);
                if (expiry > new Date()) {
                    console.log('Valid admin session found');
                    return true;
                }
            }
        } catch (error) {
            console.log('No valid admin session');
        }
        return false;
    }

    showAdminError(message) {
        const errorDiv = document.getElementById('adminLoginError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
    }

    async performHealthCheck() {
        try {
            const response = await fetch(this.endpoints.health);
            const health = await response.json();
            
            if (health.status === 'healthy') {
                console.log('Backend health check passed:', health);
            } else {
                console.warn('Backend health check warning:', health);
            }
        } catch (error) {
            console.error('Backend health check failed:', error);
        }
    }

    trackEvent(eventName, properties = {}) {
        try {
            console.log('Tracking event:', eventName, properties);
            
            if (window.gtag) {
                window.gtag('event', eventName, properties);
            }
        } catch (error) {
            console.warn('Analytics tracking failed:', error);
        }
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
    
    triggerFeaturePreview(card) {
        const feature = card.dataset.feature;
        const messages = {
            events: 'Warehouse Events: Underground techno experiences in industrial spaces await...',
            sound: 'Sound Systems: Cutting-edge audio technology and bass frequencies unleashed...',
            collective: 'Electronic Collective: Underground artist network and electronic mysteries revealed...'
        };
        
        this.showMessage(messages[feature] || 'Underground feature revealed...', 'info');
        
        if (!this.isMobile) {
            this.createParticleBurst(
                card.getBoundingClientRect().left + card.offsetWidth / 2,
                card.getBoundingClientRect().top + card.offsetHeight / 2,
                '#FFD700'
            );
        }
    }
    
    createParticleBurst(x, y, color) {
        if (this.performanceMode || !this.ctx) return;
        
        const burstParticles = [];
        const particleCount = this.isMobile ? 8 : 15;
        
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
        this.config.particles.count = this.isMobile ? 30 : 100;
        this.config.stars.count = this.isMobile ? 50 : 150;
        this.createParticles();
        this.createStars();
        console.log('Performance mode disabled');
    }
    
    createInputParticles(input) {
        if (this.isMobile || this.performanceMode) return;
        
        const rect = input.getBoundingClientRect();
        const particles = [];
        
        for (let i = 0; i < 8; i++) {
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

    closeAdminLogin() {
        const modal = document.getElementById('adminLoginModal');
        if (modal) {
            modal.style.display = 'none';
            
            const form = document.getElementById('adminLoginForm');
            if (form) form.reset();
            
            const errorDiv = document.getElementById('adminLoginError');
            if (errorDiv) errorDiv.style.display = 'none';
        }
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
class UndergroundSmokeSystem {
    constructor() {
        this.container = document.querySelector('.smoke');
        this.particles = [];
        this.maxParticles = this.detectMobile() ? 5 : 15;
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
        }, this.isMobile ? 2000 : 1000);
    }
    
    createParticles() {
        const initialCount = this.isMobile ? 2 : 3;
        for (let i = 0; i < initialCount; i++) {
            setTimeout(() => {
                this.createParticle();
            }, i * 300);
        }
    }
    
    createParticle() {
        if (this.particles.length >= this.maxParticles) return;
        
        const particle = document.createElement('div');
        particle.className = 'smoke-particle';
        
        const size = Math.random() * (this.isMobile ? 60 : 100) + (this.isMobile ? 30 : 50);
        const startX = Math.random() * 100;
        const endX = startX + (Math.random() - 0.5) * 30;
        const opacity = Math.random() * 0.3 + 0.1;
        const duration = Math.random() * (this.isMobile ? 12000 : 18000) + (this.isMobile ? 8000 : 12000);
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, rgba(255, 149, 0, ${opacity}) 0%, transparent 70%);
            border-radius: 50%;
            left: ${startX}%;
            top: 100%;
            pointer-events: none;
            filter: blur(${Math.random() * 10 + 8}px);
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
                transform: `translateY(-${window.innerHeight + 100}px) translateX(${endX - startX}%) scale(${Math.random() + 1.2}) rotate(${Math.random() * 360}deg)`,
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
    console.log('DOM loaded, initializing Underground Portal v4.2.0...');
    
    try {
        window.DutchMysteryPortal = new DutchUndergroundPortal();
        const smokeSystem = new UndergroundSmokeSystem();
        
        console.log('Underground Portal systems initialized successfully');
    } catch (error) {
        console.error('Error initializing Underground Portal:', error);
        
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 1000);
        }
    }
    
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen && loadingScreen.style.display !== 'none') {
            console.log('Fallback: Removing loading screen');
            loadingScreen.style.display = 'none';
        }
    }, 5000);
    
    window.addEventListener('error', (e) => {
        console.warn('Underground Portal:', e.error?.message || 'Unknown error');
    });
    
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            if (loadTime > 5000) {
                console.warn('Portal loading slowly. Performance mode may be beneficial.');
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
        
        .admin-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            backdrop-filter: blur(10px);
        }
        
        .admin-modal-content {
            background: linear-gradient(145deg, #1a1a1a, #2d1810);
            margin: 10% auto;
            padding: 2rem;
            border-radius: 15px;
            width: 90%;
            max-width: 400px;
            border: 1px solid rgba(255, 149, 0, 0.3);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        
        .admin-modal h3 {
            color: #FF9500;
            text-align: center;
            margin-bottom: 1.5rem;
            font-family: var(--font-title);
            text-shadow: 0 0 10px #FF9500;
        }
        
        .admin-close {
            color: #FF9500;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            margin-top: -10px;
        }
        
        .admin-close:hover {
            color: #FFD700;
        }
        
        .admin-input-group {
            margin-bottom: 1rem;
        }
        
        .admin-input-group input {
            width: 100%;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.6);
            border: 2px solid rgba(255, 149, 0, 0.3);
            color: #fff;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        .admin-input-group input:focus {
            outline: none;
            border-color: #00BFFF;
            box-shadow: 0 0 15px rgba(0, 191, 255, 0.4);
        }
        
        .admin-login-btn {
            width: 100%;
            background: linear-gradient(135deg, #FF9500, #FFD700);
            color: #000;
            border: none;
            padding: 1rem;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 1rem;
            transition: all 0.3s ease;
        }
        
        .admin-login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(255, 149, 0, 0.4);
        }
        
        .admin-error {
            color: #FF0000;
            text-align: center;
            margin-top: 1rem;
            font-size: 0.9rem;
            display: none;
        }
        
        @media (max-width: 768px) {
            .cursor-glow {
                display: none !important;
            }
            
            .admin-modal-content {
                margin: 20% auto;
                width: 95%;
                padding: 1.5rem;
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
});

// Global logout function
function logout() {
    console.log('🔓 Logout requested');
    if (window.DutchMysteryPortal) {
        window.DutchMysteryPortal.clearAuthentication();
    }
    
    setTimeout(() => {
        window.location.href = '/';
    }, 500);
}

// Global functions for HTML interactions
function showComingSoon() {
    if (window.DutchMysteryPortal) {
        window.DutchMysteryPortal.showMessage('More underground frequencies are being crafted... Stay tuned for exclusive releases!', 'info');
    }
}

function toggleAudioPlayer() {
    console.log('Audio player toggle requested');
    
    const button = document.getElementById('audioPlayButton');
    const buttonText = document.getElementById('buttonText');
    const playerContainer = document.getElementById('audioPlayerContainer');
    const soundcloudPlayer = document.getElementById('soundcloudPlayer');
    
    if (!playerContainer || !soundcloudPlayer) {
        console.warn('Audio player elements not found');
        return;
    }
    
    if (playerContainer.style.display === 'none' || !playerContainer.style.display) {
        soundcloudPlayer.src = 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/halform/halform-x-rico-winter-live-set-o01&color=%23ff9500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true';
        playerContainer.style.display = 'block';
        
        if (buttonText) buttonText.textContent = 'DISCONNECT TRANSMISSION';
        if (button) button.style.background = 'linear-gradient(135deg, #FF0000, #FF9500)';
        
        if (window.DutchMysteryPortal) {
            window.DutchMysteryPortal.showMessage('Underground transmission intercepted... Audio portal activated!', 'success');
            window.DutchMysteryPortal.trackEvent('audio_player_opened', { track: 'halform_rico_winter_live_set' });
        }
    } else {
        playerContainer.style.display = 'none';
        soundcloudPlayer.src = '';
        
        if (buttonText) buttonText.textContent = 'INTERCEPT TRANSMISSION';
        if (button) button.style.background = 'linear-gradient(135deg, #FF9500, #00BFFF)';
        
        if (window.DutchMysteryPortal) {
            window.DutchMysteryPortal.showMessage('Transmission disconnected... Returning to underground silence.', 'info');
        }
    }
}

// Admin login modal functions
function showAdminLogin(event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
        modal.style.display = 'block';
        
        const usernameInput = document.getElementById('adminUsername');
        if (usernameInput) {
            setTimeout(() => usernameInput.focus(), 100);
        }
    }
}

function closeAdminLogin() {
    if (window.DutchMysteryPortal) {
        window.DutchMysteryPortal.closeAdminLogin();
    }
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('adminLoginModal');
    if (event.target === modal) {
        closeAdminLogin();
    }
});
/**
 * Enhanced Frontend Integration for Dutch Underground Portal
 * Version: 5.0.0 - Complete Authentication & Blog System Integration
 * 
 * Add this to your existing enhanced-script.js file
 */

// Enhanced Portal Authentication Integration
class EnhancedPortalAuth {
    constructor() {
        this.baseUrl = window.location.origin;
        this.endpoints = {
            portalAuth: '/api/portal-auth',
            health: '/api/health'
        };
        
        this.init();
    }
    
    init() {
        console.log('Enhanced Portal Auth v5.0.0 initializing...');
        this.setupAuthenticationListeners();
        this.checkAuthenticationState();
    }
    
    setupAuthenticationListeners() {
        // Enhanced login form handler
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEnhancedLogin(loginForm);
            });
        }
        
        // Handle return URLs from blog previews
        this.handleReturnUrls();
    }
    
    async handleEnhancedLogin(form) {
        const username = form.querySelector('#username').value.trim();
        const password = form.querySelector('#password').value.trim();
        
        if (!username || !password) {
            this.showMessage('Please enter both identity and frequency to access the underground.', 'warning');
            return;
        }
        
        try {
            this.setButtonLoading(true);
            
            const response = await fetch(this.endpoints.portalAuth, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Enhanced login successful');
                
                // Set authentication state in multiple locations for compatibility
                this.setAuthenticationState(result);
                
                this.showMessage('Access granted! Welcome to the underground collective...', 'success');
                this.triggerSuccessEffects();
                
                // Handle return URL or redirect to exclusive content
                const returnUrl = this.getReturnUrl();
                
                setTimeout(() => {
                    if (returnUrl) {
                        this.showMessage('Authentication confirmed. Redirecting to requested content...', 'info');
                        setTimeout(() => {
                            window.location.href = returnUrl;
                        }, 1000);
                    } else {
                        this.showMessage('Authentication confirmed. Redirecting to exclusive content...', 'info');
                        setTimeout(() => {
                            window.location.href = '/ade-2025-guide?auth=1';
                        }, 1000);
                    }
                }, 2000);
                
            } else {
                console.log('❌ Enhanced login failed:', result.error);
                this.showMessage(result.message || 'Invalid credentials. The underground remains sealed.', 'error');
            }
            
        } catch (error) {
            console.error('Enhanced login error:', error);
            this.showMessage('Connection error. Please check your network and try again.', 'error');
        } finally {
            this.setButtonLoading(false);
        }
    }
    
    setAuthenticationState(authData) {
        // Set in session storage
        sessionStorage.setItem('dutchPortalAuth', 'authenticated');
        sessionStorage.setItem('dutchPortalUser', JSON.stringify(authData.user));
        sessionStorage.setItem('dutchPortalSession', authData.sessionId);
        sessionStorage.setItem('dutchPortalTime', new Date().toISOString());
        
        // Set in local storage (backup)
        localStorage.setItem('dutchPortalAuth', 'authenticated');
        localStorage.setItem('dutchPortalUser', JSON.stringify(authData.user));
        
        // Cookies are set by the server response
        console.log('✅ Authentication state set successfully');
        console.log('Session ID:', authData.sessionId);
    }
    
    checkAuthenticationState() {
        const isAuthenticated = this.isUserAuthenticated();
        console.log('Current authentication state:', isAuthenticated);
        
        if (isAuthenticated) {
            console.log('User is authenticated, updating UI...');
            this.updateUIForAuthenticatedUser();
        }
    }
    
    isUserAuthenticated() {
        // Check session storage
        const sessionAuth = sessionStorage.getItem('dutchPortalAuth');
        if (sessionAuth === 'authenticated') {
            return true;
        }
        
        // Check local storage
        const localAuth = localStorage.getItem('dutchPortalAuth');
        if (localAuth === 'authenticated') {
            return true;
        }
        
        // Check cookies
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'dutchPortalAuth' && value === 'authenticated') {
                return true;
            }
        }
        
        return false;
    }
    
    handleReturnUrls() {
        const urlParams = new URLSearchParams(window.location.search);
        const focus = urlParams.get('focus');
        const returnTo = urlParams.get('returnTo');
        
        if (focus === 'login' && returnTo) {
            // Store return URL and focus on login
            sessionStorage.setItem('returnUrl', returnTo);
            this.focusLoginForm();
        } else if (focus === 'signup' && returnTo) {
            // Store return URL and focus on signup
            sessionStorage.setItem('returnUrl', returnTo);
            this.focusSignupForm();
        }
    }
    
    getReturnUrl() {
        const returnUrl = sessionStorage.getItem('returnUrl');
        if (returnUrl) {
            sessionStorage.removeItem('returnUrl');
            return returnUrl;
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('returnTo');
    }
    
    focusLoginForm() {
        const loginForm = document.getElementById('loginForm');
        const usernameInput = document.getElementById('username');
        
        if (loginForm && usernameInput) {
            loginForm.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                usernameInput.focus();
            }, 500);
        }
    }
    
    focusSignupForm() {
        const signupForm = document.getElementById('accessRequestForm');
        const nameInput = document.getElementById('fullName');
        
        if (signupForm && nameInput) {
            signupForm.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                nameInput.focus();
            }, 500);
        }
    }
    
    setButtonLoading(loading) {
        const submitBtn = document.querySelector('.void-button');
        const btnText = document.querySelector('.button-text');
        
        if (submitBtn && btnText) {
            submitBtn.disabled = loading;
            submitBtn.style.opacity = loading ? '0.7' : '1';
            btnText.textContent = loading ? 'Connecting to Underground...' : 'Enter the Underground';
        }
    }
    
    updateUIForAuthenticatedUser() {
        console.log('UI updated for authenticated user');
        
        // Add authenticated class to body
        document.body.classList.add('authenticated');
        
        // Update any authentication-dependent UI elements
        const authElements = document.querySelectorAll('[data-auth-required]');
        authElements.forEach(element => {
            element.style.display = 'block';
        });
    }
    
    showMessage(text, type = 'info') {
        const message = document.getElementById('message');
        if (!message) return;
        
        message.textContent = text;
        message.className = `show ${type}`;
        
        setTimeout(() => {
            message.classList.remove('show');
        }, 5000);
        
        this.announceToScreenReader(text);
    }
    
    triggerSuccessEffects() {
        if (window.DutchMysteryPortal) {
            window.DutchMysteryPortal.triggerSuccessEffects();
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
}

// Enhanced Blog System Integration
class EnhancedBlogSystem {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupSocialSharing();
        this.setupContentInteractions();
        this.trackEngagement();
    }
    
    setupSocialSharing() {
        // Global sharing functions for blog pages
        window.shareContent = (platform) => {
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            const description = encodeURIComponent(
                document.querySelector('meta[name="description"]')?.content || 
                'Exclusive underground electronic music content from Amsterdam'
            );
            
            let shareUrl = '';
            
            switch(platform) {
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}&hashtags=Amsterdam,Techno,Underground`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                    break;
                case 'reddit':
                    shareUrl = `https://www.reddit.com/submit?url=${url}&title=${title}`;
                    break;
            }
            
            if (shareUrl) {
                window.open(shareUrl, 'share-window', 'width=600,height=400,scrollbars=yes,resizable=yes');
            }
            
            // Track sharing
            this.trackEvent('share', {
                method: platform,
                content_type: 'blog_post',
                content_url: window.location.href
            });
        };
        
        window.copyLink = () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showShareFeedback('Link copied to clipboard!');
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = window.location.href;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                this.showShareFeedback('Link copied!');
            });
        };
    }
    
    setupContentInteractions() {
        // Enhanced reading experience
        this.initReadingProgress();
        this.initScrollEffects();
        this.initKeyboardNavigation();
    }
    
    initReadingProgress() {
        const progressBar = document.createElement('div');
        progressBar.id = 'reading-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, #FF9500, #FFD700);
            z-index: 1001;
            transition: width 0.3s ease;
        `;
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', () => {
            const article = document.querySelector('.blog-content') || document.querySelector('article');
            if (article) {
                const articleTop = article.offsetTop;
                const articleHeight = article.offsetHeight;
                const scrollTop = window.pageYOffset;
                const windowHeight = window.innerHeight;
                
                const progress = Math.min(100, Math.max(0, 
                    ((scrollTop - articleTop + windowHeight) / articleHeight) * 100
                ));
                
                progressBar.style.width = progress + '%';
            }
        });
    }
    
    initScrollEffects() {
        // Parallax effect for background elements
        let ticking = false;
        
        function updateScrollEffects() {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax-element');
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
            
            ticking = false;
        }
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollEffects);
                ticking = true;
            }
        });
    }
    
    initKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Escape key to close modals/overlays
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal, .overlay');
                modals.forEach(modal => {
                    modal.style.display = 'none';
                });
            }
            
            // Arrow keys for navigation
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                const navLinks = document.querySelectorAll('.related-link');
                if (navLinks.length > 0) {
                    // Navigate between related content
                    const currentIndex = Array.from(navLinks).findIndex(link => 
                        link === document.activeElement
                    );
                    
                    if (currentIndex !== -1) {
                        const nextIndex = e.key === 'ArrowRight' ? 
                            (currentIndex + 1) % navLinks.length :
                            (currentIndex - 1 + navLinks.length) % navLinks.length;
                        
                        navLinks[nextIndex].focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }
    
    trackEngagement() {
        let startTime = Date.now();
        let maxScroll = 0;
        let engagementEvents = [];
        
        // Track scroll depth
        window.addEventListener('scroll', () => {
            const scrollPercent = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            maxScroll = Math.max(maxScroll, scrollPercent);
            
            // Track milestone scrolls
            if (scrollPercent > 25 && !engagementEvents.includes('scroll_25')) {
                engagementEvents.push('scroll_25');
                this.trackEvent('scroll_milestone', { milestone: 25 });
            }
            if (scrollPercent > 50 && !engagementEvents.includes('scroll_50')) {
                engagementEvents.push('scroll_50');
                this.trackEvent('scroll_milestone', { milestone: 50 });
            }
            if (scrollPercent > 75 && !engagementEvents.includes('scroll_75')) {
                engagementEvents.push('scroll_75');
                this.trackEvent('scroll_milestone', { milestone: 75 });
            }
        });
        
        // Track time on page
        setInterval(() => {
            const timeOnPage = Math.round((Date.now() - startTime) / 1000);
            
            // Track engagement milestones
            if (timeOnPage === 30 && !engagementEvents.includes('time_30')) {
                engagementEvents.push('time_30');
                this.trackEvent('engagement_milestone', { time: 30 });
            }
            if (timeOnPage === 60 && !engagementEvents.includes('time_60')) {
                engagementEvents.push('time_60');
                this.trackEvent('engagement_milestone', { time: 60 });
            }
            if (timeOnPage === 180 && !engagementEvents.includes('time_180')) {
                engagementEvents.push('time_180');
                this.trackEvent('engagement_milestone', { time: 180 });
            }
        }, 1000);
        
        // Send final engagement data on page unload
        window.addEventListener('beforeunload', () => {
            const readingTime = Math.round((Date.now() - startTime) / 1000);
            
            this.trackEvent('reading_behavior', {
                reading_time: readingTime,
                scroll_depth: Math.round(maxScroll),
                engagement_events: engagementEvents.length,
                page_url: window.location.href
            });
        });
    }
    
    showShareFeedback(message) {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 255, 0, 0.9);
            color: #000;
            padding: 1rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            font-family: 'Rajdhani', sans-serif;
        `;
        feedback.textContent = message;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 2000);
    }
    
    trackEvent(eventName, properties = {}) {
        try {
            console.log('Tracking event:', eventName, properties);
            
            // Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, properties);
            }
            
            // Custom analytics (could send to your own endpoint)
            // fetch('/api/analytics', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ event: eventName, properties })
            // });
            
        } catch (error) {
            console.warn('Analytics tracking failed:', error);
        }
    }
}

// Enhanced Admin Panel Integration
class EnhancedAdminPanel {
    constructor() {
        this.baseUrl = window.location.origin;
        this.sessionToken = localStorage.getItem('adminSessionToken');
        this.init();
    }
    
    init() {
        if (window.location.pathname === '/admin') {
            this.initAdminDashboard();
        }
    }
    
    async initAdminDashboard() {
        // Initialize sample content button
        this.addInitContentButton();
        
        // Enhanced blog management
        this.enhanceBlogManagement();
    }
    
    addInitContentButton() {
        const overviewTab = document.getElementById('overview');
        if (overviewTab) {
            const initButton = document.createElement('button');
            initButton.className = 'btn';
            initButton.style.cssText = 'margin: 1rem; padding: 1rem 2rem; background: linear-gradient(135deg, #00BFFF, #0080FF);';
            initButton.innerHTML = '🚀 Initialize Sample Blog Content';
            
            initButton.addEventListener('click', async () => {
                if (confirm('This will create sample blog posts for your underground portal. Continue?')) {
                    try {
                        initButton.disabled = true;
                        initButton.textContent = 'Creating content...';
                        
                        const response = await fetch('/api/admin/init-content', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Session-Token': this.sessionToken
                            }
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            alert(`Sample content initialized! ${result.created} posts created, ${result.skipped} skipped.`);
                            location.reload();
                        } else {
                            alert('Error initializing content: ' + result.error);
                        }
                        
                    } catch (error) {
                        alert('Error: ' + error.message);
                    } finally {
                        initButton.disabled = false;
                        initButton.innerHTML = '🚀 Initialize Sample Blog Content';
                    }
                }
            });
            
            overviewTab.appendChild(initButton);
        }
    }
    
    enhanceBlogManagement() {
        // Add rich text editing capabilities
        // Add bulk operations
        // Add preview functionality
        console.log('Enhanced blog management initialized');
    }
}

// Global logout function with enhanced cleanup
function logout() {
    console.log('🔓 Enhanced logout requested');
    
    if (confirm('Are you sure you want to logout from the underground portal?')) {
        // Clear all authentication data
        
        // Clear session storage
        sessionStorage.removeItem('dutchPortalAuth');
        sessionStorage.removeItem('dutchPortalUser');
        sessionStorage.removeItem('dutchPortalSession');
        sessionStorage.removeItem('dutchPortalTime');
        sessionStorage.removeItem('returnUrl');
        
        // Clear local storage
        localStorage.removeItem('dutchPortalAuth');
        localStorage.removeItem('dutchPortalUser');
        
        // Clear cookies
        const expiredDate = 'Thu, 01 Jan 1970 00:00:01 GMT';
        document.cookie = `dutchPortalAuth=; expires=${expiredDate}; path=/;`;
        document.cookie = `dutchPortalSession=; expires=${expiredDate}; path=/;`;
        document.cookie = `dutchPortalUser=; expires=${expiredDate}; path=/;`;
        
        // Show logout feedback
        const message = document.getElementById('message');
        if (message) {
            message.textContent = 'Disconnected from underground portal...';
            message.className = 'show warning';
        }
        
        // Update UI
        document.body.classList.remove('authenticated');
        
        // Redirect after a moment
        setTimeout(() => {
            window.location.href = '/?logout=success';
        }, 1500);
    }
}

// Initialize enhanced systems when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 Enhanced Dutch Underground Portal v5.0.0 initializing...');
    
    try {
        // Initialize enhanced authentication
        window.EnhancedPortalAuth = new EnhancedPortalAuth();
        
        // Initialize enhanced blog system
        window.EnhancedBlogSystem = new EnhancedBlogSystem();
        
        // Initialize enhanced admin panel
        window.EnhancedAdminPanel = new EnhancedAdminPanel();
        
        console.log('✅ All enhanced systems initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing enhanced systems:', error);
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EnhancedPortalAuth,
        EnhancedBlogSystem,
        EnhancedAdminPanel
    };
}

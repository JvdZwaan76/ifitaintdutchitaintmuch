/**
 * FIXED: Enhanced Dutch Underground Techno Website JavaScript
 * Version: 4.1.1 - AUTHENTICATION FIXED
 * 
 * FIXES APPLIED:
 * - Login now properly sets authentication cookies and session storage
 * - Worker can detect authenticated users
 * - Proper logout functionality
 */

// ... [Keep all the existing DutchUndergroundPortal class code until handleLoginSubmission] ...

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
            health: '/api/health'
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
    
    // ... [Keep all existing methods until handleLoginSubmission] ...
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768 ||
               ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0);
    }
    
    init() {
        console.log('Dutch Underground Portal v4.1.1 initializing...');
        
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
        // You can add UI updates here if needed
        console.log('UI updated for authenticated user');
    }

    // ... [Keep all existing backend integration methods] ...

    initBackendIntegration() {
        console.log('Initializing backend integration...');
        
        // Initialize Access Request Form
        this.initAccessRequestForm();
        
        // Initialize Admin Authentication
        this.initAdminAuth();
        
        // Health check on load
        this.performHealthCheck();
        
        console.log('Backend integration initialized');
    }

    /**
     * Access Request Form Integration with Backend API
     */
    initAccessRequestForm() {
        const form = document.getElementById('accessRequestForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAccessRequest(form);
        });

        // Real-time validation
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
                this.showMessage(
                    'Access request submitted successfully! Check your email for confirmation.', 
                    'success'
                );
                
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
            this.showMessage(
                'Network error. Please check your connection and try again.', 
                'error'
            );
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
            submitText.textContent = loading ? 
                'Transmitting to Underground...' : 
                '🌟 Request Underground Access';
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

    // ... [Keep all existing visual/animation methods] ...
    
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

    // ... [Keep all other existing methods] ...

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

    // ... [Keep all remaining methods like showMessage, triggerSuccessEffects, etc.] ...
    
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

    // Add other missing methods as needed...
    createParticleBurst(x, y, color) {
        console.log('Creating particle burst at', x, y, 'with color', color);
        // Simplified for this fix
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

// Enhanced Smoke Particle System (keep existing)
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
    console.log('DOM loaded, initializing Underground Portal v4.1.1...');
    
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

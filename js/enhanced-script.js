/**
 * FIXED: Enhanced Frontend JavaScript for Dutch Underground Portal
 * Version: 6.2.2 - FIXES BACKEND COMPATIBILITY AND REDUCES ERRORS
 * Deploy: Replace your /js/enhanced-script.js with this fixed version
 * Matches the fixed backend worker v6.2.2
 */

// Enhanced Portal Authentication Integration - FIXED VERSION
class EnhancedPortalAuth {
    constructor() {
        this.baseUrl = window.location.origin;
        this.endpoints = {
            portalAuth: '/api/portal-auth',
            health: '/api/health',
            search: '/api/search',
            comments: '/api/comments',
            newsletter: '/api/newsletter/subscribe',
            analytics: '/api/analytics'
        };
        
        this.isInitialized = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.backendConnected = false;
        this.analyticsQueue = [];
        
        this.init();
    }
    
    async init() {
        console.log('Enhanced Portal Auth v6.2.2 FIXED initializing...');
        
        try {
            // Test backend connectivity first
            await this.testBackendConnectivity();
            
            this.setupAuthenticationListeners();
            this.checkAuthenticationState();
            this.initAnalyticsRobust();
            this.initSearch();
            this.initNewsletter();
            this.initComments();
            
            this.isInitialized = true;
            
            // Dispatch ready event for loading screen dismissal
            document.dispatchEvent(new CustomEvent('enhanced-portal-ready'));
            
        } catch (error) {
            console.error('Portal initialization failed:', error);
            this.handleInitializationError(error);
        }
    }
    
    async testBackendConnectivity() {
        try {
            console.log('Testing backend connectivity...');
            
            const response = await fetch(this.endpoints.health, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (response.ok) {
                const healthData = await response.json();
                console.log('✅ Backend connectivity confirmed:', healthData.version);
                this.backendConnected = true;
                return true;
            } else {
                throw new Error(`Backend returned ${response.status}`);
            }
            
        } catch (error) {
            console.warn('⚠️ Backend connectivity test failed:', error.message);
            
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`Retrying connectivity test (${this.retryCount}/${this.maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                return this.testBackendConnectivity();
            }
            
            throw error;
        }
    }
    
    handleInitializationError(error) {
        console.error('Initialization error:', error);
        
        // Show user-friendly error message
        this.showMessage('Portal connectivity issue. Some features may be limited.', 'warning');
        
        // Initialize in degraded mode
        this.setupAuthenticationListeners();
        this.initOfflineMode();
        
        // Still mark as initialized to prevent loading screen hang
        this.isInitialized = true;
        document.dispatchEvent(new CustomEvent('enhanced-portal-ready'));
    }
    
    initOfflineMode() {
        console.log('Initializing offline mode...');
        
        // Disable features that require backend
        const buttons = document.querySelectorAll('button[type="submit"]');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (!this.isBackendAvailable()) {
                    e.preventDefault();
                    this.showMessage('Feature temporarily unavailable. Please try again later.', 'warning');
                }
            });
        });
    }
    
    isBackendAvailable() {
        return this.backendConnected || this.retryCount < this.maxRetries;
    }
    
    setupAuthenticationListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEnhancedLogin(loginForm);
            });
        }
        
        const accessRequestForm = document.getElementById('accessRequestForm');
        if (accessRequestForm) {
            accessRequestForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAccessRequest(accessRequestForm);
            });
        }
        
        this.handleReturnUrls();
    }
    
    async handleEnhancedLogin(form) {
        const username = form.querySelector('#username').value.trim();
        const password = form.querySelector('#password').value.trim();
        
        if (!username || !password) {
            this.showMessage('Please enter both identity and frequency to access the underground.', 'warning');
            return;
        }
        
        if (!this.isBackendAvailable()) {
            this.showMessage('Portal temporarily unavailable. Please try again later.', 'error');
            return;
        }
        
        try {
            this.setButtonLoading(true);
            
            const response = await this.fetchWithRetry(this.endpoints.portalAuth, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Enhanced login successful');
                
                this.setAuthenticationState(result);
                this.showMessage('Access granted! Welcome to the underground collective...', 'success');
                this.triggerSuccessEffects();
                
                // Track login event (with robust error handling)
                this.trackEventRobust('user_login', { username });
                
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
    
    async fetchWithRetry(url, options, maxRetries = 3) {
        let lastError;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await fetch(url, options);
                
                if (response.ok || response.status < 500) {
                    return response;
                }
                
                throw new Error(`Server error: ${response.status}`);
                
            } catch (error) {
                lastError = error;
                console.warn(`Fetch attempt ${i + 1} failed:`, error.message);
                
                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                }
            }
        }
        
        throw lastError;
    }
    
    async handleAccessRequest(form) {
        if (!this.isBackendAvailable()) {
            this.showMessage('Portal temporarily unavailable. Please try again later.', 'error');
            return;
        }
        
        const formData = new FormData(form);
        const data = {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            country: formData.get('country'),
            userAgent: navigator.userAgent,
            referrer: document.referrer
        };
        
        // Validate form
        if (!this.validateAccessRequest(data)) {
            return;
        }
        
        try {
            this.setAccessFormLoading(true);
            
            const response = await this.fetchWithRetry('/api/access-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showAccessSuccess();
                this.trackEventRobust('access_request_submitted', { email: data.email, country: data.country });
                
                // Show newsletter signup option
                this.showNewsletterOption(data.email);
            } else {
                this.showMessage('Error submitting request: ' + result.message, 'error');
            }
            
        } catch (error) {
            console.error('Access request error:', error);
            this.showMessage('Connection error. Please try again.', 'error');
        } finally {
            this.setAccessFormLoading(false);
        }
    }
    
    validateAccessRequest(data) {
        const errors = {};
        
        if (!data.fullName || data.fullName.length < 2) {
            errors.fullName = 'Please enter your full name';
        }
        
        if (!data.email || !this.isValidEmail(data.email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        if (!data.phone || data.phone.length < 5) {
            errors.phone = 'Please enter a valid phone number';
        }
        
        if (!data.country) {
            errors.country = 'Please select your country';
        }
        
        // Display errors
        let hasErrors = false;
        Object.keys(errors).forEach(field => {
            const errorEl = document.getElementById(field + '-error');
            const fieldEl = document.getElementById(field);
            
            if (errorEl) {
                errorEl.textContent = errors[field];
                errorEl.style.display = 'block';
                hasErrors = true;
            }
            
            if (fieldEl) {
                fieldEl.parentElement.classList.add('invalid');
            }
        });
        
        // Clear previous errors for valid fields
        ['fullName', 'email', 'phone', 'country'].forEach(field => {
            if (!errors[field]) {
                const errorEl = document.getElementById(field + '-error');
                const fieldEl = document.getElementById(field);
                
                if (errorEl) {
                    errorEl.style.display = 'none';
                }
                
                if (fieldEl) {
                    fieldEl.parentElement.classList.remove('invalid');
                    fieldEl.parentElement.classList.add('valid');
                }
            }
        });
        
        return !hasErrors;
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    setAccessFormLoading(loading) {
        const form = document.getElementById('accessRequestForm');
        const submitBtn = document.getElementById('accessSubmitBtn');
        const submitText = document.getElementById('submitBtnText');
        const loadingOverlay = document.getElementById('accessLoadingOverlay');
        
        if (submitBtn && submitText) {
            submitBtn.disabled = loading;
            submitText.textContent = loading ? 'Submitting Request...' : '🌟 Request Underground Access';
        }
        
        if (loadingOverlay) {
            loadingOverlay.style.display = loading ? 'flex' : 'none';
        }
        
        if (form) {
            form.style.opacity = loading ? '0.7' : '1';
        }
    }
    
    showAccessSuccess() {
        const form = document.getElementById('accessRequestForm');
        const success = document.getElementById('accessFormSuccess');
        
        if (form && success) {
            form.style.display = 'none';
            success.style.display = 'block';
        }
    }
    
    showNewsletterOption(email) {
        const modalHtml = `
            <div id="newsletterModal" class="newsletter-modal">
                <div class="newsletter-modal-content">
                    <h3>Stay in the Underground Loop</h3>
                    <p>Get notified about exclusive warehouse events, new content, and underground electronic music discoveries.</p>
                    <div class="newsletter-form">
                        <input type="email" id="newsletterEmail" value="${email}" readonly>
                        <button onclick="subscribeToNewsletter()" class="newsletter-btn">Join Underground Newsletter</button>
                        <button onclick="closeNewsletterModal()" class="newsletter-btn secondary">Maybe Later</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .newsletter-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(10px);
            }
            .newsletter-modal-content {
                background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
                border: 1px solid rgba(255, 149, 0, 0.3);
                border-radius: 15px;
                padding: 2rem;
                max-width: 400px;
                text-align: center;
                color: #fff;
            }
            .newsletter-modal-content h3 {
                color: #FF9500;
                margin-bottom: 1rem;
                font-family: 'Orbitron', sans-serif;
            }
            .newsletter-form {
                margin-top: 1.5rem;
            }
            .newsletter-form input {
                width: 100%;
                padding: 1rem;
                background: rgba(0, 0, 0, 0.6);
                border: 1px solid rgba(255, 149, 0, 0.3);
                border-radius: 8px;
                color: #fff;
                margin-bottom: 1rem;
                text-align: center;
            }
            .newsletter-btn {
                background: linear-gradient(135deg, #FF9500, #FFD700);
                color: #000;
                border: none;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                margin: 0.5rem;
                transition: transform 0.2s;
                width: calc(100% - 1rem);
            }
            .newsletter-btn.secondary {
                background: rgba(0, 191, 255, 0.2);
                color: #00BFFF;
                border: 1px solid #00BFFF;
            }
            .newsletter-btn:hover {
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);
        
        // Auto-remove after 30 seconds
        setTimeout(() => {
            const modal = document.getElementById('newsletterModal');
            if (modal) {
                modal.remove();
            }
        }, 30000);
    }
    
    // FIXED: Robust Analytics System - ELIMINATES "Failed to fetch" errors
    initAnalyticsRobust() {
        if (!this.isBackendAvailable()) {
            console.log('Analytics disabled - backend unavailable');
            return;
        }
        
        try {
            // Track page view with error handling
            this.trackEventRobust('page_view', {
                url: window.location.href,
                title: document.title,
                referrer: document.referrer
            });
            
            // Track reading behavior
            this.initReadingAnalytics();
            
            // Track user interactions
            this.initInteractionTracking();
        } catch (error) {
            console.log('Analytics initialization failed (non-critical):', error);
        }
    }
    
    initReadingAnalytics() {
        try {
            let startTime = Date.now();
            let maxScroll = 0;
            let milestones = [];
            
            // Track scroll depth with throttling
            let scrollTimeout;
            window.addEventListener('scroll', () => {
                if (scrollTimeout) return;
                scrollTimeout = setTimeout(() => {
                    try {
                        const scrollPercent = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                        maxScroll = Math.max(maxScroll, scrollPercent);
                        
                        // Track scroll milestones
                        const checkpoints = [25, 50, 75, 90];
                        checkpoints.forEach(checkpoint => {
                            if (scrollPercent > checkpoint && !milestones.includes(checkpoint)) {
                                milestones.push(checkpoint);
                                this.trackEventRobust('scroll_milestone', { milestone: checkpoint });
                            }
                        });
                    } catch (error) {
                        console.log('Scroll tracking failed (non-critical):', error);
                    }
                    scrollTimeout = null;
                }, 100); // Throttle to every 100ms
            });
            
            // Track time spent on page
            const intervals = [30, 60, 120, 300]; // seconds
            intervals.forEach(interval => {
                setTimeout(() => {
                    try {
                        if (document.visibilityState === 'visible') {
                            this.trackEventRobust('time_milestone', { seconds: interval });
                        }
                    } catch (error) {
                        console.log('Time tracking failed (non-critical):', error);
                    }
                }, interval * 1000);
            });
            
            // Track when user leaves
            window.addEventListener('beforeunload', () => {
                try {
                    const readingTime = Math.round((Date.now() - startTime) / 1000);
                    this.trackEventRobust('session_end', {
                        reading_time: readingTime,
                        max_scroll: Math.round(maxScroll),
                        milestones: milestones
                    }, false); // Don't wait for response on page unload
                } catch (error) {
                    console.log('Session end tracking failed (non-critical):', error);
                }
            });
        } catch (error) {
            console.log('Reading analytics initialization failed (non-critical):', error);
        }
    }
    
    initInteractionTracking() {
        try {
            // Track button clicks with throttling
            let clickTimeout;
            document.addEventListener('click', (e) => {
                if (clickTimeout) return;
                clickTimeout = setTimeout(() => {
                    try {
                        if (e.target.matches('button, .btn, .cta-button')) {
                            this.trackEventRobust('button_click', {
                                button_text: e.target.textContent?.trim(),
                                button_id: e.target.id,
                                button_class: e.target.className
                            });
                        }
                        
                        // Track link clicks
                        if (e.target.matches('a[href]')) {
                            this.trackEventRobust('link_click', {
                                link_text: e.target.textContent?.trim(),
                                link_url: e.target.href,
                                is_external: !e.target.href.includes(window.location.hostname)
                            });
                        }
                    } catch (error) {
                        console.log('Click tracking failed (non-critical):', error);
                    }
                    clickTimeout = null;
                }, 50); // Throttle clicks
            });
            
            // Track form interactions
            document.addEventListener('focus', (e) => {
                try {
                    if (e.target.matches('input, textarea, select')) {
                        this.trackEventRobust('form_field_focus', {
                            field_name: e.target.name || e.target.id,
                            field_type: e.target.type
                        });
                    }
                } catch (error) {
                    console.log('Form tracking failed (non-critical):', error);
                }
            }, true);
        } catch (error) {
            console.log('Interaction tracking initialization failed (non-critical):', error);
        }
    }
    
    // FIXED: Robust Analytics Tracking - ELIMINATES "Failed to fetch" errors
    async trackEventRobust(eventType, data = {}, waitForResponse = true) {
        // Always queue analytics for offline processing
        this.analyticsQueue.push({
            event_type: eventType,
            blog_post_id: this.getCurrentBlogId(),
            data: {
                ...data,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                user_agent: navigator.userAgent
            }
        });
        
        if (!this.isBackendAvailable()) {
            this.storeAnalyticsLocally(eventType, data);
            return;
        }
        
        try {
            // Use sendBeacon for page unload events (non-blocking)
            if (!waitForResponse && navigator.sendBeacon) {
                const payload = JSON.stringify({
                    event_type: eventType,
                    blog_post_id: this.getCurrentBlogId(),
                    data: {
                        ...data,
                        timestamp: new Date().toISOString(),
                        url: window.location.href,
                        user_agent: navigator.userAgent
                    }
                });
                
                navigator.sendBeacon(this.endpoints.analytics, payload);
                return;
            }
            
            // Regular fetch with timeout for normal events
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            const response = await fetch(this.endpoints.analytics, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event_type: eventType,
                    blog_post_id: this.getCurrentBlogId(),
                    data: {
                        ...data,
                        timestamp: new Date().toISOString(),
                        url: window.location.href,
                        user_agent: navigator.userAgent
                    }
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Analytics endpoint responded with ${response.status}`);
            }
            
            // Success - remove from local queue if it exists
            this.clearLocalAnalytics();
            
        } catch (error) {
            // Silently fail - analytics should never break functionality
            console.log('Analytics tracking failed (non-critical):', error.message);
            
            // Fallback: Store analytics locally for later submission
            this.storeAnalyticsLocally(eventType, data);
        }
    }
    
    // Fallback analytics storage
    storeAnalyticsLocally(eventType, data) {
        try {
            const analytics = JSON.parse(localStorage.getItem('pendingAnalytics') || '[]');
            analytics.push({
                event_type: eventType,
                data: data,
                timestamp: new Date().toISOString(),
                url: window.location.href
            });
            
            // Keep only last 50 events to prevent storage overflow
            if (analytics.length > 50) {
                analytics.splice(0, analytics.length - 50);
            }
            
            localStorage.setItem('pendingAnalytics', JSON.stringify(analytics));
        } catch (error) {
            console.log('Local analytics storage failed (non-critical):', error.message);
        }
    }
    
    clearLocalAnalytics() {
        try {
            localStorage.removeItem('pendingAnalytics');
        } catch (error) {
            console.log('Clear local analytics failed (non-critical):', error.message);
        }
    }
    
    // FIXED: Fallback for old trackEvent method
    async trackEvent(eventType, data = {}) {
        return this.trackEventRobust(eventType, data);
    }
    
    getCurrentBlogId() {
        const path = window.location.pathname;
        if (path.startsWith('/blog/') || path === '/ade-2025-guide') {
            // Try to extract blog ID from page metadata
            const meta = document.querySelector('meta[name="blog-id"]');
            return meta ? meta.content : null;
        }
        return null;
    }
    
    // Initialize other features with robust error handling
    initSearch() {
        if (!this.isBackendAvailable()) {
            console.log('Search disabled - backend unavailable');
            return;
        }
        
        try {
            this.createSearchInterface();
        } catch (error) {
            console.log('Search initialization failed:', error);
        }
    }
    
    initNewsletter() {
        try {
            this.addNewsletterWidgets();
        } catch (error) {
            console.log('Newsletter initialization failed:', error);
        }
    }
    
    initComments() {
        if (!this.isBackendAvailable()) {
            console.log('Comments disabled - backend unavailable');
            return;
        }
        
        try {
            if (window.location.pathname.startsWith('/blog/') || document.querySelector('.comments-section')) {
                this.loadComments();
                this.setupCommentForm();
            }
        } catch (error) {
            console.log('Comments initialization failed:', error);
        }
    }
    
    createSearchInterface() {
        // Add search functionality to the site
        this.createSearchWidget();
    }
    
    createSearchWidget() {
        // Check if we're on a blog page or main site
        if (window.location.pathname.startsWith('/blog/') || document.querySelector('.blog-content')) {
            this.addBlogSearch();
        }
        
        // Add global search shortcut
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.showSearchModal();
            }
        });
    }
    
    addBlogSearch() {
        const searchHtml = `
            <div class="blog-search-widget">
                <input type="text" id="blogSearch" placeholder="Search underground content..." />
                <button onclick="performSearch()" class="search-btn">🔍</button>
                <div id="searchResults" class="search-results"></div>
            </div>
        `;
        
        // Insert search widget
        const blogContainer = document.querySelector('.blog-container, .container');
        if (blogContainer) {
            blogContainer.insertAdjacentHTML('afterbegin', searchHtml);
        }
        
        // Add search functionality
        const searchInput = document.getElementById('blogSearch');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (e.target.value.length > 2) {
                        this.performSearch(e.target.value);
                    } else {
                        document.getElementById('searchResults').innerHTML = '';
                    }
                }, 300);
            });
        }
    }
    
    async performSearch(query) {
        if (!query) {
            const searchInput = document.getElementById('blogSearch');
            query = searchInput ? searchInput.value : '';
        }
        
        if (query.length < 2) return;
        
        try {
            const response = await fetch(`${this.endpoints.search}?q=${encodeURIComponent(query)}&limit=8`);
            const results = await response.json();
            
            this.displaySearchResults(results.results || []);
            this.trackEventRobust('search_performed', { query, results_count: results.results?.length || 0 });
            
        } catch (error) {
            console.error('Search error:', error);
            this.displaySearchResults([]);
        }
    }
    
    displaySearchResults(results) {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer) return;
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<div style="color: rgba(255, 255, 255, 0.6); text-align: center; padding: 1rem;">No results found</div>';
            return;
        }
        
        const resultsHtml = results.map(result => `
            <div class="search-result-item" onclick="navigateToResult('${result.slug}')">
                <div class="search-result-title">${result.title}</div>
                <div class="search-result-snippet">${result.snippet || result.description || ''}</div>
                <div style="font-size: 0.75rem; color: rgba(255, 149, 0, 0.6); margin-top: 0.3rem;">
                    ${result.category} • ${new Date(result.published_at).toLocaleDateString()}
                </div>
            </div>
        `).join('');
        
        resultsContainer.innerHTML = resultsHtml;
    }
    
    addNewsletterWidgets() {
        // Newsletter functionality is handled by the modal system
    }
    
    loadComments() {
        // Placeholder for comment loading
    }
    
    setupCommentForm() {
        // Placeholder for comment form setup
    }
    
    setAuthenticationState(authData) {
        sessionStorage.setItem('dutchPortalAuth', 'authenticated');
        sessionStorage.setItem('dutchPortalUser', JSON.stringify(authData.user));
        sessionStorage.setItem('dutchPortalSession', authData.sessionId);
        sessionStorage.setItem('dutchPortalTime', new Date().toISOString());
        
        localStorage.setItem('dutchPortalAuth', 'authenticated');
        localStorage.setItem('dutchPortalUser', JSON.stringify(authData.user));
        
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
        const sessionAuth = sessionStorage.getItem('dutchPortalAuth');
        if (sessionAuth === 'authenticated') {
            return true;
        }
        
        const localAuth = localStorage.getItem('dutchPortalAuth');
        if (localAuth === 'authenticated') {
            return true;
        }
        
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
            sessionStorage.setItem('returnUrl', returnTo);
            this.focusLoginForm();
        } else if (focus === 'signup' && returnTo) {
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
        
        document.body.classList.add('authenticated');
        
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
        try {
            this.setupSocialSharing();
            this.setupContentInteractions();
            this.trackEngagement();
        } catch (error) {
            console.error('Blog system initialization failed:', error);
        }
    }
    
    setupSocialSharing() {
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
            if (window.EnhancedPortalAuth) {
                window.EnhancedPortalAuth.trackEventRobust('share_content', {
                    platform: platform,
                    content_type: 'blog_post',
                    content_url: window.location.href
                });
            }
        };
        
        window.copyLink = () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showShareFeedback('Link copied to clipboard!');
            }).catch(() => {
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
        
        // Throttled scroll handler
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) return;
            scrollTimeout = setTimeout(() => {
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
                scrollTimeout = null;
            }, 16); // ~60fps
        });
    }
    
    initScrollEffects() {
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
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal, .overlay');
                modals.forEach(modal => {
                    modal.style.display = 'none';
                });
            }
            
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                const navLinks = document.querySelectorAll('.related-link');
                if (navLinks.length > 0) {
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
        
        // Throttled scroll handler
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) return;
            scrollTimeout = setTimeout(() => {
                const scrollPercent = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                maxScroll = Math.max(maxScroll, scrollPercent);
                
                if (scrollPercent > 25 && !engagementEvents.includes('scroll_25')) {
                    engagementEvents.push('scroll_25');
                    if (window.EnhancedPortalAuth) {
                        window.EnhancedPortalAuth.trackEventRobust('scroll_milestone', { milestone: 25 });
                    }
                }
                if (scrollPercent > 50 && !engagementEvents.includes('scroll_50')) {
                    engagementEvents.push('scroll_50');
                    if (window.EnhancedPortalAuth) {
                        window.EnhancedPortalAuth.trackEventRobust('scroll_milestone', { milestone: 50 });
                    }
                }
                if (scrollPercent > 75 && !engagementEvents.includes('scroll_75')) {
                    engagementEvents.push('scroll_75');
                    if (window.EnhancedPortalAuth) {
                        window.EnhancedPortalAuth.trackEventRobust('scroll_milestone', { milestone: 75 });
                    }
                }
                scrollTimeout = null;
            }, 100);
        });
        
        setInterval(() => {
            const timeOnPage = Math.round((Date.now() - startTime) / 1000);
            
            if (timeOnPage === 30 && !engagementEvents.includes('time_30')) {
                engagementEvents.push('time_30');
                if (window.EnhancedPortalAuth) {
                    window.EnhancedPortalAuth.trackEventRobust('engagement_milestone', { time: 30 });
                }
            }
            if (timeOnPage === 60 && !engagementEvents.includes('time_60')) {
                engagementEvents.push('time_60');
                if (window.EnhancedPortalAuth) {
                    window.EnhancedPortalAuth.trackEventRobust('engagement_milestone', { time: 60 });
                }
            }
            if (timeOnPage === 180 && !engagementEvents.includes('time_180')) {
                engagementEvents.push('time_180');
                if (window.EnhancedPortalAuth) {
                    window.EnhancedPortalAuth.trackEventRobust('engagement_milestone', { time: 180 });
                }
            }
        }, 1000);
        
        window.addEventListener('beforeunload', () => {
            const readingTime = Math.round((Date.now() - startTime) / 1000);
            
            if (window.EnhancedPortalAuth) {
                window.EnhancedPortalAuth.trackEventRobust('reading_behavior', {
                    reading_time: readingTime,
                    scroll_depth: Math.round(maxScroll),
                    engagement_events: engagementEvents.length,
                    page_url: window.location.href
                }, false); // Don't wait for response
            }
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
}

// Global Functions with Error Handling
window.subscribeToNewsletter = async function() {
    const email = document.getElementById('newsletterEmail')?.value;
    if (!email) return;
    
    try {
        const response = await fetch('/api/newsletter/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Newsletter subscription successful! Check your email to verify.');
            closeNewsletterModal();
        } else {
            alert('Subscription failed: ' + result.error);
        }
    } catch (error) {
        alert('Subscription failed. Please try again.');
    }
};

window.subscribeToNewsletterFooter = async function() {
    const email = document.getElementById('footerNewsletterEmail')?.value;
    if (!email) {
        alert('Please enter a valid email address');
        return;
    }
    
    try {
        const response = await fetch('/api/newsletter/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Newsletter subscription successful! Check your email to verify.');
            document.getElementById('footerNewsletterEmail').value = '';
        } else {
            alert('Subscription failed: ' + result.error);
        }
    } catch (error) {
        alert('Subscription failed. Please try again.');
    }
};

window.closeNewsletterModal = function() {
    const modal = document.getElementById('newsletterModal');
    if (modal) {
        modal.remove();
    }
};

window.performSearch = function(query) {
    if (window.EnhancedPortalAuth) {
        window.EnhancedPortalAuth.performSearch(query);
    }
};

window.navigateToResult = function(slug) {
    window.location.href = `/blog/${slug}`;
};

window.logout = function() {
    console.log('🔓 Enhanced logout requested');
    
    if (confirm('Are you sure you want to logout from the underground portal?')) {
        sessionStorage.removeItem('dutchPortalAuth');
        sessionStorage.removeItem('dutchPortalUser');
        sessionStorage.removeItem('dutchPortalSession');
        sessionStorage.removeItem('dutchPortalTime');
        sessionStorage.removeItem('returnUrl');
        
        localStorage.removeItem('dutchPortalAuth');
        localStorage.removeItem('dutchPortalUser');
        
        const expiredDate = 'Thu, 01 Jan 1970 00:00:01 GMT';
        document.cookie = `dutchPortalAuth=; expires=${expiredDate}; path=/;`;
        document.cookie = `dutchPortalSession=; expires=${expiredDate}; path=/;`;
        document.cookie = `dutchPortalUser=; expires=${expiredDate}; path=/;`;
        
        const message = document.getElementById('message');
        if (message) {
            message.textContent = 'Disconnected from underground portal...';
            message.className = 'show warning';
        }
        
        document.body.classList.remove('authenticated');
        
        setTimeout(() => {
            window.location.href = '/?logout=success';
        }, 1500);
    }
};

// Audio Player Integration
window.toggleAudioPlayer = function() {
    const container = document.getElementById('audioPlayerContainer');
    const button = document.getElementById('audioPlayButton');
    const buttonText = document.getElementById('buttonText');
    
    if (container.style.display === 'none' || !container.style.display) {
        // Show player
        container.style.display = 'block';
        buttonText.textContent = 'STOP TRANSMISSION';
        
        // Load SoundCloud player if not already loaded
        if (!document.getElementById('soundcloudPlayer').src) {
            document.getElementById('soundcloudPlayer').src = 
                'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1914792203&color=%23ff9500&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true';
        }
        
        // Track audio interaction
        if (window.EnhancedPortalAuth) {
            window.EnhancedPortalAuth.trackEventRobust('audio_play', {
                audio_source: 'soundcloud',
                track_info: 'Halform x Rico Winter Live Set'
            });
        }
    } else {
        // Hide player
        container.style.display = 'none';
        buttonText.textContent = 'INTERCEPT TRANSMISSION';
        
        // Remove iframe to stop playback
        document.getElementById('soundcloudPlayer').src = '';
        
        if (window.EnhancedPortalAuth) {
            window.EnhancedPortalAuth.trackEventRobust('audio_stop');
        }
    }
};

// Admin login functionality
window.showAdminLogin = function(event) {
    event.preventDefault();
    window.location.href = '/admin';
};

// Initialize enhanced systems when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 Enhanced Dutch Underground Portal v6.2.2 FIXED initializing...');
    
    try {
        window.EnhancedPortalAuth = new EnhancedPortalAuth();
        window.EnhancedBlogSystem = new EnhancedBlogSystem();
        
        console.log('✅ All enhanced systems initialized successfully');
        
        // Set mobile viewport height fix
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', setVH);
        
    } catch (error) {
        console.error('❌ Error initializing enhanced systems:', error);
        
        // Emergency fallback - dismiss loading screen
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('enhanced-portal-ready'));
        }, 3000);
    }
});

// Service Worker Registration for Enhanced Features
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

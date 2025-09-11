/**
 * Enhanced Cloudflare Worker for Dutch Mystery Portal API
 * Complete version with email notifications, admin dashboard, status management, export
 * PLUS enhanced content routing with navigation and footer
 */

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Key',
  'Access-Control-Max-Age': '86400',
};

// Simple admin authentication (in production, use proper auth)
const ADMIN_KEY = 'dutch-mystery-admin-2025';

// Main request handler
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // ENHANCED: Content routes (blog posts, guides, etc.)
      if (path === '/ade-2025-guide' && request.method === 'GET') {
        return await handleADEGuide(request, env);
      }

      // Public API routes
      if (path === '/api/access-request' && request.method === 'POST') {
        return await handleAccessRequest(request, env);
      }

      if (path === '/api/health' && request.method === 'GET') {
        return await handleHealthCheck(env);
      }

      // Admin routes (require authentication)
      if (path === '/api/requests' && request.method === 'GET') {
        return await handleGetRequests(request, env);
      }

      if (path === '/api/requests/update-status' && request.method === 'POST') {
        return await handleUpdateStatus(request, env);
      }

      if (path === '/api/requests/export' && request.method === 'GET') {
        return await handleExport(request, env);
      }

      if (path === '/api/requests/bulk-action' && request.method === 'POST') {
        return await handleBulkAction(request, env);
      }

      // Admin dashboard
      if (path === '/admin' && request.method === 'GET') {
        return await handleAdminDashboard(request, env);
      }

      // Statistics endpoint
      if (path === '/api/stats' && request.method === 'GET') {
        return await handleStats(request, env);
      }

      // 404 for unmatched routes
      return new Response(JSON.stringify({
        error: 'Not Found',
        message: 'API endpoint not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
  },
};

/**
 * ENHANCED: Handle ADE 2025 Guide content with navigation and footer
 */
async function handleADEGuide(request, env) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ultimate ADE 2025 Guide | If It Ain't Dutch, It Ain't Much</title>
    <meta name="description" content="Your complete guide to Amsterdam Dance Event 2025 - underground venues, secret parties, and authentic Dutch electronic music experiences.">
    
    <!-- Open Graph -->
    <meta property="og:title" content="Ultimate ADE 2025 Guide | Dutch Underground Scene">
    <meta property="og:description" content="Unlock the secrets of Amsterdam Dance Event 2025 - from hidden venues to underground techno experiences in the heart of the Netherlands.">
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://ifitaintdutchitaintmuch.com/ade-2025-guide">
    <meta property="og:image" content="https://ifitaintdutchitaintmuch.com/images/ade-2025-guide-og.jpg">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Ultimate ADE 2025 Guide | Dutch Underground Scene">
    <meta name="twitter:description" content="Your insider's guide to Amsterdam Dance Event 2025 - hidden venues, secret parties, and authentic electronic music experiences.">
    <meta name="twitter:image" content="https://ifitaintdutchitaintmuch.com/images/ade-2025-guide-twitter.jpg">
    
    <!-- Enhanced Font Loading -->
    <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Ultimate ADE 2025 Guide: Navigate Amsterdam's Underground Electronic Scene",
        "description": "Complete insider guide to Amsterdam Dance Event 2025, featuring underground venues, secret parties, and authentic Dutch electronic music experiences.",
        "author": {
            "@type": "Organization",
            "name": "If It Ain't Dutch, It Ain't Much"
        },
        "publisher": {
            "@type": "Organization",
            "name": "If It Ain't Dutch, It Ain't Much",
            "logo": {
                "@type": "ImageObject",
                "url": "https://ifitaintdutchitaintmuch.com/images/logo.png"
            }
        },
        "datePublished": "2025-09-10",
        "dateModified": "2025-09-10",
        "image": "https://ifitaintdutchitaintmuch.com/images/ade-2025-guide.jpg",
        "url": "https://ifitaintdutchitaintmuch.com/ade-2025-guide"
    }
    </script>
    
    <style>
        :root {
            --primary-orange: #FF9500;
            --electric-blue: #00BFFF;
            --neon-cyan: #00FFFF;
            --golden-yellow: #FFD700;
            --pure-black: #000000;
            --pure-white: #FFFFFF;
            --dark-gray: #111111;
            --font-title: 'Orbitron', Arial, sans-serif;
            --font-subtitle: 'Rajdhani', sans-serif;
            --font-body: 'Inter', Arial, sans-serif;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            background: linear-gradient(135deg, var(--pure-black) 0%, var(--dark-gray) 100%);
            color: var(--pure-white);
            font-family: var(--font-body);
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* Enhanced Background Effects */
        .background-gradient {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(ellipse 80% 50% at 20% 30%, rgba(255, 149, 0, 0.1) 0%, transparent 50%),
                radial-gradient(ellipse 60% 40% at 80% 70%, rgba(0, 191, 255, 0.08) 0%, transparent 50%),
                radial-gradient(ellipse 100% 80% at 40% 50%, rgba(107, 70, 193, 0.05) 0%, transparent 70%);
            z-index: -2;
            animation: etherealShift 20s infinite ease-in-out;
            pointer-events: none;
        }

        .floating-elements {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
            overflow: hidden;
        }

        /* Navigation Header */
        .nav-header {
            position: relative;
            z-index: 100;
            background: linear-gradient(145deg, rgba(255, 149, 0, 0.1), rgba(255, 149, 0, 0.05));
            backdrop-filter: blur(20px) saturate(180%);
            border-bottom: 1px solid rgba(255, 149, 0, 0.3);
            padding: 1rem 2rem;
        }

        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .nav-logo {
            font-family: var(--font-title);
            font-size: clamp(1.2rem, 3vw, 1.8rem);
            color: var(--primary-orange);
            text-shadow: 0 0 10px var(--primary-orange);
            text-decoration: none;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            transition: all 0.3s ease;
        }

        .nav-logo:hover {
            transform: scale(1.05);
            text-shadow: 0 0 20px var(--primary-orange);
        }

        .nav-menu {
            display: flex;
            gap: clamp(1rem, 3vw, 2rem);
            align-items: center;
            flex-wrap: wrap;
        }

        .nav-link {
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            font-family: var(--font-subtitle);
            font-size: clamp(0.9rem, 2vw, 1rem);
            font-weight: 500;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .nav-link::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.2), transparent);
            transition: left 0.5s ease;
        }

        .nav-link:hover::before {
            left: 100%;
        }

        .nav-link:hover {
            color: var(--electric-blue);
            background: rgba(0, 191, 255, 0.1);
            transform: translateY(-2px);
        }

        .nav-link.active {
            color: var(--golden-yellow);
            background: rgba(255, 215, 0, 0.1);
            border: 1px solid rgba(255, 215, 0, 0.3);
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 1rem;
            color: var(--golden-yellow);
            font-size: clamp(0.8rem, 1.8vw, 0.9rem);
        }

        .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-orange), var(--electric-blue));
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 0.8rem;
        }

        .logout-btn {
            background: none;
            border: 1px solid rgba(255, 149, 0, 0.3);
            color: var(--primary-orange);
            padding: 0.3rem 0.8rem;
            border-radius: 6px;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .logout-btn:hover {
            background: rgba(255, 149, 0, 0.1);
            transform: translateY(-1px);
        }

        /* Main Content */
        .main-wrapper {
            flex: 1;
            position: relative;
            z-index: 2;
        }

        .blog-container {
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem;
            position: relative;
        }

        .blog-header {
            text-align: center;
            margin-bottom: 3rem;
            padding: 2rem 0;
            border-bottom: 2px solid var(--primary-orange);
        }

        .blog-title {
            font-family: var(--font-title);
            font-size: clamp(2rem, 5vw, 3.5rem);
            color: var(--primary-orange);
            text-shadow: 0 0 20px var(--primary-orange);
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            animation: titleGlow 4s ease-in-out infinite alternate;
        }

        .blog-subtitle {
            font-size: clamp(1rem, 3vw, 1.3rem);
            color: var(--electric-blue);
            text-shadow: 0 0 10px var(--electric-blue);
            margin-bottom: 1rem;
        }

        .blog-meta {
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.9rem;
            margin-bottom: 2rem;
        }

        .blog-content {
            font-size: 1.1rem;
            line-height: 1.8;
            color: rgba(255, 255, 255, 0.9);
        }

        .blog-content h2 {
            color: var(--neon-cyan);
            font-family: var(--font-title);
            font-size: 1.8rem;
            margin: 2.5rem 0 1rem;
            text-shadow: 0 0 10px var(--neon-cyan);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .blog-content h3 {
            color: var(--golden-yellow);
            font-size: 1.4rem;
            margin: 2rem 0 0.8rem;
            text-shadow: 0 0 8px var(--golden-yellow);
        }

        .blog-content p { margin-bottom: 1.5rem; }

        .blog-content ul, .blog-content ol {
            margin: 1.5rem 0;
            padding-left: 2rem;
        }

        .blog-content li {
            margin-bottom: 0.8rem;
            color: rgba(255, 255, 255, 0.85);
        }

        .venue-card {
            background: rgba(255, 149, 0, 0.1);
            border: 1px solid var(--primary-orange);
            border-radius: 10px;
            padding: 1.5rem;
            margin: 2rem 0;
            backdrop-filter: blur(10px);
        }

        .venue-name {
            color: var(--primary-orange);
            font-weight: 700;
            font-size: 1.2rem;
            margin-bottom: 0.5rem;
        }

        .cta-box {
            background: rgba(255, 149, 0, 0.1);
            border: 1px solid var(--primary-orange);
            border-radius: 10px;
            padding: 2rem;
            margin: 3rem 0;
            text-align: center;
        }

        .tip-box {
            background: rgba(0, 191, 255, 0.1);
            border-left: 4px solid var(--electric-blue);
            padding: 1.5rem;
            margin: 2rem 0;
            border-radius: 0 8px 8px 0;
        }

        /* Enhanced Footer matching homepage */
        .neon-footer {
            position: relative;
            text-align: center;
            padding: 2rem;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
            z-index: 2;
            backdrop-filter: blur(10px);
            margin-top: 4rem;
            border-top: 1px solid rgba(255, 149, 0, 0.3);
        }

        .neon-footer nav ul {
            list-style: none;
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: clamp(1rem, 3vw, 2rem);
            margin-bottom: 1.5rem;
        }

        .neon-footer a {
            color: var(--primary-orange);
            text-decoration: none;
            font-size: clamp(0.8rem, 1.8vw, 0.9rem);
            transition: all 0.3s ease;
            position: relative;
            padding: 0.3rem 0;
        }

        .neon-footer a::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 1px;
            background: var(--electric-blue);
            transition: width 0.3s ease;
        }

        .neon-footer a:hover {
            color: var(--electric-blue);
            text-shadow: 0 0 10px var(--electric-blue);
        }

        .neon-footer a:hover::after {
            width: 100%;
        }

        .neon-footer p {
            color: rgba(255, 255, 255, 0.6);
            font-size: clamp(0.7rem, 1.5vw, 0.8rem);
            margin: 1rem 0 0.5rem;
        }

        .social-links {
            display: flex;
            justify-content: center;
            gap: clamp(0.8rem, 2vw, 1rem);
            margin-top: 1rem;
        }

        .social-links a {
            font-size: clamp(1.2rem, 2.5vw, 1.5rem);
            transition: transform 0.3s ease;
        }

        .social-links a:hover {
            transform: scale(1.3) rotate(10deg);
        }

        .admin-access-link {
            opacity: 0.5;
            transition: opacity 0.3s ease;
        }

        .admin-access-link:hover {
            opacity: 1;
        }

        /* Animations */
        @keyframes titleGlow {
            0% { 
                text-shadow: 0 0 20px var(--primary-orange);
            }
            100% { 
                text-shadow: 0 0 30px var(--primary-orange), 0 0 40px rgba(255, 149, 0, 0.8);
            }
        }

        @keyframes etherealShift {
            0%, 100% { opacity: 1; transform: scale(1); }
            33% { opacity: 0.8; transform: scale(1.05) rotate(1deg); }
            66% { opacity: 0.9; transform: scale(0.95) rotate(-1deg); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .nav-container {
                flex-direction: column;
                text-align: center;
            }
            
            .nav-menu {
                justify-content: center;
            }
            
            .blog-container { 
                padding: 1rem; 
            }
            
            .blog-header { 
                padding: 1rem 0; 
            }
            
            .venue-card { 
                padding: 1rem; 
            }
            
            .neon-footer nav ul {
                flex-direction: column;
                gap: 1rem;
            }
        }

        @media (max-width: 480px) {
            .nav-header {
                padding: 1rem;
            }
            
            .user-info {
                font-size: 0.8rem;
            }
            
            .neon-footer {
                padding: 1rem;
            }
        }
    </style>
</head>
<body>
    <!-- Enhanced Background Effects -->
    <div class="background-gradient"></div>
    <div class="floating-elements"></div>

    <!-- Navigation Header -->
    <header class="nav-header">
        <nav class="nav-container">
            <a href="/" class="nav-logo">Dutch Mystery Portal</a>
            
            <div class="nav-menu">
                <a href="/" class="nav-link">Portal Home</a>
                <a href="/ade-2025-guide" class="nav-link active">ADE 2025 Guide</a>
                <a href="#" class="nav-link" onclick="alert('More content coming soon!')">Underground Events</a>
                <a href="#" class="nav-link" onclick="alert('More content coming soon!')">Heritage Collection</a>
                <a href="/admin" class="nav-link">Admin</a>
            </div>

            <div class="user-info">
                <div class="user-avatar" id="userAvatar">D</div>
                <span id="welcomeUser">Welcome</span>
                <button class="logout-btn" onclick="logout()">Logout</button>
            </div>
        </nav>
    </header>

    <!-- Main Content Wrapper -->
    <div class="main-wrapper">
        <div class="blog-container">
            <header class="blog-header">
                <h1 class="blog-title">ADE 2025 Guide</h1>
                <p class="blog-subtitle">Navigate Amsterdam's Underground Electronic Scene</p>
                <div class="blog-meta">
                    Published: September 10, 2025 | By: Dutch Mystery Portal
                </div>
            </header>

            <article class="blog-content">
                <p>Amsterdam Dance Event 2025 is approaching, and the underground electronic music scene is more vibrant than ever. This comprehensive guide will help you navigate the maze of venues, secret parties, and exclusive experiences that make ADE the ultimate electronic music pilgrimage.</p>

                <h2>Underground Venues to Watch</h2>
                
                <div class="venue-card">
                    <div class="venue-name">De School</div>
                    <p>The legendary 24-hour venue continues to be the heart of Amsterdam's underground scene. Former school building turned techno temple with multiple rooms and an outdoor terrace.</p>
                </div>

                <div class="venue-card">
                    <div class="venue-name">Radion</div>
                    <p>Industrial warehouse space in Amsterdam Noord, known for its raw atmosphere and cutting-edge sound system. A must-visit for serious techno heads.</p>
                </div>

                <div class="venue-card">
                    <div class="venue-name">Claire</div>
                    <p>Intimate club focusing on experimental electronic music and avant-garde performances. Perfect for discovering emerging artists.</p>
                </div>

                <div class="venue-card">
                    <div class="venue-name">Shelter</div>
                    <p>Underground venue beneath Amsterdam Centraal Station. The tunnel setting creates an incredibly unique acoustic experience.</p>
                </div>

                <h2>ADE 2025 Dates & Key Info</h2>
                <p><strong>When:</strong> October 16-20, 2025</p>
                <p><strong>Where:</strong> Throughout Amsterdam</p>
                <p><strong>Tickets:</strong> Individual venue tickets + ADE Pro Pass for industry events</p>
                <p><strong>Budget:</strong> Expect to spend 200-500 EUR for a full ADE experience</p>

                <div class="tip-box">
                    <p><strong>Pro Tip:</strong> Many of the best events happen on Wednesday and Thursday before the official weekend. Don't miss the mid-week parties!</p>
                </div>

                <h3>Essential Tips for ADE Survival</h3>
                <ul>
                    <li><strong>Book early:</strong> Amsterdam accommodations fill up 6+ months in advance</li>
                    <li><strong>Download apps:</strong> Official ADE app + Resident Advisor for real-time updates</li>
                    <li><strong>Cash is king:</strong> Many venues don't accept cards, especially smaller underground spots</li>
                    <li><strong>Transport smart:</strong> Use bikes or public transport - parking is nightmare</li>
                    <li><strong>Pace yourself:</strong> It's a 5-day marathon, not a sprint</li>
                    <li><strong>Layer up:</strong> October weather can be unpredictable</li>
                    <li><strong>Charge your phone:</strong> You'll need it for maps, tickets, and meetups</li>
                </ul>

                <h2>Secret Parties & Hidden Gems</h2>
                <p>The real magic of ADE happens in the unofficial events and secret locations. Here's how to find them:</p>
                
                <h3>Where to Find Secret Events</h3>
                <ul>
                    <li><strong>Telegram channels:</strong> Join local electronic music groups</li>
                    <li><strong>Artist social media:</strong> DJs often announce last-minute sets</li>
                    <li><strong>Record shops:</strong> Visit Rush Hour and Concerto for insider tips</li>
                    <li><strong>Local bars:</strong> Strike up conversations with locals</li>
                    <li><strong>Hostel networks:</strong> Other travelers often have great intel</li>
                </ul>

                <div class="tip-box">
                    <p><strong>Insider Secret:</strong> Follow the venue staff on Instagram. They often post about after-parties and secret sessions that never make it to official listings.</p>
                </div>

                <h3>Must-See Artists ADE 2025</h3>
                <p>While the full lineup is still being announced, expect performances from:</p>
                
                <h4>International Headliners</h4>
                <ul>
                    <li>Amelie Lens</li>
                    <li>Ben Klock</li>
                    <li>Nina Kraviz</li>
                    <li>Kobosil</li>
                    <li>Paula Temple</li>
                    <li>Charlotte de Witte</li>
                </ul>

                <h4>Dutch Legends</h4>
                <ul>
                    <li>Joris Voorn</li>
                    <li>Maceo Plex</li>
                    <li>Reinier Zonneveld</li>
                    <li>Satori</li>
                    <li>Speedy J</li>
                </ul>

                <h2>Food & Fuel</h2>
                <p>Dancing until dawn requires proper fuel. Here are our recommended spots for quick bites and energy boosts:</p>
                
                <h3>Late Night Eats (Open Past 2 AM)</h3>
                <ul>
                    <li><strong>Febo:</strong> Amsterdam's famous automated restaurant - perfect for 3am cravings</li>
                    <li><strong>New York Pizza:</strong> Multiple locations, reliable late-night option</li>
                    <li><strong>Vlaams Friteshuis Vleminckx:</strong> Best fries in the city (closes early but worth it)</li>
                    <li><strong>Kebab shops on Leidseplein:</strong> Your 4am savior</li>
                    <li><strong>Albert Heijn to go:</strong> 24/7 convenience stores for snacks and water</li>
                </ul>

                <h3>Pre-Party Fuel</h3>
                <ul>
                    <li><strong>Cafe de Reiger:</strong> Hearty Dutch food to line your stomach</li>
                    <li><strong>Restaurant Greetje:</strong> Modern Dutch cuisine for a special pre-ADE dinner</li>
                    <li><strong>Foodhallen:</strong> Food court with international options</li>
                </ul>

                <h2>Getting Around</h2>
                <p>Amsterdam's compact size makes it perfect for venue hopping. Your transport options:</p>
                
                <ul>
                    <li><strong>Bike (Recommended):</strong> Most authentic Amsterdam experience, available 24/7</li>
                    <li><strong>Tram/Metro:</strong> Efficient public transport, but check night service times</li>
                    <li><strong>Uber/Bolt:</strong> Convenient but surge pricing during peak times</li>
                    <li><strong>Walking:</strong> Many venues are within 15-20 minutes of each other</li>
                    <li><strong>Water taxi:</strong> Expensive but fun way to travel the canals</li>
                </ul>

                <div class="tip-box">
                    <p><strong>Transport Hack:</strong> Buy a GVB day pass for unlimited public transport. Night buses run when trams stop, and they're included in the pass.</p>
                </div>

                <div class="cta-box">
                    <h3 style="color: var(--primary-orange); margin-bottom: 1rem;">Explore More Exclusive Content</h3>
                    <p>You now have access to our complete Dutch mystery collection. Discover underground events, heritage merchandise, and insider experiences.</p>
                    <p style="margin-top: 1rem;">
                        <a href="/" style="color: var(--golden-yellow); text-decoration: none; font-weight: bold;">Return to Portal Home</a>
                    </p>
                </div>

                <p style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid rgba(255, 149, 0, 0.3); color: rgba(255, 255, 255, 0.7);">
                    <em>This guide will be updated as more ADE 2025 details are announced. Bookmark this page and check back regularly for the latest underground intel.</em>
                </p>
            </article>
        </div>
    </div>

    <!-- Enhanced Footer matching homepage -->
    <footer class="neon-footer" role="contentinfo">
        <nav aria-label="Footer Navigation">
            <ul>
                <li><a href="/privacy-policy.html" rel="nofollow">Privacy Policy</a></li>
                <li><a href="/terms-of-service.html" rel="nofollow">Terms of Service</a></li>
                <li><a href="/contact.html">Contact Portal</a></li>
                <li><a href="/accessibility.html">Accessibility</a></li>
                <li><a href="/sitemap.xml" rel="nofollow">Sitemap</a></li>
            </ul>
        </nav>
        <p>&copy; 2025 If It Ain't Dutch, It Ain't Much. All mysteries reserved.</p>
        <div class="social-links" aria-label="Follow Our Mysteries">
            <a href="https://instagram.com/ifitaintdutchitaintmuch" 
               target="_blank" 
               rel="noopener nofollow" 
               aria-label="Follow us on Instagram">📷</a>
            <a href="https://on.soundcloud.com/PZdtlNaYaIgP25MTX2" 
               target="_blank" 
               rel="noopener nofollow" 
               aria-label="Listen to our mysterious sounds">🎵</a>
            <!-- Discreet Admin Access -->
            <a href="/admin" 
               class="admin-access-link"
               aria-label="Portal Management">⚙</a>
        </div>
    </footer>

    <script>
        // User session management
        function initializeUser() {
            const user = sessionStorage.getItem('dutchPortalUser');
            if (user) {
                document.getElementById('welcomeUser').textContent = user;
                document.getElementById('userAvatar').textContent = user.charAt(0).toUpperCase();
            } else {
                // Redirect to homepage if not authenticated
                window.location.href = '/';
            }
        }

        function logout() {
            sessionStorage.removeItem('dutchPortalAuth');
            sessionStorage.removeItem('dutchPortalUser');
            sessionStorage.removeItem('dutchPortalTime');
            window.location.href = '/';
        }

        // Floating elements animation
        function createFloatingElements() {
            const container = document.querySelector('.floating-elements');
            if (!container) return;
            
            const symbols = ['🌷', '🛠️', '⚡', '🔮', '💎', '🌟', '🎭', '🗝️'];
            
            for (let i = 0; i < 8; i++) {
                const element = document.createElement('div');
                element.textContent = symbols[Math.floor(Math.random() * symbols.length)];
                element.style.cssText = \`
                    position: absolute;
                    font-size: \${Math.random() * 15 + 10}px;
                    opacity: \${Math.random() * 0.3 + 0.1};
                    pointer-events: none;
                    left: \${Math.random() * 100}%;
                    top: \${Math.random() * 100}%;
                    animation: floatMystery \${Math.random() * 20 + 15}s infinite linear;
                    will-change: transform;
                \`;
                container.appendChild(element);
            }
        }

        // Add floating animation styles
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes floatMystery {
                0% { transform: translateY(0) rotate(0deg) translateX(0); }
                25% { transform: translateY(-20px) rotate(90deg) translateX(10px); }
                50% { transform: translateY(-10px) rotate(180deg) translateX(-10px); }
                75% { transform: translateY(-30px) rotate(270deg) translateX(5px); }
                100% { transform: translateY(0) rotate(360deg) translateX(0); }
            }
        \`;
        document.head.appendChild(style);

        // Initialize everything
        document.addEventListener('DOMContentLoaded', function() {
            initializeUser();
            createFloatingElements();
        });
    </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600',
      ...corsHeaders,
    },
  });
}

/**
 * Handle access request form submissions with email notifications
 */
async function handleAccessRequest(request, env) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const validationError = validateAccessRequest(body);
    if (validationError) {
      return new Response(JSON.stringify({
        error: 'Validation Error',
        message: validationError
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Sanitize data
    const sanitizedData = {
      full_name: sanitizeString(body.fullName),
      email: sanitizeEmail(body.email),
      phone: sanitizeString(body.phone),
      country: sanitizeString(body.country),
      request_date: body.requestDate || new Date().toISOString(),
      user_agent: sanitizeString(body.userAgent) || null,
      referrer: sanitizeString(body.referrer) || null,
      status: 'pending'
    };

    // Check for duplicate email within last 24 hours
    const duplicateCheck = await env.DB.prepare(`
      SELECT id FROM access_requests 
      WHERE email = ? AND created_at > datetime('now', '-24 hours')
    `).bind(sanitizedData.email).first();

    if (duplicateCheck) {
      return new Response(JSON.stringify({
        error: 'Duplicate Request',
        message: 'An access request with this email was already submitted within the last 24 hours.'
      }), {
        status: 409,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Insert into database
    const result = await env.DB.prepare(`
      INSERT INTO access_requests (
        full_name, email, phone, country, request_date, 
        user_agent, referrer, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      sanitizedData.full_name,
      sanitizedData.email,
      sanitizedData.phone,
      sanitizedData.country,
      sanitizedData.request_date,
      sanitizedData.user_agent,
      sanitizedData.referrer,
      sanitizedData.status
    ).run();

    if (!result.success) {
      throw new Error('Failed to insert access request');
    }

    // Send email notification to admin
    try {
      await sendAdminNotification(sanitizedData, result.meta.last_row_id, env);
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
      // Don't fail the request if email fails
    }

    // Send confirmation email to user
    try {
      await sendUserConfirmation(sanitizedData, env);
    } catch (emailError) {
      console.error('Failed to send user confirmation:', emailError);
      // Don't fail the request if email fails
    }

    console.log(`New access request submitted: ${sanitizedData.email} from ${sanitizedData.country}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Access request submitted successfully',
      requestId: result.meta.last_row_id
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('Error handling access request:', error);
    return new Response(JSON.stringify({
      error: 'Server Error',
      message: 'Failed to process access request'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

/**
 * Handle status updates for access requests
 */
async function handleUpdateStatus(request, env) {
  try {
    // Check admin authentication
    const adminKey = request.headers.get('X-Admin-Key');
    if (adminKey !== ADMIN_KEY) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'Invalid admin credentials'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    const body = await request.json();
    const { requestId, status, notes } = body;

    if (!requestId || !status) {
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        message: 'requestId and status are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return new Response(JSON.stringify({
        error: 'Invalid status',
        message: 'Status must be pending, approved, or rejected'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Get the current request for email notification
    const currentRequest = await env.DB.prepare(`
      SELECT * FROM access_requests WHERE id = ?
    `).bind(requestId).first();

    if (!currentRequest) {
      return new Response(JSON.stringify({
        error: 'Request not found',
        message: 'Access request not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Update status
    const result = await env.DB.prepare(`
      UPDATE access_requests 
      SET status = ?, notes = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(status, notes || null, requestId).run();

    if (!result.success) {
      throw new Error('Failed to update status');
    }

    // Send status update email to user
    try {
      await sendStatusUpdateEmail(currentRequest, status, notes, env);
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Status updated successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('Error updating status:', error);
    return new Response(JSON.stringify({
      error: 'Server Error',
      message: 'Failed to update status'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

/**
 * Handle bulk actions on multiple requests
 */
async function handleBulkAction(request, env) {
  try {
    const adminKey = request.headers.get('X-Admin-Key');
    if (adminKey !== ADMIN_KEY) {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const body = await request.json();
    const { requestIds, action, status } = body;

    if (!requestIds || !Array.isArray(requestIds) || !action) {
      return new Response(JSON.stringify({
        error: 'Invalid request data'
      }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    let results = [];

    if (action === 'updateStatus' && status) {
      for (const requestId of requestIds) {
        try {
          await env.DB.prepare(`
            UPDATE access_requests 
            SET status = ?, updated_at = datetime('now')
            WHERE id = ?
          `).bind(status, requestId).run();
          results.push({ requestId, success: true });
        } catch (error) {
          results.push({ requestId, success: false, error: error.message });
        }
      }
    } else if (action === 'delete') {
      for (const requestId of requestIds) {
        try {
          await env.DB.prepare(`
            DELETE FROM access_requests WHERE id = ?
          `).bind(requestId).run();
          results.push({ requestId, success: true });
        } catch (error) {
          results.push({ requestId, success: false, error: error.message });
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      results: results
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('Error in bulk action:', error);
    return new Response(JSON.stringify({
      error: 'Server Error'
    }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
}

/**
 * Handle export functionality
 */
async function handleExport(request, env) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json';
    const status = url.searchParams.get('status');

    let query = 'SELECT * FROM access_requests';
    let params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const { results } = await env.DB.prepare(query).bind(...params).all();

    if (format === 'csv') {
      const csv = convertToCSV(results);
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="access_requests.csv"',
          ...corsHeaders,
        },
      });
    }

    return new Response(JSON.stringify({
      data: results,
      exportedAt: new Date().toISOString(),
      count: results.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('Error exporting data:', error);
    return new Response(JSON.stringify({
      error: 'Export failed'
    }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
}

/**
 * Handle statistics endpoint
 */
async function handleStats(request, env) {
  try {
    const stats = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) as total FROM access_requests').first(),
      env.DB.prepare('SELECT COUNT(*) as pending FROM access_requests WHERE status = "pending"').first(),
      env.DB.prepare('SELECT COUNT(*) as approved FROM access_requests WHERE status = "approved"').first(),
      env.DB.prepare('SELECT COUNT(*) as rejected FROM access_requests WHERE status = "rejected"').first(),
      env.DB.prepare('SELECT COUNT(*) as today FROM access_requests WHERE DATE(created_at) = DATE("now")').first(),
      env.DB.prepare('SELECT COUNT(*) as this_week FROM access_requests WHERE created_at >= datetime("now", "-7 days")').first(),
    ]);

    return new Response(JSON.stringify({
      total: stats[0].total,
      pending: stats[1].pending,
      approved: stats[2].approved,
      rejected: stats[3].rejected,
      today: stats[4].today,
      thisWeek: stats[5].this_week
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('Error getting stats:', error);
    return new Response(JSON.stringify({
      error: 'Failed to get statistics'
    }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
}

/**
 * Handle admin dashboard
 */
async function handleAdminDashboard(request, env) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dutch Mystery Portal - Admin Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a1a, #2d1810);
            color: #fff;
            min-height: 100vh;
        }
        
        .header {
            background: rgba(255, 149, 0, 0.1);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 149, 0, 0.3);
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .header h1 {
            color: #FF9500;
            font-size: 1.5rem;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            padding: 2rem;
        }
        
        .stat-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 149, 0, 0.3);
            border-radius: 10px;
            padding: 1.5rem;
            text-align: center;
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #FF9500;
            margin-bottom: 0.5rem;
        }
        
        .stat-label {
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.9rem;
        }
        
        .controls {
            padding: 0 2rem 1rem;
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            align-items: center;
        }
        
        .btn {
            background: linear-gradient(135deg, #FF9500, #FFD700);
            color: #000;
            border: none;
            padding: 0.7rem 1.5rem;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 600;
            transition: transform 0.2s;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
        }
        
        select, input {
            background: rgba(0, 0, 0, 0.6);
            border: 1px solid rgba(255, 149, 0, 0.3);
            color: #fff;
            padding: 0.7rem;
            border-radius: 5px;
        }
        
        .table-container {
            margin: 0 2rem 2rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            overflow: hidden;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th, td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid rgba(255, 149, 0, 0.2);
        }
        
        th {
            background: rgba(255, 149, 0, 0.1);
            color: #FF9500;
            font-weight: 600;
        }
        
        .status {
            padding: 0.3rem 0.8rem;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .status.pending {
            background: rgba(255, 193, 7, 0.2);
            color: #FFC107;
        }
        
        .status.approved {
            background: rgba(40, 167, 69, 0.2);
            color: #28A745;
        }
        
        .status.rejected {
            background: rgba(220, 53, 69, 0.2);
            color: #DC3545;
        }
        
        .actions {
            display: flex;
            gap: 0.5rem;
        }
        
        .btn-small {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
        }
        
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 1000;
        }
        
        .modal-content {
            background: #2d1810;
            margin: 10% auto;
            padding: 2rem;
            border-radius: 10px;
            width: 90%;
            max-width: 500px;
            border: 1px solid rgba(255, 149, 0, 0.3);
        }
        
        .close {
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            color: #FF9500;
        }
        
        .form-group {
            margin-bottom: 1rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: #FF9500;
        }
        
        .form-group textarea {
            width: 100%;
            min-height: 100px;
            background: rgba(0, 0, 0, 0.6);
            border: 1px solid rgba(255, 149, 0, 0.3);
            color: #fff;
            padding: 0.7rem;
            border-radius: 5px;
            resize: vertical;
        }
        
        .loading {
            display: none;
            text-align: center;
            padding: 2rem;
            color: #FF9500;
        }
        
        .checkbox {
            margin-right: 0.5rem;
        }

        @media (max-width: 768px) {
            .controls {
                flex-direction: column;
                align-items: stretch;
            }
            
            .stats-grid {
                grid-template-columns: 1fr 1fr;
                padding: 1rem;
            }
            
            table {
                font-size: 0.9rem;
            }
            
            th, td {
                padding: 0.5rem;
            }
            
            .actions {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Dutch Mystery Portal - Admin Dashboard</h1>
        <button class="btn" onclick="refreshData()">Refresh Data</button>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-number" id="totalRequests">-</div>
            <div class="stat-label">Total Requests</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="pendingRequests">-</div>
            <div class="stat-label">Pending</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="approvedRequests">-</div>
            <div class="stat-label">Approved</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="rejectedRequests">-</div>
            <div class="stat-label">Rejected</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="todayRequests">-</div>
            <div class="stat-label">Today</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="weekRequests">-</div>
            <div class="stat-label">This Week</div>
        </div>
    </div>

    <div class="controls">
        <select id="statusFilter" onchange="filterByStatus()">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
        </select>
        
        <input type="text" id="searchInput" placeholder="Search by name or email..." onkeyup="searchRequests()">
        
        <button class="btn" onclick="exportData()">Export CSV</button>
        <button class="btn btn-secondary" onclick="toggleBulkMode()">Bulk Actions</button>
        
        <div id="bulkActions" style="display: none;">
            <select id="bulkAction">
                <option value="">Select Action</option>
                <option value="approve">Approve Selected</option>
                <option value="reject">Reject Selected</option>
                <option value="delete">Delete Selected</option>
            </select>
            <button class="btn" onclick="executeBulkAction()">Execute</button>
        </div>
    </div>

    <div class="loading" id="loading">Loading requests...</div>

    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th><input type="checkbox" id="selectAll" onchange="toggleSelectAll()"></th>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Country</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="requestsTable">
            </tbody>
        </table>
    </div>

    <!-- Status Update Modal -->
    <div id="statusModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <h3>Update Request Status</h3>
            <form id="statusForm">
                <div class="form-group">
                    <label for="newStatus">Status:</label>
                    <select id="newStatus" required>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="statusNotes">Notes (optional):</label>
                    <textarea id="statusNotes" placeholder="Add any notes about this decision..."></textarea>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn">Update Status</button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        const ADMIN_KEY = 'dutch-mystery-admin-2025';
        let allRequests = [];
        let currentRequestId = null;
        let bulkMode = false;

        async function loadStats() {
            try {
                const response = await fetch('/api/stats');
                const stats = await response.json();
                
                document.getElementById('totalRequests').textContent = stats.total || 0;
                document.getElementById('pendingRequests').textContent = stats.pending || 0;
                document.getElementById('approvedRequests').textContent = stats.approved || 0;
                document.getElementById('rejectedRequests').textContent = stats.rejected || 0;
                document.getElementById('todayRequests').textContent = stats.today || 0;
                document.getElementById('weekRequests').textContent = stats.thisWeek || 0;
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        }

        async function loadRequests() {
            try {
                document.getElementById('loading').style.display = 'block';
                const response = await fetch('/api/requests?limit=100');
                const data = await response.json();
                allRequests = data.data || [];
                displayRequests(allRequests);
            } catch (error) {
                console.error('Error loading requests:', error);
                alert('Failed to load requests');
            } finally {
                document.getElementById('loading').style.display = 'none';
            }
        }

        function displayRequests(requests) {
            const tbody = document.getElementById('requestsTable');
            tbody.innerHTML = '';

            requests.forEach(request => {
                const row = document.createElement('tr');
                const date = new Date(request.created_at).toLocaleDateString();
                
                row.innerHTML = \`
                    <td><input type="checkbox" class="request-checkbox" value="\${request.id}"></td>
                    <td>\${request.id}</td>
                    <td>\${request.full_name}</td>
                    <td>\${request.email}</td>
                    <td>\${request.phone}</td>
                    <td>\${request.country}</td>
                    <td><span class="status \${request.status}">\${request.status}</span></td>
                    <td>\${date}</td>
                    <td class="actions">
                        <button class="btn btn-small" onclick="openStatusModal(\${request.id}, '\${request.status}')">Update</button>
                        <button class="btn btn-small btn-secondary" onclick="viewDetails(\${request.id})">View</button>
                    </td>
                \`;
                tbody.appendChild(row);
            });
        }

        function filterByStatus() {
            const status = document.getElementById('statusFilter').value;
            const filtered = status ? allRequests.filter(r => r.status === status) : allRequests;
            displayRequests(filtered);
        }

        function searchRequests() {
            const query = document.getElementById('searchInput').value.toLowerCase();
            const filtered = allRequests.filter(r => 
                r.full_name.toLowerCase().includes(query) || 
                r.email.toLowerCase().includes(query)
            );
            displayRequests(filtered);
        }

        function openStatusModal(requestId, currentStatus) {
            currentRequestId = requestId;
            document.getElementById('newStatus').value = currentStatus;
            document.getElementById('statusNotes').value = '';
            document.getElementById('statusModal').style.display = 'block';
        }

        function closeModal() {
            document.getElementById('statusModal').style.display = 'none';
            currentRequestId = null;
        }

        async function updateStatus(event) {
            event.preventDefault();
            
            if (!currentRequestId) return;

            const status = document.getElementById('newStatus').value;
            const notes = document.getElementById('statusNotes').value;

            try {
                const response = await fetch('/api/requests/update-status', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Admin-Key': ADMIN_KEY
                    },
                    body: JSON.stringify({
                        requestId: currentRequestId,
                        status: status,
                        notes: notes
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Status updated successfully!');
                    closeModal();
                    refreshData();
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.error('Error updating status:', error);
                alert('Failed to update status');
            }
        }

        function toggleBulkMode() {
            bulkMode = !bulkMode;
            const bulkActions = document.getElementById('bulkActions');
            const checkboxes = document.querySelectorAll('.request-checkbox, #selectAll');
            
            bulkActions.style.display = bulkMode ? 'block' : 'none';
            checkboxes.forEach(cb => cb.style.display = bulkMode ? 'inline' : 'none');
        }

        function toggleSelectAll() {
            const selectAll = document.getElementById('selectAll');
            const checkboxes = document.querySelectorAll('.request-checkbox');
            checkboxes.forEach(cb => cb.checked = selectAll.checked);
        }

        async function executeBulkAction() {
            const action = document.getElementById('bulkAction').value;
            const checkboxes = document.querySelectorAll('.request-checkbox:checked');
            const requestIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

            if (!action || requestIds.length === 0) {
                alert('Please select an action and at least one request');
                return;
            }

            if (!confirm(\`Are you sure you want to \${action} \${requestIds.length} request(s)?\`)) {
                return;
            }

            try {
                let endpoint, body;
                
                if (action === 'approve' || action === 'reject') {
                    endpoint = '/api/requests/bulk-action';
                    body = {
                        requestIds: requestIds,
                        action: 'updateStatus',
                        status: action === 'approve' ? 'approved' : 'rejected'
                    };
                } else if (action === 'delete') {
                    endpoint = '/api/requests/bulk-action';
                    body = {
                        requestIds: requestIds,
                        action: 'delete'
                    };
                }

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Admin-Key': ADMIN_KEY
                    },
                    body: JSON.stringify(body)
                });

                const result = await response.json();

                if (response.ok) {
                    alert(\`Bulk action completed successfully!\`);
                    refreshData();
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.error('Error executing bulk action:', error);
                alert('Failed to execute bulk action');
            }
        }

        async function exportData() {
            try {
                const status = document.getElementById('statusFilter').value;
                const url = status ? \`/api/requests/export?format=csv&status=\${status}\` : '/api/requests/export?format=csv';
                
                const response = await fetch(url);
                const csv = await response.text();
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url2 = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url2;
                a.download = 'access_requests.csv';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url2);
                document.body.removeChild(a);
            } catch (error) {
                console.error('Error exporting data:', error);
                alert('Failed to export data');
            }
        }

        function viewDetails(requestId) {
            const request = allRequests.find(r => r.id === requestId);
            if (!request) return;

            alert(\`
Request Details:

ID: \${request.id}
Name: \${request.full_name}
Email: \${request.email}
Phone: \${request.phone}
Country: \${request.country}
Status: \${request.status}
Submitted: \${new Date(request.created_at).toLocaleString()}
User Agent: \${request.user_agent || 'N/A'}
Referrer: \${request.referrer || 'N/A'}
Notes: \${request.notes || 'N/A'}
            \`);
        }

        async function refreshData() {
            await Promise.all([loadStats(), loadRequests()]);
        }

        // Event listeners
        document.getElementById('statusForm').addEventListener('submit', updateStatus);

        // Close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('statusModal');
            if (event.target === modal) {
                closeModal();
            }
        }

        // Initialize dashboard
        refreshData();
    </script>
</body>
</html>
  `;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      ...corsHeaders,
    },
  });
}

/**
 * Health check endpoint
 */
async function handleHealthCheck(env) {
  try {
    const result = await env.DB.prepare('SELECT 1 as health').first();
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: result ? 'connected' : 'disconnected',
      version: '2.1.0',
      features: ['email_notifications', 'admin_dashboard', 'export', 'bulk_actions', 'enhanced_content_routing'],
      emailConfigured: !!(env.RESEND_API_KEY && env.ADMIN_EMAIL)
    };

    return new Response(JSON.stringify(healthStatus), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

/**
 * Get access requests
 */
async function handleGetRequests(request, env) {
  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 50, 100);
    const offset = Math.max(parseInt(url.searchParams.get('offset')) || 0, 0);
    const status = url.searchParams.get('status');

    let query = `
      SELECT id, full_name, email, phone, country, status, 
             created_at, updated_at, notes
      FROM access_requests
    `;
    let params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const { results } = await env.DB.prepare(query).bind(...params).all();

    const countQuery = status 
      ? 'SELECT COUNT(*) as total FROM access_requests WHERE status = ?'
      : 'SELECT COUNT(*) as total FROM access_requests';
    const countParams = status ? [status] : [];
    const { total } = await env.DB.prepare(countQuery).bind(...countParams).first();

    return new Response(JSON.stringify({
      data: results,
      pagination: {
        total: total,
        limit: limit,
        offset: offset,
        hasMore: offset + limit < total
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('Error fetching requests:', error);
    return new Response(JSON.stringify({
      error: 'Server Error',
      message: 'Failed to fetch access requests'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

/**
 * Email notification functions with your verified domain
 */
async function sendAdminNotification(userData, requestId, env) {
  if (!env.RESEND_API_KEY || !env.ADMIN_EMAIL) {
    console.log('Email not configured - would send admin notification');
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Dutch Mystery Portal <portal@ifitaintdutchitaintmuch.com>',
        to: [env.ADMIN_EMAIL],
        subject: 'New Portal Access Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a, #2d1810); color: #fff; padding: 20px; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #FF9500; margin: 0; text-shadow: 0 0 10px #FF9500;">Dutch Mystery Portal</h1>
              <h2 style="color: #00BFFF; margin: 10px 0 0 0;">New Access Request</h2>
            </div>
            
            <div style="background: rgba(255, 149, 0, 0.1); border: 1px solid rgba(255, 149, 0, 0.3); border-radius: 8px; padding: 20px; margin: 20px 0;">
              <table style="width: 100%; color: #fff;">
                <tr><td style="padding: 8px 0; font-weight: bold; color: #FFD700;">Request ID:</td><td style="padding: 8px 0;">#${requestId}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #FFD700;">Name:</td><td style="padding: 8px 0;">${userData.full_name}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #FFD700;">Email:</td><td style="padding: 8px 0;">${userData.email}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #FFD700;">Phone:</td><td style="padding: 8px 0;">${userData.phone}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #FFD700;">Country:</td><td style="padding: 8px 0;">${userData.country}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #FFD700;">Submitted:</td><td style="padding: 8px 0;">${new Date().toLocaleString()}</td></tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://ifitaintdutchitaintmuch.com/admin" 
                 style="background: linear-gradient(135deg, #FF9500, #FFD700); color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Review in Admin Dashboard
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: rgba(255, 255, 255, 0.6); font-size: 12px;">
              <p>This email was sent automatically by the Dutch Mystery Portal system.</p>
            </div>
          </div>
        `
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Email API error: ${error}`);
    }

    console.log(`Admin notification sent for request ${requestId}`);
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    throw error;
  }
}

async function sendUserConfirmation(userData, env) {
  if (!env.RESEND_API_KEY) {
    console.log('Email not configured - would send user confirmation');
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Dutch Mystery Portal <portal@ifitaintdutchitaintmuch.com>',
        to: [userData.email],
        subject: 'Your Dutch Mystery Portal Access Request Received',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a, #2d1810); color: #fff; padding: 20px; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #FF9500; margin: 0; text-shadow: 0 0 10px #FF9500;">Dutch Mystery Portal</h1>
              <h2 style="color: #00BFFF; margin: 10px 0 0 0;">Access Request Received</h2>
            </div>
            
            <div style="background: rgba(255, 149, 0, 0.1); border: 1px solid rgba(255, 149, 0, 0.3); border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="color: #fff; line-height: 1.6; margin: 0 0 15px 0;">Dear <strong style="color: #FFD700;">${userData.full_name}</strong>,</p>
              
              <p style="color: #fff; line-height: 1.6; margin: 0 0 15px 0;">We've received your request to access the <strong style="color: #FF9500;">Dutch Mystery Portal</strong>. Our portal guardians will review your application and respond within <strong style="color: #00BFFF;">48 hours</strong>.</p>
              
              <p style="color: #fff; line-height: 1.6; margin: 0 0 15px 0;">You'll receive an email notification once your request has been processed.</p>
              
              <div style="background: rgba(0, 191, 255, 0.1); border-left: 4px solid #00BFFF; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #00BFFF; margin: 0; font-style: italic;">"Enter the void if you dare... Dutch mysteries await the initiated."</p>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: rgba(255, 255, 255, 0.8); margin: 0;">Thank you for your interest in joining our mysterious realm!</p>
              <p style="color: #FF9500; font-weight: bold; margin: 10px 0 0 0;">The Dutch Mystery Portal Team</p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: rgba(255, 255, 255, 0.6); font-size: 12px;">
              <p>This is an automated confirmation. Please do not reply to this email.</p>
            </div>
          </div>
        `
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Email API error: ${error}`);
    }

    console.log(`Confirmation email sent to ${userData.email}`);
  } catch (error) {
    console.error('Failed to send user confirmation:', error);
    throw error;
  }
}

async function sendStatusUpdateEmail(userData, newStatus, notes, env) {
  if (!env.RESEND_API_KEY) {
    console.log('Email not configured - would send status update');
    return;
  }

  const statusConfig = {
    approved: {
      subject: 'Welcome to the Dutch Mystery Portal!',
      color: '#28A745',
      icon: 'Approved',
      title: 'Access Approved!',
      message: 'Congratulations! Your access request has been <strong style="color: #28A745;">approved</strong>. You now have access to our exclusive Dutch mysteries, premium merchandise, and underground Amsterdam experiences.',
      nextSteps: `
        <div style="background: rgba(40, 167, 69, 0.1); border: 1px solid rgba(40, 167, 69, 0.3); border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #28A745; margin: 0 0 15px 0;">What's Next?</h3>
          <ul style="color: #fff; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li>Visit our exclusive portal at <a href="https://ifitaintdutchitaintmuch.com" style="color: #FFD700;">ifitaintdutchitaintmuch.com</a></li>
            <li>Check your email for login credentials (arriving separately)</li>
            <li>Explore our heritage collection and underground events</li>
            <li>Join our exclusive community of Dutch mystery enthusiasts</li>
          </ul>
        </div>
      `
    },
    rejected: {
      subject: 'Dutch Mystery Portal Access Decision',
      color: '#DC3545',
      icon: 'Decision',
      title: 'Access Decision',
      message: 'Thank you for your interest in the Dutch Mystery Portal. Unfortunately, your access request was <strong style="color: #DC3545;">not approved</strong> at this time.',
      nextSteps: `
        <div style="background: rgba(220, 53, 69, 0.1); border: 1px solid rgba(220, 53, 69, 0.3); border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #DC3545; margin: 0 0 15px 0;">Next Steps</h3>
          <p style="color: #fff; line-height: 1.6; margin: 0;">You're welcome to reapply in the future. Keep following our journey on social media for updates on when applications reopen.</p>
        </div>
      `
    }
  };

  const config = statusConfig[newStatus];
  if (!config) return;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Dutch Mystery Portal <portal@ifitaintdutchitaintmuch.com>',
        to: [userData.email],
        subject: config.subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a, #2d1810); color: #fff; padding: 20px; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #FF9500; margin: 0; text-shadow: 0 0 10px #FF9500;">Dutch Mystery Portal</h1>
              <h2 style="color: ${config.color}; margin: 10px 0 0 0;">${config.title}</h2>
            </div>
            
            <div style="background: rgba(255, 149, 0, 0.1); border: 1px solid rgba(255, 149, 0, 0.3); border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="color: #fff; line-height: 1.6; margin: 0 0 15px 0;">Dear <strong style="color: #FFD700;">${userData.full_name}</strong>,</p>
              
              <p style="color: #fff; line-height: 1.6; margin: 0 0 15px 0;">${config.message}</p>
              
              ${notes ? `
                <div style="background: rgba(255, 215, 0, 0.1); border-left: 4px solid #FFD700; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="color: #FFD700; margin: 0 0 5px 0; font-weight: bold;">Additional Notes:</p>
                  <p style="color: #fff; margin: 0; font-style: italic;">${notes}</p>
                </div>
              ` : ''}
            </div>
            
            ${config.nextSteps}
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #FF9500; font-weight: bold; margin: 0;">The Dutch Mystery Portal Team</p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: rgba(255, 255, 255, 0.6); font-size: 12px;">
              <p>This is an automated notification. Please do not reply to this email.</p>
            </div>
          </div>
        `
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Email API error: ${error}`);
    }

    console.log(`Status update email sent to ${userData.email}: ${newStatus}`);
  } catch (error) {
    console.error('Failed to send status update email:', error);
    throw error;
  }
}

/**
 * Utility functions
 */
function convertToCSV(data) {
  if (!data.length) return '';

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');

  return csvContent;
}

function validateAccessRequest(data) {
  if (!data.fullName || typeof data.fullName !== 'string' || data.fullName.trim().length < 2) {
    return 'Full name is required and must be at least 2 characters';
  }

  if (!data.email || !isValidEmail(data.email)) {
    return 'Valid email address is required';
  }

  if (!data.phone || typeof data.phone !== 'string' || data.phone.trim().length < 8) {
    return 'Valid phone number is required';
  }

  if (!data.country || typeof data.country !== 'string' || data.country.trim().length < 2) {
    return 'Country selection is required';
  }

  if (data.fullName.length > 100) {
    return 'Full name must be less than 100 characters';
  }

  if (data.email.length > 150) {
    return 'Email address must be less than 150 characters';
  }

  if (data.phone.length > 20) {
    return 'Phone number must be less than 20 characters';
  }

  return null;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeString(input) {
  if (typeof input !== 'string') return null;
  return input.trim().replace(/[<>]/g, '');
}

function sanitizeEmail(email) {
  if (typeof email !== 'string') return null;
  return email.trim().toLowerCase().replace(/[<>]/g, '');
}

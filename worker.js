/**
 * Complete Enhanced Cloudflare Worker for Dutch Mystery Portal
 * Features: Admin Authentication, Blog Management, Medium-Style Preview System
 * NO R2 REQUIRED - Content stored in D1 database
 */

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-Token',
  'Access-Control-Max-Age': '86400',
};

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // Public API routes
      if (path === '/api/access-request' && request.method === 'POST') {
        return await handleAccessRequest(request, env);
      }

      if (path === '/api/health' && request.method === 'GET') {
        return await handleHealthCheck(env);
      }

      // Blog content routes (with preview system)
      if (path.startsWith('/blog/') || path === '/ade-2025-guide') {
        return await handleBlogContent(request, env);
      }

      // Admin authentication routes
      if (path === '/api/admin/login' && request.method === 'POST') {
        return await handleAdminLogin(request, env);
      }

      if (path === '/api/admin/logout' && request.method === 'POST') {
        return await handleAdminLogout(request, env);
      }

      if (path === '/api/admin/verify' && request.method === 'GET') {
        return await handleAdminVerify(request, env);
      }

      // Protected admin routes
      if (path.startsWith('/api/admin/') || path === '/admin') {
        const authResult = await verifyAdminSession(request, env);
        if (!authResult.success) {
          if (path === '/admin') {
            // Show admin login page instead of API error
            return await handleAdminDashboard(request, env);
          }
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
      }

      // Admin dashboard
      if (path === '/admin' && request.method === 'GET') {
        return await handleAdminDashboard(request, env);
      }

      // Blog management routes
      if (path === '/api/admin/blogs' && request.method === 'GET') {
        return await handleGetBlogs(request, env);
      }

      if (path === '/api/admin/blogs' && request.method === 'POST') {
        return await handleCreateBlog(request, env);
      }

      if (path.startsWith('/api/admin/blogs/') && request.method === 'PUT') {
        return await handleUpdateBlog(request, env);
      }

      if (path.startsWith('/api/admin/blogs/') && request.method === 'DELETE') {
        return await handleDeleteBlog(request, env);
      }

      // Access request management
      if (path === '/api/admin/requests' && request.method === 'GET') {
        return await handleGetRequests(request, env);
      }

      if (path === '/api/admin/requests/update-status' && request.method === 'POST') {
        return await handleUpdateStatus(request, env);
      }

      if (path === '/api/admin/stats' && request.method === 'GET') {
        return await handleStats(request, env);
      }

      return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  },
};

/**
 * Enhanced Blog Content Management - Medium-Style Preview System
 */
async function handleBlogContent(request, env) {
  try {
    const url = new URL(request.url);
    let slug = url.pathname;
    
    // Handle legacy route
    if (slug === '/ade-2025-guide') {
      slug = 'ade-2025-guide';
    } else if (slug.startsWith('/blog/')) {
      slug = slug.replace('/blog/', '');
    }

    // Get blog post from database including content
    const blogPost = await env.DB.prepare(`
      SELECT * FROM blog_posts 
      WHERE slug = ? AND status = 'published'
    `).bind(slug).first();

    if (!blogPost) {
      return new Response('Blog post not found', { status: 404 });
    }

    // Check authentication
    const authCookie = request.headers.get('Cookie') || '';
    const sessionAuth = request.headers.get('X-Session-Token');
    const hasAuth = authCookie.includes('dutchPortalAuth=authenticated') || sessionAuth;

    // If requires auth and user is not authenticated
    if (blogPost.requires_auth && !hasAuth) {
      
      // If has preview content, show preview version
      if (blogPost.is_public_preview && blogPost.preview_content) {
        const previewHtml = generatePreviewPage(blogPost);
        
        // Track preview view for SEO
        await trackContentView(request, env, 'blog_preview', slug);
        
        return new Response(previewHtml, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
            ...corsHeaders,
          },
        });
      } else {
        // No preview available - redirect to homepage with context
        const redirectUrl = `/?login=required&content=${encodeURIComponent(blogPost.title)}&returnTo=${encodeURIComponent(url.pathname)}`;
        
        return new Response(null, {
          status: 302,
          headers: {
            'Location': redirectUrl,
            ...corsHeaders,
          },
        });
      }
    }

    // User is authenticated or content is public - show full content
    let content = blogPost.content_html;
    
    if (!content) {
      content = generateBlogTemplate(blogPost);
    }

    // Track full content view
    await trackContentView(request, env, 'blog_post', slug);

    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('Blog content error:', error);
    return new Response('Server error loading blog content', { status: 500 });
  }
}

function generatePreviewPage(blogPost) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${blogPost.title} | Dutch Mystery Portal</title>
        <meta name="description" content="${blogPost.description || 'Exclusive content from the Dutch Mystery Portal'}">
        <meta name="keywords" content="Amsterdam, techno, ADE, underground, Dutch culture, electronic music">
        
        <!-- Open Graph for Social Sharing -->
        <meta property="og:title" content="${blogPost.title}">
        <meta property="og:description" content="${blogPost.description}">
        <meta property="og:type" content="article">
        <meta property="og:url" content="https://ifitaintdutchitaintmuch.com/blog/${blogPost.slug}">
        <meta property="og:site_name" content="Dutch Mystery Portal">
        
        <!-- Twitter Card -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${blogPost.title}">
        <meta name="twitter:description" content="${blogPost.description}">
        
        <!-- Structured Data for SEO -->
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "${blogPost.title}",
          "description": "${blogPost.description}",
          "author": {
            "@type": "Organization",
            "name": "${blogPost.author}"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Dutch Mystery Portal"
          },
          "datePublished": "${blogPost.published_at}",
          "dateModified": "${blogPost.updated_at || blogPost.published_at}",
          "articleSection": "${blogPost.category}",
          "url": "https://ifitaintdutchitaintmuch.com/blog/${blogPost.slug}"
        }
        </script>
        
        <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="/css/enhanced-style.css">
        
        <style>
          .blog-container {
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem;
            min-height: 100vh;
            background: linear-gradient(135deg, #000, #111);
            color: #fff;
          }
          .blog-header {
            text-align: center;
            margin-bottom: 3rem;
            padding: 2rem 0;
            border-bottom: 2px solid #FF9500;
          }
          .blog-title {
            font-family: 'Orbitron', sans-serif;
            font-size: clamp(2rem, 5vw, 3.5rem);
            color: #FF9500;
            text-shadow: 0 0 20px #FF9500;
            margin-bottom: 1rem;
            text-transform: uppercase;
          }
          .nav-back {
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(255, 149, 0, 0.1);
            border: 1px solid rgba(255, 149, 0, 0.3);
            color: #FF9500;
            padding: 0.8rem 1.5rem;
            border-radius: 8px;
            text-decoration: none;
            font-family: 'Rajdhani', sans-serif;
            font-weight: 600;
            transition: all 0.3s ease;
            z-index: 1000;
          }
          .nav-back:hover {
            background: rgba(255, 149, 0, 0.2);
            transform: translateY(-2px);
          }
          .preview-content {
            font-size: 1.1rem;
            line-height: 1.8;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 3rem;
          }
          .login-cta {
            background: linear-gradient(145deg, rgba(255, 149, 0, 0.15), rgba(0, 191, 255, 0.1));
            border: 2px solid rgba(255, 149, 0, 0.4);
            border-radius: 20px;
            padding: 3rem 2rem;
            text-align: center;
            margin: 3rem 0;
            backdrop-filter: blur(15px);
            position: relative;
            overflow: hidden;
          }
          .login-cta::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255, 149, 0, 0.1), transparent);
            animation: shimmer 3s infinite;
          }
          .login-cta h3 {
            color: #FF9500;
            font-size: 1.8rem;
            margin-bottom: 1rem;
            font-family: 'Orbitron', sans-serif;
            text-shadow: 0 0 15px #FF9500;
          }
          .login-cta p {
            margin-bottom: 2rem;
            font-size: 1.1rem;
            line-height: 1.6;
          }
          .cta-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
          }
          .cta-button {
            background: linear-gradient(135deg, #FF9500, #FFD700);
            color: #000;
            text-decoration: none;
            padding: 1rem 2rem;
            border-radius: 10px;
            font-weight: 700;
            font-family: 'Rajdhani', sans-serif;
            text-transform: uppercase;
            transition: all 0.3s ease;
            position: relative;
            z-index: 2;
            min-width: 150px;
            text-align: center;
          }
          .cta-button:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 10px 25px rgba(255, 149, 0, 0.4);
          }
          .cta-button.secondary {
            background: linear-gradient(135deg, rgba(0, 191, 255, 0.2), rgba(0, 191, 255, 0.1));
            color: #00BFFF;
            border: 2px solid #00BFFF;
          }
          .cta-button.secondary:hover {
            background: linear-gradient(135deg, rgba(0, 191, 255, 0.3), rgba(0, 191, 255, 0.2));
          }
          .preview-badge {
            background: rgba(255, 149, 0, 0.2);
            color: #FFD700;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 1rem;
            display: inline-block;
            border: 1px solid rgba(255, 215, 0, 0.3);
          }
          .content-teaser {
            margin: 2rem 0;
            padding: 2rem;
            background: rgba(0, 191, 255, 0.1);
            border-left: 4px solid #00BFFF;
            border-radius: 0 10px 10px 0;
          }
          .content-teaser h4 {
            color: #00BFFF;
            margin-bottom: 1rem;
            font-family: 'Orbitron', sans-serif;
          }
          .content-teaser ul {
            list-style: none;
            padding: 0;
          }
          .content-teaser li {
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(0, 191, 255, 0.2);
            position: relative;
            padding-left: 2rem;
          }
          .content-teaser li:before {
            content: "→";
            position: absolute;
            left: 0;
            color: #00BFFF;
            font-weight: bold;
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          }
          
          @media (max-width: 768px) {
            .blog-container { padding: 1rem; }
            .login-cta { padding: 2rem 1rem; }
            .cta-buttons { flex-direction: column; align-items: center; }
            .cta-button { width: 100%; max-width: 250px; }
          }
        </style>
    </head>
    <body>
        <a href="/" class="nav-back">← Portal Home</a>
        
        <div class="blog-container">
            <header class="blog-header">
                <div class="preview-badge">Preview Access</div>
                <h1 class="blog-title">${blogPost.title}</h1>
                <p style="color: #00BFFF; font-size: 1.2rem;">${blogPost.description}</p>
                <div style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.6); margin-top: 1rem;">
                  Published: ${new Date(blogPost.published_at).toLocaleDateString()} | 
                  Category: ${blogPost.category}
                </div>
            </header>
            
            <article class="preview-content">
                ${blogPost.preview_content}
            </article>
            
            <div class="login-cta">
                <h3>Continue Reading in the Void</h3>
                <p>Unlock the complete ${blogPost.title} with exclusive insider information, hidden venues, and underground access that only initiated members can access.</p>
                
                <div class="content-teaser">
                    <h4>What Awaits Beyond:</h4>
                    <ul>
                        <li>Complete venue database with secret locations</li>
                        <li>Insider ticket access and VIP experiences</li>
                        <li>Underground party schedules and hidden events</li>
                        <li>Survival guides and pro tips from locals</li>
                        <li>Exclusive community access and networking</li>
                    </ul>
                </div>
                
                <div class="cta-buttons">
                    <a href="/?focus=login" class="cta-button">Login to Portal</a>
                    <a href="/?focus=signup" class="cta-button secondary">Request Access</a>
                </div>
                
                <p style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.7); margin-top: 2rem;">
                    Join the Dutch mystery community and unlock exclusive content, underground events, and heritage collections.
                </p>
            </div>
        </div>
        
        <script src="/js/enhanced-script.js"></script>
    </body>
    </html>
  `;
}

function generateBlogTemplate(blogPost) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${blogPost.title} | Dutch Mystery Portal</title>
        <meta name="description" content="${blogPost.description || 'Exclusive content from the Dutch Mystery Portal'}">
        <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="/css/enhanced-style.css">
        <style>
          .blog-container {
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem;
            min-height: 100vh;
            background: linear-gradient(135deg, #000, #111);
            color: #fff;
          }
          .blog-header {
            text-align: center;
            margin-bottom: 3rem;
            padding: 2rem 0;
            border-bottom: 2px solid #FF9500;
          }
          .blog-title {
            font-family: 'Orbitron', sans-serif;
            font-size: clamp(2rem, 5vw, 3.5rem);
            color: #FF9500;
            text-shadow: 0 0 20px #FF9500;
            margin-bottom: 1rem;
            text-transform: uppercase;
          }
          .nav-back {
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(255, 149, 0, 0.1);
            border: 1px solid rgba(255, 149, 0, 0.3);
            color: #FF9500;
            padding: 0.8rem 1.5rem;
            border-radius: 8px;
            text-decoration: none;
            font-family: 'Rajdhani', sans-serif;
            font-weight: 600;
            transition: all 0.3s ease;
            z-index: 1000;
          }
          .nav-back:hover {
            background: rgba(255, 149, 0, 0.2);
            transform: translateY(-2px);
          }
          .content-placeholder {
            background: rgba(255, 149, 0, 0.1);
            border: 1px solid rgba(255, 149, 0, 0.3);
            border-radius: 10px;
            padding: 2rem;
            text-align: center;
            margin: 2rem 0;
          }
          .admin-link {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 191, 255, 0.1);
            border: 1px solid rgba(0, 191, 255, 0.3);
            color: #00BFFF;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            text-decoration: none;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            z-index: 1000;
          }
          .admin-link:hover {
            background: rgba(0, 191, 255, 0.2);
          }
        </style>
    </head>
    <body>
        <a href="/" class="nav-back">← Portal Home</a>
        <a href="/admin" class="admin-link">Admin</a>
        <div class="blog-container">
            <header class="blog-header">
                <h1 class="blog-title">${blogPost.title}</h1>
                <p style="color: #00BFFF; font-size: 1.2rem;">${blogPost.description}</p>
                <div style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.6); margin-top: 1rem;">
                  Published: ${new Date(blogPost.published_at).toLocaleDateString()} | 
                  Category: ${blogPost.category}
                </div>
            </header>
            <div class="content-placeholder">
                <h3 style="color: #FF9500; margin-bottom: 1rem;">Content Template Ready</h3>
                <p>This ${blogPost.category} content is ready for your custom HTML. Use the admin panel to add your full blog content.</p>
                <p style="margin-top: 1rem; color: rgba(255, 255, 255, 0.7);">
                  <strong>Next Steps:</strong><br>
                  1. Go to <a href="/admin" style="color: #00BFFF;">Admin Panel</a><br>
                  2. Edit this blog post<br>
                  3. Add your custom HTML content<br>
                  4. Save and publish
                </p>
            </div>
        </div>
        <script src="/js/enhanced-script.js"></script>
    </body>
    </html>
  `;
}

/**
 * Admin Authentication Functions
 */
async function handleAdminLogin(request, env) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({
        error: 'Username and password required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get user from database
    const user = await env.DB.prepare(`
      SELECT id, username, password_hash, role, is_active 
      FROM admin_users 
      WHERE username = ? AND is_active = TRUE
    `).bind(username).first();

    if (!user) {
      return new Response(JSON.stringify({
        error: 'Invalid credentials'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Simple password verification (in production, use bcrypt)
    const isValidPassword = user.password_hash === password;
    if (!isValidPassword) {
      return new Response(JSON.stringify({
        error: 'Invalid credentials'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Create session
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_DURATION).toISOString();

    await env.DB.prepare(`
      INSERT INTO admin_sessions (id, user_id, expires_at)
      VALUES (?, ?, ?)
    `).bind(sessionId, user.id, expiresAt).run();

    // Update last login
    await env.DB.prepare(`
      UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(user.id).run();

    return new Response(JSON.stringify({
      success: true,
      sessionToken: sessionId,
      user: {
        username: user.username,
        role: user.role
      },
      expiresAt: expiresAt
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({
      error: 'Login failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

async function handleAdminLogout(request, env) {
  try {
    const sessionToken = request.headers.get('X-Session-Token');
    
    if (sessionToken) {
      await env.DB.prepare(`
        DELETE FROM admin_sessions WHERE id = ?
      `).bind(sessionToken).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Logout failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

async function handleAdminVerify(request, env) {
  const authResult = await verifyAdminSession(request, env);
  
  return new Response(JSON.stringify(authResult), {
    status: authResult.success ? 200 : 401,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

async function verifyAdminSession(request, env) {
  try {
    const sessionToken = request.headers.get('X-Session-Token');
    
    if (!sessionToken) {
      return { success: false, error: 'No session token' };
    }

    const session = await env.DB.prepare(`
      SELECT s.id, s.user_id, s.expires_at, u.username, u.role
      FROM admin_sessions s
      JOIN admin_users u ON s.user_id = u.id
      WHERE s.id = ? AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = TRUE
    `).bind(sessionToken).first();

    if (!session) {
      return { success: false, error: 'Invalid or expired session' };
    }

    return {
      success: true,
      user: {
        id: session.user_id,
        username: session.username,
        role: session.role
      }
    };
  } catch (error) {
    return { success: false, error: 'Session verification failed' };
  }
}

/**
 * Enhanced Admin Dashboard
 */
async function handleAdminDashboard(request, env) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dutch Mystery Portal - Admin Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Orbitron:wght@400;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #1a1a1a, #2d1810);
            color: #fff;
            min-height: 100vh;
        }
        .login-screen {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .login-form {
            background: rgba(255, 149, 0, 0.1);
            border: 1px solid rgba(255, 149, 0, 0.3);
            border-radius: 15px;
            padding: 3rem;
            max-width: 400px;
            width: 100%;
            text-align: center;
            backdrop-filter: blur(10px);
        }
        .login-form h1 {
            color: #FF9500;
            margin-bottom: 2rem;
            font-size: 1.8rem;
            font-family: 'Orbitron', sans-serif;
            text-shadow: 0 0 15px #FF9500;
        }
        .form-group {
            margin-bottom: 1.5rem;
            text-align: left;
        }
        .form-group label {
            display: block;
            color: #FFD700;
            margin-bottom: 0.5rem;
            font-weight: 600;
        }
        .form-group input {
            width: 100%;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.6);
            border: 1px solid rgba(255, 149, 0, 0.3);
            border-radius: 8px;
            color: #fff;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        .form-group input:focus {
            outline: none;
            border-color: #00BFFF;
            box-shadow: 0 0 10px rgba(0, 191, 255, 0.3);
        }
        .btn {
            background: linear-gradient(135deg, #FF9500, #FFD700);
            color: #000;
            border: none;
            padding: 1rem 2rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 1rem;
            transition: transform 0.2s;
            width: 100%;
        }
        .btn:hover { transform: translateY(-2px); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .header {
            background: rgba(255, 149, 0, 0.1);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 149, 0, 0.3);
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .header h1 { color: #FF9500; font-size: 1.5rem; font-family: 'Orbitron', sans-serif; }
        .nav-tabs {
            display: flex;
            background: rgba(0, 0, 0, 0.3);
            border-bottom: 1px solid rgba(255, 149, 0, 0.3);
            padding: 0 2rem;
        }
        .nav-tab {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            padding: 1rem 1.5rem;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
            border-bottom: 3px solid transparent;
        }
        .nav-tab.active,
        .nav-tab:hover {
            color: #FF9500;
            border-bottom-color: #FF9500;
        }
        .tab-content {
            display: none;
            padding: 2rem;
        }
        .tab-content.active { display: block; }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .stat-card {
            background: rgba(255, 255, 255, 0.05);
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
        .dashboard-content { display: none; }
        .dashboard-content.show { display: block; }
        .user-info {
            display: flex;
            align-items: center;
            gap: 1rem;
            color: #FFD700;
        }
        .error-message {
            color: #ff6b6b;
            background: rgba(255, 107, 107, 0.1);
            border: 1px solid rgba(255, 107, 107, 0.3);
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
        }
        .blog-item {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 149, 0, 0.3);
            border-radius: 10px;
            padding: 1.5rem;
            margin-bottom: 1rem;
        }
        .blog-title {
            color: #FF9500;
            font-size: 1.2rem;
            margin-bottom: 0.5rem;
        }
        .blog-meta {
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.9rem;
            margin-bottom: 1rem;
        }
        .blog-actions {
            display: flex;
            gap: 0.5rem;
        }
        .btn-small {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
            width: auto;
        }
        .btn-secondary {
            background: rgba(0, 191, 255, 0.2);
            color: #00BFFF;
            border: 1px solid #00BFFF;
        }
        .btn-secondary:hover {
            background: rgba(0, 191, 255, 0.3);
        }
        @media (max-width: 768px) {
            .header { flex-direction: column; gap: 1rem; }
            .nav-tabs { flex-wrap: wrap; padding: 0 1rem; }
            .tab-content { padding: 1rem; }
            .stats-grid { grid-template-columns: 1fr 1fr; }
            .blog-actions { flex-direction: column; }
        }
    </style>
</head>
<body>
    <!-- Login Screen -->
    <div id="loginScreen" class="login-screen">
        <div class="login-form">
            <h1>Admin Portal</h1>
            <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 2rem;">Access the Dutch Mystery Control Center</p>
            <form id="adminLoginForm">
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input type="text" id="username" required placeholder="Enter admin username">
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" required placeholder="Enter admin password">
                </div>
                <button type="submit" class="btn" id="loginBtn">
                    <span id="loginBtnText">Enter Portal</span>
                </button>
            </form>
            <div id="loginError" class="error-message" style="display: none;"></div>
            <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid rgba(255, 149, 0, 0.3); font-size: 0.9rem; color: rgba(255, 255, 255, 0.6);">
                <p>Default: admin / DutchMystery2025!</p>
            </div>
        </div>
    </div>

    <!-- Dashboard Content -->
    <div id="dashboardContent" class="dashboard-content">
        <div class="header">
            <h1>Dutch Mystery Admin</h1>
            <div class="user-info">
                <span id="welcomeUser">Welcome Admin</span>
                <button class="btn" onclick="logout()" style="width: auto; padding: 0.5rem 1rem;">Logout</button>
            </div>
        </div>

        <div class="nav-tabs">
            <button class="nav-tab active" onclick="showTab('overview')">Overview</button>
            <button class="nav-tab" onclick="showTab('blogs')">Blog Management</button>
            <button class="nav-tab" onclick="showTab('requests')">Access Requests</button>
        </div>

        <!-- Overview Tab -->
        <div id="overview" class="tab-content active">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number" id="totalRequests">-</div>
                    <div>Total Requests</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="totalBlogs">-</div>
                    <div>Blog Posts</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="pendingRequests">-</div>
                    <div>Pending Requests</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="publishedBlogs">-</div>
                    <div>Published Blogs</div>
                </div>
            </div>
            <div style="background: rgba(255, 149, 0, 0.1); border: 1px solid rgba(255, 149, 0, 0.3); border-radius: 10px; padding: 2rem; text-align: center;">
                <h3 style="color: #FF9500; margin-bottom: 1rem;">Database Setup Complete!</h3>
                <p>Your Dutch Mystery Portal is ready for content management with Medium-style preview system.</p>
                <div style="margin-top: 1rem;">
                    <a href="/ade-2025-guide" target="_blank" style="color: #00BFFF; text-decoration: none; margin: 0 1rem;">View ADE Guide</a>
                    <a href="/" target="_blank" style="color: #00BFFF; text-decoration: none; margin: 0 1rem;">Portal Home</a>
                </div>
            </div>
        </div>

        <!-- Blog Management Tab -->
        <div id="blogs" class="tab-content">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
                <h2 style="color: #FF9500;">Blog Management</h2>
                <button class="btn" onclick="showCreateBlogForm()" style="width: auto; padding: 0.8rem 1.5rem;">+ New Blog Post</button>
            </div>
            <div id="blogsList">Loading blogs...</div>
        </div>

        <!-- Access Requests Tab -->
        <div id="requests" class="tab-content">
            <h2 style="color: #FF9500; margin-bottom: 2rem;">Access Requests</h2>
            <div id="requestsList">Loading requests...</div>
        </div>
    </div>

    <script>
        let sessionToken = localStorage.getItem('adminSessionToken');
        let currentUser = null;

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            if (sessionToken) {
                verifySession();
            } else {
                showLoginScreen();
            }
        });

        // Login functionality
        document.getElementById('adminLoginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const loginBtn = document.getElementById('loginBtn');
            const loginBtnText = document.getElementById('loginBtnText');
            
            loginBtn.disabled = true;
            loginBtnText.textContent = 'Connecting...';
            
            try {
                const response = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    sessionToken = result.sessionToken;
                    currentUser = result.user;
                    localStorage.setItem('adminSessionToken', sessionToken);
                    showDashboard();
                    loadDashboardData();
                } else {
                    showError(result.error || 'Login failed');
                }
            } catch (error) {
                showError('Connection error. Please try again.');
            } finally {
                loginBtn.disabled = false;
                loginBtnText.textContent = 'Enter Portal';
            }
        });

        async function verifySession() {
            try {
                const response = await fetch('/api/admin/verify', {
                    headers: { 'X-Session-Token': sessionToken }
                });
                
                if (response.ok) {
                    const result = await response.json();
                    currentUser = result.user;
                    showDashboard();
                    loadDashboardData();
                } else {
                    localStorage.removeItem('adminSessionToken');
                    sessionToken = null;
                    showLoginScreen();
                }
            } catch (error) {
                showLoginScreen();
            }
        }

        function showLoginScreen() {
            document.getElementById('loginScreen').style.display = 'flex';
            document.getElementById('dashboardContent').classList.remove('show');
        }

        function showDashboard() {
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('dashboardContent').classList.add('show');
            document.getElementById('welcomeUser').textContent = \`Welcome, \${currentUser?.username || 'Admin'}\`;
        }

        function showError(message) {
            const errorEl = document.getElementById('loginError');
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            setTimeout(() => {
                errorEl.style.display = 'none';
            }, 5000);
        }

        async function logout() {
            try {
                await fetch('/api/admin/logout', {
                    method: 'POST',
                    headers: { 'X-Session-Token': sessionToken }
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
            
            localStorage.removeItem('adminSessionToken');
            sessionToken = null;
            currentUser = null;
            showLoginScreen();
        }

        function showTab(tabName) {
            // Update tab buttons
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // Update tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabName).classList.add('active');
            
            // Load tab-specific data
            if (tabName === 'blogs') {
                loadBlogs();
            } else if (tabName === 'requests') {
                loadRequests();
            }
        }

        async function loadDashboardData() {
            try {
                // Load stats
                const statsResponse = await fetch('/api/admin/stats', {
                    headers: { 'X-Session-Token': sessionToken }
                });
                
                if (statsResponse.ok) {
                    const stats = await statsResponse.json();
                    document.getElementById('totalRequests').textContent = stats.total || 0;
                    document.getElementById('pendingRequests').textContent = stats.pending || 0;
                }
                
                // Load blog stats
                const blogsResponse = await fetch('/api/admin/blogs?limit=1000', {
                    headers: { 'X-Session-Token': sessionToken }
                });
                
                if (blogsResponse.ok) {
                    const blogs = await blogsResponse.json();
                    const total = blogs.data?.length || 0;
                    const published = blogs.data?.filter(b => b.status === 'published').length || 0;
                    
                    document.getElementById('totalBlogs').textContent = total;
                    document.getElementById('publishedBlogs').textContent = published;
                }
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            }
        }

        async function loadBlogs() {
            const blogsList = document.getElementById('blogsList');
            blogsList.innerHTML = '<div style="text-align: center; padding: 2rem;">Loading blogs...</div>';
            
            try {
                const response = await fetch('/api/admin/blogs', {
                    headers: { 'X-Session-Token': sessionToken }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    displayBlogs(data.data || []);
                } else {
                    blogsList.innerHTML = '<div style="text-align: center; padding: 2rem; color: #ff6b6b;">Error loading blogs</div>';
                }
            } catch (error) {
                blogsList.innerHTML = '<div style="text-align: center; padding: 2rem; color: #ff6b6b;">Error loading blogs</div>';
            }
        }

        function displayBlogs(blogs) {
            const blogsList = document.getElementById('blogsList');
            
            if (blogs.length === 0) {
                blogsList.innerHTML = \`
                    <div style="text-align: center; padding: 3rem; color: rgba(255, 255, 255, 0.6);">
                        <h3 style="color: #FF9500; margin-bottom: 1rem;">No blog posts yet</h3>
                        <p>Create your first blog post to get started with the Dutch mystery content!</p>
                    </div>
                \`;
                return;
            }
            
            blogsList.innerHTML = blogs.map(blog => \`
                <div class="blog-item">
                    <div class="blog-title">\${blog.title}</div>
                    <div class="blog-meta">
                        <strong>Slug:</strong> /blog/\${blog.slug} | 
                        <strong>Status:</strong> \${blog.status} | 
                        <strong>Category:</strong> \${blog.category} |
                        <strong>Preview:</strong> \${blog.is_public_preview ? 'Yes' : 'No'}
                        \${blog.published_at ? \` | <strong>Published:</strong> \${new Date(blog.published_at).toLocaleDateString()}\` : ''}
                    </div>
                    <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 1rem;">\${blog.description || 'No description'}</p>
                    <div class="blog-actions">
                        <button onclick="viewBlog('\${blog.slug}')" class="btn btn-small btn-secondary">View</button>
                        <button onclick="editBlog(\${blog.id})" class="btn btn-small">Edit</button>
                        <button onclick="toggleStatus(\${blog.id}, '\${blog.status}')" class="btn btn-small">\${blog.status === 'published' ? 'Draft' : 'Publish'}</button>
                    </div>
                </div>
            \`).join('');
        }

        async function loadRequests() {
            const requestsList = document.getElementById('requestsList');
            requestsList.innerHTML = '<div style="text-align: center; padding: 2rem;">Loading access requests...</div>';
            
            try {
                const response = await fetch('/api/admin/requests', {
                    headers: { 'X-Session-Token': sessionToken }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    displayRequests(data.data || []);
                } else {
                    requestsList.innerHTML = '<div style="text-align: center; padding: 2rem; color: #ff6b6b;">Error loading requests</div>';
                }
            } catch (error) {
                requestsList.innerHTML = '<div style="text-align: center; padding: 2rem; color: #ff6b6b;">Error loading requests</div>';
            }
        }

        function displayRequests(requests) {
            const requestsList = document.getElementById('requestsList');
            
            if (requests.length === 0) {
                requestsList.innerHTML = \`
                    <div style="text-align: center; padding: 3rem; color: rgba(255, 255, 255, 0.6);">
                        <h3 style="color: #FF9500; margin-bottom: 1rem;">No access requests yet</h3>
                        <p>Access requests will appear here when users submit them through your portal.</p>
                    </div>
                \`;
                return;
            }
            
            requestsList.innerHTML = requests.map(request => \`
                <div class="blog-item">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div>
                            <div class="blog-title">\${request.full_name}</div>
                            <div class="blog-meta">
                                <strong>Email:</strong> \${request.email} | 
                                <strong>Phone:</strong> \${request.phone} | 
                                <strong>Country:</strong> \${request.country}
                            </div>
                        </div>
                        <div style="padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.8rem; font-weight: 600; background: \${request.status === 'pending' ? 'rgba(255, 193, 7, 0.2)' : request.status === 'approved' ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)'}; color: \${request.status === 'pending' ? '#FFC107' : request.status === 'approved' ? '#28A745' : '#DC3545'};">
                            \${request.status.toUpperCase()}
                        </div>
                    </div>
                    <div style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.6); margin-bottom: 1rem;">
                        Submitted: \${new Date(request.created_at).toLocaleString()}
                    </div>
                    <div class="blog-actions">
                        <button onclick="updateRequestStatus(\${request.id}, 'approved')" class="btn btn-small" style="background: rgba(40, 167, 69, 0.2); color: #28A745; border: 1px solid #28A745;">Approve</button>
                        <button onclick="updateRequestStatus(\${request.id}, 'rejected')" class="btn btn-small" style="background: rgba(220, 53, 69, 0.2); color: #DC3545; border: 1px solid #DC3545;">Reject</button>
                    </div>
                </div>
            \`).join('');
        }

        function viewBlog(slug) {
            window.open(\`/blog/\${slug}\`, '_blank');
        }

        function editBlog(id) {
            alert('Blog editing functionality: Create a form to edit content_html field in database. Coming in next update!');
        }

        function showCreateBlogForm() {
            const slug = prompt('Enter blog slug (URL path, e.g., "my-new-blog"):');
            if (!slug) return;
            
            const title = prompt('Enter blog title:');
            if (!title) return;
            
            const description = prompt('Enter blog description (optional):') || '';
            
            // Create basic blog post
            fetch('/api/admin/blogs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Token': sessionToken
                },
                body: JSON.stringify({
                    slug: slug,
                    title: title,
                    description: description,
                    category: 'general',
                    status: 'draft'
                })
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('Blog post created successfully! Edit it to add content.');
                    loadBlogs();
                } else {
                    alert('Error creating blog post: ' + (result.error || 'Unknown error'));
                }
            })
            .catch(error => {
                alert('Error creating blog post: ' + error.message);
            });
        }

        async function updateRequestStatus(requestId, status) {
            try {
                const response = await fetch('/api/admin/requests/update-status', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Session-Token': sessionToken
                    },
                    body: JSON.stringify({
                        requestId: requestId,
                        status: status
                    })
                });
                
                if (response.ok) {
                    alert(\`Request \${status} successfully!\`);
                    loadRequests();
                } else {
                    alert('Error updating request status');
                }
            } catch (error) {
                alert('Error updating request status: ' + error.message);
            }
        }
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders },
  });
}

/**
 * Blog Management API
 */
async function handleGetBlogs(request, env) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    const offset = parseInt(url.searchParams.get('offset')) || 0;
    const status = url.searchParams.get('status');

    let query = 'SELECT id, slug, title, description, author, category, tags, status, requires_auth, is_public_preview, published_at, created_at, updated_at FROM blog_posts';
    let params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const { results } = await env.DB.prepare(query).bind(...params).all();

    return new Response(JSON.stringify({
      data: results,
      pagination: { limit, offset }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Error fetching blogs:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch blogs' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

async function handleCreateBlog(request, env) {
  try {
    const blog = await request.json();
    
    const result = await env.DB.prepare(`
      INSERT INTO blog_posts (slug, title, description, author, category, tags, status, requires_auth, is_public_preview, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      blog.slug,
      blog.title,
      blog.description || '',
      blog.author || 'Dutch Mystery Portal',
      blog.category || 'general',
      JSON.stringify(blog.tags || []),
      blog.status || 'draft',
      blog.requires_auth !== false ? 1 : 0,
      blog.is_public_preview !== false ? 1 : 0,
      blog.status === 'published' ? new Date().toISOString() : null
    ).run();

    return new Response(JSON.stringify({
      success: true,
      id: result.meta.last_row_id
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Error creating blog:', error);
    return new Response(JSON.stringify({ error: 'Failed to create blog: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

async function handleUpdateBlog(request, env) {
  return new Response(JSON.stringify({ error: 'Blog update not implemented yet' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

async function handleDeleteBlog(request, env) {
  return new Response(JSON.stringify({ error: 'Blog deletion not implemented yet' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

/**
 * Utility Functions
 */
async function trackContentView(request, env, contentType, contentId) {
  try {
    const userAgent = request.headers.get('User-Agent') || '';
    const ip = request.headers.get('CF-Connecting-IP') || '';
    const referrer = request.headers.get('Referer') || '';

    await env.DB.prepare(`
      INSERT INTO content_analytics (content_type, content_id, event_type, user_agent, ip_address, referrer)
      VALUES (?, ?, 'view', ?, ?, ?)
    `).bind(contentType, contentId, userAgent, ip, referrer).run();
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}

// Existing functions remain the same
async function handleAccessRequest(request, env) {
  try {
    const body = await request.json();
    
    if (!body.fullName || !body.email || !body.phone || !body.country) {
      return new Response(JSON.stringify({
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const result = await env.DB.prepare(`
      INSERT INTO access_requests (
        full_name, email, phone, country, request_date, 
        user_agent, referrer, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'), datetime('now'))
    `).bind(
      body.fullName.trim(),
      body.email.trim().toLowerCase(),
      body.phone.trim(),
      body.country,
      body.requestDate || new Date().toISOString(),
      body.userAgent || null,
      body.referrer || null
    ).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Access request submitted successfully',
      requestId: result.meta.last_row_id
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Error handling access request:', error);
    return new Response(JSON.stringify({
      error: 'Server Error',
      message: 'Failed to process access request'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

async function handleHealthCheck(env) {
  try {
    const result = await env.DB.prepare('SELECT 1 as health').first();
    
    return new Response(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: result ? 'connected' : 'disconnected',
      version: '3.1.0-preview-system',
      features: ['admin_auth', 'blog_management', 'medium_style_preview', 'database_content', 'analytics', 'seo_optimization']
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'unhealthy',
      error: error.message
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

async function handleGetRequests(request, env) {
  try {
    const { results } = await env.DB.prepare(`
      SELECT * FROM access_requests ORDER BY created_at DESC LIMIT 100
    `).all();

    return new Response(JSON.stringify({ data: results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch requests' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

async function handleUpdateStatus(request, env) {
  try {
    const { requestId, status, notes } = await request.json();
    
    await env.DB.prepare(`
      UPDATE access_requests 
      SET status = ?, notes = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(status, notes || null, requestId).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

async function handleStats(request, env) {
  try {
    const [totalRequests, pendingRequests, approvedRequests] = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) as count FROM access_requests').first(),
      env.DB.prepare('SELECT COUNT(*) as count FROM access_requests WHERE status = "pending"').first(),
      env.DB.prepare('SELECT COUNT(*) as count FROM access_requests WHERE status = "approved"').first()
    ]);

    return new Response(JSON.stringify({
      total: totalRequests.count,
      pending: pendingRequests.count,
      approved: approvedRequests.count
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to get stats' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

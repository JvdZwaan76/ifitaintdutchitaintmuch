/**
 * Cloudflare Worker for Dutch Mystery Portal API
 * Handles access requests and form submissions
 */

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

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

      // Route handling
      if (path === '/api/access-request' && request.method === 'POST') {
        return await handleAccessRequest(request, env);
      }

      if (path === '/api/health' && request.method === 'GET') {
        return await handleHealthCheck(env);
      }

      if (path === '/api/requests' && request.method === 'GET') {
        return await handleGetRequests(request, env);
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
 * Handle access request form submissions
 */
async function handleAccessRequest(request, env) {
  try {
    // Parse request body
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

    // Sanitize and prepare data
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

    // Log successful submission
    console.log(`New access request submitted: ${sanitizedData.email} from ${sanitizedData.country}`);

    // Send notification email (optional - would need email service)
    // await sendNotificationEmail(sanitizedData, env);

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
 * Health check endpoint
 */
async function handleHealthCheck(env) {
  try {
    // Test database connection
    const result = await env.DB.prepare('SELECT 1 as health').first();
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: result ? 'connected' : 'disconnected',
      version: '1.0.0'
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
 * Get access requests (for admin purposes)
 */
async function handleGetRequests(request, env) {
  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 50, 100);
    const offset = Math.max(parseInt(url.searchParams.get('offset')) || 0, 0);
    const status = url.searchParams.get('status');

    let query = `
      SELECT id, full_name, email, phone, country, status, 
             created_at, updated_at 
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

    // Get total count
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
 * Validate access request data
 */
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

  // Length validations
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

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize string input
 */
function sanitizeString(input) {
  if (typeof input !== 'string') return null;
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Sanitize email input
 */
function sanitizeEmail(email) {
  if (typeof email !== 'string') return null;
  return email.trim().toLowerCase().replace(/[<>]/g, '');
}

/**
 * Send notification email (placeholder for future implementation)
 */
async function sendNotificationEmail(data, env) {
  // This would integrate with an email service like SendGrid, Mailgun, etc.
  // For now, just log that we would send an email
  console.log(`Would send notification email for: ${data.email}`);
  
  // Example implementation with a hypothetical email service:
  /*
  if (env.EMAIL_API_KEY) {
    try {
      await fetch('https://api.emailservice.com/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.EMAIL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'admin@ifitaintdutchitaintmuch.com',
          subject: 'New Access Request',
          html: `
            <h2>New Portal Access Request</h2>
            <p><strong>Name:</strong> ${data.full_name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>Country:</strong> ${data.country}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          `
        })
      });
    } catch (error) {
      console.error('Failed to send notification email:', error);
    }
  }
  */
}

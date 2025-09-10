export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Simple health check
    if (url.pathname === '/api/health' || url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: 'Dutch Mystery Portal API is running!',
        database: env.DB ? 'connected' : 'not connected'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Root endpoint
    if (url.pathname === '/') {
      return new Response('Dutch Mystery Portal API - Try /api/health', {
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    return new Response('Not Found', { status: 404 });
  }
};

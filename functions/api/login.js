export async function onRequestPost(context) {
    const { request } = context;
    const body = await request.json();
    const { username, password } = body;

    // Hardcoded credentials for demo (change in production, or use KV/DB)
    if (username === 'admin' && password === 'dutchsecret') {
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else {
        return new Response(JSON.stringify({ success: false }), { status: 401 });
    }
}

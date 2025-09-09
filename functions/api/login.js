export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    const { username, password } = body;

    // Fetch from KV (assume binding 'USERS_KV'; store as JSON { "admin": "dutchsecret" })
    const users = await env.USERS_KV.get('users');
    const userData = users ? JSON.parse(users) : {};

    if (userData[username] === password) {
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else {
        return new Response(JSON.stringify({ success: false }), { status: 401 });
    }
}

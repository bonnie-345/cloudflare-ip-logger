addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);

    if (url.pathname === "/logs") {
        // Retrieve all stored IPs from KV
        const list = await IP_LOGGER_KV.list();
        const logs = [];

        for (const key of list.keys) {
            const timestamp = await IP_LOGGER_KV.get(key.name);
            logs.push({ ip: key.name, timestamp });
        }

        return new Response(JSON.stringify(logs, null, 2), {
            headers: { "Content-Type": "application/json" },
        });
    }

    const ip = request.headers.get("CF-Connecting-IP");
    const timestamp = new Date().toISOString();
    
    // Store the IP in Cloudflare KV
    await IP_LOGGER_KV.put(ip, timestamp);

    return new Response(`Your IP (${ip}) has been logged at ${timestamp}`, { status: 200 });
}

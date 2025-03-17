addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const ip = request.headers.get("CF-Connecting-IP");
    const timestamp = new Date().toISOString();
    
    // Store the IP in Cloudflare KV
    await IP_LOGGER_KV.put(ip, timestamp);

    return new Response(`Your IP (${ip}) has been logged at ${timestamp}`, { status: 200 });
}

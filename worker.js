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
            const rawData = await IP_LOGGER_KV.get(key.name);
            try {
                const data = JSON.parse(rawData); // Ensure valid JSON
                logs.push(data);
            } catch (error) {
                console.error("Invalid JSON in KV:", rawData);
            }
        }

        return new Response(JSON.stringify(logs, null, 2), {
            headers: { "Content-Type": "application/json" },
        });
    }

    const ip = request.headers.get("CF-Connecting-IP") || "Unknown IP";
    const timestamp = new Date().toISOString();

    // Store IP & timestamp with proper JSON formatting
    const key = `log_${Date.now()}`;  // Using timestamp-based unique keys
    const value = JSON.stringify({ ip, timestamp });

    await IP_LOGGER_KV.put(key, value);

    return new Response(`Your IP (${ip}) has been logged at ${timestamp}`, { status: 200 });
}

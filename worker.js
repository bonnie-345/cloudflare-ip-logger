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
            const data = await IP_LOGGER_KV.get(key.name, { type: "json" });
            if (data) {
                logs.push({ key: key.name, ...data });
            }
        }

        return new Response(JSON.stringify(logs, null, 2), {
            headers: { "Content-Type": "application/json" },
        });
    }

    const ip = request.headers.get("CF-Connecting-IP") || "Unknown IP";
    const timestamp = new Date().toISOString();
    const key = `ip_${timestamp.replace(/[:.]/g, "-")}`; // Ensure valid KV key format

    // Get geolocation data from Cloudflare
    const geo = request.cf || {};
    const locationData = {
        ip,
        timestamp,
        country: geo.country || "Unknown",
        city: geo.city || "Unknown",
        region: geo.region || "Unknown",
        latitude: geo.latitude || "Unknown",
        longitude: geo.longitude || "Unknown",
    };

    // Store IP and location details in KV
    await IP_LOGGER_KV.put(key, JSON.stringify(locationData));

    return new Response(
        `Your IP (${ip}) has been logged at ${timestamp} in ${locationData.city}, ${locationData.country}`,
        { status: 200 }
    );
}

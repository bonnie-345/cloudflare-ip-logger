addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const ip = request.headers.get("CF-Connecting-IP");
    return new Response(`Your IP is: ${ip}`, { status: 200 });
}

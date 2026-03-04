export default defineEventHandler((event) => {
    const origin = getHeader(event, 'Origin');
    const headers = {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
        'Access-Control-Allow-Credentials': 'true',
    };

    setHeaders(event, headers);

    if (event.method === 'OPTIONS') {
        return sendNoContent(event, 204);
    }
});

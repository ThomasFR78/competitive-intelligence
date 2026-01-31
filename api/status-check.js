// API pour vérifier le status des URLs concurrentes
// POST /api/status-check - Vérifie une URL

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL required' });
    }

    const startTime = Date.now();

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8'
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(10000)
        });

        const responseTime = Date.now() - startTime;
        const text = await response.text();

        // Check for empty WordPress pages (only if page is small)
        const isEmptyWordPress = text.length < 5000 && (
            text.includes('No posts found') ||
            text.includes('Nothing Found') ||
            text.includes('no-results') ||
            text.includes('WordPress')
        );

        // Check for error pages (only if page is small - real 404s are usually short)
        const isErrorPage = text.length < 10000 && text.includes('404') && (
            text.includes('not found') ||
            text.includes('Page not found') ||
            text.includes('page introuvable')
        );

        let status;
        let error = null;

        if (!response.ok || response.status >= 400) {
            status = 'offline';
            error = `HTTP ${response.status}`;
        } else if (isErrorPage) {
            status = 'warning';
            error = 'Page 404 potentielle';
        } else if (isEmptyWordPress) {
            status = 'warning';
            error = 'Page vide/no content';
        } else if (responseTime > 3000) {
            status = 'warning';
            error = 'Réponse lente';
        } else {
            status = 'online';
        }

        return res.status(200).json({
            success: true,
            url,
            status,
            statusCode: response.status,
            responseTime,
            error,
            contentLength: text.length
        });

    } catch (error) {
        const responseTime = Date.now() - startTime;

        let status = 'error';
        let errorMessage;

        if (error.name === 'TimeoutError' || error.name === 'AbortError') {
            errorMessage = 'Timeout (10s)';
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            status = 'offline';
            errorMessage = 'DNS not found';
        } else if (error.message.includes('ECONNREFUSED')) {
            status = 'offline';
            errorMessage = 'Connection refused';
        } else {
            errorMessage = error.message || 'Connection failed';
        }

        return res.status(200).json({
            success: false,
            url,
            status,
            responseTime,
            error: errorMessage
        });
    }
}

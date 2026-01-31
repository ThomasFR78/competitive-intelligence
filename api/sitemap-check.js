// API pour vérifier les sitemaps des concurrents
// POST /api/sitemap-check - Récupère et analyse un sitemap

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

    const { url, maxSubsitemaps = 30 } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL required' });
    }

    try {
        const result = await fetchAndParseSitemap(url, maxSubsitemaps);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to fetch sitemap',
            message: error.message
        });
    }
}

async function fetchAndParseSitemap(url, maxSubsitemaps) {
    const startTime = Date.now();

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; CI-Bot/1.0; +https://github.com/)',
                'Accept': 'application/xml, text/xml, */*'
            },
            signal: AbortSignal.timeout(15000)
        });

        if (!response.ok) {
            return {
                success: false,
                error: `HTTP ${response.status}`,
                count: 0,
                responseTime: Date.now() - startTime
            };
        }

        const text = await response.text();
        const parsed = parseSitemapXml(text);

        if (parsed.type === 'sitemap') {
            return {
                success: true,
                count: parsed.count,
                type: 'sitemap',
                responseTime: Date.now() - startTime
            };
        }

        // C'est un sitemap index - scanner les sous-sitemaps
        let totalCount = 0;
        const subsitemaps = parsed.sitemaps.slice(0, maxSubsitemaps);
        let fetchedCount = 0;
        const errors = [];

        for (const subUrl of subsitemaps) {
            try {
                const subResponse = await fetch(subUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; CI-Bot/1.0)',
                        'Accept': 'application/xml, text/xml, */*'
                    },
                    signal: AbortSignal.timeout(10000)
                });

                if (subResponse.ok) {
                    const subText = await subResponse.text();
                    const subParsed = parseSitemapXml(subText);
                    if (subParsed.type === 'sitemap') {
                        totalCount += subParsed.count;
                        fetchedCount++;
                    }
                }
            } catch (e) {
                errors.push(subUrl);
            }
        }

        // Extrapoler si on a limité
        if (parsed.sitemaps.length > maxSubsitemaps && fetchedCount > 0) {
            const avgPerSitemap = totalCount / fetchedCount;
            totalCount = Math.round(avgPerSitemap * parsed.sitemaps.length);
        }

        return {
            success: true,
            count: totalCount,
            type: 'index',
            subsitemapsTotal: parsed.sitemaps.length,
            subsitemapsFetched: fetchedCount,
            extrapolated: parsed.sitemaps.length > maxSubsitemaps,
            responseTime: Date.now() - startTime
        };

    } catch (error) {
        return {
            success: false,
            error: error.name === 'TimeoutError' ? 'Timeout (15s)' : error.message,
            count: 0,
            responseTime: Date.now() - startTime
        };
    }
}

function parseSitemapXml(xmlText) {
    // Simple regex-based parsing (works in edge runtime)

    // Check for sitemap index
    const sitemapLocRegex = /<sitemap[^>]*>[\s\S]*?<loc[^>]*>([^<]+)<\/loc>/gi;
    const sitemaps = [];
    let match;
    while ((match = sitemapLocRegex.exec(xmlText)) !== null) {
        sitemaps.push(match[1].trim());
    }

    if (sitemaps.length > 0) {
        return { type: 'index', sitemaps };
    }

    // Count URLs in regular sitemap
    const urlLocRegex = /<url[^>]*>[\s\S]*?<loc[^>]*>[^<]+<\/loc>/gi;
    const urls = xmlText.match(urlLocRegex) || [];

    return { type: 'sitemap', count: urls.length };
}

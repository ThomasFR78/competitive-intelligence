// API pour fetch les vrais RSS des concurrents
// GET /api/news-rss - Récupère les news de GG.deals, AllKeyShop, etc.

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // RSS Feed sources
    const RSS_FEEDS = [
        { name: 'GG.deals', url: 'https://gg.deals/feed/', logo: '🟢' },
        { name: 'AllKeyShop', url: 'https://blog.allkeyshop.com/feed/', logo: '🔵' },
        { name: 'IsThereAnyDeal', url: 'https://isthereanydeal.com/rss/specials/', logo: '🟡' },
        // Add more feeds as needed
    ];

    try {
        const allArticles = [];

        // Fetch all RSS feeds in parallel
        const feedPromises = RSS_FEEDS.map(async (feed) => {
            try {
                const response = await fetch(feed.url, {
                    headers: {
                        'User-Agent': 'CI-Bot/1.0 (Competitive Intelligence Feed Reader)'
                    }
                });

                if (!response.ok) {
                    console.error(`Failed to fetch ${feed.name}: ${response.status}`);
                    return [];
                }

                const xml = await response.text();
                const articles = parseRSS(xml, feed.name, feed.logo);
                return articles;

            } catch (error) {
                console.error(`Error fetching ${feed.name}:`, error.message);
                return [];
            }
        });

        const results = await Promise.all(feedPromises);
        results.forEach(articles => allArticles.push(...articles));

        // Sort by date (newest first)
        allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

        // Categorize articles
        const categorizedArticles = allArticles.map(article => ({
            ...article,
            category: categorizeArticle(article.title)
        }));

        return res.status(200).json({
            success: true,
            count: categorizedArticles.length,
            articles: categorizedArticles.slice(0, 50), // Limit to 50 most recent
            sources: RSS_FEEDS.map(f => f.name),
            lastFetch: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error in news-rss:', error);
        return res.status(500).json({
            error: 'Failed to fetch RSS feeds',
            message: error.message
        });
    }
}

// Simple RSS parser (no external dependencies)
function parseRSS(xml, source, logo) {
    const articles = [];

    // Extract items using regex (works for both RSS and Atom)
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;

    const items = xml.match(itemRegex) || xml.match(entryRegex) || [];

    items.forEach(item => {
        // Extract title
        const titleMatch = item.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
        const title = titleMatch ? cleanText(titleMatch[1]) : '';

        // Extract link
        const linkMatch = item.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i)
            || item.match(/<link[^>]*href=["']([^"']+)["']/i);
        const url = linkMatch ? cleanText(linkMatch[1]) : '';

        // Extract date
        const dateMatch = item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)
            || item.match(/<published[^>]*>([\s\S]*?)<\/published>/i)
            || item.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i);
        const publishedAt = dateMatch ? new Date(cleanText(dateMatch[1])).toISOString() : new Date().toISOString();

        // Extract description
        const descMatch = item.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)
            || item.match(/<summary[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/i)
            || item.match(/<content[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content>/i);
        const description = descMatch ? cleanText(descMatch[1]).substring(0, 200) : '';

        if (title && url) {
            articles.push({
                id: `${source}-${Buffer.from(url).toString('base64').substring(0, 10)}`,
                source,
                logo,
                title,
                url,
                description,
                publishedAt
            });
        }
    });

    return articles;
}

// Clean HTML and CDATA from text
function cleanText(text) {
    return text
        .replace(/<!\[CDATA\[|\]\]>/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
}

// Categorize article based on title keywords
function categorizeArticle(title) {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes('sale') || lowerTitle.includes('deal') || lowerTitle.includes('discount')) {
        return 'sale';
    }
    if (lowerTitle.includes('free') || lowerTitle.includes('giveaway')) {
        return 'free';
    }
    if (lowerTitle.includes('bundle') || lowerTitle.includes('humble')) {
        return 'bundle';
    }
    if (lowerTitle.includes('compare') || lowerTitle.includes('vs') || lowerTitle.includes('best price')) {
        return 'comparison';
    }
    if (lowerTitle.includes('guide') || lowerTitle.includes('how to') || lowerTitle.includes('tips')) {
        return 'guide';
    }
    if (lowerTitle.includes('review') || lowerTitle.includes('analysis')) {
        return 'analysis';
    }
    if (lowerTitle.includes('top') || lowerTitle.includes('best') || lowerTitle.includes('ranking')) {
        return 'ranking';
    }
    if (lowerTitle.includes('new') || lowerTitle.includes('feature') || lowerTitle.includes('update')) {
        return 'feature';
    }

    return 'news';
}

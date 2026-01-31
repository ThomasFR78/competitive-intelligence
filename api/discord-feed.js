// API pour lire les messages Discord du channel CI
// GET /api/discord-feed - Récupère les dernières annonces

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

    const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

    if (!BOT_TOKEN || !CHANNEL_ID) {
        return res.status(500).json({
            error: 'Discord not configured',
            message: 'Missing DISCORD_BOT_TOKEN or DISCORD_CHANNEL_ID environment variables'
        });
    }

    try {
        // Fetch messages from Discord API
        const response = await fetch(
            `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages?limit=50`,
            {
                headers: {
                    'Authorization': `Bot ${BOT_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('Discord API error:', error);
            return res.status(response.status).json({
                error: 'Discord API error',
                details: error
            });
        }

        const messages = await response.json();

        // Parse messages to extract announcement data
        const announcements = messages.map(msg => {
            // Try to parse structured format: [Source] Title\nDescription\n#status #impact
            const lines = msg.content.split('\n');
            const firstLine = lines[0] || '';

            // Extract source from [Source] format
            const sourceMatch = firstLine.match(/^\[([^\]]+)\]/);
            const source = sourceMatch ? sourceMatch[1] : 'Unknown';
            const title = sourceMatch ? firstLine.replace(/^\[[^\]]+\]\s*/, '') : firstLine;

            // Extract description (second line)
            const description = lines[1] || '';

            // Extract tags from last line
            const lastLine = lines[lines.length - 1] || '';
            const statusMatch = lastLine.match(/#(released|beta|announced|in-progress)/i);
            const impactMatch = lastLine.match(/#(critical|high|medium|low)-?impact/i);

            const status = statusMatch ? statusMatch[1].toLowerCase() : 'announced';
            const impact = impactMatch ? impactMatch[1].toLowerCase() : 'medium';

            return {
                id: msg.id,
                source,
                title: title.trim(),
                description: description.trim(),
                status,
                impact,
                timestamp: msg.timestamp,
                author: msg.author?.username || 'Unknown',
                url: `https://discord.com/channels/${msg.guild_id || '@me'}/${CHANNEL_ID}/${msg.id}`
            };
        }).filter(a => a.title); // Filter out empty messages

        return res.status(200).json({
            success: true,
            count: announcements.length,
            announcements,
            lastFetch: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching Discord messages:', error);
        return res.status(500).json({
            error: 'Failed to fetch Discord messages',
            message: error.message
        });
    }
}

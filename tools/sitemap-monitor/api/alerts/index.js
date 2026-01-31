const { supabase } = require('../_lib/supabase');

/**
 * API: Alertes et changements récents
 * GET /api/alerts - Récupère les changements récents (signaux faibles)
 */
module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { category, limit = 50, days = 7 } = req.query;

    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    let query = supabase
        .from('sitemap_changes')
        .select(`
            *,
            competitors (
                id,
                name,
                domain,
                category
            )
        `)
        .gte('detected_at', since.toISOString())
        .order('detected_at', { ascending: false })
        .limit(parseInt(limit));

    if (category) {
        query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });

    // Grouper par type de signal
    const summary = {
        total: data.length,
        by_type: {
            added: data.filter(d => d.change_type === 'added').length,
            removed: data.filter(d => d.change_type === 'removed').length
        },
        by_category: {},
        by_competitor: {}
    };

    data.forEach(change => {
        // Par catégorie
        summary.by_category[change.category] = (summary.by_category[change.category] || 0) + 1;

        // Par concurrent
        const compName = change.competitors?.name || 'Unknown';
        summary.by_competitor[compName] = (summary.by_competitor[compName] || 0) + 1;
    });

    return res.json({
        summary,
        alerts: data
    });
};

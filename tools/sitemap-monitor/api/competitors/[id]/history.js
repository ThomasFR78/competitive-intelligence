const { supabase } = require('../../_lib/supabase');

/**
 * API: Historique des scans d'un concurrent
 * GET /api/competitors/:id/history
 */
module.exports = async (req, res) => {
    const competitorId = parseInt(req.query.id);

    if (req.method === 'GET') {
        const { data: scans, error } = await supabase
            .from('sitemap_scans')
            .select(`
                *,
                sitemap_changes (
                    id,
                    url,
                    change_type,
                    detected_at,
                    page_title,
                    category
                )
            `)
            .eq('competitor_id', competitorId)
            .order('scan_date', { ascending: false })
            .limit(30);

        if (error) return res.status(500).json({ error: error.message });
        return res.json(scans);
    }

    res.status(405).json({ error: 'Method not allowed' });
};

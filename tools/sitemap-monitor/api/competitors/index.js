const { supabase } = require('../_lib/supabase');

/**
 * API: Gestion des concurrents surveillés
 * GET  /api/competitors - Liste tous les concurrents
 * POST /api/competitors - Ajoute un nouveau concurrent
 */
module.exports = async (req, res) => {
    if (req.method === 'GET') {
        const { data: competitors, error } = await supabase
            .from('competitors')
            .select('*')
            .order('name', { ascending: true });

        if (error) return res.status(500).json({ error: error.message });

        // Récupérer le dernier scan pour chaque concurrent
        const { data: latestScans } = await supabase
            .from('sitemap_scans')
            .select('competitor_id, scan_date, total_urls, new_urls, removed_urls')
            .order('scan_date', { ascending: false });

        const latestByCompetitor = {};
        (latestScans || []).forEach(scan => {
            if (!latestByCompetitor[scan.competitor_id]) {
                latestByCompetitor[scan.competitor_id] = scan;
            }
        });

        competitors.forEach(c => {
            c.latest_scan = latestByCompetitor[c.id] || null;
        });

        return res.json(competitors);
    }

    if (req.method === 'POST') {
        const { name, domain, sitemap_url, category } = req.body;

        if (!name || !domain) {
            return res.status(400).json({ error: 'name et domain sont requis' });
        }

        const { data, error } = await supabase
            .from('competitors')
            .insert({
                name,
                domain,
                sitemap_url: sitemap_url || `https://${domain}/sitemap.xml`,
                category: category || 'general',
                active: true
            })
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
};

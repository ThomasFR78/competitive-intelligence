const { supabase } = require('../_lib/supabase');

/**
 * API: Feed du dashboard - Vue consolidée pour True Price Authority
 * GET /api/dashboard/feed
 *
 * Retourne les données nécessaires pour le dashboard TPA:
 * - Résumé des activités concurrentes
 * - Signaux faibles détectés
 * - Métriques clés
 */
module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const now = new Date();
    const last7Days = new Date(now.setDate(now.getDate() - 7)).toISOString();
    const last30Days = new Date(now.setDate(now.getDate() - 23)).toISOString();

    // 1. Récupérer les concurrents actifs
    const { data: competitors } = await supabase
        .from('competitors')
        .select('*')
        .eq('active', true);

    // 2. Récupérer les scans récents
    const { data: recentScans } = await supabase
        .from('sitemap_scans')
        .select('*')
        .gte('scan_date', last7Days)
        .order('scan_date', { ascending: false });

    // 3. Récupérer les changements récents (signaux faibles)
    const { data: recentChanges } = await supabase
        .from('sitemap_changes')
        .select(`
            *,
            competitors (name, domain)
        `)
        .gte('detected_at', last7Days)
        .order('detected_at', { ascending: false })
        .limit(100);

    // 4. Calculer les métriques
    const metrics = {
        competitors_tracked: competitors?.length || 0,
        scans_last_7_days: recentScans?.length || 0,
        total_changes: recentChanges?.length || 0,
        new_pages_detected: recentChanges?.filter(c => c.change_type === 'added').length || 0,
        pages_removed: recentChanges?.filter(c => c.change_type === 'removed').length || 0
    };

    // 5. Identifier les signaux importants
    const signals = [];

    // Signal: Nouveau contenu produit
    const productChanges = recentChanges?.filter(c =>
        c.change_type === 'added' && c.category === 'product'
    ) || [];

    if (productChanges.length > 5) {
        signals.push({
            type: 'alert',
            severity: 'high',
            message: `${productChanges.length} nouvelles pages produits détectées cette semaine`,
            action: 'Analyser les nouveaux produits concurrents'
        });
    }

    // Signal: Promotions détectées
    const promoChanges = recentChanges?.filter(c =>
        c.change_type === 'added' && c.category === 'promotion'
    ) || [];

    if (promoChanges.length > 0) {
        signals.push({
            type: 'opportunity',
            severity: 'medium',
            message: `${promoChanges.length} pages de promotion détectées`,
            action: 'Lancer une contre-campagne'
        });
    }

    // 6. Activité par concurrent
    const activityByCompetitor = {};
    (recentChanges || []).forEach(change => {
        const name = change.competitors?.name || 'Unknown';
        if (!activityByCompetitor[name]) {
            activityByCompetitor[name] = { added: 0, removed: 0 };
        }
        activityByCompetitor[name][change.change_type]++;
    });

    return res.json({
        generated_at: new Date().toISOString(),
        metrics,
        signals,
        activity_by_competitor: activityByCompetitor,
        recent_changes: recentChanges?.slice(0, 20) || [],
        competitors: competitors || []
    });
};

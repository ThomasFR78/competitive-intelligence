const { supabase } = require('../_lib/supabase');
const { XMLParser } = require('fast-xml-parser');

/**
 * API: Déclenche un scan de sitemap (supporte les sitemaps imbriqués)
 * POST /api/scan/trigger { competitor_id }
 *
 * GG.deals utilise un sitemap index - ce handler gère:
 * 1. Sitemap simple (urlset)
 * 2. Sitemap index (sitemapindex) avec sitemaps imbriqués
 */
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { competitor_id } = req.body;

    // 1. Récupérer les infos du concurrent
    const { data: competitor, error: compError } = await supabase
        .from('competitors')
        .select('*')
        .eq('id', competitor_id)
        .single();

    if (compError || !competitor) {
        return res.status(404).json({ error: 'Concurrent non trouvé' });
    }

    try {
        console.log(`[SCAN] Démarrage scan pour ${competitor.name}`);

        // 2. Récupérer toutes les URLs (gère les sitemaps imbriqués)
        const currentUrls = await fetchAllUrls(competitor.sitemap_url);
        console.log(`[SCAN] ${currentUrls.length} URLs trouvées`);

        // 3. Récupérer le dernier scan
        const { data: lastScan } = await supabase
            .from('sitemap_scans')
            .select('id, urls_snapshot')
            .eq('competitor_id', competitor_id)
            .order('scan_date', { ascending: false })
            .limit(1)
            .single();

        const previousUrls = lastScan?.urls_snapshot || [];

        // 4. Détecter les changements
        const newUrls = currentUrls.filter(u => !previousUrls.includes(u));
        const removedUrls = previousUrls.filter(u => !currentUrls.includes(u));

        console.log(`[SCAN] +${newUrls.length} nouvelles, -${removedUrls.length} supprimées`);

        // 5. Créer l'enregistrement du scan
        const { data: scan, error: scanError } = await supabase
            .from('sitemap_scans')
            .insert({
                competitor_id,
                total_urls: currentUrls.length,
                new_urls: newUrls.length,
                removed_urls: removedUrls.length,
                urls_snapshot: currentUrls
            })
            .select()
            .single();

        if (scanError) throw scanError;

        // 6. Enregistrer les changements détectés (limité pour éviter surcharge)
        const changes = [
            ...newUrls.slice(0, 500).map(url => ({
                scan_id: scan.id,
                competitor_id,
                url,
                change_type: 'added',
                category: categorizeGGDealsUrl(url)
            })),
            ...removedUrls.slice(0, 100).map(url => ({
                scan_id: scan.id,
                competitor_id,
                url,
                change_type: 'removed',
                category: categorizeGGDealsUrl(url)
            }))
        ];

        if (changes.length > 0) {
            await supabase.from('sitemap_changes').insert(changes);
        }

        return res.json({
            success: true,
            scan_id: scan.id,
            total_urls: currentUrls.length,
            new_urls: newUrls.length,
            removed_urls: removedUrls.length,
            sample_new: newUrls.slice(0, 5),
            sample_removed: removedUrls.slice(0, 5)
        });

    } catch (error) {
        console.error('[SCAN] Erreur:', error);
        return res.status(500).json({
            error: 'Erreur lors du scan',
            details: error.message
        });
    }
};

/**
 * Récupère toutes les URLs d'un sitemap (gère les index imbriqués)
 * @param {string} sitemapUrl - URL du sitemap
 * @param {number} depth - Profondeur de récursion actuelle
 * @returns {Promise<string[]>} - Liste des URLs
 */
async function fetchAllUrls(sitemapUrl, depth = 0) {
    // Protection contre récursion infinie
    if (depth > 3) {
        console.log(`[SCAN] Profondeur max atteinte pour ${sitemapUrl}`);
        return [];
    }

    try {
        const response = await fetch(sitemapUrl, {
            headers: { 'User-Agent': 'CI-Monitor/1.0 (+https://example.com/bot)' },
            timeout: 30000
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} pour ${sitemapUrl}`);
        }

        const xml = await response.text();
        const parser = new XMLParser();
        const parsed = parser.parse(xml);

        let allUrls = [];

        // Cas 1: Sitemap Index (contient d'autres sitemaps)
        if (parsed.sitemapindex?.sitemap) {
            const sitemaps = Array.isArray(parsed.sitemapindex.sitemap)
                ? parsed.sitemapindex.sitemap
                : [parsed.sitemapindex.sitemap];

            console.log(`[SCAN] Sitemap index: ${sitemaps.length} sous-sitemaps (depth=${depth})`);

            // Récupérer les URLs de chaque sous-sitemap (par lots pour éviter surcharge)
            const batchSize = 5;
            for (let i = 0; i < sitemaps.length; i += batchSize) {
                const batch = sitemaps.slice(i, i + batchSize);
                const results = await Promise.all(
                    batch.map(s =>
                        fetchAllUrls(s.loc, depth + 1)
                            .catch(err => {
                                console.error(`[SCAN] Erreur sous-sitemap ${s.loc}:`, err.message);
                                return [];
                            })
                    )
                );
                allUrls = allUrls.concat(results.flat());
            }
        }

        // Cas 2: Sitemap simple (contient des URLs)
        if (parsed.urlset?.url) {
            const urls = Array.isArray(parsed.urlset.url)
                ? parsed.urlset.url
                : [parsed.urlset.url];

            allUrls = allUrls.concat(urls.map(u => u.loc).filter(Boolean));
        }

        return allUrls;

    } catch (error) {
        console.error(`[SCAN] Erreur fetch ${sitemapUrl}:`, error.message);
        return [];
    }
}

/**
 * Catégorise une URL GG.deals spécifiquement
 */
function categorizeGGDealsUrl(url) {
    const lowerUrl = url.toLowerCase();

    // Catégories spécifiques GG.deals
    if (lowerUrl.includes('/game/')) return 'game';
    if (lowerUrl.includes('/dlc/')) return 'dlc';
    if (lowerUrl.includes('/pack/') || lowerUrl.includes('/bundle/')) return 'bundle';
    if (lowerUrl.includes('/news/') || lowerUrl.includes('/blog/')) return 'content';
    if (lowerUrl.includes('/deals/')) return 'deals';
    if (lowerUrl.includes('/store/')) return 'store';
    if (lowerUrl.includes('/region/') || lowerUrl.includes('/eu/') || lowerUrl.includes('/us/')) return 'region';
    if (lowerUrl.includes('/preorder')) return 'preorder';
    if (lowerUrl.includes('/free')) return 'free';

    return 'other';
}

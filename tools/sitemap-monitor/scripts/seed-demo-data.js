/**
 * Script de génération de données de démonstration
 * Intelligence Concurrentielle - Sitemap Monitor
 *
 * FOCUS: GG.deals uniquement (simplicité d'abord)
 *
 * Usage: node scripts/seed-demo-data.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// Focus GG.deals uniquement
const COMPETITORS = [
    {
        name: 'GG.deals',
        domain: 'gg.deals',
        sitemap_url: 'https://gg.deals/sitemap.xml',
        category: 'comparator',
        notes: 'Comparateur de prix principal - sitemap index avec sous-sitemaps'
    }
];

// Jeux populaires (réalistes pour GG.deals)
const GAMES = [
    'GTA VI', 'FIFA 26', 'EA Sports FC 26', 'Call of Duty Black Ops 7',
    'Elden Ring Shadow of the Erdtree', 'Starfield Shattered Space',
    'Hogwarts Legacy', 'Spider-Man 2', 'God of War Ragnarok',
    'Cyberpunk 2077 Phantom Liberty', 'Red Dead Redemption 2',
    'Assassins Creed Shadows', 'Final Fantasy XVI', 'Baldurs Gate 3',
    'Diablo IV', 'The Witcher 4', 'Monster Hunter Wilds'
];

// Catégories GG.deals
const CATEGORIES = ['game', 'dlc', 'bundle', 'deals', 'preorder', 'free'];

// Stores référencés sur GG.deals
const STORES = ['Steam', 'Epic', 'GOG', 'Humble', 'Fanatical', 'Green Man Gaming', 'Eneba', 'G2A', 'Kinguin', 'CDKeys'];

async function seedData() {
    console.log('🚀 Génération de données démo GG.deals...\n');

    // 1. Créer le concurrent GG.deals
    console.log('📦 Configuration GG.deals...');
    const { data: competitors, error: compError } = await supabase
        .from('competitors')
        .upsert(COMPETITORS, { onConflict: 'domain' })
        .select();

    if (compError) {
        console.error('Erreur:', compError);
        return;
    }

    const ggdeals = competitors[0];
    console.log(`   ✓ ${ggdeals.name} configuré (ID: ${ggdeals.id})\n`);

    // 2. Générer des scans pour les 14 derniers jours
    console.log('📊 Génération des scans historiques...');

    const scans = [];
    let totalUrls = 45000; // GG.deals a beaucoup de pages

    for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
        const scanDate = new Date();
        scanDate.setDate(scanDate.getDate() - daysAgo);
        scanDate.setHours(6, 0, 0, 0); // Scan quotidien à 6h

        // Croissance naturelle du sitemap
        const newUrls = 20 + Math.floor(Math.random() * 50);
        const removedUrls = Math.floor(Math.random() * 10);
        totalUrls = totalUrls + newUrls - removedUrls;

        scans.push({
            competitor_id: ggdeals.id,
            scan_date: scanDate.toISOString(),
            total_urls: totalUrls,
            new_urls: newUrls,
            removed_urls: removedUrls,
            scan_duration_ms: 15000 + Math.floor(Math.random() * 10000)
        });
    }

    const { data: insertedScans, error: scanError } = await supabase
        .from('sitemap_scans')
        .insert(scans)
        .select();

    if (scanError) {
        console.error('Erreur scans:', scanError);
        return;
    }
    console.log(`   ✓ ${insertedScans.length} scans créés\n`);

    // 3. Générer des changements détaillés
    console.log('🔍 Génération des changements détectés...');

    const allChanges = [];

    for (const scan of insertedScans) {
        // Nouvelles pages
        for (let i = 0; i < scan.new_urls; i++) {
            const game = GAMES[Math.floor(Math.random() * GAMES.length)];
            const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
            const slug = game.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const store = STORES[Math.floor(Math.random() * STORES.length)];

            let url;
            switch (category) {
                case 'game':
                    url = `https://gg.deals/game/${slug}/`;
                    break;
                case 'dlc':
                    url = `https://gg.deals/dlc/${slug}-dlc-pack-${Math.floor(Math.random() * 5) + 1}/`;
                    break;
                case 'bundle':
                    url = `https://gg.deals/pack/${slug}-collection/`;
                    break;
                case 'deals':
                    url = `https://gg.deals/deals/?store=${store.toLowerCase().replace(/\s/g, '')}`;
                    break;
                case 'preorder':
                    url = `https://gg.deals/game/${slug}/?filter=preorder`;
                    break;
                case 'free':
                    url = `https://gg.deals/game/${slug}/?filter=free`;
                    break;
                default:
                    url = `https://gg.deals/game/${slug}/`;
            }

            allChanges.push({
                scan_id: scan.id,
                competitor_id: ggdeals.id,
                url,
                change_type: 'added',
                detected_at: scan.scan_date,
                page_title: `${game} - Best Deals`,
                category,
                priority: category === 'preorder' || category === 'deals' ? 'high' : 'normal'
            });
        }

        // Pages supprimées (rares, souvent des promos expirées)
        for (let i = 0; i < scan.removed_urls; i++) {
            allChanges.push({
                scan_id: scan.id,
                competitor_id: ggdeals.id,
                url: `https://gg.deals/deals/expired-deal-${Math.random().toString(36).substr(2, 8)}/`,
                change_type: 'removed',
                detected_at: scan.scan_date,
                category: 'deals',
                priority: 'normal'
            });
        }
    }

    // Insérer par lots
    const batchSize = 100;
    for (let i = 0; i < allChanges.length; i += batchSize) {
        const batch = allChanges.slice(i, i + batchSize);
        const { error } = await supabase.from('sitemap_changes').insert(batch);
        if (error) console.error('Erreur batch:', error);
    }

    console.log(`   ✓ ${allChanges.length} changements créés\n`);

    // Résumé
    console.log('═══════════════════════════════════════');
    console.log('✅ DONNÉES DÉMO GÉNÉRÉES');
    console.log('═══════════════════════════════════════');
    console.log(`📊 Source: GG.deals`);
    console.log(`📅 Période: 14 derniers jours`);
    console.log(`🔄 Scans: ${insertedScans.length}`);
    console.log(`➕ Nouvelles pages: ${allChanges.filter(c => c.change_type === 'added').length}`);
    console.log(`➖ Pages retirées: ${allChanges.filter(c => c.change_type === 'removed').length}`);
    console.log('═══════════════════════════════════════');
}

seedData().catch(console.error);

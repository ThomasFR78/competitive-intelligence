const { supabase } = require('./_lib/supabase');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { data: offers } = await supabase.from('offers').select('*');
    const { data: checks } = await supabase.from('price_checks').select('*');

    const rows = [];
    for (const o of offers || []) {
        const offerChecks = (checks || []).filter(c => c.offer_id === o.id);
        if (offerChecks.length === 0) {
            rows.push({
                offer_name: o.name,
                offer_store: o.store,
                offer_region: o.region,
                initial_displayed_price: o.displayed_price,
                check_date: null,
                price_paypal: null,
                price_card: null,
                price_ggdeals: null,
                price_allkeyshop: null
            });
        } else {
            for (const pc of offerChecks) {
                rows.push({
                    offer_name: o.name,
                    offer_store: o.store,
                    offer_region: o.region,
                    initial_displayed_price: o.displayed_price,
                    check_date: pc.check_date,
                    price_paypal: pc.price_paypal,
                    price_card: pc.price_card,
                    price_ggdeals: pc.price_ggdeals,
                    price_allkeyshop: pc.price_allkeyshop
                });
            }
        }
    }

    const header = [
        'Date', 'Produit', 'Vendeur', 'Region',
        'Prix Affiche (Offre)', 'Prix PayPal (Checkout)', 'Prix Carte (Checkout)',
        'Prix GGDeals', 'Prix AllKeyShop',
        'Ecart GGDeals vs Reel', 'Ecart AllKeyShop vs Reel'
    ].join(';');

    const csvLines = rows.map(row => {
        const realPrice = row.price_card || row.price_paypal;
        const ggGap = (realPrice && row.price_ggdeals) ? (row.price_ggdeals - realPrice).toFixed(2) : '';
        const aksGap = (realPrice && row.price_allkeyshop) ? (row.price_allkeyshop - realPrice).toFixed(2) : '';
        const date = row.check_date ? new Date(row.check_date).toLocaleString('fr-FR') : '';

        return [
            date,
            `"${row.offer_name?.replace(/"/g, '""') || ''}"`,
            row.offer_store || '',
            row.offer_region || '',
            row.initial_displayed_price || '',
            row.price_paypal || '',
            row.price_card || '',
            row.price_ggdeals || '',
            row.price_allkeyshop || '',
            ggGap,
            aksGap
        ].join(';');
    });

    const csv = '\ufeff' + header + '\n' + csvLines.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=price-tracker-report.csv');
    res.send(csv);
};

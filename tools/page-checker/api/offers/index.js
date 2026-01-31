const { supabase } = require('../_lib/supabase');

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        const { data: offers, error: offersErr } = await supabase
            .from('offers')
            .select('*')
            .order('created_at', { ascending: false });

        if (offersErr) return res.status(500).json({ error: offersErr.message });

        const { data: checks, error: checksErr } = await supabase
            .from('price_checks')
            .select('*')
            .order('check_date', { ascending: false });

        if (checksErr) return res.status(500).json({ error: checksErr.message });

        offers.forEach(offer => {
            offer.history = checks.filter(c => c.offer_id === offer.id);
        });

        return res.json(offers);
    }

    if (req.method === 'POST') {
        const { url, name, store, region, displayed_price, displayed_price_screenshot, payment_method } = req.body;

        const { data, error } = await supabase
            .from('offers')
            .insert({
                url,
                name,
                store: store || '',
                region: region || 'global',
                displayed_price: displayed_price || null,
                displayed_price_screenshot: displayed_price_screenshot || null,
                payment_method: payment_method || 'card'
            })
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
};

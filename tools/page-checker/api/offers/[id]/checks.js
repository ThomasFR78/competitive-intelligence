const { supabase } = require('../../_lib/supabase');

module.exports = async (req, res) => {
    const offerId = parseInt(req.query.id);

    if (req.method === 'GET') {
        const { data, error } = await supabase
            .from('price_checks')
            .select('*')
            .eq('offer_id', offerId)
            .order('check_date', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
    }

    if (req.method === 'POST') {
        const {
            price_paypal, price_card,
            price_ggdeals_paypal, price_ggdeals_card,
            price_aks_paypal, price_aks_card,
            price_ggdeals, price_allkeyshop,
            coupon_ggdeals, coupon_aks,
            screenshot_paypal, screenshot_card, screenshot_ggdeals, screenshot_allkeyshop,
            notes
        } = req.body;

        const { data: offer } = await supabase
            .from('offers')
            .select('displayed_price')
            .eq('id', offerId)
            .single();

        const { data, error } = await supabase
            .from('price_checks')
            .insert({
                offer_id: offerId,
                reference_price: offer?.displayed_price || null,
                price_paypal: price_paypal || null,
                price_card: price_card || null,
                price_ggdeals_paypal: price_ggdeals_paypal || null,
                price_ggdeals_card: price_ggdeals_card || null,
                price_aks_paypal: price_aks_paypal || null,
                price_aks_card: price_aks_card || null,
                price_ggdeals: price_ggdeals || null,
                price_allkeyshop: price_allkeyshop || null,
                coupon_ggdeals: coupon_ggdeals || null,
                coupon_aks: coupon_aks || null,
                screenshot_paypal: screenshot_paypal || null,
                screenshot_card: screenshot_card || null,
                screenshot_ggdeals: screenshot_ggdeals || null,
                screenshot_allkeyshop: screenshot_allkeyshop || null,
                notes: notes || ''
            })
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.json({ id: data.id });
    }

    res.status(405).json({ error: 'Method not allowed' });
};

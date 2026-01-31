const { supabase } = require('../../_lib/supabase');

module.exports = async (req, res) => {
    const id = parseInt(req.query.id);

    if (req.method === 'PUT') {
        const { url, name, store, region, displayed_price, displayed_price_screenshot, payment_method } = req.body;

        const { data: oldOffer } = await supabase
            .from('offers')
            .select('displayed_price')
            .eq('id', id)
            .single();

        const oldPrice = oldOffer?.displayed_price;

        const { error } = await supabase
            .from('offers')
            .update({
                url,
                name,
                store: store || '',
                region: region || 'global',
                displayed_price: displayed_price || null,
                displayed_price_screenshot: displayed_price_screenshot || null,
                payment_method: payment_method || 'card'
            })
            .eq('id', id);

        if (error) return res.status(500).json({ error: error.message });

        if (displayed_price && oldPrice !== displayed_price) {
            await supabase.from('price_checks').insert({
                offer_id: id,
                reference_price: displayed_price,
                notes: `Prix offre modifie (Ancien: ${oldPrice}EUR)`
            });
        }

        return res.json({ success: true });
    }

    if (req.method === 'DELETE') {
        const { error } = await supabase
            .from('offers')
            .delete()
            .eq('id', id);

        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
};

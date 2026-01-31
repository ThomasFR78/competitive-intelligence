const { supabase } = require('../_lib/supabase');

module.exports = async (req, res) => {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { error } = await supabase
        .from('price_checks')
        .delete()
        .eq('id', parseInt(req.query.id));

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
};

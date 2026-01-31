const { supabase } = require('./_lib/supabase');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'Aucune donnee recue' });

    const matches = data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) return res.status(400).json({ error: 'Format invalide' });

    const ext = matches[1];
    const base64Data = matches[2];
    const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.' + ext;
    const buffer = Buffer.from(base64Data, 'base64');

    const { error } = await supabase.storage
        .from('screenshots')
        .upload(filename, buffer, { contentType: `image/${ext}` });

    if (error) return res.status(500).json({ error: error.message });

    res.json({ path: `${process.env.SUPABASE_URL}/storage/v1/object/public/screenshots/${filename}` });
};

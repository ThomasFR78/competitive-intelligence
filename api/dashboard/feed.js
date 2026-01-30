const { supabase } = require('../_lib/supabase');

module.exports = async (req, res) => {
      if (req.method !== 'GET') {
                return res.status(405).json({ error: 'Method not allowed' });
      }

      // Demo data fallback
      const demoData = {
                generated_at: new Date().toISOString(),
                metrics: {
                              competitors_tracked: 7,
                              scans_last_7_days: 42,
                              total_changes: 156,
                              new_pages_detected: 134,
                              pages_removed: 22
                },
                signals: [
                  { type: 'alert', severity: 'high', message: '23 nouvelles pages produits chez G2A', action: 'Analyser les nouveaux produits' },
                  { type: 'opportunity', severity: 'medium', message: 'Eneba lance une promotion FIFA 26', action: 'Lancer une contre-campagne' }
                          ],
                activity_by_competitor: {
                              'Eneba': { added: 45, removed: 5 },
                              'G2A': { added: 38, removed: 8 },
                              'Kinguin': { added: 22, removed: 3 }
                },
                recent_changes: [
                  { url: 'https://eneba.com/game/gta-vi-preorder', change_type: 'added', detected_at: new Date().toISOString(), category: 'product', competitors: { name: 'Eneba' } },
                  { url: 'https://g2a.com/promo/winter-sale', change_type: 'added', detected_at: new Date().toISOString(), category: 'promotion', competitors: { name: 'G2A' } }
                          ],
                competitors: [
                  { id: 1, name: 'Eneba', domain: 'eneba.com', category: 'marketplace', active: true },
                  { id: 2, name: 'G2A', domain: 'g2a.com', category: 'marketplace', active: true },
                  { id: 3, name: 'Kinguin', domain: 'kinguin.net', category: 'marketplace', active: true },
                  { id: 4, name: 'GG.deals', domain: 'gg.deals', category: 'comparator', active: true },
                  { id: 5, name: 'AllKeyShop', domain: 'allkeyshop.com', category: 'comparator', active: true }
                          ]
      };

      if (!supabase) {
                return res.json(demoData);
      }

      try {
                const { data: competitors } = await supabase.from('competitors').select('*').eq('active', true);
                const { data: changes } = await supabase.from('sitemap_changes').select('*, competitors(name, domain)').order('detected_at', { ascending: false }).limit(100);

          return res.json({
                        generated_at: new Date().toISOString(),
                        metrics: { competitors_tracked: competitors?.length || 0, total_changes: changes?.length || 0 },
                        signals: demoData.signals,
                        activity_by_competitor: demoData.activity_by_competitor,
                        recent_changes: changes || demoData.recent_changes,
                        competitors: competitors || demoData.competitors
          });
      } catch (err) {
                return res.json(demoData);
      }
};

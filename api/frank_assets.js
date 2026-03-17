const { supabase, getSession, json } = require('../lib/state');
const isAdmin = s => s?.role === 'admin';

module.exports = async (req, res) => {
  const session = getSession(req);
  if (!session) return json(res, 401, { error: 'Nicht eingeloggt' });

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'frank_assets')
        .maybeSingle();
      if (error) throw error;
      return json(res, 200, { assets: data?.setting_value || {} });
    }

    if (req.method === 'POST') {
      if (!isAdmin(session)) return json(res, 403, { error: 'Nur Admin' });
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const assets = body.assets || {};
      const { error } = await supabase
        .from('app_settings')
        .upsert({ setting_key: 'frank_assets', setting_value: assets }, { onConflict: 'setting_key' });
      if (error) throw error;
      return json(res, 200, { ok: true, assets });
    }

    return json(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    return json(res, 500, { error: 'Frank Assets fehlgeschlagen', detail: e.message });
  }
};

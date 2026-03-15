const { supabase, json } = require('../lib/state');
const { signSession, sessionCookie } = require('../lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const username = String(body.username || '').trim();
    const password = String(body.password || '');
    const { data, error } = await supabase.from('app_users').select('username,password_hash,role,player_name,is_active').eq('username', username).maybeSingle();
    if (error) throw error;
    if (!data || !data.is_active || data.password_hash !== password) return json(res, 401, { error: 'Login fehlgeschlagen' });
    const token = signSession({ username: data.username, role: data.role, playerName: data.player_name || data.username, exp: Date.now() + 1000*60*60*24*7 }, process.env.SESSION_SECRET);
    return json(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie(token) });
  } catch (e) { return json(res, 500, { error: 'Serverfehler', detail: e.message }); }
};

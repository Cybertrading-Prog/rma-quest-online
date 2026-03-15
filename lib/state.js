const { createClient } = require('@supabase/supabase-js');
const { parseCookies, verifySession } = require('./auth');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const DEFAULT_TASKS = [
  { id: 1, name: 'Kunden-RMA abgeschlossen', category: 'Kunden-RMA', points: 2, active: true },
  { id: 2, name: 'Lieferanten-RMA abgeschlossen', category: 'Lieferanten-RMA', points: 3, active: true },
  { id: 3, name: 'Fehlende Infos sauber nachgetragen', category: 'Datenpflege', points: 1, active: true },
  { id: 4, name: 'Rückfrage mit Vertrieb geklärt', category: 'Schnittstelle', points: 2, active: true },
  { id: 5, name: 'Wartenden Fall wieder aktiviert', category: 'Follow-up', points: 2, active: true },
  { id: 6, name: 'Eskalation / Sonderfall gelöst', category: 'Boss-Fight', points: 5, active: true },
  { id: 7, name: 'Kunde proaktiv informiert', category: 'Kommunikation', points: 2, active: true },
  { id: 8, name: 'Lieferant erfolgreich nachgefasst', category: 'Kommunikation', points: 2, active: true },
  { id: 9, name: 'Saubere Dokumentation / Statuspflege', category: 'Qualität', points: 1, active: true },
  { id: 10, name: 'Kollegen aktiv unterstützt', category: 'Teamplay', points: 2, active: true }
];
const DEFAULT_CHALLENGES = [
  { id: 1, taskTemplateId: 1, target: 5, bonus: 2 },
  { id: 2, taskTemplateId: 2, target: 3, bonus: 2 },
  { id: 3, taskTemplateId: 7, target: 2, bonus: 1 },
  { id: 4, taskTemplateId: 6, target: 1, bonus: 3 }
];
const todayKey = () => new Date().toISOString().slice(0,10);

async function getAppUsers() {
  const { data, error } = await supabase.from('app_users').select('username, role, player_name, is_active').order('created_at', {ascending:true});
  if (error) throw error;
  return data || [];
}
function buildDefaultState(users) {
  const players = users.filter(u => u.role === 'player' && u.is_active).map((u, i) => ({ id: i + 1, name: u.player_name || u.username, steps: 0 }));
  return {
    players, entries: [], taskTemplates: DEFAULT_TASKS, dailyChallenges: DEFAULT_CHALLENGES,
    challengeDate: todayKey(), challengeBonusClaims: {}, nextPlayerId: players.length + 1, nextTaskTemplateId: 11, observerEnabled: true
  };
}
async function saveState(state) {
  const { error } = await supabase.from('app_settings').upsert({ setting_key: 'game_state', setting_value: state }, { onConflict: 'setting_key' });
  if (error) throw error;
}
async function getState() {
  const users = await getAppUsers();
  const { data, error } = await supabase.from('app_settings').select('setting_value').eq('setting_key', 'game_state').maybeSingle();
  if (error) throw error;
  let state = data?.setting_value || null;
  if (!state) { state = buildDefaultState(users); await saveState(state); }
  if (!state.challengeDate || state.challengeDate !== todayKey()) {
    state.challengeDate = todayKey(); state.challengeBonusClaims = {};
  }
  const names = users.filter(u => u.role === 'player' && u.is_active).map(u => u.player_name || u.username);
  for (const name of names) if (!state.players.find(p => p.name === name)) state.players.push({ id: state.nextPlayerId++, name, steps: 0 });
  state.players = state.players.filter(p => names.includes(p.name));
  return { state, users };
}
function getSession(req) {
  const cookies = parseCookies(req);
  return verifySession(cookies.rmaquest_session, process.env.SESSION_SECRET);
}
function json(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify(body));
}
module.exports = { supabase, getState, saveState, getSession, json, todayKey };

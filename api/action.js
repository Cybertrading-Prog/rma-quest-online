const crypto = require('crypto');
const { supabase, getState, saveState, getSession, json, todayKey } = require('../lib/state');

const isAdmin = s => s?.role === 'admin';
const rebuildSteps = (state) => {
  state.players.forEach(p => p.steps = 0);
  state.entries.forEach(e => {
    const p = state.players.find(x => x.name === e.playerName);
    if (p) p.steps += Number(e.points || 0);
  });
};
const countProgress = (state, ch) => {
  const task = state.taskTemplates.find(t => Number(t.id) === Number(ch.taskTemplateId));
  if (!task) return 0;
  return state.entries.filter(e => e.createdAt?.slice?.(0,10) === state.challengeDate && e.title === task.name).length;
};
const applyChallengeBonuses = (state) => {
  state.dailyChallenges.forEach(ch => {
    const progress = countProgress(state, ch);
    const key = `${state.challengeDate}_${ch.id}`;
    if (progress >= ch.target && !state.challengeBonusClaims[key] && ch.bonus > 0) {
      state.challengeBonusClaims[key] = true;
      state.players.forEach(p => {
        p.steps += ch.bonus;
        state.entries.push({ id: crypto.randomUUID(), playerName: p.name, title: 'Team-Bonus', points: ch.bonus, category: 'Challenge-Bonus', note: 'Tages-Challenge erfüllt', manual: true, createdBy: 'system', createdAt: new Date().toISOString() });
      });
    }
  });
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  const session = getSession(req);
  if (!session) return json(res, 401, { error: 'Nicht eingeloggt' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const action = body.action;
    const payload = body.payload || {};
    const loaded = await getState();
    const state = loaded.state;
    if (state.challengeDate !== todayKey()) { state.challengeDate = todayKey(); state.challengeBonusClaims = {}; }

    if (action === 'addEntry') {
      const template = state.taskTemplates.find(t => Number(t.id) === Number(payload.taskTemplateId));
      if (!template) return json(res, 400, { error: 'Quest nicht gefunden' });
      const playerName = isAdmin(session) ? String(payload.playerName || '') : session.playerName;
      const player = state.players.find(p => p.name === playerName);
      if (!player) return json(res, 400, { error: 'Spieler nicht gefunden' });
      const points = isAdmin(session) ? Number(payload.points ?? template.points) : Number(template.points);
      const category = isAdmin(session) ? String(payload.category || template.category) : template.category;
      player.steps += points;
      state.entries.push({ id: crypto.randomUUID(), playerName, title: template.name, points, category, note: String(payload.note || ''), manual: false, createdBy: session.username, createdAt: new Date().toISOString() });
      applyChallengeBonuses(state);
      await saveState(state);
      return json(res, 200, { ok: true, state });
    }

    if (action === 'createPlayer') {
      if (!isAdmin(session)) return json(res, 403, { error: 'Nur Admin' });
      const username = String(payload.username || '').trim();
      const password = String(payload.password || '');
      if (!username || !password) return json(res, 400, { error: 'Benutzername und Passwort fehlen' });
      const { error } = await supabase.from('app_users').insert({ username, password_hash: password, role: 'player', player_name: username, is_active: true });
      if (error) throw error;
      state.players.push({ id: state.nextPlayerId++, name: username, steps: 0 });
      await saveState(state);
      return json(res, 200, { ok: true, state });
    }

    if (action === 'renamePlayer') {
      if (!isAdmin(session)) return json(res, 403, { error: 'Nur Admin' });
      const oldName = String(payload.oldName || '');
      const newName = String(payload.newName || '').trim();
      const player = state.players.find(p => p.name === oldName);
      if (player) player.name = newName;
      state.entries.forEach(e => { if (e.playerName === oldName) e.playerName = newName; });
      const { error } = await supabase.from('app_users').update({ username: newName, player_name: newName, updated_at: new Date().toISOString() }).eq('player_name', oldName).eq('role', 'player');
      if (error) throw error;
      await saveState(state);
      return json(res, 200, { ok: true, state });
    }

    if (action === 'resetPassword') {
      if (!isAdmin(session)) return json(res, 403, { error: 'Nur Admin' });
      const { error } = await supabase.from('app_users').update({ password_hash: String(payload.newPassword || ''), updated_at: new Date().toISOString() }).eq('username', String(payload.username || ''));
      if (error) throw error;
      return json(res, 200, { ok: true });
    }

    if (action === 'changeOwnPassword') {
      const { error } = await supabase.from('app_users').update({ password_hash: String(payload.newPassword || ''), updated_at: new Date().toISOString() }).eq('username', session.username);
      if (error) throw error;
      return json(res, 200, { ok: true });
    }

    if (action === 'createTaskTemplate') {
      if (!isAdmin(session)) return json(res, 403, { error: 'Nur Admin' });
      state.taskTemplates.push({ id: state.nextTaskTemplateId++, name: String(payload.name || ''), category: String(payload.category || ''), points: Number(payload.points || 0), active: Boolean(payload.active) });
      await saveState(state);
      return json(res, 200, { ok: true, state });
    }

    if (action === 'updateTaskTemplate') {
      if (!isAdmin(session)) return json(res, 403, { error: 'Nur Admin' });
      const task = state.taskTemplates.find(t => Number(t.id) === Number(payload.id));
      if (!task) return json(res, 404, { error: 'Quest nicht gefunden' });
      task.name = String(payload.name || task.name);
      task.category = String(payload.category || task.category);
      task.points = Number(payload.points ?? task.points);
      task.active = Boolean(payload.active);
      await saveState(state);
      return json(res, 200, { ok: true, state });
    }

    if (action === 'toggleObserver') {
      if (!isAdmin(session)) return json(res, 403, { error: 'Nur Admin' });
      state.observerEnabled = Boolean(payload.enabled);
      await saveState(state);
      return json(res, 200, { ok: true, state });
    }

    if (action === 'resetTodayChallenges') {
      if (!isAdmin(session)) return json(res, 403, { error: 'Nur Admin' });
      state.entries = state.entries.filter(e => e.createdAt?.slice?.(0,10) !== state.challengeDate);
      state.challengeBonusClaims = {};
      rebuildSteps(state);
      await saveState(state);
      return json(res, 200, { ok: true, state });
    }

    return json(res, 400, { error: 'Unbekannte Aktion' });
  } catch (e) {
    return json(res, 500, { error: 'Aktion fehlgeschlagen', detail: e.message });
  }
};

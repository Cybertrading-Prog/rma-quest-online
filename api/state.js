const { getState, getSession, json } = require('../lib/state');
module.exports = async (req, res) => {
  const s = getSession(req);
  if (!s) return json(res, 401, { error: 'Nicht eingeloggt' });
  try {
    const { state } = await getState();
    const safeState = { ...state };
    delete safeState.frankImageOverrides;
    return json(res, 200, { state: safeState, session: s });
  } catch (e) {
    return json(res, 500, { error: 'State konnte nicht geladen werden', detail: e.message });
  }
};

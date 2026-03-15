const { getState, getSession, json } = require('../lib/state');
module.exports = async (req, res) => {
  const session = getSession(req);
  if (!session) return json(res, 401, { error: 'Nicht eingeloggt' });
  try {
    const { state } = await getState();
    return json(res, 200, { state, session });
  } catch (e) { return json(res, 500, { error: 'State konnte nicht geladen werden', detail: e.message }); }
};

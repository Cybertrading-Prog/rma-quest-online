const { getSession, json } = require('../lib/state');
module.exports = async (req, res) => {
  const session = getSession(req);
  if (!session) return json(res, 401, { error: 'Nicht eingeloggt' });
  return json(res, 200, { session });
};

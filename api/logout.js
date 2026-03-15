const { json } = require('../lib/state');
const { clearSessionCookie } = require('../lib/auth');
module.exports = async (_req, res) => json(res, 200, { ok: true }, { 'Set-Cookie': clearSessionCookie() });

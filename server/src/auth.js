const jwt = require('jsonwebtoken');
const prisma = require('./db');
const { fail } = require('./rules');
const COOKIE = 'washtrack_session';
const cookieOptions = { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/' };
const publicUser = { id: true, name: true, email: true, role: true, bagNo: true };
async function requireUser(req, res, next) {
  let payload;
  try { payload = jwt.verify(req.cookies[COOKIE] || '', process.env.JWT_SECRET, { algorithms: ['HS256'] }); }
  catch { fail('Please sign in again.', 401); }
  const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { ...publicUser, tokenVersion: true } });
  if (!user || payload.ver !== user.tokenVersion) fail('Please sign in again.', 401);
  const { tokenVersion, ...safeUser } = user;
  req.user = safeUser;
  next();
}
function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) fail('This action is not allowed for your account.', 403);
    next();
  };
}
module.exports = { COOKIE, cookieOptions, publicUser, requireUser, requireRole };

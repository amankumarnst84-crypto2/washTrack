const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const prisma = require('./db');
const { fail, text } = require('./rules');
const { publicUser } = require('./auth');
function emailAddress(value) {
  const email = text(value, 'Email', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('Enter a valid email address.');
  return email;
}
function bagNumber(value) {
  const bagNo = text(value, 'Bag number', 20).toUpperCase();
  if (!/^[BG]-[1-9][0-9]{0,7}$/.test(bagNo)) fail('Use a bag number such as B-69 or G-76.');
  return bagNo;
}
const hashCode = code => crypto.createHash('sha256').update(code).digest('hex');
async function createInvite(req, res) {
  const email = emailAddress(req.body.email);
  const bagNo = bagNumber(req.body.bagNo);
  if (await prisma.user.findFirst({ where: { OR: [{ email }, { bagNo }] } })) fail('This email or bag already belongs to an account.', 409);
  const registrationCode = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const invite = await prisma.registrationInvite.upsert({
    where: { email },
    create: { email, bagNo, tokenHash: hashCode(registrationCode), expiresAt },
    update: { bagNo, tokenHash: hashCode(registrationCode), expiresAt, usedAt: null },
    select: { id: true, email: true, bagNo: true, expiresAt: true }
  });
  // Only this response contains the code. Staff shares it with the assigned student.
  res.status(201).json({ invite, registrationCode });
}
async function register(req, res) {
  const email = emailAddress(req.body.email);
  const bagNo = bagNumber(req.body.bagNo);
  const name = text(req.body.name, 'Name', 100);
  const { password, confirmPassword } = req.body;
  if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) fail('Password must have at least 8 characters and at most 72 UTF-8 bytes.');
  if (password !== confirmPassword) fail('Passwords do not match.');
  // Never accept a role supplied by a public registration request.
  if (req.body.role !== undefined && req.body.role !== 'STUDENT') fail('Staff accounts cannot be registered here.', 403);
  const code = text(req.body.registrationCode, 'Registration code', 48);
  if (!/^[a-f0-9]{48}$/.test(code)) fail('Invalid or expired registration code.');
  const tokenHash = hashCode(code);
  const invite = await prisma.registrationInvite.findUnique({ where: { tokenHash } });
  if (!invite || invite.email !== email || invite.bagNo !== bagNo || invite.usedAt || invite.expiresAt <= new Date()) fail('Invalid or expired registration code.');
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.$transaction(async tx => {
    // Consume atomically so two simultaneous signup requests cannot reuse a code.
    const consumed = await tx.registrationInvite.updateMany({
      where: { id: invite.id, tokenHash, email, bagNo, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() }
    });
    if (consumed.count !== 1) fail('Invalid or expired registration code.');
    return tx.user.create({ data: { name, email, bagNo, passwordHash, role: 'STUDENT' }, select: publicUser });
  });
  res.status(201).json({ user, message: 'Account created. Sign in with your email and password.' });
}
module.exports = { register, createInvite };

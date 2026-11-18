require('dotenv').config({ path: require('node:path').join(__dirname, '../.env'), quiet: true });
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('./db');
const { COOKIE, cookieOptions, publicUser, requireUser, requireRole } = require('./auth');
const { validateItems, fail, text, ITEM_TYPES, COMPLAINT_TYPES } = require('./rules');
const { register, createInvite } = require('./registration');
const rateLimit = require('./rate-limit');
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
// Same-origin JSON requests plus SameSite cookies protect cookie-authenticated writes.
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    if (!req.is('application/json')) fail('Send JSON requests.', 415);
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) fail('Send a JSON object.');
    if (req.headers.origin && req.headers.origin !== `${req.protocol}://${req.get('host')}`) fail('Cross-origin requests are not allowed.', 403);
  }
  next();
});
app.get('/api/health', async (req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok' });
});
app.post('/api/auth/register', rateLimit(20, 15), register);
app.post('/api/auth/login', rateLimit(30, 15), async (req, res) => {
  const email = text(req.body.email, 'Email', 254).toLowerCase();
  const password = req.body.password;
  if (typeof password !== 'string' || !password.length || Buffer.byteLength(password, 'utf8') > 72) fail('Password is required (maximum 72 UTF-8 bytes).');
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) fail('Invalid email or password.', 401);
  const token = jwt.sign({ ver: user.tokenVersion }, process.env.JWT_SECRET, { subject: user.id, expiresIn: '8h', algorithm: 'HS256' });
  res.cookie(COOKIE, token, { ...cookieOptions, maxAge: 8 * 60 * 60 * 1000 });
  const safe = await prisma.user.findUnique({ where: { id: user.id }, select: publicUser });
  res.json({ user: safe });
});
app.post('/api/auth/logout', async (req, res) => {
  let payload;
  try { payload = jwt.verify(req.cookies[COOKIE] || '', process.env.JWT_SECRET, { algorithms: ['HS256'] }); }
  catch { /* Expired/missing cookies can still be cleared. */ }
  if (payload && Number.isInteger(payload.ver)) {
    await prisma.user.updateMany({ where: { id: payload.sub, tokenVersion: payload.ver }, data: { tokenVersion: { increment: 1 } } });
  }
  res.clearCookie(COOKIE, cookieOptions);
  res.json({ message: 'Signed out.' });
});
app.use('/api', requireUser);
app.get('/api/auth/me', (req, res) => res.json({ user: req.user }));
const student = requireRole('STUDENT');
const staff = requireRole('STAFF');
app.post('/api/registration-invites', staff, createInvite);
app.get('/api/meta', (req, res) => res.json({ itemTypes: ITEM_TYPES, maxClothes: 15, complaintTypes: COMPLAINT_TYPES, orderStatuses: ['SUBMITTED', 'RECEIVED', 'WASHING', 'READY', 'COLLECTED'] }));
const orderInclude = {
  items: true, lot: true, events: { orderBy: { createdAt: 'asc' } },
  student: { select: { name: true, email: true } }
};
async function ownOrder(id, user) {
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order || (user.role === 'STUDENT' && order.studentId !== user.id)) fail('Order not found.', 404);
  return order;
}
app.get('/api/orders', async (req, res) => {
  const where = req.user.role === 'STUDENT' ? { studentId: req.user.id } : {};
  if (req.query.status) {
    if (!['SUBMITTED', 'RECEIVED', 'WASHING', 'READY', 'COLLECTED'].includes(req.query.status)) fail('Invalid status filter.');
    where.status = req.query.status;
  }
  if (req.query.q !== undefined) {
    const q = text(req.query.q, 'Search', 100).replace(/^WT-/i, '');
    where.OR = [{ id: { contains: q, mode: 'insensitive' } }, { bagNo: { contains: q, mode: 'insensitive' } }];
  }
  const orders = await prisma.order.findMany({ where, include: orderInclude, orderBy: { createdAt: 'desc' } });
  res.json({ orders });
});
app.get('/api/orders/:id', async (req, res) => {
  await ownOrder(req.params.id, req.user);
  res.json({ order: await prisma.order.findUnique({ where: { id: req.params.id }, include: orderInclude }) });
});
app.get('/api/orders/:id/history', async (req, res) => {
  await ownOrder(req.params.id, req.user);
  res.json({ events: await prisma.orderEvent.findMany({ where: { orderId: req.params.id }, orderBy: { createdAt: 'asc' } }) });
});
app.post('/api/orders', student, async (req, res) => {
  if (!req.user.bagNo) fail('Ask staff to assign your bag first.', 409);
  const totalCount = validateItems(req.body.items);
  // A partial unique database index also prevents two simultaneous active submissions.
  const order = await prisma.order.create({ data: {
    studentId: req.user.id, bagNo: req.user.bagNo, totalCount,
    items: { create: req.body.items.map(({ type, quantity }) => ({ type, quantity })) },
    events: { create: { status: 'SUBMITTED' } }
  }, include: orderInclude });
  res.status(201).json({ order });
});
app.patch('/api/orders/:id/status', staff, async (req, res) => {
  const order = await ownOrder(req.params.id, req.user);
  const next = { SUBMITTED: 'RECEIVED', WASHING: 'READY', READY: 'COLLECTED' };
  if (!next[order.status] || req.body.status !== next[order.status]) fail('Invalid transition. Start washing through the assigned lot.', 409);
  if (req.body.status === 'READY' && req.body.atCounter !== true) fail('Confirm that the packed bag is at the collection counter.');
  await prisma.$transaction(async tx => {
    const result = await tx.order.updateMany({ where: { id: order.id, status: order.status }, data: { status: req.body.status, delayReason: '' } });
    if (result.count !== 1) fail('Order changed. Refresh and try again.', 409);
    await tx.orderEvent.create({ data: { orderId: order.id, status: req.body.status } });
  });
  res.json({ message: 'Status updated.' });
});
app.patch('/api/orders/:id/delay', staff, async (req, res) => {
  const order = await ownOrder(req.params.id, req.user);
  if (order.status === 'COLLECTED') fail('Collected bags cannot have a delay.', 409);
  const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : null;
  if (reason === null || reason.length > 500) fail('Delay reason must be under 500 characters.');
  const changed = await prisma.order.updateMany({ where: { id: order.id, status: { not: 'COLLECTED' } }, data: { delayReason: reason } });
  if (!changed.count) fail('Bag was already collected. Refresh and try again.', 409);
  res.json({ message: reason ? 'Delay reason saved.' : 'Delay cleared.' });
});
app.get('/api/lots', staff, async (req, res) => {
  res.json({ lots: await prisma.lot.findMany({ include: { orders: { select: { id: true, bagNo: true, status: true } } }, orderBy: [{ date: 'desc' }, { shift: 'asc' }] }) });
});
app.post('/api/lots', staff, async (req, res) => {
  const { date, shift } = req.body;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) fail('Choose a valid lot date.');
  if (!['MORNING', 'EVENING'].includes(shift)) fail('Choose Morning or Evening.');
  res.status(201).json({ lot: await prisma.lot.create({ data: { date, shift } }) });
});
app.patch('/api/orders/:id/lot', staff, async (req, res) => {
  await prisma.$transaction(async tx => {
    const lotId = text(req.body.lotId, 'Lot');
    // Row lock keeps assignment and lot start from racing each other.
    await tx.$queryRaw`SELECT id FROM "Lot" WHERE id = ${lotId} FOR UPDATE`;
    const lot = await tx.lot.findUnique({ where: { id: lotId } });
    if (!lot || lot.startedAt) fail('Choose a lot that has not started washing.', 409);
    const result = await tx.order.updateMany({ where: { id: req.params.id, status: 'RECEIVED' }, data: { lotId } });
    if (result.count !== 1) fail('Only Received bags can join a lot.', 409);
  });
  res.json({ message: 'Lot assigned.' });
});
app.post('/api/lots/:id/start', staff, async (req, res) => {
  await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "Lot" WHERE id = ${req.params.id} FOR UPDATE`;
    const lot = await tx.lot.findUnique({ where: { id: req.params.id }, include: { orders: true } });
    if (!lot || lot.startedAt) fail('Lot already started or not found.', 409);
    if (!lot.orders.length || lot.orders.some(o => o.status !== 'RECEIVED')) fail('Lot must contain Received bags.', 409);
    await tx.lot.update({ where: { id: lot.id }, data: { startedAt: new Date() } });
    await tx.order.updateMany({ where: { lotId: lot.id }, data: { status: 'WASHING', delayReason: '' } });
    await tx.orderEvent.createMany({ data: lot.orders.map(o => ({ orderId: o.id, status: 'WASHING' })) });
  });
  res.json({ message: 'Washing started for all bags in this lot.' });
});
app.get('/api/complaints', async (req, res) => {
  const complaints = await prisma.complaint.findMany({
    where: req.user.role === 'STUDENT' ? { order: { studentId: req.user.id } } : {},
    include: { order: { select: { bagNo: true, id: true } }, events: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ complaints });
});
app.post('/api/orders/:id/complaints', student, async (req, res) => {
  const order = await ownOrder(req.params.id, req.user);
  if (order.status === 'SUBMITTED') fail('Staff must receive the bag before a complaint can be logged.', 409);
  const { type, itemType, quantity } = req.body;
  if (!COMPLAINT_TYPES.includes(type)) fail('Choose a valid complaint type.');
  const description = text(req.body.description, 'Description');
  const counted = type === 'MISSING' || type === 'EXTRA';
  if (counted && (!ITEM_TYPES.includes(itemType) || !Number.isInteger(quantity) || quantity < 1 || quantity > 15)) fail('Choose an item and a quantity from 1 to 15.');
  if (type === 'MISSING' && quantity > (order.items.find(i => i.type === itemType)?.quantity || 0)) fail('Missing quantity cannot exceed the declared item count.');
  const complaint = await prisma.complaint.create({ data: {
    orderId: order.id, type, description, itemType: counted ? itemType : null, quantity: counted ? quantity : null,
    events: { create: { status: 'OPEN', actorRole: 'STUDENT', message: description } }
  } });
  res.status(201).json({ complaint });
});
app.patch('/api/complaints/:id', async (req, res) => {
  const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id }, include: { order: true } });
  if (!complaint || (req.user.role === 'STUDENT' && complaint.order.studentId !== req.user.id)) fail('Complaint not found.', 404);
  const { status } = req.body;
  const message = text(req.body.message, 'Response');
  const staffAllowed = {
    OPEN: ['IN_PROGRESS'], IN_PROGRESS: ['IN_PROGRESS', 'AWAITING_CONFIRMATION']
  };
  const allowed = req.user.role === 'STAFF'
    ? staffAllowed[complaint.status]?.includes(status)
    : complaint.status === 'AWAITING_CONFIRMATION' && ['RESOLVED', 'IN_PROGRESS'].includes(status);
  if (!allowed) fail('This complaint transition is not allowed.', 409);
  await prisma.$transaction(async tx => {
    const result = await tx.complaint.updateMany({ where: { id: complaint.id, status: complaint.status }, data: { status } });
    if (result.count !== 1) fail('Complaint changed. Refresh and try again.', 409);
    await tx.complaintEvent.create({ data: { complaintId: complaint.id, status, message, actorRole: req.user.role } });
  });
  res.json({ message: 'Complaint updated.' });
});
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found.' }));
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.code === 'P2002') return res.status(409).json({ message: req.path === '/api/orders' ? 'This bag already has an active order. Collect it before submitting again.' : 'This record already exists.' });
  if (err.code === 'P2025') return res.status(404).json({ message: 'Record not found.' });
  if (err.code === 'P2034') return res.status(409).json({ message: 'Another update is in progress. Please retry.' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON body.' });
  const status = err.status || 500;
  if (status === 500) console.error('API error:', err.code || err.name);
  res.status(status).json({ message: status === 500 ? 'Server could not complete the request. Please try again.' : err.message });
});
module.exports = app;

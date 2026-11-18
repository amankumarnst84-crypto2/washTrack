require('dotenv').config({ quiet: true });
const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const prisma = require('../src/db');
const app = require('../src/app');

test('staff-issued signup, one-time codes, role restrictions, input validation and logout revocation', async () => {
  const suffix = crypto.randomUUID();
  const email = `signup-${suffix}@example.test`;
  const expiredEmail = `expired-${suffix}@example.test`;
  const staffEmail = `staff-${suffix}@example.test`;
  const bagNo = `B-${crypto.randomInt(10000000, 99999999)}`;
  const otherBag = `G-${crypto.randomInt(10000000, 99999999)}`;
  const password = 'Student-pass-15!';
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  async function request(path, method = 'GET', body, cookie = '', expected = 200) {
    const res = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: body === undefined ? undefined : JSON.stringify(body) });
    const data = await res.json();
    assert.equal(res.status, expected, `${path}: ${JSON.stringify(data)}`);
    return { data, cookie: res.headers.get('set-cookie')?.split(';')[0] };
  }
  try {
    await prisma.user.create({ data: { email: staffEmail, name: 'Signup test staff', role: 'STAFF', passwordHash: await bcrypt.hash(password, 4) } });
    const staff = await request('/auth/login', 'POST', { email: staffEmail, password });
    await request('/auth/register', 'POST', undefined, '', 400);
    const malformed = await fetch(base + '/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{broken' });
    assert.equal(malformed.status, 400);
    assert.equal((await malformed.json()).message, 'Invalid JSON body.');
    await request('/registration-invites', 'POST', { email, bagNo }, '', 401);
    const first = await request('/registration-invites', 'POST', { email, bagNo }, staff.cookie, 201);
    const second = await request('/registration-invites', 'POST', { email, bagNo }, staff.cookie, 201);
    const body = { email, bagNo, name: 'Signup test student', password, confirmPassword: password, registrationCode: second.data.registrationCode };
    await request('/auth/register', 'POST', { ...body, registrationCode: first.data.registrationCode }, '', 400);
    await request('/auth/register', 'POST', { ...body, email: 'other@example.test' }, '', 400);
    await request('/auth/register', 'POST', { ...body, bagNo: otherBag }, '', 400);
    await request('/auth/register', 'POST', { ...body, role: 'STAFF' }, '', 403);
    await request('/auth/register', 'POST', { ...body, confirmPassword: 'wrong' }, '', 400);
    await request('/auth/register', 'POST', { ...body, password: 'a'.repeat(73), confirmPassword: 'a'.repeat(73) }, '', 400);
    // Only one request consumes the invitation and creates the account.
    const concurrent = await Promise.all([1, 2].map(() => fetch(base + '/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })));
    assert.deepEqual(concurrent.map(r => r.status).sort(), [201, 400]);
    const registered = (await concurrent.find(r => r.status === 201).json()).user;
    assert.equal(registered.role, 'STUDENT');
    assert.equal(registered.bagNo, bagNo);
    assert.equal(registered.passwordHash, undefined);
    const saved = await prisma.user.findUnique({ where: { email } });
    assert.notEqual(saved.passwordHash, password);
    assert.ok(await bcrypt.compare(password, saved.passwordHash));
    const student = await request('/auth/login', 'POST', { email: email.toUpperCase(), password });
    await request('/auth/register', 'POST', body, '', 400);
    await request('/registration-invites', 'POST', { email: expiredEmail, bagNo: otherBag }, student.cookie, 403);
    const exp = await request('/registration-invites', 'POST', { email: expiredEmail, bagNo: otherBag }, staff.cookie, 201);
    await prisma.registrationInvite.update({ where: { email: expiredEmail }, data: { expiresAt: new Date(Date.now() - 1000) } });
    await request('/auth/register', 'POST', { ...body, email: expiredEmail, bagNo: otherBag, registrationCode: exp.data.registrationCode }, '', 400);
    await request('/registration-invites', 'POST', { email, bagNo }, staff.cookie, 409);
    assert.equal((await request('/meta', 'GET', undefined, student.cookie)).data.maxClothes, 15);
    const order = (await request('/orders', 'POST', { items: [{ type: 'Pant', quantity: 2 }] }, student.cookie, 201)).data.order;
    assert.equal((await request(`/orders/${order.id}`, 'GET', undefined, student.cookie)).data.order.id, order.id);
    assert.equal((await request(`/orders/${order.id}/history`, 'GET', undefined, student.cookie)).data.events[0].status, 'SUBMITTED');
    assert.equal((await request(`/orders?status=SUBMITTED&q=${bagNo}`, 'GET', undefined, student.cookie)).data.orders.length, 1);
    await request('/orders?status=INVALID', 'GET', undefined, student.cookie, 400);
    const other = await prisma.user.create({ data: { email: `other-${suffix}@example.test`, name: 'Other student', role: 'STUDENT', passwordHash: saved.passwordHash, bagNo: otherBag } });
    const stranger = await request('/auth/login', 'POST', { email: other.email, password });
    await request(`/orders/${order.id}`, 'GET', undefined, stranger.cookie, 404);
    await request(`/orders/${order.id}/history`, 'GET', undefined, stranger.cookie, 404);
    const crossOrigin = await fetch(base + '/orders', { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: student.cookie, Origin: 'https://unrelated.example' }, body: JSON.stringify({ items: [{ type: 'Shirt', quantity: 1 }] }) });
    assert.equal(crossOrigin.status, 403);
    await request('/auth/logout', 'POST', {}, student.cookie);
    await request('/auth/me', 'GET', undefined, student.cookie, 401);
    const fresh = await request('/auth/login', 'POST', { email, password });
    assert.equal((await request('/auth/me', 'GET', undefined, fresh.cookie)).data.user.id, saved.id);
  } finally {
    const emails = [email, expiredEmail, staffEmail, `other-${suffix}@example.test`];
    await prisma.order.deleteMany({ where: { student: { email: { in: emails } } } });
    await prisma.registrationInvite.deleteMany({ where: { email: { in: emails } } });
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
    await new Promise(resolve => server.close(resolve));
    await prisma.$disconnect();
  }
});

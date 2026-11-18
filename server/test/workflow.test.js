require('dotenv').config({ quiet: true });
const { test } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const prisma = require('../src/db');
const app = require('../src/app');

test('database-backed laundry lifecycle, ownership, concurrency and complaint confirmation', async () => {
  const prefix = `test-${crypto.randomUUID()}`;
  const password = 'Workflow-test-15!';
  const hash = await bcrypt.hash(password, 4);
  const users = [];
  let lotId;
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  async function request(path, { method = 'GET', body, cookie = '', expected = 200 } = {}) {
    const response = await fetch(`${origin}/api${path}`, { method, headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: body === undefined ? undefined : JSON.stringify(body) });
    const data = await response.json();
    assert.equal(response.status, expected, `${method} ${path}: ${JSON.stringify(data)}`);
    return { data, cookie: response.headers.get('set-cookie')?.split(';')[0] };
  }
  try {
    for (const [role, suffix] of [['STUDENT', 'a'], ['STUDENT', 'b'], ['STAFF', 'staff']]) users.push(await prisma.user.create({ data: { name: suffix, email: `${prefix}-${suffix}@test.invalid`, passwordHash: hash, role, bagNo: role === 'STUDENT' ? `${prefix}-${suffix}` : null } }));
    const [a, b, staff] = await Promise.all(users.map(u => request('/auth/login', { method: 'POST', body: { email: u.email, password } })));
    await request('/orders', { expected: 401 });
    await request('/auth/login', { method: 'POST', body: { email: users[0].email, password: 'wrong-pass' }, expected: 401 });
    await request('/lots', { cookie: a.cookie, expected: 403 });
    await request('/orders', { method: 'POST', cookie: a.cookie, body: { items: [{ type: 'Shirt', quantity: 16 }] }, expected: 400 });
    const items = [{ type: 'Shirt', quantity: 8 }, { type: 'Pant', quantity: 7 }];
    // Parallel submissions must create only one active order.
    const results = await Promise.all([1, 2].map(() => fetch(`${origin}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: a.cookie }, body: JSON.stringify({ items }) })));
    assert.deepEqual(results.map(r => r.status).sort(), [201, 409]);
    const created = await results.find(r => r.status === 201).json();
    const order = created.order;
    assert.equal(order.totalCount, 15);
    assert.equal((await request('/orders', { cookie: b.cookie })).data.orders.length, 0);
    assert.ok((await request('/orders', { cookie: staff.cookie })).data.orders.some(o => o.id === order.id));
    await request(`/orders/${order.id}/status`, { method: 'PATCH', cookie: a.cookie, body: { status: 'COLLECTED' }, expected: 403 });
    await request(`/orders/${order.id}/status`, { method: 'PATCH', cookie: staff.cookie, body: { status: 'READY' }, expected: 409 });
    await request(`/orders/${order.id}/status`, { method: 'PATCH', cookie: staff.cookie, body: { status: 'RECEIVED' } });
    const date = `${2100 + Math.floor(Math.random() * 8000)}-11-11`;
    lotId = (await request('/lots', { method: 'POST', cookie: staff.cookie, body: { date, shift: 'MORNING' }, expected: 201 })).data.lot.id;
    await request(`/orders/${order.id}/lot`, { method: 'PATCH', cookie: staff.cookie, body: { lotId } });
    await request(`/lots/${lotId}/start`, { method: 'POST', cookie: staff.cookie, body: {} });
    await request(`/lots/${lotId}/start`, { method: 'POST', cookie: staff.cookie, body: {}, expected: 409 });
    await request(`/orders/${order.id}/delay`, { method: 'PATCH', cookie: staff.cookie, body: { reason: 'Packing in progress' } });
    let fetched = (await request('/orders', { cookie: a.cookie })).data.orders[0];
    assert.equal(fetched.delayReason, 'Packing in progress');
    assert.equal(fetched.status, 'WASHING');
    await request(`/orders/${order.id}/status`, { method: 'PATCH', cookie: staff.cookie, body: { status: 'READY' }, expected: 400 });
    await request(`/orders/${order.id}/status`, { method: 'PATCH', cookie: staff.cookie, body: { status: 'READY', atCounter: true } });
    await request(`/orders/${order.id}/status`, { method: 'PATCH', cookie: staff.cookie, body: { status: 'COLLECTED' } });
    fetched = (await request('/orders', { cookie: a.cookie })).data.orders[0];
    assert.deepEqual(fetched.events.map(e => e.status), ['SUBMITTED', 'RECEIVED', 'WASHING', 'READY', 'COLLECTED']);
    assert.equal(fetched.delayReason, '');
    await request(`/orders/${order.id}/complaints`, { method: 'POST', cookie: b.cookie, body: { type: 'MISSING', itemType: 'Shirt', quantity: 1, description: 'Missing shirt' }, expected: 404 });
    await request(`/orders/${order.id}/complaints`, { method: 'POST', cookie: a.cookie, body: { type: 'MISSING', itemType: 'Towel', quantity: 1, description: 'Missing towel' }, expected: 400 });
    const complaint = (await request(`/orders/${order.id}/complaints`, { method: 'POST', cookie: a.cookie, body: { type: 'MISSING', itemType: 'Shirt', quantity: 1, description: 'One shirt missing' }, expected: 201 })).data.complaint;
    const update = (cookie, status, expected = 200) => request(`/complaints/${complaint.id}`, { method: 'PATCH', cookie, body: { status, message: 'Test response' }, expected });
    await update(staff.cookie, 'IN_PROGRESS');
    await update(staff.cookie, 'RESOLVED', 409);
    await update(staff.cookie, 'AWAITING_CONFIRMATION');
    await update(b.cookie, 'RESOLVED', 404);
    await update(a.cookie, 'IN_PROGRESS');
    await update(staff.cookie, 'AWAITING_CONFIRMATION');
    await update(a.cookie, 'RESOLVED');
    assert.equal((await request('/complaints', { cookie: a.cookie })).data.complaints[0].status, 'RESOLVED');
    // Collection releases the active-bag constraint.
    await request('/orders', { method: 'POST', cookie: a.cookie, body: { items: [{ type: 'Towel', quantity: 1 }] }, expected: 201 });
    await request('/auth/logout', { method: 'POST', cookie: a.cookie, body: {} });
  } finally {
    const ids = users.map(u => u.id);
    await prisma.complaint.deleteMany({ where: { order: { studentId: { in: ids } } } });
    await prisma.order.deleteMany({ where: { studentId: { in: ids } } });
    if (lotId) await prisma.lot.delete({ where: { id: lotId } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    await new Promise(resolve => server.close(resolve));
    await prisma.$disconnect();
  }
});

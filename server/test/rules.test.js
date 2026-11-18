const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateItems } = require('../src/rules');
test('accepts 15 clothes and rejects invalid quantities and duplicate types', () => {
  assert.equal(validateItems([{ type: 'Shirt', quantity: 8 }, { type: 'Pant', quantity: 7 }]), 15);
  for (const items of [[], [{ type: 'Shirt', quantity: 16 }], [{ type: 'Shirt', quantity: 1.5 }], [{ type: 'Shirt', quantity: '2' }], [{ type: 'Unknown', quantity: 2 }], [{ type: 'Shirt', quantity: 1 }, { type: 'Shirt', quantity: 2 }], [{ type: 'Shirt', quantity: 9 }, { type: 'Pant', quantity: 7 }]]) {
    assert.throws(() => validateItems(items));
  }
});

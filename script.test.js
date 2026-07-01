const assert = require('assert');
const { computeProgress, easeOutQuad, formatCounterValue } = require('./script.js');

// computeProgress
assert.strictEqual(computeProgress(0, 1000, 500), 0);
assert.strictEqual(computeProgress(500, 1000, 500), 100);
assert.strictEqual(computeProgress(250, 1000, 500), 50);
assert.strictEqual(computeProgress(-50, 1000, 500), 0, 'clamps below 0');
assert.strictEqual(computeProgress(9999, 1000, 500), 100, 'clamps above 100');
assert.strictEqual(computeProgress(100, 500, 500), 0, 'no scrollable area returns 0');

// easeOutQuad
assert.strictEqual(easeOutQuad(0), 0);
assert.strictEqual(easeOutQuad(1), 1);
assert.ok(Math.abs(easeOutQuad(0.5) - 0.75) < 1e-9);

// formatCounterValue
assert.strictEqual(formatCounterValue(32, '-', '%'), '-32%');
assert.strictEqual(formatCounterValue(1200, '~', ''), '~1,200');
assert.strictEqual(formatCounterValue(4, '', 'x'), '4x');
assert.strictEqual(formatCounterValue(90, '70–', '%'), '70–90%');

console.log('All script.js unit tests passed.');

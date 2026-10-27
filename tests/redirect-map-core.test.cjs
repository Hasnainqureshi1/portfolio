const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../js/redirect-map-core.js');
const fs = require('node:fs');
const header = 'source_path,destination_path,decision,status_code\n';
test('original and manually reviewed examples produce expected review outcomes', () => {
  const inventory = 'path\n/old\n/contact\n/retired\n/missing\n';
  const original = core.review(fs.readFileSync('resources/redirect-map-example.csv', 'utf8'), inventory);
  assert.deepEqual(original.issues.map(x => x.type).sort(), ['chain', 'loop', 'loop', 'unmapped']);
  const reviewed = core.review(fs.readFileSync('resources/redirect-map-reviewed-example.csv', 'utf8'), inventory);
  assert.equal(reviewed.issues.length, 0);
  assert.equal(reviewed.inventoryCount, 4);
});
test('competing sources are excluded and incoming redirects are blocked', () => {
  const result = core.review(header + '/old,/x,redirect,301\n/x,/a,redirect,301\n/x,/b,redirect,301\n', 'path\n/x\n');
  assert.equal(result.issues.filter(x => x.type === 'duplicate').length, 2);
  assert.ok(result.issues.some(x => x.type === 'blocked'));
  assert.ok(result.issues.some(x => x.type === 'unmapped'));
});
test('keep and remove decisions have explicit different semantics', () => {
  const result = core.review(header + '/a,,keep,200\n/b,,remove,410\n/c,/b,redirect,301\n');
  assert.equal(result.validDecisions, 3);
  assert.deepEqual(result.issues.map(x => x.type), ['removed-target']);
});
test('unsupported paths never become valid decisions', () => {
  for (const path of ['https://example.com/a', '//host/a', '/a?x=1', '/a#x', '/a/../b', '/%2e%2e/b', '/a%2fb', '/a\\b', '/a b', '/a*', '/%zz']) {
    assert.equal(core.validPath(path), false, path);
  }
  assert.equal(core.validPath('/Floor-Plan.pdf'), true);
});
test('path case and trailing slash are deliberately distinct', () => {
  const result = core.review(header + '/a,/A,redirect,301\n/a/,,keep,200\n');
  assert.equal(result.issues.length, 0);
  assert.equal(result.validDecisions, 2);
});
test('self redirects are loops and malformed decisions are invalid', () => {
  const result = core.review(header + '/a,/a,redirect,301\n/b,/c,keep,200\n/c,,remove,200\n/d,/e,unknown,301\n');
  assert.ok(result.issues.some(x => x.type === 'loop'));
  assert.equal(result.issues.filter(x => x.type === 'invalid').length, 3);
});
test('CSV syntax, headers, shape and inventory format are validated', () => {
  assert.throws(() => core.review('source_path,destination_path\n/a,"bad'));
  assert.throws(() => core.review('from,to\n/a,/b'));
  assert.throws(() => core.review('source_path,source_path,destination_path\n/a,/a,/b'));
  assert.throws(() => core.review(header + '/a,/b,redirect,301\n', 'wrong\n/a'));
  assert.ok(core.review(header + '/a,/b,redirect\n').issues.some(x => x.type === 'invalid'));
});
test('semicolon CSV and existing_path inventory are accepted', () => {
  const result = core.review('source_path;destination_path\n/a;/b\n', 'existing_path,owner\n/a,editor\n');
  assert.equal(result.inventoryCount, 1);
  assert.equal(result.issues.length, 0);
});

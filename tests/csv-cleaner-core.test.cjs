const { test } = require('node:test');
const assert = require('node:assert/strict');
const csv = require('../js/csv-cleaner-core.js');
const defaults = { header: true, trim: false, blank: false, duplicates: false, protect: false, ragged: 'block' };

test('quoted commas, escaped quotes, CRLF and multiline fields round-trip without changing strings', () => {
  const source = '\uFEFFID,Note,Value\r\n001,"Hello, ""world""\r\nNext line",00042\r\n002,plain,-3\r\n';
  const rows = csv.parse(source);
  assert.equal(rows[1].cells[1], 'Hello, "world"\r\nNext line');
  assert.equal(rows[2].line, 4);
  const result = csv.analyse(rows, defaults);
  const again = csv.parse(csv.stringify([result.header, ...result.output.map(r => r.cells)]));
  assert.deepEqual(again.map(r => r.cells), rows.map(r => r.cells));
});
test('malformed quoting fails instead of exporting a partial file', () => {
  for (const input of ['a,b\n1,"unfinished', 'a,b\n1,"ok"junk', 'a,b\n1,ab"cd']) assert.throws(() => csv.parse(input));
});
test('recognises all supported delimiters despite quoted separators', () => {
  for (const separator of [',',';','\t','|']) {
    const source = csv.stringify([['Name','Details'],['Alice','has, comma; and | pipe'],['Bob','normal']], separator);
    assert.equal(csv.detect(source), separator);
  }
});
test('no cleanup happens by default; trimming changes duplicate matching only when chosen', () => {
  const records = csv.parse('id,name\n001, Alice \n001,Alice\n,\n');
  const original = records.map(r => [...r.cells]);
  const keep = csv.analyse(records, defaults);
  assert.equal(keep.counts.output,3);assert.equal(keep.counts.duplicate,0);
  const cleaned = csv.analyse(records, {...defaults,trim:true,blank:true,duplicates:true});
  assert.equal(cleaned.counts.output,1);assert.equal(cleaned.counts.removed,2);
  assert.equal(cleaned.output[0].cells[0],'001');assert.equal(cleaned.counts.trimmed,1);
  assert.deepEqual(records.map(r => r.cells),original);
});
test('short rows can be padded; long rows still block; exclusion must be chosen', () => {
  const rows = csv.parse('a,b\n1\n2,3,4\n5,6');
  const blocked = csv.analyse(rows,defaults);assert.equal(blocked.blockers,2);assert.equal(blocked.counts.output,3);
  const padded = csv.analyse(rows,{...defaults,ragged:'pad'});assert.equal(padded.blockers,1);assert.deepEqual(padded.output[0].cells,['1','']);
  const excluded = csv.analyse(rows,{...defaults,ragged:'exclude'});assert.equal(excluded.blockers,0);assert.equal(excluded.counts.removed,2);assert.deepEqual(excluded.output[0].cells,['5','6']);
});
test('blank or repeated headers block downloads and are not silently renamed', () => {
  for (const text of ['name,Name\na,b','name,\na,b']) assert(csv.analyse(csv.parse(text),defaults).blockers>0);
});
test('formula detection is separate from optional text modification', () => {
  const rows=csv.parse('id,value\n001,=SUM(A1)\n002,-12\n003,normal');
  const base=csv.analyse(rows,defaults);assert.equal(base.counts.formula,2);assert.equal(base.counts.protected,0);assert.equal(base.output[1].cells[1],'-12');
  const protectedResult=csv.analyse(rows,{...defaults,protect:true});assert.equal(protectedResult.counts.protected,2);assert.equal(protectedResult.output[1].cells[1],"'-12");
});
test('headerless files, empty quoted fields, trailing delimiters and final newlines', () => {
  assert.deepEqual(csv.parse('a,b,\n"",,').map(r=>r.cells),[['a','b',''],['','','']]);
  assert.equal(csv.analyse(csv.parse('001,A\n002,B'),{...defaults,header:false}).counts.output,2);
  assert.equal(csv.parse('a,b\n').length,1);
  assert.throws(()=>csv.parse(''));
});
test('row and column limits fail explicitly', () => {
  assert.throws(()=>csv.parse(Array(101).fill('x').join(',')),/100 columns/);
  assert.throws(()=>csv.parse(Array(20002).fill('x').join('\n')),/20,000/);
});

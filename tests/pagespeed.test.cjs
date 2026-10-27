const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const modulePromise = import('data:text/javascript;base64,' + Buffer.from(fs.readFileSync('api/pagespeed.js')).toString('base64'));
function response() { return {headers:{},code:200,setHeader(k,v){this.headers[k]=v;},status(c){this.code=c;return this;},json(v){this.body=v;return this;}}; }
test('public page validation rejects credentials, local targets, unsupported schemes and ports',async()=>{
  const {publicPage}=await modulePromise;
  for(const url of ['file:///x','http://localhost/a','http://127.0.0.1/a','http://2130706433/','http://10.2.3.4/','http://172.18.0.1/','http://[::1]/','https://user:pass@example.com/','https://example.com:8080/']) assert.equal(publicPage(url),null,url);
  assert.equal(publicPage('https://example.com/page#part'),'https://example.com/page');
});
test('missing managed key uses an explicit fallback signal without an upstream request',async()=>{
  const {default:handler}=await modulePromise;const original=process.env.PAGESPEED_API_KEY;delete process.env.PAGESPEED_API_KEY;
  try{const res=response();await handler({method:'GET',query:{url:'https://example.com/'},headers:{}},res);assert.equal(res.code,503);assert.equal(res.body.error.code,'PAGESPEED_KEY_MISSING');}
  finally{if(original!==undefined)process.env.PAGESPEED_API_KEY=original;}
});
test('managed check calls only the fixed Google endpoint and hides provider/key errors',async()=>{
  const {default:handler}=await modulePromise;const oldKey=process.env.PAGESPEED_API_KEY,oldFetch=global.fetch;process.env.PAGESPEED_API_KEY='synthetic-test-key';
  try{
    global.fetch=async input=>{const url=new URL(input);assert.equal(url.origin,'https://www.googleapis.com');assert.equal(url.searchParams.get('url'),'https://example.com/');assert.equal(url.searchParams.get('key'),'synthetic-test-key');return {ok:false,status:429};};
    const res=response();await handler({method:'GET',query:{url:'https://example.com/'},headers:{'x-forwarded-for':'test-one'}},res);
    assert.equal(res.code,429);assert.ok(!JSON.stringify(res.body).includes('synthetic-test-key'));assert.equal(res.headers['Cache-Control'],'no-store');
  }finally{global.fetch=oldFetch;if(oldKey===undefined)delete process.env.PAGESPEED_API_KEY;else process.env.PAGESPEED_API_KEY=oldKey;}
});
test('invalid input and methods never reach the provider',async()=>{
  const {default:handler}=await modulePromise;let res=response();await handler({method:'POST'},res);assert.equal(res.code,405);
  res=response();await handler({method:'GET',query:{url:'https://example.com/',strategy:'invalid'}},res);assert.equal(res.code,400);
});

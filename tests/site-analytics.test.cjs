const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
function run({disabled=false, search='?utm_source=linkedin&utm_medium=social&utm_campaign=autumn-demo&email=private@example.com', privacy=false}={}) {
  const handlers = {}, scripts=[];
  const window = {};
  const context = { window, URL, URLSearchParams, navigator: {globalPrivacyControl:privacy}, location: {href:'https://hasnainqureshi.online/'+search,search,pathname:'/'}, localStorage: {getItem:()=>String(disabled)}, document: {title:'Example',referrer:'https://www.google.com/search?q=private',head:{append:s=>scripts.push(s)},createElement:()=>({}),addEventListener:(n,f)=>handlers[n]=f,querySelectorAll:()=>[]} };
  vm.runInNewContext(fs.readFileSync('js/site-analytics.js','utf8'),context);
  return {window,scripts,handlers};
}
test('campaign slugs survive while page and referrer query values stay private',()=>{
  const {window,scripts}=run(); const config=Array.from(window.dataLayer[1])[2];
  assert.equal(config.campaign_source,'linkedin');assert.equal(config.campaign_name,'autumn-demo');
  assert.equal(config.page_location,'https://hasnainqureshi.online/');assert.equal(config.page_referrer,'https://www.google.com/search');
  assert.ok(!JSON.stringify(config).includes('private'));assert.equal(scripts.length,1);
});
test('invalid campaign values are dropped; ordinary unknown query fields never enter events',()=>{
  const {window}=run({search:'?utm_source=person%40example.com&file=private-name.csv'});
  assert.equal(Array.from(window.dataLayer[1])[2].campaign_source,undefined);
  window.trackBusinessEvent('tool_complete',{filename:'private-name.csv',item_count:3,method:'arbitrary'});
  const payload=Array.from(window.dataLayer.at(-1))[2];assert.equal(payload.item_count,3);assert.equal(payload.method,undefined);
  assert.ok(!JSON.stringify(window.dataLayer).includes('private-name'));
});
test('saved opt-out and GPC suppress all loader and tool/contact events',()=>{
  for(const options of [{disabled:true},{privacy:true}]){
    const {window,scripts}=run(options);window.gtag=()=>{throw new Error('Must not send');};
    window.trackBusinessEvent('contact_click',{method:'email'});window.trackToolEvent('cost_calculate');assert.equal(scripts.length,0);
  }
});
test('legacy tool outcome names map to the common reporting events',()=>{
  const {window}=run();window.trackToolEvent('check_complete');window.trackToolEvent('cost_download');
  assert.equal(window.dataLayer.at(-2)[1],'tool_complete');assert.equal(window.dataLayer.at(-1)[1],'tool_download');
  assert.equal(window.dataLayer.at(-1)[2].export_format,'txt');
});
test('one delegated mailto click emits exactly one event',()=>{
  const {window,handlers}=run();const before=window.dataLayer.length;
  const link={dataset:{},getAttribute:()=> 'mailto:owner@example.com',hasAttribute:()=>false};
  handlers.click({target:{closest:()=>link}});assert.equal(window.dataLayer.length-before,1);assert.equal(window.dataLayer.at(-1)[2].method,'email');
});

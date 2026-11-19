// node render_brand.js → avatar.png (800x800) and banner.png (2560x1440)
const {chromium}=require('playwright'),path=require('path');
(async()=>{const b=await chromium.launch(),pg=await b.newPage({viewport:{width:2560,height:2400}});
await pg.goto('file://'+path.resolve(__dirname,'brand.html'));await pg.evaluate(()=>document.fonts.load('100px Anton'));
await pg.locator('#av').screenshot({path:path.resolve(__dirname,'avatar.png')});await pg.locator('#bn').screenshot({path:path.resolve(__dirname,'banner.png')});await b.close()})();

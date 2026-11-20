const {chromium}=require('playwright'),path=require('path');
(async()=>{const b=await chromium.launch(),pg=await b.newPage({viewport:{width:1280,height:720}});await pg.goto('file://'+path.resolve(__dirname,'thumb.html'));await pg.evaluate(()=>document.fonts.load('100px Anton'));await pg.screenshot({path:path.resolve(__dirname,'thumb_politesse.png')});await b.close()})();

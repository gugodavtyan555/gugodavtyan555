// node checkd.js <ep> — dialogue layout check: bubble height at end of every segment, cover text bounds
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
(async()=>{const ep=path.resolve(process.argv[2]),D={timeline:JSON.parse(fs.readFileSync(ep+'/timeline.json')),scenes:JSON.parse(fs.readFileSync(ep+'/scenes.json'))};
const b=await chromium.launch(),pg=await b.newPage({viewport:{width:1080,height:1920}});await pg.addInitScript(d=>{window.DATA=d},D);
pg.on('pageerror',e=>console.log('PAGEERR',e.message));await pg.goto('file://'+path.resolve(__dirname,'video.html'));await pg.evaluate(()=>document.fonts.load('100px Anton'));
let bad=0;await pg.evaluate(()=>render(0));
const c=await pg.evaluate(()=>['.ta','.tb span','.pill span','.stp'].map(s=>{const r=document.querySelector('#cover '+s).getBoundingClientRect();return[s,Math.round(r.left),Math.round(r.right)]}));
c.forEach(x=>{if(x[1]<0||x[2]>1080){console.log('COVER OVERFLOW',x);bad++}});
for(const s of D.timeline.segments){await pg.evaluate(t=>render(t),s.end-.05);const r=await pg.evaluate(()=>{const e=document.querySelector('#bub').getBoundingClientRect();return Math.round(e.bottom)});if(r>880){console.log('BUBBLE LOW',s.id,r);bad++}}
console.log(bad?'ISSUES '+bad:'layout ok');await b.close()})();

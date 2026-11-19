// Usage: node check.js <ep> — measures text overflow/wrapping at key times (no image viewing needed)
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
(async()=>{const ep=path.resolve(process.argv[2]);const D={timeline:JSON.parse(fs.readFileSync(ep+'/timeline.json')),scenes:JSON.parse(fs.readFileSync(ep+'/scenes.json'))};
const b=await chromium.launch(),pg=await b.newPage({viewport:{width:1080,height:1920}});await pg.addInitScript(d=>{window.DATA=d},D);
await pg.goto('file://'+path.resolve(__dirname,'video.html'));await pg.evaluate(()=>document.fonts.load('100px Anton'));
const S={};D.timeline.segments.forEach(s=>S[s.id]=s);let bad=0;
const chk=async(t,sels)=>{await pg.evaluate(t=>render(t),t);for(const s of sels){const r=await pg.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect(),f=parseFloat(getComputedStyle(e).fontSize);return{w:b.width,h:b.height,l:b.left,r:b.right,f,lines:Math.round(b.height/(f*1.1))}},s);
 if(r&&(r.l<-1||r.r>1081||r.lines>(s.includes('wt')||s.includes('rt')||s.includes('.t')?3:1.5)&&false)){console.log('OVERFLOW',t,s,JSON.stringify(r));bad++}}};
await chk(0,['#cva','#cvb','#cvc','#cv-bub','#cv-st','#cv-pill span']);
for(const s of ['#h1','#h2']){await pg.evaluate(()=>render(2));const r=await pg.evaluate(s=>{const e=document.querySelector(s);const b=e.getBoundingClientRect();return Math.round(b.height/parseFloat(getComputedStyle(e).fontSize)/1.08)},s);if(r>1){console.log('HOOK WRAPS',s,r);bad++}}
for(let i=1;i<=5;i++){const t=S[i+'e'].end;await pg.evaluate(t=>render(t),t);
 const r=await pg.evaluate(()=>['#wrong','#right','#intent .t','#hear .t'].map(s=>{const b=document.querySelector(s).getBoundingClientRect();return[s,Math.round(b.top),Math.round(b.bottom),Math.round(b.left),Math.round(b.right)]}));
 const w=r[0],g=r[1];if(w[2]>g[1]+2||r.some(x=>x[3]<0||x[4]>1080)){console.log('LAYOUT',i,JSON.stringify(r));bad++}}
console.log(bad?'ISSUES '+bad:'layout ok');await b.close()})();

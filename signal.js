(()=>{if(window.__sg){window.__sg.stop();return}
const L=5,E=10;let T=[],el=null,w=0,l=0,sig=0,t0=0,p0=0,iv,run=1;
const b=document.createElement('div');
b.style.cssText='position:fixed;top:60px;left:8px;z-index:2147483647;background:#000c;color:#fff;font:700 15px system-ui;padding:8px 12px;border-radius:10px;min-width:150px;pointer-events:none';
document.body.appendChild(b);
const rx=/^\D{0,3}(\d[\d ]*[.,]\d{2,6})\D{0,3}$/;
const num=e=>{if(!e)return NaN;const t=(e.textContent||'').trim();if(t.length>16)return NaN;const m=t.match(rx);return m?parseFloat(m[1].replace(/ /g,'').replace(',','.')):NaN};
const docs=()=>{const a=[document];document.querySelectorAll('iframe').forEach(f=>{try{f.contentDocument&&a.push(f.contentDocument)}catch(e){}});return a};
const cands=()=>{let r=[];docs().forEach(d=>d.querySelectorAll('div,span,p,b,strong,td').forEach(e=>{if(e.childElementCount<=1&&!isNaN(num(e)))r.push(e)}));return r};
const snap=new Map();const add=()=>cands().forEach(e=>{if(!snap.has(e))snap.set(e,new Set());snap.get(e).add(num(e))});
add();b.textContent='Փնտրում եմ գինը… (4վ)';
const s1=setInterval(add,500);
setTimeout(()=>{clearInterval(s1);let best=1;snap.forEach((s,e)=>{if(s.size>best){best=s.size;el=e}});
if(el)start();else pick()},4000);
function pick(){b.textContent='Սեղմիր գնի թվին էկրանին (մեկ անգամ)';
const h=ev=>{const x=(ev.changedTouches?ev.changedTouches[0]:ev);let e=document.elementFromPoint(x.clientX,x.clientY),f=null;
for(let k=0;e&&k<4&&!f;k++,e=e.parentElement){if(!isNaN(num(e)))f=e;else{const c=[...e.querySelectorAll('*')].find(q=>!isNaN(num(q)));if(c)f=c}}
ev.preventDefault();ev.stopPropagation();
if(f){el=f;document.removeEventListener('click',h,true);document.removeEventListener('touchend',h,true);start()}else b.textContent='Թիվը չճանաչեցի, սեղմիր ճիշտ թվի վրա'};
document.addEventListener('click',h,true);document.addEventListener('touchend',h,true)}
function start(){iv=setInterval(tick,1000)}
function tick(){if(!run)return;const p=num(el);if(isNaN(p))return;T.push(p);if(T.length>100)T.shift();
const now=Date.now();
if(sig&&now-t0>=E*1000){const d=p-p0;if(d!==0){d*sig>0?w++:l++}sig=0}
if(!sig&&T.length>L){const d=p-T[T.length-1-L];sig=d>0?1:d<0?-1:0;if(sig){p0=p;t0=now;try{navigator.vibrate&&navigator.vibrate(200)}catch(e){}}}
const n=w+l,s=sig?Math.max(0,E-Math.floor((now-t0)/1000)):0;
b.style.background=sig>0?'#0a7a2fe6':sig<0?'#b3261ee6':'#000c';
b.innerHTML=(sig>0?'⬆ CALL':sig<0?'⬇ PUT':'սպասում…')+(sig?' · '+s+'վ':'')+'<br>'+p+'<br><small>Win '+w+' / Loss '+l+(n?' · '+Math.round(w/n*100)+'%':'')+'</small>'}
window.__sg={stop(){run=0;clearInterval(iv);b.remove();delete window.__sg}}})();

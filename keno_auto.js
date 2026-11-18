(function(){
if(window.__kenoAuto){window.__kenoAuto.panel.style.display='block';return}
const N=10, SETTLE=2500;
// --- 40 թվերի վանդակներ
function docs(d=document,out=[]){out.push(d);d.querySelectorAll('iframe').forEach(f=>{try{if(f.contentDocument)docs(f.contentDocument,out)}catch(e){}});return out}
function iframeInfo(){return [...document.querySelectorAll('iframe')].map(f=>{let ok=false;try{ok=!!f.contentDocument}catch(e){}return (ok?'OK ':'BLOCKED ')+(f.src||'').slice(0,200)}).join(' | ')}
function findCells(){
  const m={};
  docs().forEach(D=>D.querySelectorAll('div,button,span,li,td').forEach(e=>{
    if(e.children.length>0&&!(e.children.length===1&&/^\d+$/.test(e.textContent.trim())))return;
    const t=e.textContent.trim();
    if(/^\d{1,2}$/.test(t)){const n=+t;if(n>=1&&n<=40&&!m[n]&&e.offsetWidth>20)m[n]=e}
  }));
  return m;
}
let cells=findCells();
const sigOf=e=>{const s=e.ownerDocument.defaultView.getComputedStyle(e);return e.className+'|'+s.backgroundColor+'|'+s.borderColor+'|'+s.color+'|'+s.boxShadow};
const snap=()=>{const o={};for(let n=1;n<=40;n++)o[n]=cells[n]?sigOf(cells[n]):'';return o};
const snapKey=s=>Object.values(s).join('#');
// --- վահանակ
const p=document.createElement('div');
p.style.cssText='position:fixed;top:8px;left:8px;right:8px;z-index:2147483647;background:#000d;color:#fff;font:14px sans-serif;padding:10px;border-radius:10px;max-height:60vh;overflow:auto';
p.innerHTML='<b>Keno</b> <button id=ka_go style="padding:8px 12px">▶ 10 խաղ</button> <button id=ka_stop style="padding:8px 12px">■</button> <button id=ka_x style="padding:8px 12px">✕</button><div id=ka_st></div><div id=ka_res></div>';
document.body.appendChild(p);
const $=id=>p.querySelector('#'+id), st=t=>$('ka_st').textContent=t;
$('ka_x').onclick=()=>p.style.display='none';
// --- վիճակ
const rounds=[]; let base=null, lastKey=null, lastChange=Date.now(), recordedKey=null, sawChange=true, running=false, target=0;
function record(cur){
  const drawn=[];for(let n=1;n<=40;n++)if(cur[n]!==base[n])drawn.push(n);
  if(drawn.length<5)return false;
  rounds.push(drawn);show();return true;
}
function analyze(){
  const R=rounds.slice(-N),single={},tri={};
  R.forEach((r,ri)=>{r.forEach(n=>single[n]=(single[n]||0)+1);
    for(let i=0;i<r.length;i++)for(let j=i+1;j<r.length;j++)for(let k=j+1;k<r.length;k++){
      const key=r[i]+'-'+r[j]+'-'+r[k],o=tri[key]||(tri[key]={c:0,last:0});o.c++;o.last=ri}});
  return Object.entries(tri).map(([k,o])=>({k,c:o.c,s:k.split('-').reduce((a,n)=>a+single[n],0),last:o.last}))
    .sort((a,b)=>b.c-a.c||b.s-a.s||b.last-a.last).slice(0,5);
}
function show(){
  const last=rounds[rounds.length-1]||[];
  let h='Խաղափուլ՝ '+rounds.length+' | վերջինը ('+last.length+'): '+last.join(' ');
  if(rounds.length>=3){const a=analyze();
    h+='<hr><b>Հաջորդ եռյակ՝ '+(a[0]?a[0].k.replace(/-/g,' · '):'-')+'</b> ('+(a[0]?a[0].c:0)+' անգամ)<br>'+
      a.slice(1).map(x=>x.k.replace(/-/g,' · ')+' ('+x.c+')').join('<br>');}
  $('ka_res').innerHTML=h;
}
// --- Bet կոճակ
function betBtn(){
  let best=null,area=0;
  docs().forEach(D=>D.querySelectorAll('button,div,span').forEach(e=>{
    if(e.children.length>1||e.textContent.trim().toLowerCase()!=='bet')return;
    let t=e;while(t.parentElement&&t.offsetWidth<e.parentElement.offsetWidth&&false)t=t.parentElement;
    const r=e.getBoundingClientRect(),a=r.width*r.height;if(a>area){area=a;best=e}
  }));
  return best;
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// --- ստուգում (polling)
setInterval(()=>{
  if(!Object.keys(cells).length||Object.keys(cells).length<40||!document.contains(cells[1]))cells=findCells();
  if(Object.keys(cells).length<40){st('Վանդակներ '+Object.keys(cells).length+'/40. iframe: '+(iframeInfo()||'չկա'));return}
  const cur=snap(),key=snapKey(cur);
  if(!base){base=cur;lastKey=key;st('Պատրաստ է. ընտրիր թվերը և սեղմիր ▶');return}
  if(key!==lastKey){lastKey=key;lastChange=Date.now();sawChange=true;return}
  if(Date.now()-lastChange>SETTLE&&sawChange&&key!==snapKey(base)){
    if(record(cur)){sawChange=false;recordedKey=key}
  }
},400);
// եթե ընտրված թվերը փոխվեն (idle վիճակում) — նորից սահմանել base
document.addEventListener('click',e=>{if(!running&&!p.contains(e.target)){setTimeout(()=>{base=null;sawChange=true},300)}},true);
// --- ավտո 10 խաղ
$('ka_go').onclick=async()=>{
  if(running)return;running=true;rounds.length=0;show();
  for(let i=0;i<N&&running;i++){
    const b=betBtn();if(!b){st('Bet կոճակը չի գտնվել');break}
    const before=rounds.length;st('Խաղ '+(i+1)+'/'+N);b.click();
    const t0=Date.now();
    while(running&&rounds.length===before&&Date.now()-t0<45000)await sleep(400);
    if(rounds.length===before){st('Արդյունքը չհայտնաբերվեց (խաղ '+(i+1)+')');break}
    await sleep(800);
  }
  running=false;st('Ավարտ. տես հաջորդ եռյակը');show();
};
$('ka_stop').onclick=()=>{running=false;st('Կանգնեցված')};
window.__kenoAuto={panel:p,rounds};
})();

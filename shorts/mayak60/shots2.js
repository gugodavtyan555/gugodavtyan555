// Дополнительные сцены для длинной версии «Маяк» (60+ c). Подключается после основного скрипта page.html
const YOUNG={col:'#7389ad',hat:'#2a2f44',rim:'rgba(170,195,255,0.55)'};
const SCARF='#b5483f';
function rain(c,T,n=150,a=0.35,ang=0.28){c.save();c.strokeStyle=`rgba(190,210,255,${a})`;c.lineWidth=2.4;c.lineCap='round';const r=rng(77);c.beginPath();for(let i=0;i<n;i++){const sp=1500+r()*900,x0=r()*1700-100,y0=r()*2200,len=44+r()*56;const y=((y0+T*sp)%2200)-140,x=x0-(y*ang);c.moveTo(x,y);c.lineTo(x-len*ang,y+len)}c.stroke();c.restore()}
function lightningAmt(T){let f=0;for(const L of window.DATA.lightning){const k=T-L;if(k>0&&k<0.5){f=Math.max(f,k<0.05?1:k<0.11?0.3:k<0.17?0.85:1-ease((k-0.17)/0.33))}}return f}
function bolt(c,x,y0,y1,seed,a){const r=rng(seed);c.save();c.globalCompositeOperation='lighter';c.strokeStyle=`rgba(225,232,255,${a})`;c.lineWidth=7;c.lineJoin='round';c.shadowColor='rgba(170,190,255,0.95)';c.shadowBlur=46;c.beginPath();let xx=x;c.moveTo(xx,y0);for(let y=y0;y<y1;y+=70){xx+=(r()-0.5)*120;c.lineTo(xx,y+70);if(r()<0.25){c.moveTo(xx,y+70);c.lineTo(xx+(r()-0.5)*220,y+190);c.moveTo(xx,y+70)}}c.stroke();c.restore()}
const waveY=(x,yb,amp,wl,sp,T)=>yb+Math.sin(x/wl+T*sp)*amp+Math.sin(x/(wl*0.43)+T*sp*1.7+1)*amp*0.38;
function waveLayer(c,yb,amp,wl,sp,T,top,bot,foam){c.beginPath();c.moveTo(-60,H+20);for(let x=-60;x<=W+60;x+=20)c.lineTo(x,waveY(x,yb,amp,wl,sp,T));c.lineTo(W+60,H+20);c.closePath();const g=c.createLinearGradient(0,yb-amp,0,yb+300);g.addColorStop(0,top);g.addColorStop(1,bot);c.fillStyle=g;c.fill();
 if(foam){c.strokeStyle=foam;c.lineWidth=7;c.lineJoin='round';c.beginPath();for(let x=-60;x<=W+60;x+=20){const y=waveY(x,yb,amp,wl,sp,T);x==-60?c.moveTo(x,y):c.lineTo(x,y)}c.stroke()}}
function boatDraw(c,x,y,rot,s,T,o={}){c.save();c.translate(x,y);c.rotate(rot);c.scale(s,s);
 c.strokeStyle='#2c1f18';c.lineWidth=9;c.lineCap='round';c.beginPath();c.moveTo(14,-14);c.lineTo(14,-230);c.stroke();
 c.fillStyle=o.sail||'#e6dcc8';c.beginPath();if(o.torn){c.moveTo(20,-222);c.lineTo(20,-120);c.lineTo(60+Math.sin(T*14)*10,-150);c.lineTo(48+Math.sin(T*11)*8,-178);c.lineTo(92+Math.sin(T*13)*14,-196);c.closePath()}else{c.moveTo(20,-222);c.quadraticCurveTo(70+Math.sin(T*2)*6,-130,20,-44);c.lineTo(116,-52);c.closePath()}c.fill();
 if(o.boy){stick(c,{x:-46,y:-6,s:0.62,face:o.boyFace||1,col:'#e3a84a',scarf:SCARF,t:T+(o.torn?T*2:0),shadow:false,rim:o.rim,eyes:o.eyes,pose:o.pose||{crouch:0.45,legL:[1.3,0.1],legR:[1.2,0.0],armL:[2.6+Math.sin(T*7)*0.3,2.9+Math.sin(T*7)*0.3],armR:[0.6,1.2]}})}
 const g=c.createLinearGradient(0,-22,0,50);g.addColorStop(0,o.hull||'#7a5236');g.addColorStop(1,'#2e1d14');c.fillStyle=g;c.beginPath();c.moveTo(-128,-24);c.lineTo(132,-24);c.quadraticCurveTo(110,44,60,46);c.lineTo(-70,46);c.quadraticCurveTo(-112,40,-128,-24);c.closePath();c.fill();
 c.strokeStyle='rgba(255,255,255,0.14)';c.lineWidth=4;c.beginPath();c.moveTo(-120,-6);c.lineTo(122,-6);c.stroke();c.restore()}
function darkHouse(c,x,gy,w,h,col,roof,seed){c.fillStyle=col;c.fillRect(x,gy-h,w,h);c.fillStyle=roof;c.beginPath();c.moveTo(x-18,gy-h);c.lineTo(x+w/2,gy-h-w*0.42);c.lineTo(x+w+18,gy-h);c.closePath();c.fill();
 const r=rng(seed);for(let yy=gy-h+40;yy<gy-90;yy+=120)for(let xx=x+34;xx<x+w-70;xx+=110){if(r()<0.72){c.fillStyle='#0b0915';c.fillRect(xx,yy,52,68);if(r()<0.45){c.strokeStyle='#2c2438';c.lineWidth=9;c.beginPath();c.moveTo(xx-6,yy+6);c.lineTo(xx+58,yy+60);c.moveTo(xx+58,yy+8);c.lineTo(xx-6,yy+62);c.stroke()}}}}
function street(c,gy){const g=c.createLinearGradient(0,gy,0,H);g.addColorStop(0,'#2a2238');g.addColorStop(1,'#0a0812');c.fillStyle=g;c.fillRect(-200,gy,W+400,H-gy);c.strokeStyle='rgba(255,255,255,0.045)';c.lineWidth=3;for(let i=0;i<9;i++){const y=gy+18+i*i*7;c.beginPath();for(let x=-200+((i%2)*40);x<W+200;x+=90+i*8){c.moveTo(x,y);c.lineTo(x+52+i*5,y)}c.stroke()}}
function suitcase(c,p,s,col){c.fillStyle=col;c.beginPath();c.roundRect(p.x-44*s,p.y+8*s,88*s,70*s,10*s);c.fill();c.strokeStyle='#15121c';c.lineWidth=6*s;c.beginPath();c.arc(p.x,p.y+10*s,16*s,Math.PI,0);c.stroke();c.strokeStyle='rgba(0,0,0,0.3)';c.lineWidth=5*s;c.beginPath();c.moveTo(p.x-44*s,p.y+40*s);c.lineTo(p.x+44*s,p.y+40*s);c.stroke()}
function bubble(c,x,y,w,h,tx,ty,lines,size,k,fill='#15131c'){if(k<=0)return;c.save();c.translate(x+w/2,y+h/2);c.scale(k,k);c.translate(-(x+w/2),-(y+h/2));c.fillStyle='#fbf7ee';c.strokeStyle='#0c0c12';c.lineWidth=10;c.lineJoin='round';c.beginPath();c.roundRect(x,y,w,h,60);c.moveTo(tx-50,y+h-4);c.lineTo(tx,ty);c.lineTo(tx+50,y+h-4);c.stroke();c.fill();c.beginPath();c.moveTo(tx-50,y+h-6);c.lineTo(tx,ty);c.lineTo(tx+50,y+h-6);c.fill();
 c.fillStyle=fill;c.font=`900 ${size}px M`;c.textAlign='center';c.textBaseline='middle';const lh=size*1.12;lines.forEach((l,i)=>c.fillText(l,x+w/2,y+h/2+(i-(lines.length-1)/2)*lh));c.restore()}

function lighthouse(c,x,by,h,t,off){const wb=h*0.25,wt=h*0.155,ty=by-h*0.78;
 c.save();c.beginPath();c.moveTo(x-wb/2,by);c.lineTo(x-wt/2,ty);c.lineTo(x+wt/2,ty);c.lineTo(x+wb/2,by);c.closePath();c.clip();
 const g=c.createLinearGradient(x-wb/2,0,x+wb/2,0);if(off){g.addColorStop(0,'#3a3d52');g.addColorStop(1,'#12131f')}else{g.addColorStop(0,'#eeeadf');g.addColorStop(0.45,'#bdb9bf');g.addColorStop(1,'#4d4b62')}c.fillStyle=g;c.fillRect(x-wb,ty,wb*2,by-ty);
 const g2=c.createLinearGradient(x-wb/2,0,x+wb/2,0);if(off){g2.addColorStop(0,'#3d2028');g2.addColorStop(1,'#140a10')}else{g2.addColorStop(0,'#c9564a');g2.addColorStop(0.5,'#93372f');g2.addColorStop(1,'#3d1a22')}c.fillStyle=g2;for(const k of [0.08,0.4,0.72])c.fillRect(x-wb,ty+(by-ty)*k,wb*2,(by-ty)*0.16);
 c.restore();
 c.fillStyle='#1b1722';c.beginPath();c.roundRect(x-h*0.035,by-h*0.11,h*0.07,h*0.11,[h*0.035,h*0.035,0,0]);c.fill();
 if(!off){glow(c,x,by-h*0.05,h*0.1,'rgba(255,180,90,A)',0.5);c.fillStyle='#ffc978';c.beginPath();c.roundRect(x-h*0.022,by-h*0.095,h*0.044,h*0.095,[h*0.022,h*0.022,0,0]);c.fill()}
 c.fillStyle=off?'#0c0d16':'#ffd58a';for(const k of [0.3,0.62]){c.beginPath();c.roundRect(x-h*0.016,ty+(by-ty)*k,h*0.032,h*0.05,h*0.016);c.fill()}
 c.fillStyle='#141220';c.fillRect(x-wt*0.95,ty-h*0.02,wt*1.9,h*0.022);c.strokeStyle='#141220';c.lineWidth=h*0.006;for(let i=0;i<=8;i++){const xx=x-wt*0.9+i*wt*1.8/8;c.beginPath();c.moveTo(xx,ty-h*0.02);c.lineTo(xx,ty-h*0.06);c.stroke()}c.beginPath();c.moveTo(x-wt*0.92,ty-h*0.06);c.lineTo(x+wt*0.92,ty-h*0.06);c.stroke();
 const ly=ty-h*0.085,lw2=wt*0.62;
 c.fillStyle=off?'#141624':'#fff0b8';c.fillRect(x-lw2/2,ty-h*0.15,lw2,h*0.13);c.strokeStyle='#141220';c.lineWidth=h*0.008;c.strokeRect(x-lw2/2,ty-h*0.15,lw2,h*0.13);c.beginPath();c.moveTo(x,ty-h*0.15);c.lineTo(x,ty-h*0.02);c.stroke();
 c.fillStyle=off?'#2a1418':'#7c2b2b';c.beginPath();c.moveTo(x-lw2*0.72,ty-h*0.15);c.quadraticCurveTo(x,ty-h*0.27,x+lw2*0.72,ty-h*0.15);c.closePath();c.fill();c.beginPath();c.arc(x,ty-h*0.215,h*0.012,0,7);c.fill();
 return {x,y:ly}}

// ---------- 2-3: порт закрыли, причал сгнил ----------
function shotPier(c,t,d,T,m){const hy=1040;c.save();cam(c,540,960,1.06,lerp(30,-30,t/d),0);
 sky(c,['#060a1a','#0e1a36','#1d3358','#345278'],hy);stars(c,T,hy);clouds(c,T,560,'rgba(120,150,210,0.16)',31,5);moon(c,250,400,62);
 sea(c,hy,T,'#213c62','#050914',250);
 c.fillStyle='#0b1022';c.fillRect(900,hy-330,26,340);c.beginPath();c.moveTo(913,hy-330);c.lineTo(640,hy-250);c.lineTo(640,hy-236);c.lineTo(913,hy-296);c.fill();c.fillRect(646,hy-240,4,90);c.fillRect(860,hy-60,110,70);
 const py=1250,fall=m[1]!=null?t-m[1]-0.3:-1;
 c.fillStyle='#090c17';for(const [x,l,r] of [[430,330,0.05],[560,360,-0.03],[720,380,0.09],[880,400,-0.02],[1030,420,0.02]]){c.save();c.translate(x,py);c.rotate(r);c.fillRect(-11,0,22,l);c.restore()}
 c.strokeStyle='#090c17';c.lineWidth=8;c.beginPath();c.moveTo(430,py+120);c.lineTo(560,py+40);c.moveTo(720,py+40);c.lineTo(880,py+150);c.stroke();
 const r=rng(12);for(let i=0;i<18;i++){const x=400+i*42;if(i==3||i==9||i==10)continue;const broken=i==6;c.save();c.translate(x+19,py);
  if(broken){if(fall>0){c.translate(0,fall*fall*900);c.rotate(0.35+fall*2.4)}else c.rotate(0.35+Math.sin(T*2.2)*0.04)}else c.rotate((r()-0.5)*0.06);
  const g=c.createLinearGradient(0,-12,0,12);g.addColorStop(0,'#46405c');g.addColorStop(1,'#1a1728');c.fillStyle=g;c.fillRect(-19,-11,38,22);c.restore()}
 if(fall>0.42){const k=fall-0.42;c.strokeStyle=`rgba(200,225,255,${0.65*(1-clamp(k/0.9))})`;c.lineWidth=4;for(const q of [1,1.7]){c.beginPath();c.ellipse(671,py+178,40+k*130*q,8+k*22*q,0,0,7);c.stroke()}}
 c.fillStyle='#090c17';c.fillRect(770,py-330,16,330);c.fillRect(1000,py-330,16,330);
 c.save();c.translate(778,py-300);c.rotate(0.14+Math.sin(T*1.7)*0.04);c.fillStyle='#cfc6ae';c.beginPath();c.roundRect(-6,20,250,128,8);c.fill();c.fillStyle='#8b2e2a';c.fillRect(-6,20,250,24);
 c.fillStyle='#2a2430';c.font='900 42px M';c.textAlign='center';c.fillText('ПОРТ',119,88);c.fillText('ЗАКРЫТ',119,132);c.restore();
 rocks(c,[[-80,1760],[80,1690],[260,1730],[460,1790],[640,1800]],'#070a14','#020308');
 c.restore()}
// ---------- 4: рыбаки уехали ----------
function shotLeave(c,t,d,T){const gy=1330;c.save();cam(c,540,1000,1.05,lerp(10,-20,t/d),0);
 sky(c,['#0b0a1f','#1c1838','#3a2a52','#6a4460'],gy);stars(c,T,650,0.7);
 darkHouse(c,-80,gy,330,470,'#171428','#100e1e',2);darkHouse(c,280,gy,280,380,'#1c1832','#131024',5);darkHouse(c,590,gy,240,430,'#171428','#100e1e',8);
 street(c,gy);
 // указатель
 c.fillStyle='#0d0b18';c.fillRect(905,gy-420,16,420);c.save();c.translate(913,gy-380);c.rotate(-0.04);c.fillStyle='#d8cfb6';c.beginPath();c.moveTo(-130,-46);c.lineTo(90,-46);c.lineTo(140,0);c.lineTo(90,46);c.lineTo(-130,46);c.closePath();c.fill();c.fillStyle='#2a2430';c.font='900 46px M';c.textAlign='center';c.textBaseline='middle';c.fillText('ГОРОД',-14,3);c.restore();
 const m0=stick(c,{...OLD,rim:'rgba(255,200,120,0.3)',x:110,y:gy+30,s:1.0,face:1,t:T,eyes:{sad:true,dy:4},pose:{lean:0.1,armL:[0.4,0.9],bob:Math.sin(T*1.5)*2}});lantern(c,m0.hf,1.0,T);
 const V=[['#e07a5f',1.12,0,'#8a5a3c'],['#7fb69a',1.2,1.7,'#5b6f8a'],['#e9c46a',0.86,3.1,'#9a4a4a']];
 V.forEach(([col,s,p,sc],i)=>{const x=lerp(330,900,t/d)+i*170,ph=T*6+p;const w=walk(ph,0.42);const mm=stick(c,{x,y:gy+40+i*14,s,face:1,col,t:T,rim:'rgba(200,170,255,0.3)',eyes:{dy:5},pose:{...w,lean:0.12,armL:[0.25,0.4],armR:[-0.1,0.15]}});suitcase(c,mm.hf,s,sc)});
 c.restore()}
// ---------- 5: остался только Матвей ----------
function shotAlone(c,t,d,T){const gy=1330;c.save();cam(c,540,1050,lerp(1.55,1.0,ease(t/d)),0,0);
 sky(c,['#080817','#141230','#2a2247','#463454'],gy);stars(c,T,700,0.9);
 c.fillStyle='#120f24';c.beginPath();c.moveTo(900,gy-380);c.lineTo(912,gy-640);c.lineTo(946,gy-640);c.lineTo(958,gy-380);c.fill();c.fillRect(905,gy-668,48,30);beam(c,{x:929,y:gy-654},T*1.5,620,0.55);
 darkHouse(c,-60,gy,330,470,'#151226','#0e0c1b',2);darkHouse(c,300,gy,280,380,'#19152d','#110e20',5);darkHouse(c,610,gy,250,440,'#151226','#0e0c1b',8);darkHouse(c,880,gy,300,340,'#1a1630','#110e20',11);
 street(c,gy);
 c.strokeStyle='#0d0b18';c.lineWidth=14;c.lineCap='round';c.beginPath();c.moveTo(150,gy);c.lineTo(150,gy-560);c.quadraticCurveTo(150,gy-620,215,gy-620);c.stroke();c.fillStyle='#23202e';c.beginPath();c.arc(225,gy-604,17,0,7);c.fill();
 const m=stick(c,{...OLD,rim:'rgba(170,195,255,0.4)',x:540,y:gy+40,s:1.0,face:-1,t:T,scarf:SCARF,eyes:{sad:true,dy:4,blink:(t>1.0&&t<1.15)?1:0},pose:{lean:0.08,armL:[0.4,0.9],bob:Math.sin(T*1.5)*2}});lantern(c,m.hf,1.0,T);
 const r=rng(40);c.fillStyle='rgba(160,120,80,0.7)';for(let i=0;i<14;i++){const sp=260+r()*240,x=W+100-((r()*1400+T*sp)%1400),y=gy-60+r()*150+Math.sin(T*3+i)*24;c.save();c.translate(x,y);c.rotate(T*4+i);c.beginPath();c.ellipse(0,0,10,5,0,0,7);c.fill();c.restore()}
 c.restore()}
// ---------- 6: 140 ступеней ----------
function shotStairs(c,t,d,T){const FH=300,yb=0,u=0.25+t*0.62,n=Math.floor(u),f=u-n,ev=n%2==0;
 const mx=ev?270+f*540:810-f*540,my=yb-(n+f)*FH;
 c.fillStyle='#07060d';c.fillRect(0,0,W,H);
 c.save();c.translate(0,1120-my);
 const y0=my-1300,y1=my+900;const g=c.createLinearGradient(170,0,910,0);g.addColorStop(0,'#15131f');g.addColorStop(0.5,'#262238');g.addColorStop(1,'#15131f');c.fillStyle=g;c.fillRect(170,y0,740,y1-y0);
 c.strokeStyle='rgba(0,0,0,0.28)';c.lineWidth=3;for(let y=Math.floor(y0/60)*60;y<y1;y+=60){c.beginPath();c.moveTo(170,y);c.lineTo(910,y);c.stroke();const o=(Math.round(y/60)%2)*55;for(let x=170+o;x<910;x+=110){c.beginPath();c.moveTo(x,y);c.lineTo(x,y+60);c.stroke()}}
 for(let k=n-3;k<=n+5;k++){const e=((k%2)+2)%2==0,xa=e?270:810,dir=e?1:-1,ya=yb-k*FH;
  // окно на противоположной стене
  if(((k%2)+2)%2==0){const wx=870,wy=ya-FH*0.9;c.save();c.globalCompositeOperation='lighter';const lg=c.createLinearGradient(wx,0,wx-560,0);lg.addColorStop(0,'rgba(150,180,255,0.22)');lg.addColorStop(1,'rgba(150,180,255,0)');c.fillStyle=lg;c.beginPath();c.moveTo(wx,wy-50);c.lineTo(wx-560,wy+120);c.lineTo(wx-560,wy+330);c.lineTo(wx,wy+50);c.fill();c.restore();c.fillStyle='#9fb8e8';c.beginPath();c.roundRect(wx-18,wy-56,36,112,18);c.fill()}
  for(let s2=0;s2<10;s2++){const x=xa+dir*s2*54,y=ya-(s2+1)*30;c.fillStyle='#0c0b14';c.fillRect(Math.min(x,x+dir*54),y,54,44);c.fillStyle='#3a3552';c.fillRect(Math.min(x,x+dir*54),y,54,7)}
  c.fillStyle='#0c0b14';c.fillRect(e?810:170,ya-FH,100,20);
  }
 const ph=T*8;const m=stick(c,{...OLD,rim:'rgba(255,200,120,0.5)',x:mx,y:my,s:0.8,face:ev?1:-1,t:T,shadow:false,pose:{...walk(ph,0.55),lean:0.24,armL:[0.8,1.5]}});lantern(c,m.hf,0.8,T,1.15);
 c.restore();
 const g2=c.createLinearGradient(0,0,0,H);g2.addColorStop(0,'rgba(4,3,10,0.9)');g2.addColorStop(0.25,'rgba(4,3,10,0)');g2.addColorStop(0.72,'rgba(4,3,10,0)');g2.addColorStop(1,'rgba(4,3,10,0.92)');c.fillStyle=g2;c.fillRect(0,0,W,H);
 c.fillStyle='#07060d';c.fillRect(0,0,170,H);c.fillRect(910,0,170,H);
 const num=Math.min(140,Math.floor(lerp(84,141,ease(t/(d-0.5)))));bigText(c,String(num),W/2,290,230,'#ffd60a',1+0.04*Math.sin(T*16),0,26);bigText(c,'СТУПЕНЕЙ',W/2,455,74,'#fff',1,0,14)}
// ---------- 7-8: протирает стекло, зажигает огонь ----------
function shotLamp(c,t,d,T,m){const ig=m[1]!=null?t-m[1]-0.35:-1,on=ig>0,pw=on?easeOut(ig/0.7):0,fy=1330;
 c.save();cam(c,540,900,1.0+0.05*ease(t/d),0,0);
 sky(c,['#060a1c','#101c40','#22386a','#3a5686'],H);stars(c,T,1100);moon(c,880,330,48);
 // рамы
 c.fillStyle='#0b0a14';for(let x=-20;x<W+40;x+=212)c.fillRect(x,0,22,1120);c.fillRect(0,0,W,150);c.beginPath();c.moveTo(0,150);c.quadraticCurveTo(540,260,W,150);c.lineTo(W,0);c.lineTo(0,0);c.fill();
 const wg=c.createLinearGradient(0,1100,0,H);wg.addColorStop(0,'#191628');wg.addColorStop(1,'#07060d');c.fillStyle=wg;c.fillRect(0,1100,W,H-1100);c.fillStyle='#262238';c.fillRect(0,1100,W,16);c.fillStyle='#0d0c15';c.fillRect(0,fy,W,H-fy);
 // пьедестал и линза
 const lx=600,ly=760;const pg=c.createLinearGradient(lx-80,0,lx+80,0);pg.addColorStop(0,'#3b3a4c');pg.addColorStop(1,'#14131d');c.fillStyle=pg;c.fillRect(lx-70,1000,140,330);c.fillRect(lx-120,990,240,30);c.fillRect(lx-110,1300,220,30);
 if(on){glow(c,lx,ly,300+900*pw,'rgba(255,190,90,A)',0.55*pw);c.save();c.globalCompositeOperation='lighter';c.filter='blur(10px)';for(const dr of [1,-1]){const bg=c.createLinearGradient(lx,0,lx+dr*900,0);bg.addColorStop(0,`rgba(255,236,170,${0.55*pw})`);bg.addColorStop(1,'rgba(255,236,170,0)');c.fillStyle=bg;c.beginPath();c.moveTo(lx,ly-40);c.lineTo(lx+dr*900,ly-260);c.lineTo(lx+dr*900,ly+200);c.lineTo(lx,ly+40);c.fill()}c.restore()}
 const lg=c.createRadialGradient(lx,ly,10,lx,ly,260);lg.addColorStop(0,on?`rgba(255,250,220,${0.55+0.45*pw})`:'rgba(170,215,235,0.30)');lg.addColorStop(1,on?`rgba(255,200,110,${0.35+0.3*pw})`:'rgba(120,170,200,0.12)');c.fillStyle=lg;c.beginPath();c.roundRect(lx-170,ly-235,340,470,150);c.fill();
 c.strokeStyle=on?'rgba(255,245,210,0.75)':'rgba(190,230,245,0.5)';for(let i=0;i<6;i++){c.lineWidth=5;c.beginPath();c.roundRect(lx-170+i*24,ly-235+i*30,340-i*48,470-i*60,150-i*20);c.stroke()}
 c.strokeStyle='#0b0a14';c.lineWidth=10;c.beginPath();c.roundRect(lx-176,ly-241,352,482,154);c.stroke();
 if(on){glow(c,lx,ly,120+60*Math.sin(T*20)*0.2,'rgba(255,255,240,A)',pw);
  c.fillStyle='#fff7d6';c.beginPath();c.moveTo(lx-26,ly+50);c.quadraticCurveTo(lx-40,ly-10,lx+Math.sin(T*18)*8,ly-90*pw);c.quadraticCurveTo(lx+40,ly-10,lx+26,ly+50);c.fill()}
 else{const r=rng(9);for(let i=0;i<7;i++){const a=clamp(Math.sin(T*5+i*1.9));const sx=lx-120+r()*240,sy=ly-180+r()*360,q=12*a;c.fillStyle=`rgba(255,255,255,${a})`;c.beginPath();c.moveTo(sx,sy-q*2);c.lineTo(sx+q*0.4,sy-q*0.4);c.lineTo(sx+q*2,sy);c.lineTo(sx+q*0.4,sy+q*0.4);c.lineTo(sx,sy+q*2);c.lineTo(sx-q*0.4,sy+q*0.4);c.lineTo(sx-q*2,sy);c.lineTo(sx-q*0.4,sy-q*0.4);c.fill()}}
 const back2=on?ease(ig/0.5):0;
 const mm=stick(c,{...OLD,rim:on?`rgba(255,210,140,${0.9*pw})`:'rgba(170,195,255,0.45)',rimDir:on?1:-1,x:lerp(300,215,back2),y:fy+10,s:1.3,face:1,t:T,scarf:SCARF,eyes:{wide:1+0.3*pw,blink:on&&ig<0.25?1:0},
  pose:on?{lean:-0.1*back2,armL:[lerp(2.0,2.35,back2),lerp(2.3,3.0,back2)],armR:[-0.2,0.2],legL:[0.2,0.1],legR:[-0.3,-0.2]}:{lean:0.1,armL:[2.05+Math.sin(T*9)*0.22,2.25+Math.cos(T*9)*0.3],armR:[0.1,0.3]}});
 if(!on){c.fillStyle='#e9e4d6';c.save();c.translate(mm.hf.x,mm.hf.y);c.rotate(Math.sin(T*9)*0.4);c.beginPath();c.roundRect(-30,-24,60,48,12);c.fill();c.restore()}
 if(on){c.fillStyle=`rgba(255,200,120,${0.12*pw})`;c.fillRect(-100,-100,W+200,H+200)}
 c.restore();if(on&&ig<0.18){X===c&&0;c.fillStyle=`rgba(255,240,200,${0.5*(1-ig/0.18)})`;c.fillRect(0,0,W,H)}}
// ---------- 9-10: 40 километров ----------
function shot40(c,t,d,T,m){const hy=640;c.save();cam(c,540,960,1.1-0.1*ease(t/d),0,0);
 sky(c,['#04060f','#0a1230','#18295a','#2c4678'],hy);stars(c,T,hy);clouds(c,T,300,'rgba(110,140,200,0.14)',17,5);moon(c,230,300,42);
 sea(c,hy,T,'#1b3156','#04070f',230);
 const L={x:850,y:1090};
 // дальность
 const fade=m[1]!=null?1-ease((t-m[1])/0.5):1;
 c.save();c.beginPath();c.rect(-100,hy+6,W+200,H);c.clip();c.setLineDash([26,22]);c.lineWidth=5;for(const [R,a] of [[330,0.2],[600,0.26],[860,0.34]]){c.strokeStyle=`rgba(255,220,140,${a*(0.5+0.5*fade)})`;c.beginPath();c.ellipse(L.x,1380,R,R*0.52,0,Math.PI,Math.PI*2);c.stroke()}c.restore();
 // луч по воде
 const a=T*0.8,tx=440+Math.cos(a)*400,ty=960+Math.sin(a)*120;c.save();c.globalCompositeOperation='lighter';c.filter='blur(12px)';const bg=c.createLinearGradient(L.x,L.y,tx,ty);bg.addColorStop(0,'rgba(255,236,170,0.5)');bg.addColorStop(1,'rgba(255,236,170,0.03)');c.fillStyle=bg;c.beginPath();c.moveTo(L.x,L.y-6);c.lineTo(tx-40,ty-110);c.lineTo(tx+40,ty+110);c.lineTo(L.x,L.y+6);c.fill();
 const pg=c.createRadialGradient(tx,ty,0,tx,ty,300);pg.addColorStop(0,'rgba(255,236,170,0.3)');pg.addColorStop(1,'rgba(255,236,170,0)');c.fillStyle=pg;c.translate(tx,ty);c.scale(1,0.3);c.beginPath();c.arc(0,0,300,0,7);c.fill();c.restore();
 rocks(c,[[430,1560],[560,1470],[660,1410],[760,1385],[880,1378],[1000,1392],[1160,1420]],'#172238','#05070f','rgba(150,180,240,0.25)');
 const lamp=lighthouse(c,850,1384,330,T);glow(c,lamp.x,lamp.y,150,'rgba(255,240,180,A)',0.9);glow(c,lamp.x,lamp.y,30,'rgba(255,255,240,A)',1);
 rocks(c,[[-80,1800],[120,1740],[340,1790],[560,1830],[800,1800],[1160,1840]],'#060811','#020308');
 c.restore();
 if(fade>0){c.save();c.globalAlpha=fade;bigText(c,'40 КМ',300,880,120,'#ffd60a',0.7+0.3*back((t-0.5)/0.3),-0.05,20);c.restore()}}
// ---------- 12-13: «Кому ты светишь, дед?» ----------
function shotSpeech(c,t,d,T,m){const gy=1500;c.save();cam(c,540,1000,1.02+0.04*(t/d),0,0);
 sky(c,['#0b0a1f','#1c1838','#3a2a52','#5d3d5c'],gy);
 c.save();c.filter='blur(7px)';house(c,-120,gy,420,700,'#1a1630','#120f22','#ffcf80',T,3);house(c,380,gy,360,560,'#211b3a','#17132a','#ffd590',T,6);house(c,800,gy,400,660,'#1a1630','#120f22','#ffcf80',T,9);c.restore();
 c.fillStyle='rgba(10,8,20,0.35)';c.fillRect(-100,-100,W+200,H+200);glow(c,120,560,620,'rgba(255,190,110,A)',0.22);
 const k2=m[1]!=null?t-m[1]:-1;const gg=c.createLinearGradient(0,gy,0,H);gg.addColorStop(0,'#2a2238');gg.addColorStop(1,'#0d0a16');c.fillStyle=gg;c.fillRect(-100,gy,W+200,H-gy+100);
 const b1=Math.abs(Math.sin(T*9))*-18,b2=Math.abs(Math.sin(T*9+1.4))*-18;
 const g=stick(c,{x:770,y:2080,s:2.05,face:1,col:'#7fb69a',rim:'rgba(255,200,120,0.55)',t:T,shadow:false,eyes:{blink:0.78},pose:{bob:b2,lean:0.1,headTilt:-0.2+Math.sin(T*9+1.4)*0.07,armL:[0.5,2.4+Math.sin(T*9)*0.15],armR:[0.3,1.9]}});
 const o=stick(c,{x:300,y:2060,s:2.3,face:1,col:'#e07a5f',rim:'rgba(255,200,120,0.6)',t:T,shadow:false,eyes:{blink:0.78},pose:{bob:b1,lean:0.06,headTilt:-0.16+Math.sin(T*9)*0.07,armL:[1.5,1.55+Math.sin(T*6)*0.05],armR:[0.3,1.9]}});
 bubble(c,70,250,940,400,o.head.x+60,o.head.y-150,['КОМУ ТЫ','СВЕТИШЬ, ДЕД?'],104,back(t/0.28));
 if(k2>0){bubble(c,430,720,560,200,g.head.x+10,g.head.y-140,['РЫБАМ?'],112,back(k2/0.25),'#b3362e');
  c.save();c.font='900 70px M';c.textAlign='center';[[160,820,0],[330,760,0.45],[230,930,0.8]].forEach(([x,y,p],i)=>{const k=((T*1.2+p)%1);c.globalAlpha=Math.sin(k*Math.PI);c.fillStyle='#ffd60a';c.strokeStyle='#000';c.lineWidth=12;c.lineJoin='round';c.save();c.translate(x,y-k*60);c.rotate((i-1)*0.15);c.strokeText('ХА!',0,0);c.fillText('ХА!',0,0);c.restore()});c.restore()}
 c.restore()}
// ---------- 14: Матвей молчит ----------
function shotSilent(c,t,d,T){const gy=1560;c.save();cam(c,540,1000,1.0+0.07*ease(t/d),0,0);
 sky(c,['#0b0a1f','#1c1838','#3a2a52','#5d3d5c'],gy);stars(c,T,600,0.7);
 c.save();c.translate(-t*60,0);c.filter='blur(8px)';house(c,-60,gy,420,640,'#1a1630','#120f22','#ffcf80',T,13);house(c,460,gy,380,540,'#211b3a','#17132a','#ffd590',T,16);house(c,920,gy,420,680,'#1a1630','#120f22','#ffcf80',T,19);c.restore();
 c.fillStyle='rgba(10,8,20,0.4)';c.fillRect(-100,-100,W+200,H+200);
 c.save();c.filter='blur(5px)';c.font='900 80px M';c.fillStyle=`rgba(255,214,10,${0.35*(1-clamp(t/d))})`;c.fillText('ХА! ХА!',60-t*70,760);c.restore();
 const g=c.createLinearGradient(0,gy,0,H);g.addColorStop(0,'#231c30');g.addColorStop(1,'#08060f');c.fillStyle=g;c.fillRect(-100,gy,W+300,H-gy);
 const ph=T*4.2;const m=stick(c,{...OLD,rim:'rgba(255,200,120,0.5)',x:560,y:1990,s:2.4,face:1,t:T,scarf:SCARF,shadow:false,eyes:{dy:12,sad:true,blink:(t>0.5&&t<0.68)?1:0.2},pose:{...walk(ph,0.26),lean:0.2,headTilt:0.26,armL:[0.35,0.7]}});lantern(c,m.hf,2.0,T);
 c.restore()}
// ---------- 15: 30 лет назад ----------
function shotPast(c,t,d,T){const hy=1040;c.save();cam(c,540,980,1.04+0.05*(t/d),lerp(-20,20,t/d),0);
 sky(c,['#2b1d4a','#7a4268','#e0855a','#ffd08a'],hy);clouds(c,T,520,'rgba(255,190,150,0.35)',51,5);
 glow(c,300,hy-30,620,'rgba(255,170,90,A)',0.55);c.fillStyle='#fff0c8';c.beginPath();c.arc(300,hy-10,92,Math.PI,0);c.fill();
 const g=c.createLinearGradient(0,hy,0,H);g.addColorStop(0,'#d07a5c');g.addColorStop(0.35,'#6d3f5e');g.addColorStop(1,'#1c1230');c.fillStyle=g;c.fillRect(-100,hy,W+200,H-hy);
 c.save();c.lineCap='round';for(let i=0;i<24;i++){const k=i/24,y=hy+6+Math.pow(k,1.6)*(H-hy),amp=2+k*12,wl=70+k*220;c.beginPath();for(let x=-40;x<=W+40;x+=24){const yy=y+Math.sin(x/wl+T*1.2+i*1.7)*amp;x<-30?c.moveTo(x,yy):c.lineTo(x,yy)}c.strokeStyle=`rgba(255,220,190,${0.07+k*0.08})`;c.lineWidth=1.5+k*5;c.stroke()}
 c.globalCompositeOperation='lighter';for(let i=0;i<30;i++){const k=i/30,y=hy+6+Math.pow(k,1.5)*(H-hy)*0.9,w=(20+k*150)*(0.6+0.4*Math.sin(T*2.3+i*2.1));c.strokeStyle=`rgba(255,225,170,${0.42*(1-k*0.7)})`;c.lineWidth=2+k*6;c.beginPath();c.moveTo(300-w,y);c.lineTo(300+w,y);c.stroke()}c.restore();
 // лодка уходит
 const bx=lerp(600,330,ease(t/d)),by=hy+150+Math.sin(T*1.8)*8;boatDraw(c,bx,by,Math.sin(T*1.8+1)*0.05,lerp(1.0,0.72,ease(t/d)),T,{boy:true,boyFace:1,rim:'rgba(255,200,140,0.6)'});
 // причал и отец
 const py=1330;c.fillStyle='#2a1b24';for(const x of [640,800,960])c.fillRect(x,py,22,420);const pg=c.createLinearGradient(0,py-14,0,py+14);pg.addColorStop(0,'#8a5c46');pg.addColorStop(1,'#3a2228');c.fillStyle=pg;c.fillRect(590,py-14,600,28);
 stick(c,{...YOUNG,rim:'rgba(255,200,140,0.7)',x:800,y:py-12,s:1.25,face:-1,t:T,pose:{lean:0.04,armL:[2.7+Math.sin(T*7)*0.3,2.95+Math.sin(T*7)*0.35],armR:[-0.1,0.2],bob:Math.sin(T*3)*2}});
 c.restore();
 bigText(c,'30 ЛЕТ НАЗАД',W/2,300,104,'#ffd60a',0.7+0.3*back(t/0.3),-0.02,20)}
// ---------- 16-18: шторм ----------
function stormSky(c,T,hy,fl){sky(c,['#04050b','#0a0f1f','#141d36','#1d2a48'],hy+200);c.save();c.filter='blur(34px)';const r=rng(61);for(let i=0;i<9;i++){const x=((r()*1600+T*(30+r()*40))%1700)-300;c.fillStyle=`rgba(${20+fl*120},${26+fl*130},${44+fl*150},0.85)`;c.beginPath();c.ellipse(x,120+r()*420,300+r()*260,70+r()*60,0,0,7);c.fill()}c.restore()}
function shotStorm(c,t,d,T,m){const hy=900,fl=lightningAmt(T);const zk=m[1]!=null?ease((t-m[1])/0.8):0;
 const bx=540+Math.sin(T*0.9)*60,yb=1180,by=waveY(bx,yb,70,210,2.4,T),rot=Math.cos(bx/210+T*2.4)*0.33;
 c.save();cam(c,lerp(540,bx,zk),lerp(960,by-60,zk),1.05+0.5*zk,Math.sin(T*23)*5,Math.cos(T*19)*5);
 stormSky(c,T,hy,fl);
 if(fl>0.5){for(const L of window.DATA.lightning){if(T-L>0&&T-L<0.2)bolt(c,200+((L*977)%600),0,hy-40,Math.floor(L*100),fl)}}
 // тёмный маяк на горизонте
 c.fillStyle=`rgba(${6+fl*30},${8+fl*34},${16+fl*44},1)`;c.beginPath();c.moveTo(930,hy+30);c.lineTo(944,hy-190);c.lineTo(980,hy-190);c.lineTo(994,hy+30);c.fill();c.fillRect(938,hy-226,48,40);c.beginPath();c.moveTo(860,hy+40);c.quadraticCurveTo(960,hy-30,1140,hy+10);c.lineTo(1140,hy+80);c.lineTo(860,hy+80);c.fill();
 const lt=(a,b,k)=>`rgb(${Math.round(a[0]+k*(b[0]-a[0]))},${Math.round(a[1]+k*(b[1]-a[1]))},${Math.round(a[2]+k*(b[2]-a[2]))})`;
 const foam=`rgba(215,230,255,${0.4+fl*0.5})`;
 waveLayer(c,hy+40,34,260,1.6,T,lt([44,66,104],[90,115,160],fl),'#070b16',foam);
 waveLayer(c,hy+150,56,230,2.0,T+3,lt([36,56,92],[80,104,148],fl),'#060914',foam);
 boatDraw(c,bx,by+18,rot,1.15,T,{boy:true,torn:true,boyFace:(m[1]!=null&&t>m[1]&&Math.sin(T*3.2)>0)?-1:1,rim:`rgba(200,215,255,${0.3+fl*0.7})`,eyes:{wide:1.35},hull:'#5a3c2a',sail:'#a9a295',
  pose:{crouch:0.45,lean:0.2,legL:[1.3,0.1],legR:[1.2,0.0],armL:[1.9,2.4],armR:[1.6,2.2]}});
 waveLayer(c,yb+70,74,210,2.4,T+0.25,lt([30,48,82],[70,92,132],fl),'#04060e',foam);
 waveLayer(c,yb+330,90,260,2.0,T+5,lt([22,36,64],[56,74,110],fl),'#020308',foam);
 c.restore();rain(c,T,170,0.34+fl*0.3);
 if(fl>0){c.fillStyle=`rgba(190,205,255,${0.2*fl})`;c.fillRect(0,0,W,H)}}
// ---------- 19: маяк не горел ----------
function shotDark(c,t,d,T){const fl=lightningAmt(T);c.save();cam(c,560,900,1.0+0.1*ease(t/d),Math.sin(T*21)*3,0);
 stormSky(c,T,1300,fl);
 if(fl>0.5){for(const L of window.DATA.lightning){if(T-L>0&&T-L<0.2)bolt(c,180,0,900,Math.floor(L*100)+3,fl)}}
 rocks(c,[[60,1640],[220,1520],[380,1450],[520,1420],[700,1418],[860,1450],[1000,1530],[1180,1600]],fl>0.3?'#2a3350':'#121829','#04050b',`rgba(170,195,255,${0.12+fl*0.5})`);
 lighthouse(c,610,1425,1180,T,true);
 if(fl>0){c.save();c.globalAlpha=fl*0.5;c.globalCompositeOperation='lighter';c.fillStyle='#8fa6e0';c.beginPath();c.moveTo(610-148,1425);c.lineTo(610-92,505);c.lineTo(610-40,505);c.lineTo(610-70,1425);c.fill();c.restore()}
 const foam=`rgba(215,230,255,${0.45+fl*0.4})`;waveLayer(c,1530,60,220,2.4,T,'#2a3f66','#04060e',foam);waveLayer(c,1700,80,260,2.0,T+4,'#1c2c4c','#020308',foam);
 // брызги
 const r=rng(5);c.fillStyle='rgba(220,235,255,0.55)';for(let i=0;i<26;i++){const k=((T*0.9+r())%1),a=-1.9+r()*1.4,sp=300+r()*420,x=330+r()*120+Math.cos(a)*sp*k,y=1490+Math.sin(a)*sp*k+k*k*520;c.beginPath();c.arc(x,y,3+r()*5,0,7);c.fill()}
 c.restore();rain(c,T,180,0.36+fl*0.3);
 if(fl>0){c.fillStyle=`rgba(190,205,255,${0.16*fl})`;c.fillRect(0,0,W,H)}}
// ---------- 20-21: Матвей уснул ----------
function shotAsleep(c,t,d,T,m){const fl=lightningAmt(T),fy=1380;const zk=m[1]!=null?ease((t-m[1])/1.0):0;
 c.save();cam(c,lerp(540,640,zk),lerp(960,1090,zk),1.0+0.32*zk,0,0);
 const wg=c.createLinearGradient(0,0,0,fy);wg.addColorStop(0,'#14121f');wg.addColorStop(1,'#231f33');c.fillStyle=wg;c.fillRect(-100,-100,W+200,fy+100);
 c.strokeStyle='rgba(0,0,0,0.22)';c.lineWidth=3;for(let x=-40;x<W+60;x+=120){c.beginPath();c.moveTo(x,-100);c.lineTo(x,fy);c.stroke()}
 // окно
 const wx=650,wy=380,ww=330,wh=400;c.fillStyle=`rgb(${14+fl*150},${20+fl*165},${40+fl*190})`;c.fillRect(wx,wy,ww,wh);
 c.save();c.beginPath();c.rect(wx,wy,ww,wh);c.clip();rain(c,T,220,0.5);c.restore();
 c.strokeStyle='#0c0a14';c.lineWidth=18;c.strokeRect(wx,wy,ww,wh);c.beginPath();c.moveTo(wx+ww/2,wy);c.lineTo(wx+ww/2,wy+wh);c.moveTo(wx,wy+wh/2);c.lineTo(wx+ww,wy+wh/2);c.stroke();
 if(fl>0){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=fl*0.35;c.fillStyle='#9fb4ee';c.beginPath();c.moveTo(wx,wy+wh);c.lineTo(wx+ww,wy+wh);c.lineTo(wx+ww-360,fy+200);c.lineTo(wx-520,fy+200);c.fill();c.restore()}
 // часы
 c.fillStyle='#d9d2c0';c.beginPath();c.arc(300,500,86,0,7);c.fill();c.strokeStyle='#0c0a14';c.lineWidth=12;c.stroke();c.lineWidth=9;c.lineCap='round';c.beginPath();c.moveTo(300,500);c.lineTo(300+34,500-44);c.moveTo(300,500);c.lineTo(300-10,500+64);c.stroke();
 c.save();c.translate(300,590);c.rotate(Math.sin(T*3.1)*0.3);c.strokeStyle='#0c0a14';c.lineWidth=7;c.beginPath();c.moveTo(0,0);c.lineTo(0,120);c.stroke();c.fillStyle='#8a6a3a';c.beginPath();c.arc(0,130,22,0,7);c.fill();c.restore();
 // пол
 const fg=c.createLinearGradient(0,fy,0,H);fg.addColorStop(0,'#17131f');fg.addColorStop(1,'#07060c');c.fillStyle=fg;c.fillRect(-100,fy,W+200,H-fy);
 // стул
 c.fillStyle='#0f0d17';c.fillRect(290,930,24,450);c.fillRect(290,1200,170,22);c.fillRect(440,1200,20,180);
 const br=Math.sin(T*1.6)*5;
 const mm=stick(c,{...YOUNG,hat:null,rim:`rgba(170,195,255,${0.25+fl*0.6})`,x:400,y:fy,s:1.3,face:1,t:T,shadow:false,eyes:{blink:1},pose:{crouch:0.32,lean:1.0,headTilt:0.42,legL:[1.36,0.0],legR:[1.28,-0.06],armL:[1.2,1.75],armR:[1.1,1.6],bob:br*0.4}});
 // стол
 const tg=c.createLinearGradient(0,1150,0,1180);tg.addColorStop(0,'#5b4334');tg.addColorStop(1,'#2a1d18');c.fillStyle=tg;c.fillRect(500,1150,560,30);c.fillStyle='#1d1512';c.fillRect(540,1180,24,200);c.fillRect(1000,1180,24,200);
 // кепка и потухший фонарь
 c.fillStyle='#2a2f44';c.beginPath();c.moveTo(770,1150);c.quadraticCurveTo(820,1080,880,1150);c.fill();c.fillRect(860,1140,56,10);
 const lx=960;c.fillStyle='#15131c';c.fillRect(lx-24,1062,48,10);c.fillRect(lx-26,1140,52,10);c.fillStyle='#3a3a48';c.beginPath();c.roundRect(lx-18,1072,36,68,6);c.fill();c.strokeStyle='#15131c';c.lineWidth=6;c.beginPath();c.arc(lx,1062,18,Math.PI,0);c.stroke();
 c.strokeStyle='rgba(200,200,215,0.4)';c.lineWidth=6;c.lineCap='round';c.beginPath();for(let i=0;i<=18;i++){const k=i/18,x=lx+Math.sin(k*6+T*2.2)*22*k,y=1036-k*250;i?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();
 // Z z z
 c.save();c.font='900 70px M';c.textAlign='center';for(let i=0;i<3;i++){const k=((T*0.45+i/3)%1);c.globalAlpha=Math.sin(k*Math.PI)*0.9;c.fillStyle='#cfd8ff';c.save();c.translate(mm.head.x+40+k*130+Math.sin(k*7)*16,mm.head.y-110-k*250);c.scale(0.6+k*0.9,0.6+k*0.9);c.fillText('Z',0,0);c.restore()}c.restore();
 c.restore();
 if(fl>0){c.fillStyle=`rgba(190,205,255,${0.10*fl})`;c.fillRect(0,0,W,H)}}
// ---------- 22: лодку не нашли ----------
function shotScarf(c,t,d,T){const hy=1000;c.save();cam(c,540,1000,1.0+0.08*ease(t/d),0,0);
 sky(c,['#3a455b','#67748c','#a2aab8','#d6cec3'],hy);clouds(c,T,420,'rgba(235,235,240,0.35)',71,6);
 const g=c.createLinearGradient(0,hy,0,H);g.addColorStop(0,'#8c9aae');g.addColorStop(0.5,'#52607a');g.addColorStop(1,'#232c3e');c.fillStyle=g;c.fillRect(-100,hy,W+200,H-hy);
 c.save();c.lineCap='round';for(let i=0;i<20;i++){const k=i/20,y=hy+6+Math.pow(k,1.6)*460,amp=1+k*6,wl=80+k*220;c.beginPath();for(let x=-40;x<=W+40;x+=24){const yy=y+Math.sin(x/wl+T*0.8+i*1.7)*amp;x<-30?c.moveTo(x,yy):c.lineTo(x,yy)}c.strokeStyle=`rgba(235,240,250,${0.10+k*0.10})`;c.lineWidth=1.5+k*4;c.stroke()}c.restore();
 c.save();c.filter='blur(36px)';c.fillStyle='rgba(225,228,235,0.35)';for(let i=0;i<4;i++){c.beginPath();c.ellipse(((i*400+T*14)%1700)-300,hy+20+i*30,380,40,0,0,7);c.fill()}c.restore();
 // обломок
 c.save();c.translate(260,hy+170+Math.sin(T*1.3)*5);c.rotate(-0.1+Math.sin(T*1.3)*0.04);c.fillStyle='#4a3626';c.fillRect(-70,-9,140,18);c.restore();
 // берег
 c.beginPath();c.moveTo(-100,H+20);c.lineTo(-100,1500);c.quadraticCurveTo(300,1380,700,1440);c.quadraticCurveTo(950,1470,W+100,1400);c.lineTo(W+100,H+20);c.closePath();const sg=c.createLinearGradient(0,1380,0,H);sg.addColorStop(0,'#5a5c66');sg.addColorStop(1,'#1f2028');c.fillStyle=sg;c.fill();
 c.strokeStyle='rgba(240,244,250,0.55)';c.lineWidth=8;c.beginPath();c.moveTo(-100,1500+Math.sin(T)*6);c.quadraticCurveTo(300,1380+Math.sin(T+1)*8,700,1440+Math.sin(T+2)*6);c.quadraticCurveTo(950,1470,W+100,1400);c.stroke();
 const mm=stick(c,{...YOUNG,rim:'rgba(235,240,250,0.55)',x:660,y:1470,s:1.3,face:-1,t:T,eyes:{sad:true,dy:8,blink:(t>0.9&&t<1.1)?1:0},pose:{crouch:0.5,lean:0.5,headTilt:0.3,legL:[1.25,-1.0],legR:[0.2,-1.5],armL:[1.0,1.5],armR:[0.7,1.3],bob:Math.sin(T*1.4)*2}});
 // шарф в руке
 const p=mm.hf;c.strokeStyle=SCARF;c.lineWidth=30;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(p.x+26,p.y-6);c.lineTo(p.x-6,p.y);for(let i=1;i<=7;i++)c.lineTo(p.x-10+Math.sin(T*2+i*0.8)*i*3.2,p.y+i*30);c.stroke();
 for(let i=0;i<3;i++){const k=((T*0.9+i/3)%1);c.fillStyle=`rgba(190,215,240,${1-k})`;c.beginPath();c.ellipse(p.x-10+i*8,p.y+220+k*k*150,5,9,0,0,7);c.fill()}
 c.restore();c.fillStyle='rgba(40,50,70,0.18)';c.fillRect(0,0,W,H)}
// ---------- 23-24: ни одной ночи ----------
function shotNights(c,t,d,T,m){const hy=1210,FT=t*7;c.save();cam(c,700,900,1.06,0,0);
 sky(c,['#070a1c','#101a3c','#243a66','#3f5a86'],hy);
 c.save();c.translate(640,-300);c.rotate(t*0.5);c.translate(-640,300);stars(c,T,1700);c.restore();rocks(c,[[-60,1190],[40,1168],[150,1176],[260,1196],[330,1206],[400,1214]],'#1c2a4a','#132040');sea(c,hy,T*2,'#27446d','#060b18',null);
 const fr=(t*0.95)%1,mx=-160+fr*1400,my=560-Math.sin(fr*Math.PI)*300;c.save();c.beginPath();c.rect(-200,-200,W+400,hy+200);c.clip();moon(c,mx,my,66);c.restore();
 clouds(c,T*9,560,'rgba(120,150,210,0.18)',4,6);
 
 rocks(c,[[-120,1560],[120,1500],[300,1420],[420,1330],[520,1250],[600,1215],[690,1196],[820,1192],[930,1210],[1010,1260],[1120,1290]],'#1b2640','#070a14','rgba(150,180,240,0.28)');
 const lamp=lighthouse(c,742,1200,700,T);beam(c,lamp,FT*1.2,1700);
 const yf=x=>x<520?lerp(1330,1250,(x-420)/100):x<600?lerp(1250,1215,(x-520)/80):x<690?lerp(1215,1196,(x-600)/90):1194;grass(c,430,1080,yf,T*3,5,'#0a1020');
 const sn=clamp(Math.sin(clamp((t/d-0.3)/0.45)*Math.PI));if(sn>0){const r=rng(88);c.fillStyle=`rgba(240,245,255,${0.8*sn})`;for(let i=0;i<120;i++){const sp=260+r()*260,x=(r()*1300+Math.sin(T*2+i)*30+T*60)%1300-100,y=(r()*1900+T*sp)%1900;c.beginPath();c.arc(x,y,2+r()*4,0,7);c.fill()}}
 rocks(c,[[-80,1700],[40,1600],[150,1570],[260,1620],[380,1700],[520,1740],[700,1715],[860,1760],[1000,1700],[1160,1730]],'#0a0e1c','#03040a');
 c.restore();
 const n=Math.floor(10950*Math.pow(clamp(t/(d-0.7)),2.2));const s=n>=1000?Math.floor(n/1000)+' '+String(n%1000).padStart(3,'0'):String(n);
 bigText(c,s,W/2,280,200,'#ffd60a',1+0.03*Math.sin(T*18),0,26);bigText(c,'НОЧЕЙ',W/2,440,84,'#fff',1,0,16)}
// ---------- 27-29: ответ ----------
function flashAmt(T){let fl=0;for(const f of window.DATA.fl){const k=T-f.t;if(k>0&&k<f.len)fl=Math.max(fl,k<0.06?k/0.06:1-ease((k-0.06)/(f.len-0.06)))}return fl}
function shotE(c,t,d,T){const hy=960,fx=250,fy=hy-6,F0=window.DATA.fl[0].t,fl=flashAmt(T),after=T>F0,ta=T-F0;
 const z=1.0+0.2*ease((t-1.0)/(d-1.0));
 c.save();cam(c,lerp(540,330,ease((t-1.0)/4.5)),hy,z,0,0);
 sky(c,['#04050f','#0a1230','#182a55','#2f4877'],hy);stars(c,T,hy);clouds(c,T,600,'rgba(110,140,200,0.14)',21,6);moon(c,880,330,54);
 sea(c,hy,T,'#1c3359','#04070f',880,1640);
 beam(c,{x:1230,y:700},Math.PI+0.25+Math.sin(T*1.1)*0.35,1500,0.55*(1-fl*0.5));
 if(fl>0){glow(c,fx,fy,520*fl+40,'rgba(255,200,120,A)',0.34*fl);glow(c,fx,fy,130*fl+10,'rgba(255,240,200,A)',0.95*fl);glow(c,fx,fy,26,'rgba(255,255,255,A)',fl);
  c.save();c.globalCompositeOperation='lighter';c.strokeStyle=`rgba(255,225,170,${0.5*fl})`;c.lineWidth=3;c.beginPath();c.moveTo(fx-430*fl,fy);c.lineTo(fx+430*fl,fy);c.stroke();
  for(let i=0;i<22;i++){const k=i/22,y=hy+8+Math.pow(k,1.4)*520,w=(10+k*90)*(0.6+0.4*Math.sin(T*3+i*2));c.strokeStyle=`rgba(255,215,150,${0.55*fl*(1-k*0.8)})`;c.lineWidth=2+k*5;c.beginPath();c.moveTo(fx-w+Math.sin(T*2+i)*12*k,y);c.lineTo(fx+w+Math.sin(T*2+i)*12*k,y);c.stroke()}c.restore()}
 c.fillStyle=`rgba(4,6,14,${after?0.95:0})`;c.beginPath();c.moveTo(fx-30,fy+3);c.lineTo(fx+30,fy+3);c.lineTo(fx+20,fy+12);c.lineTo(fx-20,fy+12);c.closePath();c.fill();c.fillRect(fx-2,fy-22,3,26);
 const py=1560,sur=after?ease(ta/0.25):0;
 const m=stick(c,{...OLD,x:800,y:py,s:1.35,face:-1,t:T,scarf:SCARF,rim:`rgba(${after?'255,215,160':'170,195,255'},${0.5+fl*0.5})`,rimDir:-1,eyes:{wide:1+sur*0.5,blink:(!after&&t>0.6&&t<0.75)?1:0},
  pose:{lean:lerp(0.14,-0.05,sur),headTilt:lerp(0.1,-0.08,sur),armL:[lerp(0.5,1.1,sur),lerp(1.0,1.9,sur)],armR:[lerp(0.1,-0.4,sur),lerp(0.3,0.2,sur)],bob:after?Math.sin(T*30)*1.6*(1-clamp((ta-0.2)/1.5)):0}});
 lantern(c,m.hf,1.35,T,1);
 c.fillStyle='#07080f';c.fillRect(380,py-6,W,30);for(let x=400;x<W+40;x+=96)c.fillRect(x,py-190,12,190);c.fillRect(380,py-196,W,14);c.strokeStyle='rgba(170,195,255,0.3)';c.lineWidth=3;c.beginPath();c.moveTo(380,py-195);c.lineTo(W+40,py-195);c.stroke();
 const g=c.createLinearGradient(0,py+20,0,H);g.addColorStop(0,'#090b16');g.addColorStop(1,'#020308');c.fillStyle=g;c.beginPath();c.moveTo(440,py+24);c.lineTo(W+80,py+24);c.lineTo(W+80,H+60);c.lineTo(560,H+60);c.closePath();c.fill();
 rocks(c,[[-80,1700],[80,1640],[240,1690],[420,1760],[600,1790]],'#070a14','#020308');
 if(after){const k=back(ta/0.3);c.save();c.translate(m.head.x-10,m.head.y-150);c.scale(k,k);c.font='900 170px M';c.textAlign='center';c.lineJoin='round';c.strokeStyle='#000';c.lineWidth=22;c.strokeText('!',0,0);c.fillStyle='#ff5a4f';c.fillText('!',0,0);c.restore()}
 c.restore();
 if(fl>0){c.fillStyle=`rgba(255,220,170,${0.10*fl})`;c.fillRect(0,0,W,H)}}
// ---------- 30: так сигналил только Лёша ----------
function shotFace(c,t,d,T){c.save();cam(c,520,900,1.0+0.1*ease(t/d),0,0);
 sky(c,['#04050f','#0a1230','#182a55','#31497a'],H);stars(c,T,1500);clouds(c,T,700,'rgba(110,140,200,0.14)',33,6);
 const pu=0.75+0.25*Math.sin(T*2.2);glow(c,-80,1010,900,'rgba(255,190,110,A)',0.42*pu);glow(c,-20,1010,260,'rgba(255,235,190,A)',0.7*pu);
 const tr=Math.sin(T*27)*2*(1-clamp(t/2.5));
 const m=stick(c,{...OLD,x:690+tr,y:2640,s:4.0,face:-1,t:T,noLegs:true,shadow:false,scarf:SCARF,rim:`rgba(255,205,140,${0.75+0.2*pu})`,rimDir:-1,eyes:{wide:1.35,blink:(t>1.5&&t<1.62)?1:0},pose:{lean:-0.02,headTilt:-0.05,armL:[0.25,0.5],armR:[-0.2,0.2],bob:Math.sin(T*1.8)*5}});
 // слеза
 const k=clamp((t-0.7)/2.2);if(k>0){const ex=m.head.x-m.HR*0.42,ey=m.head.y+m.HR*0.08+ease(k)*m.HR*0.85,q=10+10*clamp(k*4);glow(c,ex,ey,40,'rgba(190,220,255,A)',0.5);c.fillStyle='#dcecff';c.beginPath();c.moveTo(ex,ey-q*1.8);c.quadraticCurveTo(ex+q*1.2,ey+q*0.2,ex,ey+q);c.quadraticCurveTo(ex-q*1.2,ey+q*0.2,ex,ey-q*1.8);c.fill()}
 c.restore()}

// ---------- обёртка рендера ----------
function captions(c,T,nocapShot){if(nocapShot)return;const C=window.DATA.chunks;for(let i=0;i<C.length;i++){const ch=C[i],end=i+1<C.length?Math.min(C[i+1].s,ch.e+0.45):ch.e+0.6;if(T>=ch.s-0.03&&T<end){if(ch.nocap)return;const k=T-ch.s+0.03,sc=0.72+0.28*back(k/0.16);const txt=ch.t.toUpperCase();let size=112;c.font=`900 ${size}px M`;const w=c.measureText(txt).width;if(w>940)size=Math.floor(size*940/w);
  bigText(c,txt,W/2,1500,size,ch.hl?'#ffd60a':'#ffffff',sc,ch.hl?-0.02:0);break}}}
function outro(c,T){const s=window.DATA.outro;if(T<s)return;bigText(c,'ЭТО ЛЁША?',W/2,290,128,'#ffd60a',0.7+0.3*back((T-s)/0.3),-0.02,24);if(T>s+0.4)bigText(c,'ЧАСТЬ 2 — СКОРО',W/2,440,72,'#fff',0.7+0.3*back((T-s-0.4)/0.3),0,14)}
const FN={shotA,shotB,shotPier,shotLeave,shotAlone,shotStairs,shotLamp,shot40,shotC,shotSpeech,shotSilent,shotPast,shotStorm,shotDark,shotAsleep,shotScarf,shotNights,shotD,shotE,shotFace};
window.renderFrame=function(T,fi){const S=window.DATA.shots,D=window.DATA.dur;let i=0;while(i+1<S.length&&T>=S[i+1].s)i++;
 const draw=(ctx,j)=>{const sh=S[j],e=j+1<S.length?S[j+1].s:D;ctx.save();ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);FN[sh.fn](ctx,T-sh.s,e-sh.s,T,sh.marks||[]);ctx.restore();
  if(sh.fb){ctx.fillStyle='rgba(120,74,26,0.10)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#000';ctx.fillRect(0,0,W,120);ctx.fillRect(0,H-120,W,120)}};
 draw(X,i);const k=(T-S[i].s)/0.22;
 if(i>0&&k<1){draw(XO,i-1);X.save();X.globalAlpha=1-ease(k);X.translate(W/2,H/2);X.scale(1+0.06*k,1+0.06*k);X.translate(-W/2,-H/2);X.drawImage(off,0,0);X.restore()}
 vignette(X,fi);hook(X,T);captions(X,T,S[i].nocap);outro(X,T);
 if(T<0.25){X.fillStyle=`rgba(0,0,0,${1-T/0.25})`;X.fillRect(0,0,W,H)}
 if(T>D-0.4){X.fillStyle=`rgba(0,0,0,${(T-(D-0.4))/0.4})`;X.fillRect(0,0,W,H)}};

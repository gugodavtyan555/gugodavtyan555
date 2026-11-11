// «Маяк», часть 2 — сцены. Подключается после shots2.js
const SON={col:'#e3a84a',hat:'#3f5a4a',rim:'rgba(170,195,255,0.5)'};
function hullOnly(c,col='#7a5236'){const g=c.createLinearGradient(0,-22,0,50);g.addColorStop(0,col);g.addColorStop(1,'#2e1d14');c.fillStyle=g;c.beginPath();c.moveTo(-128,-24);c.lineTo(132,-24);c.quadraticCurveTo(110,44,60,46);c.lineTo(-70,46);c.quadraticCurveTo(-112,40,-128,-24);c.closePath();c.fill();c.strokeStyle='rgba(255,255,255,0.14)';c.lineWidth=4;c.beginPath();c.moveTo(-120,-6);c.lineTo(122,-6);c.stroke()}
function rowboat(c,x,y,rot,s,inside,col){c.save();c.translate(x,y);c.rotate(rot);c.scale(s,s);if(inside)inside();hullOnly(c,col);c.restore()}
function tears(c,m,f,T,n=2){for(let i=0;i<n;i++){const k=((T*0.7+i/n)%1),ex=m.head.x+f*m.HR*0.45,ey=m.head.y+m.HR*0.1+k*m.HR*1.5,q=m.HR*0.07;c.fillStyle=`rgba(210,232,255,${1-k*0.7})`;c.beginPath();c.moveTo(ex,ey-q*1.8);c.quadraticCurveTo(ex+q*1.2,ey+q*0.2,ex,ey+q);c.quadraticCurveTo(ex-q*1.2,ey+q*0.2,ex,ey-q*1.8);c.fill()}}
function heart(c,x,y,s,col){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=col;c.beginPath();c.moveTo(0,30);c.bezierCurveTo(-70,-20,-40,-70,0,-34);c.bezierCurveTo(40,-70,70,-20,0,30);c.fill();c.restore()}
function fog(c,T,y0,n,a,seed,col='200,210,225'){const r=rng(seed);c.save();c.filter='blur(44px)';for(let i=0;i<n;i++){const x=((r()*1700+T*(12+r()*26))%1900)-400;c.fillStyle=`rgba(${col},${a*(0.6+r()*0.6)})`;c.beginPath();c.ellipse(x,y0+r()*420,300+r()*260,50+r()*50,0,0,7);c.fill()}c.restore()}
function nightSea(c,T,hy,mx,my=360,mr=56){sky(c,['#060a1a','#0e1a36','#1d3358','#345278'],hy);stars(c,T,hy);clouds(c,T,560,'rgba(120,150,210,0.16)',31,5);moon(c,mx,my,mr);sea(c,hy,T,'#213c62','#050914',mx)}

// ---------- лестница (вниз / вдвоём) ----------
function stairsScene(c,t,d,T,figs,camU){const FH=300,pos=u=>{const n=Math.floor(u),f=u-n,ev=((n%2)+2)%2==0;return{x:ev?270+f*540:810-f*540,y:-(n+f)*FH,ev}};
 const P=pos(camU),n=Math.floor(camU),my=P.y;
 c.fillStyle='#07060d';c.fillRect(0,0,W,H);c.save();c.translate(0,1120-my);
 const y0=my-1300,y1=my+900;const g=c.createLinearGradient(170,0,910,0);g.addColorStop(0,'#15131f');g.addColorStop(0.5,'#262238');g.addColorStop(1,'#15131f');c.fillStyle=g;c.fillRect(170,y0,740,y1-y0);
 c.strokeStyle='rgba(0,0,0,0.28)';c.lineWidth=3;for(let y=Math.floor(y0/60)*60;y<y1;y+=60){c.beginPath();c.moveTo(170,y);c.lineTo(910,y);c.stroke();const o=(Math.round(y/60)%2)*55;for(let x=170+o;x<910;x+=110){c.beginPath();c.moveTo(x,y);c.lineTo(x,y+60);c.stroke()}}
 for(let k=n-3;k<=n+5;k++){const e=((k%2)+2)%2==0,xa=e?270:810,dir=e?1:-1,ya=-k*FH;
  if(e){const wx=870,wy=ya-FH*0.9;c.save();c.globalCompositeOperation='lighter';const lg=c.createLinearGradient(wx,0,wx-560,0);lg.addColorStop(0,'rgba(150,180,255,0.22)');lg.addColorStop(1,'rgba(150,180,255,0)');c.fillStyle=lg;c.beginPath();c.moveTo(wx,wy-50);c.lineTo(wx-560,wy+120);c.lineTo(wx-560,wy+330);c.lineTo(wx,wy+50);c.fill();c.restore();c.fillStyle='#9fb8e8';c.beginPath();c.roundRect(wx-18,wy-56,36,112,18);c.fill()}
  for(let s2=0;s2<10;s2++){const x=xa+dir*s2*54,y=ya-(s2+1)*30;c.fillStyle='#0c0b14';c.fillRect(Math.min(x,x+dir*54),y,54,44);c.fillStyle='#3a3552';c.fillRect(Math.min(x,x+dir*54),y,54,7)}
  c.fillStyle='#0c0b14';c.fillRect(e?810:170,ya-FH,100,20)}
 for(const f of figs){const p=pos(f.u);f.draw(p)}
 c.restore();
 const g2=c.createLinearGradient(0,0,0,H);g2.addColorStop(0,'rgba(4,3,10,0.9)');g2.addColorStop(0.25,'rgba(4,3,10,0)');g2.addColorStop(0.72,'rgba(4,3,10,0)');g2.addColorStop(1,'rgba(4,3,10,0.92)');c.fillStyle=g2;c.fillRect(0,0,W,H);
 c.fillStyle='#07060d';c.fillRect(0,0,170,H);c.fillRect(910,0,170,H)}
function shotStairsDown(c,t,d,T,m){const u=Math.max(0.15,6.3-t*1.25);
 stairsScene(c,t,d,T,[{u,draw:p=>{const mm=stick(c,{...OLD,rim:'rgba(255,200,120,0.5)',x:p.x,y:p.y,s:0.8,face:p.ev?-1:1,t:T,shadow:false,scarf:SCARF,eyes:{wide:1.3},pose:{...walk(T*15,0.7),lean:0.34,armL:[0.9,1.5]}});lantern(c,mm.hf,0.8,T,1.15)}}],u);
 const num=Math.max(0,Math.floor(140*(1-ease(t/(d-0.3)))));bigText(c,String(num),W/2,290,230,'#ffd60a',1+0.04*Math.sin(T*22),0,26);bigText(c,'СТУПЕНЕЙ',W/2,455,74,'#fff',1,0,14);
 if(m[2]!=null&&t>m[2]){const b=Math.pow(Math.abs(Math.sin(T*9)),6);heart(c,880,300,1.5+b*0.6,'#ff4d4d');glow(c,880,290,160+b*80,'rgba(255,60,60,A)',0.25)}}
function shotStairsTwo(c,t,d,T){const u=0.3+t*0.5;
 stairsScene(c,t,d,T,[{u:u-0.24,draw:p=>{stick(c,{...SON,rim:'rgba(255,200,120,0.5)',x:p.x,y:p.y,s:0.84,face:p.ev?1:-1,t:T,shadow:false,scarf:SCARF,pose:{...walk(T*8+1.2,0.55),lean:0.22}})}},
  {u,draw:p=>{const mm=stick(c,{...OLD,rim:'rgba(255,200,120,0.5)',x:p.x,y:p.y,s:0.8,face:p.ev?1:-1,t:T,shadow:false,pose:{...walk(T*8,0.55),lean:0.24,armL:[0.8,1.5]}});lantern(c,mm.hf,0.8,T,1.15)}}],u-0.1);
 const num=Math.min(140,Math.floor(lerp(121,141,ease(t/(d-0.4)))));bigText(c,String(num),W/2,290,230,'#ffd60a',1+0.04*Math.sin(T*16),0,26);bigText(c,'СТУПЕНЕЙ. ВДВОЁМ',W/2,455,66,'#fff',1,0,14)}

// ---------- берег, старая лодка ----------
function beach(c,T,top='#34364a',bot='#0a0b12'){c.beginPath();c.moveTo(-100,H+20);c.lineTo(-100,1520);c.quadraticCurveTo(300,1400,700,1460);c.quadraticCurveTo(950,1490,W+100,1420);c.lineTo(W+100,H+20);c.closePath();const sg=c.createLinearGradient(0,1400,0,H);sg.addColorStop(0,top);sg.addColorStop(1,bot);c.fillStyle=sg;c.fill();
 c.strokeStyle='rgba(200,220,250,0.45)';c.lineWidth=8;c.beginPath();c.moveTo(-100,1520+Math.sin(T)*6);c.quadraticCurveTo(300,1400+Math.sin(T+1)*8,700,1460+Math.sin(T+2)*6);c.quadraticCurveTo(950,1490,W+100,1420);c.stroke()}
function farLight(c,x,y,T,p=1){const k=(0.6+0.4*Math.sin(T*3))*p;glow(c,x,y,260*k,'rgba(255,200,120,A)',0.35*k);glow(c,x,y,60,'rgba(255,240,200,A)',0.9*k);glow(c,x,y,14,'rgba(255,255,255,A)',1)}
function shotShore(c,t,d,T,m){const hy=1000;c.save();cam(c,540,1000,1.0+0.07*ease(t/d),0,0);
 nightSea(c,T,hy,820);farLight(c,190,hy-8,T);
 beach(c,T);
 const run=clamp(t/1.3),x=lerp(1220,700,easeOut(run)),moving=run<1,fear=m[2]!=null&&t>m[2];
 rowboat(c,400,1500,-0.1,1.5,()=>{c.strokeStyle='#4a3626';c.lineWidth=9;c.lineCap='round';c.beginPath();c.moveTo(-100,-30);c.lineTo(90,-52);c.moveTo(-80,-44);c.lineTo(110,-34);c.stroke()},'#5d4130');
 const mm=stick(c,{...OLD,x,y:1500,s:1.3,face:-1,t:T,scarf:SCARF,eyes:{wide:fear?1.3:1,dy:fear?-2:6},pose:moving?{...walk(T*13,0.7),lean:0.3,armL:[0.8,1.4]}:{lean:fear?0.02:0.16,headTilt:fear?-0.1:0.2,armL:[0.5,1.0],armR:[0.1,0.3],bob:fear?Math.sin(T*28)*2:Math.sin(T*2)*2}});lantern(c,mm.hf,1.3,T);
 c.restore()}
// ---------- гребёт ----------
function shotRow(c,t,d,T,m){const hy=900,go=m[1]!=null&&t>m[1],aim=m[2]!=null?ease((t-m[2])/1.0):0;
 const ph=go?(m[1]*2.2+(t-m[1])*4.6):t*2.2;
 c.save();cam(c,lerp(560,420,aim),lerp(980,960,aim),1.04+0.1*aim,0,Math.sin(T*1.5)*6);
 sky(c,['#060a1a','#0e1a36','#1d3358','#345278'],hy);stars(c,T,hy);clouds(c,T,520,'rgba(120,150,210,0.16)',41,5);moon(c,860,330,54);
 c.fillStyle='#0b1022';c.beginPath();c.moveTo(860,hy+10);c.quadraticCurveTo(960,hy-36,1140,hy-10);c.lineTo(1140,hy+30);c.lineTo(860,hy+30);c.fill();c.beginPath();c.moveTo(980,hy-20);c.lineTo(988,hy-120);c.lineTo(1008,hy-120);c.lineTo(1016,hy-20);c.fill();beam(c,{x:998,y:hy-128},T*1.5,520,0.5);
 sea(c,hy,T,'#213c62','#050914',860);farLight(c,150,hy-8,T,1+aim*0.5);
 waveLayer(c,1160,18,250,1.3,T,'#27446d','#0a1326','rgba(200,225,255,0.25)');
 const bx=560,yb=1250,by=waveY(bx,yb,26,230,1.7,T),rot=Math.cos(bx/230+T*1.7)*0.09;
 const oar=(lw)=>{const th=0.75*Math.sin(ph)+0.25,lx=10,ly=-34,vx=Math.sin(th),vy=Math.cos(th);c.strokeStyle='#4a3626';c.lineWidth=lw;c.lineCap='round';c.beginPath();c.moveTo(lx-vx*80,ly-vy*80);c.lineTo(lx+vx*190,ly+vy*190);c.stroke();c.fillStyle='#5d4130';c.save();c.translate(lx+vx*190,ly+vy*190);c.rotate(-th);c.beginPath();c.ellipse(0,18,14,34,0,0,7);c.fill();c.restore()};
 rowboat(c,bx,by+16,rot,1.45,()=>{const tr=go?0:Math.sin(T*26)*1.5;const mm=stick(c,{...OLD,x:-30+tr,y:-8,s:0.72,face:1,t:T,shadow:false,scarf:SCARF,eyes:{wide:1.2,blink:go?0:0.3,sad:!go},pose:{crouch:0.5,lean:0.2+0.34*Math.sin(ph),legL:[1.3,0.25],legR:[1.2,0.15],armL:[1.2+0.45*Math.sin(ph),1.6+0.3*Math.sin(ph)],armR:[1.1+0.45*Math.sin(ph),1.5]}});
  c.save();c.translate(96,-40);lantern(c,{x:0,y:-40},0.7,T);c.restore();},'#5d4130');
 c.save();c.translate(bx,by+16);c.rotate(rot);c.scale(1.45,1.45);oar(10);c.restore();
 waveLayer(c,yb+86,28,230,1.7,T+0.3,'#1b3156','#04070f','rgba(200,225,255,0.4)');
 waveLayer(c,yb+330,40,280,1.4,T+4,'#0f1c36','#020308','rgba(200,225,255,0.25)');
 if(!go){const r=rng(3);c.fillStyle='rgba(200,225,255,0.8)';for(let i=0;i<3;i++){const k=((T*1.2+i/3)%1);c.beginPath();c.ellipse(bx-90+i*30,by-330+k*90,5,9,0,0,7);c.fill()}}
 c.restore()}
// ---------- туман ----------
function shotFog(c,t,d,T,m){const hy=980,z=m[2]!=null?ease((t-m[2])/1.2):0,k=ease(t/1.8);
 c.save();cam(c,lerp(540,400,z),lerp(960,1090,z),1+0.6*z,0,0);
 sky(c,['#0a0f1c','#182236','#2a3850','#3c4a62'],hy);
 const g=c.createLinearGradient(0,hy,0,H);g.addColorStop(0,'#33425c');g.addColorStop(1,'#080c16');c.fillStyle=g;c.fillRect(-200,hy,W+400,H-hy);
 c.save();c.lineCap='round';for(let i=0;i<20;i++){const q=i/20,y=hy+6+Math.pow(q,1.6)*640,amp=1+q*7,wl=80+q*220;c.beginPath();for(let x=-60;x<=W+60;x+=24){const yy=y+Math.sin(x/wl+T*0.9+i*1.7)*amp;x<-50?c.moveTo(x,yy):c.lineTo(x,yy)}c.strokeStyle=`rgba(200,215,240,${0.05+q*0.08})`;c.lineWidth=1.5+q*4;c.stroke()}c.restore();
 fog(c,T,hy-260,7,0.20,11);
 const bx=400,by=hy+250+Math.sin(T*1.5)*6;c.save();c.globalAlpha=lerp(0.1,1,k);
 const sm=stick(c,{...STR,rim:'rgba(255,205,140,0.8)',rimDir:1,x:bx-8,y:by-34,s:1.25,face:1,t:T,shadow:false,pose:{lean:0.03,armL:[2.25,2.7],armR:[0.1,0.3],bob:Math.sin(T*1.5+1)*2}});lantern(c,{x:sm.hf.x,y:sm.hf.y-10},1.3,T,1.2);
 rowboat(c,bx,by,Math.sin(T*1.5)*0.03,1.5,null,'#6b4a34');c.restore();
 fog(c,T+40,hy+40,6,0.26*(1-k*0.7),23);
 // лодка Матвея на переднем плане
 const fy=1700+Math.sin(T*1.5)*8;stick(c,{...OLD,back:true,rim:'rgba(255,205,140,0.6)',rimDir:-1,x:900,y:fy-40,s:1.7,face:-1,t:T,shadow:false,scarf:SCARF,pose:{crouch:0.5,lean:lerp(0.2,-0.05,z),legL:[1.3,0.25],legR:[1.2,0.15],armL:[0.9,1.3],armR:[0.8,1.2]}});
 rowboat(c,860,fy,0.04,2.3,null,'#3d2a20');
 fog(c,T+90,hy+500,5,0.16,37);
 c.restore()}
// ---------- «Лёша?» ----------
function shotAsk(c,t,d,T,m){const q=m[1]!=null?t-m[1]:-1;c.save();cam(c,520,900,1.0+0.08*ease(t/d),0,0);
 sky(c,['#0a0f1c','#182236','#2a3850','#3c4a62'],H);fog(c,T,500,7,0.16,51);
 const pu=0.8+0.2*Math.sin(T*2.2);glow(c,-80,1010,900,'rgba(255,190,110,A)',0.42*pu);
 const tr=Math.sin(T*27)*2;
 const mm=stick(c,{...OLD,x:690+tr,y:2640,s:4.0,face:-1,t:T,noLegs:true,shadow:false,scarf:SCARF,rim:`rgba(255,205,140,${0.8*pu})`,rimDir:-1,eyes:{wide:1.4,blink:(t>0.5&&t<0.62)?1:0},pose:{lean:-0.02,headTilt:-0.05,armL:[0.25,0.5],armR:[-0.2,0.2],bob:Math.sin(T*1.8)*5}});
 fog(c,T+20,1500,4,0.14,57);
 if(q>0)bubble(c,150+Math.sin(T*30)*2,300,560,230,mm.head.x-60,mm.head.y-mm.HR-40,['ЛЁША?..'],120,back(q/0.25));
 c.restore()}
// ---------- «Здравствуй, папа» ----------
function shotSon(c,t,d,T,m){const up=m[1]!=null?ease((t-m[1])/0.5):0,q=m[2]!=null?t-m[2]:-1;c.save();cam(c,560,900,1.0+0.08*ease(t/d),0,0);
 sky(c,['#0a0f1c','#182236','#2a3850','#3c4a62'],H);fog(c,T,500,7,0.16,61);
 const pu=0.8+0.2*Math.sin(T*2.2);glow(c,W+80,1010,900,'rgba(255,190,110,A)',0.42*pu);
 const mm=stick(c,{...SON,x:390,y:2640,s:4.0,face:1,t:T,noLegs:true,shadow:false,rim:`rgba(255,205,140,${0.8*pu})`,rimDir:1,eyes:{dy:lerp(26,0,up),blink:(t>0.9&&t<1.02)?1:lerp(0.35,0,up),wide:1+0.2*up},pose:{lean:0.02,headTilt:lerp(0.2,-0.03,up),armL:[0.25,0.5],armR:[-0.2,0.2],bob:Math.sin(T*1.8)*5}});
 if(q>0.3)tears(c,mm,1,T,1);
 fog(c,T+20,1500,4,0.14,67);
 if(q>0)bubble(c,330,270,700,330,mm.head.x+70,mm.head.y-mm.HR-40,['ЗДРАВСТВУЙ,','ПАПА'],104,back(q/0.28));
 c.restore()}
// ---------- чужой корабль ----------
function dawnSea(c,T,hy){sky(c,['#3a455b','#67748c','#a2aab8','#d6cec3'],hy);clouds(c,T,420,'rgba(235,235,240,0.35)',71,6);
 const g=c.createLinearGradient(0,hy,0,H);g.addColorStop(0,'#8c9aae');g.addColorStop(0.5,'#52607a');g.addColorStop(1,'#232c3e');c.fillStyle=g;c.fillRect(-200,hy,W+400,H-hy);
 c.save();c.lineCap='round';for(let i=0;i<22;i++){const k=i/22,y=hy+6+Math.pow(k,1.6)*700,amp=1+k*8,wl=80+k*220;c.beginPath();for(let x=-60;x<=W+60;x+=24){const yy=y+Math.sin(x/wl+T*0.9+i*1.7)*amp;x<-50?c.moveTo(x,yy):c.lineTo(x,yy)}c.strokeStyle=`rgba(235,240,250,${0.10+k*0.10})`;c.lineWidth=1.5+k*4;c.stroke()}c.restore()}
function shotShip(c,t,d,T,m){const hy=1000,z=m[1]!=null?ease((t-m[1])/1.2):0;const bx=300,by=hy+290+Math.sin(T*1.4)*8;
 c.save();cam(c,lerp(540,bx+40,z),lerp(960,by-40,z),1+0.75*z,0,0);
 dawnSea(c,T,hy);
 // дым
 c.save();c.filter='blur(22px)';for(let i=0;i<7;i++){const k=((T*0.12+i/7)%1);c.fillStyle=`rgba(70,74,88,${0.5*(1-k)})`;c.beginPath();c.arc(930-k*520,hy-470-k*150,40+k*110,0,7);c.fill()}c.restore();
 const sy=Math.sin(T*0.8)*6;c.save();c.translate(0,sy);
 c.fillStyle='#2b3444';c.fillRect(760,hy-300,340,210);c.fillStyle='#394456';c.fillRect(800,hy-380,200,90);c.fillStyle='#1c2330';c.fillRect(895,hy-500,76,130);c.fillStyle='#8f3a34';c.fillRect(895,hy-470,76,26);
 c.fillStyle='#ffd58a';for(let i=0;i<5;i++)c.fillRect(790+i*60,hy-260,34,30);for(let i=0;i<3;i++)c.fillRect(826+i*56,hy-355,30,26);
 c.strokeStyle='#1c2330';c.lineWidth=8;c.beginPath();c.moveTo(620,hy-90);c.lineTo(620,hy-330);c.moveTo(620,hy-300);c.lineTo(720,hy-250);c.stroke();
 const hg=c.createLinearGradient(0,hy-90,0,hy+260);hg.addColorStop(0,'#283244');hg.addColorStop(1,'#10151f');c.fillStyle=hg;c.beginPath();c.moveTo(400,hy-110);c.lineTo(1300,hy-110);c.lineTo(1300,hy+260);c.lineTo(540,hy+260);c.quadraticCurveTo(450,hy+120,400,hy-110);c.fill();
 c.fillStyle='#7a2f2c';c.beginPath();c.moveTo(505,hy+190);c.lineTo(1300,hy+190);c.lineTo(1300,hy+260);c.lineTo(540,hy+260);c.fill();
 c.fillStyle='rgba(220,225,235,0.55)';c.font='900 44px M';c.textAlign='left';c.fillText('NORDSTERN',520,hy);
 c.strokeStyle='#10151f';c.lineWidth=6;c.beginPath();c.moveTo(410,hy-160);c.lineTo(1300,hy-160);for(let x=420;x<1300;x+=60){c.moveTo(x,hy-160);c.lineTo(x,hy-110)}c.stroke();
 stick(c,{x:520,y:hy-112,s:0.5,face:-1,col:'#4a5a78',shadow:false,t:T,pose:{lean:0.3,armL:[1.0,1.2],armR:[0.6,1.0]}});stick(c,{x:610,y:hy-112,s:0.5,face:-1,col:'#6a5a4a',shadow:false,t:T,pose:{armL:[2.6+Math.sin(T*8)*0.3,2.9],bob:Math.abs(Math.sin(T*8))*-4}});
 c.restore();
 // трос и круг
 c.strokeStyle='#d8d2c2';c.lineWidth=5;c.beginPath();c.moveTo(505,hy-130+sy);c.quadraticCurveTo(430,by-200,bx+80,by-60);c.stroke();c.strokeStyle='#e8703a';c.lineWidth=16;c.beginPath();c.arc(bx+80,by-40,26,0,7);c.stroke();
 boatDraw(c,bx,by,Math.sin(T*1.4+1)*0.05,1.1,T,{torn:true,sail:'#a9a295',hull:'#5a3c2a'});
 c.save();c.translate(bx,by);c.rotate(Math.sin(T*1.4+1)*0.05);stick(c,{x:-70,y:-22,s:0.66,face:1,col:'#e3a84a',scarf:null,shadow:false,t:T,eyes:{blink:1},pose:{crouch:0.86,lean:1.45,headTilt:0.1,legL:[1.5,0.1],legR:[1.45,0.0],armL:[1.5,1.6],armR:[1.4,1.5]}});c.restore();
 waveLayer(c,by+70,12,260,1.2,T,'#5a6a84','#232c3e','rgba(240,244,250,0.5)');
 c.restore();c.fillStyle='rgba(40,50,70,0.15)';c.fillRect(0,0,W,H)}
// ---------- память ----------
function memCard(c,x,y,rot,kind,a,s=1,T=0){if(a<=0)return;c.save();c.globalAlpha=a;c.translate(x,y);c.rotate(rot);c.scale(s,s);c.fillStyle='rgba(0,0,0,0.35)';c.fillRect(-100,-116,216,256);c.fillStyle='#f3ead6';c.fillRect(-108,-126,216,252);
 const sg=c.createLinearGradient(0,-110,0,70);if(kind=='light'){sg.addColorStop(0,'#1d2d55');sg.addColorStop(1,'#3f5a86')}else{sg.addColorStop(0,'#e9c98f');sg.addColorStop(1,'#9c7b52')}c.fillStyle=sg;c.fillRect(-92,-110,184,184);
 c.save();c.beginPath();c.rect(-92,-110,184,184);c.clip();
 if(kind=='house'){c.fillStyle='#6b5234';c.fillRect(-92,44,184,30);c.fillStyle='#7a4a3a';c.fillRect(-50,-20,100,66);c.fillStyle='#4a2d26';c.beginPath();c.moveTo(-66,-20);c.lineTo(0,-72);c.lineTo(66,-20);c.fill();c.fillStyle='#ffd58a';c.fillRect(-30,0,24,26);c.fillStyle='#3a241e';c.fillRect(10,6,22,40)}
 else if(kind=='father'){c.fillStyle='#6b5234';c.fillRect(-92,44,184,30);stick(c,{x:-20,y:48,s:0.36,face:1,col:'#7389ad',hat:'#2a2f44',shadow:false,pose:{armL:[1.3,1.6]}});stick(c,{x:36,y:48,s:0.22,face:-1,col:'#e3a84a',shadow:false,pose:{armL:[1.2,1.6]}})}
 else{c.fillStyle='#0d1528';c.fillRect(-92,50,184,30);lighthouse(c,0,52,150,0);glow(c,0,-78,60,'rgba(255,240,180,A)',0.9)}
 c.restore();c.restore()}
function shotForget(c,t,d,T,m){c.save();cam(c,540,900,1.0+0.06*ease(t/d),0,Math.sin(T*0.8)*8);
 const wg=c.createLinearGradient(0,0,0,H);wg.addColorStop(0,'#101c26');wg.addColorStop(1,'#1e3542');c.fillStyle=wg;c.fillRect(-100,-100,W+200,H+200);
 c.strokeStyle='rgba(0,0,0,0.22)';c.lineWidth=4;for(let y=160;y<1300;y+=150){c.beginPath();c.moveTo(-100,y);c.lineTo(W+100,y);c.stroke()}
 // иллюминатор
 c.save();c.beginPath();c.arc(170,340,104,0,7);c.clip();c.fillStyle='#c9d1dc';c.fillRect(0,200,400,300);c.fillStyle='#5d6c86';c.fillRect(0,340+Math.sin(T*0.8)*26,400,200);c.restore();c.strokeStyle='#0b141b';c.lineWidth=22;c.beginPath();c.arc(170,340,104,0,7);c.stroke();c.strokeStyle='#3d5868';c.lineWidth=6;c.beginPath();c.arc(170,340,116,0,7);c.stroke();
 const f1=m[1]!=null?ease((t-m[1])/0.55):0,f2=m[2]!=null?ease((t-m[2])/0.55):0,f3=m[2]!=null?ease((t-m[2]-0.45)/0.55):0,nm=m[3]!=null?t-m[3]:-1;
 // мысли
 c.fillStyle='rgba(240,236,224,0.5)';[[470,980,16],[505,915,24]].forEach(([x,y,r])=>{c.beginPath();c.arc(x,y,r,0,7);c.fill()});
 memCard(c,360,610-f1*70,-0.1-f1*0.3,'house',1-f1,1.15);memCard(c,625,500-f2*70,0.04+f2*0.3,'father',1-f2,1.15);memCard(c,880,640-f3*70,0.12-f3*0.3,'light',1-f3,1.15);
 if(f1>0&&nm<0){c.save();c.font='900 150px M';c.textAlign='center';[[360,640,f1],[625,530,f2],[880,670,f3]].forEach(([x,y,k],i)=>{if(k>0){c.globalAlpha=k*0.85;c.fillStyle='#8fa6b8';c.fillText('?',x+Math.sin(T*2+i)*8,y)}});c.restore()}
 // койка
 c.fillStyle='#0d161d';c.fillRect(90,1330,900,60);c.fillStyle='#3b4960';c.beginPath();c.roundRect(110,1250,860,90,26);c.fill();c.fillStyle='#d9d6cc';c.beginPath();c.roundRect(130,1170,200,96,36);c.fill();
 const mm=stick(c,{x:420,y:1300,s:1.5,face:1,col:'#e3a84a',shadow:false,t:T,rim:'rgba(200,215,235,0.5)',eyes:{sad:nm<0,dy:nm<0?6:0,wide:nm>0?1.2:1,blink:(t>0.8&&t<0.95)?1:0},pose:{crouch:0.52,lean:0.08,headTilt:nm>0?-0.05:0.16,legL:[1.45,0.2],legR:[1.4,0.1],armL:[0.6,1.2],armR:[0.4,1.0],bob:Math.sin(T*1.6)*2}});
 c.fillStyle='#6a4040';c.beginPath();c.moveTo(430,1240);c.quadraticCurveTo(700,1170,970,1230);c.lineTo(970,1340);c.lineTo(400,1340);c.closePath();c.fill();c.fillStyle='rgba(255,255,255,0.08)';c.fillRect(400,1300,570,12);
 c.restore();
 if(nm>0){bigText(c,'ЛЁША',600,560,210,'#ffd60a',0.7+0.3*back(nm/0.3),-0.04,28);glow(c,600,560,420,'rgba(255,214,10,A)',0.12)}}
// ---------- вырос в другой стране ----------
function shotGrow(c,t,d,T,m){const gy=1380,k=ease(t/(d-0.3));c.save();cam(c,540,1000,1.03+0.04*(t/d),lerp(14,-14,t/d),0);
 sky(c,['#16243a','#2c4a66','#6d8a94','#e6b98a'],gy);clouds(c,T,420,'rgba(255,220,190,0.25)',81,5);
 // мачты и кран
 c.strokeStyle='#1a2534';c.lineWidth=8;[[120,520],[210,440],[930,480]].forEach(([x,h])=>{c.beginPath();c.moveTo(x,gy-300);c.lineTo(x,gy-300-h);c.moveTo(x-50,gy-300-h*0.7);c.lineTo(x+50,gy-300-h*0.7);c.stroke()});
 const r=rng(91),cols=['#3d4f66','#56405c','#3f5c58','#5c4a3c','#4a4466'];let x=-80;while(x<W+80){const w=120+r()*60,h=380+r()*260,col=cols[Math.floor(r()*5)];c.fillStyle=col;c.fillRect(x,gy-h,w,h);c.beginPath();const st=4;for(let i=0;i<st;i++){c.rect(x+i*w/(st*2),gy-h-(i+1)*22,w-i*w/st,24)}c.fill();
  for(let yy=gy-h+50;yy<gy-80;yy+=92)for(let xx=x+22;xx<x+w-40;xx+=50){c.fillStyle=r()<0.5?'#ffd58a':'#1a2230';c.fillRect(xx,yy,26,44)}x+=w+6}
 const g=c.createLinearGradient(0,gy,0,H);g.addColorStop(0,'#2a3040');g.addColorStop(1,'#0b0d14');c.fillStyle=g;c.fillRect(-200,gy,W+400,H-gy);
 const fa=m[1]!=null?ease((t-m[1])/0.5):0;
 if(fa>0){c.save();c.globalAlpha=fa;stick(c,{x:250,y:gy+40,s:1.25,face:1,col:'#6b6480',t:T,pose:{armL:[2.5+Math.sin(T*6)*0.3,2.9],lean:0.05}});stick(c,{x:840,y:gy+40,s:1.2,face:-1,col:'#80646e',t:T,pose:{armL:[0.9,1.6],lean:0.08}});c.restore()}
 const sail=m[3]!=null&&t>m[3];
 stick(c,{x:540,y:gy+60,s:lerp(0.62,1.32,k),face:1,col:'#e3a84a',t:T,hat:sail?'#ece8dc':null,rim:'rgba(255,220,180,0.5)',eyes:{blink:(t>1.2&&t<1.32)?1:0},pose:{lean:0.02,armL:sail?[2.3,3.3]:[0.15,0.3],armR:[-0.15,0.1],bob:Math.sin(T*2)*2}});
 if(m[2]!=null&&t>m[2]){c.save();c.font='900 54px M';c.textAlign='center';['HELLO','HOLA','HALLO','CIAO'].forEach((w,i)=>{const q=((t-m[2])*0.5+i*0.22)%1;c.globalAlpha=Math.sin(q*Math.PI);const bx=250+i*190,by=820-q*160-(i%2)*90;c.fillStyle='#fbf7ee';c.beginPath();c.roundRect(bx-100,by-44,200,84,30);c.fill();c.fillStyle='#22303f';c.fillText(w,bx,by+18)});c.restore()}
 c.restore();
 bigText(c,Math.floor(lerp(10,40,k))+' ЛЕТ',W/2,300,150,'#ffd60a',1+0.03*Math.sin(T*14),0,24)}
// ---------- сон ----------
function shotDream(c,t,d,T,m){const lh=m[2]!=null?ease((t-m[2])/0.7):0;c.save();cam(c,540,900,1.0+0.06*ease(t/d),0,0);
 const wg=c.createLinearGradient(0,0,0,H);wg.addColorStop(0,'#090a14');wg.addColorStop(1,'#141627');c.fillStyle=wg;c.fillRect(-100,-100,W+200,H+200);
 // облако сна
 const cl=()=>{c.beginPath();[[560,640,330],[300,700,210],[820,690,220],[430,440,200],[700,430,210],[560,860,240]].forEach(([x,y,r])=>{c.moveTo(x+r,y);c.arc(x,y,r,0,7)})};
 c.strokeStyle='rgba(225,230,250,0.85)';c.lineWidth=20;cl();c.stroke();
 c.save();cl();c.clip();c.fillStyle='#05060c';c.fillRect(0,100,W,1100);
 c.save();c.filter='blur(30px)';for(let i=0;i<5;i++){c.fillStyle='rgba(60,70,110,0.35)';c.beginPath();c.ellipse(560+Math.sin(T*0.7+i*1.3)*260,640+Math.cos(T*0.5+i*2.1)*200,170,90,i,0,7);c.fill()}c.restore();
 if(lh>0){c.save();c.globalAlpha=lh;const fl2=(t-m[2]>1.1&&t-m[2]<1.3)?1:0;if(fl2){c.fillStyle='#2a3558';c.fillRect(0,100,W,1100)}rocks(c,[[200,1010],[380,930],[560,905],[740,930],[920,1010]],'#141b2e','#05060c');lighthouse(c,560,912,660,T,true);c.restore();rain(c,T,120,0.3*lh)}
 c.restore();
 c.fillStyle='rgba(225,230,250,0.85)';[[330,1105,26],[385,1035,40]].forEach(([x,y,r])=>{c.beginPath();c.arc(x,y,r,0,7);c.fill()});
 // кровать
 c.fillStyle='#0b0c16';c.fillRect(80,1390,920,70);c.fillRect(80,1150,30,300);c.fillStyle='#2b3046';c.beginPath();c.roundRect(110,1300,880,100,24);c.fill();c.fillStyle='#d5d2c8';c.beginPath();c.roundRect(130,1232,240,96,40);c.fill();
 const hx=290,hy2=1205+Math.sin(T*1.5)*3;c.fillStyle='#0c0c12';c.beginPath();c.arc(hx,hy2,82,0,7);c.fill();c.strokeStyle='#f0f0f0';c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(hx+14,hy2-6);c.lineTo(hx+34,hy2-2);c.moveTo(hx+46,hy2-6);c.lineTo(hx+66,hy2-2);c.stroke();
 c.fillStyle='#3a4666';c.beginPath();c.moveTo(350,1300);c.quadraticCurveTo(640,1195+Math.sin(T*1.5)*6,990,1280);c.lineTo(990,1400);c.lineTo(350,1400);c.closePath();c.fill();c.fillStyle='#e3a84a';c.beginPath();c.roundRect(340,1262,90,34,17);c.fill();
 c.restore()}
// ---------- видео в телефоне ----------
function shotPhone(c,t,d,T,m){const sc2=m[2]!=null&&t>m[2];c.save();cam(c,540,860,1.0+0.07*ease(t/d),0,0);
 const wg=c.createRadialGradient(540,800,100,540,900,1300);wg.addColorStop(0,'#1a2038');wg.addColorStop(1,'#05060c');c.fillStyle=wg;c.fillRect(-100,-100,W+200,H+200);
 glow(c,540,800,1000,'rgba(120,160,255,A)',0.22);
 c.strokeStyle='#e3a84a';c.lineCap='round';c.lineWidth=120;c.beginPath();c.moveTo(1160,2000);c.lineTo(930,1560);c.stroke();
 c.fillStyle='#14151d';c.beginPath();c.roundRect(196,140,688,1330,84);c.fill();c.strokeStyle='#33364a';c.lineWidth=6;c.stroke();
 c.save();c.beginPath();c.roundRect(222,170,636,1270,60);c.clip();c.fillStyle='#000';c.fillRect(222,170,636,1270);
 c.translate(222,240);c.scale(636/1080,636/1080);
 if(sc2){const q=ease((t-m[2])/0.9);c.translate(660,1250);c.scale(1+0.35*q,1+0.35*q);c.translate(-660,-1250);shotD(c,t-m[2],4,T,[])}else shotA(c,(t*0.8)%2.7,2.7,T,[]);
 c.restore();
 // интерфейс
 heart(c,790,930,0.62,'#ff4d6a');c.fillStyle='#fff';c.font='900 30px M';c.textAlign='center';c.fillText('1,2M',790,990);c.beginPath();c.roundRect(760,1030,60,48,16);c.fill();c.fillText('48K',790,1118);
 c.fillStyle='rgba(255,255,255,0.3)';c.fillRect(250,1408,580,6);c.fillStyle='#fff';c.fillRect(250,1408,580*clamp((t/d)),6);
 c.fillStyle='#0a0a10';c.beginPath();c.roundRect(470,186,140,34,17);c.fill();
 if(sc2){const q=back((t-m[2]-0.5)/0.3);if(t-m[2]>0.5){c.strokeStyle='#ffd60a';c.lineWidth=12;c.beginPath();c.ellipse(650,1010,170*q,70*q,-0.1,0,7);c.stroke()}}
 c.fillStyle='#e3a84a';c.beginPath();c.ellipse(900,1420,74,120,0.5,0,7);c.fill();
 c.restore()}
// ---------- вспомнил всё ----------
function shotRemember(c,t,d,T){c.save();cam(c,540,960,1.0+0.1*ease(t/d),0,0);
 const wg=c.createRadialGradient(540,900,100,540,900,1300);wg.addColorStop(0,'#27305a');wg.addColorStop(1,'#05060c');c.fillStyle=wg;c.fillRect(-100,-100,W+200,H+200);
 const P=[[220,560,-0.12,'house',[-400,300]],[540,400,0.03,'father',[540,-400]],[860,560,0.12,'light',[1500,300]]];
 P.forEach(([x,y,r,kd,[sx,sy]],i)=>{const k=back((t-0.15-i*0.28)/0.45);if(t>0.15+i*0.28){glow(c,lerp(sx,x,k),lerp(sy,y,k),320,'rgba(255,214,120,A)',0.28);memCard(c,lerp(sx,x,k),lerp(sy,y,k),r+(1-clamp(k))*2,kd,1,1.35)}});
 const mm=stick(c,{...SON,x:540,y:2540,s:3.3,face:1,t:T,noLegs:true,shadow:false,rim:'rgba(255,214,120,0.8)',rimDir:1,eyes:{wide:1.5,dy:-8},pose:{lean:0,headTilt:-0.1,armL:[0.25,0.5],armR:[-0.2,0.2],bob:Math.sin(T*26)*2*clamp(1-t/1.5)}});
 if(t>1.1)tears(c,mm,1,T,1);
 c.restore();const fl=t>0.95&&t<1.5?1-ease((t-0.95)/0.55):0;if(fl>0){c.fillStyle=`rgba(255,246,220,${0.75*fl})`;c.fillRect(0,0,W,H)}}
// ---------- ехал четыре дня ----------
function shotTravel(c,t,d,T,m){const dp=clamp(t/(m[1]!=null?m[1]+0.3:d))*4,fr=dp%1,day=Math.min(4,Math.floor(dp)+1),z=m[1]!=null?ease((t-m[1])/0.9):0;
 const nk=clamp(0.5-0.5*Math.cos(fr*Math.PI*2));const mix=(a,b)=>{const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);const f=(s)=>Math.round(lerp(A>>s&255,B>>s&255,nk));return`rgb(${f(16)},${f(8)},${f(0)})`};
 c.save();cam(c,lerp(540,560,z),lerp(960,1130,z),1+1.0*z,0,Math.sin(T*30)*2);
 sky(c,[mix('#2f5f96','#070a1c'),mix('#7fb0d6','#16244a'),mix('#f1d9b0','#2f4877')],1300);
 if(nk>0.5)stars(c,T,900,(nk-0.5)*2);
 const sx=-120+fr*1320,sy=620-Math.sin(fr*Math.PI)*330;if(fr<0.5){glow(c,sx*2+120,sy,420,'rgba(255,220,150,A)',0.5);c.fillStyle='#fff3cf';c.beginPath();c.arc(sx*2+120,sy,70,0,7);c.fill()}else moon(c,(sx-540)*2,sy,56);
 const hill=(yb,amp,wl,sp,col)=>{c.fillStyle=col;c.beginPath();c.moveTo(-100,H);for(let x=-100;x<=W+100;x+=30)c.lineTo(x,yb+Math.sin((x+T*sp)/wl)*amp+Math.sin((x+T*sp)/(wl*0.37))*amp*0.4);c.lineTo(W+100,H);c.fill()};
 hill(1010,70,300,160,mix('#5f8a7a','#16223c'));hill(1110,50,210,340,mix('#3f6a5a','#0e1830'));
 c.fillStyle='#10131c';for(let i=0;i<4;i++){const px=W+200-((T*900+i*420)%1700);c.fillRect(px,820,14,420);c.fillRect(px-50,850,114,10)}
 // поезд
 const ty=1060+Math.sin(T*24)*2;c.fillStyle='#22262f';c.fillRect(-100,ty+300,W+200,26);c.fillStyle=mix('#4a5a50','#0c1016');c.fillRect(-100,ty+326,W+200,H);
 for(let i=-1;i<2;i++){const cx=540+i*880;const g=c.createLinearGradient(0,ty,0,ty+270);g.addColorStop(0,'#35584f');g.addColorStop(1,'#1c302c');c.fillStyle=g;c.beginPath();c.roundRect(cx-420,ty,840,270,30);c.fill();c.fillStyle='#e9e1c6';c.fillRect(cx-420,ty+190,840,14);
  for(let j=0;j<4;j++){const wx=cx-340+j*190;c.fillStyle='#ffd58a';c.beginPath();c.roundRect(wx,ty+40,130,120,14);c.fill();glow(c,wx+65,ty+100,150,'rgba(255,190,110,A)',0.18*nk)}
  for(const wx of [cx-300,cx-180,cx+180,cx+300]){c.fillStyle='#0c0d12';c.beginPath();c.arc(wx,ty+290,38,0,7);c.fill();c.strokeStyle='#555';c.lineWidth=6;c.beginPath();c.moveTo(wx,ty+290);c.lineTo(wx+Math.cos(T*20)*30,ty+290+Math.sin(T*20)*30);c.stroke()}}
 c.save();c.beginPath();c.roundRect(540-340+190,ty+40,130,120,14);c.clip();stick(c,{...SON,x:440,y:ty+424,s:0.75,face:1,t:T,shadow:false,noLegs:true,scarf:null,eyes:{wide:1+0.3*z,dx:3},pose:{armL:[0.3,0.6],bob:Math.sin(T*24)*1.5}});c.restore();
 c.restore();
 if(z<0.5){c.save();c.globalAlpha=1-z*2;bigText(c,'ДЕНЬ '+day,W/2,300,150,'#ffd60a',1+0.03*Math.sin(T*14),0,24);c.restore()}}
// ---------- двое в лодках ----------
function duo(c,t,T,o){const hy=960;nightSea(c,T,hy,840,330,54);
 c.fillStyle='#0b1022';c.beginPath();c.moveTo(-60,hy+10);c.quadraticCurveTo(60,hy-30,240,hy-4);c.lineTo(240,hy+30);c.lineTo(-60,hy+30);c.fill();c.beginPath();c.moveTo(70,hy-14);c.lineTo(78,hy-120);c.lineTo(98,hy-120);c.lineTo(106,hy-14);c.fill();beam(c,{x:88,y:hy-128},T*1.5,520,0.5);
 fog(c,T,hy-120,5,0.10,71);
 const b1=Math.sin(T*1.5)*6,b2=Math.sin(T*1.5+1.2)*6,fx=o.fx||740,sx=o.sx||350;
 const s=stick(c,{...SON,rim:'rgba(255,205,140,0.6)',rimDir:1,x:sx,y:1318+b1,s:1.3,face:1,t:T,shadow:false,scarf:o.scarf=='son'?SCARF:null,eyes:o.sEyes||{},pose:o.sPose});
 const f=stick(c,{...OLD,rim:'rgba(255,205,140,0.6)',rimDir:-1,x:fx,y:1318+b2,s:1.3,face:-1,t:T,shadow:false,scarf:o.scarf=='father'?SCARF:null,eyes:o.fEyes||{},pose:o.fPose});
 if(o.scarf=='move'){const k=o.k,a=f.hf,b={x:s.neck.x+10,y:s.neck.y+14};const px=lerp(f.neck.x,b.x,k),py=lerp(f.neck.y+10,b.y,k)-Math.sin(k*Math.PI)*70;c.strokeStyle=SCARF;c.lineWidth=26;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(px+50,py-6);c.lineTo(px,py);for(let i=1;i<=5;i++)c.lineTo(px-6+Math.sin(T*4+i)*i*3,py+i*24);c.stroke()}
 rowboat(c,sx-20,1350+b1,Math.sin(T*1.5)*0.03,1.5,null,'#6b4a34');rowboat(c,fx+20,1350+b2,Math.sin(T*1.5+1.2)*0.03,1.5,null,'#5d4130');
 lantern(c,{x:sx-150,y:1230+b1},1.0,T);lantern(c,{x:fx+150,y:1230+b2},1.0,T);
 waveLayer(c,1420,12,260,1.2,T,'#1b3156','#04070f','rgba(200,225,255,0.3)');
 return{s,f}}
function shotSorry(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a3=m[3]!=null?t-m[3]:-1,a4=m[4]!=null?t-m[4]:-1,rc=a3>0?ease(a3/0.5):0,lk=a4>0?ease(a4/0.5):0;
 c.save();cam(c,545,1040,1.12+0.08*ease(t/d),0,0);
 const r=duo(c,t,T,{scarf:'father',fEyes:{sad:true,dy:lerp(10,0,lk),blink:lk>0?0:0.5},fPose:{lean:lerp(0.22,0.06,lk),headTilt:lerp(0.34,0.0,lk),armL:[0.2,0.4],armR:[0.1,0.3],bob:Math.sin(T*24)*1.5*(1-lk)},
  sEyes:{},sPose:{lean:0.06+0.1*rc,armL:[lerp(0.2,1.5,rc),lerp(0.4,1.55,rc)],armR:[0.1,0.3]}});
 tears(c,r.f,-1,T,2);
 if(a1>0&&a3<0)bubble(c,300,300,700,330,r.f.head.x-40,r.f.head.y-r.f.HR-30,['ПРОСТИ МЕНЯ.','Я УСНУЛ…'],96,back(a1/0.28));
 if(a3>0&&a4<0)bubble(c,70,330,640,230,r.s.head.x+40,r.s.head.y-r.s.HR-30,['Я ЗНАЮ, ПАПА'],84,back(a3/0.28));
 if(a4>0)bubble(c,70,250,760,400,r.s.head.x+40,r.s.head.y-r.s.HR-30,['НО ПОТОМ ТЫ','НЕ СПАЛ','30 ЛЕТ'],96,back(a4/0.28));
 c.restore()}
function shotGive(c,t,d,T,m){const k=clamp((t-0.5)/1.3),on=m[1]!=null?clamp((t-m[1]-0.1)/0.5):0,hug=m[1]!=null?ease((t-m[1]-0.7)/0.7):0;
 c.save();cam(c,545,1060,1.3+0.12*ease(t/d),0,0);
 const st=on>=1?'son':(k>0?'move':'father');
 const r=duo(c,t,T,{scarf:st,k:ease(Math.max(k*0.55,on)),fx:740-hug*70,sx:350+hug*70,fEyes:{sad:false,blink:hug>0.8?1:0},fPose:{lean:0.1+0.16*hug,headTilt:0.05,armL:[lerp(0.2,1.5,ease(k)),lerp(0.4,1.6,ease(k))],armR:[lerp(0.1,1.3,ease(k)),lerp(0.3,1.5,ease(k))]},
  sEyes:{blink:hug>0.8?1:0},sPose:{lean:0.04+0.18*hug,armL:[lerp(0.2,1.4,hug),lerp(0.4,1.6,hug)],armR:[0.1+hug*1.1,0.3+hug*1.2]}});
 if(hug>0.5){for(let i=0;i<3;i++){const q=((T*0.6+i/3)%1);heart(c,545+Math.sin(i*2+T)*60,760-q*220,0.5+q*0.3,`rgba(255,110,120,${(1-q)*hug})`)}}
 c.restore()}
// ---------- маяк загорается ----------
function shotIgnite(c,t,d,T){const hy=1210,on=t>0.55,k=on?easeOut((t-0.55)/0.6):0;c.save();cam(c,700,900,1.0+0.09*ease(t/d),0,0);
 sky(c,['#070a1c','#101a3c','#243a66','#3f5a86'],hy);stars(c,T,hy);clouds(c,T,560,'rgba(120,150,210,0.16)',4);moon(c,235,470,74);
 rocks(c,[[-60,1190],[40,1168],[150,1176],[260,1196],[330,1206],[400,1214]],'#1c2a4a','#132040');sea(c,hy,T,'#27446d','#060b18',235);
 rocks(c,[[-120,1560],[120,1500],[300,1420],[420,1330],[520,1250],[600,1215],[690,1196],[820,1192],[930,1210],[1010,1260],[1120,1290]],'#1b2640','#070a14','rgba(150,180,240,0.28)');
 const lamp=lighthouse(c,742,1200,700,T,!on);if(on){beam(c,lamp,T*1.5+0.6,1700,k);glow(c,lamp.x,lamp.y,700*(1-k)+60,'rgba(255,240,190,A)',0.8*(1-k)+0.1)}
 const yf=x=>x<520?lerp(1330,1250,(x-420)/100):x<600?lerp(1250,1215,(x-520)/80):x<690?lerp(1215,1196,(x-600)/90):1194;grass(c,430,1080,yf,T,5,'#0a1020');
 rocks(c,[[-80,1700],[40,1600],[150,1570],[260,1620],[380,1700],[520,1740],[700,1715],[860,1760],[1000,1700],[1160,1730]],'#0a0e1c','#03040a');
 c.restore();if(on&&t<0.8){c.fillStyle=`rgba(255,240,200,${0.45*(1-(t-0.55)/0.25)})`;c.fillRect(0,0,W,H)}}
// ---------- никто не смеётся ----------
function shotQuiet(c,t,d,T){const gy=1330,bp=clamp(Math.cos(T*1.5));c.save();cam(c,540,1000,1.04+0.05*(t/d),lerp(-16,16,t/d),0);
 sky(c,['#0b0a1f','#1c1838','#3a2a52','#5d3d5c'],gy);stars(c,T,700,0.8);
 c.fillStyle='#120f24';c.beginPath();c.moveTo(880,gy-380);c.lineTo(896,gy-700);c.lineTo(944,gy-700);c.lineTo(960,gy-380);c.fill();c.fillRect(888,gy-740,64,44);beam(c,{x:920,y:gy-720},T*1.5,900,0.9);
 house(c,-60,gy,330,470,'#1a1630','#120f22','#ffcf80',T,2);house(c,300,gy,280,380,'#211b3a','#17132a','#ffd590',T,5);house(c,610,gy,250,440,'#1a1630','#120f22','#ffcf80',T,8);house(c,880,gy,300,340,'#231d3d','#17132a','#ffd590',T,11);
 street(c,gy);
 c.strokeStyle='#0d0b18';c.lineWidth=14;c.lineCap='round';c.beginPath();c.moveTo(150,gy);c.lineTo(150,gy-560);c.quadraticCurveTo(150,gy-620,215,gy-620);c.stroke();glow(c,225,gy-604,120,'rgba(255,205,120,A)',0.8);c.fillStyle='#ffe6a8';c.beginPath();c.arc(225,gy-604,17,0,7);c.fill();
 [[200,'#e07a5f',1.18],[380,'#7fb69a',1.26],[550,'#e9c46a',1.14],[700,'#b98ac9',0.8]].forEach(([x,col,s],i)=>{stick(c,{x,y:gy+26+i*10,s,face:1,col,rim:`rgba(255,236,170,${0.25+0.6*bp})`,rimDir:1,t:T,eyes:{dy:-8,wide:1.15,blink:(t>0.8+i*0.3&&t<0.92+i*0.3)?1:0},
  pose:{lean:-0.04,headTilt:-0.34,armL:i==3?[2.4,2.9]:[0.12,0.25],armR:[-0.12,0.1],bob:Math.sin(T*1.6+i)*2}})});
 c.restore()}
// ---------- финал ----------
function shotFinal(c,t,d,T,m){const hy=980,sun=ease(t/d);c.save();cam(c,540,1000,1.0+0.08*ease(t/d),0,0);
 sky(c,['#0a1230','#243a66','#7a6a8a','#f0b48a'],hy);stars(c,T,600,1-sun*0.8);clouds(c,T,520,'rgba(255,200,170,0.22)',95,5);
 glow(c,330,hy,500+sun*300,'rgba(255,170,100,A)',0.35+0.3*sun);c.fillStyle='#ffe9c0';c.beginPath();c.arc(330,hy+40-sun*70,80,Math.PI,0);c.fill();
 const g=c.createLinearGradient(0,hy,0,H);g.addColorStop(0,'#b0705f');g.addColorStop(0.3,'#4d4468');g.addColorStop(1,'#0c1024');c.fillStyle=g;c.fillRect(-200,hy,W+400,H-hy);
 c.save();c.lineCap='round';for(let i=0;i<22;i++){const k=i/22,y=hy+6+Math.pow(k,1.6)*600,amp=2+k*10,wl=70+k*220;c.beginPath();for(let x=-60;x<=W+60;x+=24){const yy=y+Math.sin(x/wl+T*1.2+i*1.7)*amp;x<-50?c.moveTo(x,yy):c.lineTo(x,yy)}c.strokeStyle=`rgba(255,225,200,${0.06+k*0.08})`;c.lineWidth=1.5+k*5;c.stroke()}
 c.globalCompositeOperation='lighter';for(let i=0;i<26;i++){const k=i/26,y=hy+6+Math.pow(k,1.5)*520,w=(20+k*130)*(0.6+0.4*Math.sin(T*2.3+i*2.1));c.strokeStyle=`rgba(255,220,170,${0.4*(1-k*0.7)})`;c.lineWidth=2+k*6;c.beginPath();c.moveTo(330-w,y);c.lineTo(330+w,y);c.stroke()}c.restore();
 beam(c,{x:1250,y:330},Math.PI+0.1+Math.sin(T*1.1)*0.3,1700,0.8);
 for(let i=0;i<3;i++){const gx=((T*40+i*380)%1300)-100,gy2=420+i*70+Math.sin(T*2+i)*14,fl=Math.sin(T*9+i)*14;c.strokeStyle='rgba(20,24,40,0.8)';c.lineWidth=5;c.beginPath();c.moveTo(gx-26,gy2-fl);c.quadraticCurveTo(gx-10,gy2-10,gx,gy2);c.quadraticCurveTo(gx+10,gy2-10,gx+26,gy2-fl);c.stroke()}
 const ry=1330;c.fillStyle='#0a0c18';c.fillRect(-40,ry,W+80,22);for(let x=-10;x<W+40;x+=118)c.fillRect(x,ry,14,400);
 const fy=1880;
 stick(c,{...SON,back:true,rim:'rgba(255,200,150,0.7)',rimDir:-1,x:410,y:fy,s:1.95,face:1,t:T,shadow:false,scarf:SCARF,pose:{lean:0,armL:[0.12,0.2],armR:[-0.12,0.1],bob:Math.sin(T*1.6)*3}});
 stick(c,{...OLD,beard:false,back:true,rim:'rgba(255,200,150,0.7)',rimDir:-1,x:700,y:fy,s:1.85,face:-1,t:T,shadow:false,pose:{lean:0.03,armL:[1.25,1.5],armR:[-0.1,0.1],bob:Math.sin(T*1.6+1)*3}});
 const fg=c.createLinearGradient(0,1640,0,H);fg.addColorStop(0,'rgba(5,6,14,0)');fg.addColorStop(1,'rgba(5,6,14,0.95)');c.fillStyle=fg;c.fillRect(-40,1640,W+80,H-1640);
 c.restore()}

// ---------- обёртки для части 2 ----------
function hook(c,T){const a=1-ease((T-2.6)/0.3);if(a<=0)return;c.save();c.globalAlpha=a;bigText(c,'ЧАСТЬ 2',W/2,250,180,'#ffd60a',0.7+0.3*back(T/0.3),-0.03,26);if(T>0.25)bigText(c,'КТО ОТВЕТИЛ?',W/2,410,88,'#fff',0.7+0.3*back((T-0.25)/0.3),0,16);c.restore()}
function outro(c,T){const s=window.DATA.outro;if(T<s)return;bigText(c,'ПОДПИШИСЬ',W/2,270,136,'#ffd60a',0.7+0.3*back((T-s)/0.3),-0.02,24);if(T>s+0.4)bigText(c,'НОВАЯ ИСТОРИЯ — ЗАВТРА',W/2,410,60,'#fff',0.7+0.3*back((T-s-0.4)/0.3),0,13)}
Object.assign(FN,{shotStairsDown,shotStairsTwo,shotShore,shotRow,shotFog,shotAsk,shotSon,shotShip,shotForget,shotGrow,shotDream,shotPhone,shotRemember,shotTravel,shotSorry,shotGive,shotIgnite,shotQuiet,shotFinal});

function bubble(c,x,y,w,h,tx,ty,lines,size,k,fill='#15131c'){if(k<=0)return;c.save();c.translate(x+w/2,y+h/2);c.scale(k,k);c.translate(-(x+w/2),-(y+h/2));c.fillStyle='#fbf7ee';c.strokeStyle='#0c0c12';c.lineWidth=10;c.lineJoin='round';c.beginPath();c.roundRect(x,y,w,h,60);c.moveTo(tx-50,y+h-4);c.lineTo(tx,ty);c.lineTo(tx+50,y+h-4);c.stroke();c.fill();c.beginPath();c.moveTo(tx-50,y+h-6);c.lineTo(tx,ty);c.lineTo(tx+50,y+h-6);c.fill();
 c.font=`900 ${size}px M`;let mw=0;for(const l of lines)mw=Math.max(mw,c.measureText(l).width);if(mw>w-90)size=Math.floor(size*(w-90)/mw);const lh=size*1.14;if(lh*lines.length>h-50)size=Math.floor((h-50)/lines.length/1.14);
 c.fillStyle=fill;c.font=`900 ${size}px M`;c.textAlign='center';c.textBaseline='middle';const l2=size*1.14;lines.forEach((l,i)=>c.fillText(l,x+w/2,y+h/2+(i-(lines.length-1)/2)*l2));c.restore()}

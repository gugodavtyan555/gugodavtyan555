// «Маяк», часть 4 — сцены. Подключается после shots5.js
const KID={col:'#b98ac9'};
function paperMini(c,x,y,rot,s){c.save();c.translate(x,y);c.rotate(rot);c.scale(s,s);c.fillStyle='rgba(0,0,0,0.3)';c.fillRect(-140,-178,300,380);c.fillStyle='#fbf6e6';c.fillRect(-150,-190,300,380);c.fillStyle='#2b3a66';c.font='900 34px M';c.textAlign='left';c.save();c.transform(1,0,-0.2,1,0,0);c.fillText('Папа,',-120,-90);c.fillText('ты ещё',-120,-20);c.fillText('зажигаешь',-120,40);c.fillText('маяк?',-120,110);c.restore();c.restore()}
// ---------- читает строчку ----------
function shotRead(c,t,d,T,m){const tr=m[1]!=null&&t>m[1]?4.5:1.5;c.save();cam(c,540,930,1.0+0.08*ease(t/d),0,0);
 sky(c,['#0a0f1c','#182236','#2a3850','#3c4a62'],H);fog(c,T,500,7,0.16,51);glow(c,-80,1010,820,'rgba(255,190,110,A)',0.36);
 const mm=stick(c,{...OLD,x:660,y:2600,s:3.4,face:-1,t:T,noLegs:true,shadow:false,scarf:SCARF,rim:'rgba(255,205,140,0.6)',rimDir:-1,eyes:{dy:12,dx:-6+Math.sin(T*3)*7,wide:1.1,sad:true},pose:{lean:0.06,headTilt:0.16,armL:[1.0,1.75],armR:[0.2,0.5],bob:Math.sin(T*27)*tr}});
 const p=mm.hf;paperMini(c,p.x-50,p.y-130,-0.1+Math.sin(T*27)*0.012*tr,1.25);c.fillStyle='#7389ad';c.beginPath();c.arc(p.x,p.y,50,0,7);c.fill();
 tears(c,mm,-1,T,2);fog(c,T+20,1550,4,0.14,57);c.restore()}
// ---------- карта: 4 дня пути ----------
function shotMap(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1;c.save();cam(c,540,900,1.0+0.06*ease(t/d),0,0);
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0c1626');g.addColorStop(1,'#14253d');c.fillStyle=g;c.fillRect(-100,-100,W+200,H+200);
 c.strokeStyle='rgba(120,160,220,0.08)';c.lineWidth=3;for(let x=-40;x<W+80;x+=120){c.beginPath();c.moveTo(x,-100);c.lineTo(x,H+100);c.stroke()}for(let y=0;y<H;y+=120){c.beginPath();c.moveTo(-100,y);c.lineTo(W+100,y);c.stroke()}
 c.fillStyle='#22364f';c.beginPath();c.moveTo(-100,1500);c.bezierCurveTo(200,1300,300,1500,520,1380);c.bezierCurveTo(700,1300,600,1100,420,1080);c.bezierCurveTo(200,1040,100,1200,-100,1150);c.fill();
 c.beginPath();c.moveTo(1200,200);c.bezierCurveTo(900,260,700,360,560,520);c.bezierCurveTo(480,640,620,820,820,800);c.bezierCurveTo(1000,790,1100,900,1200,860);c.fill();
 c.beginPath();c.ellipse(300,760,150,90,0.3,0,7);c.fill();
 const P=[[210,1210],[430,1000],[300,770],[560,690],[700,560],[850,500]];const pt=u=>{const n=P.length-1,f=clamp(u)*n,i=Math.min(n-1,Math.floor(f)),k=f-i;return[lerp(P[i][0],P[i+1][0],ease(k)),lerp(P[i][1],P[i+1][1],k)]};
 const k=ease(t/(d*0.75));c.strokeStyle='#ffd60a';c.lineWidth=10;c.lineCap='round';c.setLineDash([4,26]);c.beginPath();for(let i=0;i<=100*k;i++){const[x,y]=pt(i/100);i?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();c.setLineDash([]);
 lighthouse(c,210,1270,230,T);glow(c,210,1080,130,'rgba(255,240,180,A)',0.8);
 const pu=a2>0?Math.abs(Math.sin(T*6)):0;glow(c,860,470,200+pu*120,'rgba(255,90,90,A)',0.35+0.25*pu);
 c.fillStyle='#eef2f4';c.beginPath();c.roundRect(770,390,180,150,22);c.fill();c.fillStyle='#e0403a';c.fillRect(842,415,36,100);c.fillRect(810,447,100,36);
 const[hx,hy]=pt(k);c.fillStyle='#0c0c12';c.beginPath();c.arc(hx,hy,30,0,7);c.fill();c.fillStyle='#2a2f44';c.beginPath();c.arc(hx,hy-8,31,Math.PI,0);c.fill();c.strokeStyle='#ffd60a';c.lineWidth=5;c.beginPath();c.arc(hx,hy,38,0,7);c.stroke();
 c.restore();if(a1>0)bigText(c,'4 ДНЯ',300,420,150,'#ffd60a',0.7+0.3*back(a1/0.3),-0.04,24)}
// ---------- уехать или остаться ----------
function shotChoice(c,t,d,T,m){const hy=1210,a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1,a3=m[3]!=null?t-m[3]:-1;
 const off=a2>0.5&&a3<0;c.save();cam(c,620,960,1.0+0.07*ease(t/d),0,0);
 sky(c,['#0a1230','#22386a','#56608a','#c08a7a'],hy);stars(c,T,700,0.7);clouds(c,T,560,'rgba(200,170,190,0.18)',4);
 rocks(c,[[-60,1190],[40,1168],[150,1176],[260,1196],[330,1206],[400,1214]],'#1c2a4a','#132040');sea(c,hy,T,'#3a4a72','#060b18',null);
 rocks(c,[[-120,1560],[120,1500],[300,1420],[420,1330],[520,1250],[600,1215],[690,1196],[820,1192],[930,1210],[1010,1260],[1120,1290]],'#1b2640','#070a14','rgba(150,180,240,0.28)');
 const lamp=lighthouse(c,742,1200,700,T,off);if(!off)beam(c,lamp,T*1.5+0.6,1700);
 if(a2>0&&a2<0.5&&Math.sin(T*40)>0){c.fillStyle='rgba(0,0,10,0.25)';c.fillRect(-100,-100,W+200,H+200)}
 rocks(c,[[-80,1760],[60,1690],[220,1680],[420,1730],[600,1790],[800,1800],[1160,1790]],'#0a0e1c','#03040a');
 const mm=stick(c,{...OLD,beard:false,back:true,rim:'rgba(200,170,190,0.5)',rimDir:1,x:270,y:1730,s:1.8,face:1,t:T,scarf:SCARF,pose:{lean:0.03,headTilt:-0.1,armL:[0.25,0.4],armR:[-0.1,0.1],bob:Math.sin(T*1.6)*3}});
 paperMini(c,mm.hf.x+20,mm.hf.y+40,0.2,0.36);
 if(off){c.fillStyle='rgba(0,0,10,0.3)';c.fillRect(-100,-100,W+200,H+200)}
 if(a3>0)inset(c,330,560,190,back(a3/0.3),()=>{c.fillStyle='#2b3c46';c.fillRect(120,360,420,400);c.fillStyle='#dfe6ea';c.beginPath();c.roundRect(170,600,340,70,18);c.fill();c.fillStyle='#f3f6f8';c.beginPath();c.roundRect(180,560,130,60,26);c.fill();c.fillStyle='#0c0c12';c.beginPath();c.arc(262,548,52,0,7);c.fill();c.fillStyle='#eef2f4';c.fillRect(214,506,96,26);c.fillStyle='#8fb2c8';c.beginPath();c.roundRect(310,590,200,80,18);c.fill();c.fillStyle='#ffd60a';c.font='900 120px M';c.textAlign='center';c.fillText('?',420,520)});
 c.restore();if(a1>0&&a2<0.3){c.save();c.globalAlpha=clamp(a1/0.3)*(a2>0?1-a2/0.3:1);bigText(c,'10 950',W/2,280,190,'#ffd60a',1,0,26);bigText(c,'НОЧЕЙ',W/2,430,80,'#fff',1,0,16);c.restore()}}
// ---------- деревня днём ----------
function dayHouse(c,x,gy,w,h,col,roof,seed){c.fillStyle=col;c.fillRect(x,gy-h,w,h);c.fillStyle=roof;c.beginPath();c.moveTo(x-18,gy-h);c.lineTo(x+w/2,gy-h-w*0.42);c.lineTo(x+w+18,gy-h);c.closePath();c.fill();const r=rng(seed);for(let yy=gy-h+40;yy<gy-90;yy+=120)for(let xx=x+34;xx<x+w-70;xx+=110){if(r()<0.72){c.fillStyle='#4a6a84';c.fillRect(xx,yy,52,68);c.strokeStyle='#efe6d6';c.lineWidth=6;c.strokeRect(xx,yy,52,68);c.beginPath();c.moveTo(xx+26,yy);c.lineTo(xx+26,yy+68);c.stroke()}}}
function dayScene(c,t,T,o){const gy=1330;sky(c,['#5f95c0','#a4c8de','#e9dcc4','#f6e2bc'],gy);clouds(c,T,300,'rgba(255,255,255,0.55)',15,5);glow(c,860,300,520,'rgba(255,240,200,A)',0.5);
 lighthouse(c,930,gy-320,430,T,true);
 dayHouse(c,-60,gy,330,470,'#c9b79c','#8a4b3c',2);dayHouse(c,300,gy,280,380,'#b9a78f','#7a4336',5);dayHouse(c,610,gy,250,440,'#c9b79c','#8a4b3c',8);dayHouse(c,880,gy,300,340,'#bfae96','#7a4336',11);
 const g=c.createLinearGradient(0,gy,0,H);g.addColorStop(0,'#a89a86');g.addColorStop(1,'#4e463c');c.fillStyle=g;c.fillRect(-200,gy,W+400,H-gy);c.strokeStyle='rgba(0,0,0,0.08)';c.lineWidth=3;for(let i=0;i<9;i++){const y=gy+18+i*i*7;c.beginPath();for(let x=-200+((i%2)*40);x<W+200;x+=90+i*8){c.moveTo(x,y);c.lineTo(x+52+i*5,y)}c.stroke()}
 const V=[[150,'#e07a5f',1.18],[310,'#7fb69a',1.26],[460,'#e9c46a',1.14],[590,'#b98ac9',0.8]];const R=[];
 V.forEach(([x,col,s],i)=>{const st=(o.v&&o.v[i])||{};R.push(stick(c,{x,y:gy+26+i*10,s,face:st.face||1,col,t:T,eyes:st.eyes||{},pose:{lean:0,headTilt:st.tilt||0,armL:st.armL||[0.12,0.25],armR:[-0.12,0.1],bob:Math.sin(T*1.6+i)*2}}))});
 const M=o.m,mm=stick(c,{...OLD,hat:M.cap?null:OLD.hat,x:M.x,y:gy+40,s:1.3,face:-1,t:T,scarf:SCARF,eyes:M.eyes||{},pose:M.pose});
 if(M.cap){const p=mm.hf;c.fillStyle='#2a2f44';c.beginPath();c.moveTo(p.x-50,p.y+30);c.quadraticCurveTo(p.x,p.y-50,p.x+50,p.y+30);c.fill();c.fillRect(p.x-80,p.y+22,60,10)}
 return{R,mm}}
function shotVillageDay(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1,a3=m[3]!=null?t-m[3]:-1,k=clamp(t/1.7),mv=k<1;
 c.save();cam(c,560,1020,1.04+0.06*ease(t/d),0,0);
 const r=dayScene(c,t,T,{m:{x:lerp(1220,820,easeOut(k)),cap:a1>0.3,eyes:{sad:true,dy:a1>0.3?8:0},pose:mv?{...walk(T*7,0.42),lean:0.16,armL:[0.4,0.8]}:{lean:a1>0.3?0.16:0.06,headTilt:a1>0.3?0.14:0,armL:a1>0.3?[0.9,1.4]:[0.3,0.5],armR:[0.1,0.3]}}});
 if(a2>0)bubble(c,250,330,760,a3>0?330:220,r.mm.head.x-30,r.mm.head.y-r.mm.HR-26,a3>0?['ЗАЖГИТЕ МАЯК.','ПОКА МЕНЯ НЕТ']:['ЗАЖГИТЕ МАЯК.'],92,a3>0?1:back(a2/0.28));
 c.restore()}
function shotSilence(c,t,d,T,m){const a1=m[1]!=null&&t>m[1],a2=m[2]!=null&&t>m[2],a3=m[3]!=null?t-m[3]:-1;c.save();cam(c,lerp(560,430,ease(t/d)),1020,1.12+0.1*ease(t/d),0,0);
 dayScene(c,t,T,{v:[a1?{face:-1}:{},a2?{tilt:0.42,eyes:{dy:14,sad:true}}:{},a2?{tilt:0.38,eyes:{dy:14,sad:true}}:{},{eyes:{wide:1.2}}],m:{x:820,cap:true,eyes:{sad:true,dy:8},pose:{lean:0.16,headTilt:0.14,armL:[0.9,1.4],armR:[0.1,0.3]}}});
 if(a3>0){c.save();c.globalAlpha=clamp(a3/0.3)*0.5;c.font='900 96px M';c.textAlign='center';c.fillStyle='#3a2d2d';c.fillText('ХА! ХА! ХА!',400,640);c.strokeStyle='#b3362e';c.lineWidth=14;c.lineCap='round';const w=clamp((a3-0.4)/0.4)*520;c.beginPath();c.moveTo(80,610);c.lineTo(80+w,600);c.stroke();c.restore()}
 c.restore()}
// ---------- дверь и ключ ----------
function doorScene(c,T,key,open){const g=c.createLinearGradient(0,0,W,0);g.addColorStop(0,'#e4dfd2');g.addColorStop(1,'#8f8a92');c.fillStyle=g;c.fillRect(-100,-100,W+200,H+200);
 const g2=c.createLinearGradient(0,0,W,0);g2.addColorStop(0,'#c9564a');g2.addColorStop(1,'#5a2428');c.fillStyle=g2;c.fillRect(-100,-100,W+200,440);c.fillRect(-100,1620,W+200,400);
 c.fillStyle='#1b1722';c.beginPath();c.moveTo(250,1560);c.lineTo(250,800);c.quadraticCurveTo(250,470,540,470);c.quadraticCurveTo(830,470,830,800);c.lineTo(830,1560);c.fill();
 if(open>0){c.fillStyle='#ffc978';c.beginPath();c.moveTo(280,1560);c.lineTo(280,800);c.quadraticCurveTo(280,500,540,500);c.quadraticCurveTo(800,500,800,800);c.lineTo(800,1560);c.fill();glow(c,540,1050,900*open,'rgba(255,190,110,A)',0.5*open)}
 const dw=520*(1-open*0.72);c.save();c.beginPath();c.moveTo(280,1560);c.lineTo(280,800);c.quadraticCurveTo(280,500,540,500);c.quadraticCurveTo(800,500,800,800);c.lineTo(800,1560);c.clip();
 const dg=c.createLinearGradient(280,0,280+dw,0);dg.addColorStop(0,'#7a5236');dg.addColorStop(1,'#4a3020');c.fillStyle=dg;c.fillRect(280,480,dw,1100);c.strokeStyle='rgba(0,0,0,0.3)';c.lineWidth=6;for(let i=1;i<5;i++){c.beginPath();c.moveTo(280+i*dw/5,480);c.lineTo(280+i*dw/5,1580);c.stroke()}
 c.fillStyle='#1a1418';c.fillRect(280,760,dw,26);c.fillRect(280,1320,dw,26);c.restore();
 const kx=280+dw-80,ky=1060;c.fillStyle='#22191c';c.beginPath();c.roundRect(kx-34,ky-70,68,150,14);c.fill();
 if(key){const sw=Math.sin(T*3)*0.12;c.save();c.translate(kx,ky);c.fillStyle='#d9a441';c.fillRect(-6,-6,70,12);c.save();c.translate(64,0);c.rotate(sw);c.strokeStyle='#d9a441';c.lineWidth=12;c.beginPath();c.arc(34,0,26,0,7);c.stroke();c.restore();c.restore();
  const a=clamp(Math.sin(T*2.5));if(a>0.6){const q=20*(a-0.6)/0.4;c.fillStyle='#fff';c.beginPath();c.moveTo(kx+70,ky-40-q*2);c.lineTo(kx+70+q*0.4,ky-40-q*0.4);c.lineTo(kx+70+q*2,ky-40);c.lineTo(kx+70+q*0.4,ky-40+q*0.4);c.lineTo(kx+70,ky-40+q*2);c.lineTo(kx+70-q*0.4,ky-40+q*0.4);c.lineTo(kx+70-q*2,ky-40);c.lineTo(kx+70-q*0.4,ky-40-q*0.4);c.fill()}}
 return{kx,ky}}
function shotKey(c,t,d,T){c.save();cam(c,600,1050,1.0+0.12*ease(t/d),0,0);const k=doorScene(c,T,t>0.7,0);
 const hx=t<0.7?lerp(1150,k.kx+70,easeOut(t/0.7)):lerp(k.kx+70,1300,ease((t-1.0)/0.9)),hy=lerp(1300,k.ky,clamp(t/0.7));
 c.strokeStyle='#7389ad';c.lineWidth=110;c.lineCap='round';c.beginPath();c.moveTo(hx+500,hy+420);c.lineTo(hx+40,hy+10);c.stroke();c.fillStyle='#7389ad';c.beginPath();c.arc(hx+40,hy+10,62,0,7);c.fill();
 if(t<0.7){c.fillStyle='#d9a441';c.fillRect(hx-70,hy-6,70,12)}
 c.restore();c.fillStyle='rgba(10,14,30,0.25)';c.fillRect(0,0,W,H)}
function shotBoy(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,got=a1>0.45,op=got?ease((a1-0.6)/0.8):0;c.save();cam(c,560,1100,1.0+0.1*ease(t/d),0,0);
 const k=doorScene(c,T,!got,op);c.fillStyle='rgba(8,10,26,0.5)';c.fillRect(-100,-100,W+200,H+200);if(op>0)glow(c,540,1050,900*op,'rgba(255,190,110,A)',0.4*op);
 const run=clamp(t/1.2),x=lerp(-200,k.kx-150,easeOut(run)),rc=a1>0?ease(a1/0.4):0;
 const mm=stick(c,{...KID,x,y:1720,s:1.5,face:1,t:T,rim:'rgba(255,200,140,0.5)',rimDir:1,eyes:{wide:1.25},pose:run<1?{...walk(T*12,0.65),lean:0.26}:{lean:0.05,headTilt:-0.2,armL:[lerp(0.2,2.3,rc),lerp(0.4,2.6,rc)],armR:[-0.1,0.2]}});
 if(got){c.fillStyle='#d9a441';c.fillRect(mm.hf.x-10,mm.hf.y-50,12,60);c.strokeStyle='#d9a441';c.lineWidth=10;c.beginPath();c.arc(mm.hf.x-4,mm.hf.y-68,20,0,7);c.stroke()}
 c.restore()}
// ---------- автобус, поезд, паром ----------
function shotTrip(c,t,d,T,m){const ph=m[2]!=null&&t>m[2]?2:m[1]!=null&&t>m[1]?1:0,bob=Math.sin(T*22)*3;c.save();cam(c,540,1000,1.04,0,0);
 const hill=(yb,amp,wl,sp,col)=>{c.fillStyle=col;c.beginPath();c.moveTo(-100,H);for(let x=-100;x<=W+100;x+=30)c.lineTo(x,yb+Math.sin((x+T*sp)/wl)*amp+Math.sin((x+T*sp)/(wl*0.37))*amp*0.4);c.lineTo(W+100,H);c.fill()};
 const face=(x,y,s)=>{c.fillStyle='#0c0c12';c.beginPath();c.arc(x,y,44*s,0,7);c.fill();c.fillStyle='#2a2f44';c.beginPath();c.arc(x,y-10*s,46*s,Math.PI,0);c.fill();c.fillRect(x+10*s,y-16*s,54*s,10*s);c.fillStyle='#f6f6f6';c.beginPath();c.arc(x+10*s,y+2*s,7*s,0,7);c.arc(x+28*s,y+2*s,7*s,0,7);c.fill();c.fillStyle='#d9dde6';c.beginPath();c.moveTo(x,y+40*s);c.quadraticCurveTo(x+30*s,y+70*s,x+40*s,y+14*s);c.quadraticCurveTo(x+20*s,y+34*s,x,y+40*s);c.fill()};
 if(ph==0){sky(c,['#2b3a5c','#6a6a8a','#e0a070','#f2c48a'],1300);glow(c,240,1000,600,'rgba(255,190,120,A)',0.5);hill(1040,70,300,180,'#3d5560');hill(1150,50,210,420,'#2a3d46');
  c.fillStyle='#24252d';c.fillRect(-100,1340,W+200,H);c.fillStyle='#e9e1c6';for(let i=0;i<6;i++){const x=W+200-((T*1100+i*300)%1800);c.fillRect(x,1470,150,14)}
  const by=980+bob;c.fillStyle='#d9a441';c.beginPath();c.roundRect(170,by,740,340,[60,90,20,20]);c.fill();c.fillStyle='#b5842f';c.fillRect(170,by+230,740,24);
  for(let j=0;j<4;j++){c.fillStyle='#fff1c9';c.beginPath();c.roundRect(210+j*165,by+50,135,130,16);c.fill()}face(440,by+140,1);
  c.fillStyle='#fff7d0';c.beginPath();c.ellipse(900,by+270,16,26,0,0,7);c.fill();glow(c,930,by+270,260,'rgba(255,240,190,A)',0.5);
  for(const wx of [320,760]){c.fillStyle='#0c0d12';c.beginPath();c.arc(wx,by+350,56,0,7);c.fill();c.strokeStyle='#666';c.lineWidth=8;c.beginPath();c.moveTo(wx,by+350);c.lineTo(wx+Math.cos(T*20)*44,by+350+Math.sin(T*20)*44);c.stroke()}}
 else if(ph==1){sky(c,['#070a1c','#16244a','#2f4877'],1300);stars(c,T,900);moon(c,820,380,56);hill(1010,70,300,220,'#16223c');hill(1110,50,210,480,'#0e1830');
  c.fillStyle='#10131c';for(let i=0;i<4;i++){const px=W+200-((T*1300+i*420)%1700);c.fillRect(px,820,14,420)}
  const ty=1060+bob;c.fillStyle='#22262f';c.fillRect(-100,ty+300,W+200,26);c.fillStyle='#0c1016';c.fillRect(-100,ty+326,W+200,H);
  for(let i=-1;i<2;i++){const cx=540+i*880;const g=c.createLinearGradient(0,ty,0,ty+270);g.addColorStop(0,'#35584f');g.addColorStop(1,'#1c302c');c.fillStyle=g;c.beginPath();c.roundRect(cx-420,ty,840,270,30);c.fill();c.fillStyle='#e9e1c6';c.fillRect(cx-420,ty+190,840,14);
   for(let j=0;j<4;j++){const wx=cx-340+j*190;c.fillStyle='#ffd58a';c.beginPath();c.roundRect(wx,ty+40,130,120,14);c.fill()}
   for(const wx of [cx-300,cx-180,cx+180,cx+300]){c.fillStyle='#0c0d12';c.beginPath();c.arc(wx,ty+290,38,0,7);c.fill()}}
  face(450,ty+112,0.9)}
 else{warmSea(c,T,1000,300);const fy=1010+Math.sin(T*1.4)*8;
  c.save();c.filter='blur(20px)';for(let i=0;i<6;i++){const k=((T*0.14+i/6)%1);c.fillStyle=`rgba(60,50,70,${0.5*(1-k)})`;c.beginPath();c.arc(640-k*420,fy-470-k*130,36+k*100,0,7);c.fill()}c.restore();
  c.fillStyle='#d8d2c6';c.fillRect(380,fy-250,420,150);c.fillStyle='#efe9dc';c.fillRect(430,fy-340,280,92);c.fillStyle='#a8433c';c.fillRect(600,fy-470,76,132);c.fillStyle='#2b3a66';for(let i=0;i<6;i++)c.fillRect(404+i*64,fy-212,36,34);
  stick(c,{...OLD,x:250,y:fy-104,s:0.5,face:-1,shadow:false,scarf:SCARF,t:T,rim:'rgba(255,200,140,0.7)'});
  c.fillStyle='#efe9dc';c.beginPath();c.moveTo(120,fy-100);c.lineTo(960,fy-100);c.lineTo(900,fy+110);c.lineTo(230,fy+110);c.quadraticCurveTo(150,fy+20,120,fy-100);c.fill();c.fillStyle='#2b4a7a';c.fillRect(172,fy+30,756,30);
  c.strokeStyle='#8a8478';c.lineWidth=5;c.beginPath();c.moveTo(130,fy-150);c.lineTo(380,fy-150);for(let x=140;x<380;x+=40){c.moveTo(x,fy-150);c.lineTo(x,fy-100)}c.stroke();
  waveLayer(c,fy+120,14,240,1.6,T,'#8a4a5c','#2a1a3a','rgba(255,225,200,0.5)')}
 c.restore();bigText(c,'ДЕНЬ '+(ph+1),W/2,300,150,'#ffd60a',1+0.03*Math.sin(T*14),0,24)}
// ---------- не спит ----------
function shotAwake(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,fy=1420;c.save();cam(c,540,1000,1.04+0.08*ease(t/d),0,Math.sin(T*1.2)*6);
 sky(c,['#04060f','#0a1230','#182a55','#2f4877'],1100);stars(c,T,1000);moon(c,lerp(200,420,t/d),360,54);sea(c,1100,T,'#1c3359','#04070f',lerp(200,420,t/d),fy);
 c.fillStyle='#10141f';c.fillRect(-100,fy,W+200,H);c.fillStyle='#0a0d16';c.fillRect(-100,1090,W+200,16);for(let x=-40;x<W+80;x+=110)c.fillRect(x,1090,12,330);
 c.fillStyle='#3a2a22';c.fillRect(150,1230,780,30);c.fillRect(150,1050,780,24);c.fillRect(180,1050,22,370);c.fillRect(880,1050,22,370);
 [[250,'#6b6480',0],[820,'#80646e',1.4]].forEach(([x,col,p])=>{const s2=stick(c,{x,y:fy,s:1.15,face:1,col,t:T,shadow:false,eyes:{blink:1},pose:{crouch:0.38,lean:0.36,headTilt:0.5,legL:[1.36,0.0],legR:[1.28,-0.06],armL:[0.5,1.2],armR:[0.4,1.0],bob:Math.sin(T*1.4+p)*3}});c.save();c.font='900 44px M';c.fillStyle='#cfd8ff';const k=((T*0.4+p)%1);c.globalAlpha=Math.sin(k*Math.PI)*0.8;c.fillText('Z',s2.head.x+50+k*60,s2.head.y-90-k*120);c.restore()});
 const mm=stick(c,{...OLD,x:530,y:fy,s:1.3,face:1,t:T,shadow:false,scarf:SCARF,rim:'rgba(170,195,255,0.5)',eyes:{wide:1.35,dy:-4},pose:{crouch:0.38,lean:0.06,legL:[1.36,0.0],legR:[1.28,-0.06],armL:[0.9,2.5],armR:[0.7,2.3],bob:Math.sin(T*1.6)*2}});
 paperMini(c,mm.hf.x-6,mm.hf.y+10,0.1,0.34);
 if(a1>0){c.fillStyle='rgba(225,230,250,0.9)';[[mm.head.x+70,mm.head.y-120,16],[mm.head.x+120,mm.head.y-180,26]].forEach(([x,y,r])=>{c.beginPath();c.arc(x,y,r,0,7);c.fill()});const k=back((a1-0.2)/0.35);if(a1>0.2){c.save();c.translate(760,640);c.scale(k,k);c.fillStyle='rgba(225,230,250,0.92)';c.beginPath();c.ellipse(0,0,230,200,0,0,7);c.fill();c.beginPath();c.ellipse(0,0,206,176,0,0,7);c.clip();c.fillStyle='#070912';c.fillRect(-240,-220,480,440);lighthouse(c,0,150,330,T,true);c.restore()}}
 c.restore();bigText(c,'ДЕНЬ 4',W/2,280,130,'#ffd60a',1,0,22)}
// ---------- маяк погас ----------
function nightCliff(c,T,off,k=1){const hy=1210;sky(c,['#070a1c','#101a3c','#243a66','#3f5a86'],hy);stars(c,T,hy);clouds(c,T,560,'rgba(120,150,210,0.16)',4);moon(c,235,470,74);
 rocks(c,[[-60,1190],[40,1168],[150,1176],[260,1196],[330,1206],[400,1214]],'#1c2a4a','#132040');sea(c,hy,T,'#27446d','#060b18',235);
 rocks(c,[[-120,1560],[120,1500],[300,1420],[420,1330],[520,1250],[600,1215],[690,1196],[820,1192],[930,1210],[1010,1260],[1120,1290]],'#1b2640','#070a14','rgba(150,180,240,0.28)');
 const lamp=lighthouse(c,742,1200,700,T,off);if(!off)beam(c,lamp,T*1.5+0.6,1700,k);return lamp}
const cliffY=x=>x<420?lerp(1420,1330,(x-300)/120):x<520?lerp(1330,1250,(x-420)/100):x<600?lerp(1250,1215,(x-520)/80):x<690?lerp(1215,1196,(x-600)/90):1194;
function cliffFront(c,T){grass(c,430,1080,cliffY,T,5,'#0a1020');rocks(c,[[-80,1700],[40,1600],[150,1570],[260,1620],[380,1700],[520,1740],[700,1715],[860,1760],[1000,1700],[1160,1730]],'#0a0e1c','#03040a')}
function shotOff(c,t,d,T){const off=t>0.7||(t>0.4&&Math.sin(T*45)>0);c.save();cam(c,700,900,1.0+0.09*ease(t/d),0,0);nightCliff(c,T,off);cliffFront(c,T);c.restore();if(off){c.fillStyle='rgba(0,0,12,0.3)';c.fillRect(0,0,W,H)}}
function shotNoLight(c,t,d,T,m){const gy=1330;c.save();cam(c,540,1000,1.04+0.05*(t/d),lerp(-16,16,t/d),0);
 sky(c,['#070716','#12112a','#241d3e','#3a2c48'],gy);stars(c,T,700,0.9);
 c.fillStyle='#0d0b1c';c.beginPath();c.moveTo(880,gy-380);c.lineTo(896,gy-700);c.lineTo(944,gy-700);c.lineTo(960,gy-380);c.fill();c.fillRect(888,gy-740,64,44);
 house(c,-60,gy,330,470,'#1a1630','#120f22','#ffcf80',T,2);house(c,300,gy,280,380,'#211b3a','#17132a','#ffd590',T,5);house(c,610,gy,250,440,'#1a1630','#120f22','#ffcf80',T,8);house(c,880,gy,300,340,'#231d3d','#17132a','#ffd590',T,11);
 street(c,gy);c.strokeStyle='#0d0b18';c.lineWidth=14;c.lineCap='round';c.beginPath();c.moveTo(150,gy);c.lineTo(150,gy-560);c.quadraticCurveTo(150,gy-620,215,gy-620);c.stroke();glow(c,225,gy-604,120,'rgba(255,205,120,A)',0.8);c.fillStyle='#ffe6a8';c.beginPath();c.arc(225,gy-604,17,0,7);c.fill();
 [[200,'#e07a5f',1.18],[380,'#7fb69a',1.26],[550,'#e9c46a',1.14],[700,'#b98ac9',0.8]].forEach(([x,col,s],i)=>{stick(c,{x,y:gy+26+i*10,s,face:1,col,rim:'rgba(255,200,120,0.4)',rimDir:-1,t:T,eyes:{dy:-8,sad:i<3,wide:1.1},pose:{lean:-0.04,headTilt:-0.3,armL:[0.12,0.25],armR:[-0.12,0.1],bob:Math.sin(T*1.6+i)*2}})});
 c.restore();c.fillStyle='rgba(0,0,12,0.22)';c.fillRect(0,0,W,H)}
// ---------- деревня идёт к маяку ----------
function shotCrowd(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-99,a2=m[2]!=null?t-m[2]:-99;c.save();cam(c,640,1000,1.08+0.08*ease(t/d),0,0);
 nightCliff(c,T,true);glow(c,742,1165,150,'rgba(255,190,110,A)',0.7);c.fillStyle='#ffc978';c.beginPath();c.roundRect(726,1134,32,66,[16,16,0,0]);c.fill();
 const W2=[[0,'#b98ac9',0.3],[0.25,'#e07a5f',0.42],[a1>-50?m[1]:99,'#c98aa0',0.4],[a1>-50?m[1]+0.25:99,'#e9c46a',0.26]];if(a2>-50)for(let i=0;i<7;i++)W2.push([m[2]+i*0.22,['#7fb69a','#e9c46a','#8a93a8','#e07a5f','#9a86b8','#7fb69a','#c98aa0'][i],0.38+((i*7)%3)*0.03]);
 W2.forEach(([ta,col,s],i)=>{const k=t-ta;if(k<0)return;const x=lerp(330,700,clamp(k/4.2+ (i==0?0.5:0))),y=cliffY(x)+4;const mm=stick(c,{x,y,s,face:1,col,t:T,pose:{...walk(T*7+i*1.3,0.45),lean:0.16,armL:[0.75,1.35]}});if(s>0.28)lantern(c,mm.hf,s,T)});
 cliffFront(c,T);c.restore()}
function shotStairsMany(c,t,d,T,m){const u=0.6+t*0.5,cols=['#b98ac9','#e07a5f','#c98aa0','#7fb69a','#e9c46a'],ss2=[0.5,0.8,0.76,0.82,0.78];
 stairsScene(c,t,d,T,cols.map((col,i)=>({u:u-i*0.2,draw:p=>{const mm=stick(c,{x:p.x,y:p.y,s:ss2[i],face:p.ev?1:-1,col,t:T,shadow:false,rim:'rgba(255,200,120,0.5)',pose:{...walk(T*8+i*1.1,0.55),lean:0.22,armL:[0.8,1.5]}});if(i%2==1||i==0)lantern(c,mm.hf,ss2[i],T,1.1)}})).reverse(),u-0.35);
 const num=Math.min(140,Math.floor(lerp(118,141,ease(t/(d-0.3)))));bigText(c,String(num),W/2,290,230,'#ffd60a',1+0.05*Math.sin(T*16),0,26);bigText(c,'СЧИТАЮТ ВСЛУХ',W/2,455,66,'#fff',1,0,14)}
function shotLampCrowd(c,t,d,T){const fy=1330,lx=600,ly=760;c.save();cam(c,540,900,1.0+0.07*ease(t/d),0,0);
 sky(c,['#060a1c','#101c40','#22386a','#3a5686'],H);stars(c,T,1100);moon(c,880,330,48);
 c.fillStyle='#0b0a14';for(let x=-20;x<W+40;x+=212)c.fillRect(x,0,22,1120);c.fillRect(0,0,W,150);c.beginPath();c.moveTo(0,150);c.quadraticCurveTo(540,260,W,150);c.lineTo(W,0);c.lineTo(0,0);c.fill();
 const wg=c.createLinearGradient(0,1100,0,H);wg.addColorStop(0,'#191628');wg.addColorStop(1,'#07060d');c.fillStyle=wg;c.fillRect(0,1100,W,H-1100);c.fillStyle='#262238';c.fillRect(0,1100,W,16);c.fillStyle='#0d0c15';c.fillRect(0,fy,W,H-fy);
 const pg=c.createLinearGradient(lx-80,0,lx+80,0);pg.addColorStop(0,'#3b3a4c');pg.addColorStop(1,'#14131d');c.fillStyle=pg;c.fillRect(lx-70,1000,140,330);c.fillRect(lx-120,990,240,30);
 glow(c,lx,ly,1200,'rgba(255,190,90,A)',0.55);c.save();c.globalCompositeOperation='lighter';c.filter='blur(10px)';for(const dr of [1,-1]){const bg=c.createLinearGradient(lx,0,lx+dr*900,0);bg.addColorStop(0,'rgba(255,236,170,0.55)');bg.addColorStop(1,'rgba(255,236,170,0)');c.fillStyle=bg;c.beginPath();c.moveTo(lx,ly-40);c.lineTo(lx+dr*900,ly-260);c.lineTo(lx+dr*900,ly+200);c.lineTo(lx,ly+40);c.fill()}c.restore();
 const lg=c.createRadialGradient(lx,ly,10,lx,ly,260);lg.addColorStop(0,'rgba(255,250,220,1)');lg.addColorStop(1,'rgba(255,200,110,0.65)');c.fillStyle=lg;c.beginPath();c.roundRect(lx-170,ly-235,340,470,150);c.fill();c.strokeStyle='rgba(255,245,210,0.75)';for(let i=0;i<6;i++){c.lineWidth=5;c.beginPath();c.roundRect(lx-170+i*24,ly-235+i*30,340-i*48,470-i*60,150-i*20);c.stroke()}
 glow(c,lx,ly,130,'rgba(255,255,240,A)',1);
 [[150,'#e07a5f',1.2,1],[330,'#b98ac9',0.8,1],[860,'#7fb69a',1.25,-1],[1000,'#c98aa0',1.15,-1]].forEach(([x,col,s,f],i)=>{stick(c,{x,y:fy+10,s,face:f,col,t:T,rim:'rgba(255,210,140,0.9)',rimDir:f,eyes:{wide:1.25},pose:i==1?{armL:[2.6+Math.sin(T*9)*0.2,3.0],armR:[2.4-Math.sin(T*9)*0.2,2.9],bob:Math.abs(Math.sin(T*9))*-12}:{lean:-0.04,headTilt:-0.12,armL:[0.2,0.4],armR:[-0.1,0.2],bob:Math.sin(T*1.6+i)*2}})});
 c.fillStyle='rgba(255,200,120,0.12)';c.fillRect(-100,-100,W+200,H+200);c.restore()}
// ---------- больница ----------
function shotCorridor(c,t,d,T){const fy=1500,sc=T*900;c.save();cam(c,540,1000,1.04,Math.sin(T*14)*4,Math.abs(Math.sin(T*14))*-8);
 const wg=c.createLinearGradient(0,300,0,fy);wg.addColorStop(0,'#c9d6dc');wg.addColorStop(1,'#9fb2ba');c.fillStyle=wg;c.fillRect(-100,-100,W+200,fy+100);c.fillStyle='#7f949c';c.fillRect(-100,1120,W+200,30);c.fillStyle='#b9c8ce';c.fillRect(-100,-100,W+200,420);
 for(let i=0;i<5;i++){const x=W+300-((sc+i*520)%2600);c.fillStyle='#f7fbfd';c.beginPath();c.roundRect(x,250,260,40,20);c.fill();glow(c,x+130,290,300,'rgba(255,255,255,A)',0.35)}
 for(let i=0;i<4;i++){const x=W+400-((sc+i*650)%2600);c.fillStyle='#e9eef0';c.fillRect(x,560,300,940);c.strokeStyle='#8fa2aa';c.lineWidth=10;c.strokeRect(x,560,300,940);c.fillStyle='#2b3c46';c.beginPath();c.roundRect(x+105,640,90,70,12);c.fill();c.fillStyle='#fff';c.font='900 50px M';c.textAlign='center';c.fillText(String(3+((i+Math.floor(sc/2600)*4)%4)),x+150,694);c.fillStyle='#6f828a';c.fillRect(x+240,1040,36,14)}
 const fg=c.createLinearGradient(0,fy,0,H);fg.addColorStop(0,'#8ea0a8');fg.addColorStop(1,'#4c5a60');c.fillStyle=fg;c.fillRect(-100,fy,W+200,H-fy);c.fillStyle='rgba(255,255,255,0.12)';for(let i=0;i<5;i++){const x=W+300-((sc+i*520)%2600);c.beginPath();c.ellipse(x+130,fy+120,170,26,0,0,7);c.fill()}
 const mm=stick(c,{...OLD,x:470,y:fy+30,s:1.5,face:1,t:T+T*2,scarf:SCARF,eyes:{wide:1.35},pose:{...walk(T*14,0.75),lean:0.32,armL:[0.9,1.5]}});paperMini(c,mm.hf.x+10,mm.hf.y-10,0.3,0.34);
 c.strokeStyle='rgba(255,255,255,0.5)';c.lineWidth=6;c.lineCap='round';for(let i=0;i<5;i++){const y=980+i*90,x=260-((T*600+i*90)%260);c.beginPath();c.moveTo(x,y);c.lineTo(x-120,y);c.stroke()}
 c.restore()}
function shotDoor7(c,t,d,T){const k=ease(t/d),sh=Math.sin(T*26)*4;c.save();cam(c,560,1000,1.0+0.16*k,0,0);
 const wg=c.createLinearGradient(0,0,W,0);wg.addColorStop(0,'#c9d6dc');wg.addColorStop(1,'#93a6ae');c.fillStyle=wg;c.fillRect(-100,-100,W+200,H+200);
 c.fillStyle='#e9eef0';c.fillRect(220,330,640,1500);c.strokeStyle='#7f949c';c.lineWidth=16;c.strokeRect(220,330,640,1500);
 c.fillStyle='#2b3c46';c.beginPath();c.roundRect(410,520,260,220,26);c.fill();c.fillStyle='#fff';c.font='900 190px M';c.textAlign='center';c.textBaseline='middle';c.fillText('7',540,636);
 c.fillStyle='#6f828a';c.beginPath();c.roundRect(700,1100,120,34,17);c.fill();c.beginPath();c.arc(716,1117,30,0,7);c.fill();
 const b=Math.pow(Math.abs(Math.sin(T*8)),6);heart(c,330,1100,1.3+b*0.6,'rgba(255,77,77,0.85)');
 const hx=lerp(1250,800,easeOut(t/1.1))+sh,hy=lerp(1500,1150,easeOut(t/1.1));c.strokeStyle='#7389ad';c.lineWidth=120;c.lineCap='round';c.beginPath();c.moveTo(hx+460,hy+520);c.lineTo(hx,hy);c.stroke();c.fillStyle='#7389ad';c.beginPath();c.arc(hx,hy,68,0,7);c.fill();
 c.restore()}
function shotEmptyBed(c,t,d,T,m){const fy=1420,z=m[1]!=null?ease((t-m[1])/1.4):0;c.save();cam(c,lerp(540,420,z),lerp(980,1150,z),1.02+0.4*z,0,0);
 const wg=c.createLinearGradient(0,0,0,fy);wg.addColorStop(0,'#cfdadf');wg.addColorStop(1,'#aebdc4');c.fillStyle=wg;c.fillRect(-100,-100,W+200,fy+100);
 c.fillStyle='#f4efe2';c.fillRect(640,340,330,380);glow(c,800,530,620,'rgba(255,244,214,A)',0.5);c.strokeStyle='#7f949c';c.lineWidth=16;c.strokeRect(640,340,330,380);c.beginPath();c.moveTo(805,340);c.lineTo(805,720);c.stroke();
 c.save();c.globalCompositeOperation='lighter';const lg=c.createLinearGradient(800,700,400,1400);lg.addColorStop(0,'rgba(255,244,214,0.3)');lg.addColorStop(1,'rgba(255,244,214,0)');c.fillStyle=lg;c.beginPath();c.moveTo(640,720);c.lineTo(970,720);c.lineTo(760,1500);c.lineTo(160,1500);c.fill();c.restore();
 const fg=c.createLinearGradient(0,fy,0,H);fg.addColorStop(0,'#8ea0a8');fg.addColorStop(1,'#4c5a60');c.fillStyle=fg;c.fillRect(-100,fy,W+200,H-fy);
 c.fillStyle='#4c5a60';c.fillRect(196,900,14,520);c.fillStyle='#39464c';c.beginPath();c.roundRect(70,640,280,220,18);c.fill();c.fillStyle='#0a0f12';c.fillRect(88,658,244,150);
 c.fillStyle='#4c5a60';c.fillRect(470,560,10,860);c.fillRect(440,560,70,10);
 c.fillStyle='#4c5a60';c.fillRect(120,1330,880,26);c.fillRect(140,1356,22,70);c.fillRect(960,1356,22,70);c.fillRect(120,1130,26,226);
 c.fillStyle='#f3f6f8';c.beginPath();c.roundRect(146,1250,850,86,22);c.fill();c.fillStyle='#fff';c.beginPath();c.roundRect(170,1196,230,80,36);c.fill();c.fillStyle='#8fb2c8';c.beginPath();c.roundRect(760,1206,220,60,14);c.fill();c.fillStyle='#7da0b6';c.fillRect(760,1232,220,8);
 const r=rng(8);c.fillStyle='rgba(255,250,235,0.7)';for(let i=0;i<24;i++){const x=300+r()*560+Math.sin(T*0.6+i)*30,y=760+((r()*600+T*18)%600);c.beginPath();c.arc(x,y,2+r()*3,0,7);c.fill()}
 const mm=stick(c,{...OLD,beard:false,back:true,x:900,y:1960,s:2.1,face:-1,t:T,shadow:false,scarf:SCARF,pose:{lean:0,armL:[0.1,0.15],armR:[-0.1,0.1],bob:Math.sin(T*26)*1.5}});
 const k=clamp((t-0.5)/1.6);paperMini(c,mm.hf.x-40-k*120,mm.hf.y+40+k*k*260,0.2+k*2.4,0.42);
 c.restore();if(t<0.3){c.fillStyle=`rgba(255,255,255,${1-t/0.3})`;c.fillRect(0,0,W,H)}}

function hook(c,T){const a=1-ease((T-2.2)/0.25);if(a<=0)return;c.save();c.globalAlpha=a;bigText(c,'ЧАСТЬ 4',W/2,1500,170,'#ffd60a',0.7+0.3*back(T/0.3),-0.03,26);if(T>0.25)bigText(c,'ОН УСПЕЕТ?',W/2,1660,90,'#fff',0.7+0.3*back((T-0.25)/0.3),0,16);c.restore()}
function outro(c,T){const s=window.DATA.outro;if(T<s)return;bigText(c,'ГДЕ ЛЁША?',W/2,300,140,'#ffd60a',0.7+0.3*back((T-s)/0.3),-0.02,26);if(T>s+0.4)bigText(c,'ЧАСТЬ 5 — ФИНАЛ',W/2,450,78,'#fff',0.7+0.3*back((T-s-0.4)/0.3),0,16)}
Object.assign(FN,{shotRead,shotMap,shotChoice,shotVillageDay,shotSilence,shotKey,shotBoy,shotTrip,shotAwake,shotOff,shotNoLight,shotCrowd,shotStairsMany,shotLampCrowd,shotCorridor,shotDoor7,shotEmptyBed});

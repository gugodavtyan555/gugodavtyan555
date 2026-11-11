// «Маяк», часть 3 — сцены. Подключается после shots4.js
function shotRecap(c,t,d,T){shotFace(c,t+1.2,d+1.2,T);bubble(c,50,250,800,330,60,690,['МЕНЯ ПРИСЛАЛ','ВАШ СЫН'],100,back(t/0.28))}
function shotGasp(c,t,d,T,m){shotAsk(c,t,d,T,[m[0]]);const b=Math.pow(Math.abs(Math.sin(T*8)),6);heart(c,850,420,2.0+b*0.8,'#ff4d4d');glow(c,850,410,220+b*110,'rgba(255,60,60,A)',0.25)}
function miniShip(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#394456';c.fillRect(20,-150,150,90);c.fillStyle='#1c2330';c.fillRect(70,-220,40,74);c.fillStyle='#8f3a34';c.fillRect(70,-200,40,14);c.fillStyle='#ffd58a';for(let i=0;i<3;i++)c.fillRect(36+i*44,-126,24,22);
 c.fillStyle='#283244';c.beginPath();c.moveTo(-190,-60);c.lineTo(210,-60);c.lineTo(190,40);c.lineTo(-140,40);c.closePath();c.fill();c.fillStyle='#7a2f2c';c.fillRect(-146,22,338,18);c.fillStyle='rgba(220,225,235,0.7)';c.font='900 26px M';c.textAlign='left';c.fillText('NORDSTERN',-130,-14);c.restore()}
// ---------- Андрей рассказывает ----------
function shotIntro(c,t,d,T,m){const a2=m[2]!=null?t-m[2]:-1,a3=m[3]!=null?t-m[3]:-1;c.save();cam(c,545,1040,1.12+0.08*ease(t/d),0,0);
 const tk=Math.sin(T*7);
 const r=duo(c,t,T,{left:STR,scarf:'father',fEyes:{wide:1.3},fPose:{lean:0.1,headTilt:-0.03,armL:[0.3,0.6],armR:[0.1,0.3],bob:Math.sin(T*24)*1.2},sEyes:{},sPose:{lean:0.05,armL:[1.0+tk*0.25,1.9+tk*0.3],armR:[0.2,0.5]}});
 bigText(c,'АНДРЕЙ',r.s.head.x,r.s.head.y-170,66,'#ffd60a',0.7+0.3*back((t-0.3)/0.3),0,14);
 if(a2>0&&a3<0.6)inset(c,330,560,190,back(a2/0.3)*(a3>0?1-ease(a3/0.5):1),()=>{c.fillStyle='#3f5a86';c.fillRect(100,360,460,400);c.fillStyle='#1c3359';c.fillRect(100,610,460,160);stick(c,{...STR,x:290,y:548,s:0.3,face:1,shadow:false});stick(c,{...SON,x:350,y:548,s:0.3,face:-1,shadow:false});miniShip(c,330,610,0.85)});
 c.restore()}
// ---------- шарф связала мама ----------
function shotKnit(c,t,d,T){const fy=1400;c.save();cam(c,540,1000,1.04+0.07*ease(t/d),0,0);
 const wg=c.createLinearGradient(0,0,0,fy);wg.addColorStop(0,'#3a2622');wg.addColorStop(1,'#6a4636');c.fillStyle=wg;c.fillRect(-100,-100,W+200,fy+100);
 c.fillStyle='#ffd08a';c.fillRect(660,380,300,360);glow(c,810,560,520,'rgba(255,190,110,A)',0.4);c.strokeStyle='#2a1a16';c.lineWidth=18;c.strokeRect(660,380,300,360);c.beginPath();c.moveTo(810,380);c.lineTo(810,740);c.moveTo(660,560);c.lineTo(960,560);c.stroke();
 const fg=c.createLinearGradient(0,fy,0,H);fg.addColorStop(0,'#3d2a22');fg.addColorStop(1,'#120c0a');c.fillStyle=fg;c.fillRect(-100,fy,W+200,H-fy);
 c.fillStyle='#22140f';c.fillRect(250,960,26,440);c.fillRect(250,1215,200,24);c.fillRect(430,1215,20,185);
 const kn=Math.sin(T*9);
 const mm=stick(c,{x:370,y:fy,s:1.3,face:1,col:'#c98aa0',t:T,rim:'rgba(255,200,140,0.6)',rimDir:1,eyes:{dy:10,blink:0.2},pose:{crouch:0.32,lean:0.12,headTilt:0.2,legL:[1.36,0.0],legR:[1.28,-0.06],armL:[0.9+kn*0.08,1.9],armR:[0.8-kn*0.08,1.8]}});
 c.fillStyle='#0c0c12';c.beginPath();c.arc(mm.head.x-56,mm.head.y-50,44,0,7);c.fill();
 const p=mm.hf;c.strokeStyle='#d8d2c2';c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(p.x-60,p.y+30+kn*10);c.lineTo(p.x+60,p.y-50-kn*10);c.moveTo(p.x-50,p.y-50+kn*10);c.lineTo(p.x+70,p.y+20-kn*10);c.stroke();
 const L=lerp(4,9,ease(t/d));c.strokeStyle=SCARF;c.lineWidth=58;c.lineJoin='round';c.beginPath();c.moveTo(p.x+10,p.y);for(let i=1;i<=L;i++)c.lineTo(p.x+14+Math.sin(T*2+i*0.7)*6,p.y+i*30);c.stroke();
 c.strokeStyle='rgba(0,0,0,0.18)';c.lineWidth=4;for(let i=1;i<=L;i++){c.beginPath();c.moveTo(p.x-18,p.y+i*30);c.lineTo(p.x+42,p.y+i*30);c.stroke()}
 c.fillStyle=SCARF;c.beginPath();c.arc(640+Math.sin(T*1.5)*10,fy-38,40,0,7);c.fill();c.strokeStyle='rgba(0,0,0,0.25)';c.lineWidth=4;c.beginPath();c.arc(640+Math.sin(T*1.5)*10,fy-38,24,0.5,4);c.stroke();
 stick(c,{x:790,y:fy+10,s:0.72,face:-1,col:'#e3a84a',t:T,rim:'rgba(255,200,140,0.6)',eyes:{wide:1.2},pose:{armL:[2.5+Math.sin(T*8)*0.2,2.9],armR:[2.3-Math.sin(T*8)*0.2,2.8],bob:Math.abs(Math.sin(T*8))*-10}});
 c.restore()}
// ---------- «Где он?» ----------
function shotGrab(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1,g=ease(t/0.4);c.save();cam(c,545,1050,1.28+0.08*ease(t/d),0,0);
 const r=duo(c,t,T,{left:STR,scarf:'father',fx:700,fEyes:{wide:1.4},fPose:{lean:0.1+0.14*g,headTilt:-0.06,armL:[lerp(0.3,1.45,g),lerp(0.6,1.55,g)],armR:[lerp(0.1,1.2,g),lerp(0.3,1.5,g)],bob:Math.sin(T*26)*2},sEyes:{dy:a2>0?10:0},sPose:{lean:-0.04*g,armL:[0.3,0.5],armR:[0.1,0.3]}});
 if(a1>0&&a2<0)bubble(c,380,330,540,230,r.f.head.x-30,r.f.head.y-r.f.HR-26,['ГДЕ ОН?!'],110,back(a1/0.25));
 if(a2>0)bubble(c,210,290,720,330,r.f.head.x-30,r.f.head.y-r.f.HR-26,['ПОЧЕМУ ОН','НЕ ПРИЕХАЛ САМ?'],92,back(a2/0.28));
 c.restore()}
function shotAndrey(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1;
 const mm=strBase(c,t,d,T,{eyes:{dy:20,sad:true,blink:(t>0.5&&t<0.65)?1:0.25},tilt:0.2});
 if(a1>0&&a2<0)bubble(c,440,330,480,230,mm.head.x+70,mm.head.y-mm.HR-40,['ОН ХОТЕЛ.'],104,back(a1/0.25));
 if(a2>0){bubble(c,330,270,700,320,mm.head.x+70,mm.head.y-mm.HR-40,['ОН УЖЕ','КУПИЛ БИЛЕТ'],100,back(a2/0.28));
  inset(c,860,930,180,back((a2-0.3)/0.3),()=>{c.save();c.translate(860,930);c.rotate(-0.12);c.fillStyle='#f3ead6';c.fillRect(-140,-70,280,140);c.fillStyle='#a8433c';c.fillRect(-140,-70,280,30);c.fillStyle='#2b3a66';c.font='900 44px M';c.textAlign='center';c.fillText('БИЛЕТ',0,22);c.strokeStyle='rgba(60,50,40,0.5)';c.lineWidth=4;c.setLineDash([8,8]);c.beginPath();c.moveTo(70,-40);c.lineTo(70,70);c.stroke();c.restore()})}
 c.restore()}
// ---------- пожар ----------
function flames(c,x,y,w,h,T,seed,n=7){const r=rng(seed);c.save();c.globalCompositeOperation='lighter';
 for(const [col,ks,kh] of [['rgba(255,90,20,0.75)',1,1],['rgba(255,170,40,0.8)',0.7,0.72],['rgba(255,240,170,0.85)',0.4,0.45]]){c.fillStyle=col;for(let i=0;i<n;i++){const fx=x+(i+0.5)/n*w+(r()-0.5)*w/n,fw=w/n*1.5*ks,fh=h*(0.55+r()*0.6)*kh*(0.75+0.25*Math.sin(T*(9+r()*6)+i*1.7)),sw=Math.sin(T*(6+r()*4)+i)*fw*0.5;
  c.beginPath();c.moveTo(fx-fw/2,y);c.quadraticCurveTo(fx-fw/2,y-fh*0.5,fx+sw,y-fh);c.quadraticCurveTo(fx+fw/2,y-fh*0.5,fx+fw/2,y);c.closePath();c.fill()}}c.restore()}
function sparks(c,x,y,w,T,seed,n=40){const r=rng(seed);c.save();c.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const k=((T*(0.35+r()*0.4)+r())%1),sx=x+r()*w+Math.sin(T*3+i)*30*k,sy=y-k*(500+r()*500);c.fillStyle=`rgba(255,${150+Math.floor(r()*90)},60,${1-k})`;c.beginPath();c.arc(sx,sy,2+r()*4,0,7);c.fill()}c.restore()}
function smoke(c,x,y,T,seed,n=9,drift=-260){const r=rng(seed);c.save();c.filter='blur(26px)';for(let i=0;i<n;i++){const k=((T*0.16+i/n)%1);c.fillStyle=`rgba(28,26,34,${0.7*(1-k)})`;c.beginPath();c.arc(x+k*drift+(r()-0.5)*120,y-k*700,60+k*190,0,7);c.fill()}c.restore()}
function shotFire(c,t,d,T){const hy=1050;c.save();cam(c,560,950,1.04+0.08*ease(t/d),Math.sin(T*25)*4,Math.cos(T*21)*4);
 sky(c,['#06060c','#12101c','#2a1a22','#5a2a22'],hy);stars(c,T,500,0.4);
 const g=c.createLinearGradient(0,hy,0,H);g.addColorStop(0,'#5a2a26');g.addColorStop(0.4,'#221626');g.addColorStop(1,'#07060c');c.fillStyle=g;c.fillRect(-200,hy,W+400,H-hy);
 const pu=0.8+0.2*Math.sin(T*13);glow(c,620,hy-260,900,'rgba(255,120,40,A)',0.45*pu);
 smoke(c,640,hy-420,T,3,10,-320);
 c.fillStyle='#232a38';c.fillRect(520,hy-330,360,220);c.fillStyle='#2f394a';c.fillRect(570,hy-410,200,84);c.fillStyle='#161b26';c.fillRect(660,hy-530,78,124);c.fillStyle='#8f3a34';c.fillRect(660,hy-500,78,26);
 for(let i=0;i<5;i++){c.fillStyle=i%2?'#ff9a3a':'#ffd58a';c.fillRect(548+i*64,hy-290,36,32)}
 flames(c,540,hy-320,330,330,T,5,6);flames(c,300,hy-110,300,260,T+2,9,5);
 const hg=c.createLinearGradient(0,hy-110,0,hy+230);hg.addColorStop(0,'#222a3a');hg.addColorStop(1,'#0c1018');c.fillStyle=hg;c.beginPath();c.moveTo(80,hy-110);c.lineTo(1040,hy-110);c.lineTo(1000,hy+230);c.lineTo(220,hy+230);c.quadraticCurveTo(130,hy+100,80,hy-110);c.fill();
 c.fillStyle='#7a2f2c';c.beginPath();c.moveTo(186,hy+170);c.lineTo(1008,hy+170);c.lineTo(1000,hy+230);c.lineTo(220,hy+230);c.fill();
 c.fillStyle='rgba(220,225,235,0.6)';c.font='900 46px M';c.textAlign='left';c.fillText('NORDSTERN',210,hy+10);
 flames(c,700,hy-108,260,200,T+4,13,5);sparks(c,300,hy-200,600,T,7,60);
 const al=Math.pow(Math.abs(Math.sin(T*5)),3);glow(c,560,hy-420,160+al*120,'rgba(255,40,40,A)',0.5*al);
 c.save();c.globalCompositeOperation='lighter';for(let i=0;i<26;i++){const k=i/26,y=hy+240+Math.pow(k,1.4)*520,w=(40+k*240)*(0.6+0.4*Math.sin(T*3+i*2));c.strokeStyle=`rgba(255,150,70,${0.4*(1-k*0.8)})`;c.lineWidth=3+k*6;c.beginPath();c.moveTo(600-w,y);c.lineTo(600+w,y);c.stroke()}c.restore();
 waveLayer(c,hy+250,12,260,1.3,T,'#2a1a26','#07060c','rgba(255,190,140,0.35)');
 c.restore()}
function shotRescue(c,t,d,T,m){const m1=m[1]!=null?m[1]:d,a=t-m1,fy=1420;c.save();cam(c,540,1000,1.05,Math.sin(T*25)*5,Math.cos(T*21)*5);
 const wg=c.createLinearGradient(0,0,0,H);wg.addColorStop(0,'#1a0d0c');wg.addColorStop(0.6,'#4a1c12');wg.addColorStop(1,'#16090a');c.fillStyle=wg;c.fillRect(-100,-100,W+200,H+200);
 c.strokeStyle='rgba(0,0,0,0.35)';c.lineWidth=6;for(let x=-40;x<W+80;x+=180){c.beginPath();c.moveTo(x,300);c.lineTo(x,fy);c.stroke()}c.fillStyle='#120807';c.fillRect(-100,240,W+200,70);
 // выход
 glow(c,110,1090,620,'rgba(170,215,255,A)',0.55);c.fillStyle='#d6ecff';c.fillRect(40,760,190,660);c.strokeStyle='#120807';c.lineWidth=22;c.strokeRect(40,760,190,660);
 const fg=c.createLinearGradient(0,fy,0,H);fg.addColorStop(0,'#2a1210');fg.addColorStop(1,'#090405');c.fillStyle=fg;c.fillRect(-100,fy,W+200,H-fy);
 flames(c,620,fy+10,560,520,T,21,6);flames(c,820,820,300,300,T+3,23,4);
 if(a<0){const p=clamp(t/m1),q=(p*2)%1,trip=p<0.5?0:1,x=lerp(1180,-120,q),ph=T*9;
  stick(c,{x:x+84,y:fy,s:1.2,face:-1,col:trip?'#9a86b8':'#8a93a8',t:T,rim:'rgba(255,150,70,0.7)',rimDir:1,eyes:{blink:0.8},pose:{...walk(ph+1.4,0.35),lean:0.34,headTilt:0.3,armL:[0.2,0.4]}});
  stick(c,{...SON,x,y:fy,s:1.3,face:-1,t:T,rim:'rgba(255,150,70,0.8)',rimDir:1,eyes:{wide:1.2},pose:{...walk(ph,0.5),lean:0.2,armL:[-0.9,-1.4]}});
  c.restore();bigText(c,'СПАСЕНО: '+(trip+(q>0.85?1:0))+' / 2',W/2,400,96,'#ffd60a',1+0.03*Math.sin(T*16),0,18)}
 else{const x=lerp(1150,520,easeOut(a/0.9)),fb=clamp((a-0.55)/0.28),land=fb>=1;
  stick(c,{...SON,x,y:fy,s:1.3,face:-1,t:T,rim:'rgba(255,150,70,0.8)',rimDir:1,eyes:{wide:1.5},pose:land?{lean:-0.16,armL:[2.2,2.9],armR:[2.0,2.7]}:{...walk(T*13,0.6),lean:0.26}});
  c.save();c.translate(lerp(520,300,fb*fb),lerp(-300,1210,fb*fb));c.rotate(lerp(0.2,1.15,fb));c.fillStyle='#1a0e0b';c.fillRect(-380,-34,760,68);c.restore();
  if(land){flames(c,60,fy,520,360,T+5,27,5);sparks(c,60,fy-80,520,T,29,50)}
  c.restore();if(land&&a<0.95){c.fillStyle=`rgba(255,220,170,${0.7*(1-(a-0.83)/0.12)})`;c.fillRect(0,0,W,H)}
  const dk=ease((a-1.0)/0.7);if(dk>0){c.fillStyle=`rgba(0,0,0,${0.9*dk})`;c.fillRect(0,0,W,H)}}
 smoke(c,700,1500,T,31,8,200)}
// ---------- больница ----------
function shotHospital(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1,a3=m[3]!=null?t-m[3]:-1,fy=1420;c.save();cam(c,lerp(540,420,ease(Math.max(0,a2)/1.2)),lerp(980,1120,ease(Math.max(0,a2)/1.2)),1.02+0.25*ease(Math.max(0,a2)/1.2),0,0);
 const wg=c.createLinearGradient(0,0,0,fy);wg.addColorStop(0,'#162129');wg.addColorStop(1,'#2b3c46');c.fillStyle=wg;c.fillRect(-100,-100,W+200,fy+100);
 c.fillStyle='#0b1a33';c.fillRect(720,360,280,340);moon(c,880,480,36);c.strokeStyle='#0d151a';c.lineWidth=16;c.strokeRect(720,360,280,340);c.beginPath();c.moveTo(860,360);c.lineTo(860,700);c.stroke();
 const fg=c.createLinearGradient(0,fy,0,H);fg.addColorStop(0,'#1c2a31');fg.addColorStop(1,'#080d10');c.fillStyle=fg;c.fillRect(-100,fy,W+200,H-fy);
 // монитор
 c.fillStyle='#0d151a';c.fillRect(196,900,14,520);c.fillStyle='#10181d';c.beginPath();c.roundRect(70,640,280,220,18);c.fill();c.fillStyle='#04120c';c.fillRect(88,658,244,150);
 const bt=(T*1.05)%1;c.strokeStyle='#39ff9a';c.lineWidth=5;c.lineJoin='round';c.shadowColor='#39ff9a';c.shadowBlur=14;c.beginPath();for(let i=0;i<=60;i++){const u=i/60,ph=((u*2.2-T*1.05)%1+1)%1;let y=0;if(ph>0.42&&ph<0.46)y=-14;else if(ph>=0.46&&ph<0.5)y=52;else if(ph>=0.5&&ph<0.54)y=-30;else if(ph>0.62&&ph<0.72)y=-10*Math.sin((ph-0.62)/0.1*Math.PI);const x=92+u*236;i?c.lineTo(x,740-y):c.moveTo(x,740-y)}c.stroke();c.shadowBlur=0;
 c.fillStyle='#39ff9a';c.font='900 36px M';c.textAlign='left';c.fillText('58',270,846);heart(c,240,834,0.28+0.1*(bt<0.15?1:0),'#ff4d6a');
 // капельница
 c.fillStyle='#0d151a';c.fillRect(470,560,10,860);c.fillRect(440,560,70,10);c.fillStyle='rgba(200,230,245,0.75)';c.beginPath();c.roundRect(480,580,56,110,14);c.fill();c.strokeStyle='rgba(200,230,245,0.6)';c.lineWidth=4;c.beginPath();c.moveTo(508,690);c.quadraticCurveTo(520,1000,600,1180);c.stroke();
 const dk=(T*0.9)%1;c.fillStyle='rgba(200,230,245,0.9)';c.beginPath();c.arc(508,700+dk*60,5,0,7);c.fill();
 // кровать
 c.fillStyle='#0d151a';c.fillRect(120,1330,880,26);c.fillRect(140,1356,22,70);c.fillRect(960,1356,22,70);c.fillRect(120,1130,26,226);
 c.fillStyle='#dfe6ea';c.beginPath();c.roundRect(146,1250,850,86,22);c.fill();c.fillStyle='#f3f6f8';c.beginPath();c.roundRect(160,1180,250,96,40);c.fill();
 const hx=330,hy2=1160+Math.sin(T*1.2)*3;c.fillStyle='#0c0c12';c.beginPath();c.arc(hx,hy2,82,0,7);c.fill();
 c.save();c.beginPath();c.arc(hx,hy2,82,0,7);c.clip();c.fillStyle='#eef2f4';c.fillRect(hx-90,hy2-72,180,44);c.restore();
 c.strokeStyle='#f0f0f0';c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(hx+14,hy2+4);c.lineTo(hx+34,hy2+8);c.moveTo(hx+46,hy2+4);c.lineTo(hx+66,hy2+8);c.stroke();
 c.fillStyle='#8fb2c8';c.beginPath();c.moveTo(390,1260);c.quadraticCurveTo(680,1160+Math.sin(T*1.2)*6,996,1250);c.lineTo(996,1336);c.lineTo(390,1336);c.closePath();c.fill();c.fillStyle='#e3a84a';c.beginPath();c.roundRect(380,1226,96,34,17);c.fill();
 if(a1>0&&a2<0.3){c.save();c.globalAlpha=clamp(a1/0.4)*(a2>0?1-a2/0.3:1);stick(c,{x:800,y:fy+20,s:1.2,face:-1,col:'#dfe6ea',t:T,eyes:{sad:true,dy:6},pose:{headTilt:0.12+Math.sin(T*5)*0.1,armL:[0.4,1.9],armR:[0.2,1.7]}});stick(c,{x:940,y:fy+30,s:1.14,face:-1,col:'#cfd8dd',t:T,eyes:{sad:true,dy:6},pose:{armL:[0.2,0.3]}});c.restore()}
 if(a3>0)bubble(c,330,780,480,210,hx+50,hy2-96,['папа…'],110,back(a3/0.3));
 else if(a2>0){c.fillStyle='rgba(251,247,238,0.9)';[[hx+70,hy2-110,14],[hx+110,hy2-160,22]].forEach(([x,y,r],i)=>{if(a2>i*0.3){c.beginPath();c.arc(x,y,r,0,7);c.fill()}})}
 c.restore();c.fillStyle='rgba(20,40,60,0.18)';c.fillRect(0,0,W,H)}
// ---------- письмо ----------
function shotOpen(c,t,d,T,m){const fl=ease((t-0.4)/0.7),up=m[1]!=null?ease((t-m[1])/1.2):ease((t-1.3)/1.2),sh=Math.sin(T*24)*3;c.save();cam(c,540,lerp(980,860,up),1.0+0.14*up,0,0);
 sky(c,['#0a0f1c','#182236','#2a3850','#3c4a62'],H);fog(c,T,500,7,0.16,91);glow(c,540,1000,820,'rgba(255,200,120,A)',0.4);
 c.lineCap='round';c.strokeStyle='#7389ad';c.lineWidth=130;c.beginPath();c.moveTo(-60,1900);c.lineTo(250+sh,1190);c.moveTo(1140,1900);c.lineTo(830+sh,1190);c.stroke();
 c.save();c.translate(540+sh,1020);c.rotate(Math.sin(T*1.5)*0.012);
 // письмо выезжает
 c.fillStyle='#fbf6e6';c.fillRect(-230,-150-up*330,460,420);c.strokeStyle='rgba(43,58,102,0.75)';c.lineWidth=7;c.beginPath();for(let i=0;i<=30;i++){const x=-170+i*11,y=-60-up*330+Math.sin(i*1.3)*9;i?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();
 const g=c.createLinearGradient(0,-180,0,180);g.addColorStop(0,'#f6eedb');g.addColorStop(1,'#d9cdb0');c.fillStyle=g;c.fillRect(-280,-120,560,300);
 c.fillStyle='#e6dcc2';c.beginPath();c.moveTo(-280,-120);c.lineTo(0,lerp(60,-330,fl));c.lineTo(280,-120);c.closePath();c.fill();c.strokeStyle='rgba(120,100,70,0.55)';c.lineWidth=5;c.stroke();
 c.fillStyle='#2b3a66';c.font='900 96px M';c.textAlign='center';c.fillText('ПАПЕ',0,120);
 c.restore();
 c.fillStyle='#7389ad';c.beginPath();c.arc(250+sh,1190,74,0,7);c.arc(830+sh,1190,74,0,7);c.fill();
 fog(c,T+20,1600,4,0.14,97);c.restore()}
function shotLetter(c,t,d,T){const L=['Папа,','ты ещё зажигаешь','маяк?'],total=L.join('').length,n=Math.floor(clamp((t-0.25)/2.3)*total);c.save();cam(c,540,900,1.0+0.06*ease(t/d),0,0);
 sky(c,['#0a0f1c','#182236','#2a3850','#3c4a62'],H);fog(c,T,300,6,0.14,93);glow(c,540,900,1000,'rgba(255,200,120,A)',0.42+0.04*Math.sin(T*9));
 c.save();c.translate(540,880);c.rotate(-0.035+Math.sin(T*1.3)*0.006);
 c.fillStyle='rgba(0,0,0,0.4)';c.fillRect(-410,-430,860,900);const g=c.createLinearGradient(0,-450,0,450);g.addColorStop(0,'#fbf6e6');g.addColorStop(1,'#e6dcc2');c.fillStyle=g;c.fillRect(-430,-450,860,900);
 c.strokeStyle='rgba(120,100,70,0.22)';c.lineWidth=4;c.beginPath();c.moveTo(-430,-150);c.lineTo(430,-150);c.moveTo(-430,150);c.lineTo(430,150);c.stroke();
 c.fillStyle='#2b3a66';c.textAlign='left';c.textBaseline='middle';let used=0;
 L.forEach((ln,i)=>{const k=Math.max(0,Math.min(ln.length,n-used));used+=ln.length;if(k<=0)return;c.save();c.translate(-350,-190+i*190);c.transform(1,0,-0.2,1,0,0);let size=i==1?68:112;c.font=`900 ${size}px M`;c.fillText(ln.slice(0,k),0,0);c.restore()});
 // слёзы на бумаге
 for(let i=0;i<3;i++){const st=3.2+i*0.9,k=t-st;if(k>0){const x=-150+i*210,y=300-i*60;c.fillStyle=`rgba(120,140,170,${0.28*clamp(k/0.3)})`;c.beginPath();c.ellipse(x,y,34+clamp(k)*14,26+clamp(k)*10,0,0,7);c.fill()}else if(k>-0.4){const q=(k+0.4)/0.4;c.fillStyle='rgba(210,232,255,0.95)';c.beginPath();c.ellipse(-150+i*210,300-i*60-(1-q)*500,9,16,0,0,7);c.fill()}}
 c.restore();
 c.fillStyle='#7389ad';c.beginPath();c.arc(120,1420,84,0,7);c.arc(960,1420,84,0,7);c.fill();
 c.restore()}

function hook(c,T){const a=1-ease((T-1.6)/0.25);if(a<=0)return;c.save();c.globalAlpha=a;bigText(c,'ЧАСТЬ 3',W/2,1330,170,'#ffd60a',0.7+0.3*back(T/0.3),-0.03,26);if(T>0.25)bigText(c,'ЧТО В КОНВЕРТЕ?',W/2,1490,84,'#fff',0.7+0.3*back((T-0.25)/0.3),0,16);c.restore()}
function outro(c,T){const s=window.DATA.outro;if(T<s)return;bigText(c,'ОН УСПЕЕТ?',W/2,1500,128,'#ffd60a',0.7+0.3*back((T-s)/0.3),-0.02,24);if(T>s+0.4)bigText(c,'ЧАСТЬ 4 — СКОРО',W/2,1650,72,'#fff',0.7+0.3*back((T-s-0.4)/0.3),0,14)}
Object.assign(FN,{shotRecap,shotGasp,shotIntro,shotKnit,shotGrab,shotAndrey,shotFire,shotRescue,shotHospital,shotOpen,shotLetter});

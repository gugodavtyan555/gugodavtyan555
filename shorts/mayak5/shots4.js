// «Маяк», часть 2 — дополнительные сцены. Подключается после shots3.js
const STR={col:'#4f8a86',hat:'#22303a',rim:'rgba(170,195,255,0.5)'};
const VIL=[['#e07a5f',1.18],['#7fb69a',1.26],['#e9c46a',1.14],['#b98ac9',1.05]];

// ---------- деревня просыпается ----------
function shotWake(c,t,d,T,m){const gy=1330,lit=ease((t-0.15)/1.3),go=m[1]!=null?t-m[1]:-1;c.save();cam(c,540,1000,1.05,lerp(-20,20,t/d),0);
 sky(c,['#080817','#141230','#2a2247','#463454'],gy);stars(c,T,700,0.9);
 c.fillStyle='#120f24';c.beginPath();c.moveTo(900,gy-380);c.lineTo(912,gy-640);c.lineTo(946,gy-640);c.lineTo(958,gy-380);c.fill();c.fillRect(905,gy-668,48,30);beam(c,{x:929,y:gy-654},T*1.5,620,0.55);
 const HS=[[-60,330,470,2],[300,280,380,5],[610,250,440,8],[880,300,340,11]];
 HS.forEach(([x,w,h,s],i)=>darkHouse(c,x,gy,w,h,i%2?'#19152d':'#151226',i%2?'#110e20':'#0e0c1b',s));
 HS.forEach(([x,w,h,s],i)=>{const a=clamp(lit*4-i*0.8);if(a>0){c.save();c.globalAlpha=a;house(c,x,gy,w,h,i%2?'#211b3a':'#1a1630',i%2?'#17132a':'#120f22','#ffcf80',T,s);c.restore()}});
 street(c,gy);
 c.strokeStyle='#0d0b18';c.lineWidth=14;c.lineCap='round';c.beginPath();c.moveTo(150,gy);c.lineTo(150,gy-560);c.quadraticCurveTo(150,gy-620,215,gy-620);c.stroke();glow(c,225,gy-604,120,'rgba(255,205,120,A)',0.8*lit);c.fillStyle=lit>0.3?'#ffe6a8':'#23202e';c.beginPath();c.arc(225,gy-604,17,0,7);c.fill();
 if(go>0)VIL.forEach(([col,s],i)=>{const k=easeOut((go-i*0.18)/1.3);if(go>i*0.18){const x=lerp(-220,330+i*170,k)+go*40;stick(c,{x,y:gy+30+i*10,s,face:1,col,t:T,rim:'rgba(255,200,120,0.5)',eyes:{wide:1.2},pose:{...walk(T*11+i*1.3,0.62),lean:0.24}})}});
 c.restore()}
// ---------- «Дед, ты куда?» ----------
function shotCall(c,t,d,T,m){const hy=1000,a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1,quiet=a2>0?ease(a2/0.5):0;
 c.save();cam(c,540,1000,1.0+0.06*ease(t/d),0,0);
 nightSea(c,T,hy,820);farLight(c,190,hy-8,T);
 const k=ease(t/d),bx=lerp(430,300,k),by=lerp(1250,1150,k)+Math.sin(T*1.7)*6,bs=lerp(0.95,0.62,k),ph=T*4.2;
 rowboat(c,bx,by,Math.sin(T*1.7)*0.06,bs,()=>{stick(c,{...OLD,x:-30,y:-8,s:0.72,face:1,t:T,shadow:false,scarf:SCARF,pose:{crouch:0.5,lean:0.2+0.34*Math.sin(ph),legL:[1.3,0.25],legR:[1.2,0.15],armL:[1.2+0.45*Math.sin(ph),1.6],armR:[1.1+0.45*Math.sin(ph),1.5]}});c.save();c.translate(96,-40);lantern(c,{x:0,y:-40},0.7,T);c.restore()},'#5d4130');
 waveLayer(c,by+50*bs+30,10,240,1.4,T,'#1b3156','#0a1326','rgba(200,225,255,0.3)');
 beach(c,T);
 const R=[];VIL.forEach(([col,s],i)=>{const sh=1-quiet,up=Math.sin(T*10+i*1.7);R.push(stick(c,{x:640+i*118,y:1640+(i%2)*26,s:s*0.8,face:-1,col,t:T,rim:'rgba(170,195,255,0.4)',eyes:{wide:1.25,sad:quiet>0.5},
  pose:{lean:lerp(0.16,0.02,quiet),headTilt:-0.1,bob:Math.abs(up)*-10*sh,armL:quiet>0.5?[lerp(2.5,2.9,quiet),lerp(2.9,4.0,quiet)]:[2.5+up*0.3,2.9+up*0.2],armR:i%2?[2.2+up*0.25,2.7]:[0.2,0.4]}}))});
 if(a2<0)bubble(c,300,330,720,230,R[0].head.x-30,R[0].head.y-R[0].HR-24,['ДЕД, ТЫ КУДА?!'],96,back(t/0.28));
 if(a1>0&&a2<0)bubble(c,470,590,520,200,R[2].head.x-20,R[2].head.y-R[2].HR-24,['УТОНЕШЬ!'],100,back(a1/0.25),'#b3362e');
 c.restore()}
function shotRowB(c,t,d,T,m){shotRow(c,t,d,T,[m[0],m[2],m[3]])}

// ---------- воспоминание: учил грести ----------
function warmSea(c,T,hy,sx){sky(c,['#2b1d4a','#7a4268','#e0855a','#ffd08a'],hy);clouds(c,T,520,'rgba(255,190,150,0.35)',51,5);
 glow(c,sx,hy-30,620,'rgba(255,170,90,A)',0.55);c.fillStyle='#fff0c8';c.beginPath();c.arc(sx,hy-10,92,Math.PI,0);c.fill();
 const g=c.createLinearGradient(0,hy,0,H);g.addColorStop(0,'#d07a5c');g.addColorStop(0.35,'#6d3f5e');g.addColorStop(1,'#1c1230');c.fillStyle=g;c.fillRect(-200,hy,W+400,H-hy);
 c.save();c.lineCap='round';for(let i=0;i<24;i++){const k=i/24,y=hy+6+Math.pow(k,1.6)*(H-hy),amp=2+k*12,wl=70+k*220;c.beginPath();for(let x=-60;x<=W+60;x+=24){const yy=y+Math.sin(x/wl+T*1.2+i*1.7)*amp;x<-50?c.moveTo(x,yy):c.lineTo(x,yy)}c.strokeStyle=`rgba(255,220,190,${0.07+k*0.08})`;c.lineWidth=1.5+k*5;c.stroke()}
 c.globalCompositeOperation='lighter';for(let i=0;i<30;i++){const k=i/30,y=hy+6+Math.pow(k,1.5)*(H-hy)*0.9,w=(20+k*150)*(0.6+0.4*Math.sin(T*2.3+i*2.1));c.strokeStyle=`rgba(255,225,170,${0.42*(1-k*0.7)})`;c.lineWidth=2+k*6;c.beginPath();c.moveTo(sx-w,y);c.lineTo(sx+w,y);c.stroke()}c.restore()}
function pier(c,py,x0){c.fillStyle='#2a1b24';for(let x=x0+50;x<W+100;x+=160)c.fillRect(x,py,22,480);const pg=c.createLinearGradient(0,py-14,0,py+14);pg.addColorStop(0,'#8a5c46');pg.addColorStop(1,'#3a2228');c.fillStyle=pg;c.fillRect(x0,py-14,W+200-x0,28)}
function shotTeach(c,t,d,T,m){const hy=1000,lf=m[1]!=null&&t>m[1],ph=T*4;c.save();cam(c,540,1040,1.08+0.07*ease(t/d),0,0);
 warmSea(c,T,hy,780);
 const bx=520,by=1280+Math.sin(T*1.8)*8,rot=Math.sin(T*1.8+1)*0.05;
 const oar=()=>{const th=0.7*Math.sin(ph)+0.25,vx=Math.sin(th),vy=Math.cos(th);c.strokeStyle='#4a3626';c.lineWidth=10;c.lineCap='round';c.beginPath();c.moveTo(40-vx*70,-34-vy*70);c.lineTo(40+vx*180,-34+vy*180);c.stroke();c.fillStyle='#5d4130';c.save();c.translate(40+vx*180,-34+vy*180);c.rotate(-th);c.beginPath();c.ellipse(0,18,14,34,0,0,7);c.fill();c.restore()};
 rowboat(c,bx,by,rot,1.75,()=>{
  stick(c,{...YOUNG,rim:'rgba(255,200,140,0.7)',x:-78,y:-8,s:0.72,face:1,t:T,shadow:false,pose:{crouch:0.5,lean:0.16,legL:[1.3,0.25],legR:[1.2,0.15],armL:[1.25,1.3+0.2*Math.sin(ph)],armR:[1.1,1.2]}});
  stick(c,{x:28,y:-8,s:0.5,face:1,col:'#e3a84a',scarf:SCARF,t:T,shadow:false,rim:'rgba(255,200,140,0.7)',eyes:{blink:lf?0.75:0},pose:{crouch:0.5,lean:0.2+0.34*Math.sin(ph),headTilt:lf?-0.25+Math.sin(T*10)*0.08:0,legL:[1.3,0.25],legR:[1.2,0.15],armL:[1.2+0.45*Math.sin(ph),1.6],armR:[1.1+0.45*Math.sin(ph),1.5],bob:lf?Math.abs(Math.sin(T*10))*-6:0}})},'#7a5236');
 c.save();c.translate(bx,by);c.rotate(rot);c.scale(1.75,1.75);oar();c.restore();
 waveLayer(c,by+100,14,240,1.4,T,'#8a4a5c','#2a1a3a','rgba(255,225,200,0.45)');
 if(lf){const r=rng(21);c.fillStyle='rgba(255,240,220,0.85)';for(let i=0;i<22;i++){const k=((T*1.3+r())%1),a=-2.4+r()*1.7,sp=160+r()*260,x=bx+170+Math.cos(a)*sp*k,y=by+10+Math.sin(a)*sp*k+k*k*300;c.beginPath();c.arc(x,y,4+r()*5,0,7);c.fill()}}
 c.restore()}
function shotShout(c,t,d,T,m){const hy=1000,q=m[1]!=null?t-m[1]:-1;c.save();cam(c,500,1080,1.15+0.1*ease(t/d),0,0);
 warmSea(c,T,hy,800);
 const bx=470,by=1300+Math.sin(T*1.8)*8,rot=Math.sin(T*1.8+1)*0.05;let hd=null;
 c.save();c.translate(bx,by);c.rotate(rot);c.scale(1.9,1.9);
 const mm=stick(c,{x:-10,y:-10,s:0.56,face:1,col:'#e3a84a',scarf:SCARF,t:T,shadow:false,rim:'rgba(255,200,140,0.8)',eyes:{wide:1.25},pose:{lean:-0.04,headTilt:-0.2,armL:[2.7+Math.sin(T*9)*0.25,3.0],armR:[2.5-Math.sin(T*9)*0.25,2.9],bob:Math.abs(Math.sin(T*9))*-8}});
 c.strokeStyle='#4a3626';c.lineWidth=9;c.lineCap='round';c.beginPath();c.moveTo(-90,-30);c.lineTo(70,-50);c.stroke();hullOnly(c,'#7a5236');c.restore();
 const hx=bx+(mm.head.x)*1.9,hy2=by+(mm.head.y)*1.9;
 waveLayer(c,by+110,14,240,1.4,T,'#8a4a5c','#2a1a3a','rgba(255,225,200,0.45)');
 if(q>0)bubble(c,150,330,760,330,hx+30,hy2-150,['ПАПА, СМОТРИ,','Я САМ!'],100,back(q/0.28));
 c.restore()}
function shotNets(c,t,d,T,m){const hy=1000,q=m[1]!=null?t-m[1]:-1,gone=m[2]!=null?ease((t-m[2])/1.0):0,py=1330;c.save();cam(c,560,1040,1.05+0.07*ease(t/d),0,0);
 warmSea(c,T,hy,260);
 // лодка с мальчиком вдали
 c.save();c.globalAlpha=1-gone;const bx=260,by=hy+170+Math.sin(T*1.8)*6;c.save();c.translate(bx,by);c.scale(0.85,0.85);stick(c,{x:-10,y:-10,s:0.56,face:1,col:'#e3a84a',scarf:SCARF,t:T,shadow:false,rim:'rgba(255,200,140,0.8)',pose:{armL:[2.7+Math.sin(T*9)*0.25,3.0],armR:[2.5-Math.sin(T*9)*0.25,2.9],bob:Math.abs(Math.sin(T*9))*-8}});hullOnly(c,'#7a5236');c.restore();c.restore();
 pier(c,py,470);
 // сеть
 c.strokeStyle='rgba(60,40,36,0.9)';c.lineWidth=4;for(let i=0;i<9;i++){c.beginPath();c.moveTo(780+i*30,py-170);c.quadraticCurveTo(800+i*34,py-90,860+i*30,py-14);c.stroke()}for(let j=0;j<5;j++){c.beginPath();c.moveTo(790+j*8,py-150+j*30);c.quadraticCurveTo(920,py-130+j*32,1090+j*6,py-150+j*30);c.stroke()}
 const turn=gone>0.35;
 const mm=stick(c,{...YOUNG,rim:'rgba(255,200,140,0.7)',x:700,y:py-12,s:1.3,face:turn?-1:1,t:T,eyes:turn?{wide:1.3}:{dy:8},pose:turn?{lean:0,armL:[0.2,0.3],armR:[-0.1,0.1]}:{crouch:0.45,lean:0.3,headTilt:0.2,legL:[1.35,0.1],legR:[1.25,0.0],armL:[1.1+Math.sin(T*6)*0.12,1.7],armR:[0.9-Math.sin(T*6)*0.12,1.5]}});
 if(q>0&&gone<0.2)bubble(c,330,430,700,300,mm.head.x-10,mm.head.y-mm.HR-26,['ПОТОМ ПОСМОТРЮ,','СЫНОК'],88,back(q/0.28));
 c.restore();
 if(gone>0){c.fillStyle=`rgba(20,24,40,${0.5*gone})`;c.fillRect(0,0,W,H)}}

// ---------- волна, темнота, свет рядом ----------
function seaBoat(c,t,T,o){const hy=900;sky(c,['#04060f','#0a1226','#14223e','#22385a'],hy);stars(c,T,hy,o.stars==null?0.6:o.stars);
 sea(c,hy,T,'#182c4c','#03060c',null);
 if(o.light>0){glow(c,-60,1050,1200*o.light,'rgba(255,190,110,A)',0.5*o.light);glow(c,-20,1050,320*o.light,'rgba(255,235,190,A)',0.85*o.light)}
 waveLayer(c,1150,o.amp*0.6,250,1.5,T,'#1f3a60','#0a1326','rgba(200,225,255,0.3)');
 const bx=560,yb=1250,by=waveY(bx,yb,o.amp,230,1.9,T),rot=Math.cos(bx/230+T*1.9)*o.amp*0.0045;
 rowboat(c,bx,by+16,rot,1.45,()=>{stick(c,{...OLD,x:-30,y:-8,s:0.72,face:o.face||1,t:T,shadow:false,scarf:SCARF,rim:o.light>0?`rgba(255,205,140,${o.light})`:'rgba(170,195,255,0.3)',rimDir:-1,eyes:o.eyes||{},pose:o.pose});c.save();c.translate(96,-40);lantern(c,{x:0,y:-40},0.7,T,o.pow);c.restore()},'#5d4130');
 waveLayer(c,yb+86,o.amp,230,1.9,T+0.3,'#16294a','#04070f','rgba(200,225,255,0.4)');
 waveLayer(c,yb+330,o.amp*1.3,280,1.5,T+4,'#0d1930','#020308','rgba(200,225,255,0.25)');
 return{bx,by}}
const SIT={crouch:0.5,lean:0.2,legL:[1.3,0.25],legR:[1.2,0.15],armL:[1.2,1.6],armR:[1.1,1.5]};
function shotWave(c,t,d,T,m){const out=m[1]!=null?clamp((t-m[1]-0.15)/0.3):0,hit=t-0.45;
 c.save();cam(c,560,1000,1.1,Math.sin(T*27)*8*clamp(1-Math.abs(hit)/0.9),Math.cos(T*23)*8*clamp(1-Math.abs(hit)/0.9));
 const b=seaBoat(c,t,T,{amp:lerp(30,66,ease(t/0.5)),pow:1-out,eyes:{wide:1.4},pose:{...SIT,lean:0.5,armL:[1.6,1.9],armR:[1.5,1.8]}});
 if(hit>0&&hit<1.4){const k=hit/1.4;c.save();c.filter='blur(6px)';c.fillStyle=`rgba(225,238,255,${0.85*(1-k)})`;c.beginPath();c.moveTo(b.bx+60,b.by+60);c.quadraticCurveTo(b.bx+260,b.by-520*Math.sin(k*Math.PI)-80,b.bx-200,b.by-160+k*300);c.quadraticCurveTo(b.bx+120,b.by-200*Math.sin(k*Math.PI),b.bx+60,b.by+60);c.fill();c.restore();
  const r=rng(31);c.fillStyle=`rgba(225,238,255,${1-k})`;for(let i=0;i<40;i++){const a=-2.9+r()*2.2,sp=300+r()*620,x=b.bx+120+Math.cos(a)*sp*k,y=b.by-20+Math.sin(a)*sp*k+k*k*700;c.beginPath();c.arc(x,y,4+r()*7,0,7);c.fill()}}
 c.restore();if(out>0){c.fillStyle=`rgba(0,0,8,${0.6*out})`;c.fillRect(0,0,W,H)}}
function shotBlack(c,t,d,T){c.save();cam(c,560,1130,1.2+0.3*ease(t/d),0,0);
 seaBoat(c,t,T,{amp:22,pow:0,stars:0.25,eyes:{wide:1.3,dx:Math.sin(T*2.4)*5},pose:{...SIT,lean:0.3,armL:[0.9,2.6],armR:[0.8,2.5],bob:Math.sin(T*28)*1.4}});
 fog(c,T,700,6,0.10,43);c.restore();c.fillStyle='rgba(0,0,8,0.62)';c.fillRect(0,0,W,H)}
function shotFlare(c,t,d,T,m){const k=easeOut((t-0.1)/0.8),z=m[1]!=null?ease((t-m[1])/0.8):0;c.save();cam(c,lerp(560,500,z),1130,1.5-0.25*k+0.2*z,0,0);
 seaBoat(c,t,T,{amp:22,pow:0,stars:0.25,light:k,face:t>0.35?-1:1,eyes:{wide:1.5},pose:{...SIT,lean:t>0.35?-0.05:0.3,armL:[0.9,1.6],armR:[0.8,1.5]}});
 fog(c,T,700,6,0.10+0.12*k,43,'255,225,190');c.restore();c.fillStyle=`rgba(0,0,8,${0.62*(1-k)})`;c.fillRect(0,0,W,H);
 if(t>0.1&&t<0.4){c.fillStyle=`rgba(255,235,200,${0.35*(1-(t-0.1)/0.3)})`;c.fillRect(0,0,W,H)}}

// ---------- незнакомец ----------
function inset(c,cx,cy,r,k,draw){if(k<=0)return;c.save();c.translate(cx,cy);c.scale(k,k);c.translate(-cx,-cy);c.save();c.beginPath();c.arc(cx,cy,r,0,7);c.clip();c.fillStyle='#1b2740';c.fillRect(cx-r,cy-r,r*2,r*2);glow(c,cx-r,cy,r*2,'rgba(255,190,110,A)',0.35);draw();c.restore();c.strokeStyle='#ffd60a';c.lineWidth=12;c.beginPath();c.arc(cx,cy,r,0,7);c.stroke();c.strokeStyle='#000';c.lineWidth=5;c.beginPath();c.arc(cx,cy,r+8,0,7);c.stroke();c.restore()}
function strBase(c,t,d,T,o){c.save();cam(c,560,900,1.0+0.08*ease(t/d),0,0);
 sky(c,['#0a0f1c','#182236','#2a3850','#3c4a62'],H);fog(c,T,500,7,0.16,61);
 const pu=0.8+0.2*Math.sin(T*2.2);glow(c,W+80,1010,900,'rgba(255,190,110,A)',0.42*pu);
 const mm=stick(c,{...STR,x:390+(o.dx||0),y:2640,s:4.0,face:1,t:T,noLegs:true,shadow:false,rim:`rgba(255,205,140,${0.8*pu})`,rimDir:1,eyes:o.eyes,pose:{lean:0.02,headTilt:o.tilt||0,armL:[0.25,0.5],armR:[-0.2,0.2],bob:Math.sin(T*1.8)*5}});
 fog(c,T+20,1500,4,0.14,67);return mm}
function shotLook(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1;
 strBase(c,t,d,T,{eyes:{dx:a2>0?4:a1>0?8:0,dy:a2>0?16:a1>0?-10:0,blink:(t>0.7&&t<0.82)?1:0},tilt:a2>0?0.08:a1>0?-0.08:0});
 if(a1>0)inset(c,850,420,185,back(a1/0.3),()=>stick(c,{...OLD,x:890,y:420+70+425*2.3,s:2.3,face:-1,t:T,noLegs:true,shadow:false,rim:'rgba(255,205,140,0.7)',rimDir:-1}));
 if(a2>0)inset(c,880,860,185,back(a2/0.3),()=>stick(c,{...OLD,x:910,y:860+370*2.6-30,s:2.6,face:-1,t:T,noLegs:true,shadow:false,scarf:SCARF,rim:'rgba(255,205,140,0.7)',rimDir:-1}));
 c.restore()}
function shotShake(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1,sh=Math.sin(T*8.5)*26*clamp(1-Math.max(0,t-1.7)/0.4);
 const mm=strBase(c,t,d,T,{dx:sh,eyes:{blink:0.8,dy:6},tilt:0.1});
 if(a1>0&&a2<0)bubble(c,470,330,430,230,mm.head.x+70,mm.head.y-mm.HR-40,['НЕТ.'],120,back(a1/0.25));
 if(a2>0)bubble(c,330,290,700,270,mm.head.x+70,mm.head.y-mm.HR-40,['Я НЕ ЛЁША'],104,back(a2/0.28));
 c.restore()}
// ---------- всё зря ----------
function shotDrop(c,t,d,T,m){const k=ease(t/1.3),a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1,a3=m[3]!=null?t-m[3]:-1;c.save();cam(c,540,960,1.0+0.08*ease(t/d),0,0);
 sky(c,['#0a0f1c','#182236','#2a3850','#3c4a62'],H);fog(c,T,500,7,0.16,51);glow(c,-80,1010,800,'rgba(255,190,110,A)',0.3);
 const ghost=(txt,y,size,a,x0)=>{if(a<=0)return;c.save();c.globalAlpha=clamp(a/0.3)*0.9;c.font=`900 ${size}px M`;c.textAlign='center';c.textBaseline='middle';c.fillStyle='rgba(215,225,245,0.5)';c.fillText(txt,540,y);if(a3>0){const w=c.measureText(txt).width*clamp((a3-x0)/0.35);c.strokeStyle='#ff5a4f';c.lineWidth=16;c.lineCap='round';c.beginPath();c.moveTo(540-c.measureText(txt).width/2-10,y+4);c.lineTo(540-c.measureText(txt).width/2-10+w+20*clamp(w),y-6);c.stroke()}c.restore()};
 ghost('30 ЛЕТ',330,190,a1,0);ghost('11 000 НОЧЕЙ',530,112,a2,0.25);
 const mm=stick(c,{...OLD,x:600,y:2600,s:3.4,face:-1,t:T,noLegs:true,shadow:false,scarf:SCARF,rim:'rgba(255,205,140,0.55)',rimDir:-1,eyes:{sad:true,dy:lerp(0,22,k),blink:a3>0.5?0.7:0.15},pose:{lean:lerp(0,0.16,k),headTilt:lerp(-0.05,0.42,k),armL:[0.15,0.2],armR:[-0.1,0.1],bob:Math.sin(T*1.6)*4}});
 if(a2>0)tears(c,mm,-1,T,2);
 fog(c,T+20,1500,4,0.14,57);c.restore()}
// ---------- конверт ----------
function shotEnvelope(c,t,d,T){const k=back(t/0.6),sh=Math.sin(T*26)*5;c.save();cam(c,540,960,1.0+0.1*ease(t/d),0,0);
 sky(c,['#0a0f1c','#182236','#2a3850','#3c4a62'],H);fog(c,T,500,7,0.16,91);
 const ex=lerp(-400,540,k),ey=960;glow(c,ex,ey,760,'rgba(255,200,120,A)',0.4);
 c.lineCap='round';c.strokeStyle='#4f8a86';c.lineWidth=130;c.beginPath();c.moveTo(ex-760,ey+620);c.lineTo(ex-250,ey+90);c.stroke();
 const rx=lerp(1500,900,ease((t-0.9)/1.2));c.strokeStyle='#7389ad';c.beginPath();c.moveTo(rx+420+sh,ey+700);c.lineTo(rx+sh,ey+170);c.stroke();c.fillStyle='#7389ad';c.beginPath();c.arc(rx+sh,ey+170,70,0,7);c.fill();
 c.save();c.translate(ex,ey);c.rotate(-0.07+Math.sin(T*1.5)*0.015);
 c.fillStyle='rgba(0,0,0,0.35)';c.fillRect(-270,-166,560,360);const g=c.createLinearGradient(0,-180,0,180);g.addColorStop(0,'#f6eedb');g.addColorStop(1,'#d9cdb0');c.fillStyle=g;c.fillRect(-280,-180,560,360);
 c.strokeStyle='rgba(120,100,70,0.55)';c.lineWidth=5;c.beginPath();c.moveTo(-280,-180);c.lineTo(0,30);c.lineTo(280,-180);c.stroke();
 c.fillStyle='#a8433c';c.fillRect(170,-150,80,96);c.fillStyle='#f6eedb';c.fillRect(182,-138,56,72);lighthouse(c,210,-72,60,0);
 c.fillStyle='#2b3a66';c.font='900 110px M';c.textAlign='center';c.save();c.rotate(-0.04);c.fillText('ПАПЕ',-30,130);c.restore();
 c.strokeStyle='rgba(120,100,70,0.35)';c.lineWidth=4;for(let i=0;i<3;i++){c.beginPath();c.arc(-200+i*18,-110,26+i*10,0,7);c.stroke()}
 c.restore();
 c.fillStyle='#4f8a86';c.beginPath();c.arc(ex-250,ey+90,74,0,7);c.fill();
 fog(c,T+20,1550,4,0.14,97);c.restore()}
function shotLast(c,t,d,T){shotFace(c,t,d,T);bubble(c,50,250,800,330,60,690,['МЕНЯ ПРИСЛАЛ','ВАШ СЫН'],100,back((t-0.14)/0.28))}

function outro(c,T){const s=window.DATA.outro;if(T<s)return;bigText(c,'ЛЁША ЖИВ?',W/2,1360,128,'#ffd60a',0.7+0.3*back((T-s)/0.3),-0.02,24);if(T>s+0.4)bigText(c,'ЧАСТЬ 3 — СКОРО',W/2,1510,72,'#fff',0.7+0.3*back((T-s-0.4)/0.3),0,14)}
Object.assign(FN,{shotWake,shotCall,shotRowB,shotTeach,shotShout,shotNets,shotWave,shotBlack,shotFlare,shotLook,shotShake,shotDrop,shotEnvelope,shotLast});

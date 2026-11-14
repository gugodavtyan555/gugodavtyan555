// «Номер мамы», часть 5 (финал) — сцены. Подключается после shots_p4.js
function ecg(c,x,y,T){paper(c,'#10181d',()=>c.roundRect(x,y,280,200,18),14,7,0.3);c.fillStyle='#04120c';c.fillRect(x+16,y+16,248,140);c.save();c.strokeStyle='#39ff9a';c.lineWidth=5;c.lineJoin='round';c.shadowColor='#39ff9a';c.shadowBlur=14;c.beginPath();for(let i=0;i<=60;i++){const u=i/60,ph=((u*2.2-T*1.05)%1+1)%1;let v=0;if(ph>0.42&&ph<0.46)v=-14;else if(ph>=0.46&&ph<0.5)v=50;else if(ph>=0.5&&ph<0.54)v=-28;const px=x+20+u*240;i?c.lineTo(px,y+90-v):c.moveTo(px,y+90-v)}c.stroke();c.restore()}
function icu(c,T,o={}){const fy=1500;const wg=c.createLinearGradient(0,0,0,fy);wg.addColorStop(0,'#9fb8b4');wg.addColorStop(1,'#b9d0ca');c.fillStyle=wg;c.fillRect(-200,-200,W+400,fy+200);
 glow(c,420,420,900,'rgba(255,255,255,A)',0.55);paper(c,'#f7fbfd',()=>c.roundRect(300,260,240,50,24),10,5,0.25);
 const fg=c.createLinearGradient(0,fy,0,H);fg.addColorStop(0,'#86a8a2');fg.addColorStop(1,'#4c6662');c.save();sh(c,20,-8,0.25);c.fillStyle=fg;c.fillRect(-200,fy,W+400,H-fy+200);c.restore();
 paper(c,'#4c6662',()=>c.rect(864,860,12,640),4,2,0.3);ecg(c,740,640,T);
 paper(c,'#5f7a76',()=>{c.rect(120,1330,880,26);c.rect(140,1356,22,150);c.rect(960,1356,22,150);c.rect(120,1100,26,256)},14,7,0.3);paper(c,'#f3f6f8',()=>c.roundRect(146,1250,850,86,22),12,6,0.3);paper(c,'#fff',()=>c.roundRect(170,1170,260,100,40),10,5,0.25);
 const v=vera(c,{x:560,y:1290,s:1.1,face:-1,noLegs:true,expr:o.expr||{eyes:'closed',mouth:'flat'},pose:{lean:1.35,headTilt:0.1,armL:[0.3,0.2],armR:[0.2,0.1],bob:Math.sin(T*1.2)*2}});
 paper(c,'#8fb2c8',()=>{c.moveTo(430,1250);c.quadraticCurveTo(700,1190+Math.sin(T*1.2)*5,996,1250);c.lineTo(996,1336);c.lineTo(430,1336);c.closePath()},12,6,0.3);return v}
function scarfOn(c,m,f,s){c.save();sh(c,8,4,0.25);c.strokeStyle='#4f86c6';c.lineCap='round';c.lineWidth=44*s;c.beginPath();c.moveTo(m.shd.x-60*s,m.shd.y+6*s);c.lineTo(m.shd.x+60*s,m.shd.y+6*s);c.stroke();c.lineWidth=40*s;c.beginPath();c.moveTo(m.shd.x+f*30*s,m.shd.y+10*s);c.lineTo(m.shd.x+f*40*s,m.shd.y+130*s);c.stroke();c.restore();c.strokeStyle='#f6efe2';c.lineWidth=9*s;for(const k of [60,100]){c.beginPath();c.moveTo(m.shd.x+f*35*s-20*s,m.shd.y+k*s);c.lineTo(m.shd.x+f*35*s+22*s,m.shd.y+k*s);c.stroke()}}
function mask(c,d2){paper(c,'#bfe0e6',()=>c.roundRect(d2.head.x-10,d2.head.y+d2.HR*0.3,d2.HR*0.95,d2.HR*0.55,14),4,2,0.2)}

// 0-3: «Кто из вас Тима?»
function shotDoctorCall(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,540,1040,1.04+0.08*ease(t/d),0,0);hospP(c,T);
 paper(c,'#f4efe2',()=>c.rect(60,330,420,1190),14,7,0.3);glow(c,270,900,600,'rgba(255,240,210,A)',0.5);
 const dc=doll(c,{...DOC,x:280,y:1520,s:1.45,face:1,expr:{eyes:'open',mouth:(A(1)<0||A(2)>0)&&Math.sin(T*10)>0?'o':'flat',brow:0.3},pose:{armL:A(2)>0?[1.3,1.5]:[0.3,0.5]}});mask(c,dc);
 const st=A(1)>0?ease(A(1)/0.7):0;doll(c,{...BOY,x:lerp(760,620,st),y:1580,s:1.05,face:-1,expr:{eyes:'wide',mouth:'flat',brow:0.6},pose:st>0&&st<1?{legL:[Math.sin(T*9)*0.4,0],legR:[-Math.sin(T*9)*0.4,0]}:{}});const dd=doll(c,{...DAD,x:900,y:1590,s:1.35,face:-1,expr:{eyes:'wide',mouth:'flat'}});stubble(c,dd,-1);
 if(A(2)>0)bub(c,110,330,780,A(3)>0?380:250,dc.head.x+30,dc.head.y-dc.HR-30,A(3)>0?1:back(A(2)/0.3),()=>{txt(c,'Она зовёт вас.',500,A(3)>0?420:455,72);if(A(3)>0)txt(c,'Только недолго.',500,560,64,'#b3362e')});
 else if(A(1)<0)bub(c,150,330,700,300,dc.head.x+30,dc.head.y-dc.HR-30,back((t-0.14)/0.3),()=>{txt(c,'Кто из вас',500,430,76);txt(c,'Тима?',500,530,90,'#b3362e')});
 c.restore()}
// 4-6: под белой лампой
function shotICU(c,t,d,T){c.save();cam(c,480,1100,1.3-0.25*ease(t/d),0,0);icu(c,T);c.restore();c.fillStyle='rgba(40,60,80,0.12)';c.fillRect(0,0,W,H)}
// 7-9: «Уже восемь?»
function shotICUTalk(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,500,1120,1.18+0.08*ease(t/d),0,0);
 const v=icu(c,T,{expr:{eyes:'open',mouth:A(2)<0&&Math.sin(T*8)>0?'o':'smile',brow:0.3}});
 const b=doll(c,{...BOY,x:700,y:1560,s:1.05,face:-1,expr:{eyes:'open',mouth:A(2)>0&&Math.sin(T*10)>0?'o':'smile',brow:0.4,tear:T*0.3},pose:{armL:[1.3,1.6]}});
 if(A(2)>0)bub(c,330,640,640,230,b.head.x-20,b.head.y-b.HR-24,back(A(2)/0.3),()=>txt(c,'Уже восемь, бабушка.',650,756,50,'#2b6a3a'));
 else bub(c,100,700,520,A(1)>0?300:190,v.head.x+60,v.head.y-v.HR-10,A(1)>0?1:back((t-0.14)/0.3),()=>{txt(c,'Тимочка…',360,A(1)>0?780:796,64);if(A(1)>0)txt(c,'Уже восемь?',360,900,64,'#b3362e')});
 c.restore()}
// 10-13: шарф
function shotScarfBed(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,520,1120,1.18+0.08*ease(t/d),0,0);
 const v=icu(c,T,{expr:{eyes:'open',mouth:A(1)>0&&A(2)<0&&Math.sin(T*8)>0?'o':'smile',brow:-0.3,tear:T*0.3}});scarfP(c,560,1230,0.05,0.9);
 const b=doll(c,{...BOY,x:760,y:1560,s:1.05,face:-1,expr:{eyes:'open',mouth:A(2)>0&&Math.sin(T*10)>0?'o':'smile',brow:0.5},pose:{armL:[1.3,1.6]}});
 if(A(2)>0)bub(c,300,560,700,A(3)>0?400:230,b.head.x-20,b.head.y-b.HR-24,A(3)>0?1:back(A(2)/0.3),()=>{txt(c,'Довяжете дома.',650,A(3)>0?650:676,58,'#2b6a3a');if(A(3)>0)lines(c,['Вы обещали научить','меня печь пирог.'],650,770,50,74)});
 else if(A(1)>0)bub(c,100,740,600,200,v.head.x+60,v.head.y-v.HR-10,back(A(1)/0.3),()=>txt(c,'Я не успела довязать…',400,842,46));
 c.restore()}
// 14-15: впервые увидели друг друга
function shotMeet(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1;c.save();cam(c,540,960,1.0+0.05*ease(t/d),0,0);
 c.save();c.beginPath();c.rect(0,0,W,940);c.clip();c.fillStyle='#b9d0ca';c.fillRect(0,0,W,940);glow(c,540,300,800,'rgba(255,255,255,A)',0.5);vera(c,{x:520,y:1180,s:2.3,face:1,noLegs:true,expr:{eyes:'open',mouth:'smile',brow:0.4,tear:T*0.3},pose:{headTilt:0.06}});c.restore();
 c.save();c.beginPath();c.rect(0,980,W,H);c.clip();c.fillStyle='#a3c4bc';c.fillRect(0,980,W,H);glow(c,540,1300,800,'rgba(255,255,255,A)',0.4);if(a1>0){const b=doll(c,{...BOY,x:560,y:1900,s:2.3,face:-1,noLegs:true,expr:{eyes:'open',mouth:'smile',brow:0.5,tear:T*0.35},pose:{headTilt:0.06}})}c.restore();
 paper(c,'#fbf4e4',()=>c.rect(-50,940,W+100,40),16,8,0.35);
 for(let i=0;i<3;i++){const q=((T*0.5+i/3)%1);c.save();c.globalAlpha=Math.sin(q*Math.PI);c.translate(840+Math.sin(i*2+T)*40,620-q*220);paper(c,'#ff8a96',()=>{c.moveTo(0,30);c.bezierCurveTo(-70,-20,-40,-70,0,-34);c.bezierCurveTo(40,-70,70,-20,0,30)},8,4,0.25);c.restore()}
 c.restore()}
// 16-20: врач и папа
function shotDoctorDad(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,540,1040,1.06+0.08*ease(t/d),0,0);hospP(c,T);
 const dc=doll(c,{...DOC,x:330,y:1540,s:1.45,face:1,expr:{eyes:'open',mouth:A(1)>0&&Math.sin(T*10)>0?'o':'flat',brow:-0.5},pose:{armL:[0.9,1.6]}});mask(c,dc);
 const dd=doll(c,{...DAD,x:760,y:1550,s:1.4,face:-1,expr:{eyes:A(4)>0?'closed':'open',mouth:'sad',brow:-0.9},pose:{headTilt:A(4)>0?0.2:0}});stubble(c,dd,-1);
 const L=[];if(A(1)>0)L.push('Сердце слабое.');if(A(2)>0)L.push('Одной ей жить нельзя.');if(A(3)>0)L.push('Родных нет.');if(A(4)>0)L.push('Остаётся дом престарелых.');
 if(L.length)bub(c,90,300-L.length*10,820,130+L.length*100,dc.head.x+30,dc.head.y-dc.HR-30,1,()=>L.forEach((l,i)=>txt(c,l,500,370-L.length*10+i*100,i==3?50:56,i>=2?'#b3362e':'#3a2d3d')));
 c.restore()}
// 21-23: через стекло
function shotThroughGlass(c,t,d,T,m){const a2=m[2]!=null&&t>m[2];c.save();cam(c,540,1060,1.04+0.1*ease(t/d),0,0);
 c.save();c.beginPath();c.roundRect(110,420,860,900,30);c.clip();c.translate(-60,-280);c.scale(1.15,1.15);icu(c,T,{expr:{eyes:'closed',mouth:'smile',brow:0.3}});doll(c,{...BOY,x:720,y:1560,s:1.05,face:-1,expr:{eyes:a2?'closed':'open',mouth:Math.sin(T*10)>0?'o':'smile',brow:0.6},pose:{armL:[1.5,1.6],bob:a2?Math.abs(Math.sin(T*11))*-8:0}});c.restore();
 c.fillStyle='rgba(210,235,240,0.18)';c.fillRect(110,420,860,900);paper(c,'rgba(0,0,0,0)',()=>{},0,0,0);c.strokeStyle='#5f8a84';c.lineWidth=30;c.beginPath();c.roundRect(110,420,860,900,30);c.stroke();
 c.fillStyle='#a3c4bc';c.fillRect(-200,-200,W+400,605);c.fillRect(-200,1335,W+400,900);c.fillRect(-200,400,295,950);c.fillRect(985,400,400,950);
 const dd=doll(c,{...DAD,x:800,y:1900,s:1.9,face:-1,noLegs:true,expr:{eyes:'closed',mouth:'smile',brow:-0.3,tear:T*0.3},pose:{headTilt:0.06}});stubble(c,dd,-1);c.restore()}
function shotDadRelatives(c,t,d,T){c.save();cam(c,540,930,1.0+0.1*ease(t/d),0,0);hospBlur(c,T);const dd=dadClose(c,T,{phone:false,expr:{eyes:'open',mouth:Math.sin(T*10)>0?'o':'smile',brow:0.3,tear:T*0.3}});
 bub(c,130,180,820,300,dd.head.x+80,dd.head.y-dd.HR-40,back((t-0.14)/0.3),()=>txt(c,'У неё есть родные.',540,330,70,'#2b6a3a'));c.restore()}
// 25-27: выписали
function shotDischarge(c,t,d,T,m){const ph=T*5;c.save();cam(c,540,1040,1.04+0.06*ease(t/d),0,0);
 const sg=c.createLinearGradient(0,0,0,1400);sg.addColorStop(0,'#7fb8e0');sg.addColorStop(1,'#e9f0e0');c.fillStyle=sg;c.fillRect(-200,-200,W+400,1700);
 paper(c,'#e9eef0',()=>c.rect(-100,300,700,1110),24,12,0.3);for(let f=0;f<5;f++)for(let i=0;i<4;i++)paper(c,'#9fc4d8',()=>c.roundRect(-40+i*150,380+f*190,100,120,8),4,2,0.2);paper(c,'#e0403a',()=>{c.rect(232,180,36,110);c.rect(195,217,110,36)},6,3,0.25);
 paper(c,'#7fae6a',()=>c.rect(-200,1410,W+400,700),16,-8,0.3);paper(c,'#c9c2b4',()=>c.rect(-200,1480,W+400,180),6,3,0.2);
 for(const [x,h] of [[760,300],[960,360]]){paper(c,'#8a5d4a',()=>c.rect(x-12,1410-h,24,h),6,3,0.25);paper(c,'#5f9a5a',()=>c.arc(x,1410-h,120,0,7),14,7,0.3)}
 const x0=lerp(260,560,t/d),wk=a=>({legL:[Math.sin(ph+a)*0.35,Math.sin(ph+a)*0.35-0.2],legR:[-Math.sin(ph+a)*0.35,-Math.sin(ph+a)*0.35-0.2]});
 const dd=doll(c,{...DAD,x:x0-200,y:1440,s:1.3,face:1,expr:{eyes:'open',mouth:'smile'},pose:{...wk(0),armL:[0.2,0.3]}});stubble(c,dd,1);paper(c,'#8a6a9a',()=>c.roundRect(dd.hf.x-50,dd.hf.y+6,100,80,14),8,4,0.3);
 const v=vera(c,{x:x0,y:1450,s:1.15,face:1,expr:{eyes:'closed',mouth:'smile'},pose:{...wk(1.5),lean:0.08,armL:[0.5,0.7]}});c.strokeStyle='#6a4a3c';c.lineWidth=12;c.lineCap='round';c.beginPath();c.moveTo(v.hf.x,v.hf.y);c.lineTo(v.hf.x+30,1480);c.stroke();
 const b=doll(c,{...BOY,x:x0+190,y:1460,s:1.0,face:1,expr:{eyes:'closed',mouth:'smile'},pose:{...wk(3),armL:[0.2,0.3]}});paper(c,'#d9a441',()=>c.roundRect(b.hf.x-56,b.hf.y+6,112,84,16),8,4,0.3);paper(c,'#8a8792',()=>{c.arc(b.hf.x,b.hf.y+52,24,0,7)},0,0,0);c.strokeStyle='#5a4a2a';c.lineWidth=5;for(let i=-2;i<3;i++){c.beginPath();c.moveTo(b.hf.x+i*20,b.hf.y+10);c.lineTo(b.hf.x+i*20,b.hf.y+86);c.stroke()}
 c.restore()}
// кухня втроём
function three(c,T,o={}){kitchen(c,T,!!o.night);glow(c,540,700,800,'rgba(255,210,150,A)',0.4);paper(c,'#6a4a3c',()=>c.rect(532,-100,16,420),6,3,0.3);paper(c,'#ffe3a6',()=>{c.moveTo(450,300);c.lineTo(630,300);c.lineTo(690,430);c.lineTo(390,430);c.closePath()},18,9,0.3);
 if(o.clock)clockP(c,180,700,100,20,0);chairP(c,540,false);
 const e=o.expr||{eyes:'closed',mouth:'smile',brow:0.4};
 const v=vera(c,{x:540,y:1330,s:1.15,face:o.vf||1,noLegs:true,expr:o.ve||e,pose:{armL:o.va||[1.0,1.5],armR:[0.8,1.4],bob:Math.sin(T*2)*2}});
 const dd=doll(c,{...DAD,x:230,y:1340,s:1.35,face:1,noLegs:true,expr:o.de||e,pose:{lean:0.06,armL:[1.0,1.5+Math.sin(T*3)*0.1],armR:[0.8,1.4]}});stubble(c,dd,1);
 const b=doll(c,{...BOY,x:860,y:1330,s:1.0,face:-1,noLegs:true,expr:o.be||e,pose:{lean:0.06,armL:[1.0,1.5-Math.sin(T*3)*0.1],armR:[0.8,1.4],bob:Math.sin(T*6)*2}});if(o.scarf)scarfOn(c,b,-1,1.0);
 tableP(c,false);if(o.plates!==false)for(const x of [330,540,760]){paper(c,'#f6efe2',()=>c.ellipse(x,1244,78,20,0,0,7),8,4,0.3);paper(c,'#e2c08a',()=>c.ellipse(x,1238,52,11,0,0,7),0,0,0)}
 return{v,dd,b}}
function shotThreePlates(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,z=ease(Math.max(0,a1)/1.2);c.save();cam(c,540,lerp(1060,1100,z),1.04+0.2*z,0,0);three(c,T);c.restore();
 if(a1<0)bigText(c,'3',W/2,280,220,'#ffd60a',0.7+0.3*back((t-0.6)/0.3),0,28)}
// 30: шарф к первому снегу
function shotSnowScarf(c,t,d,T){c.save();cam(c,560,900,1.0+0.1*ease(t/d),0,0);closeBg(c,T,0.18);const b=doll(c,{...BOY,top:'#d98a4a',topDark:'#c0763a',stripe:null,x:560,y:1560,s:2.5,face:1,noLegs:true,expr:{eyes:'closed',mouth:'smile',brow:0.5},pose:{lean:0.03,headTilt:0.08,armL:[0.2,0.4],armR:[0.2,0.5],bob:Math.sin(T*1.5)*4}});scarfOn(c,b,1,2.5);
 const r=rng(14);c.fillStyle='rgba(255,255,255,0.9)';for(let i=0;i<70;i++){const sp=180+r()*220,x=(r()*1300+Math.sin(T*1.4+i)*40)%1300-100,y=(r()*2000+T*sp)%2000-40;c.beginPath();c.arc(x,y,4+r()*7,0,7);c.fill()}c.restore()}
// 31-36: запись
function shotBirthday(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,540,1060,1.04+0.1*ease(t/d),0,0);
 const r=three(c,T,{plates:false,expr:{eyes:'open',mouth:'smile',brow:0.2},ve:{eyes:'open',mouth:'smile',brow:0.3},va:[1.3,1.7],be:{eyes:A(3)>0?'closed':'wide',mouth:A(3)>0?'smile':'o',brow:0.8,tear:A(3)>0?T*0.4:0},de:{eyes:A(3)>0?'closed':'open',mouth:'smile',brow:-0.3,tear:A(3)>0?T*0.4:0}});
 paper(c,'#f3e6cf',()=>c.roundRect(300,1130,90,116,8),10,5,0.3);c.save();c.beginPath();c.rect(308,1138,74,100);c.clip();mom(c,345,1196,44);c.restore();
 paper(c,'#f6c9d0',()=>c.roundRect(690,1176,130,70,12),10,5,0.3);paper(c,'#fff',()=>c.rect(690,1176,130,18),0,0,0);paper(c,'#ffd60a',()=>c.rect(750,1130,10,46),2,1,0.2);glow(c,755,1118,70,'rgba(255,200,90,A)',0.9);
 phoneMini(c,r.v.hf.x+10,r.v.hf.y-30,0,1.2,A(1)>0?0.8:0.3);
 if(A(3)>0)bub(c,90,300,900,440,r.v.hf.x+10,r.v.hf.y-120,back(A(3)/0.3),()=>{mom(c,210,400,66);const L=['«Привет!'];if(A(4)>0)L[0]='«Привет! Это мама.';if(A(5)>0){L.push('Я обязательно');L.push('перезвоню».')}L.forEach((l,i)=>txt(c,l,300,380+i*74,i==0?52:48,'#3a2d3d','left'));wave(c,150,650,36,T,'#c96a7a',60)});
 c.restore()}
// 37-39: слушали втроём
function shotThreeListen(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,p=clamp(t/(m[1]||2));c.save();cam(c,540,1000,1.0+0.08*ease(t/d),0,0);
 c.save();c.filter='blur(9px)';c.translate(-300,-500);c.scale(1.6,1.6);kitchen(c,T,false);c.restore();c.fillStyle='rgba(60,40,30,0.3)';c.fillRect(-200,-200,W+400,H+400);glow(c,540,1300,800,'rgba(150,200,255,A)',0.35);
 const e=k=>({eyes:'closed',mouth:'smile',brow:-0.4,tear:T*0.4+k});
 const dd=doll(c,{...DAD,x:250,y:1700,s:1.9,face:1,noLegs:true,expr:e(0),pose:{lean:0.16,headTilt:0.1}});stubble(c,dd,1);
 doll(c,{...BOY,x:850,y:1700,s:1.6,face:-1,noLegs:true,expr:e(0.3),pose:{lean:0.16,headTilt:0.1}});
 const v=vera(c,{x:545,y:1760,s:1.8,face:1,noLegs:true,expr:e(0.6),pose:{armL:[1.4,2.4],armR:[1.2,2.2]}});phoneMini(c,545,1380,0,2.0,0.8);
 c.strokeStyle='rgba(255,255,255,0.2)';c.lineWidth=30;c.beginPath();c.arc(540,470,230,0,7);c.stroke();c.save();sh(c,12,6,0.3);c.strokeStyle='#ffd60a';c.lineCap='round';c.lineWidth=30;c.beginPath();c.arc(540,470,230,-Math.PI/2,-Math.PI/2+p*Math.PI*2);c.stroke();c.restore();mom(c,540,470,165);
 c.restore();bigText(c,String(Math.max(1,Math.ceil(p*11))),870,470,150,'#ffd60a',1,0,22)}
// 40-41: в восемь ужинают
function shotDinner8(c,t,d,T,m){c.save();cam(c,540,1060,1.04+0.1*ease(t/d),0,0);const tk=Math.sin(T*11)>0;three(c,T,{clock:true,be:{eyes:'closed',mouth:tk?'o':'smile',brow:0.7},ve:{eyes:'closed',mouth:tk?'smile':'o',brow:0.5},de:{eyes:'closed',mouth:'smile',brow:0.5}});
 c.restore();bigText(c,'20:00',W/2,260,150,'#ffd60a',0.7+0.3*back(t/0.3),-0.02,24)}
// 42-43: финальная фраза
function shotFinalLine(c,t,d,T){c.save();cam(c,540,960,1.25-0.2*ease(t/d),0,0);
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#141a33');g.addColorStop(1,'#3a4672');c.fillStyle=g;c.fillRect(-200,-200,W+400,H+400);c.fillStyle='#fff';const q=rng(3);for(let i=0;i<50;i++){c.globalAlpha=0.3+0.7*Math.abs(Math.sin(T+i));c.fillRect(q()*W,q()*700,5,5)}c.globalAlpha=1;
 paper(c,'#4a5376',()=>c.rect(130,300,820,1800),30,14,0.4);
 for(let f=0;f<4;f++)for(let i=0;i<3;i++){const x=200+i*250,y=420+f*330,lit=f==1&&i==1;if(!lit)paper(c,'#2f3654',()=>c.roundRect(x,y,180,220,10),6,3,0.25)}
 glow(c,540,860,460,'rgba(255,200,120,A)',0.7);paper(c,'#ffd98a',()=>c.roundRect(400,700,280,320,12),8,4,0.25);
 c.save();c.beginPath();c.rect(400,700,280,320);c.clip();c.fillStyle='#3a2d3d';[[470,960,46],[540,940,40],[612,972,34]].forEach(([x,y,r2])=>{c.beginPath();c.arc(x,y,r2,0,7);c.fill();c.fillRect(x-r2,y+r2*0.6,r2*2,120)});c.restore();c.fillStyle='#4a5376';c.fillRect(535,700,10,320);
 const r=rng(14);c.fillStyle='rgba(255,255,255,0.85)';for(let i=0;i<80;i++){const sp=140+r()*200,x=(r()*1300+Math.sin(T*1.4+i)*40)%1300-100,y=(r()*2000+T*sp)%2000-40;c.beginPath();c.arc(x,y,3+r()*6,0,7);c.fill()}
 c.restore()}

function hook(c,T){const a=1-ease((T-2.3)/0.25);if(a<=0)return;c.save();c.globalAlpha=a;bigText(c,'ЧАСТЬ 5',W/2,1700,150,'#ffd60a',0.7+0.3*back(T/0.3),-0.03,26);if(T>0.25)bigText(c,'ФИНАЛ',W/2,1820,80,'#fff',0.7+0.3*back((T-0.25)/0.3),0,16);c.restore()}
function outro(c,T){const s=window.DATA.outro;if(T<s)return;bigText(c,'КОНЕЦ',W/2,230,150,'#ffd60a',0.7+0.3*back((T-s)/0.3),-0.02,26);if(T>s+0.5)bigText(c,'ПОДПИШИСЬ — НОВАЯ ИСТОРИЯ СКОРО',W/2,370,46,'#fff',0.7+0.3*back((T-s-0.5)/0.3),0,11)}
Object.assign(FN,{shotDoctorCall,shotICU,shotICUTalk,shotScarfBed,shotMeet,shotDoctorDad,shotThroughGlass,shotDadRelatives,shotDischarge,shotThreePlates,shotSnowScarf,shotBirthday,shotThreeListen,shotDinner8,shotFinalLine});

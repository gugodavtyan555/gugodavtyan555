// «Номер мамы», часть 4 — сцены. Подключается после shots_p3.js
const NEIGH={skin:'#f0cdb0',hair:'#b98a6a',bun:true,top:'#c9843a',topDark:'#b07030',bot:'#5a4a5a',botDark:'#4a3c4a',shoe:'#8a5d4a'};
const NURSE={skin:'#f2c9a4',hair:'#6b4032',hairBack:true,top:'#7fc0c8',topDark:'#6aa9b2',bot:'#7fc0c8',botDark:'#6aa9b2',shoe:'#f4efe6'};
const DOC={skin:'#eebf98',hair:'#55504c',top:'#f3f6f8',topDark:'#dfe6ea',bot:'#5a7a8a',botDark:'#4c6a78',shoe:'#3a3038'};
function hospP(c,T,fy=1500){const wg=c.createLinearGradient(0,0,0,fy);wg.addColorStop(0,'#c9ded8');wg.addColorStop(1,'#a3c4bc');c.fillStyle=wg;c.fillRect(-200,-200,W+400,fy+200);paper(c,'#7fb0a8',()=>c.rect(-200,1080,W+400,40),6,3,0.2);
 for(const x of [200,760]){paper(c,'#f7fbfd',()=>c.roundRect(x,230,240,40,20),10,5,0.2);glow(c,x+120,270,300,'rgba(255,255,255,A)',0.35)}
 const fg=c.createLinearGradient(0,fy,0,H);fg.addColorStop(0,'#86a8a2');fg.addColorStop(1,'#4c6662');c.save();sh(c,20,-8,0.25);c.fillStyle=fg;c.fillRect(-200,fy,W+400,H-fy+200);c.restore()}
function hospBlur(c,T){c.save();c.filter='blur(9px)';c.translate(-300,-500);c.scale(1.6,1.6);hospP(c,T);c.restore();c.fillStyle='rgba(30,50,60,0.2)';c.fillRect(-200,-200,W+400,H+400)}
function scarfP(c,x,y,rot,s){c.save();c.translate(x,y);c.rotate(rot);c.scale(s,s);c.strokeStyle='#d8d2c2';c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(-90,-40);c.lineTo(40,0);c.moveTo(-80,10);c.lineTo(50,-30);c.stroke();c.save();sh(c,10,5,0.25);c.strokeStyle='#4f86c6';c.lineWidth=64;c.lineJoin='round';c.beginPath();c.moveTo(-30,0);c.lineTo(40,36);c.lineTo(150,30);c.lineTo(250,60);c.stroke();c.restore();c.strokeStyle='#f6efe2';c.lineWidth=12;for(const xx of [30,120,210]){c.beginPath();c.moveTo(xx,0);c.lineTo(xx+6,64);c.stroke()}c.restore()}

// 0-3: не взяла трубку
function shotEmptyRing(c,t,d,T,m){const A=i=>m[i]!=null&&t>m[i],day=A(3);c.save();cam(c,520,1040,1.05+0.1*ease(t/d),0,0);veraRoom(c,T,{ring:!day,dark:day?0.1:0.4,hh:A(2)?21:20,mm:day?30:0,noLamp:day});catP(c,300,1590,T);scarfP(c,700,1560,0.3,1);c.restore();
 const lab=day?'ДЕНЬ 2':A(2)?'21:00':A(1)?'20:00':null;if(lab){const i=day?3:A(2)?2:1;bigText(c,lab,W/2,260,150,'#ffd60a',0.7+0.3*back((t-m[i])/0.3),-0.02,24)}}
// 4-6: не спал
function shotBoyNight(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1;c.save();cam(c,480,1040,1.1+0.1*ease(t/d),0,0);nightRoom(c,T);
 const b=doll(c,{...BOY,x:440,y:1262,s:1.0,face:1,expr:{eyes:'open',mouth:'sad',brow:-1,tear:a2>0?a2*0.4:0},pose:{lean:0.12,headTilt:0.1,legL:[1.9,0.4],legR:[1.8,0.5],armL:[1.4,1.0],armR:[1.2,0.8]}});
 if(a1>0)bub(c,150,330,760,a2>0?420:260,b.head.x+30,b.head.y-b.HR-24,a2>0?1:back(a1/0.3),()=>{lines(c,['А вдруг она','тоже ушла?'],530,a2>0?420:440,62,84);if(a2>0){c.save();c.globalAlpha=0.6;mom(c,380,640,60);c.restore();txt(c,'Как мама.',620,640,62,'#b3362e')}});c.restore()}
// 7-8: мы её найдём
function shotDadPromise(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1;c.save();cam(c,460,1040,1.14+0.08*ease(t/d),0,0);nightRoom(c,T);
 const r=bedDuo(c,T,{hug:0.5,de:{eyes:'open',mouth:a1>0&&Math.sin(T*10)>0?'o':'flat',brow:0.2},be:{eyes:'open',mouth:'sad',brow:-0.8}});
 if(a1>0)bub(c,150,360,600,230,r.dd.head.x+40,r.dd.head.y-r.dd.HR-30,back(a1/0.3),()=>txt(c,'Мы её найдём.',450,476,62));c.restore()}
// 9-11: адреса нет
function shotOperator(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1;c.save();cam(c,540,960,1.0+0.06*ease(t/d),0,0);
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#3a4668');g.addColorStop(1,'#1c2238');c.fillStyle=g;c.fillRect(-200,-200,W+400,H+400);
 c.save();c.translate(540,640);c.rotate(-0.04);paper(c,'#fbf4e4',()=>c.roundRect(-380,-250,760,500,40),34,18,0.4);txt(c,'АБОНЕНТ',0,-180,50,'#8a8478');txt(c,'Адрес:',-200,-70,60,'#3a2d3d');txt(c,'? ? ?',120,-70,90,'#b3362e');if(a1>0){txt(c,'Телефон:',-170,70,60,'#3a2d3d');txt(c,'8 900 555 14 08',0,170,62,'#5a4d58')}c.restore();
 if(a2>0){const k=back(a2/0.3);const o=doll(c,{skin:'#f2c9a4',hair:'#3a2a24',top:'#8a6a9a',bot:'#4a4458',x:540,y:1900,s:1.7,face:1,noLegs:true,expr:{eyes:'closed',mouth:'flat'},pose:{headTilt:Math.sin(T*9)*0.12}});c.strokeStyle='#2a2630';c.lineWidth=14;c.beginPath();c.arc(o.head.x,o.head.y,o.HR*1.08,Math.PI*1.1,Math.PI*1.9);c.stroke();paper(c,'#2a2630',()=>c.roundRect(o.head.x+o.HR*0.9,o.head.y-10,40,70,14),6,3,0.3);
  c.save();c.translate(540,1080);c.rotate(-0.12);c.scale(k,k);c.strokeStyle='#d0403a';c.lineWidth=12;c.strokeRect(-380,-64,760,128);txt(c,'НЕ РАЗГЛАШАЕТСЯ',0,6,70,'#d0403a');c.restore()}
 c.restore()}
// 12-15: тетрадь
function notebookP(c,T,draw){paper(c,'#b98464',()=>c.rect(-200,-200,W+400,H+400),0,0,0);c.save();c.translate(540,940);c.rotate(-0.03);paper(c,'#c96a7a',()=>c.roundRect(-450,-640,900,1300,24),40,20,0.4);paper(c,'#fbf6ea',()=>c.roundRect(-420,-610,840,1240,12),10,5,0.25);
 c.strokeStyle='rgba(80,110,160,0.3)';c.lineWidth=3;for(let i=0;i<13;i++){c.beginPath();c.moveTo(-380,-470+i*86);c.lineTo(380,-470+i*86);c.stroke()}c.strokeStyle='rgba(208,64,58,0.45)';c.beginPath();c.moveTo(-300,-610);c.lineTo(-300,630);c.stroke();draw();c.restore()}
function hand(c,x,y,rot){c.save();c.translate(x,y);c.rotate(rot);c.save();sh(c,20,10,0.35);c.strokeStyle='#4f86c6';c.lineWidth=150;c.lineCap='round';c.beginPath();c.moveTo(60,700);c.lineTo(20,300);c.stroke();c.restore();paper(c,'#f2c9a4',()=>c.ellipse(0,200,80,110,0,0,7),14,7,0.3);c.restore()}
function shotNotebook(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,540,960,1.0+0.06*ease(t/d),0,0);
 const L=['пн — печёт пирог','вт — кот Василий','ср — трамвай за окном','чт — хлеб с тмином','пт — пятый этаж','сб — вяжет шарф','вс — ждёт с шести'],n=Math.min(L.length,1+Math.floor(Math.max(0,A(1))/0.38));
 notebookP(c,T,()=>{c.save();c.transform(1,0,-0.14,1,0,0);txt(c,'Бабушка Вера',40,-540,62,'#2b3a66');for(let i=0;i<(A(1)>0?n:0);i++)txt(c,L[i],-230,-420+i*86,44,'#2b3a66','left');c.restore();
  if(A(3)>0){const k=back(A(3)/0.3);c.save();c.translate(60,420);c.scale(k,k);c.globalAlpha=0.55;mom(c,-220,0,70);c.globalAlpha=1;wave(c,-110,0,18,T,'rgba(201,106,122,'+(0.9-0.6*clamp(A(3)/2))+')',70*(1-0.7*clamp(A(3)/2)));c.restore()}});
 hand(c,900,1300,-0.3);c.restore()}
// 16-19: приметы
function shotClues(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,540,960,1.0+0.05*ease(t/d),0,0);
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#3a5564');g.addColorStop(1,'#507282');c.fillStyle=g;c.fillRect(-200,-200,W+400,H+400);
 const C=[[300,520,-0.06,()=>{paper(c,'#4a5376',()=>c.rect(-60,-100,120,200),6,3,0.2);for(let f=0;f<5;f++)for(let i=0;i<2;i++){const lit=f==0&&i==1;c.fillStyle=lit?'#ffd98a':'#2f3654';c.fillRect(-42+i*50,-84+f*38,34,26)}}],
  [780,520,0.05,()=>{paper(c,'#d0403a',()=>c.roundRect(-110,-40,220,90,20),6,3,0.2);c.fillStyle='#fbf4e4';for(let i=0;i<4;i++)c.fillRect(-94+i*50,-24,36,34);c.fillStyle='#2a2630';c.beginPath();c.arc(-60,58,18,0,7);c.arc(60,58,18,0,7);c.fill();c.strokeStyle='#2a2630';c.lineWidth=5;c.beginPath();c.moveTo(-20,-40);c.lineTo(10,-90);c.lineTo(60,-90);c.stroke()}],
  [300,980,0.05,()=>{paper(c,'#d9a441',()=>c.ellipse(0,20,104,60,0,0,7),8,4,0.25);c.strokeStyle='#b5842f';c.lineWidth=8;for(let i=-2;i<3;i++){c.beginPath();c.moveTo(i*34-14,-20);c.lineTo(i*34+14,40);c.stroke()}c.fillStyle='#5a4a2a';for(let i=0;i<9;i++){c.beginPath();c.ellipse(-70+i*18,16+Math.sin(i*2)*20,3,7,i,0,7);c.fill()}}],
  [780,980,-0.05,()=>{c.save();c.translate(-40,30);c.scale(0.9,0.9);paper(c,'#8a8792',()=>{c.ellipse(0,0,90,44,0,0,7);c.arc(80,-22,36,0,7);c.moveTo(56,-50);c.lineTo(62,-84);c.lineTo(84,-56);c.moveTo(92,-56);c.lineTo(112,-82);c.lineTo(110,-44)},6,3,0.25);c.restore()}]];
 const N=['5 ЭТАЖ','ТРАМВАЙ','ХЛЕБ С ТМИНОМ','КОТ ВАСИЛИЙ'];
 C.forEach(([x,y,r,dr],i)=>{const a=A(i);if(a>(i==0?-1:0)){card(c,x,y,r,back(Math.max(0.01,a+ (i==0?0.14:0))/0.3)*1.35,dr);c.save();c.globalAlpha=clamp((a+0.14)/0.3);bigText(c,N[i],x,y+235,i==2?46:56,'#ffd60a',1,0,12);c.restore()}});c.restore()}
// 20-25: объехали весь город
function shotSearch(c,t,d,T,m){const A=i=>m[i]!=null&&t>m[i],n=A(5)?7:A(4)?2:A(3)?1:0,bob=Math.sin(T*22)*3;c.save();cam(c,540,1000,1.04,0,0);
 const sg=c.createLinearGradient(0,0,0,1300);sg.addColorStop(0,'#6fa3c7');sg.addColorStop(1,'#f3d9b5');c.fillStyle=sg;c.fillRect(-200,-200,W+400,1500);
 [['#b9a78f',0.35,3],['#c9b79c',0.7,7]].forEach(([col,sp,sd],li)=>{const r=rng(sd);for(let i=0;i<9;i++){const w=160+r()*120,hh=380+r()*300,x=((i*330-T*420*sp)%2970+2970)%2970-400;paper(c,col,()=>c.rect(x,1300-hh,w,hh),12,6,0.25);c.fillStyle='#4a6a84';for(let yy=1300-hh+40;yy<1220;yy+=90)for(let xx=x+26;xx<x+w-40;xx+=64)c.fillRect(xx,yy,30,44);
   if(li==1&&i%3==0){paper(c,'#d9843a',()=>c.roundRect(x+10,1180,w-20,120,10),6,3,0.25);txt(c,'БУЛОЧНАЯ',x+w/2,1214,26,'#fff')}}});
 paper(c,'#5a5a66',()=>c.rect(-200,1300,W+400,800),16,-8,0.3);c.fillStyle='#e9e1c6';for(let i=0;i<6;i++){const x=W+200-((T*1100+i*300)%1800);c.fillRect(x,1470,150,14)}
 const cy=1180+bob;paper(c,'#5f8a6b',()=>{c.roundRect(250,cy,620,150,40);c.moveTo(360,cy+10);c.lineTo(430,cy-110);c.lineTo(700,cy-110);c.lineTo(780,cy+10);c.closePath()},18,9,0.35);
 c.fillStyle='#cfe6f0';c.beginPath();c.moveTo(390,cy+4);c.lineTo(444,cy-92);c.lineTo(560,cy-92);c.lineTo(560,cy+4);c.fill();c.beginPath();c.moveTo(580,cy+4);c.lineTo(580,cy-92);c.lineTo(690,cy-92);c.lineTo(752,cy+4);c.fill();
 c.save();c.beginPath();c.rect(580,cy-92,170,96);c.clip();const dd=doll(c,{...DAD,x:650,y:cy+130,s:0.55,face:1,noLegs:true});c.restore();c.save();c.beginPath();c.rect(390,cy-92,170,96);c.clip();doll(c,{...BOY,x:480,y:cy+110,s:0.5,face:1,noLegs:true,expr:{eyes:'wide',mouth:'flat'}});c.restore();
 for(const wx of [370,750]){paper(c,'#22222a',()=>c.arc(wx,cy+150,56,0,7),8,4,0.3);c.strokeStyle='#888';c.lineWidth=8;c.beginPath();c.moveTo(wx,cy+150);c.lineTo(wx+Math.cos(T*20)*44,cy+150+Math.sin(T*20)*44);c.stroke()}
 c.restore();if(n>0){bigText(c,String(n),W/2,280,220,'#ffd60a',1+0.05*Math.sin(T*16),0,28);bigText(c,n==1?'БУЛОЧНАЯ':'БУЛОЧНЫХ',W/2,440,70,'#fff',1,0,14)}}
// 26: нашли
function shotFound(c,t,d,T){c.save();cam(c,540,1000,1.0+0.08*ease(t/d),0,0);
 const sg=c.createLinearGradient(0,0,0,1400);sg.addColorStop(0,'#5a4a8a');sg.addColorStop(0.6,'#d2707c');sg.addColorStop(1,'#f8b66a');c.fillStyle=sg;c.fillRect(-200,-200,W+400,1700);
 paper(c,'#4a5376',()=>c.rect(330,150,560,1260),30,14,0.4);for(let fl=0;fl<6;fl++)for(let i=0;i<4;i++){const x=375+i*125,y=1000-fl*150,lit=fl==4&&i==2;if(lit)glow(c,x+42,y+50,170,'rgba(255,200,120,A)',0.6);paper(c,lit?'#ffd98a':'#2f3654',()=>c.roundRect(x,y,84,100,8),6,3,0.25)}
 paper(c,'#d9843a',()=>c.roundRect(350,1150,520,260,14),14,7,0.3);paper(c,'#fbf4e4',()=>c.roundRect(390,1170,440,80,12),6,3,0.2);txt(c,'БУЛОЧНАЯ',610,1212,58,'#b5642a');paper(c,'#ffd98a',()=>c.roundRect(400,1280,180,130,8),6,3,0.2);paper(c,'#7a4a36',()=>c.roundRect(650,1270,130,140,8),6,3,0.2);
 c.save();c.strokeStyle='rgba(255,240,210,0.8)';c.lineWidth=10;c.lineCap='round';for(let i=0;i<3;i++){const k=((T*0.5+i/3)%1);c.globalAlpha=Math.sin(k*Math.PI);c.beginPath();for(let j=0;j<=8;j++){const y=1160-k*200-j*18,x=470+i*80+Math.sin(j*0.9+T*3)*16;j?c.lineTo(x,y):c.moveTo(x,y)}c.stroke()}c.restore();
 paper(c,'#5a5a66',()=>c.rect(-200,1410,W+400,700),16,-8,0.3);paper(c,'#2a2630',()=>c.rect(128,900,14,510),6,3,0.3);paper(c,'#4f86c6',()=>c.roundRect(70,800,130,110,16),8,4,0.3);txt(c,'Т',135,858,80,'#fff');
 const dd=doll(c,{...DAD,x:900,y:1560,s:1.25,face:-1,expr:{eyes:'wide',mouth:'o',brow:1}});stubble(c,dd,-1);doll(c,{...BOY,x:740,y:1580,s:0.95,face:-1,expr:{eyes:'wide',mouth:'smile',brow:1},pose:{armL:[2.2,2.6],bob:Math.abs(Math.sin(T*9))*-10}});
 c.restore()}
// лестничная площадка
function landing(c,T){const wg=c.createLinearGradient(0,0,0,1500);wg.addColorStop(0,'#6f7f78');wg.addColorStop(1,'#8fa39a');c.fillStyle=wg;c.fillRect(-200,-200,W+400,1700);paper(c,'#5f7068',()=>c.rect(-200,900,W+400,620),10,-5,0.2);
 const fg=c.createLinearGradient(0,1500,0,H);fg.addColorStop(0,'#6a6a70');fg.addColorStop(1,'#35353a');c.save();sh(c,20,-8,0.25);c.fillStyle=fg;c.fillRect(-200,1500,W+400,H);c.restore();
 for(const [x,n,col] of [[130,'19','#7a5236'],[620,'20','#6a4a3c']]){paper(c,'#3a2d2a',()=>c.rect(x-20,380,360,1130),14,7,0.3);paper(c,col,()=>c.rect(x,400,320,1110),6,3,0.2);paper(c,'#e9c98a',()=>c.roundRect(x+120,520,80,60,10),4,2,0.3);txt(c,n,x+160,553,40,'#3a2d2a');paper(c,'#e9c98a',()=>c.arc(x+280,980,16,0,7),4,2,0.3)}
 paper(c,'#8a5a6a',()=>c.roundRect(640,1490,280,40,10),6,3,0.25)}
// 27-29: дверь не открыли
function shotDoor5(c,t,d,T,m){const a2=m[2]!=null?t-m[2]:-1;c.save();cam(c,620,1040,1.06+0.08*ease(t/d),0,0);landing(c,T);
 const kn=m[1]!=null&&t<m[1]?Math.abs(Math.sin(T*12)):0;doll(c,{...BOY,x:560,y:1540,s:1.0,face:1,expr:{eyes:'open',mouth:'sad',brow:-0.8},pose:{armL:[1.9+kn*0.4,2.3+kn*0.3]}});const dd=doll(c,{...DAD,x:380,y:1550,s:1.3,face:1,expr:{eyes:'open',mouth:'flat',brow:-0.6}});stubble(c,dd,1);
 c.restore();bigText(c,'5 ЭТАЖ',W/2,250,110,'#ffd60a',0.7+0.3*back(t/0.3),-0.02,22);if(a2>0){const k=(a2*1.2)%1;c.save();c.globalAlpha=Math.sin(k*Math.PI);bigText(c,'МЯУ!',800,820-k*60,100,'#fff',1,0.08,18);c.restore()}}
// 30-34: соседка
function shotNeighbor(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,480,1040,1.06+0.08*ease(t/d),0,0);landing(c,T);
 paper(c,'#ffd9a0',()=>c.rect(130,400,320*clamp(t/0.5),1110),0,0,0);
 const n=doll(c,{...NEIGH,x:300,y:1540,s:1.25,face:1,expr:{eyes:'open',mouth:A(1)>0&&Math.sin(T*10)>0?'o':'sad',brow:-0.8},pose:{armL:[1.0,1.6]}});
 doll(c,{...BOY,x:640,y:1550,s:1.0,face:-1,expr:{eyes:'wide',mouth:'sad',brow:-1}});const dd=doll(c,{...DAD,x:820,y:1560,s:1.3,face:-1,expr:{eyes:'wide',mouth:'flat',brow:-0.8}});stubble(c,dd,-1);
 if(A(1)>0&&A(3)<0)bub(c,110,330,780,A(2)>0?400:270,n.head.x+40,n.head.y-n.HR-30,A(2)>0?1:back(A(1)/0.3),()=>{lines(c,['Веру Павловну','увезла скорая.'],500,A(2)>0?410:420,60,84);if(A(2)>0)txt(c,'Два дня назад.',500,630,60,'#b3362e')});
 c.restore();if(A(3)>0){c.save();const k=back(A(3)/0.35);c.translate(540,640);c.scale(k,k);c.translate(-540,-640);c.save();c.beginPath();c.roundRect(110,250,860,780,50);c.clip();c.translate(-80,-760);c.scale(1.25,1.25);veraRoom(c,T,{noPhone:true,dark:0.3});c.save();c.translate(560,1560);c.rotate(0.5);paper(c,'#2a2630',()=>c.roundRect(-70,-20,140,40,10),10,5,0.3);c.fillStyle='#3a4660';c.fillRect(-60,-14,120,24);c.restore();c.restore();c.strokeStyle='#fbf4e4';c.lineWidth=16;c.beginPath();c.roundRect(110,250,860,780,50);c.stroke();c.restore();
  if(A(4)>0)bigText(c,'20:00',W/2,1130,130,'#ffd60a',0.7+0.3*back(A(4)/0.3),-0.02,24)}}
// 35-36: шарф
function shotScarfGive(c,t,d,T,m){const k=ease(t/1.2);c.save();cam(c,540,1000,1.0+0.1*ease(t/d),0,0);landing(c,T);c.fillStyle='rgba(30,30,40,0.35)';c.fillRect(-200,-200,W+400,H+400);glow(c,540,1050,700,'rgba(255,220,170,A)',0.35);
 c.save();sh(c,20,10,0.3);c.strokeStyle='#c9843a';c.lineWidth=150;c.lineCap='round';c.beginPath();c.moveTo(-200,1700);c.lineTo(lerp(-100,250,k),1200);c.stroke();c.restore();paper(c,'#f0cdb0',()=>c.ellipse(lerp(-60,290,k),1170,80,100,0.4,0,7),14,7,0.3);
 c.save();sh(c,20,10,0.3);c.strokeStyle='#4f86c6';c.lineWidth=130;c.lineCap='round';c.beginPath();c.moveTo(1280,1750);c.lineTo(850,1250);c.stroke();c.restore();paper(c,'#f2c9a4',()=>c.ellipse(810,1210,70,90,-0.4,0,7),14,7,0.3);
 scarfP(c,lerp(100,430,k),1080,0.05,1.6);c.restore()}
// 37-40: вы ей кто?
function shotReception(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,540,1040,1.04+0.08*ease(t/d),0,0);hospP(c,T);
 const n=doll(c,{...NURSE,x:260,y:1400,s:1.3,face:1,noLegs:true,expr:{eyes:'open',mouth:A(1)>0&&A(2)<0&&Math.sin(T*10)>0?'o':'flat'},pose:{armL:[1.0,1.5]}});paper(c,'#fff',()=>c.roundRect(n.head.x-70,n.head.y-n.HR-34,140,50,12),6,3,0.2);c.fillStyle='#e0403a';c.fillRect(n.head.x-8,n.head.y-n.HR-28,16,38);c.fillRect(n.head.x-20,n.head.y-n.HR-17,40,16);
 paper(c,'#e9eef0',()=>c.roundRect(40,1280,480,240,14),20,10,0.33);paper(c,'#7fb0a8',()=>c.rect(40,1280,480,30),0,0,0);
 const b=doll(c,{...BOY,x:680,y:1550,s:1.0,face:-1,expr:{eyes:'open',mouth:'sad',brow:-0.8},pose:{armL:[1.2,1.7]}});scarfP(c,b.hf.x-60,b.hf.y-10,0.9,0.45);
 const dd=doll(c,{...DAD,x:860,y:1560,s:1.3,face:-1,expr:{eyes:A(2)>0?'closed':'open',mouth:'flat',brow:-0.9},pose:{headTilt:A(2)>0?0.25:0}});stubble(c,dd,-1);
 if(A(1)>0&&A(2)<0)bub(c,90,420,560,230,n.head.x+40,n.head.y-n.HR-60,back(A(1)/0.3),()=>txt(c,'Вы ей кто?',370,536,76));
 c.restore();if(A(3)>0)bigText(c,'НИКТО',W/2,330,150,'#fff',0.7+0.3*back(A(3)/0.3),-0.02,24)}
// 41-42: я её внук
function shotGrandson(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1;c.save();cam(c,560,900,1.0+0.1*ease(t/d),0,0);hospBlur(c,T);
 const b=boyClose(c,T,{eyes:'open',mouth:a1>0&&Math.sin(T*10)>0?'o':'flat',brow:0.2,tear:T*0.3},{armL:[1.1,1.9],armR:[0.9,1.7]},false);scarfP(c,b.hf.x-150,b.hf.y-20,0.2,1.3);
 if(a1>0)bub(c,150,190,780,300,640,650,back(a1/0.3),()=>txt(c,'Я её внук.',540,340,110,'#2b6a3a'));c.restore()}
// 43-47: реанимация
function shotNurseTalk(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,540,900,1.0+0.08*ease(t/d),0,0);hospBlur(c,T);
 const n=doll(c,{...NURSE,x:520,y:1700,s:2.6,face:1,noLegs:true,expr:{eyes:A(1)>0?'closed':'open',mouth:(A(1)>0&&A(3)<0||A(4)>0)&&Math.sin(T*10)>0?'o':'sad',brow:-0.8,tear:A(2)>0?T*0.3:0},pose:{headTilt:0.1}});paper(c,'#fff',()=>c.roundRect(n.head.x-150,n.head.y-n.HR-60,300,100,24),10,5,0.25);c.fillStyle='#e0403a';c.fillRect(n.head.x-16,n.head.y-n.HR-50,32,80);c.fillRect(n.head.x-40,n.head.y-n.HR-26,80,32);
 if(A(4)>0)bub(c,150,150,780,300,n.head.x+80,n.head.y-n.HR-70,back(A(4)/0.3),()=>txt(c,'«Который час?»',540,300,84,'#b3362e'));
 else if(A(1)>0)bub(c,90,120,900,A(2)>0?440:290,n.head.x+80,n.head.y-n.HR-70,A(2)>0?1:back(A(1)/0.3),()=>{lines(c,['К ней три года','никто не приходил.'],540,A(2)>0?210:220,62,86);if(A(2)>0)txt(c,'Она в реанимации.',540,440,64,'#b3362e')});
 c.restore()}
// 48-49: без пяти восемь
function shotWatch(c,t,d,T){c.save();cam(c,540,900,1.0+0.12*ease(t/d),0,0);hospBlur(c,T);clockP(c,540,820,330,19,55+t*0.4);c.restore()}
// 50-51: набрал номер
function shotDialMom(c,t,d,T){const px=210,py=500,pw=660,ph=1100;c.save();cam(c,540,980,1.0+0.08*ease(t/d),0,0);hospBlur(c,T);
 c.save();sh(c,20,10,0.3);c.strokeStyle='#4f86c6';c.lineWidth=150;c.lineCap='round';for(const sx of [-1,1]){c.beginPath();c.moveTo(540+sx*620,H+120);c.lineTo(540+sx*370,py+ph-190);c.stroke()}c.restore();
 phoneBody(c,px,py,pw,ph,Math.sin(T*0.9)*0.01,()=>callScreen(c,px,py,pw,ph,T,'call',0));for(const sx of [-1,1])paper(c,'#f2c9a4',()=>c.ellipse(540+sx*340,py+ph-200,70,96,sx*0.4,0,7),14,7,0.3);c.restore()}
// 52-57: стеклянная дверь
function shotGlass(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1,op=A(3)>0?ease(A(3)/0.8):0,n=A(2)>0?2:A(1)>0?1:0;c.save();cam(c,540,1000,1.04+0.1*ease(t/d),0,0);hospP(c,T);
 paper(c,'#5f8a84',()=>c.rect(180,300,720,1220),20,10,0.35);
 const rg=0.5+0.5*Math.sin(T*24);glow(c,540,1050,380,'rgba(150,200,255,A)',op>0?0.2:0.55*rg);
 if(op>0){glow(c,540,900,800*op,'rgba(255,240,210,A)',0.6*op);paper(c,'#f4efe2',()=>c.rect(210,330,660,1190),0,0,0);
  if(op>0.5){const dc=doll(c,{...DOC,x:540,y:1500,s:1.5,face:1,expr:{eyes:'open',mouth:A(5)>0&&Math.sin(T*10)>0?'o':'flat',brow:0.3},pose:{armL:[0.3,0.5]}});paper(c,'#bfe0e6',()=>c.roundRect(dc.head.x-10,dc.head.y+dc.HR*0.3,dc.HR*0.95,dc.HR*0.55,14),4,2,0.2);
   if(A(5)>0)bub(c,150,300,780,300,dc.head.x+20,dc.head.y-dc.HR-30,back(A(5)/0.3),()=>{txt(c,'Кто из вас',540,400,84);txt(c,'Тима?',540,500,96,'#b3362e')})}}
 for(const sx of [-1,1]){const x0=sx<0?210-op*320:540+op*320;paper(c,'rgba(210,235,240,0.82)',()=>c.rect(x0,330,330,1190),10,5,0.25);c.strokeStyle='#5f8a84';c.lineWidth=14;c.strokeRect(x0,330,330,1190)}
 paper(c,'#e0403a',()=>c.roundRect(300,190,480,96,18),10,5,0.3);txt(c,'РЕАНИМАЦИЯ',540,240,58,'#fff');
 if(op<0.3){doll(c,{...BOY,x:430,y:1720,s:1.1,face:1,expr:{eyes:'wide',mouth:'flat'},pose:{armL:[1.2,1.8]}});const dd=doll(c,{...DAD,x:700,y:1740,s:1.4,face:-1,expr:{eyes:'wide',mouth:'flat'}});stubble(c,dd,-1)}
 c.restore();if(n>0&&op<=0){bigText(c,String(n),W/2,480,200,'#ffd60a',0.7+0.3*back((n==2?A(2):A(1))/0.25),0,26)}}

function hook(c,T){const a=1-ease((T-2.3)/0.25);if(a<=0)return;c.save();c.globalAlpha=a;bigText(c,'ЧАСТЬ 4',W/2,1720,150,'#ffd60a',0.7+0.3*back(T/0.3),-0.03,26);c.restore()}
function outro(c,T){const s=window.DATA.outro;if(T<s)return;bigText(c,'ОНА ЖИВА?',W/2,1620,120,'#ffd60a',0.7+0.3*back((T-s)/0.3),-0.02,24);if(T>s+0.4)bigText(c,'ЧАСТЬ 5 — ФИНАЛ',W/2,1750,70,'#fff',0.7+0.3*back((T-s-0.4)/0.3),0,14)}
Object.assign(FN,{shotEmptyRing,shotBoyNight,shotDadPromise,shotOperator,shotNotebook,shotClues,shotSearch,shotFound,shotDoor5,shotNeighbor,shotScarfGive,shotReception,shotGrandson,shotNurseTalk,shotWatch,shotDialMom,shotGlass});

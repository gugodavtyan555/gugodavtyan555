// «Второй рюкзак», часть 3 — сцены. Подключается после shots_r2.js
function speaker(c,x,y,s,T,on=true){c.save();c.translate(x,y);c.scale(s,s);if(on)glow(c,0,-50,200,'rgba(255,214,10,A)',0.35+0.15*Math.sin(T*8));paper(c,'#2a2630',()=>c.roundRect(-60,-110,120,120,26),10,5,0.3);paper(c,'#ffd60a',()=>c.arc(0,-50,34,0,7),4,2,0.25);paper(c,'#2a2630',()=>c.arc(0,-50,14,0,7),0,0,0);
 if(on){c.strokeStyle='rgba(255,214,10,0.9)';c.lineWidth=7;c.lineCap='round';for(let i=0;i<3;i++){const k=((T*1.2+i/3)%1);c.globalAlpha=1-k;c.beginPath();c.arc(0,-50,70+k*120,-2.4,-0.7);c.stroke()}c.globalAlpha=1}c.restore()}
function vmsg(c,x,y,w,name,col,T,k){if(k<=0)return;c.save();c.translate(x+w/2,y);c.scale(k,k);c.translate(-(x+w/2),-y);paper(c,'#fbf4e4',()=>c.roundRect(x,y-60,w,120,40),18,9,0.3);paper(c,col,()=>c.arc(x+62,y,42,0,7),6,3,0.25);c.fillStyle='#fff';c.beginPath();c.moveTo(x+50,y-18);c.lineTo(x+50,y+18);c.lineTo(x+80,y);c.fill();txt(c,name,x+120,y-22,34,'#3a2d3d','left');c.fillStyle=col;for(let i=0;i<Math.floor((w-150)/20);i++){const hh=8+Math.abs(Math.sin(T*8+i*0.8+x)*Math.sin(T*2.6+i*0.27))*40;c.beginPath();c.roundRect(x+120+i*20,y+22-hh/2,11,hh,5);c.fill()}c.restore()}
function kidsRow(c,T,y,expr,pose){KIDS.forEach(([top,hair],i)=>doll(c,{skin:'#f2c9a4',hair,top,bot:'#4a4458',x:130+i*270,y,s:0.8,face:i<2?1:-1,noLegs:true,expr:typeof expr=='function'?expr(i):expr,pose:pose?pose(i):{}}));paper(c,'#c79a66',()=>c.rect(-200,y-20,W+400,40),10,5,0.25)}

// 0: палец
function shotFinger0(c,t,d,T){shotFinger(c,t+0.9,d+0.9,T)}
// 1-2: вы видели?
function shotSleeve(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1;c.save();cam(c,540,1040,1.08+0.08*ease(t/d),0,0);hospP(c,T);
 const dc=doll(c,{...DOC,x:340,y:1540,s:1.45,face:1,expr:{eyes:'open',mouth:'flat',brow:0.2}});mask(c,dc);
 const te=teach(c,{x:700,y:1550,s:1.4,face:-1,expr:{eyes:'wide',mouth:a1>0&&Math.sin(T*10)>0?'o':'flat',brow:1},pose:{lean:0.2,armL:[1.5,1.5],bob:Math.sin(T*26)*2}});
 if(a1>0)bub(c,330,330,640,250,te.head.x-20,te.head.y-te.HR-30,back(a1/0.3),()=>txt(c,'Вы видели?!',650,458,84,'#b3362e'));c.restore()}
// 3-7: рефлекс
function shotReflex(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,540,930,1.0+0.08*ease(t/d),0,0);hospBlur(c,T);
 const dc=doll(c,{...DOC,x:520,y:1760,s:2.6,face:1,noLegs:true,expr:{eyes:'closed',mouth:A(1)>0&&Math.sin(T*10)>0?'o':'flat',brow:-0.5},pose:{headTilt:A(1)<0?Math.sin(T*9)*0.12:0}});mask(c,dc);
 const L=[];if(A(1)>0)L.push('Это рефлекс.');if(A(2)>0)L.push('Так бывает.');if(A(3)>0)L.push('Не говорите девочке.');if(A(4)>0){L.length=0;L.push('Не давайте ей');L.push('ложную надежду.')}
 if(L.length)bub(c,110,170,860,150+L.length*100,dc.head.x+80,dc.head.y-dc.HR-40,1,()=>L.forEach((l,i)=>txt(c,l,540,250+i*100,A(4)>0?70:64,A(4)>0?'#b3362e':'#3a2d3d')));c.restore()}
// 8-9: не спала
function shotTeacherNight(c,t,d,T,m){c.save();cam(c,540,1040,1.06+0.1*ease(t/d),0,0);kitchen(c,T,true);clockP(c,180,700,90,3,20);chairP(c,440,true);
 const te=teach(c,{x:440,y:1340,s:1.4,face:1,noLegs:true,expr:{eyes:'open',mouth:'flat',brow:-0.6},pose:{lean:0.1,headTilt:0.1,armL:[1.0,2.6],armR:[1.0,1.5]}});tableP(c,true);paper(c,'#8fa0bc',()=>c.roundRect(640,1196,64,58,10),8,4,0.3);
 bub(c,560,640,400,300,560,960,back((t-0.8)/0.3),()=>{paper(c,'#f2c9a4',()=>c.ellipse(760,800,70,54,0.3,0,7),6,3,0.25);c.strokeStyle='#ffd60a';c.lineWidth=8;c.lineCap='round';for(let i=0;i<4;i++){const a=-1.2+i*0.4;c.beginPath();c.moveTo(760+Math.cos(a)*100,790+Math.sin(a)*100);c.lineTo(760+Math.cos(a)*130,790+Math.sin(a)*130);c.stroke()}});
 c.restore();c.fillStyle='rgba(20,26,50,0.25)';c.fillRect(0,0,W,H)}
// 10-13: сама поставила рюкзак
function shotPutBag(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1,k=A(1)>0?ease(A(1)/1.2):0;c.save();cam(c,560,1060,1.04+0.1*ease(t/d),0,0);classBack(c,T);chairF(c,400);chairF(c,680);deskF(c);
 const te=teach(c,{x:lerp(1000,900,k),y:1580,s:1.4,face:-1,expr:{eyes:'open',mouth:A(3)>0&&Math.sin(T*10)>0?'o':'smile',brow:0.2},pose:{lean:0.1,armL:[1.3,1.5],armR:[1.1,1.4]}});
 bag(c,lerp(te.hf.x,680,k),lerp(te.hf.y+150,1218,k),0.9,'#3f6fd0',{T});if(k>=1)glow(c,680,1120,300,'rgba(255,220,150,A)',0.5);
 if(A(3)>0)bub(c,150,330,780,250,te.head.x-30,te.head.y-te.HR-30,back(A(3)/0.3),()=>txt(c,'Это место занято.',540,458,72,'#2b6a3a'));c.restore()}
// 14-16: так решил весь класс
function shotBagStays(c,t,d,T,m){const a2=m[2]!=null?t-m[2]:-1;c.save();cam(c,560,1080,1.08+0.14*ease(t/d),0,0);classBack(c,T);
 kidsRow(c,T,1250,{eyes:'open',mouth:'flat'});chairF(c,400);chairF(c,680);glow(c,680,1120,320,'rgba(255,220,150,A)',0.5);bag(c,680,1218,0.9,'#3f6fd0',{T});deskF(c);c.restore();
 if(a2>0)bigText(c,'ВЕСЬ КЛАСС',W/2,280,110,'#ffd60a',0.7+0.3*back(a2/0.3),-0.02,22)}
// 17-19: Лиза болеет
function shotLizaSick(c,t,d,T,m){const a2=m[2]!=null?t-m[2]:-1;c.save();cam(c,480,1080,1.08+0.08*ease(t/d),0,0);room(c,T);
 paper(c,'#fffaf0',()=>c.roundRect(10,1168,250,120,50),16,8,0.3);const l=doll(c,{...LIZA,x:330,y:1290,s:1.0,face:-1,noLegs:true,expr:{eyes:'closed',mouth:'sad',brow:-0.6},pose:{lean:1.35,headTilt:0.1}});
 paper(c,'#e2a94c',()=>{c.moveTo(250,1262);c.quadraticCurveTo(470,1232,690,1262);c.lineTo(700,1440);c.quadraticCurveTo(470,1470,240,1440);c.closePath()},22,12,0.34);
 paper(c,'#fff',()=>c.roundRect(l.head.x-70,l.head.y-l.HR-6,120,30,12),6,3,0.25);c.save();c.translate(l.head.x+70,l.head.y+40);c.rotate(-0.5);paper(c,'#f6efe2',()=>c.roundRect(0,-7,110,14,7),4,2,0.25);c.fillStyle='#e0403a';c.fillRect(40,-3,66,6);c.restore();
 c.restore();if(a2>0)bigText(c,'38,5°',760,560,120,'#ff5a4f',0.7+0.3*back(a2/0.3),0.04,22)}
// 20-23: рассказала всё
function shotTellClass(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,540,1040,1.04+0.06*ease(t/d),0,0);classBoard(c,T,' ');
 teach(c,{x:250,y:1560,s:1.4,face:1,expr:{eyes:'open',mouth:Math.sin(T*10)>0?'o':'sad',brow:-0.7},pose:{armL:[1.6+Math.sin(T*5)*0.2,2.4]}});
 c.save();c.translate(540,610);const ic=(x,k,dr)=>{if(k<=0)return;c.save();c.translate(x,0);c.scale(back(k/0.3),back(k/0.3));dr();c.restore()};
 ic(-260,A(1),()=>{c.fillStyle='rgba(255,255,255,0.9)';for(let i=0;i<6;i++){const a=i*Math.PI/3;c.save();c.rotate(a);c.fillRect(-5,-80,10,160);c.restore()}});
 ic(0,A(2),()=>{paper(c,'#e9e6dc',()=>{c.roundRect(-110,-20,220,70,20);c.moveTo(-60,-20);c.lineTo(-30,-70);c.lineTo(50,-70);c.lineTo(80,-20)},0,0,0);c.fillStyle='#2f5a48';c.beginPath();c.arc(-60,56,26,0,7);c.arc(60,56,26,0,7);c.fill()});
 ic(260,A(3),()=>{c.save();c.translate(0,60);glass(c,0,0,1);c.restore();txt(c,'×200',0,-90,50,'#ffd60a')});c.restore();c.restore()}
// 24-26: класс молчал
function shotAshamed(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1;c.save();cam(c,540,1100,1.1+0.14*ease(t/d),0,0);classBack(c,T);
 KIDS.forEach(([top,hair],i)=>{const cry=a1>0&&i==2,down=a2>0&&i<2;doll(c,{skin:'#f2c9a4',hair,top,bot:'#4a4458',x:130+i*270,y:1330,s:1.0,face:i<2?1:-1,noLegs:true,expr:{eyes:cry||down?'closed':'wide',mouth:'sad',brow:-1,tear:cry?T*0.5:0},pose:{headTilt:down?0.4:cry?0.2:0}})});
 paper(c,'#c79a66',()=>c.rect(-200,1300,W+400,50),14,7,0.3);paper(c,'#a87c4e',()=>c.rect(-200,1350,W+400,260),6,3,0.2);c.restore()}
// 27-30: идея Димы
function shotDimaIdea(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1,up=ease(t/0.8);c.save();cam(c,540,1040,1.06+0.08*ease(t/d),0,0);classBack(c,T);chairF(c,540);
 const dm=doll(c,{skin:'#f2c9a4',hair:'#2e2a30',top:'#6fa8dc',topDark:'#5a90c4',bot:'#4a4458',x:540,y:lerp(1330,1290,up),s:1.15,face:1,noLegs:true,expr:{eyes:'open',mouth:A(1)>0&&Math.sin(T*10)>0?'o':'flat',brow:0.6},pose:{armL:[1.2+Math.sin(T*6)*0.2,2.0]}});deskF(c);
 const L=[];if(A(1)>0){L.push('А давайте запишем');L.push('ему уроки.')}if(A(2)>0)L.push('Голосом!');if(A(3)>0){L.length=0;L.push('Чтобы он слышал');L.push('не только Лизу.')}
 if(L.length)bub(c,110,330-L.length*30,860,150+L.length*100,dm.head.x+40,dm.head.y-dm.HR-30,1,()=>L.forEach((l,i)=>txt(c,l,540,410-L.length*30+i*100,64,l=='Голосом!'?'#b3362e':'#3a2d3d')));c.restore()}
// 31-35: записался весь класс
function shotRecord(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1,n=A(3)>0?24:A(2)>0?Math.min(24,5+Math.floor(A(2)*10)):A(1)>0?5:1;c.save();cam(c,540,960,1.0+0.05*ease(t/d),0,0);
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#3a4668');g.addColorStop(1,'#1c2238');c.fillStyle=g;c.fillRect(-200,-200,W+400,H+400);
 const cols=['#e07a5f','#7fb69a','#b98ac9','#6fa8dc','#e2a94c','#c96a7a'];for(let i=0;i<n;i++){const x=150+(i%6)*156,y=640+Math.floor(i/6)*250;paper(c,cols[i%6],()=>c.arc(x,y,56,0,7),10,5,0.3);paper(c,'#f2c9a4',()=>c.arc(x,y-6,30,0,7),0,0,0);c.fillStyle='#fff';for(let j=0;j<5;j++){const hh=8+Math.abs(Math.sin(T*9+i+j))*30;c.fillRect(x-36+j*16,y+80-hh/2,9,hh)}}
 c.restore();bigText(c,String(n),W/2,280,220,'#ffd60a',1+0.05*Math.sin(T*16),0,28);bigText(c,n==1?'ГОЛОС':n<5?'ГОЛОСА':'ГОЛОСОВ',W/2,440,76,'#fff',1,0,16)}
// 36-43: голосовые
function shotVoices(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,540,960,1.0+0.04*ease(t/d),0,0);const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#cfe0c8');g.addColorStop(1,'#b4cdb0');c.fillStyle=g;c.fillRect(-200,-200,W+400,H+400);
 const M=[[0,'Оля','#c96a7a',['Привет, Миш. Это Оля.','Сегодня была контрольная.'],2],[3,'Артём','#6fa8dc',['Привет, Миш. Это Артём.','Я занял тебе место','в столовой.'],5],[6,'Дима','#7fb69a',['Миш, возвращайся.','Без тебя некому стоять','на воротах.'],7]];
 M.forEach(([i0,nm,col,L,i1],k)=>{const a=A(i0);if(a<0)return;const y=330+k*440;vmsg(c,110,y,860,nm,col,T,back(a/0.3));const nL=A(i1)>0?L.length:A(i0+1)>0?Math.min(L.length,2):1;
  paper(c,'#fbf4e4',()=>c.roundRect(170,y+84,800,60+L.length*62,30),12,6,0.25);for(let j=0;j<nL;j++)txt(c,j==0&&A(i0+1)<0?L[0].split('.')[0]+'.':L[j],570,y+138+j*62,44,'#3a2d3d')});c.restore()}
// 44: колонка
function shotSpeaker(c,t,d,T){const k=ease(t/1.2);c.save();cam(c,700,1150,1.2+0.2*ease(t/d),0,0);ward(c,T,{glass:false});speaker(c,935,lerp(900,1290,k),1.3,T,k>=1);
 if(k<1)teach(c,{x:1020,y:1580,s:1.3,face:-1,expr:{eyes:'open',mouth:'smile'},pose:{armL:[1.6,1.6]}});c.restore()}
// 45-48: услышала голоса
function shotLizaHears(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,560,1100,1.06+0.08*ease(t/d),0,0);ward(c,T,{glass:false});speaker(c,935,1290,1.3,T);
 const k=easeOut(t/1.5);const l=doll(c,{...LIZA,x:lerp(1250,790,k),y:1560,s:1.05,face:-1,expr:{eyes:A(1)>0?'wide':'open',mouth:A(1)>0?'o':'flat',brow:A(1)>0?1:0,tear:A(3)>0?T*0.5:0},pose:k<1?{legL:[Math.sin(T*8)*0.4,0],legR:[-Math.sin(T*8)*0.4,0]}:{}});bag(c,l.shd.x+74,l.shd.y+150,0.6,'#c96a7a',{key:false});
 if(A(1)>0){c.save();KIDS.forEach(([top],i)=>{const q=((T*0.5+i/4)%1);c.globalAlpha=Math.sin(q*Math.PI);paper(c,top,()=>c.arc(700+i*70-q*300,1080-q*260-i*30,34,0,7),6,3,0.25)});c.restore()}c.restore();
 if(A(0)>-1&&A(1)<0)bigText(c,'16:00',W/2,280,150,'#ffd60a',0.7+0.3*back(t/0.3),-0.02,24)}
// 49-50: села на пол
function shotLizaFloor(c,t,d,T,m){c.save();cam(c,620,1300,1.3+0.15*ease(t/d),0,0);ward(c,T,{glass:false});speaker(c,935,1290,1.3,T);
 const l=doll(c,{...LIZA,x:620,y:1640,s:1.1,face:-1,expr:{eyes:'closed',mouth:'sad',brow:-1,tear:T*0.7},pose:{lean:0.2,headTilt:0.3,legL:[1.5,0.2],legR:[1.4,0.1],armL:[2.2,3.2],armR:[2.0,3.1],bob:Math.sin(T*20)*3}});tearsBoth(c,l,T);c.restore()}
// 51-53: «Миша, просыпайся»
function shotSpeakerTalk(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1;c.save();cam(c,540,960,1.0+0.08*ease(t/d),0,0);wardBlur(c,T);speaker(c,540,1500,3.2,T);
 if(a1>0)bub(c,90,330,900,a2>0?420:270,540,1050,a2>0?1:back(a1/0.3),()=>{txt(c,'Миша, просыпайся!',540,a2>0?440:465,76,'#b3362e');if(a2>0)txt(c,'Мы тебя ждём.',540,600,76)});c.restore()}
// 54-57: прибор запищал
function shotBeep(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1,j1=A(2)>0?Math.exp(-A(2)*4):0,j2=A(3)>0?Math.exp(-A(3)*4):0,jj=Math.max(j1,j2);c.save();cam(c,540,900,1.0+0.1*ease(t/d),Math.sin(T*40)*8*jj,0);
 c.fillStyle='#10181d';c.fillRect(-200,-200,W+400,H+400);paper(c,'#04120c',()=>c.roundRect(90,420,900,760,40),0,0,0);
 c.save();c.strokeStyle='#39ff9a';c.lineWidth=14;c.lineJoin='round';c.shadowColor='#39ff9a';c.shadowBlur=40;c.beginPath();for(let i=0;i<=90;i++){const u=i/90,ph=((u*2.2-T*1.05)%1+1)%1;let v=0;const amp=1+3*jj+(A(1)>0?0.6:0);if(ph>0.42&&ph<0.46)v=-40*amp;else if(ph>=0.46&&ph<0.5)v=150*amp;else if(ph>=0.5&&ph<0.54)v=-80*amp;const px=130+u*820;i?c.lineTo(px,800-v):c.moveTo(px,800-v)}c.stroke();c.restore();
 txt(c,String(Math.round(58+ (A(1)>0?20:0)+jj*40)),820,1090,120,'#39ff9a');if(A(0)>-1){const b=Math.pow(Math.abs(Math.sin(T*(A(1)>0?10:5))),6);glow(c,220,1090,90+b*60,'rgba(255,60,60,A)',0.6)}
 c.restore();if(A(2)>0&&A(3)<0)bigText(c,'РАЗ',W/2,280,150,'#ffd60a',0.7+0.3*back(A(2)/0.25),0,24);if(A(3)>0)bigText(c,'ДРУГОЙ',W/2,280,150,'#ffd60a',0.7+0.3*back(A(3)/0.25),0,24)}
// 58-62: зовите родителей
function shotDoctorRun(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1,k=easeOut(t/1.3);c.save();cam(c,560,1100,1.06+0.1*ease(t/d),0,0);ward(c,T,{glass:false});speaker(c,935,1290,1.3,T,false);
 doll(c,{...LIZA,x:820,y:1620,s:1.0,face:-1,expr:{eyes:'wide',mouth:'o',brow:1,tear:T*0.4}});
 const dc=doll(c,{...DOC,x:lerp(1300,640,k),y:1570,s:1.4,face:-1,expr:{eyes:'wide',mouth:A(3)>0&&Math.sin(T*10)>0?'o':'flat',brow:1},pose:k<1?{legL:[Math.sin(T*13)*0.6,0],legR:[-Math.sin(T*13)*0.6,0],lean:0.25}:{headTilt:-0.1}});mask(c,{head:{x:dc.head.x-dc.HR*0.95+10,y:dc.head.y},HR:dc.HR});
 if(A(3)>0)bub(c,150,330,780,A(4)>0?400:250,dc.head.x-20,dc.head.y-dc.HR-30,A(4)>0?1:back(A(3)/0.3),()=>{txt(c,'Зовите родителей.',540,A(4)>0?420:455,66);if(A(4)>0)txt(c,'СРОЧНО!',540,580,110,'#b3362e')});c.restore()}

function hook(c,T){const a=1-ease((T-2.0)/0.3);if(a<=0)return;c.save();c.globalAlpha=a;bigText(c,'ЧАСТЬ 3',W/2,1720,150,'#ffd60a',0.7+0.3*back(T/0.3),-0.02,26);c.restore()}
function outro(c,T){const s=window.DATA.outro;if(T<s)return;bigText(c,'ЧТО С МИШЕЙ?',W/2,1650,110,'#ffd60a',0.7+0.3*back((T-s)/0.3),-0.02,24);if(T>s+0.4)bigText(c,'ЧАСТЬ 4 — СКОРО',W/2,1780,70,'#fff',0.7+0.3*back((T-s-0.4)/0.3),0,14)}
Object.assign(FN,{shotFinger0,shotSleeve,shotReflex,shotTeacherNight,shotPutBag,shotBagStays,shotLizaSick,shotTellClass,shotAshamed,shotDimaIdea,shotRecord,shotVoices,shotSpeaker,shotLizaHears,shotLizaFloor,shotSpeakerTalk,shotBeep,shotDoctorRun});

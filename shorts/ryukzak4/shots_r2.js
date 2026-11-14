// «Второй рюкзак», часть 2 — сцены. Подключается после shots_r1.js
const MISHA={...LIZA,hairBack:false,top:'#3f6fd0',topDark:'#345fb8'};
const DIR={skin:'#eebf98',hair:'#b9b4aa',top:'#4a4a5a',topDark:'#3c3c4a',bot:'#3a3a48',botDark:'#2f2f3c',shoe:'#2a2630'};
function snow(c,T,n=80,seed=14){const r=rng(seed);c.fillStyle='rgba(255,255,255,0.9)';for(let i=0;i<n;i++){const sp=160+r()*220,x=(r()*1300+Math.sin(T*1.4+i)*40)%1300-100,y=(r()*2000+T*sp)%2000-40;c.beginPath();c.arc(x,y,3+r()*6,0,7);c.fill()}}
function ward(c,T,o={}){const fy=1500;const wg=c.createLinearGradient(0,0,0,fy);wg.addColorStop(0,'#9fb8c4');wg.addColorStop(1,'#b9ced6');c.fillStyle=wg;c.fillRect(-200,-200,W+400,fy+200);
 paper(c,'#f3e6cf',()=>c.roundRect(90,320,300,380,14),16,8,0.3);c.fillStyle='#1c2a4a';c.fillRect(108,338,264,344);glow(c,290,430,150,'rgba(220,230,255,A)',0.5);paper(c,'#f3f0dc',()=>c.arc(290,430,34,0,7),6,3,0.2);c.fillStyle='#f3e6cf';c.fillRect(235,338,10,344);
 glow(c,620,520,700,'rgba(255,240,210,A)',0.35);
 const fg=c.createLinearGradient(0,fy,0,H);fg.addColorStop(0,'#86a0aa');fg.addColorStop(1,'#4c606a');c.save();sh(c,20,-8,0.25);c.fillStyle=fg;c.fillRect(-200,fy,W+400,H-fy+200);c.restore();
 ecg(c,620,560,T);paper(c,'#4c606a',()=>c.rect(752,760,12,740),4,2,0.3);
 paper(c,'#5f7a86',()=>{c.rect(60,1330,720,26);c.rect(80,1356,22,150);c.rect(740,1356,22,150);c.rect(60,1100,26,256)},14,7,0.3);paper(c,'#f3f6f8',()=>c.roundRect(86,1250,690,86,22),12,6,0.3);paper(c,'#fff',()=>c.roundRect(104,1170,250,100,40),10,5,0.25);
 const mi=doll(c,{...MISHA,top:'#bfd8e6',topDark:'#a9c6d6',stripe:null,x:470,y:1290,s:1.0,face:-1,noLegs:true,expr:{eyes:'closed',mouth:'flat'},pose:{lean:1.35,headTilt:0.1,armL:[0.3,0.2],armR:[0.2,0.1],bob:Math.sin(T*1.2)*2}});
 paper(c,'#8fb2c8',()=>{c.moveTo(350,1250);c.quadraticCurveTo(560,1196+Math.sin(T*1.2)*5,776,1250);c.lineTo(776,1336);c.lineTo(350,1336);c.closePath()},12,6,0.3);
 paper(c,'#f2c9a4',()=>c.ellipse(560,1246,30,22,0,0,7),6,3,0.25);
 paper(c,'#e9eef0',()=>c.roundRect(830,1290,210,220,10),14,7,0.3);if(o.glass!==false)glass(c,935,1290,1);
 return{mi,hand:{x:560,y:1246}}}
function lizaChair(c,T,expr,pose={}){paper(c,'#8a6a4a',()=>{c.roundRect(700,1330,150,26,8);c.rect(710,1356,18,150);c.rect(822,1356,18,150)},10,5,0.3);return doll(c,{...LIZA,x:790,y:1345,s:1.0,face:-1,expr,pose:{lean:0.08,legL:[1.45,0.05],legR:[1.38,-0.04],armL:[1.2,1.7],armR:[1.0,1.5],bob:Math.sin(T*1.5)*2,...pose}})}
function wardBlur(c,T){c.save();c.filter='blur(9px)';c.translate(-200,-500);c.scale(1.6,1.6);ward(c,T);c.restore();c.fillStyle='rgba(30,40,60,0.2)';c.fillRect(-200,-200,W+400,H+400)}

// 0: журнал (повтор)
function shotJournal2(c,t,d,T){shotJournal(c,t+6,d+6,T,[0,0.1,0.2,0.3])}
// 1-2: кто такой Миша?
function shotAskWho(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1;c.save();cam(c,540,930,1.0+0.08*ease(t/d),0,0);c.save();c.filter='blur(9px)';c.translate(-300,-500);c.scale(1.6,1.6);classBoard(c,T);c.restore();
 const te=teach(c,{x:520,y:1760,s:2.6,face:1,noLegs:true,expr:{eyes:'wide',mouth:a1>0&&Math.sin(T*10)>0?'o':'flat',brow:0.8}});
 if(a1>0)bub(c,110,150,860,380,te.head.x+80,te.head.y-te.HR-40,back(a1/0.3),()=>{txt(c,'Кто такой',540,280,84);txt(c,'Миша Соколов?',540,400,84,'#b3362e')});c.restore()}
// 3-5: выбежала
function shotRunOut(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1,run=a2>0?ease(a2/0.9):0;c.save();cam(c,540,1060,1.04+0.08*ease(t/d),0,0);classBack(c,T);
 paper(c,'#7a5236',()=>c.rect(880,420,300,1090),14,7,0.3);if(run>0.2)paper(c,'#fbe9c8',()=>c.rect(900,440,260*clamp(run*1.5),1070),0,0,0);
 chairF(c,400);chairF(c,680);
 if(a2<0){lizaSeat(c,T,{eyes:'wide',mouth:'sad',brow:-1},a1>0?{armL:[1.5,1.6]}:{});bag(c,a1>0?lerp(680,520,ease(a1/0.5)):680,a1>0?lerp(1218,1180,ease(a1/0.5)):1218,0.9,'#3f6fd0',{T})}
 deskF(c);
 if(a2>0){const x=lerp(520,1200,run),l=doll(c,{...LIZA,x,y:1600,s:1.1,face:1,expr:{eyes:'closed',mouth:'sad',brow:-1,tear:T*0.5},pose:{legL:[Math.sin(T*14)*0.6,Math.sin(T*14)*0.6-0.4],legR:[-Math.sin(T*14)*0.6,-Math.sin(T*14)*0.6-0.4],armL:[1.2,1.6],lean:0.3}});bag(c,l.hf.x+20,l.hf.y+110,0.75,'#3f6fd0',{T:T*3})}
 c.restore()}
// 6-9: Дима
function shotDima(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,540,1040,1.06+0.08*ease(t/d),0,0);classBack(c,T);chairF(c,540);
 const dm=doll(c,{skin:'#f2c9a4',hair:'#2e2a30',top:'#6fa8dc',topDark:'#5a90c4',bot:'#4a4458',x:540,y:1330,s:1.15,face:1,noLegs:true,expr:{eyes:'open',mouth:A(1)>0&&Math.sin(T*10)>0?'o':'flat',brow:-0.5},pose:{armL:[2.7,3.1],armR:[0.8,1.4]}});deskF(c);
 const L=[];if(A(1)>0)L.push('Он учился с нами.');if(A(2)>0)L.push('В прошлом году.');if(A(3)>0)L.push('Они с Лизой близнецы.');
 if(L.length)bub(c,110,300-L.length*20,860,150+L.length*100,dm.head.x+40,dm.head.y-dm.HR-60,1,()=>L.forEach((l,i)=>txt(c,l,540,380-L.length*20+i*100,i==2?62:64,i==2?'#b3362e':'#3a2d3d')));
 c.restore()}
// 10-12: директор
function shotDirector(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1,k=a2>0?ease(a2/0.8):0;c.save();cam(c,540,1040,1.04+0.08*ease(t/d),0,0);
 const wg=c.createLinearGradient(0,0,0,1500);wg.addColorStop(0,'#7a5f48');wg.addColorStop(1,'#96785c');c.fillStyle=wg;c.fillRect(-200,-200,W+400,1700);
 paper(c,'#f3e6cf',()=>c.roundRect(600,300,380,440,16),20,10,0.3);const sg=c.createLinearGradient(0,320,0,720);sg.addColorStop(0,'#d98a5a');sg.addColorStop(1,'#f8d08a');c.fillStyle=sg;c.fillRect(620,320,340,400);
 paper(c,'#fbf4e4',()=>c.roundRect(120,330,300,220,8),10,5,0.25);txt(c,'ДИРЕКТОР',270,440,44,'#8a4a36');
 const fg=c.createLinearGradient(0,1500,0,H);fg.addColorStop(0,'#5a4030');fg.addColorStop(1,'#2a1e16');c.save();sh(c,20,-8,0.25);c.fillStyle=fg;c.fillRect(-200,1500,W+400,H);c.restore();
 const dr=doll(c,{...DIR,x:700,y:1340,s:1.35,face:-1,noLegs:true,expr:{eyes:a1>0&&a2<0?'closed':'open',mouth:'sad',brow:-0.8},pose:{headTilt:a1>0&&a2<0?0.25:0.05,armL:[1.0,1.5]}});specs(c,dr,-1);
 const te=teach(c,{x:230,y:1560,s:1.35,face:1,expr:{eyes:'open',mouth:'flat',brow:-0.4},pose:{armL:[0.9,1.5]}});
 paper(c,'#6a4a36',()=>c.roundRect(420,1250,620,60,16),22,11,0.35);paper(c,'#553a2a',()=>c.rect(450,1310,560,230),8,4,0.25);
 if(a2>0){c.save();c.translate(lerp(900,640,k),1236);c.rotate(-0.06);paper(c,'#c9564a',()=>c.roundRect(-150,-24,300,40,8),12,6,0.3);paper(c,'#fbf4e4',()=>c.roundRect(-110,-18,220,26,4),0,0,0);txt(c,'СОКОЛОВ М.',0,-4,22,'#3a2d3d');c.restore()}
 c.restore()}
// 13-15: декабрь
function winter(c,T){const sg=c.createLinearGradient(0,0,0,1400);sg.addColorStop(0,'#3a4a72');sg.addColorStop(1,'#a9b4cc');c.fillStyle=sg;c.fillRect(-200,-200,W+400,1700);
 [['#4a5376',3],['#5a648a',7]].forEach(([col,sd],li)=>{const r=rng(sd);let x=-100;while(x<W+100){const w=140+r()*120,hh=(li?420:560)+r()*240;paper(c,col,()=>c.rect(x,1300-hh,w,hh),10,5,0.25);c.fillStyle='#ffd98a';for(let yy=1300-hh+40;yy<1220;yy+=90)for(let xx=x+24;xx<x+w-40;xx+=60)if(r()<0.4)c.fillRect(xx,yy,26,40);x+=w+10}});
 paper(c,'#e9eef4',()=>c.rect(-200,1300,W+400,140),10,-5,0.2);paper(c,'#4a4e5a',()=>c.rect(-200,1440,W+400,700),10,-5,0.3);c.fillStyle='#e9e6dc';for(let i=0;i<7;i++)c.fillRect(120+i*130,1470,70,400)}
function shotWinterWalk(c,t,d,T,m){const ph=T*6,x=lerp(-100,420,t/d),wk=a=>({legL:[Math.sin(ph+a)*0.4,Math.sin(ph+a)*0.4-0.25],legR:[-Math.sin(ph+a)*0.4,-Math.sin(ph+a)*0.4-0.25],bob:-Math.abs(Math.sin(ph+a))*5});c.save();cam(c,540,1040,1.04+0.06*ease(t/d),0,0);winter(c,T);
 const l=doll(c,{...LIZA,top:'#c96a7a',topDark:'#b25a6a',x,y:1400,s:1.05,face:1,expr:{eyes:'closed',mouth:'smile'},pose:{...wk(1.5),armL:[0.3,0.5]}});bag(c,l.shd.x-70,l.shd.y+140,0.58,'#c96a7a',{key:false});
 const mi=doll(c,{...MISHA,x:x+230,y:1410,s:1.05,face:1,expr:{eyes:'closed',mouth:'smile'},pose:{...wk(0),armL:[0.3,0.5]}});bag(c,mi.shd.x-70,mi.shd.y+140,0.58,'#3f6fd0',{T});
 snow(c,T);c.restore();bigText(c,'ГОД НАЗАД',W/2,260,110,'#ffd60a',0.7+0.3*back(t/0.3),-0.02,22)}
// 16-18: машина
function shotCar(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1,hl=ease(t/((m[1]||2)+0.3)),push=a1>0?ease(a1/0.35):0;c.save();cam(c,540,1040,1.06+0.12*ease(t/d),a2<0?Math.sin(T*30)*3*hl:0,0);winter(c,T);
 if(a2<0){const l=doll(c,{...LIZA,top:'#c96a7a',topDark:'#b25a6a',x:lerp(380,180,push),y:1560,s:1.05,face:1,expr:{eyes:'wide',mouth:'o',brow:1},pose:{lean:-0.3*push,armL:[1.4,1.4]}});
  const mi=doll(c,{...MISHA,x:560,y:1570,s:1.05,face:-1,expr:{eyes:'wide',mouth:'o',brow:1},pose:{lean:0.2*push,armL:[1.5,1.55],armR:[1.3,1.5]}});bag(c,mi.shd.x+70,mi.shd.y+140,0.58,'#3f6fd0',{T});
  for(const yy of [1380,1520]){glow(c,1150-hl*160,yy,300+hl*700,'rgba(255,245,210,A)',0.5+0.5*hl);glow(c,1150-hl*160,yy,80+hl*120,'rgba(255,255,255,A)',1)}
  snow(c,T);c.restore();const w=a1>0.25?clamp((a1-0.25)/0.5):0;if(w>0){c.fillStyle=`rgba(255,255,255,${w})`;c.fillRect(0,0,W,H)}}
 else{bag(c,560,1760,1.3,'#3f6fd0',{T:0,rot:1.2});snow(c,T,120);c.restore();const w=1-clamp(a2/0.8);if(w>0){c.fillStyle=`rgba(255,255,255,${w})`;c.fillRect(0,0,W,H)}}}
// 19-23: кома
function shotComa(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,480,1100,1.25-0.2*ease(t/d),0,0);ward(c,T,{glass:false});c.restore();c.fillStyle='rgba(30,40,70,0.15)';c.fillRect(0,0,W,H);
 const L=[[1,'НЕ ГОВОРИТ'],[2,'НЕ ДВИГАЕТСЯ'],[3,'НЕ ОТКРЫВАЕТ ГЛАЗА']];L.forEach(([i,s],k)=>{if(A(i)>0&&A(4)<0){c.save();c.globalAlpha=clamp(A(i)/0.25);bigText(c,s,W/2,240+k*110,k==2?64:76,'#fff',0.7+0.3*back(A(i)/0.3),0,16);c.restore()}});
 if(A(4)>0)bigText(c,'КОМА',W/2,300,190,'#ffd60a',0.7+0.3*back(A(4)/0.3),-0.02,28)}
// 24: вычеркнули
function shotCrossed(c,t,d,T){c.save();cam(c,540,960,1.0+0.1*ease(t/d),0,0);paper(c,'#a87c4e',()=>c.rect(-200,-200,W+400,H+400),0,0,0);
 c.save();c.translate(540,980);c.rotate(-0.02);paper(c,'#3f8a86',()=>c.roundRect(-450,-420,900,840,20),40,20,0.4);paper(c,'#fbf6ea',()=>c.roundRect(-420,-390,840,780,10),6,3,0.2);txt(c,'ЖУРНАЛ · 4 «Б»',0,-310,56,'#3a2d3d');
 ['Сергеев Дима','Соколов Миша','Соколова Лиза','Тихонов Артём'].forEach((n,i)=>{const y=-170+i*130;txt(c,(21+i)+'.',-360,y,44,'#8a8478','left');txt(c,n,-270,y,52,'#3a2d3d','left');c.fillStyle='#d9cdb8';c.fillRect(-390,y+60,780,4);if(i==1){c.strokeStyle='#d0403a';c.lineWidth=12;c.lineCap='round';c.beginPath();c.moveTo(-290,y+4);c.lineTo(-290+420*clamp((t-0.5)/0.5),y-4);c.stroke();if(t>1.1)txt(c,'выбыл',250,y,40,'#d0403a')}});c.restore();c.restore()}
// 25-27: второй рюкзак
function shotSecondBag(c,t,d,T,m){const a2=m[2]!=null?t-m[2]:-1;c.save();cam(c,540,1040,1.04+0.08*ease(t/d),0,0);
 const wg=c.createLinearGradient(0,0,0,1500);wg.addColorStop(0,'#5a4a44');wg.addColorStop(1,'#7a6456');c.fillStyle=wg;c.fillRect(-200,-200,W+400,1700);const fg=c.createLinearGradient(0,1500,0,H);fg.addColorStop(0,'#6a4a3c');fg.addColorStop(1,'#3a2820');c.save();sh(c,20,-8,0.25);c.fillStyle=fg;c.fillRect(-200,1500,W+400,H);c.restore();
 paper(c,'#2a2230',()=>c.rect(60,330,400,1180),20,10,0.35);glow(c,260,900,500,'rgba(255,220,170,A)',0.5);paper(c,'#fbe9c8',()=>c.rect(80,350,360,1160),0,0,0);
 const l=doll(c,{...LIZA,x:300,y:1560,s:1.1,face:1,expr:{eyes:'open',mouth:a2>0&&Math.sin(T*10)>0?'o':'flat',brow:-0.2},pose:{armL:[0.5,0.9]}});bag(c,l.shd.x-74,l.shd.y+150,0.62,'#c96a7a',{key:false});bag(c,l.hf.x+20,l.hf.y+150,0.78,'#3f6fd0',{T});
 doll(c,{skin:'#f2c9a4',hair:'#6b4032',hairBack:true,top:'#8a9a6a',bot:'#5a4a5a',x:720,y:1570,s:1.3,face:-1,expr:{eyes:'closed',mouth:'sad',brow:-1,tear:T*0.4},pose:{armL:[2.0,3.0]}});const f=doll(c,{...DAD,top:'#6a6a8a',topDark:'#5a5a78',x:920,y:1580,s:1.38,face:-1,expr:{eyes:'open',mouth:'sad',brow:-0.9}});
 if(a2>0)bub(c,90,330,820,340,l.head.x+40,l.head.y-l.HR-30,back(a2/0.3),()=>lines(c,['Он проснётся','и ничего не пропустит.'],500,440,62,100));c.restore()}
// 28-30: палата 7
function shotDoor7r(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1;c.save();cam(c,620,1040,1.04+0.12*ease(t/d),0,0);hospP(c,T);c.fillStyle='rgba(20,30,60,0.3)';c.fillRect(-200,-200,W+400,H+400);
 paper(c,'#4c606a',()=>c.rect(560,380,360,1130),14,7,0.3);glow(c,600,900,300,'rgba(255,240,210,A)',0.6);paper(c,'#fbe9c8',()=>c.rect(580,400,50,1110),0,0,0);paper(c,'#e9eef0',()=>c.rect(630,400,270,1110),6,3,0.2);
 if(a1>0){paper(c,'#2b3c46',()=>c.roundRect(700,520,130,110,16),6,3,0.25);txt(c,'7',765,578,90,'#fff')}
 const k=easeOut(t/2.2);teach(c,{x:lerp(-150,300,k),y:1580,s:1.4,face:1,expr:{eyes:'open',mouth:'flat',brow:-0.4},pose:k<1?{legL:[Math.sin(T*7)*0.35,0],legR:[-Math.sin(T*7)*0.35,0]}:{}});c.restore()}
// 31-34: читала вслух
function shotReadAloud(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,540,1100,1.08+0.08*ease(t/d),0,0);ward(c,T);
 const l=lizaChair(c,T,{eyes:'open',mouth:A(1)>0&&Math.sin(T*10)>0?'o':'flat',brow:0.2});paper(c,'#c96a7a',()=>c.roundRect(l.hf.x-90,l.hf.y-60,150,110,8),10,5,0.3);paper(c,'#fbf6ea',()=>c.roundRect(l.hf.x-82,l.hf.y-52,134,94,4),0,0,0);
 if(A(2)>0){c.save();c.globalAlpha=clamp(A(2)/0.3);bigText(c,'§ 12',340,620,120,'#fff',0.7+0.3*back(A(2)/0.3),-0.05,22);c.restore()}if(A(3)>0)bigText(c,'½ + ¼',420,790,100,'#ffd60a',0.7+0.3*back(A(3)/0.3),0.03,20);c.restore()}
// 35-39: тетрадь под руку
function shotUnderHand(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1,k=A(1)>0?ease(A(1)/0.9):0;c.save();cam(c,lerp(540,600,ease(Math.max(0,A(4))/1)),1120,1.12+0.08*ease(t/d),0,0);const w=ward(c,T);
 const l=lizaChair(c,T,{eyes:'open',mouth:A(2)>0&&A(4)<0&&Math.sin(T*10)>0?'o':'smile',brow:0.2},{armL:[1.5,lerp(1.7,1.5,k)]});
 c.save();c.translate(lerp(l.hf.x-40,w.hand.x+10,k),lerp(l.hf.y-20,w.hand.y+14,k));c.rotate(-0.1);paper(c,'#3f6fd0',()=>c.roundRect(-70,-16,140,40,6),8,4,0.3);paper(c,'#fbf6ea',()=>c.roundRect(-62,-12,124,30,3),0,0,0);c.restore();paper(c,'#f2c9a4',()=>c.ellipse(w.hand.x,w.hand.y,30,22,0,0,7),6,3,0.25);
 if(A(4)>0)glow(c,935,1230,200,'rgba(255,220,150,A)',0.6*ease(A(4)/0.5));
 if(A(2)>0&&A(4)<0)bub(c,150,560,760,A(3)>0?330:200,l.head.x-20,l.head.y-l.HR-20,A(3)>0?1:back(A(2)/0.3),()=>{txt(c,'Смотри, Миш.',530,A(3)>0?650:662,62);if(A(3)>0)lines(c,['Это мы сегодня','проходили.'],530,730,52,70)});c.restore()}
// 40-41: автобус
function shotBus(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,bob=Math.sin(T*22)*3;c.save();cam(c,540,1000,1.04,0,0);
 const sg=c.createLinearGradient(0,0,0,1300);sg.addColorStop(0,'#5a4a8a');sg.addColorStop(0.6,'#d2707c');sg.addColorStop(1,'#f8b66a');c.fillStyle=sg;c.fillRect(-200,-200,W+400,1500);
 const r=rng(7);for(let i=0;i<9;i++){const w=160+r()*120,hh=380+r()*300,x=((i*330-T*520)%2970+2970)%2970-400;paper(c,'#5a4478',()=>c.rect(x,1300-hh,w,hh),12,6,0.25);c.fillStyle='#ffd98a';for(let yy=1300-hh+40;yy<1220;yy+=90)for(let xx=x+26;xx<x+w-40;xx+=64)c.fillRect(xx,yy,30,44)}
 paper(c,'#4a4a56',()=>c.rect(-200,1300,W+400,800),16,-8,0.3);c.fillStyle='#e9e1c6';for(let i=0;i<6;i++){const x=W+200-((T*1100+i*300)%1800);c.fillRect(x,1470,150,14)}
 const by=980+bob;paper(c,'#d9a441',()=>c.roundRect(150,by,780,340,[60,90,20,20]),20,10,0.35);c.fillStyle='#b5842f';c.fillRect(150,by+230,780,24);for(let j=0;j<4;j++){c.fillStyle='#fff1c9';c.beginPath();c.roundRect(200+j*172,by+50,140,130,16);c.fill()}
 c.save();c.beginPath();c.roundRect(372,by+50,140,130,16);c.clip();doll(c,{...LIZA,x:430,y:by+330,s:0.75,face:1,noLegs:true,expr:{eyes:'open',mouth:'flat'}});c.restore();bag(c,600,by+170,0.5,'#3f6fd0',{T});
 for(const wx of [320,780]){paper(c,'#22222a',()=>c.arc(wx,by+350,56,0,7),8,4,0.3)}c.restore();
 if(a1>0)bigText(c,'40 МИНУТ',W/2,300,120,'#ffd60a',0.7+0.3*back(a1/0.3),-0.02,22)}
// 42-45: рассказывает всё
function shotTellAll(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,540,1100,1.08+0.06*ease(t/d),0,0);ward(c,T);lizaChair(c,T,{eyes:'open',mouth:Math.sin(T*10)>0?'o':'smile',brow:0.5},{armL:[1.3+Math.sin(T*5)*0.3,2.1]});c.restore();
 card(c,230,520,-0.07,back(A(1)/0.3),()=>{c.strokeStyle='rgba(80,110,160,0.35)';c.lineWidth=3;for(let i=0;i<5;i++){c.beginPath();c.moveTo(-100,-70+i*40);c.lineTo(100,-70+i*40);c.stroke()}txt(c,'2',0,6,210,'#d0403a')});
 card(c,540,440,0.03,back(A(2)/0.3),()=>{txt(c,'💥',0,0,10,'#000');c.fillStyle='#e07a5f';c.beginPath();c.arc(-46,10,44,0,7);c.fill();c.fillStyle='#6fa8dc';c.beginPath();c.arc(46,10,44,0,7);c.fill();c.fillStyle='#ffd60a';for(let i=0;i<8;i++){const a=i*Math.PI/4;c.beginPath();c.moveTo(0,-70);c.lineTo(Math.cos(a)*26,-70+Math.sin(a)*26);c.lineTo(Math.cos(a+0.4)*10,-70+Math.sin(a+0.4)*10);c.fill()}});
 card(c,850,520,0.07,back(A(3)/0.3),()=>{c.save();c.translate(0,70);glass(c,0,0,1);c.restore()})}
// 46-47: до завтра
function shotKiss(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,k=ease(t/1.2)*(a1>0?1-ease(a1/0.8):1);c.save();cam(c,480,1120,1.2+0.1*ease(t/d),0,0);ward(c,T);
 const l=doll(c,{...LIZA,x:lerp(700,480,k),y:1560,s:1.0,face:-1,expr:{eyes:'closed',mouth:'smile',brow:-0.3},pose:{lean:0.1+0.5*k,armL:[1.2,1.5]}});
 if(a1<0&&t>0.9)bub(c,400,640,460,190,l.head.x+60,l.head.y-l.HR-10,back((t-0.9)/0.3),()=>txt(c,'До завтра.',630,738,62));
 for(let i=0;i<2;i++){const q=((T*0.5+i/2)%1);c.save();c.globalAlpha=Math.sin(q*Math.PI)*clamp(t-1);c.translate(330+i*70,1040-q*160);c.scale(0.6,0.6);paper(c,'#ff8a96',()=>{c.moveTo(0,30);c.bezierCurveTo(-70,-20,-40,-70,0,-34);c.bezierCurveTo(40,-70,70,-20,0,30)},8,4,0.25);c.restore()}
 c.restore()}
// 48-49: двести стаканов
function shotCompotes(c,t,d,T,m){const n=Math.min(200,Math.floor(200*ease(t/(d-0.8))));c.save();cam(c,540,960,1.0+0.06*ease(t/d),0,0);const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#9fb8c4');g.addColorStop(1,'#b9ced6');c.fillStyle=g;c.fillRect(-200,-200,W+400,H+400);
 for(let i=0;i<Math.min(48,Math.ceil(n/4.2));i++){const x=130+(i%8)*118,y=760+Math.floor(i/8)*170;c.save();c.translate(x,y);c.scale(0.62,0.62);glass(c,0,0,1);c.restore()}c.restore();
 bigText(c,String(n),W/2,300,220,'#ffd60a',1+0.04*Math.sin(T*16),0,28);bigText(c,'СТАКАНОВ',W/2,460,76,'#fff',1,0,16)}
// 50: учительница у двери
function shotTeacherDoor(c,t,d,T){c.save();cam(c,540,930,1.0+0.1*ease(t/d),0,0);hospBlur(c,T);const te=teach(c,{x:520,y:1760,s:2.6,face:1,noLegs:true,expr:{eyes:'closed',mouth:'sad',brow:-1,tear:T*0.5},pose:{headTilt:0.12,armL:[2.2,3.2]}});c.restore()}
// 51-54: врач
function shotDoctorNo(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,540,1040,1.06+0.08*ease(t/d),0,0);hospP(c,T);
 const dc=doll(c,{...DOC,x:330,y:1540,s:1.45,face:1,expr:{eyes:'open',mouth:A(1)>0&&Math.sin(T*10)>0?'o':'flat',brow:-0.5},pose:{armL:[0.9,1.6]}});mask(c,dc);
 teach(c,{x:780,y:1550,s:1.4,face:-1,expr:{eyes:'open',mouth:'sad',brow:-0.9,tear:T*0.3}});
 const L=[];if(A(1)>0)L.push('Вы зря надеетесь.');if(A(2)>0)L.push('Он ничего не слышит.');if(A(3)>0)L.push('Уже год.');
 if(L.length)bub(c,90,320-L.length*10,820,130+L.length*100,dc.head.x+30,dc.head.y-dc.HR-30,1,()=>L.forEach((l,i)=>txt(c,l,500,390-L.length*10+i*100,60,i==2?'#b3362e':'#3a2d3d')));c.restore()}
// 55-56: обернулась
function shotLookBack(c,t,d,T,m){c.save();cam(c,540,1060,1.04+0.1*ease(t/d),0,0);
 c.save();c.beginPath();c.roundRect(110,420,860,900,30);c.clip();c.translate(-40,-300);c.scale(1.15,1.15);ward(c,T);const l=lizaChair(c,T,{eyes:'open',mouth:Math.sin(T*10)>0?'o':'flat',brow:0.2});paper(c,'#c96a7a',()=>c.roundRect(l.hf.x-90,l.hf.y-60,150,110,8),10,5,0.3);c.restore();
 c.strokeStyle='#5f8a84';c.lineWidth=30;c.beginPath();c.roundRect(110,420,860,900,30);c.stroke();c.fillStyle='#a3c4bc';c.fillRect(-200,-200,W+400,605);c.fillRect(-200,1335,W+400,900);c.fillRect(-200,400,295,950);c.fillRect(985,400,400,950);
 teach(c,{x:820,y:1900,s:1.9,face:-1,noLegs:true,expr:{eyes:'wide',mouth:'flat',brow:0.6,tear:T*0.3}});c.restore()}
// 57: палец дрогнул
function shotFinger(c,t,d,T){const tw=t>1.3?Math.sin((t-1.3)*26)*Math.exp(-(t-1.3)*3):0;c.save();cam(c,540,960,1.0+0.14*ease(t/d),0,0);
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#8fb2c8');g.addColorStop(1,'#6f93aa');c.fillStyle=g;c.fillRect(-200,-200,W+400,H+400);glow(c,540,900,900,'rgba(255,240,210,A)',0.35);
 c.save();c.translate(540,1060);c.rotate(-0.06);paper(c,'#3f6fd0',()=>c.roundRect(-420,-260,840,560,16),30,15,0.4);paper(c,'#fbf6ea',()=>c.roundRect(-390,-230,780,500,8),4,2,0.2);c.save();c.translate(0,60);scribble(c,6,1,'#2b3a66',true,0.7);c.restore();c.restore();
 c.save();sh(c,20,10,0.3);c.strokeStyle='#bfd8e6';c.lineWidth=170;c.lineCap='round';c.beginPath();c.moveTo(-200,560);c.lineTo(330,800);c.stroke();c.restore();
 paper(c,'#f2c9a4',()=>c.ellipse(430,850,130,100,0.4,0,7),16,8,0.3);
 [[0.25,0],[0.55,0],[0.85,1],[1.15,0]].forEach(([a,act],i)=>{const an=a+(act?tw*0.5:0),len=170-(i==3?40:0)-(act?Math.abs(tw)*30:0);c.save();sh(c,10,5,0.25);c.strokeStyle='#f2c9a4';c.lineWidth=52;c.lineCap='round';c.beginPath();c.moveTo(470+i*10,880);c.lineTo(470+i*10+Math.cos(an)*len,880+Math.sin(an)*len);c.stroke();c.restore()});
 if(Math.abs(tw)>0.05){c.strokeStyle='#ffd60a';c.lineWidth=10;c.lineCap='round';for(let i=0;i<5;i++){const a=0.4+i*0.25;c.beginPath();c.moveTo(600+Math.cos(a)*190,1010+Math.sin(a)*190);c.lineTo(600+Math.cos(a)*250,1010+Math.sin(a)*250);c.stroke()}}
 c.restore()}

function hook(c,T){const a=1-ease((T-2.4)/0.3);if(a<=0)return;c.save();c.globalAlpha=a;bigText(c,'ЧАСТЬ 2',W/2,1720,150,'#ffd60a',0.7+0.3*back(T/0.3),-0.02,26);c.restore()}
function outro(c,T){const s=window.DATA.outro;if(T<s)return;bigText(c,'ОН СЛЫШИТ?',W/2,230,120,'#ffd60a',0.7+0.3*back((T-s)/0.3),-0.02,24);if(T>s+0.4)bigText(c,'ЧАСТЬ 3 — СКОРО',W/2,360,70,'#fff',0.7+0.3*back((T-s-0.4)/0.3),0,14)}
Object.assign(FN,{shotJournal2,shotAskWho,shotRunOut,shotDima,shotDirector,shotWinterWalk,shotCar,shotComa,shotCrossed,shotSecondBag,shotDoor7r,shotReadAloud,shotUnderHand,shotBus,shotTellAll,shotKiss,shotCompotes,shotTeacherDoor,shotDoctorNo,shotLookBack,shotFinger});

// «Номер мамы», часть 3 — сцены. Подключается после shots_p2.js
function angry(c,m,f){const HR=m.HR,ey=m.head.y+HR*0.12;c.strokeStyle='#3a2a24';c.lineWidth=HR*0.09;c.lineCap='round';[[0.14,1],[0.62,-1]].forEach(([dx,s2])=>{const x=m.head.x+f*HR*dx;c.beginPath();c.moveTo(x-f*s2*HR*0.16,ey-HR*0.36);c.lineTo(x+f*s2*HR*0.16,ey-HR*0.22);c.stroke()})}
function kitBg(c,T,dark=0.3){c.save();c.filter='blur(9px)';c.translate(-300,-500);c.scale(1.6,1.6);kitchen(c,T,true);c.restore();c.fillStyle=`rgba(20,26,50,${dark})`;c.fillRect(-200,-200,W+400,H+400);glow(c,540,600,800,'rgba(255,205,130,A)',0.3)}
function dadClose(c,T,o={}){const f=o.face||1,dd=doll(c,{...DAD,x:o.x||540,y:1760,s:2.7,face:f,noLegs:true,expr:o.expr||{eyes:'open',mouth:'flat'},pose:{lean:0.02,headTilt:0.06,armL:o.phone===false?[0.2,0.4]:[-2.3,-3.3],armR:[0.2,0.5],bob:Math.sin(T*1.4)*4,...(o.pose||{})}});stubble(c,dd,f);if(o.phone!==false)phoneMini(c,dd.hf.x-f*16,dd.hf.y-50,f*0.12,2.7,0.5);if(o.angry)angry(c,dd,f);return dd}
function tearsBoth(c,m,T){for(let i=0;i<2;i++){const q=((T*0.7+i*0.4)%1);c.fillStyle=`rgba(150,205,255,${1-q*0.6})`;c.beginPath();c.ellipse(m.head.x+m.HR*(0.14+i*0.48),m.head.y+m.HR*(0.3+q*0.8),m.HR*0.06,m.HR*0.1,0,0,7);c.fill()}}
function lines(c,L,x,y,size,lh,col){L.forEach((l,i)=>txt(c,l,x,y+i*lh,size,col))}

// 2: папа нажал вызов
function shotDadCalls(c,t,d,T){c.save();cam(c,540,930,1.0+0.08*ease(t/d),0,0);closeBg(c,T,0.36);const dd=dadClose(c,T,{angry:true,expr:{eyes:'open',mouth:'flat'}});rings(c,dd.hf.x-60,dd.hf.y-60,T);c.restore()}
// 3-4: «Тимочка, ты что-то забыл?»
function shotVeraHappy(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1;c.save();cam(c,540,900,1.0+0.08*ease(t/d),0,0);veraBg(c,T,0.2);veraClose(c,T,{eyes:'closed',mouth:a1>0&&Math.sin(T*10)>0?'o':'smile',brow:0.5});
 if(a1>0)bub(c,130,180,820,400,330,650,back(a1/0.3),()=>lines(c,['Тимочка,','ты что-то забыл?'],540,310,72,120));c.restore()}
// 5-6: «Кто вы?»
function shotDadAngry(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1;c.save();cam(c,540,930,1.0+0.08*ease(t/d),Math.sin(T*30)*3,0);closeBg(c,T,0.4);const dd=dadClose(c,T,{angry:true,expr:{eyes:'open',mouth:Math.sin(T*11)>0?'o':'flat'}});
 bub(c,110,170,860,a1>0?480:260,dd.head.x+80,dd.head.y-dd.HR-40,a1>0?1:back((t-0.14)/0.25),()=>{txt(c,'Кто вы?',540,a1>0?270:300,110,'#b3362e');if(a1>0)lines(c,['Зачем вы обманываете','моего сына?'],540,410,56,90)});c.restore()}
// 7-9: не слушал
function shotExplain(c,t,d,T,m){const a2=m[2]!=null?t-m[2]:-1;c.save();cam(c,540,960,1.0+0.04*ease(t/d),0,0);
 c.save();c.beginPath();c.rect(0,0,W,940);c.clip();c.translate(-388,-1197);c.scale(1.45,1.45);veraRoom(c,T,{noPhone:true});veraSit(c,T,{expr:{eyes:'open',mouth:Math.sin(T*10)>0?'o':'sad',brow:-0.9},pose:{armR:[1.3+Math.sin(T*6)*0.3,2.0]}});c.restore();
 c.save();c.beginPath();c.rect(0,980,W,H);c.clip();c.save();c.filter='blur(8px)';c.translate(-250,300);c.scale(1.5,1.5);room(c,T);c.restore();c.fillStyle='rgba(40,30,60,0.35)';c.fillRect(0,980,W,H);
 const dd=doll(c,{...DAD,x:680,y:1660,s:1.6,face:-1,noLegs:true,expr:{eyes:'open',mouth:'flat'},pose:{armL:[-2.3,-3.3],armR:[0.2,0.4]}});stubble(c,dd,-1);angry(c,dd,-1);phoneMini(c,dd.hf.x+12,dd.hf.y-30,-0.12,1.6,0.5);
 if(a2>0)bub(c,50,1020,430,300,440,1380,back(a2/0.3),()=>{mom(c,160,1120,58);txt(c,'МАМА',320,1120,50);txt(c,'8 900 555 14 08',265,1240,34,'#5a4d58')});c.restore();
 paper(c,'#fbf4e4',()=>c.rect(-50,940,W+100,40),16,8,0.35);c.restore()}
// 10-11: «Не звоните ему больше»
function shotDadForbid(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1;c.save();cam(c,540,930,1.0+0.1*ease(t/d),Math.sin(T*30)*3,0);closeBg(c,T,0.45);const dd=dadClose(c,T,{angry:true,expr:{eyes:'open',mouth:Math.sin(T*11)>0?'o':'flat'}});
 bub(c,110,170,860,a1>0?460:330,dd.head.x+80,dd.head.y-dd.HR-40,a1>0?1:back((t-0.14)/0.25),()=>{lines(c,['Не звоните','ему больше.'],540,a1>0?260:280,88,110);if(a1>0)txt(c,'НИКОГДА.',540,520,110,'#b3362e')});c.restore()}
// 12: забрал телефон
function shotTakePhone(c,t,d,T){const k=ease(t/0.7);c.save();cam(c,520,1040,1.06+0.08*ease(t/d),0,0);room(c,T);
 const b=doll(c,{...BOY,x:440,y:1262,s:1.0,face:1,expr:{eyes:'wide',mouth:'o',brow:1},pose:{lean:0.2,...SITB,armL:[2.4,3.0],armR:[2.2,2.8],bob:Math.sin(T*24)*2}});
 const dd=doll(c,{...DAD,x:760,y:1540,s:1.4,face:-1,expr:{eyes:'open',mouth:'flat'},pose:{lean:-0.06,armL:[lerp(1.2,-2.7,k),lerp(1.6,-3.1,k)],armR:[-0.1,0.1]}});stubble(c,dd,-1);angry(c,dd,-1);phoneMini(c,dd.hf.x+10,dd.hf.y-30,0.2,1.3,0.5);c.restore()}
// 13-16: Тима закричал
function shotBoyScream(c,t,d,T,m){const a2=m[2]!=null?t-m[2]:-1,a3=m[3]!=null?t-m[3]:-1,sh2=a2>0?8:3;c.save();cam(c,560,900,1.02+0.12*ease(t/d),Math.sin(T*34)*sh2,Math.cos(T*29)*sh2);closeBg(c,T,0.45);
 const b=boyClose(c,T,{eyes:'closed',mouth:'o',brow:-1},{headTilt:-0.04,armL:[0.6,1.2],armR:[0.5,1.1],bob:Math.sin(T*24)*4},false);tearsBoth(c,b,T);
 if(a2>0)bub(c,70,150,940,a3>0?480:330,640,650,a3>0?1:back(a2/0.25),()=>{lines(c,['Ты отнял','у меня маму!'],540,a3>0?250:260,96,116,'#b3362e');if(a3>0)txt(c,'ВТОРОЙ РАЗ!',540,520,104,'#b3362e')});c.restore()}
// 17-19: папа замер
function shotDadFrozen(c,t,d,T,m){const a2=m[2]!=null?t-m[2]:-1;c.save();cam(c,540,1040,1.04+0.08*ease(t/d),0,0);room(c,T);
 const b=doll(c,{...BOY,x:440,y:1262,s:1.0,face:-1,expr:{eyes:'closed',mouth:'sad',brow:-1},pose:{lean:0.3,headTilt:0.3,...SITB,legL:[-1.45,-0.05],legR:[-1.38,0.04],armL:[2.2,3.2],armR:[2.0,3.1],bob:Math.sin(T*20)*3}});tearsBoth(c,b,T);
 const dd=doll(c,{...DAD,x:800,y:1540,s:1.4,face:-1,expr:{eyes:'wide',mouth:'o',brow:1},pose:{armL:[0.3,0.4],armR:[-0.1,0.1]}});stubble(c,dd,-1);phoneMini(c,dd.hf.x+6,dd.hf.y+20,0.4,1.3,0.3);
 if(a2>0)bub(c,560,330,440,380,760,790,back(a2/0.3),()=>{c.fillStyle='#8a929c';c.beginPath();c.roundRect(600,370,360,300,30);c.fill();doll(c,{...BOY,top:'#3a4252',topDark:'#30384a',stripe:null,x:780,y:700,s:0.7,noLegs:true,expr:{eyes:'open',mouth:'flat'}})});
 c.restore()}
// 20-21: закрыл дверь
function shotDoor(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,cl=a1>0?easeOut(a1/0.35):0;c.save();cam(c,560,1040,1.04+0.06*ease(t/d),cl>0.95&&a1<0.6?Math.sin(T*50)*6:0,0);
 const wg=c.createLinearGradient(0,0,0,1500);wg.addColorStop(0,'#5a4a44');wg.addColorStop(1,'#7a6456');c.fillStyle=wg;c.fillRect(-200,-200,W+400,1700);
 const fg=c.createLinearGradient(0,1500,0,H);fg.addColorStop(0,'#6a4a3c');fg.addColorStop(1,'#3a2820');c.save();sh(c,20,-8,0.25);c.fillStyle=fg;c.fillRect(-200,1500,W+400,H);c.restore();
 paper(c,'#2a2230',()=>c.rect(560,330,400,1180),20,10,0.35);if(cl<1){glow(c,760,900,500*(1-cl),'rgba(255,200,130,A)',0.5*(1-cl));paper(c,'#ffd9a0',()=>c.rect(580+360*cl,350,360*(1-cl),1160),0,0,0)}
 paper(c,'#f3e6cf',()=>c.rect(580,350,360*Math.max(0.08,cl),1160),14,7,0.3);if(cl>0.6){paper(c,'#4f86c6',()=>c.roundRect(650,620,220,90,16),8,4,0.25);txt(c,'ТИМА',760,668,54,'#fff');paper(c,'#e9c98a',()=>c.arc(900,960,16,0,7),4,2,0.3)}
 paper(c,'#8a5d4a',()=>{c.rect(540,310,40,1200);c.rect(940,310,40,1200);c.rect(540,300,440,40)},12,6,0.3);
 const dd=doll(c,{...DAD,x:330,y:1540,s:1.45,face:1,expr:{eyes:a1>0?'closed':'open',mouth:'sad',brow:-1},pose:{lean:a1>0?0.04:0.1,headTilt:a1>0?0.3:0,armL:a1>0?[0.2,0.3]:[1.3,1.5],armR:[-0.1,0.1]}});stubble(c,dd,1);
 c.restore();if(a1>0&&a1<0.7){c.save();c.globalAlpha=1-a1/0.7;bigText(c,'хлоп!',760,560,110,'#fff',1+a1*0.4,0.08,18);c.restore()}}
// 22-26: два телефона
function shotDadTwoPhones(c,t,d,T,m){const a2=m[2]!=null?t-m[2]:-1,a3=m[3]!=null?t-m[3]:-1,a4=m[4]!=null?t-m[4]:-1,up=ease(Math.max(0,a2)/0.6);c.save();cam(c,520,1040,1.06+0.12*ease(t/d),0,0);kitchen(c,T,true);clockP(c,180,700,90,1,40);chairP(c,440,true);
 const dd=doll(c,{...DAD,x:440,y:1340,s:1.5,face:1,noLegs:true,expr:{eyes:a4>0?'closed':'open',mouth:a4>0?'sad':'flat',brow:a4>0?-1:0},pose:{lean:0.08,headTilt:0.14,armL:[lerp(1.0,-2.3,up),lerp(1.5,-3.3,up)],armR:[1.0,1.5]}});stubble(c,dd,1);if(a3>0&&a4<0)angry(c,dd,1);
 tableP(c,true);
 c.save();c.translate(700,1236);c.rotate(-0.1);paper(c,'#2a2630',()=>c.roundRect(-36,-70,72,140,12),10,5,0.3);c.fillStyle='#3a4660';c.fillRect(-29,-62,58,124);c.restore();
 if(up<0.5){c.save();c.translate(590,1236);c.rotate(0.12);glow(c,0,0,160,'rgba(150,200,255,A)',0.5);paper(c,'#2a2630',()=>c.roundRect(-36,-70,72,140,12),10,5,0.3);c.fillStyle='#9fd0ff';c.fillRect(-29,-62,58,124);paper(c,'#ffd60a',()=>c.arc(0,40,12,0,7),2,1,0.2);c.restore()}else phoneMini(c,dd.hf.x-10,dd.hf.y-30,0.12,1.5,0.6);
 c.restore();c.fillStyle='rgba(20,26,50,0.25)';c.fillRect(0,0,W,H);if(a2<0&&m[1]!=null&&t>m[1])bigText(c,'2',W/2,280,200,'#ffd60a',0.7+0.3*back((t-m[1])/0.3),0,26)}
function shotDadSorry(c,t,d,T){c.save();cam(c,540,930,1.0+0.08*ease(t/d),0,0);kitBg(c,T);const dd=dadClose(c,T,{expr:{eyes:'closed',mouth:'sad',brow:-1,tear:T*0.4}});
 bub(c,170,200,740,280,dd.head.x+80,dd.head.y-dd.HR-40,back((t-0.14)/0.3),()=>txt(c,'Простите меня…',540,340,68));c.restore()}
function shotVeraSilent(c,t,d,T,m){c.save();cam(c,540,900,1.0+0.08*ease(t/d),0,0);veraBg(c,T,0.3);veraClose(c,T,{eyes:'closed',mouth:'flat',brow:-0.6,tear:T*0.3});
 const k=(T*0.8)%1;bub(c,360,280,360,200,420,640,1,()=>{for(let i=0;i<3;i++){c.fillStyle=`rgba(58,45,61,${0.3+0.7*(Math.floor(k*3)==i?1:0)})`;c.beginPath();c.arc(460+i*80,380,20,0,7);c.fill()}});c.restore()}
// 30-31: «Он рассказывал мне про вашу кашу»
function shotVeraSpeaks(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1;c.save();cam(c,540,900,1.0+0.08*ease(t/d),0,0);veraBg(c,T,0.25);veraClose(c,T,{eyes:'open',mouth:Math.sin(T*10)>0?'o':'smile',brow:-0.3});
 bub(c,90,150,900,a1>0?520:300,330,700,a1>0?1:back((t-0.14)/0.3),()=>{lines(c,['Он рассказывал мне','про вашу кашу.'],540,a1>0?240:250,70,96);if(a1>0)lines(c,['И про то,','что вы не плачете.'],540,470,70,96)});
 card(c,900,760,0.08,back((t-0.6)/0.3)*0.8,()=>{c.save();c.filter='blur(6px)';for(let i=0;i<4;i++){const k=((T*0.5+i/4)%1);c.fillStyle=`rgba(50,45,50,${0.8*(1-k)})`;c.beginPath();c.arc(Math.sin(i*2+T)*20,-40-k*90,22+k*26,0,7);c.fill()}c.restore();paper(c,'#7c8794',()=>c.roundRect(-80,-10,160,100,16),10,5,0.25);c.fillStyle='#2a2428';c.fillRect(-70,-10,140,22)});c.restore()}
// 32-35: через стенку
function shotWall(c,t,d,T,m){const a3=m[3]!=null?t-m[3]:-1;c.save();cam(c,540,1000,1.0+0.06*ease(t/d),0,0);
 // слева кухня
 c.save();c.beginPath();c.rect(-200,-200,700,H+400);c.clip();const g1=c.createLinearGradient(0,0,0,1500);g1.addColorStop(0,'#28303f');g1.addColorStop(1,'#3a465c');c.fillStyle=g1;c.fillRect(-200,-200,700,1700);glow(c,250,700,600,'rgba(255,205,130,A)',0.3);
 paper(c,'#6a4a3c',()=>c.rect(242,-100,16,460),6,3,0.3);paper(c,'#ffe3a6',()=>{c.moveTo(170,340);c.lineTo(330,340);c.lineTo(380,460);c.lineTo(120,460);c.closePath()},18,9,0.3);
 const fg=c.createLinearGradient(0,1500,0,H);fg.addColorStop(0,'#2a3040');fg.addColorStop(1,'#151923');c.fillStyle=fg;c.fillRect(-200,1500,700,H);
 const dd=doll(c,{...DAD,x:240,y:1340,s:1.4,face:1,noLegs:true,expr:{eyes:'closed',mouth:'sad',brow:-1},pose:{lean:0.14,headTilt:0.3,armL:[2.2,3.3],armR:[2.0,3.2],bob:Math.sin(T*20)*3}});stubble(c,dd,1);
 for(const dx of [0.1,0.66])paper(c,'#eebf98',()=>c.ellipse(dd.head.x+dx*dd.HR,dd.head.y+dd.HR*0.12,dd.HR*0.36,dd.HR*0.5,0.2,0,7),10,5,0.3);
 paper(c,'#6a5548',()=>c.roundRect(40,1250,420,50,16),20,10,0.35);paper(c,'#55443a',()=>c.rect(80,1300,26,330),10,5,0.3);c.restore();
 // справа детская
 c.save();c.beginPath();c.rect(580,-200,700,H+400);c.clip();const g2=c.createLinearGradient(0,0,0,1500);g2.addColorStop(0,'#1e2a38');g2.addColorStop(1,'#2c3c4c');c.fillStyle=g2;c.fillRect(580,-200,700,1700);
 paper(c,'#f3e6cf',()=>c.roundRect(700,380,280,330,16),16,8,0.3);c.fillStyle='#141a33';c.fillRect(720,400,240,290);glow(c,880,480,120,'rgba(220,230,255,A)',0.5);paper(c,'#f3f0dc',()=>c.arc(880,480,30,0,7),6,3,0.2);
 const fg2=c.createLinearGradient(0,1500,0,H);fg2.addColorStop(0,'#3a2c2a');fg2.addColorStop(1,'#1c1514');c.fillStyle=fg2;c.fillRect(580,1500,700,H);
 paper(c,'#6a4a3c',()=>c.roundRect(600,1380,560,130,16),18,9,0.33);paper(c,'#f6efe2',()=>c.roundRect(610,1250,540,150,34),16,8,0.3);paper(c,'#fffaf0',()=>c.roundRect(630,1180,220,110,48),12,6,0.3);
 const bx=740,by=1190;paper(c,'#f2c9a4',()=>c.arc(bx,by,80,0,7),14,7,0.3);c.fillStyle='#6b4032';c.beginPath();c.arc(bx,by-6,84,Math.PI*1.02,Math.PI*1.98);c.quadraticCurveTo(bx+30,by-30,bx-84,by+10);c.fill();
 for(const ex of [bx+4,bx+42]){c.fillStyle='#fff';c.beginPath();c.ellipse(ex,by+16,15,18,0,0,7);c.fill();c.fillStyle='#2a1f2d';c.beginPath();c.ellipse(ex-2,by+16,8,11,0,0,7);c.fill()}
 paper(c,'#b98a3c',()=>{c.moveTo(770,a3>0?1228:1262);c.quadraticCurveTo(960,1210,1160,1262);c.lineTo(1160,1410);c.lineTo(770,1410);c.closePath()},16,8,0.32);
 if(a3>0)bub(c,640,760,400,330,760,1100,back(a3/0.3),()=>{const q=doll(c,{...DAD,x:830,y:1070,s:0.72,noLegs:true,expr:{eyes:'closed',mouth:'sad',brow:-1,tear:T*0.5}});stubble(c,q,1)});
 c.restore();
 // стена
 paper(c,'#8a7a6c',()=>c.rect(500,-200,80,H+400),24,0,0.45);c.strokeStyle='rgba(0,0,0,0.18)';c.lineWidth=4;for(let y=-100;y<H+100;y+=70){c.beginPath();c.moveTo(500,y);c.lineTo(580,y);c.stroke();c.beginPath();c.moveTo(540+(Math.round(y/70)%2?-20:20),y);c.lineTo(540+(Math.round(y/70)%2?-20:20),y+70);c.stroke()}
 c.save();c.strokeStyle='rgba(180,215,255,0.8)';c.lineWidth=9;c.lineCap='round';for(let i=0;i<4;i++){const k=((T*0.7+i/4)%1);c.globalAlpha=(1-k)*0.9;c.beginPath();c.arc(330,1080,120+k*520,-0.5,0.5);c.stroke()}c.restore();
 c.restore();c.fillStyle='rgba(15,20,45,0.2)';c.fillRect(0,0,W,H)}
function shotDadEyes(c,t,d,T){c.save();cam(c,540,900,1.05+0.1*ease(t/d),0,0);kitBg(c,T,0.35);const dd=dadClose(c,T,{expr:{eyes:'closed',mouth:'sad',brow:-1,tear:T*0.45},pose:{headTilt:0.16}});tearsBoth(c,dd,T);c.restore()}
// 37-41: Вера и её сын
function shotVeraSon(c,t,d,T,m){const a3=m[3]!=null?t-m[3]:-1,gone=a3>0?ease(a3/1.0):0;c.save();cam(c,540,1060,1.04+0.1*ease(t/d),0,0);kitchen(c,T,false);glow(c,540,700,800,'rgba(255,210,150,A)',0.35);
 paper(c,'#6a4a3c',()=>c.rect(532,-100,16,420),6,3,0.3);paper(c,'#ffe3a6',()=>{c.moveTo(450,300);c.lineTo(630,300);c.lineTo(690,430);c.lineTo(390,430);c.closePath()},18,9,0.3);chairP(c,860,false);
 vera(c,{hair:'#b9a89a',x:230,y:1340,s:1.3,face:1,noLegs:true,expr:{eyes:gone>0.5?'closed':'open',mouth:'flat',brow:-0.6,tear:gone>0.5?T*0.4:0},pose:{lean:0.1,headTilt:0.22,armL:[1.0,1.5],armR:[0.8,1.4]}});
 c.save();c.globalAlpha=1-gone;const s2=doll(c,{skin:'#eebf98',hair:'#3a2a24',top:'#4f6f8a',topDark:'#42607a',bot:'#3a3a48',x:860,y:1340,s:1.35,face:-1,noLegs:true,expr:{eyes:'open',mouth:'flat',brow:-0.5},pose:{lean:0.1,headTilt:0.24,armL:[1.0,1.5],armR:[0.8,1.4]}});c.restore();
 tableP(c,false);for(const x of [330,760]){paper(c,'#f6efe2',()=>c.roundRect(x-30,1196,60,56,10),8,4,0.3)}
 if(gone>0.3){const k=back((gone-0.3)/0.4);c.save();c.translate(860,640);c.scale(k,k);paper(c,'#f3e6cf',()=>c.roundRect(-90,-110,180,220,10),16,8,0.35);c.fillStyle='#c9a27a';c.fillRect(-76,-96,152,192);c.fillStyle='#3a2a24';c.beginPath();c.arc(0,-20,34,Math.PI,0);c.fill();c.fillStyle='#eebf98';c.beginPath();c.arc(0,-14,30,0,7);c.fill();c.fillStyle='#4f6f8a';c.fillRect(-44,22,88,70);c.fillStyle='#1c1c22';c.beginPath();c.moveTo(40,96);c.lineTo(76,60);c.lineTo(76,96);c.fill();c.restore()}
 c.restore();c.fillStyle='rgba(120,80,40,0.16)';c.fillRect(0,0,W,H);if(gone>0.5)bigText(c,'СЕРЁЖА',W/2,250,110,'#ffd60a',0.7+0.3*back((gone-0.5)/0.3),-0.02,22)}
function shotVeraDont(c,t,d,T){c.save();cam(c,540,900,1.0+0.1*ease(t/d),0,0);veraBg(c,T,0.25);veraClose(c,T,{eyes:'open',mouth:'flat',brow:-0.4,tear:T*0.3});
 bub(c,170,190,740,300,330,650,back((t-0.14)/0.3),()=>txt(c,'Не молчите.',540,340,92,'#b3362e'));c.restore()}
// 43-44: папа вошёл в детскую
function nightRoom(c,T){room(c,T,{lamp:false});c.fillStyle='rgba(15,20,50,0.5)';c.fillRect(-200,-200,W+400,H+400);glow(c,770,620,500,'rgba(190,210,255,A)',0.25)}
function shotDadGoes(c,t,d,T,m){const op=ease(t/0.9);c.save();cam(c,540,1040,1.02+0.07*ease(t/d),0,0);nightRoom(c,T);
 doll(c,{...BOY,x:440,y:1262,s:1.0,face:-1,expr:{eyes:'open',mouth:'sad',brow:-0.8},pose:{lean:0.12,headTilt:0.1,legL:[-1.9,-0.4],legR:[-1.8,-0.5],armL:[-1.4,-1.0],armR:[-1.2,-0.8]}});
 paper(c,'#2a2230',()=>c.rect(820,300,460,1210),30,10,0.4);glow(c,1000,900,560*op,'rgba(255,200,130,A)',0.5*op);paper(c,'#ffd9a0',()=>c.rect(860,340,400*op,1170),0,0,0);
 if(op>0.4){const dd=doll(c,{...DAD,x:lerp(1200,960,ease((t-0.4)/0.8)),y:1210,s:1.35,face:-1,expr:{eyes:'open',mouth:'sad',brow:-0.9},pose:{lean:0.04}});stubble(c,dd,-1)}
 paper(c,'#8a5d4a',()=>c.rect(790,280,50,1230),14,7,0.35);c.restore()}
// 45-47: «Я тоже ей звоню»
function bedDuo(c,T,o){const h=o.hug||0;const dd=doll(c,{...DAD,x:300+h*40,y:1262,s:1.3,face:1,expr:o.de,pose:{lean:0.04+0.2*h,...SITB,armL:o.dArm||[lerp(0.9,1.4,h),lerp(1.6,1.5,h)],armR:[0.4,0.9],bob:Math.sin(T*1.5)*2}});stubble(c,dd,1);
 const b=doll(c,{...BOY,x:560-h*40,y:1262,s:1.0,face:-1,expr:o.be,pose:{lean:0.04+0.25*h,...SITB,legL:[-1.45,-0.05],legR:[-1.38,0.04],armL:o.bArm||[lerp(0.6,1.4,h),lerp(1.2,1.5,h)],armR:[0.4,0.9],bob:Math.sin(T*1.5+1)*2}});return{dd,b}}
function shotConfess(c,t,d,T,m){const a2=m[2]!=null?t-m[2]:-1,a1=m[1]!=null?t-m[1]:-1,h=ease(Math.max(0,a2)/0.8);c.save();cam(c,460,1040,1.12+0.1*ease(t/d),0,0);nightRoom(c,T);
 const r=bedDuo(c,T,{hug:h,de:{eyes:h>0.5?'closed':'open',mouth:'sad',brow:-1,tear:T*0.4},be:{eyes:h>0.5?'closed':'wide',mouth:h>0.5?'sad':'o',brow:h>0.5?-1:1,tear:h>0.3?T*0.5:0}});
 if(h<0.3){phoneMini(c,r.dd.hf.x+10,r.dd.hf.y-20,0.3,1.2,0.5)}
 if(a2<0)bub(c,130,330,600,a1>0?330:230,r.dd.head.x+40,r.dd.head.y-r.dd.HR-30,a1>0?1:back((t-0.14)/0.3),()=>{txt(c,'Я тоже ей звоню.',430,a1>0?420:445,54);if(a1>0)txt(c,'Каждую ночь.',430,540,54)});
 if(h>0.6)for(let i=0;i<3;i++){const q=((T*0.5+i/3)%1);c.save();c.globalAlpha=Math.sin(q*Math.PI);c.translate(430+Math.sin(i*2+T)*60,900-q*200);c.scale(0.8,0.8);paper(c,'#ff8a96',()=>{c.moveTo(0,30);c.bezierCurveTo(-70,-20,-40,-70,0,-34);c.bezierCurveTo(40,-70,70,-20,0,30)},8,4,0.25);c.restore()}
 c.restore()}
// 48-50: папа рассказал
function shotStories(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1;c.save();cam(c,460,1080,1.08+0.05*ease(t/d),0,0);nightRoom(c,T);
 bedDuo(c,T,{hug:0.5,de:{eyes:'closed',mouth:Math.sin(T*9)>0?'o':'smile',brow:0.3},be:{eyes:'open',mouth:'smile',brow:0.6}});c.restore();
 if(a1>0&&a2<0)memCardP(c,540,560,-0.03,back(a1/0.3),()=>{c.fillStyle='#f8d9b8';c.fillRect(-270,-230,540,430);doll(c,{...MOM,x:-130,y:170,s:0.95,face:1,noLegs:true,expr:{eyes:'closed',mouth:'smile'},pose:{armL:[1.2,1.3]}});
   paper(c,'#fbf4e4',()=>c.roundRect(10,-200,240,330,12),8,4,0.25);[['Артём',0],['Миша',0],['Тимофей',1]].forEach(([n,ok],i)=>{txt(c,n,40,-140+i*100,ok?46:40,ok?'#b3362e':'#8a8478','left');if(!ok){c.strokeStyle='#8a8478';c.lineWidth=5;c.beginPath();c.moveTo(36,-140+i*100);c.lineTo(200,-140+i*100);c.stroke()}else txt(c,'♥',220,-140+i*100,44,'#e0566a','right')})});
 if(a2>0)memCardP(c,540,560,0.03,back(a2/0.3),()=>{c.fillStyle='#bfe0f0';c.fillRect(-270,-230,540,430);paper(c,'#7fae6a',()=>c.rect(-270,120,540,100),6,-3,0.2);paper(c,'#d9c6a5',()=>c.rect(60,-170,210,300),8,4,0.25);txt(c,'ШКОЛА',165,-120,36,'#8a5d4a');
   const mm=doll(c,{...MOM,x:-110,y:150,s:0.95,face:1,noLegs:true,expr:{eyes:'wide',mouth:'o',brow:1},pose:{armL:[1.0,1.4],bob:Math.sin(T*22)*2}});doll(c,{...BOY,x:10,y:160,s:0.62,face:1,noLegs:true,expr:{eyes:'closed',mouth:'smile'},pose:{armR:[-1.0,-1.4]}});
   paper(c,'#fff',()=>{for(let j=0;j<5;j++){const a=j*Math.PI*2/5;c.ellipse(60+Math.cos(a)*14,40+Math.sin(a)*14,12,8,a,0,7)}},4,2,0.2);txt(c,'1 сентября',-130,-180,40,'#3a6a8a')})}
// 51-53: позвонили вдвоём
function shotCallTogether(c,t,d,T){c.save();cam(c,460,1060,1.06+0.08*ease(t/d),0,0);room(c,T);clockP(c,250,520,130,20,0);
 const r=bedDuo(c,T,{hug:0.3,de:{eyes:'open',mouth:'smile',brow:0.4},be:{eyes:'open',mouth:'smile',brow:0.5},bArm:[1.2,1.7],dArm:[1.1,1.6]});phoneMini(c,(r.dd.hf.x+r.b.hf.x)/2,r.b.hf.y-10,0,1.2,0.6);rings(c,(r.dd.hf.x+r.b.hf.x)/2-20,r.b.hf.y-60,T,3);c.restore()}
// 54-59: не взяла трубку
function shotNoAnswer(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;
 if(A(4)<0){const n=A(3)>0?10:A(2)>0?5:A(1)>0?1:0,px=210,py=560,pw=660,ph=1100;c.save();cam(c,540,980,1.0+0.08*ease(t/d),0,0);
  const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2c3f4c');g.addColorStop(1,'#1a2530');c.fillStyle=g;c.fillRect(-200,-200,W+400,H+400);paper(c,'#e2a94c',()=>{c.moveTo(-200,1250);c.quadraticCurveTo(540,1130,W+200,1250);c.lineTo(W+200,H+200);c.lineTo(-200,H+200);c.closePath()},30,-14,0.3);
  [[-1,'#5f8a6b',170],[1,'#4f86c6',150]].forEach(([sx,col,w])=>{c.save();sh(c,20,10,0.3);c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(540+sx*640,H+120);c.lineTo(540+sx*380,py+ph-190);c.stroke();c.restore()});
  phoneBody(c,px,py,pw,ph,Math.sin(T*0.9)*0.01,()=>callScreen(c,px,py,pw,ph,T,'call',0));
  paper(c,'#eebf98',()=>c.ellipse(190,py+ph-200,84,110,-0.4,0,7),14,7,0.3);paper(c,'#f2c9a4',()=>c.ellipse(880,py+ph-200,70,96,0.4,0,7),14,7,0.3);c.restore();
  if(n>0){const a=A(3)>0?A(3):A(2)>0?A(2):A(1);bigText(c,String(n),W/2,280,230,'#ffd60a',0.7+0.3*back(a/0.25),0,28);bigText(c,n==1?'ГУДОК':'ГУДКОВ',W/2,440,70,'#fff',1,0,14)}}
 else{const k=ease(A(4)/3.5);c.save();cam(c,lerp(520,600,k),lerp(1000,1380,k),1.02+0.5*k,0,0);veraRoom(c,T,{ring:true,dark:0.35});
  c.save();c.translate(700,1560);c.rotate(0.3);c.strokeStyle='#d8d2c2';c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(-90,-30);c.lineTo(60,10);c.moveTo(-80,20);c.lineTo(70,-20);c.stroke();c.save();sh(c,10,5,0.25);c.strokeStyle='#4f86c6';c.lineWidth=64;c.lineJoin='round';c.beginPath();c.moveTo(-40,0);c.lineTo(40,30);c.lineTo(150,24);c.lineTo(250,50);c.stroke();c.restore();c.strokeStyle='#f6efe2';c.lineWidth=12;for(const x of [30,120,210]){c.beginPath();c.moveTo(x,-6);c.lineTo(x+6,58);c.stroke()}c.restore();
  catP(c,300,1590,T);c.restore();c.fillStyle='rgba(10,10,30,0.2)';c.fillRect(0,0,W,H)}}

function hook(c,T){const a=1-ease((T-2.3)/0.25);if(a<=0)return;c.save();c.globalAlpha=a;bigText(c,'ЧАСТЬ 3',W/2,1720,150,'#ffd60a',0.7+0.3*back(T/0.3),-0.03,26);c.restore()}
function outro(c,T){const s=window.DATA.outro;if(T<s)return;bigText(c,'ЧТО С НЕЙ?',W/2,230,120,'#ffd60a',0.7+0.3*back((T-s)/0.3),-0.02,24);if(T>s+0.4)bigText(c,'ЧАСТЬ 4 — СКОРО',W/2,360,70,'#fff',0.7+0.3*back((T-s-0.4)/0.3),0,14)}
Object.assign(FN,{shotDadCalls,shotVeraHappy,shotDadAngry,shotExplain,shotDadForbid,shotTakePhone,shotBoyScream,shotDadFrozen,shotDoor,shotDadTwoPhones,shotDadSorry,shotVeraSilent,shotVeraSpeaks,shotWall,shotDadEyes,shotVeraSon,shotVeraDont,shotDadGoes,shotConfess,shotStories,shotCallTogether,shotNoAnswer});

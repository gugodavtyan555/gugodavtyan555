// «Номер мамы», часть 2 — сцены. Подключается после shots_p1.js
const VERA={skin:'#f0cdb0',hair:'#dcd8d4',bun:true,top:'#8a6a9a',topDark:'#75588a',bot:'#5a4a5a',botDark:'#4a3c4a',shoe:'#8a5d4a',stripe:'#d9c6a5'};
function vera(c,o){const m=doll(c,{...VERA,...o}),f=o.face||1,HR=m.HR,ex=[m.head.x+f*HR*0.14,m.head.x+f*HR*0.62],ey=m.head.y+HR*0.12;
 c.strokeStyle='#5a4a52';c.lineWidth=HR*0.05;for(const x of ex){c.beginPath();c.arc(x,ey,HR*0.2,0,7);c.stroke()}c.beginPath();c.moveTo(ex[0]+f*HR*0.2,ey);c.lineTo(ex[1]-f*HR*0.2,ey);c.stroke();
 c.strokeStyle='rgba(150,100,90,0.35)';c.lineWidth=HR*0.03;c.beginPath();c.moveTo(m.head.x+f*HR*0.86,ey+HR*0.05);c.lineTo(m.head.x+f*HR*0.94,ey-HR*0.04);c.moveTo(m.head.x+f*HR*0.2,m.head.y+HR*0.72);c.quadraticCurveTo(m.head.x+f*HR*0.4,m.head.y+HR*0.8,m.head.x+f*HR*0.6,m.head.y+HR*0.72);c.stroke();return m}
function catP(c,x,y,T){paper(c,'#8a8792',()=>{c.ellipse(x,y,90,44,0,0,7);c.arc(x+80,y-22,36,0,7);c.moveTo(x+56,y-50);c.lineTo(x+62,y-84);c.lineTo(x+84,y-56);c.moveTo(x+92,y-56);c.lineTo(x+112,y-82);c.lineTo(x+110,y-44)},14,7,0.3);
 c.save();sh(c,8,4,0.25);c.strokeStyle='#8a8792';c.lineWidth=20;c.lineCap='round';c.beginPath();c.moveTo(x-84,y+6);c.quadraticCurveTo(x-150,y+10+Math.sin(T*2)*18,x-150,y-40+Math.sin(T*2)*14);c.stroke();c.restore();
 c.strokeStyle='#3a3540';c.lineWidth=5;c.beginPath();c.arc(x+72,y-22,8,0.2,Math.PI-0.2);c.moveTo(x+100,y-22);c.arc(x+94,y-22,8,0.2,Math.PI-0.2);c.stroke()}
function veraRoom(c,T,o={}){const fy=1500,dark=o.dark||0;
 const wg=c.createLinearGradient(0,0,0,fy);wg.addColorStop(0,'#6a5148');wg.addColorStop(1,'#8a6b58');c.fillStyle=wg;c.fillRect(-200,-200,W+400,fy+200);
 const r=rng(31);c.fillStyle='rgba(255,230,200,0.08)';for(let i=0;i<70;i++){c.beginPath();c.arc(r()*1400-150,r()*1500,12+r()*8,0,7);c.fill()}
 const wx=80,wy=330,ww=360,wh=480;paper(c,'#f3e6cf',()=>c.roundRect(wx-30,wy-30,ww+60,wh+60,20),24,12,0.35);c.save();c.beginPath();c.rect(wx,wy,ww,wh);c.clip();const sg=c.createLinearGradient(0,wy,0,wy+wh);sg.addColorStop(0,'#141a33');sg.addColorStop(1,'#3a4672');c.fillStyle=sg;c.fillRect(wx,wy,ww,wh);
 glow(c,wx+110,wy+120,200,'rgba(220,230,255,A)',0.5);paper(c,'#f3f0dc',()=>c.arc(wx+110,wy+120,46,0,7),10,5,0.2);c.fillStyle='#fff';const q=rng(3);for(let i=0;i<20;i++){c.globalAlpha=0.4+0.6*Math.abs(Math.sin(T+i));c.fillRect(wx+q()*ww,wy+q()*wh*0.6,4,4)}c.globalAlpha=1;city(c,wx,wx+ww,wy+wh+90,T);c.restore();
 c.save();sh(c,8,4,0.25);c.fillStyle='#f3e6cf';c.fillRect(wx+ww/2-10,wy,20,wh);c.restore();
 paper(c,'rgba(250,244,232,0.75)',()=>{c.moveTo(wx-40,wy-50);c.lineTo(wx+ww+40,wy-50);c.lineTo(wx+ww+40,wy+150);for(let i=8;i>=0;i--)c.quadraticCurveTo(wx-40+(i+0.5)*(ww+80)/9,wy+210,wx-40+i*(ww+80)/9,wy+150);c.closePath()},12,6,0.25);
 // фотографии на стене
 [[560,400,150,190,'#c9a27a'],[740,440,120,150,'#a9b4a0'],[890,380,130,170,'#c9a27a']].forEach(([x,y,w,h,col],i)=>{paper(c,'#f3e6cf',()=>c.roundRect(x,y,w,h,8),14,7,0.32);c.fillStyle=col;c.fillRect(x+12,y+12,w-24,h-24);if(i==0){c.fillStyle='#3a2a24';c.beginPath();c.arc(x+w/2,y+h*0.42,w*0.2,Math.PI,0);c.fill();c.fillStyle='#eebf98';c.beginPath();c.arc(x+w/2,y+h*0.45,w*0.17,0,7);c.fill();c.fillStyle='#4f6f8a';c.fillRect(x+w*0.26,y+h*0.6,w*0.48,h*0.3)}});
 if(o.hl){const k=o.hl;glow(c,635,495,260*k,'rgba(255,220,150,A)',0.6*k);c.strokeStyle=`rgba(255,214,10,${k})`;c.lineWidth=10;c.strokeRect(552,392,166,206)}
 clockP(c,960,720,80,o.hh==null?20:o.hh,o.mm||0);
 const fg=c.createLinearGradient(0,fy,0,H);fg.addColorStop(0,'#6a4a3c');fg.addColorStop(1,'#3a2820');c.save();sh(c,20,-8,0.25);c.fillStyle=fg;c.fillRect(-200,fy,W+400,H-fy+200);c.restore();
 paper(c,'#e9dcc6',()=>c.rect(-200,fy-26,W+400,30),8,4,0.2);
 paper(c,'#8a5a6a',()=>c.ellipse(520,1720,460,96,0,0,7),18,8,0.3);paper(c,'#a8707e',()=>c.ellipse(520,1720,350,64,0,0,7),0,0,0);
 // торшер
 if(!o.noLamp){glow(c,930,1000,560,'rgba(255,205,130,A)',0.45*(1-dark));paper(c,'#5a4034',()=>{c.rect(922,1060,16,440);c.ellipse(930,1500,70,16,0,0,7)},8,4,0.3);paper(c,dark>0.5?'#8a7a66':'#ffe3a6',()=>{c.moveTo(860,940);c.lineTo(1000,940);c.lineTo(1030,1070);c.lineTo(830,1070);c.closePath()},16,8,0.3)}
 // столик с телефоном
 paper(c,'#9a6a50',()=>{c.roundRect(120,1290,300,34,12);c.rect(150,1324,22,180);c.rect(370,1324,22,180)},18,9,0.33);paper(c,'#f6efe2',()=>c.ellipse(270,1290,120,18,0,0,7),6,3,0.2);
 if(!o.noPhone){const rg=o.ring?Math.sin(T*40)*0.12:0;c.save();c.translate(270,1262);c.rotate(-0.25+rg);if(o.ring)glow(c,0,0,220,'rgba(150,200,255,A)',0.6);paper(c,'#2a2630',()=>c.roundRect(-70,-20,140,40,10),10,5,0.3);c.fillStyle=o.ring?'#9fd0ff':'#3a4660';c.fillRect(-60,-14,120,24);c.restore()}
 // кресло
 paper(c,'#5f7a5a',()=>{c.roundRect(430,930,430,590,70);c.roundRect(400,1200,90,330,36);c.roundRect(800,1200,90,330,36)},24,12,0.35);paper(c,'#6f8a68',()=>c.roundRect(470,1270,350,110,40),10,5,0.2);
 if(dark>0){c.fillStyle=`rgba(10,10,30,${0.5*dark})`;c.fillRect(-200,-200,W+400,H+400)}}
function veraSit(c,T,o={}){const m=vera(c,{x:640,y:1290,s:1.15,face:-1,expr:o.expr||{eyes:'open',mouth:'flat'},pose:{lean:0.03,headTilt:0.05,...SITB,armL:o.phone===false?[0.8,1.6]:[-2.3,-3.3],armR:[0.6,1.4],bob:Math.sin(T*1.4)*2,...(o.pose||{})}});if(o.phone!==false)phoneMini(c,m.hf.x+6,m.hf.y-22,-0.12,1.15,0.4);return m}
function veraBg(c,T,dark=0.25){c.save();c.filter='blur(9px)';c.translate(-420,-760);c.scale(1.7,1.7);veraRoom(c,T);c.restore();c.fillStyle=`rgba(40,25,30,${dark})`;c.fillRect(-200,-200,W+400,H+400);glow(c,1150,700,900,'rgba(255,205,130,A)',0.35)}
function veraClose(c,T,expr,pose={},phone=true){const m=vera(c,{x:520,y:1700,s:2.6,face:-1,noLegs:true,expr,pose:{lean:0.03,headTilt:0.08,armL:phone?[-2.3,-3.3]:[0.2,0.4],armR:[0.2,0.5],bob:Math.sin(T*1.4)*4,...pose}});if(phone)phoneMini(c,m.hf.x+16,m.hf.y-50,-0.12,2.6,0.45);return m}

// ---------- 0-1: трубку взяли ----------
function shotAnswerRecap(c,t,d,T,m){shotAnswer(c,t,d,T,[m[0],m[1]!=null?m[1]-1.0:null])}
// ---------- 2-4: чужой голос ----------
function shotVeraReveal(c,t,d,T,m){const k=ease(t/(d*0.8));c.save();cam(c,520,1000,1.25-0.2*k,0,0);veraRoom(c,T,{dark:1-k,noPhone:true});veraSit(c,T,{expr:{eyes:'open',mouth:'flat',brow:0.6}});catP(c,300,1590,T);c.restore()}
// ---------- реплики мальчика ----------
function boySay(c,t,d,T,lines,expr,size=110){c.save();cam(c,560,900,1.0+0.08*ease(t/d),0,0);closeBg(c,T,0.36);boyClose(c,T,expr);bub(c,120,190,840,lines.length>1?400:280,720,640,back((t-0.14)/0.3),()=>lines.forEach((l,i)=>txt(c,l,540,(lines.length>1?310:330)+i*130,size)));c.restore()}
function shotBoyMama(c,t,d,T,m){const a=m[1]!=null?t-m[1]:-1;if(a<0){c.save();cam(c,560,900,1.0+0.08*ease(t/d),0,0);closeBg(c,T,0.36);boyClose(c,T,{eyes:'wide',mouth:'o',brow:1});c.restore()}else boySay(c,a+0.14,d,T,['Мама?'],{eyes:'wide',mouth:'o',brow:1},150)}
function shotBoyWhere(c,t,d,T){boySay(c,t,d,T,['А где','мамин голос?'],{eyes:'open',mouth:'sad',brow:-0.9,tear:T*0.4},100)}
// ---------- реплики Веры ----------
function shotVeraNo(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1;c.save();cam(c,540,900,1.0+0.08*ease(t/d),0,0);veraBg(c,T);
 veraClose(c,T,{eyes:a1>0?'closed':'open',mouth:a1>0?'sad':'flat',brow:-0.8,tear:a2>0?a2*0.4:0});
 if(a1>0)bub(c,150,190,780,a2>0?400:280,330,650,a2>0?1:back(a1/0.3),()=>{txt(c,'Нет, малыш.',540,a2>0?300:330,104);if(a2>0)txt(c,'Я не мама.',540,440,104)});
 c.restore()}
function shotVeraTell(c,t,d,T,m){const a2=m[2]!=null?t-m[2]:-1;c.save();cam(c,540,900,1.0+0.08*ease(t/d),0,0);veraBg(c,T);
 veraClose(c,T,{eyes:a2>0?'open':'closed',mouth:a2>0?'smile':'flat',brow:a2>0?0.4:-0.5});
 if(a2>0)bub(c,150,190,780,400,330,650,back(a2/0.3),()=>{txt(c,'Расскажи мне',540,300,88);txt(c,'о ней',540,430,88)});
 c.restore()}
// ---------- 10-11: Вера Павловна ----------
function shotVeraIntro(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1;c.save();cam(c,520,1000,1.02+0.07*ease(t/d),0,0);veraRoom(c,T,{noPhone:true});veraSit(c,T,{expr:{eyes:'open',mouth:'smile',brow:0.2}});catP(c,300,1590,T);c.restore();
 bigText(c,'ВЕРА ПАВЛОВНА',W/2,250,96,'#ffd60a',0.7+0.3*back(t/0.3),-0.02,20);if(a1>0)bigText(c,'72 ГОДА',W/2,390,84,'#fff',0.7+0.3*back(a1/0.3),0,16)}
// ---------- 12: пятый этаж ----------
function shotHouse(c,t,d,T){c.save();cam(c,540,900,1.3-0.25*ease(t/d),0,0);
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#141a33');g.addColorStop(1,'#3a4672');c.fillStyle=g;c.fillRect(-200,-200,W+400,H+400);c.fillStyle='#fff';const q=rng(3);for(let i=0;i<50;i++){c.globalAlpha=0.3+0.7*Math.abs(Math.sin(T+i));c.fillRect(q()*W,q()*900,5,5)}c.globalAlpha=1;
 glow(c,860,330,300,'rgba(220,230,255,A)',0.5);paper(c,'#f3f0dc',()=>c.arc(860,330,70,0,7),14,7,0.25);
 paper(c,'#2c3352',()=>{c.rect(-100,900,300,1100);c.rect(860,760,340,1300)},20,10,0.3);
 paper(c,'#4a5376',()=>c.rect(230,330,600,1700),30,14,0.4);
 for(let fl=0;fl<8;fl++)for(let i=0;i<4;i++){const x=280+i*135,y=1700-fl*170,lit=fl==4&&i==2;if(lit)glow(c,x+45,y+55,200,'rgba(255,200,120,A)',0.7);paper(c,lit?'#ffd98a':'#2f3654',()=>c.roundRect(x,y,90,110,8),6,3,0.25);if(lit){c.fillStyle='#8a6a9a';c.beginPath();c.arc(x+45,y+70,22,0,7);c.fill();c.fillStyle='#dcd8d4';c.beginPath();c.arc(x+45,y+56,18,Math.PI,0);c.fill()}}
 paper(c,'#1e2238',()=>c.rect(-200,1840,W+400,300),16,-8,0.3);c.restore();
 bigText(c,'5 ЭТАЖ',300,1010,80,'#ffd60a',0.7+0.3*back((t-0.5)/0.3),-0.04,16)}
// ---------- 13: телефон подарили соседи ----------
function shotGift(c,t,d,T){const k=easeOut(t/1.2);c.save();cam(c,540,1000,1.04+0.06*ease(t/d),0,0);veraRoom(c,T,{noPhone:true,hh:14});
 const v=vera(c,{x:420,y:1320,s:1.2,face:1,expr:{eyes:'wide',mouth:'o',brow:0.9},pose:{armL:[1.1,1.5],armR:[0.9,1.3]}});
 const nx=lerp(1250,800,k);[['#e07a5f','#6b4032',0],['#7fb69a','#3a2a24',130]].forEach(([top,hair,dx],i)=>{doll(c,{skin:'#f2c9a4',hair,top,bot:'#4a4458',x:nx+dx,y:1330+i*14,s:1.2,face:-1,expr:{eyes:'closed',mouth:'smile'},pose:{armL:i==0?[1.2,1.5]:[0.2,0.4],legL:k<1?[Math.sin(T*8)*0.4,0]:[0.08,0.04],legR:k<1?[-Math.sin(T*8)*0.4,0]:[-0.08,-0.06]}})});
 const gx=lerp(1100,600,k),gy=1010;paper(c,'#c96a7a',()=>c.roundRect(gx-70,gy-60,140,120,12),14,7,0.32);c.fillStyle='#ffd60a';c.fillRect(gx-10,gy-60,20,120);c.fillRect(gx-70,gy-10,140,20);paper(c,'#ffd60a',()=>{c.ellipse(gx-24,gy-74,26,16,-0.5,0,7);c.ellipse(gx+24,gy-74,26,16,0.5,0,7)},6,3,0.25);
 c.restore()}
// ---------- 14-15: не зазвонил ни разу ----------
function shotSilentPhone(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,n=Math.min(7,Math.floor(t/((m[1]||d)-0.3)*7)+1);c.save();cam(c,540,960,1.0+0.06*ease(t/d),0,0);
 paper(c,'#9a6a50',()=>c.rect(-200,-200,W+400,H+400),0,0,0);paper(c,'#f6efe2',()=>c.ellipse(540,1200,470,330,0,0,7),20,10,0.3);
 c.save();c.translate(540,1200);c.rotate(-0.1);paper(c,'#2a2630',()=>c.roundRect(-150,-260,300,520,44),30,15,0.4);c.fillStyle='#232a40';c.beginPath();c.roundRect(-128,-236,256,472,30);c.fill();txt(c,'0',0,-40,150,'#55628a');txt(c,'звонков',0,70,44,'#55628a');c.restore();
 const D=['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'];D.forEach((dd,i)=>{const x=100+i*147,y=520,on=i<n;paper(c,on?'#fbf4e4':'#c9b8a0',()=>c.roundRect(x-60,y-80,120,160,16),12,6,0.3);c.fillStyle='#c96a7a';c.fillRect(x-60,y-80,120,36);txt(c,dd,x,y-60,30,'#fff');if(on)txt(c,'—',x,y+24,70,'#8a8478')});
 c.strokeStyle='rgba(255,255,255,0.35)';c.lineWidth=3;for(let i=0;i<5;i++){c.beginPath();c.moveTo(900,1500);c.lineTo(1100,1380+i*50);c.stroke()}for(let i=1;i<4;i++){c.beginPath();c.arc(900,1500,i*56,-0.6,0.5);c.stroke()}
 c.restore();if(a1>0){bigText(c,'3 ГОДА',W/2,230,150,'#ffd60a',0.7+0.3*back(a1/0.3),-0.03,26);bigText(c,'ТИШИНЫ',W/2,370,76,'#fff',0.7+0.3*back((a1-0.25)/0.3),0,16)}}
// ---------- 16-18: хотел бросить трубку ----------
function shotHesitate(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1,px=210,py=380,pw=660,ph=1180;c.save();cam(c,540,lerp(980,820,ease(Math.max(0,a2)/1.2)),1.0+0.18*ease(Math.max(0,a2)/1.2),0,0);
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2c3f4c');g.addColorStop(1,'#1a2530');c.fillStyle=g;c.fillRect(-200,-200,W+400,H+400);
 paper(c,'#e2a94c',()=>{c.moveTo(-200,1250);c.quadraticCurveTo(540,1130,W+200,1250);c.lineTo(W+200,H+200);c.lineTo(-200,H+200);c.closePath()},30,-14,0.3);
 phoneBody(c,px,py,pw,ph,Math.sin(T*0.9)*0.01,()=>callScreen(c,px,py,pw,ph,T,'on',t+2));
 if(a2>0)glow(c,540,py+ph*0.3,300,'rgba(255,220,150,A)',0.5*ease(a2/0.6));
 const k=a1>0?1-ease(a1/0.6):ease(t/1.2),tx=lerp(900,580,k),ty=lerp(1800,py+ph-150,k);c.save();sh(c,20,10,0.35);c.strokeStyle='#f2c9a4';c.lineWidth=90;c.lineCap='round';c.beginPath();c.moveTo(tx+380,ty+620);c.lineTo(tx,ty);c.stroke();c.restore();
 c.restore()}
// ---------- 23-26: Тима рассказал ----------
function memCardP(c,x,y,rot,k,draw){if(k<=0)return;c.save();c.translate(x,y);c.rotate(rot);c.scale(k,k);paper(c,'#fbf4e4',()=>c.roundRect(-300,-260,600,520,30),34,17,0.38);c.save();c.beginPath();c.rect(-270,-230,540,430);c.clip();draw();c.restore();c.restore()}
const MOM={skin:'#f2c9a4',hair:'#6b4032',hairBack:true,top:'#c96a7a',topDark:'#b25a6a',bot:'#6a5a8a'};
function shotMemories(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1,cur=A(3)>0?3:A(2)>0?2:A(1)>0?1:0;c.save();cam(c,540,960,1.0+0.05*ease(t/d),0,0);
 c.save();c.filter='blur(7px)';c.translate(-160,-240);c.scale(1.3,1.3);room(c,T);c.restore();c.fillStyle='rgba(40,30,60,0.3)';c.fillRect(-200,-200,W+400,H+400);
 const tk=Math.sin(T*10)>0;const b=doll(c,{...BOY,x:540,y:1640,s:1.5,face:1,expr:{eyes:'closed',mouth:tk?'o':'smile',brow:0.3},pose:{lean:0.02,...SITB,armL:[-2.3,-3.3],armR:[1.2+Math.sin(T*5)*0.3,2.2]}});phoneMini(c,b.hf.x-10,b.hf.y-30,0.12,1.5,0.45);
 paper(c,'#e2a94c',()=>c.rect(-200,1640,W+400,600),24,-12,0.3);
 if(cur==1)memCardP(c,540,600,-0.03,back(A(1)/0.3),()=>{c.fillStyle='#f6d9a8';c.fillRect(-270,-230,540,430);paper(c,'#d9c6a5',()=>c.rect(-270,60,540,160),8,-4,0.2);paper(c,'#b9c4cc',()=>c.roundRect(20,10,200,70,14),6,3,0.25);
   const mm=doll(c,{...MOM,x:-70,y:150,s:1.0,face:1,noLegs:true,expr:{eyes:'closed',mouth:'o'},pose:{armL:[1.2,1.6+Math.sin(T*6)*0.2],armR:[0.9,1.4]}});paper(c,'#fff',()=>c.ellipse(mm.hf.x+20,mm.hf.y,44,12,0,0,7),4,2,0.2);
   c.fillStyle='#c96a7a';c.font='900 70px M';for(let i=0;i<3;i++){const k=((T*0.5+i/3)%1);c.globalAlpha=Math.sin(k*Math.PI);c.fillText('♪',-200+i*60+Math.sin(T*2+i)*14,-60-k*130)}c.globalAlpha=1});
 if(cur==2)memCardP(c,540,600,0.03,back(A(2)/0.3),()=>{c.fillStyle='#f8c9a8';c.fillRect(-270,-230,540,430);glow(c,0,0,330,'rgba(255,240,200,A)',0.6);
   c.save();sh(c,14,7,0.3);c.strokeStyle='#c96a7a';c.lineWidth=110;c.lineCap='round';c.beginPath();c.moveTo(-330,150);c.lineTo(-90,10);c.moveTo(330,150);c.lineTo(90,10);c.stroke();c.restore();paper(c,'#f2c9a4',()=>{c.ellipse(-70,-10,84,64,0.4,0,7);c.ellipse(70,-10,84,64,-0.4,0,7)},12,6,0.3);paper(c,'#f6d4b4',()=>c.ellipse(0,-6,50,40,0,0,7),8,4,0.25);
   for(let i=0;i<5;i++){const k=((T*0.4+i/5)%1);c.globalAlpha=Math.sin(k*Math.PI);paper(c,['#fff','#ffd9e2','#ffe7ad'][i%3],()=>{for(let j=0;j<5;j++){const a=j*Math.PI*2/5;c.ellipse(-140+i*70+Math.cos(a)*12,-110-k*90+Math.sin(a)*12,11,7,a,0,7)}},4,2,0.2)}c.globalAlpha=1});
 if(cur==3)memCardP(c,540,600,-0.02,back(A(3)/0.3),()=>{c.fillStyle='#3a4668';c.fillRect(-270,-230,540,430);glow(c,200,-120,300,'rgba(255,205,130,A)',0.6);paper(c,'#f6efe2',()=>c.roundRect(-250,40,500,170,30),8,4,0.25);paper(c,'#e2a94c',()=>c.roundRect(-250,90,500,130,26),8,4,0.25);
   doll(c,{...MOM,x:-90,y:140,s:0.9,face:1,noLegs:true,expr:{eyes:'closed',mouth:'flat'},pose:{lean:0.3,headTilt:0.5,armL:[1.2,1.2]}});doll(c,{...BOY,x:110,y:150,s:0.75,face:-1,noLegs:true,expr:{eyes:'open',mouth:'smile'},pose:{headTilt:0.1}});
   paper(c,'#c96a7a',()=>c.roundRect(-40,60,90,64,6),6,3,0.25);txt(c,'z z',-150,-90+Math.sin(T*2)*8,50,'#cfd8ff')});
 c.restore()}
// ---------- 27-28: сорок минут ----------
function shotListen40(c,t,d,T,m){const p=clamp(t/(d-0.4));c.save();cam(c,540,960,1.0+0.04*ease(t/d),0,0);
 c.save();c.beginPath();c.rect(0,0,W,940);c.clip();c.translate(-388,-1197);c.scale(1.45,1.45);veraRoom(c,T,{noPhone:true,mm:p*40});veraSit(c,T,{expr:{eyes:'closed',mouth:'smile',brow:-0.4,tear:T*0.3}});c.restore();
 c.save();c.beginPath();c.rect(0,980,W,H);c.clip();c.translate(-98,-261);c.scale(1.45,1.45);room(c,T);const tk=Math.sin(T*10)>0;const b=doll(c,{...BOY,x:440,y:1262,s:1.0,face:1,expr:{eyes:'open',mouth:tk?'o':'smile',brow:0.3},pose:{lean:0.04,...SITB,armL:[-2.3,-3.3],armR:[1.2+Math.sin(T*5)*0.3,2.2]}});phoneMini(c,b.hf.x-6,b.hf.y-20,0.12,1.0,0.45);c.restore();
 paper(c,'#fbf4e4',()=>c.rect(-50,940,W+100,40),16,8,0.35);clockP(c,170,960,120,20,p*40);c.restore();
 bigText(c,Math.floor(p*40)+' МИН',480,960,84,'#ffd60a',1,0,18)}
// ---------- 29-32: плакала в темноте ----------
function shotVeraDark(c,t,d,T,m){const a2=m[2]!=null?t-m[2]:-1,a3=m[3]!=null?t-m[3]:-1,z=ease(Math.max(0,a2)/1.3);c.save();cam(c,lerp(520,620,z),lerp(1000,780,z),1.05+0.35*z,0,0);
 veraRoom(c,T,{noPhone:true,dark:0.75,hl:a3>0?ease(a3/0.6):0});const v=veraSit(c,T,{expr:{eyes:'closed',mouth:'sad',brow:-1,tear:T*0.5},pose:{armR:[2.0,3.0]}});
 c.fillStyle='rgba(10,10,30,0.3)';c.fillRect(-200,-200,W+400,H+400);if(a3>0){glow(c,635,495,300,'rgba(255,220,150,A)',0.5*ease(a3/0.6))}
 c.restore();if(a3>0.3)bigText(c,'СЕРЁЖА',W/2,250,110,'#ffd60a',0.7+0.3*back((a3-0.3)/0.3),-0.02,22)}
function shotHeard(c,t,d,T){c.save();cam(c,560,900,1.0+0.08*ease(t/d),0,0);closeBg(c,T,0.25);boyClose(c,T,{eyes:'closed',mouth:'smile',brow:0.3,tear:T*0.3});
 for(let i=0;i<4;i++){const k=((T*0.45+i/4)%1);c.save();c.globalAlpha=Math.sin(k*Math.PI);c.translate(250+i*190+Math.sin(T+i)*20,620-k*260);c.scale(1.2,1.2);paper(c,'#ff8a96',()=>{c.moveTo(0,30);c.bezierCurveTo(-70,-20,-40,-70,0,-34);c.bezierCurveTo(40,-70,70,-20,0,30)},8,4,0.25);c.restore()}
 c.restore()}
// ---------- 35-36: взяла с первого гудка / ждала с шести ----------
function shotVeraPick(c,t,d,T){const pk=t>0.55;c.save();cam(c,480,1040,1.1+0.08*ease(t/d),pk?0:Math.sin(T*40)*3,0);veraRoom(c,T,{noPhone:pk,ring:!pk});
 veraSit(c,T,{phone:pk,expr:{eyes:pk?'closed':'wide',mouth:'smile',brow:0.8},pose:pk?{}:{lean:0.3,armL:[1.4,1.5],armR:[1.2,1.4]}});catP(c,300,1590,T);c.restore();
 if(!pk){const k=(t/0.55);c.save();c.globalAlpha=1-k;bigText(c,'дзынь!',300,1050-k*80,90,'#fff',1,-0.08,16);c.restore()}}
function shotVeraWait(c,t,d,T){c.save();cam(c,520,1000,1.04+0.07*ease(t/d),0,0);veraRoom(c,T,{hh:18,mm:t*3});
 veraSit(c,T,{phone:false,expr:{eyes:'open',mouth:'flat',brow:0.3},pose:{lean:0.1,headTilt:0.1,armL:[0.9,1.5],armR:[0.8,1.4]}});catP(c,300,1590,T);c.restore();
 bigText(c,'18:00',W/2,260,150,'#ffd60a',0.7+0.3*back(t/0.3),-0.02,24)}
// ---------- 37-39: месяц ----------
function shotMonth(c,t,d,T){const n=Math.min(30,Math.floor(t/(d-0.6)*30)+1);c.save();cam(c,540,960,1.0+0.05*ease(t/d),0,0);
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#3a5564');g.addColorStop(1,'#507282');c.fillStyle=g;c.fillRect(-200,-200,W+400,H+400);
 c.save();c.translate(540,880);c.rotate(-0.02);paper(c,'#fbf4e4',()=>c.roundRect(-440,-470,880,960,30),36,18,0.4);paper(c,'#c96a7a',()=>c.roundRect(-440,-470,880,130,[30,30,0,0]),0,0,0);txt(c,'КАЖДЫЙ ВЕЧЕР · 20:00',0,-404,52,'#fff');
 for(let i=0;i<30;i++){const x=-360+(i%6)*144,y=-250+Math.floor(i/6)*150,on=i<n,k=i==n-1?back((t/(d-0.6)*30)%1/0.5):1;paper(c,on?'#ffe7ad':'#ece3d0',()=>c.roundRect(x-58,y-58,116,116,16),6,3,0.2);txt(c,String(i+1),x-34,y-34,26,'#8a8478');if(on){c.save();c.translate(x+6,y+10);c.scale(k*0.55,k*0.55);c.fillStyle='#e0566a';c.beginPath();c.moveTo(0,30);c.bezierCurveTo(-70,-20,-40,-70,0,-34);c.bezierCurveTo(40,-70,70,-20,0,30);c.fill();c.restore()}}c.restore();
 c.restore()}
// ---------- 40-41: школа и пирог ----------
function shotChat(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1;c.save();cam(c,540,960,1.0+0.04*ease(t/d),0,0);
 c.save();c.beginPath();c.rect(0,0,W,940);c.clip();c.translate(-98,-1241);c.scale(1.45,1.45);room(c,T);const tk=Math.sin(T*10)>0&&a1<0;const b=doll(c,{...BOY,x:440,y:1262,s:1.0,face:1,expr:{eyes:'open',mouth:tk?'o':'smile',brow:0.5},pose:{lean:0.04,...SITB,armL:[-2.3,-3.3],armR:[1.2,2.2]}});phoneMini(c,b.hf.x-6,b.hf.y-20,0.12,1.0,0.45);c.restore();
 card(c,820,330,0.06,back(t/0.3)*0.9,()=>{c.strokeStyle='rgba(80,110,160,0.35)';c.lineWidth=3;for(let i=0;i<5;i++){c.beginPath();c.moveTo(-100,-70+i*40);c.lineTo(100,-70+i*40);c.stroke()}txt(c,'5',0,6,210,'#d0403a')});
 c.save();c.beginPath();c.rect(0,980,W,H);c.clip();c.translate(-388,-217);c.scale(1.45,1.45);veraRoom(c,T,{noPhone:true});const tk2=Math.sin(T*10)>0&&a1>0;veraSit(c,T,{expr:{eyes:'open',mouth:tk2?'o':'smile',brow:0.4}});c.restore();
 if(a1>0)card(c,250,1300,-0.06,back(a1/0.3)*0.9,()=>{c.save();c.filter='blur(5px)';for(let i=0;i<3;i++){const k=((T*0.5+i/3)%1);c.fillStyle=`rgba(255,255,255,${0.7*(1-k)})`;c.beginPath();c.arc(-40+i*40,-50-k*70,14+k*14,0,7);c.fill()}c.restore();paper(c,'#d9a441',()=>c.ellipse(0,30,100,50,0,0,7),8,4,0.25);paper(c,'#f0c66a',()=>c.ellipse(0,18,84,36,0,0,7),0,0,0);c.strokeStyle='#b5842f';c.lineWidth=7;for(let i=-2;i<3;i++){c.beginPath();c.moveTo(i*30-20,-6);c.lineTo(i*30+20,42);c.stroke()}});
 paper(c,'#fbf4e4',()=>c.rect(-50,940,W+100,40),16,8,0.35);c.restore()}
function shotLaugh(c,t,d,T){c.save();cam(c,560,900,1.0+0.08*ease(t/d),0,0);closeBg(c,T,0.18);boyClose(c,T,{eyes:'closed',mouth:Math.sin(T*12)>0?'o':'smile',brow:0.8},{bob:Math.abs(Math.sin(T*12))*-14,headTilt:-0.05});
 c.save();c.font='900 100px M';c.textAlign='center';[[240,520,0],[430,400,0.4],[330,680,0.75]].forEach(([x,y,p],i)=>{const k=((T*1.1+p)%1);c.globalAlpha=Math.sin(k*Math.PI);c.save();c.translate(x,y-k*70);c.rotate((i-1)*0.14);c.lineJoin='round';c.strokeStyle='#000';c.lineWidth=16;c.strokeText('ха!',0,0);c.fillStyle='#ffd60a';c.fillText('ха!',0,0);c.restore()});c.restore();c.restore()}
// ---------- 44-45: папа не понимал ----------
function shotDadNotice(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1;c.save();cam(c,540,1060,1.04+0.08*ease(t/d),0,0);kitchen(c,T,false);glow(c,540,700,800,'rgba(255,210,150,A)',0.35);
 paper(c,'#6a4a3c',()=>c.rect(532,-100,16,420),6,3,0.3);paper(c,'#ffe3a6',()=>{c.moveTo(450,300);c.lineTo(630,300);c.lineTo(690,430);c.lineTo(390,430);c.closePath()},18,9,0.3);chairP(c,540,false);
 const dd=doll(c,{...DAD,x:230,y:1340,s:1.35,face:1,noLegs:true,expr:{eyes:'open',mouth:'flat',brow:0.9},pose:{lean:0.04,headTilt:-0.06,armL:[1.0,1.5],armR:[0.8,1.4]}});stubble(c,dd,1);
 doll(c,{...BOY,x:860,y:1330,s:1.0,face:-1,noLegs:true,expr:{eyes:'closed',mouth:'smile',brow:0.5},pose:{lean:0.06,armL:[1.0,1.5+Math.sin(T*6)*0.2],armR:[0.8,1.4],bob:Math.sin(T*6)*3}});
 tableP(c,false);for(const x of [330,760]){paper(c,'#f6efe2',()=>c.ellipse(x,1244,84,22,0,0,7),8,4,0.3);paper(c,'#e2c08a',()=>c.ellipse(x,1238,56,12,0,0,7),0,0,0)}
 c.fillStyle='#c96a7a';c.font='900 60px M';for(let i=0;i<3;i++){const k=((T*0.5+i/3)%1);c.globalAlpha=Math.sin(k*Math.PI);c.fillText('♪',900+Math.sin(T*2+i)*20,1010-k*120)}c.globalAlpha=1;
 if(a1>0)bigText(c,'?',dd.head.x+30,dd.head.y-200,190,'#ffd60a',0.7+0.3*back(a1/0.3),0.08,24);c.restore()}
// ---------- 46-49: бабушка Вера, шарф ----------
function shotScarfKnit(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1,z=ease(Math.max(0,A(2))/1.0)*(A(3)>0?1-ease(A(3)/0.8):1);c.save();cam(c,lerp(520,600,z),lerp(1000,1260,z),1.04+0.5*z,0,0);veraRoom(c,T,{noPhone:false});
 const kn=Math.sin(T*9),v=veraSit(c,T,{phone:false,expr:{eyes:'open',mouth:'smile',brow:0.3},pose:{armL:[1.0+kn*0.08,1.9],armR:[0.9-kn*0.08,1.8]}});
 if(A(1)>0){const p=v.hf;c.strokeStyle='#d8d2c2';c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(p.x+60,p.y+30+kn*10);c.lineTo(p.x-60,p.y-50-kn*10);c.moveTo(p.x+50,p.y-50+kn*10);c.lineTo(p.x-70,p.y+20-kn*10);c.stroke();
  const L=lerp(3,9,ease(A(1)/2.5));c.save();sh(c,10,5,0.25);c.strokeStyle='#4f86c6';c.lineWidth=64;c.lineJoin='round';c.beginPath();c.moveTo(p.x-10,p.y);for(let i=1;i<=L;i++)c.lineTo(p.x-14+Math.sin(T*2+i*0.7)*6,p.y+i*30);c.stroke();c.restore();c.strokeStyle='#f6efe2';c.lineWidth=12;for(let i=2;i<=L;i+=3){c.beginPath();c.moveTo(p.x-46,p.y+i*30);c.lineTo(p.x+18,p.y+i*30);c.stroke()}}
 catP(c,300,1590,T);c.restore();
 if(A(1)<0)bigText(c,'БАБУШКА ВЕРА',W/2,260,96,'#ffd60a',0.7+0.3*back((t-0.5)/0.3),-0.02,20);
 if(A(3)>0){c.save();const k=back(A(3)/0.3);c.translate(800,400);c.scale(k,k);paper(c,'#fbf4e4',()=>{c.ellipse(0,0,220,200,0,0,7);c.arc(-170,230,34,0,7);c.arc(-230,310,20,0,7)},24,12,0.35);paper(c,'#b9b4aa',()=>{c.arc(0,-50,70,0,7);c.ellipse(0,90,100,70,0,0,7)},6,3,0.2);c.fillStyle='#ffd60a';c.font='900 130px M';c.textAlign='center';c.textBaseline='middle';c.fillText('?',0,-40);c.restore()}}
// ---------- 50-52: папа вошёл ----------
function shotDadEnters(c,t,d,T,m){const a2=m[2]!=null?t-m[2]:-1,op=ease(t/0.9);c.save();cam(c,540,1040,1.02+0.07*ease(t/d),0,0);room(c,T);
 const b=doll(c,{...BOY,x:440,y:1262,s:1.0,face:-1,expr:{eyes:'closed',mouth:a2>0&&Math.sin(T*10)>0?'o':'smile',brow:0.4},pose:{lean:0.04,...SITB,legL:[-1.45,-0.05],legR:[-1.38,0.04],armL:[-2.3,-3.3],armR:[0.2,0.5]}});phoneMini(c,b.hf.x+6,b.hf.y-20,-0.12,1.0,0.45);
 paper(c,'#2a2230',()=>c.rect(820,300,460,1210),30,10,0.4);glow(c,1000,900,560*op,'rgba(255,200,130,A)',0.5*op);paper(c,'#ffd9a0',()=>c.rect(860,340,400*op,1170),0,0,0);
 if(op>0.4){const dd=doll(c,{...DAD,x:lerp(1200,960,ease((t-0.4)/0.8)),y:1210,s:1.35,face:-1,expr:{eyes:a2>0?'wide':'open',mouth:a2>0?'o':'flat',brow:a2>0?1:0},pose:{lean:0.04,armL:[0.2,0.3],armR:[-0.1,0.1]}});stubble(c,dd,-1)}
 paper(c,'#8a5d4a',()=>c.rect(790,280,50,1230),14,7,0.35);
 if(a2>0)bub(c,60,330,720,340,400,790,back(a2/0.3),()=>{txt(c,'Спокойной ночи,',420,440,76);txt(c,'бабушка Вера!',420,550,76)});
 c.restore()}
// ---------- 53-55: на экране — «Мама» ----------
function shotDadPhone(c,t,d,T,m){const a2=m[2]!=null?t-m[2]:-1,z=ease(Math.max(0,a2)/1.0),px=210,py=420,pw=660,ph=1180;c.save();cam(c,540,lerp(980,py+ph*0.42,z),1.0+0.5*z,Math.sin(T*24)*2,0);
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#3a5564');g.addColorStop(1,'#22343e');c.fillStyle=g;c.fillRect(-200,-200,W+400,H+400);
 glow(c,540,900,900,'rgba(150,190,255,A)',0.3);
 for(const sx of [-1,1]){c.save();sh(c,20,10,0.3);c.strokeStyle='#5f8a6b';c.lineWidth=170;c.lineCap='round';c.beginPath();c.moveTo(540+sx*680,H+120);c.lineTo(540+sx*400,py+ph-190);c.stroke();c.restore()}
 phoneBody(c,px,py,pw,ph,Math.sin(T*24)*0.006,()=>{const gg=c.createLinearGradient(0,py,0,py+ph);gg.addColorStop(0,'#3a4668');gg.addColorStop(1,'#1c2238');c.fillStyle=gg;c.fillRect(px,py,pw,ph);const cx=px+pw/2,ay=py+ph*0.3;mom(c,cx,ay,125);txt(c,'МАМА',cx,ay+230,96,'#fff');txt(c,'вызов завершён',cx,ay+320,44,'rgba(255,255,255,0.8)');txt(c,'41:07',cx,ay+400,70,'#ffd60a')});
 for(const sx of [-1,1])paper(c,'#eebf98',()=>c.ellipse(540+sx*350,py+ph-200,84,110,sx*0.4,0,7),14,7,0.3);
 c.restore()}

function hook(c,T){const a=1-ease((T-2.3)/0.25);if(a<=0)return;c.save();c.globalAlpha=a;bigText(c,'ЧАСТЬ 2',W/2,1720,150,'#ffd60a',0.7+0.3*back(T/0.3),-0.03,26);c.restore()}
function outro(c,T){const s=window.DATA.outro;if(T<s)return;bigText(c,'ЧТО СДЕЛАЕТ ПАПА?',W/2,230,80,'#ffd60a',0.7+0.3*back((T-s)/0.3),-0.02,22);if(T>s+0.4)bigText(c,'ЧАСТЬ 3 — СКОРО',W/2,350,70,'#fff',0.7+0.3*back((T-s-0.4)/0.3),0,14)}
Object.assign(FN,{shotAnswerRecap,shotVeraReveal,shotBoyMama,shotBoyWhere,shotVeraNo,shotVeraTell,shotVeraIntro,shotHouse,shotGift,shotSilentPhone,shotHesitate,shotMemories,shotListen40,shotVeraDark,shotHeard,shotVeraPick,shotVeraWait,shotMonth,shotChat,shotLaugh,shotDadNotice,shotScarfKnit,shotDadEnters,shotDadPhone});

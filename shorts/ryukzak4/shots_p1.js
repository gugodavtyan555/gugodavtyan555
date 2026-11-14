// «Номер мамы», часть 1 — сцены в стиле бумажной аппликации. Подключается после основного скрипта page.html
const DAD={skin:'#eebf98',hair:'#3a2a24',top:'#5f8a6b',topDark:'#4d7257',bot:'#4a4458',botDark:'#3c374a',shoe:'#3a3038'};
const SITB={legL:[1.45,0.05],legR:[1.38,-0.04]};
function stubble(c,m,f){c.save();c.beginPath();c.arc(m.head.x,m.head.y,m.HR,0,7);c.clip();c.fillStyle='rgba(70,50,45,0.22)';c.beginPath();c.ellipse(m.head.x+f*m.HR*0.3,m.head.y+m.HR*0.78,m.HR*0.85,m.HR*0.42,0,0,7);c.fill();c.restore()}
function closeBg(c,T,dark=0.28){c.save();c.filter='blur(9px)';c.translate(-420,-960);c.scale(1.75,1.75);room(c,T);c.restore();c.fillStyle=`rgba(40,30,60,${dark})`;c.fillRect(-200,-200,W+400,H+400);glow(c,1100,700,900,'rgba(255,205,130,A)',0.35)}
function boyClose(c,T,expr,pose={},phone=true){const b=doll(c,{...BOY,x:560,y:1700,s:2.7,face:1,noLegs:true,expr,pose:{lean:0.03,headTilt:0.1,armL:phone?[-2.3,-3.3]:[0.2,0.4],armR:[0.2,0.5],bob:Math.sin(T*1.5)*4,...pose}});if(phone)phoneMini(c,b.hf.x-16,b.hf.y-50,0.12,2.7,0.5);return b}
function rings(c,x,y,T,n=3,col='rgba(255,255,255,0.8)'){c.save();c.strokeStyle=col;c.lineWidth=9;c.lineCap='round';for(let i=0;i<n;i++){const k=((T*1.1+i/n)%1);c.globalAlpha=1-k;c.beginPath();c.arc(x,y,60+k*150,Math.PI-0.6,Math.PI+0.9);c.stroke()}c.restore()}
function bub(c,x,y,w,h,tx,ty,k,draw){if(k<=0)return;c.save();c.translate(x+w/2,y+h/2);c.scale(k,k);c.translate(-(x+w/2),-(y+h/2));paper(c,'#fbf4e4',()=>{c.roundRect(x,y,w,h,64);c.moveTo(tx-46,y+h-4);c.lineTo(tx,ty);c.lineTo(tx+46,y+h-4)},30,16,0.35);draw();c.restore()}
function txt(c,s,x,y,size,col='#3a2d3d',al='center'){c.fillStyle=col;c.font=`900 ${size}px M`;c.textAlign=al;c.textBaseline='middle';c.fillText(s,x,y)}
function wave(c,x,y,n,T,col,amp=84,flat=false){c.fillStyle=col;for(let i=0;i<n;i++){const hh=flat?10:10+Math.abs(Math.sin(T*8+i*0.8)*Math.sin(T*2.6+i*0.27))*amp;c.beginPath();c.roundRect(x+i*22.5,y-hh/2,13,hh,6);c.fill()}}
function clockP(c,x,y,r,hh,mm){paper(c,'#f6efe2',()=>c.arc(x,y,r,0,7),20,10,0.35);c.strokeStyle='#8a5d4a';c.lineWidth=r*0.12;c.beginPath();c.arc(x,y,r*0.94,0,7);c.stroke();c.fillStyle='#3a2d3d';for(let i=0;i<12;i++){const a=i*Math.PI/6;c.beginPath();c.arc(x+Math.sin(a)*r*0.74,y-Math.cos(a)*r*0.74,r*0.035,0,7);c.fill()}
 c.strokeStyle='#3a2d3d';c.lineCap='round';const ha=(hh%12+mm/60)*Math.PI/6,ma=mm*Math.PI/30;c.lineWidth=r*0.09;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.sin(ha)*r*0.45,y-Math.cos(ha)*r*0.45);c.stroke();c.lineWidth=r*0.06;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.sin(ma)*r*0.68,y-Math.cos(ma)*r*0.68);c.stroke();c.fillStyle='#c96a7a';c.beginPath();c.arc(x,y,r*0.07,0,7);c.fill()}

// ---------- 2: ровно в восемь ----------
function shotEight(c,t,d,T){const k=easeOut(t/1.5);c.save();cam(c,480,1050,1.02+0.08*ease(t/d),0,0);room(c,T);
 clockP(c,250,520,130,20,Math.min(0,(t-1.2)*2));
 const sit=k>=1,x=lerp(980,440,k);
 const b=doll(c,{...BOY,x,y:sit?1262:1262+190,s:1.0,face:sit?1:-1,expr:{eyes:'open',mouth:'flat',brow:-0.4},pose:sit?{lean:0.04,...SITB,armL:[0.9,1.9],armR:[0.7,1.7]}:{lean:0.1,legL:[Math.sin(T*9)*0.5,Math.sin(T*9)*0.5-0.3],legR:[-Math.sin(T*9)*0.5,-Math.sin(T*9)*0.5-0.3],armL:[0.5,0.9],bob:-Math.abs(Math.sin(T*9))*8}});
 phoneMini(c,b.hf.x+6,b.hf.y-8,0.5,0.9,0.4);c.restore()}
// ---------- 3-4: набирает номер ----------
function shotDial(c,t,d,T){const num='89005551408',n=Math.min(num.length,Math.floor(t/(d-0.6)*num.length)+1),px=170,py=230,pw=740,ph=1440;c.save();cam(c,540,960,1.0+0.05*ease(t/d),0,0);blanketBg(c,T);
 let key=null;
 phoneBody(c,px,py,pw,ph,-0.02,()=>{const g=c.createLinearGradient(0,py,0,py+ph);g.addColorStop(0,'#3a4668');g.addColorStop(1,'#1c2238');c.fillStyle=g;c.fillRect(px,py,pw,ph);
  let s2=num.slice(0,n);const fm=s2.replace(/^(\d)(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/,(m,a,b,c2,d2,e)=>[a,b,c2,d2,e].filter(Boolean).join(' '));txt(c,fm,px+pw/2,py+230,74,'#fff');
  const K=['1','2','3','4','5','6','7','8','9','*','0','#'];K.forEach((kk,i)=>{const kx=px+pw/2+((i%3)-1)*190,ky=py+440+Math.floor(i/3)*190,act=kk==num[n-1];if(act)key=[kx,ky];paper(c,act?'#ffd60a':'#55628a',()=>c.arc(kx,ky,74,0,7),12,6,0.3);txt(c,kk,kx,ky+4,70,act?'#3a2d3d':'#fff')});
  paper(c,'#3fbf7f',()=>c.arc(px+pw/2,py+ph-170,74,0,7),14,7,0.35)});
 if(key){const tap=Math.abs(Math.sin(t/(d-0.6)*num.length*Math.PI));const fx=key[0]+30,fy=key[1]+40+tap*26;c.save();sh(c,20,10,0.35);c.strokeStyle='#f2c9a4';c.lineWidth=84;c.lineCap='round';c.beginPath();c.moveTo(fx+420,fy+760);c.lineTo(fx,fy);c.stroke();c.restore();c.strokeStyle='#4f86c6';c.lineWidth=150;c.lineCap='round';c.beginPath();c.moveTo(fx+640,fy+1160);c.lineTo(fx+470,fy+850);c.stroke()}
 c.restore()}
// ---------- 5-6: гудки, щелчок ----------
function shotRing(c,t,d,T,m){const cl=m[1]!=null?t-m[1]:-1;c.save();cam(c,560,900,1.0+0.07*ease(t/d),0,0);closeBg(c,T);
 const b=boyClose(c,T,{eyes:cl>0?'closed':'open',mouth:cl>0?'smile':'flat',brow:-0.5});if(cl<0)rings(c,b.hf.x-60,b.hf.y-60,T);
 if(cl<0){const k=(T*0.9)%1;c.save();c.globalAlpha=Math.sin(k*Math.PI);bigText(c,'ту-у…',300,420-k*60,110,'#fff',1,-0.05,18);c.restore()}
 else if(cl<0.5){const q=cl/0.5;c.save();c.globalAlpha=1-q;c.strokeStyle='#ffd60a';c.lineWidth=12;c.lineCap='round';for(let i=0;i<8;i++){const a=i*Math.PI/4;c.beginPath();c.moveTo(b.hf.x-40+Math.cos(a)*(70+q*60),b.hf.y-70+Math.sin(a)*(70+q*60));c.lineTo(b.hf.x-40+Math.cos(a)*(110+q*90),b.hf.y-70+Math.sin(a)*(110+q*90));c.stroke()}c.restore()}
 c.restore()}
// ---------- 7-11: её голос ----------
function shotVoice(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,560,900,1.0+0.07*ease(t/d),0,0);closeBg(c,T);
 boyClose(c,T,{eyes:'closed',mouth:'smile',brow:-0.8,tear:A(3)>0?A(3)*0.4:0});
 const L=[];if(A(1)>0)L.push('«Привет!');if(A(2)>0)L[0]='«Привет! Это мама.';if(A(3)>0)L.push('Я сейчас не могу ответить.');if(A(4)>0)L.push('Но я обязательно перезвоню».');
 if(A(1)>0)bub(c,70,150,940,470,760,720,back(A(1)/0.3),()=>{mom(c,180,250,72);L.forEach((l,i)=>txt(c,l,270,236+i*74,i==0?52:40,'#3a2d3d','left'));if(L.length<3)wave(c,150,500,36,T,'#c96a7a',70);else wave(c,150,540,36,T,'#c96a7a',50)});
 c.restore()}
// ---------- 12-13: мамы не стало ----------
function shotPhoto(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,z=ease(Math.max(0,a1)/1.2);c.save();cam(c,lerp(540,560,z),lerp(960,860,z),1.0+0.14*z,0,0);
 const wg=c.createLinearGradient(0,0,0,H);wg.addColorStop(0,'#3a5564');wg.addColorStop(1,'#507282');c.fillStyle=wg;c.fillRect(-200,-200,W+400,H+400);
 c.fillStyle='rgba(255,255,255,0.035)';for(let x=-180;x<W+200;x+=90)c.fillRect(x,-200,44,H+400);
 glow(c,930,700,900,'rgba(255,205,130,A)',0.45);
 paper(c,'#9a6a50',()=>c.rect(-200,1330,W+400,800),30,-14,0.35);
 paper(c,'#6a4a3c',()=>c.roundRect(860,880,40,460,10),10,5,0.3);paper(c,'#ffe3a6',()=>{c.moveTo(760,600);c.lineTo(1000,600);c.lineTo(1060,900);c.lineTo(700,900);c.closePath()},22,11,0.32);
 // рамка с фото
 c.save();c.translate(420,960);c.rotate(-0.03);paper(c,'#f3e6cf',()=>c.roundRect(-270,-380,540,740,24),34,18,0.4);
 c.save();c.beginPath();c.rect(-230,-340,460,600);c.clip();const sg=c.createLinearGradient(0,-340,0,260);sg.addColorStop(0,'#f8c98a');sg.addColorStop(1,'#e59a6a');c.fillStyle=sg;c.fillRect(-230,-340,460,600);
 paper(c,'#7fae6a',()=>c.ellipse(0,330,420,160,0,0,7),10,-5,0.2);
 doll(c,{skin:'#f2c9a4',hair:'#6b4032',hairBack:true,top:'#c96a7a',topDark:'#b25a6a',bot:'#6a5a8a',x:-50,y:230,s:1.25,face:1,noLegs:true,expr:{eyes:'closed',mouth:'smile'},pose:{lean:0.05,armL:[1.2,1.9],armR:[0.4,0.8]}});
 doll(c,{...BOY,x:90,y:250,s:0.85,face:-1,noLegs:true,expr:{eyes:'closed',mouth:'smile'},pose:{lean:0.1,armL:[1.3,1.6]}});
 c.restore();c.restore();
 if(a1>0){const r=rng(17);for(let i=0;i<16;i++){const k=((a1*0.22+r())%1),lx=r()*W+Math.sin(T*1.3+i)*50,ly=-80+k*2100,rot=T*1.5+i;c.save();c.translate(lx,ly);c.rotate(rot);paper(c,['#d9843a','#c9562e','#e2a94c'][i%3],()=>{c.moveTo(0,-26);c.quadraticCurveTo(24,0,0,30);c.quadraticCurveTo(-24,0,0,-26)},8,4,0.25);c.restore()}}
 c.restore()}
// ---------- 14-16: одиннадцать секунд ----------
function shotEleven(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,p=clamp(t/(m[1]||d)),n=Math.max(1,Math.ceil(p*11));c.save();cam(c,540,960,1.0+0.05*ease(t/d),0,0);
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#3a4668');g.addColorStop(1,'#1c2238');c.fillStyle=g;c.fillRect(-200,-200,W+400,H+400);
 glow(c,540,760,800,'rgba(255,200,150,A)',0.3);
 c.strokeStyle='rgba(255,255,255,0.14)';c.lineWidth=44;c.beginPath();c.arc(540,760,330,0,7);c.stroke();
 c.save();sh(c,16,8,0.3);c.strokeStyle='#ffd60a';c.lineCap='round';c.lineWidth=44;c.beginPath();c.arc(540,760,330,-Math.PI/2,-Math.PI/2+p*Math.PI*2);c.stroke();c.restore();
 mom(c,540,760,230);
 for(let i=0;i<11;i++){const a=-Math.PI/2+(i+0.5)/11*Math.PI*2,on=i<n;paper(c,on?'#ffd60a':'#55628a',()=>c.arc(540+Math.cos(a)*440,760+Math.sin(a)*440,on?26:18,0,7),8,4,0.3)}
 c.restore();bigText(c,String(a1>0?11:n),W/2,1290,190,'#ffd60a',1+0.05*Math.sin(T*14),0,26)}
// ---------- 17-22: рассказывает всё ----------
function card(c,x,y,rot,k,draw){if(k<=0)return;c.save();c.translate(x,y);c.rotate(rot);c.scale(k,k);paper(c,'#fbf4e4',()=>c.roundRect(-130,-130,260,260,34),24,12,0.35);draw();c.restore()}
function shotTell(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,540,1000,1.0+0.05*ease(t/d),0,0);
 c.save();c.filter='blur(7px)';c.translate(-160,-240);c.scale(1.3,1.3);room(c,T);c.restore();c.fillStyle='rgba(40,30,60,0.22)';c.fillRect(-200,-200,W+400,H+400);
 const tk=Math.sin(T*10)>0;const b=doll(c,{...BOY,x:540,y:1560,s:1.7,face:1,noLegs:false,expr:{eyes:'open',mouth:tk?'o':'smile',brow:0.5},pose:{lean:0.02,...SITB,armL:[-2.3,-3.3],armR:[1.2+Math.sin(T*5)*0.3,2.2+Math.sin(T*5)*0.3],bob:Math.sin(T*5)*3}});phoneMini(c,b.hf.x-10,b.hf.y-32,0.12,1.7,0.45);
 paper(c,'#e2a94c',()=>c.rect(-200,1560,W+400,600),24,-12,0.3);
 card(c,210,360,-0.08,back(A(1)/0.3),()=>{c.strokeStyle='rgba(80,110,160,0.35)';c.lineWidth=3;for(let i=0;i<5;i++){c.beginPath();c.moveTo(-100,-70+i*40);c.lineTo(100,-70+i*40);c.stroke()}txt(c,'5',0,6,210,'#d0403a')});
 card(c,540,300,0.04,back(A(2)/0.3),()=>{paper(c,'#fff',()=>{c.moveTo(-56,-60);c.quadraticCurveTo(0,-90,56,-60);c.quadraticCurveTo(70,10,36,80);c.quadraticCurveTo(20,30,0,30);c.quadraticCurveTo(-20,30,-36,80);c.quadraticCurveTo(-70,10,-56,-60)},10,5,0.25);txt(c,'✦',70,-70,60,'#ffd60a')});
 card(c,870,360,0.08,back(A(3)/0.3),()=>{paper(c,'#4f86c6',()=>{c.moveTo(-100,50);c.lineTo(-90,-10);c.quadraticCurveTo(-40,-50,10,-10);c.lineTo(100,30);c.quadraticCurveTo(110,60,90,64);c.lineTo(-100,64);c.closePath()},10,5,0.25);c.fillStyle='#f6efe2';c.fillRect(-100,50,196,16);c.strokeStyle='#fff';c.lineWidth=9;c.lineCap='round';c.beginPath();c.ellipse(-36,-36,26,14,-0.5,0,7);c.ellipse(4,-40,26,14,0.5,0,7);c.stroke()});
 if(A(4)>0)bigText(c,'САМ!',870,560,90,'#ffd60a',0.7+0.3*back(A(4)/0.3),0.06,16);
 card(c,370,650,-0.05,back(A(5)/0.3),()=>{c.save();c.filter='blur(6px)';for(let i=0;i<4;i++){const k=((T*0.5+i/4)%1);c.fillStyle=`rgba(50,45,50,${0.8*(1-k)})`;c.beginPath();c.arc(Math.sin(i*2+T)*20,-40-k*90,22+k*26,0,7);c.fill()}c.restore();paper(c,'#7c8794',()=>c.roundRect(-80,-10,160,100,16),10,5,0.25);c.fillStyle='#2a2428';c.fillRect(-70,-10,140,22);c.fillStyle='#7c8794';c.fillRect(-116,10,40,16);c.fillRect(76,10,40,16)});
 c.restore()}
// ---------- кухня ----------
function kitchen(c,T,night){const fy=1500;const wg=c.createLinearGradient(0,0,0,fy);if(night){wg.addColorStop(0,'#28303f');wg.addColorStop(1,'#3a465c')}else{wg.addColorStop(0,'#8a6e58');wg.addColorStop(1,'#a8876a')}c.fillStyle=wg;c.fillRect(-200,-200,W+400,fy+200);
 const wx=340,wy=330,ww=400,wh=430;paper(c,'#f3e6cf',()=>c.roundRect(wx-30,wy-30,ww+60,wh+60,20),24,12,0.35);c.save();c.beginPath();c.rect(wx,wy,ww,wh);c.clip();const sg=c.createLinearGradient(0,wy,0,wy+wh);if(night){sg.addColorStop(0,'#141a33');sg.addColorStop(1,'#34406a')}else{sg.addColorStop(0,'#5a4a8a');sg.addColorStop(1,'#f8b66a')}c.fillStyle=sg;c.fillRect(wx,wy,ww,wh);
 if(night){glow(c,wx+280,wy+130,220,'rgba(220,230,255,A)',0.5);paper(c,'#f3f0dc',()=>c.arc(wx+280,wy+130,52,0,7),10,5,0.2);c.fillStyle='#fff';const r=rng(3);for(let i=0;i<24;i++){c.globalAlpha=0.4+0.6*Math.abs(Math.sin(T+i));c.fillRect(wx+r()*ww,wy+r()*wh*0.7,4,4)}c.globalAlpha=1}city(c,wx,wx+ww,wy+wh,T);c.restore();
 c.save();sh(c,8,4,0.25);c.fillStyle='#f3e6cf';c.fillRect(wx+ww/2-10,wy,20,wh);c.restore();
 paper(c,night?'#55607a':'#d9c6a5',()=>c.roundRect(-60,180,330,330,16),22,11,0.33);paper(c,night?'#55607a':'#d9c6a5',()=>c.roundRect(810,180,330,330,16),22,11,0.33);
 paper(c,night?'#4a546c':'#c7b28e',()=>c.roundRect(-60,1010,330,500,12),22,11,0.33);paper(c,night?'#6a7690':'#e9dcc6',()=>c.roundRect(-80,990,370,40,10),10,5,0.3);
 paper(c,night?'#6c7690':'#e6e2da',()=>c.roundRect(820,720,330,790,26),24,12,0.35);paper(c,night?'#4a546c':'#b9b4aa',()=>c.roundRect(850,860,18,160,9),4,2,0.3);
 const fg=c.createLinearGradient(0,fy,0,H);if(night){fg.addColorStop(0,'#2a3040');fg.addColorStop(1,'#151923')}else{fg.addColorStop(0,'#7a584a');fg.addColorStop(1,'#4a352e')}c.save();sh(c,20,-8,0.25);c.fillStyle=fg;c.fillRect(-200,fy,W+400,H-fy+200);c.restore()}
function tableP(c,night){paper(c,night?'#6a5548':'#b98464',()=>c.roundRect(170,1250,740,56,20),26,14,0.38);paper(c,night?'#55443a':'#9a6a50',()=>{c.rect(230,1306,30,330);c.rect(820,1306,30,330)},14,7,0.3)}
function chairP(c,x,night){paper(c,night?'#55443a':'#8a5d4a',()=>{c.roundRect(x-70,960,140,300,18);c.rect(x-70,1260,24,320);c.rect(x+46,1260,24,320)},18,9,0.32)}
// ---------- 23-24: папа ничего не знает ----------
function shotDadDoor(c,t,d,T){c.save();cam(c,540,1040,1.02+0.07*ease(t/d),0,0);room(c,T);
 const b=doll(c,{...BOY,x:440,y:1262,s:1.0,face:-1,expr:{eyes:'open',mouth:'flat'},pose:{lean:0.1,headTilt:0.2,...SITB,legL:[-1.45,-0.05],legR:[-1.38,0.04],armL:[0.9,1.9],armR:[0.7,1.7]}});
 paper(c,'#c96a7a',()=>c.roundRect(b.hf.x-70,b.hf.y-30,120,84,8),10,5,0.3);paper(c,'#fbf4e4',()=>c.roundRect(b.hf.x-62,b.hf.y-22,104,68,4),0,0,0);
 // дверной проём
 paper(c,'#2a2230',()=>c.rect(820,300,460,1210),30,10,0.4);glow(c,1000,900,560,'rgba(255,200,130,A)',0.5);paper(c,'#ffd9a0',()=>c.rect(860,340,400,1170),0,0,0);
 const dd=doll(c,{...DAD,x:960,y:1210,s:1.35,face:-1,expr:{eyes:'open',mouth:'flat',brow:-0.7},pose:{lean:0.04,armL:[0.2,0.3],armR:[-0.1,0.1],bob:Math.sin(T*1.4)*2}});stubble(c,dd,-1);
 paper(c,'#8a5d4a',()=>c.rect(790,280,50,1230),14,7,0.35);
 const k=back((t-0.9)/0.35);if(t>0.9)bub(c,470,330,360,300,760,700,k,()=>{doll(c,{...BOY,x:650,y:640,s:0.62,noLegs:true,expr:{eyes:'closed',mouth:'smile'}})});
 c.restore()}
// ---------- 25-27: не плачет ----------
function shotFuneral(c,t,d,T,m){c.save();cam(c,540,1040,1.04+0.08*ease(t/d),0,0);
 const g=c.createLinearGradient(0,0,0,1400);g.addColorStop(0,'#6f7a86');g.addColorStop(1,'#a3abb3');c.fillStyle=g;c.fillRect(-200,-200,W+400,1700);
 for(const [x,h] of [[120,700],[930,620]]){paper(c,'#4c535c',()=>{c.rect(x-14,1400-h,28,h);for(let i=0;i<5;i++){c.moveTo(x,1400-h+i*90);c.lineTo(x-130+i*14,1400-h-60+i*90);c.lineTo(x-124+i*14,1400-h-74+i*90);c.lineTo(x,1400-h-20+i*90);c.moveTo(x,1400-h+40+i*90);c.lineTo(x+120-i*14,1400-h-20+i*90);c.lineTo(x+114-i*14,1400-h-34+i*90);c.lineTo(x,1400-h+20+i*90)}},14,7,0.25)}
 paper(c,'#5d6a5e',()=>c.rect(-200,1400,W+400,800),24,-12,0.3);
 const G={skin:'#d9c0aa',hair:'#2e2a30',top:'#34343e',topDark:'#2a2a33',bot:'#2a2a33',botDark:'#222229',shoe:'#1c1c22'};
 [[190,1.35,1],[400,1.25,1],[720,1.3,-1],[920,1.4,-1]].forEach(([x,s,f],i)=>{const a=doll(c,{...G,x,y:1260,s,face:f,expr:{eyes:'closed',mouth:'sad',tear:i%2?(T*0.4+i*0.3):0},pose:{lean:0.03,headTilt:0.14,armL:[2.2,3.1],armR:[0.1,0.2]}});
  c.strokeStyle='#22222a';c.lineWidth=8;c.beginPath();c.moveTo(a.hf.x,a.hf.y);c.lineTo(a.hf.x,a.hf.y-330*s/1.3);c.stroke();paper(c,'#2c2c36',()=>{c.arc(a.hf.x,a.hf.y-330*s/1.3,190,Math.PI,0);c.closePath()},18,9,0.35)});
 const b=doll(c,{...BOY,top:'#3a4252',topDark:'#30384a',stripe:null,x:560,y:1330,s:0.95,face:1,expr:{eyes:'open',mouth:'flat',brow:-0.3},pose:{armL:[1.1,1.9],armR:[0.1,0.2]}});
 c.strokeStyle='#5d8a5a';c.lineWidth=7;c.beginPath();c.moveTo(b.hf.x,b.hf.y);c.lineTo(b.hf.x+10,b.hf.y-80);c.stroke();paper(c,'#fff',()=>{for(let i=0;i<5;i++){const a=i*Math.PI*2/5;c.moveTo(b.hf.x+10,b.hf.y-80);c.ellipse(b.hf.x+10+Math.cos(a)*16,b.hf.y-80+Math.sin(a)*16,14,9,a,0,7)}},6,3,0.25);
 c.strokeStyle='rgba(230,236,245,0.5)';c.lineWidth=4;c.lineCap='round';const r=rng(6);c.beginPath();for(let i=0;i<110;i++){const x0=r()*1400-100,y0=r()*2100,y=((y0+T*1500)%2100)-100,x=x0-y*0.12;c.moveTo(x,y);c.lineTo(x-7,y+56)}c.stroke();
 c.restore();c.fillStyle='rgba(60,70,90,0.22)';c.fillRect(0,0,W,H)}
// ---------- 28-30: молчат ----------
function shotTable(c,t,d,T,m){const a2=m[2]!=null?t-m[2]:-1,z=ease(Math.max(0,a2)/1.5);c.save();cam(c,540,lerp(1040,1100,z),1.0+0.22*z,0,0);kitchen(c,T,false);glow(c,540,700,800,'rgba(255,210,150,A)',0.35);
 paper(c,'#6a4a3c',()=>c.rect(532,-100,16,420),6,3,0.3);paper(c,'#ffe3a6',()=>{c.moveTo(450,300);c.lineTo(630,300);c.lineTo(690,430);c.lineTo(390,430);c.closePath()},18,9,0.3);
 chairP(c,540,false);paper(c,'#c96a7a',()=>{c.moveTo(480,960);c.quadraticCurveTo(540,930,600,960);c.lineTo(610,1120);c.quadraticCurveTo(540,1150,470,1120);c.closePath()},12,6,0.28);
 const dd=doll(c,{...DAD,x:230,y:1340,s:1.35,face:1,noLegs:true,expr:{eyes:'open',mouth:'flat',brow:-0.6},pose:{lean:0.1,headTilt:0.22,armL:[1.0,1.5+Math.sin(T*3)*0.1],armR:[0.8,1.4]}});stubble(c,dd,1);
 doll(c,{...BOY,x:860,y:1330,s:1.0,face:-1,noLegs:true,expr:{eyes:'open',mouth:'flat',brow:-0.4},pose:{lean:0.1,headTilt:0.24,armL:[1.0,1.5-Math.sin(T*3)*0.1],armR:[0.8,1.4]}});
 tableP(c,false);
 for(const x of [330,760]){paper(c,'#f6efe2',()=>c.ellipse(x,1244,84,22,0,0,7),8,4,0.3);paper(c,'#e2c08a',()=>c.ellipse(x,1238,56,12,0,0,7),0,0,0)}
 paper(c,'#f6efe2',()=>c.roundRect(510,1196,60,56,10),8,4,0.3);
 c.restore()}
// ---------- 31-34: папа ночью на кухне ----------
function shotDadNight(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1;c.save();cam(c,520,1000,1.04+0.12*ease(t/d),0,0);kitchen(c,T,true);
 clockP(c,180,700,90,2,10);chairP(c,440,true);
 const dd=doll(c,{...DAD,x:440,y:1340,s:1.5,face:1,noLegs:true,expr:{eyes:'closed',mouth:'sad',brow:-0.9,tear:a1>0.5?(a1-0.5)*0.4:0},pose:{lean:0.06,headTilt:0.14,armL:[-2.3,-3.3],armR:[1.0,1.5],bob:Math.sin(T*1.4)*3}});stubble(c,dd,1);phoneMini(c,dd.hf.x-10,dd.hf.y-30,0.12,1.5,0.6);
 tableP(c,true);paper(c,'#8fa0bc',()=>c.roundRect(700,1196,64,58,10),8,4,0.3);
 if(a1>0)bub(c,150,250,800,330,560,690,back(a1/0.3),()=>{mom(c,250,340,64);txt(c,'«Привет! Это мама.',340,318,44,'#3a2d3d','left');txt(c,'Я перезвоню…»',340,376,44,'#3a2d3d','left');wave(c,200,490,31,T,'#c96a7a',64)});
 c.restore();c.fillStyle='rgba(20,26,50,0.25)';c.fillRect(0,0,W,H)}
// ---------- 35-36: счёт ----------
function shotBill(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,k=easeOut(t/0.8);c.save();cam(c,540,960,1.0+0.08*ease(t/d),0,0);
 paper(c,'#b98464',()=>c.rect(-200,-200,W+400,H+400),0,0,0);c.strokeStyle='rgba(0,0,0,0.08)';c.lineWidth=6;for(let i=0;i<8;i++){c.beginPath();c.moveTo(-200,i*280);c.lineTo(W+200,i*280+40);c.stroke()}
 c.save();c.translate(540,lerp(2300,980,k));c.rotate(-0.03);paper(c,'#fbf6ea',()=>c.roundRect(-400,-620,800,1240,16),40,20,0.4);
 txt(c,'СЧЁТ ЗА ТЕЛЕФОН',0,-520,58,'#3a2d3d');c.fillStyle='#d9cdb8';c.fillRect(-340,-460,680,6);
 const rows=[['Интернет','1 шт'],['СМС','12'],['Звонки: прочие','31'],['Звонки: «Мама»','365'],['Роуминг','0']];rows.forEach(([a,b],i)=>{const y=-380+i*130,hl=i==3&&a1>0;if(hl){paper(c,'#ffe27a',()=>c.roundRect(-370,y-52,740,104,18),10,5,0.25)}txt(c,a,-330,y,46,hl?'#b3362e':'#5a4d58','left');txt(c,b,330,y,hl?70:46,hl?'#b3362e':'#5a4d58','right')});
 c.fillStyle='#d9cdb8';c.fillRect(-340,300,680,6);txt(c,'Итого',-330,380,50,'#3a2d3d','left');txt(c,'1 840 ₽',330,380,50,'#3a2d3d','right');
 c.restore();
 for(const sx of [-1,1])paper(c,'#eebf98',()=>c.ellipse(540+sx*430,lerp(2500,1560,k),76,104,sx*0.5,0,7),16,8,0.32);
 c.restore();if(a1>0.4){bigText(c,'365',W/2,300,220,'#ffd60a',0.7+0.3*back((a1-0.4)/0.3),-0.03,28)}}
// ---------- 37-38: папа закрывает лицо ----------
function shotDadCry(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,h=ease(Math.max(0,a1)/0.6);c.save();cam(c,540,930,1.0+0.08*ease(t/d),0,0);
 c.save();c.filter='blur(9px)';c.translate(-300,-500);c.scale(1.6,1.6);kitchen(c,T,true);c.restore();c.fillStyle='rgba(20,26,50,0.3)';c.fillRect(-200,-200,W+400,H+400);glow(c,540,600,800,'rgba(255,205,130,A)',0.3);
 const sk=h>0?Math.sin(T*22)*3:0;
 const dd=doll(c,{...DAD,x:540+sk,y:1760,s:2.7,face:1,noLegs:true,expr:{eyes:h>0.5?'closed':'open',mouth:'sad',brow:-1},pose:{lean:0.02+0.08*h,headTilt:0.06+0.2*h,armL:[lerp(0.3,2.2,h),lerp(0.5,3.3,h)],armR:[lerp(0.2,2.0,h),lerp(0.4,3.2,h)]}});stubble(c,dd,1);
 if(h>0.6){for(const dx of [0.1,0.66])paper(c,'#eebf98',()=>c.ellipse(dd.head.x+dx*dd.HR,dd.head.y+dd.HR*0.12,dd.HR*0.36,dd.HR*0.5,0.2,0,7),14,7,0.3);
  for(let i=0;i<2;i++){const q=((T*0.6+i/2)%1);c.fillStyle=`rgba(150,205,255,${1-q})`;c.beginPath();c.ellipse(dd.head.x+dd.HR*(0.2+i*0.5),dd.head.y+dd.HR*(0.7+q*0.9),10,16,0,0,7);c.fill()}}
 else{c.save();c.translate(250,1560);c.rotate(-0.2);paper(c,'#fbf6ea',()=>c.roundRect(-150,-190,300,380,10),20,10,0.35);txt(c,'365',0,0,90,'#b3362e');c.restore()}
 c.restore()}
// ---------- 39-40: оба берегут друг друга ----------
function shotBoth(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1;c.save();cam(c,540,960,1.0+0.05*ease(t/d),0,0);
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#3a465c');g.addColorStop(0.5,'#3a465c');g.addColorStop(0.5,'#3a5564');g.addColorStop(1,'#3a5564');c.fillStyle=g;c.fillRect(-200,-200,W+400,H+400);
 glow(c,300,600,700,'rgba(255,205,130,A)',0.25);glow(c,780,1500,700,'rgba(255,205,130,A)',0.25);
 const dd=doll(c,{...DAD,x:300,y:980,s:1.7,face:1,noLegs:true,expr:{eyes:'open',mouth:'sad',brow:-0.9},pose:{lean:0.03,headTilt:0.1}});stubble(c,dd,1);
 bub(c,560,180,440,400,620,560,back((t-0.3)/0.35),()=>{doll(c,{...BOY,x:780,y:560,s:0.78,noLegs:true,expr:{eyes:'closed',mouth:'smile'}})});
 paper(c,'#fbf4e4',()=>c.rect(-200,950,W+400,20),14,7,0.3);
 if(a1>0){const b=doll(c,{...BOY,x:780,y:1840,s:1.7,face:-1,noLegs:true,expr:{eyes:'open',mouth:'sad',brow:-0.9,tear:a1*0.3},pose:{lean:0.03,headTilt:0.1}});
  bub(c,80,1090,440,400,460,1480,back((a1-0.3)/0.35),()=>{const q=doll(c,{...DAD,x:300,y:1470,s:0.78,noLegs:true,expr:{eyes:'closed',mouth:'smile'}});stubble(c,q,1)})}
 c.restore()}
// ---------- 41-43: номер отключают ----------
function shotOff(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1;c.save();cam(c,540,960,1.0+0.06*ease(t/d),0,0);
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#3a4668');g.addColorStop(1,'#1c2238');c.fillStyle=g;c.fillRect(-200,-200,W+400,H+400);
 const sx=a2>0?lerp(0,-260,ease(a2/0.7)):0;
 c.save();c.translate(540+sx,760);c.rotate(-0.04);paper(c,'#fbf4e4',()=>c.roundRect(-330,-230,660,460,40),34,18,0.4);mom(c,-200,-80,90);txt(c,'МАМА',40,-110,80,'#3a2d3d');txt(c,'8 900 555 14 08',0,60,62,'#5a4d58');
 paper(c,'#e2b24a',()=>c.roundRect(170,110,110,84,14),6,3,0.3);
 if(a1>0.3){const k=back((a1-0.3)/0.25);c.save();c.rotate(-0.2);c.scale(k,k);c.strokeStyle='#d0403a';c.lineWidth=14;c.strokeRect(-290,-74,580,148);txt(c,'ОТКЛЮЧЁН',0,6,96,'#d0403a');c.restore()}c.restore();
 if(a1<0){const dd=doll(c,{...DAD,x:540,y:1900,s:1.5,face:1,noLegs:true,expr:{eyes:'open',mouth:'flat',brow:-0.8},pose:{armL:[1.3,1.8],armR:[0.3,0.5]}});stubble(c,dd,1);paper(c,'#9a6a50',()=>c.roundRect(650,1560,420,220,14),20,10,0.35);paper(c,'#fbf6ea',()=>c.roundRect(700,lerp(1420,1600,ease(t/1.5)),300,120,8),10,5,0.3);paper(c,'#b98464',()=>c.roundRect(630,1660,460,140,14),16,8,0.35)}
 if(a2>0){const k=ease(a2/0.7);c.strokeStyle='#ffd60a';c.lineWidth=16;c.lineCap='round';c.setLineDash([10,34]);c.beginPath();c.moveTo(620+sx,1010);c.lineTo(lerp(620+sx,760,k),lerp(1010,1240,k));c.stroke();c.setLineDash([]);
  c.save();c.globalAlpha=clamp(a2/0.5);paper(c,'#55628a',()=>{c.arc(800,1380,150,0,7);c.ellipse(800,1700,230,170,0,0,7)},24,12,0.35);txt(c,'?',800,1390,200,'#ffd60a');c.restore()}
 c.restore()}
// ---------- 44: снова восемь ----------
function shotRoom2(c,t,d,T){c.save();cam(c,480,1050,1.0+0.1*ease(t/d),0,0);room(c,T);clockP(c,250,520,130,20,0);
 const b=doll(c,{...BOY,x:440,y:1262,s:1.0,face:1,expr:{eyes:'open',mouth:'smile',brow:0.3},pose:{lean:0.04,headTilt:0.06,...SITB,armL:[-2.3,-3.3],armR:[0.2,0.5],bob:Math.sin(T*1.6)*2}});phoneMini(c,b.hf.x-6,b.hf.y-20,0.12,1.0,0.45);c.restore()}
// ---------- 45-47: голоса нет ----------
function shotNoVoice(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1;c.save();cam(c,560,900,1.0+0.09*ease(t/d),0,0);closeBg(c,T,0.36);
 const b=boyClose(c,T,{eyes:a1>0?'wide':'open',mouth:a2>0?'sad':'flat',brow:a1>0?-1:-0.4});if(a1<0)rings(c,b.hf.x-60,b.hf.y-60,T);
 if(a1<0){const k=(T*0.9)%1;c.save();c.globalAlpha=Math.sin(k*Math.PI);bigText(c,'ту-у…',300,420-k*60,110,'#fff',1,-0.05,18);c.restore()}
 if(a2>0)bub(c,110,200,860,300,760,640,back(a2/0.3),()=>{paper(c,'#b9b4aa',()=>c.arc(230,320,70,0,7),10,5,0.25);txt(c,'?',230,326,90,'#fff');wave(c,340,350,26,T,'#b9b4aa',10,true);txt(c,'…',660,280,80,'#8a8478')});
 c.restore()}
// ---------- 48-50: снова и снова ----------
function shotRedial(c,t,d,T,m){const n=Math.min(10,1+Math.floor(t/(d-0.5)*10)),px=170,py=230,pw=740,ph=1440;c.save();cam(c,540,960,1.0+0.06*ease(t/d),Math.sin(T*30)*3,0);blanketBg(c,T);
 phoneBody(c,px,py,pw,ph,-0.02+Math.sin(T*9)*0.006,()=>{c.fillStyle='#f6efe2';c.fillRect(px,py,pw,ph);txt(c,'Недавние',px+70,py+150,60,'#2a2630','left');
  for(let i=0;i<n;i++){const ry=py+250+(n-1-i)*112;if(ry>py+ph-140)continue;const k=i==n-1?back((t/(d-0.5)*10)%1/0.4):1;c.save();c.translate(px+pw/2,ry+50);c.scale(1,k);c.translate(-(px+pw/2),-(ry+50));c.fillStyle='rgba(0,0,0,0.07)';c.fillRect(px+60,ry+104,pw-120,3);mom(c,px+110,ry+50,38);txt(c,'Мама',px+170,ry+34,42,'#d0403a','left');txt(c,'✕ вызов не прошёл',px+170,ry+78,28,'#8a8478','left');txt(c,'20:0'+Math.min(9,i),px+pw-70,ry+50,30,'#8a8478','right');c.restore()}});
 c.restore();bigText(c,String(n),W/2,300,220,'#ffd60a',1+0.06*Math.sin(T*16),0,28)}
// ---------- 51-52: плачет ----------
function shotCry(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1;c.save();cam(c,560,900,1.0+0.09*ease(t/d),0,0);closeBg(c,T,0.4);
 const b=boyClose(c,T,{eyes:'closed',mouth:a1>0&&Math.sin(T*9)>0?'o':'sad',brow:-1,tear:T*0.7},{headTilt:0.16,bob:Math.sin(T*20)*3});
 for(let i=0;i<2;i++){const q=((T*0.7+0.5+i*0.3)%1);c.fillStyle=`rgba(150,205,255,${1-q*0.6})`;c.beginPath();c.ellipse(b.head.x+b.HR*0.14,b.head.y+b.HR*(0.3+q*0.8),16,26,0,0,7);c.fill()}
 if(a1>0)bub(c,90,190,900,330,640,660,back(a1/0.3),()=>{txt(c,'Мама,',540,300,96);txt(c,'ну пожалуйста…',540,410,84)});
 c.restore()}
function shotAnswer11(c,t,d,T,m){shotAnswer(c,t,d,T,m);if(m[1]==null||t<m[1]+0.45){const k=back(t/0.3);bigText(c,'11',W/2,300,220,'#ffd60a',0.7+0.3*k,0,28)}}
Object.assign(FN,{shotEight,shotDial,shotRing,shotVoice,shotPhoto,shotEleven,shotTell,shotDadDoor,shotFuneral,shotTable,shotDadNight,shotBill,shotDadCry,shotBoth,shotOff,shotRoom2,shotNoVoice,shotRedial,shotCry,shotAnswer11});

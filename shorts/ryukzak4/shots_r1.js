// «Второй рюкзак», часть 1 — сцены. Подключается последним.
const LIZA={skin:'#f2c9a4',hair:'#8a5a3a',hairBack:true,top:'#e2a94c',topDark:'#c9923c',bot:'#5a4a7a',botDark:'#4a3c66',shoe:'#f4efe6'};
const TEACH={skin:'#f0cdb0',hair:'#3a2a24',bun:true,top:'#3f8a86',topDark:'#34746f',bot:'#3a3a48',botDark:'#2f2f3c',shoe:'#2a2630'};
const KIDS=[['#e07a5f','#3a2a24'],['#7fb69a','#b98a4a'],['#b98ac9','#6b4032'],['#6fa8dc','#2e2a30']];
function specs(c,m,f){const HR=m.HR,ey=m.head.y+HR*0.12;c.strokeStyle='#3a2d3d';c.lineWidth=HR*0.05;for(const dx of [0.14,0.62]){c.beginPath();c.arc(m.head.x+f*HR*dx,ey,HR*0.2,0,7);c.stroke()}c.beginPath();c.moveTo(m.head.x+f*HR*0.34,ey);c.lineTo(m.head.x+f*HR*0.42,ey);c.stroke()}
function teach(c,o){const m=doll(c,{...TEACH,...o});specs(c,m,o.face||1);return m}
function bag(c,x,y,s,col='#3f6fd0',o={}){c.save();c.translate(x,y);c.scale(s,s);c.rotate(o.rot||0);
 paper(c,'#2a3f80',()=>c.roundRect(-34,-196,68,50,22),6,3,0.25);paper(c,col,()=>c.roundRect(-90,-170,180,200,44),18,9,0.33);paper(c,'#2f58b0',()=>c.roundRect(-64,-70,128,84,22),6,3,0.2);
 c.strokeStyle='#22346a';c.lineWidth=6;c.beginPath();c.moveTo(-70,-110);c.quadraticCurveTo(0,-140,70,-110);c.stroke();
 if(o.key!==false){const sw=Math.sin((o.T||0)*3)*0.25;c.save();c.translate(78,-90);c.rotate(sw);c.strokeStyle='#d8d2c2';c.lineWidth=4;c.beginPath();c.moveTo(0,0);c.lineTo(0,40);c.stroke();paper(c,'#f6efe2',()=>{c.moveTo(0,40);c.quadraticCurveTo(22,66,14,104);c.lineTo(-14,104);c.quadraticCurveTo(-22,66,0,40)},4,2,0.25);c.fillStyle='#e0403a';c.beginPath();c.moveTo(0,40);c.quadraticCurveTo(12,52,10,62);c.lineTo(-10,62);c.quadraticCurveTo(-12,52,0,40);c.fill();c.fillStyle='#4f86c6';c.beginPath();c.arc(0,78,7,0,7);c.fill();c.fillStyle='#e0403a';c.beginPath();c.moveTo(-14,104);c.lineTo(-24,116);c.lineTo(-10,108);c.moveTo(14,104);c.lineTo(24,116);c.lineTo(10,108);c.fill();c.restore()}
 c.restore()}
function classBack(c,T){const fy=1500;const wg=c.createLinearGradient(0,0,0,fy);wg.addColorStop(0,'#cfe0c8');wg.addColorStop(1,'#b4cdb0');c.fillStyle=wg;c.fillRect(-200,-200,W+400,fy+200);
 paper(c,'#f3e6cf',()=>c.roundRect(600,300,380,460,16),20,10,0.3);const sg=c.createLinearGradient(0,320,0,740);sg.addColorStop(0,'#8fc4ec');sg.addColorStop(1,'#e9f0e0');c.fillStyle=sg;c.fillRect(620,320,340,420);paper(c,'rgba(255,255,255,0.8)',()=>c.ellipse(760+Math.sin(T*0.2)*20,440,90,26,0,0,7),6,3,0.15);c.fillStyle='#f3e6cf';c.fillRect(784,320,12,420);
 [[110,360,'#e9c98a'],[320,400,'#c9a0d0']].forEach(([x,y,col])=>{paper(c,'#fbf4e4',()=>c.roundRect(x,y,170,220,8),10,5,0.25);c.fillStyle=col;c.fillRect(x+16,y+16,138,120)});
 paper(c,'#8fa88c',()=>c.rect(-200,1080,W+400,30),4,2,0.2);
 const fg=c.createLinearGradient(0,fy,0,H);fg.addColorStop(0,'#b08a62');fg.addColorStop(1,'#6a4f38');c.save();sh(c,20,-8,0.25);c.fillStyle=fg;c.fillRect(-200,fy,W+400,H-fy+200);c.restore()}
function chairF(c,x){paper(c,'#8a6a4a',()=>{c.roundRect(x-80,1000,160,230,16);c.rect(x-74,1230,20,300);c.rect(x+54,1230,20,300)},14,7,0.3)}
function deskF(c){paper(c,'#c79a66',()=>c.roundRect(200,1250,680,50,14),22,11,0.35);paper(c,'#a87c4e',()=>c.rect(230,1300,620,220),10,5,0.25);paper(c,'#8a6a4a',()=>{c.rect(230,1520,24,60);c.rect(826,1520,24,60)},4,2,0.2)}
function lizaSeat(c,T,expr,pose={}){return doll(c,{...LIZA,x:400,y:1330,s:1.1,face:1,noLegs:true,expr,pose:{lean:0.03,armL:[1.0,1.5],armR:[0.8,1.4],bob:Math.sin(T*1.5)*2,...pose}})}
function classBoard(c,T,txt2){const fy=1500;const wg=c.createLinearGradient(0,0,0,fy);wg.addColorStop(0,'#cfe0c8');wg.addColorStop(1,'#b4cdb0');c.fillStyle=wg;c.fillRect(-200,-200,W+400,fy+200);
 paper(c,'#8a6a4a',()=>c.roundRect(110,330,860,560,14),20,10,0.33);paper(c,'#2f5a48',()=>c.rect(134,354,812,512),0,0,0);c.save();c.transform(1,0,-0.12,1,0,0);txt(c,txt2||'Ирина Сергеевна',640,470,60,'rgba(255,255,255,0.85)');c.restore();c.strokeStyle='rgba(255,255,255,0.5)';c.lineWidth=5;c.beginPath();c.moveTo(260,540);c.lineTo(820,540);c.stroke();
 paper(c,'#8fa88c',()=>c.rect(-200,1080,W+400,30),4,2,0.2);const fg=c.createLinearGradient(0,fy,0,H);fg.addColorStop(0,'#b08a62');fg.addColorStop(1,'#6a4f38');c.save();sh(c,20,-8,0.25);c.fillStyle=fg;c.fillRect(-200,fy,W+400,H-fy+200);c.restore();
 paper(c,'#a87c4e',()=>c.roundRect(560,1260,460,260,12),18,9,0.33);paper(c,'#c79a66',()=>c.roundRect(540,1230,500,44,12),10,5,0.3)}
function classBlur(c,T){c.save();c.filter='blur(9px)';c.translate(-300,-500);c.scale(1.6,1.6);classBack(c,T);c.restore();c.fillStyle='rgba(40,50,40,0.15)';c.fillRect(-200,-200,W+400,H+400)}
function nb(c,x,y,rot,col,draw){c.save();c.translate(x,y);c.rotate(rot);paper(c,col,()=>c.roundRect(-230,-300,460,600,14),24,12,0.35);paper(c,'#fbf6ea',()=>c.roundRect(-210,-280,420,560,8),4,2,0.2);c.strokeStyle='rgba(80,110,160,0.3)';c.lineWidth=3;for(let i=0;i<8;i++){c.beginPath();c.moveTo(-180,-200+i*62);c.lineTo(180,-200+i*62);c.stroke()}draw&&draw();c.restore()}
function scribble(c,n,k,col,slant,size=1){c.strokeStyle=col;c.lineWidth=5*size;c.lineCap='round';for(let i=0;i<n;i++){const kk=clamp(k*n-i);if(kk<=0)break;c.beginPath();for(let j=0;j<=40*kk;j++){const x=-170+j*8.5,y=-212+i*62+Math.sin(j*(slant?1.7:1.1)+i)*(slant?5:9)*size-(slant?j*0:0);j?c.lineTo(x+(slant?-Math.sin(j*1.7)*4:0),y):c.moveTo(x,y)}c.stroke()}}

// 0-4: два рюкзака
function shotSchool(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1,z=A(3)>0?ease(A(3)/0.6):0,x=lerp(-150,470,easeOut(t/2.6)),wk=t<2.6;c.save();cam(c,lerp(540,x+140,z),lerp(1040,1420,z),1.03+1.0*z,0,0);
 const sg=c.createLinearGradient(0,0,0,1400);sg.addColorStop(0,'#8fc4ec');sg.addColorStop(1,'#fbe9c8');c.fillStyle=sg;c.fillRect(-200,-200,W+400,1700);glow(c,880,360,420,'rgba(255,240,200,A)',0.6);
 paper(c,'#e9d9b8',()=>c.rect(330,380,820,1040),26,13,0.33);paper(c,'#c96a4a',()=>{c.moveTo(300,380);c.lineTo(740,220);c.lineTo(1180,380);c.closePath()},14,7,0.3);
 for(let f=0;f<3;f++)for(let i=0;i<4;i++)paper(c,'#9fc4d8',()=>c.roundRect(400+i*170,470+f*250,110,150,8),6,3,0.2);paper(c,'#7a4a36',()=>c.roundRect(650,1150,180,270,[90,90,0,0]),10,5,0.3);paper(c,'#fbf4e4',()=>c.roundRect(600,300,280,70,10),6,3,0.2);txt(c,'ШКОЛА',740,338,50,'#8a4a36');
 paper(c,'#8fb878',()=>c.rect(-200,1420,W+400,700),16,-8,0.3);paper(c,'#d9cdb8',()=>c.rect(-200,1500,W+400,160),6,3,0.2);
 const ph=T*7;const l=doll(c,{...LIZA,x,y:1620,s:1.1,face:1,expr:{eyes:'open',mouth:'flat',brow:-0.2},pose:wk?{legL:[Math.sin(ph)*0.4,Math.sin(ph)*0.4-0.25],legR:[-Math.sin(ph)*0.4,-Math.sin(ph)*0.4-0.25],armL:[0.5,0.9],lean:0.06,bob:-Math.abs(Math.sin(ph))*6}:{armL:[0.5,0.9]}});
 bag(c,l.shd.x-74,l.shd.y+150,0.62,'#c96a7a',{key:false});bag(c,l.hf.x+20,l.hf.y+150,0.78,'#3f6fd0',{T});
 c.restore();if(A(0)>-1&&A(3)<0)bigText(c,'2',W/2,300,220,'#ffd60a',0.7+0.3*back((t-1.6)/0.3),0,28)}
// 5-7: соседний стул
function shotDesk(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1,put=ease(Math.max(0,A(1))/0.7);c.save();cam(c,540,1080,1.04+0.1*ease(t/d),0,0);classBack(c,T);chairF(c,400);chairF(c,680);
 if(A(2)>0)glow(c,680,1100,300,'rgba(255,220,150,A)',0.5*ease(A(2)/0.6));
 const l=lizaSeat(c,T,{eyes:'open',mouth:'flat',brow:-0.3},put<1&&A(1)>0?{armL:[1.5,1.6]}:{});bag(c,lerp(480,680,put),lerp(1160,1218,put),0.9,'#3f6fd0',{T});deskF(c);c.restore();
 if(A(2)>0)bigText(c,'1 ГОД',760,560,110,'#ffd60a',0.7+0.3*back(A(2)/0.3),0.04,22)}
// 8-11: две тетради
function shotTwoNotebooks(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1,k1=clamp(A(1)/((m[2]||3)-(m[1]||1))),k2=A(2)>0?clamp(A(2)/2.2):0;c.save();cam(c,540,960,1.0+0.05*ease(t/d),0,0);paper(c,'#c79a66',()=>c.rect(-200,-200,W+400,H+400),0,0,0);
 nb(c,290,900,-0.05,'#e2a94c',()=>scribble(c,8,A(1)>0?k1:0,'#2b3a66',false));nb(c,790,900,0.05,'#3f6fd0',()=>scribble(c,8,k2,'#2b3a66',false));
 const wr=k2>0&&k2<1?[790,k2]:k1<1&&A(1)>0?[290,k1]:null;if(wr){const row=Math.floor(wr[1]*8),fx=wr[0]-170+((wr[1]*8)%1)*340,fy2=900-212+row*62;c.save();c.translate(fx,fy2);c.rotate(0.5);paper(c,'#ffd60a',()=>c.roundRect(-8,-200,16,200,6),6,3,0.3);c.fillStyle='#3a2d3d';c.beginPath();c.moveTo(-8,0);c.lineTo(0,16);c.lineTo(8,0);c.fill();c.restore();paper(c,'#f2c9a4',()=>c.ellipse(fx+70,fy2-130,60,80,0.5,0,7),12,6,0.3)}
 c.restore();if(A(0)>-1&&A(1)<0)bigText(c,'2',W/2,280,220,'#ffd60a',0.7+0.3*back((t-1.2)/0.3),0,28)}
// 12-13 / 17-18: столовая
function cafe(c,T){const fy=1500;const wg=c.createLinearGradient(0,0,0,fy);wg.addColorStop(0,'#f3e2c0');wg.addColorStop(1,'#e2c89a');c.fillStyle=wg;c.fillRect(-200,-200,W+400,fy+200);for(let i=0;i<8;i++)for(let j=0;j<5;j++)if((i+j)%2){c.fillStyle='rgba(255,255,255,0.18)';c.fillRect(-100+i*170,200+j*170,170,170)}
 paper(c,'#fbf4e4',()=>c.roundRect(120,320,360,220,14),14,7,0.25);txt(c,'МЕНЮ',300,390,54,'#8a4a36');txt(c,'компот · каша',300,470,36,'#8a8478');
 const fg=c.createLinearGradient(0,fy,0,H);fg.addColorStop(0,'#b99a78');fg.addColorStop(1,'#6a5540');c.save();sh(c,20,-8,0.25);c.fillStyle=fg;c.fillRect(-200,fy,W+400,H-fy+200);c.restore()}
function glass(c,x,y,full=1){paper(c,'rgba(235,245,250,0.85)',()=>{c.moveTo(x-34,y-110);c.lineTo(x+34,y-110);c.lineTo(x+26,y);c.lineTo(x-26,y);c.closePath()},8,4,0.25);c.fillStyle='#c94a5a';c.beginPath();c.moveTo(x-31,y-100*full);c.lineTo(x+31,y-100*full);c.lineTo(x+25,y-4);c.lineTo(x-25,y-4);c.fill()}
function shotCafe(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1;c.save();cam(c,540,1080,1.04+0.1*ease(t/d),0,0);cafe(c,T);chairF(c,400);chairF(c,680);
 lizaSeat(c,T,{eyes:'open',mouth:'flat',brow:-0.3},{armL:[1.2,1.9]});paper(c,'#f6efe2',()=>c.roundRect(170,1250,740,50,14),22,11,0.35);paper(c,'#d9cdb8',()=>c.rect(220,1300,640,240),8,4,0.2);
 glass(c,470,1250,a1>0?lerp(1,0.35,ease(a1/1.5)):1);glass(c,650,1250,1);if(a1>0)glow(c,650,1190,170,'rgba(255,220,150,A)',0.5);c.restore();
 if(a1<0)bigText(c,'2',W/2,300,220,'#ffd60a',0.7+0.3*back((t-1.0)/0.3),0,28)}
function shotSlide(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,k=ease(Math.max(0,a1)/1.2);c.save();cam(c,560,1100,1.1+0.12*ease(t/d),0,0);cafe(c,T);chairF(c,400);chairF(c,680);
 lizaSeat(c,T,{eyes:'closed',mouth:'flat',brow:-0.8},{headTilt:0.2,armL:[1.3,lerp(1.9,1.5,k)]});paper(c,'#f6efe2',()=>c.roundRect(170,1250,740,50,14),22,11,0.35);paper(c,'#d9cdb8',()=>c.rect(220,1300,640,240),8,4,0.2);
 glass(c,440,1250,0.35);glass(c,lerp(560,700,k),1250,1);c.restore()}
// 14-16: смеются
function shotMock(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1;c.save();cam(c,540,1040,1.04+0.08*ease(t/d),0,0);cafe(c,T);
 const R=KIDS.slice(0,3).map(([top,hair],i)=>doll(c,{skin:'#f2c9a4',hair,top,bot:'#4a4458',x:180+i*170,y:1560+(i%2)*20,s:1.05,face:1,expr:{eyes:'closed',mouth:Math.sin(T*11+i)>0?'o':'smile',brow:0.6},pose:{armL:i==1?[1.5,1.55]:[0.4,2.2],bob:Math.abs(Math.sin(T*10+i))*-12}}));
 doll(c,{...LIZA,x:860,y:1570,s:1.1,face:-1,expr:{eyes:'closed',mouth:'flat',brow:-0.9},pose:{headTilt:0.25,armL:[1.2,1.7]}});bag(c,790,1560,0.6,'#3f6fd0',{T});
 if(a1>0)bub(c,90,330,820,a2>0?420:300,R[1].head.x+30,R[1].head.y-R[1].HR-24,a2>0?1:back(a1/0.3),()=>{lines(c,['Лиза, ты с кем','разговариваешь?'],500,a2>0?410:430,62,86);if(a2>0)txt(c,'С рюкзаком?',500,640,72,'#b3362e')});
 c.save();c.font='900 70px M';c.textAlign='center';[[240,1000,0],[420,940,0.4]].forEach(([x,y,p],i)=>{const k=((T*1.1+p)%1);c.globalAlpha=Math.sin(k*Math.PI);c.lineJoin='round';c.strokeStyle='#000';c.lineWidth=12;c.strokeText('ха!',x,y-k*60);c.fillStyle='#ffd60a';c.fillText('ха!',x,y-k*60)});c.restore();c.restore()}
// 19-23: уроки дважды
function shotHomework(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,540,960,1.0+0.05*ease(t/d),0,0);
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#3a2f4a');g.addColorStop(1,'#5a4636');c.fillStyle=g;c.fillRect(-200,-200,W+400,H+400);glow(c,540,700,1000,'rgba(255,205,130,A)',0.45);paper(c,'#8a6248',()=>c.rect(-200,500,W+400,H),20,-10,0.3);
 nb(c,290,1000,-0.05,'#e2a94c',()=>scribble(c,8,A(2)>0?clamp(A(2)/1.8):0,'#2b3a66',false));nb(c,790,1000,0.05,'#3f6fd0',()=>scribble(c,8,A(3)>0?clamp(A(3)/2.2):0,'#2b3a66',true,0.6));
 paper(c,'#6a4a3c',()=>c.roundRect(880,240,24,330,8),6,3,0.3);paper(c,'#ffe3a6',()=>{c.moveTo(790,160);c.lineTo(990,160);c.lineTo(1040,300);c.lineTo(740,300);c.closePath()},16,8,0.3);
 c.restore();if(A(1)>0&&A(2)<0)bigText(c,'×2',W/2,300,200,'#ffd60a',0.7+0.3*back(A(1)/0.3),0,28);if(A(4)>0)bigText(c,'ОН?',790,430,120,'#fff',0.7+0.3*back(A(4)/0.3),0.04,22)}
// 24-26: ни разу
function shotCalendar(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1,n=Math.min(30,Math.floor(t/(d-0.8)*30)+1),two=A(2)>0;c.save();cam(c,540,960,1.0+0.05*ease(t/d),0,0);
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#cfe0c8');g.addColorStop(1,'#b4cdb0');c.fillStyle=g;c.fillRect(-200,-200,W+400,H+400);
 c.save();c.translate(540,900);c.rotate(-0.02);paper(c,'#fbf4e4',()=>c.roundRect(-440,-470,880,960,30),36,18,0.4);paper(c,'#3f8a86',()=>c.roundRect(-440,-470,880,130,[30,30,0,0]),0,0,0);txt(c,'ПОСЕЩАЕМОСТЬ',0,-404,56,'#fff');
 for(let i=0;i<30;i++){const x=-360+(i%6)*144,y=-250+Math.floor(i/6)*150,on=i<n;paper(c,on?'#e4f2d8':'#ece3d0',()=>c.roundRect(x-58,y-58,116,116,16),6,3,0.2);if(on){txt(c,'✓',x-(two?22:0),y+6,60,'#e2a94c');if(two)txt(c,'✓',x+26,y+6,60,'#3f6fd0')}}c.restore();c.restore()}
// 27-29: новая учительница
function shotTeacher(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1,k=easeOut(t/1.6);c.save();cam(c,540,1040,1.04+0.08*ease(t/d),0,0);classBoard(c,T);
 const te=teach(c,{x:lerp(-150,330,k),y:1560,s:1.4,face:1,expr:{eyes:'open',mouth:'flat',brow:A(2)>0?-0.2:0.3},pose:k<1?{legL:[Math.sin(T*8)*0.35,0],legR:[-Math.sin(T*8)*0.35,0]}:{armL:A(2)>0?[1.4,1.5]:[0.3,0.5]}});if(A(2)>0)angry(c,te,1);
 bag(c,800,1228,0.9,'#3f6fd0',{T});if(A(2)>0){glow(c,800,1140,260,'rgba(255,90,90,A)',0.35)}c.restore()}
// 30-31: убери
function shotRemove(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1;c.save();cam(c,540,930,1.0+0.08*ease(t/d),0,0);c.save();c.filter='blur(9px)';c.translate(-300,-500);c.scale(1.6,1.6);classBoard(c,T);c.restore();
 const te=teach(c,{x:520,y:1760,s:2.6,face:1,noLegs:true,expr:{eyes:'open',mouth:Math.sin(T*10)>0?'o':'flat'},pose:{armL:[1.5,1.55]}});angry(c,te,1);
 bub(c,110,150,860,a1>0?440:250,te.head.x+80,te.head.y-te.HR-40,a1>0?1:back((t-0.14)/0.25),()=>{txt(c,'Убери.',540,a1>0?240:275,100,'#b3362e');if(a1>0)lines(c,['Здесь будет сидеть','новенький.'],540,380,62,88)});c.restore()}
// 32-34: место занято
function shotTaken(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1;c.save();cam(c,560,900,1.0+0.1*ease(t/d),0,0);classBlur(c,T);
 const l=doll(c,{...LIZA,skin:a2>0?'#f7dcc8':'#f2c9a4',x:560,y:1700,s:2.7,face:-1,noLegs:true,expr:{eyes:'wide',mouth:a1>0&&a2<0&&Math.sin(T*10)>0?'o':'flat',brow:-0.8},pose:{armL:[1.0,1.5],bob:Math.sin(T*24)*2}});
 if(a2>0)bub(c,560,170,400,250,900,520,back(a2/0.25),()=>txt(c,'Кем?',760,295,110,'#b3362e'));
 else if(a1>0)bub(c,110,170,800,300,l.head.x-60,l.head.y-l.HR-40,back(a1/0.3),()=>txt(c,'Это место занято.',510,320,72));c.restore()}
// 35-36: класс затих
function shotSilentClass(c,t,d,T,m){c.save();cam(c,540,1060,1.04+0.1*ease(t/d),0,0);classBack(c,T);
 KIDS.forEach(([top,hair],i)=>doll(c,{skin:'#f2c9a4',hair,top,bot:'#4a4458',x:130+i*270,y:1250,s:0.8,face:i<2?1:-1,noLegs:true,expr:{eyes:'wide',mouth:'flat'}}));paper(c,'#c79a66',()=>c.rect(-200,1230,W+400,40),10,5,0.25);
 chairF(c,400);chairF(c,680);lizaSeat(c,T,{eyes:'closed',mouth:'sad',brow:-1},{headTilt:0.3});bag(c,680,1218,0.9,'#3f6fd0',{T});deskF(c);c.restore()}
// 37-38: взяла рюкзак
function shotTake(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,k=ease(t/1.0),hv=a1>0?ease(a1/0.4):0;c.save();cam(c,560,1060,1.06+0.1*ease(t/d),0,0);classBack(c,T);chairF(c,400);chairF(c,680);
 lizaSeat(c,T,{eyes:'wide',mouth:'o',brow:1},{armL:[1.5,1.5]});deskF(c);
 const te=teach(c,{x:900,y:1580,s:1.4,face:-1,expr:{eyes:hv>0?'wide':'open',mouth:hv>0?'o':'flat',brow:hv>0?1:0},pose:{lean:0.1+hv*0.14,armL:[1.3,1.5],armR:[1.1,1.4]}});
 bag(c,lerp(680,te.hf.x,k),lerp(1218,te.hf.y+150+hv*60,k),0.9,'#3f6fd0',{T,rot:hv*0.15});c.restore()}
// 39-43: тетради
function shotOpenBag(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1,n=A(1)>0?12:Math.min(12,1+Math.floor(t*3.2)),z=A(2)>0?ease(A(2)/0.8):0;c.save();cam(c,540,lerp(960,820,z),1.0+0.25*z,0,0);paper(c,'#c79a66',()=>c.rect(-200,-200,W+400,H+400),0,0,0);
 paper(c,'#2a3f80',()=>c.roundRect(120,1150,840,640,90),30,15,0.4);paper(c,'#3f6fd0',()=>c.roundRect(150,1250,780,520,70),0,0,0);
 for(let i=0;i<n;i++){const col=['#3f6fd0','#7fb69a','#e2a94c','#c96a7a'][i%4];c.save();c.translate(540+((i*37)%60-30),1180-i*52);c.rotate(((i*53)%10-5)/60);paper(c,col,()=>c.roundRect(-260,-150,520,300,12),14,7,0.3);
  if(i==n-1&&A(2)>0){paper(c,'#fbf6ea',()=>c.roundRect(-190,-90,380,180,10),4,2,0.2);if(A(3)>0)txt(c,'Миша Соколов',0,-30,48,'#2b3a66');if(A(4)>0)txt(c,'5 «Б»',0,44,50,'#2b3a66')}c.restore()}
 c.restore();if(A(1)>0&&A(2)<0.3)bigText(c,'12',W/2,280,220,'#ffd60a',0.7+0.3*back(A(1)/0.3),0,28)}
// 44-46: браслет и фото
function shotBracelet(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1;c.save();cam(c,540,960,1.0+0.08*ease(t/d),0,0);paper(c,'#2a3f80',()=>c.rect(-200,-200,W+400,H+400),0,0,0);glow(c,540,900,900,'rgba(150,190,255,A)',0.25);
 c.save();c.translate(540,a1>0?560:900);c.rotate(-0.08);paper(c,'#fbf6ea',()=>c.roundRect(-330,-70,660,140,70),20,10,0.35);paper(c,'#fff',()=>c.roundRect(-250,-44,440,88,10),0,0,0);txt(c,'СОКОЛОВ М.',-30,-10,40,'#3a2d3d');txt(c,'палата 7',-30,28,26,'#8a8478');paper(c,'#e0403a',()=>{c.rect(232,-34,18,68);c.rect(207,-9,68,18)},0,0,0);c.restore();
 if(a1>0){const k=back(a1/0.35);c.save();c.translate(540,1150);c.rotate(0.04);c.scale(k,k);paper(c,'#f3e6cf',()=>c.roundRect(-330,-330,660,720,20),30,15,0.4);const sg=c.createLinearGradient(0,-300,0,260);sg.addColorStop(0,'#bfe0f0');sg.addColorStop(1,'#8fb878');c.fillStyle=sg;c.fillRect(-296,-296,592,560);
  c.save();c.beginPath();c.rect(-296,-296,592,560);c.clip();doll(c,{...LIZA,x:-130,y:300,s:1.25,face:1,noLegs:true,expr:{eyes:'closed',mouth:'smile'},pose:{armL:[1.3,1.5]}});doll(c,{...LIZA,hair:'#8a5a3a',hairBack:false,top:'#3f6fd0',topDark:'#345fb8',x:130,y:300,s:1.25,face:-1,noLegs:true,expr:{eyes:'closed',mouth:'smile'},pose:{armL:[1.3,1.5]}});c.restore();c.restore();
  if(a2>0)bigText(c,'= =',540,1520,10,'#fff',1,0,2)}
 c.restore()}
// 47-50: журнал
function shotJournal(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,540,960,1.0+0.08*ease(t/d),0,0);paper(c,'#a87c4e',()=>c.rect(-200,-200,W+400,H+400),0,0,0);
 c.save();c.translate(540,980);c.rotate(-0.02);paper(c,'#3f8a86',()=>c.roundRect(-450,-640,900,1280,20),40,20,0.4);paper(c,'#fbf6ea',()=>c.roundRect(-420,-610,840,1220,10),6,3,0.2);txt(c,'ЖУРНАЛ · 5 «Б»',0,-530,56,'#3a2d3d');
 const N=['Рябов Илья','Савина Оля','Сергеев Дима','Соколова Лиза','Тихонов Артём','Уварова Катя','Фёдоров Миша'];N.forEach((n,i)=>{const y=-400+i*124,hl=i==3&&A(1)>0;if(hl)paper(c,'#ffe27a',()=>c.roundRect(-390,y-50,780,100,16),8,4,0.25);txt(c,(19+i)+'.',-360,y,44,'#8a8478','left');txt(c,n,-270,y,50,hl?'#b3362e':'#3a2d3d','left');c.fillStyle='#d9cdb8';c.fillRect(-390,y+58,780,4)});
 if(A(3)>0){const k=back(A(3)/0.3);c.save();c.translate(130,500);c.scale(k,k);c.strokeStyle='#d0403a';c.lineWidth=10;c.setLineDash([18,14]);c.strokeRect(-400,-46,640,92);c.setLineDash([]);txt(c,'Соколов Миша — ?',-80,2,46,'#d0403a');c.restore()}
 c.restore();c.restore();if(A(2)>0&&A(3)<0)bigText(c,'ОДНА',W/2,280,150,'#ffd60a',0.7+0.3*back(A(2)/0.3),-0.02,24)}

function hook(c,T){const a=1-ease((T-2.6)/0.3);if(a<=0)return;c.save();c.globalAlpha=a;bigText(c,'ВТОРОЙ РЮКЗАК',W/2,1700,96,'#ffd60a',0.7+0.3*back(T/0.3),-0.02,22);c.restore()}
function outro(c,T){const s=window.DATA.outro;if(T<s)return;bigText(c,'ГДЕ МИША?',W/2,230,130,'#ffd60a',0.7+0.3*back((T-s)/0.3),-0.02,24);if(T>s+0.4)bigText(c,'ЧАСТЬ 2 — СКОРО',W/2,360,70,'#fff',0.7+0.3*back((T-s-0.4)/0.3),0,14)}
Object.assign(FN,{shotSchool,shotDesk,shotTwoNotebooks,shotCafe,shotSlide,shotMock,shotHomework,shotCalendar,shotTeacher,shotRemove,shotTaken,shotSilentClass,shotTake,shotOpenBag,shotBracelet,shotJournal});

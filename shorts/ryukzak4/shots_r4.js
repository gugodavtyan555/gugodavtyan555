// «Второй рюкзак», часть 4 — сцены. Подключается после shots_r3.js
const MOM2={skin:'#f0cdb0',hair:'#8a5a3a',hairBack:true,top:'#c96a7a',topDark:'#b25a6a',bot:'#5a4a7a',botDark:'#4a3c66',shoe:'#8a5d4a'};
const DAD2={...DAD,top:'#6a6a8a',topDark:'#5a5a78'};
function wardNo(c,T,o={}){const w=ward(c,T,{glass:false});if(o.speaker!==false)speaker(c,935,1290,1.3,T,o.on!==false);return w}
function lizaFloor2(c,T,expr,pose={}){return doll(c,{...LIZA,x:620,y:1640,s:1.1,face:-1,expr,pose:{lean:0.2,headTilt:0.2,legL:[1.5,0.2],legR:[1.4,0.1],armL:[1.2,1.8],armR:[1.0,1.6],bob:Math.sin(T*1.5)*2,...pose}})}
function monitorFlat(c,x,y,T,alive){paper(c,'#10181d',()=>c.roundRect(x,y,280,200,18),14,7,0.3);c.fillStyle='#04120c';c.fillRect(x+16,y+16,248,140);c.save();c.strokeStyle=alive?'#39ff9a':'#ff5a4f';c.lineWidth=5;c.shadowColor=c.strokeStyle;c.shadowBlur=14;c.beginPath();for(let i=0;i<=60;i++){const u=i/60,ph=((u*2.2-T*1.05)%1+1)%1;let v=0;if(alive){if(ph>0.42&&ph<0.46)v=-14;else if(ph>=0.46&&ph<0.5)v=50;else if(ph>=0.5&&ph<0.54)v=-28}const px=x+20+u*240;i?c.lineTo(px,y+90-v):c.moveTo(px,y+90-v)}c.stroke();c.restore()}

// 0-1: зовите родителей — повтор
function shotCallParents(c,t,d,T){shotDoctorRun(c,t+2.0,d+2.0,T,[0,0.1,0.2,0.3,0.4])}
// 2-5: родители бегут
function shotParentsRun(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1,ph=T*9;c.save();cam(c,540,1040,1.06+0.08*ease(t/d),0,0);hospP(c,T);
 for(const x of [150,640])paper(c,'#e9eef0',()=>c.rect(x,420,260,1080),8,4,0.2);
 const k=ease(t/(d*0.85)),mx=lerp(-200,520,k);
 const mom=doll(c,{...MOM2,x:mx,y:1580,s:1.3,face:1,expr:{eyes:'wide',mouth:'o',brow:1},pose:{legL:[Math.sin(ph)*0.65,Math.sin(ph)*0.65-0.4],legR:[-Math.sin(ph)*0.65,-Math.sin(ph)*0.65-0.4],lean:0.3,armL:[1.0,1.5],armR:[-0.9,-1.4]}});
 paper(c,'#8a5d4a',()=>c.ellipse(lerp(300,-100,k)+(A(2)>0?0:0),1590+Math.sin(ph)*10,40,16,0,0,7),8,4,0.3);
 const dd=doll(c,{...DAD2,x:mx-210,y:1590,s:1.35,face:1,expr:{eyes:'wide',mouth:'flat',brow:1},pose:{legL:[Math.sin(ph+1)*0.6,Math.sin(ph+1)*0.6-0.4],legR:[-Math.sin(ph+1)*0.6,-Math.sin(ph+1)*0.6-0.4],lean:0.3,armL:[0.6,1.0]}});stubble(c,dd,1);
 if(A(3)>0){const q=ease(A(3)/0.6);c.save();c.translate(lerp(dd.hf.x,120,q),lerp(dd.hf.y+40,1640,q*q));c.rotate(q*2);c.fillStyle='#d9a441';c.fillRect(-6,-26,12,40);c.strokeStyle='#d9a441';c.lineWidth=7;c.beginPath();c.arc(0,-34,12,0,7);c.stroke();c.restore()}
 c.restore();if(A(1)>0)bigText(c,'СРОЧНО!',W/2,280,150,'#ffd60a',1+0.04*Math.sin(T*18),0,26)}
// 6-8: замерли
function shotFrozen(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,500,1100,1.2-0.1*ease(t/d),0,0);wardNo(c,T);
 doll(c,{...MOM2,x:700,y:1630,s:1.15,face:-1,expr:{eyes:'wide',mouth:'o',brow:1,tear:T*0.4},pose:{armL:[2.2,3.2],armR:[0.2,0.3]}});const dd=doll(c,{...DAD2,x:880,y:1640,s:1.3,face:-1,expr:{eyes:'wide',mouth:'flat',brow:1},pose:{armL:[0.3,0.4]}});stubble(c,dd,-1);
 c.restore();if(A(1)>0)bigText(c,'ЗАМЕРЛИ',W/2,260,130,'#fff',0.7+0.3*back(A(1)/0.3),-0.02,24)}
// 9-12: монитор дышит
function shotMonitorLive(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1,alive=A(2)>0;c.save();cam(c,540,900,1.0+0.1*ease(t/d),0,0);
 c.fillStyle='#10181d';c.fillRect(-200,-200,W+400,H+400);paper(c,'#04120c',()=>c.roundRect(90,420,900,760,40),0,0,0);
 c.save();c.strokeStyle=alive?'#39ff9a':'#ff5a4f';c.lineWidth=14;c.lineJoin='round';c.shadowColor=c.strokeStyle;c.shadowBlur=40;c.beginPath();for(let i=0;i<=90;i++){const u=i/90,ph=((u*2.2-T*1.05)%1+1)%1;let v=0;if(alive){const amp=1.4;if(ph>0.42&&ph<0.46)v=-40*amp;else if(ph>=0.46&&ph<0.5)v=150*amp;else if(ph>=0.5&&ph<0.54)v=-80*amp}const px=130+u*820;i?c.lineTo(px,800-v):c.moveTo(px,800-v)}c.stroke();c.restore();
 txt(c,alive?'72':'—',820,1090,120,alive?'#39ff9a':'#ff5a4f');c.restore();
 if(A(1)>0&&A(3)<0)bigText(c,alive?'ОН ДЫШИТ':'ГОД — ПРЯМАЯ',W/2,280,alive?130:110,alive?'#39ff9a':'#ff5a4f',0.7+0.3*back(A(1)/0.3),0,24)}
// 13-17: врач говорит
function shotDoctorExplain(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,540,1040,1.06+0.08*ease(t/d),0,0);hospP(c,T);
 const dc=doll(c,{...DOC,x:330,y:1540,s:1.45,face:1,expr:{eyes:'open',mouth:Math.sin(T*10)>0?'o':'flat',brow:0.2},pose:{armL:[0.9,1.6+Math.sin(T*5)*0.15]}});mask(c,dc);
 doll(c,{...MOM2,x:700,y:1560,s:1.25,face:-1,expr:{eyes:'wide',mouth:'flat',brow:0.8,tear:T*0.3},pose:{armL:[2.2,3.2]}});const dd=doll(c,{...DAD2,x:900,y:1570,s:1.35,face:-1,expr:{eyes:'open',mouth:'flat',brow:0.6}});stubble(c,dd,-1);
 const L=[];if(A(1)>0)L.push('Мозговая активность.');if(A(2)>0)L.push('Реакция на звук.');if(A(3)>0)L.push('Такого не было год.');
 if(L.length)bub(c,90,300-L.length*10,820,130+L.length*100,dc.head.x+30,dc.head.y-dc.HR-30,1,()=>L.forEach((l,i)=>txt(c,l,500,370-L.length*10+i*100,60,i==2?'#2b6a3a':'#3a2d3d')));c.restore()}
function shotGoodSign(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,540,930,1.0+0.08*ease(t/d),0,0);hospBlur(c,T);const dc=doll(c,{...DOC,x:520,y:1760,s:2.6,face:1,noLegs:true,expr:{eyes:'open',mouth:Math.sin(T*10)>0?'o':'flat',brow:A(1)>0?-0.6:0.4}});mask(c,dc);
 bub(c,110,170,860,A(1)>0?420:250,dc.head.x+80,dc.head.y-dc.HR-40,A(1)>0?1:back((t-0.14)/0.25),()=>{txt(c,'Это хороший знак.',540,A(1)>0?260:290,72,'#2b6a3a');if(A(1)>0)txt(c,'Но не гарантия.',540,420,72,'#b3362e')});c.restore()}
// 15-17: Лиза на полу
function shotLizaFear(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,620,1300,1.3+0.1*ease(t/d),0,0);wardNo(c,T);lizaFloor2(c,T,{eyes:'wide',mouth:'flat',brow:-0.8},{headTilt:0.1,bob:Math.sin(T*24)*2});
 if(A(2)>0){c.save();const q=back(A(2)/0.4);c.translate(600,860);c.scale(q,q);c.fillStyle='rgba(251,244,228,0.95)';c.beginPath();c.ellipse(0,0,250,100,0,0,7);c.fill();txt(c,'Вдруг всё исчезнет…',0,0,46,'#3a2d3d');c.restore()}c.restore()}
// 18-29: голоса из колонки
function shotVoices4(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,540,960,1.0+0.04*ease(t/d),0,0);const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#cfe0c8');g.addColorStop(1,'#b4cdb0');c.fillStyle=g;c.fillRect(-200,-200,W+400,H+400);
 const M=[[1,'Ирина Сергеевна','#3f8a86',['Тебе передают привет','с урока физики.']],[7,'Директор','#8a6a4a',['У нас в школе','новый спортзал.','Приходи, покажу.']]];
 M.forEach(([i0,nm,col,L],k)=>{const a=A(i0);if(a<0)return;const y=360+k*520;vmsg(c,110,y,860,nm,col,T,back(a/0.3));paper(c,'#fbf4e4',()=>c.roundRect(170,y+84,800,60+L.length*62,30),12,6,0.25);L.forEach((l,j)=>txt(c,l,570,y+138+j*62,44,'#3a2d3d'))});c.restore()}
function shotCountVoices(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1,n=A(3)>0?100:A(2)>0?40:24;c.save();cam(c,540,960,1.0+0.05*ease(t/d),0,0);const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#3a4668');g.addColorStop(1,'#1c2238');c.fillStyle=g;c.fillRect(-200,-200,W+400,H+400);
 const cols=['#e07a5f','#7fb69a','#b98ac9','#6fa8dc','#e2a94c','#c96a7a'];const dots=Math.min(60,Math.floor(n*0.6));for(let i=0;i<dots;i++){const x=110+(i%10)*92,y=760+Math.floor(i/10)*150;paper(c,cols[i%6],()=>c.arc(x,y,36,0,7),8,4,0.3);paper(c,'#f2c9a4',()=>c.arc(x,y-4,20,0,7),0,0,0)}
 c.restore();bigText(c,String(n),W/2,300,240,'#ffd60a',1+0.05*Math.sin(T*16),0,28);bigText(c,'ГОЛОСОВ',W/2,470,76,'#fff',1,0,16)}
function shotWhoSends(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,540,960,1.0+0.05*ease(t/d),0,0);const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#3a4668');g.addColorStop(1,'#1c2238');c.fillStyle=g;c.fillRect(-200,-200,W+400,H+400);
 const P=[[0,'РОДИТЕЛИ','#c96a7a',()=>{doll(c,{...MOM2,x:0,y:130,s:0.7,noLegs:true,expr:{eyes:'closed',mouth:'smile'}})}],[1,'СОСЕДИ','#e2a94c',()=>{vera(c,{x:0,y:130,s:0.7,noLegs:true,expr:{eyes:'closed',mouth:'smile'}})}],[2,'ДИРЕКТОР','#8a6a4a',()=>{const dr=doll(c,{...DIR,x:0,y:130,s:0.7,noLegs:true,expr:{eyes:'closed',mouth:'smile'}});specs(c,dr,1)}]];
 P.forEach(([i,nm,col,dr],k)=>{const a=A(i);if(a<0)return;card(c,540,520+k*400,(k-1)*0.04,back(a/0.3)*1.15,()=>{c.fillStyle=col;c.fillRect(-130,-130,260,260);c.save();c.beginPath();c.rect(-130,-130,260,260);c.clip();c.translate(0,0);dr();c.restore();});c.save();c.globalAlpha=clamp(a/0.3);bigText(c,nm,540+330,520+k*400,50,'#fff',1,0,12);c.restore()});c.restore()}
// 30-33: прошли недели
function shotWeeks(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1,w=A(2)>0?2:A(1)>0?1:0;c.save();cam(c,480,1100,1.2-0.1*ease(t/d),0,0);ward(c,T,{glass:false});speaker(c,935,1290,1.3,T);
 lizaChair(c,T,{eyes:'open',mouth:'flat',brow:-0.3});c.restore();c.fillStyle='rgba(20,30,50,0.12)';c.fillRect(0,0,W,H);
 const lab=A(2)>0?'ДВЕ НЕДЕЛИ':A(1)>0?'НЕДЕЛЯ':null;if(lab)bigText(c,lab,W/2,260,130,'#ffd60a',0.7+0.3*back((A(2)>0?A(2):A(1))/0.3),-0.02,24)}
function shotFingers(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1;c.save();cam(c,500,1120,1.2+0.1*ease(t/d),0,0);const w=ward(c,T,{glass:false});speaker(c,935,1290,1.3,T,a1>0);
 const tw=a1>0?Math.sin(T*22)*0.4:0;c.save();c.translate(560,1246);c.rotate(tw*0.3);paper(c,'#f2c9a4',()=>c.ellipse(0,0,30,22,0,0,7),6,3,0.25);c.restore();
 if(a1>0){glow(c,560,1230,200,'rgba(255,220,150,A)',0.6);c.strokeStyle='#ffd60a';c.lineWidth=8;c.lineCap='round';for(let i=0;i<5;i++){const a=-2.6+i*0.4;c.beginPath();c.moveTo(560+Math.cos(a)*70,1240+Math.sin(a)*70);c.lineTo(560+Math.cos(a)*105,1240+Math.sin(a)*105);c.stroke()}}
 lizaChair(c,T,{eyes:'wide',mouth:'o',brow:1});c.restore()}
function shotMonths(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1;c.save();cam(c,540,1040,1.06+0.08*ease(t/d),0,0);hospP(c,T);
 const dc=doll(c,{...DOC,x:330,y:1540,s:1.45,face:1,expr:{eyes:'open',mouth:a1>0&&Math.sin(T*10)>0?'o':'flat',brow:-0.4},pose:{armL:[0.9,1.6]}});mask(c,dc);doll(c,{...LIZA,x:760,y:1560,s:1.0,face:-1,expr:{eyes:'open',mouth:'flat',brow:-0.4}});
 if(a1>0)bub(c,90,300,820,a2>0?420:250,dc.head.x+30,dc.head.y-dc.HR-30,a2>0?1:back(a1/0.3),()=>{txt(c,'Иногда это длится',500,a2>0?370:420,58);if(a2>0){txt(c,'МЕСЯЦАМИ.',500,470,100,'#b3362e')}});c.restore()}
// 36-39: Лиза просто приходила
function shotRoutine(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,540,1040,1.06+0.06*ease(t/d),0,0);ward(c,T,{glass:false});speaker(c,935,1290,1.3,T);
 const l=lizaChair(c,T,{eyes:'open',mouth:'flat',brow:-0.2},{armL:[1.2+Math.sin(T*4)*0.1,1.7]});c.restore();
 if(A(2)>0)bigText(c,'16:00',W/2,260,150,'#ffd60a',0.7+0.3*back(A(2)/0.3),-0.02,24);
 if(A(3)>0)card(c,820,520,0.06,back(A(3)/0.3)*1.1,()=>{c.fillStyle='#e2a94c';c.fillRect(-60,-80,60,160);c.fillStyle='#3f6fd0';c.fillRect(0,-80,60,160);txt(c,'×2',0,100,46,'#3a2d3d')})}
// 40-43: колонка замолчала
function shotBatteryDead(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1,dead=A(1)>0;c.save();cam(c,540,960,1.0+0.08*ease(t/d),0,0);wardBlur(c,T);
 speaker(c,540,1500,3.2,T,!dead);
 if(dead){paper(c,'#fbf4e4',()=>c.roundRect(300,520,480,210,26),12,6,0.3);c.fillStyle='#e0403a';c.beginPath();c.roundRect(350,590,330,74,10);c.fill();c.fillStyle='#fbf4e4';c.fillRect(350+330,610,28,34);c.fillStyle='#fbf4e4';c.fillRect(358,598,50,58)}
 c.restore();if(A(2)>0)bigText(c,'ТИШИНА',W/2,260,150,'#fff',0.7+0.3*back(A(2)/0.3),-0.02,26)}
function shotPulseDrops(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1,drop=A(0)>-1?ease(t/(d*0.9)):0;c.save();cam(c,540,900,1.0+0.1*ease(t/d),Math.sin(T*30)*5*drop,0);
 c.fillStyle='#10181d';c.fillRect(-200,-200,W+400,H+400);paper(c,'#04120c',()=>c.roundRect(90,420,900,760,40),0,0,0);
 c.save();c.strokeStyle='#ff5a4f';c.lineWidth=14;c.lineJoin='round';c.shadowColor='#ff5a4f';c.shadowBlur=40;c.beginPath();for(let i=0;i<=90;i++){const u=i/90,ph=((u*(2.2-drop*1.2)-T*1.05)%1+1)%1;let v=0;const amp=(1.4-0.8*drop);if(ph>0.42&&ph<0.46)v=-40*amp;else if(ph>=0.46&&ph<0.5)v=150*amp;else if(ph>=0.5&&ph<0.54)v=-80*amp;const px=130+u*820;i?c.lineTo(px,800-v):c.moveTo(px,800-v)}c.stroke();c.restore();
 txt(c,String(Math.round(lerp(72,38,drop))),820,1090,120,'#ff5a4f');const b=Math.pow(Math.abs(Math.sin(T*14)),4);glow(c,220,1090,90+b*80,'rgba(255,60,60,A)',0.7);c.restore()}
// 44-49: нажала кнопку
function shotPressButton(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1,on=A(3)>0;c.save();cam(c,620,1160,1.2+0.1*ease(t/d),0,0);ward(c,T,{glass:false});speaker(c,935,1290,1.3,T,on);
 const dc=doll(c,{...DOC,x:lerp(240,520,ease(t/0.8)),y:1570,s:1.4,face:1,expr:{eyes:'wide',mouth:'o',brow:1},pose:t<0.8?{legL:[Math.sin(T*13)*0.6,0],legR:[-Math.sin(T*13)*0.6,0],lean:0.2}:{}});mask(c,dc);
 const l=doll(c,{...LIZA,x:lerp(790,900,ease(Math.max(0,A(1))/0.5)),y:1570,s:1.05,face:-1,expr:{eyes:'wide',mouth:'o',brow:1,tear:T*0.4},pose:{lean:0.2,armL:[1.6,1.9]}});
 const bx=lerp(l.hf.x,935,ease(Math.max(0,A(2))/0.5));c.save();c.translate(bx,1210);paper(c,'#ffd60a',()=>c.arc(0,0,22,0,7),6,3,0.3);c.restore();
 if(on){for(let i=0;i<3;i++){const q=((T*0.6+i/3)%1);c.save();c.globalAlpha=Math.sin(q*Math.PI);c.translate(560+i*90,820-q*160);paper(c,'#fff',()=>c.arc(0,0,20,0,7),0,0,0);c.restore()}}c.restore();
 if(A(3)>0&&A(4)<0)bigText(c,'ГОЛОСА ВЕРНУЛИСЬ',W/2,260,76,'#ffd60a',0.7+0.3*back(A(3)/0.3),-0.02,20);if(A(4)>0)bigText(c,'ПУЛЬС ВЫРОВНЯЛСЯ',W/2,260,76,'#39ff9a',0.7+0.3*back(A(4)/0.3),-0.02,20)}
function shotPulseBack(c,t,d,T){c.save();cam(c,540,900,1.0+0.08*ease(t/d),0,0);c.fillStyle='#10181d';c.fillRect(-200,-200,W+400,H+400);paper(c,'#04120c',()=>c.roundRect(90,420,900,760,40),0,0,0);
 c.save();c.strokeStyle='#39ff9a';c.lineWidth=14;c.lineJoin='round';c.shadowColor='#39ff9a';c.shadowBlur=40;c.beginPath();for(let i=0;i<=90;i++){const u=i/90,ph=((u*2.2-T*1.05)%1+1)%1;let v=0;if(ph>0.42&&ph<0.46)v=-56;else if(ph>=0.46&&ph<0.5)v=210;else if(ph>=0.5&&ph<0.54)v=-112;const px=130+u*820;i?c.lineTo(px,800-v):c.moveTo(px,800-v)}c.stroke();c.restore();txt(c,String(Math.round(lerp(40,74,ease(t/(d*0.7))))),820,1090,120,'#39ff9a');c.restore()}
// 50-53: он слышит
function shotHeHears(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,540,1040,1.06+0.08*ease(t/d),0,0);hospP(c,T);
 const dc=doll(c,{...DOC,x:330,y:1540,s:1.45,face:1,expr:{eyes:'open',mouth:A(1)>0&&Math.sin(T*10)>0?'o':'smile',brow:0.6},pose:{armL:[0.9,1.6]}});mask(c,dc);doll(c,{...LIZA,x:760,y:1560,s:1.0,face:-1,expr:{eyes:'wide',mouth:'o',brow:1,tear:T*0.4}});
 const L=[];if(A(1)>0)L.push('Он слышит.');if(A(2)>0)L.push('Он слышит голоса.');if(A(3)>0)L.push('Каждую секунду.');
 if(L.length)bub(c,90,300-L.length*10,820,130+L.length*100,dc.head.x+30,dc.head.y-dc.HR-30,1,()=>L.forEach((l,i)=>txt(c,l,500,370-L.length*10+i*100,i==0?76:60,i==0?'#2b6a3a':'#3a2d3d')));c.restore()}
// 54-57: «Миш, ты меня слышишь?»
function shotLizaAsks(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,480,1120,1.22+0.1*ease(t/d),0,0);const w=ward(c,T,{glass:false,speaker:false});
 const l=lizaChair(c,T,{eyes:'open',mouth:A(1)>0&&A(2)<0&&Math.sin(T*10)>0?'o':'flat',brow:0.8,tear:T*0.4},{lean:0.2,armL:[1.5,1.7]});
 if(A(1)>0&&A(2)<0)bub(c,100,600,640,210,l.head.x+60,l.head.y-l.HR-10,back(A(1)/0.3),()=>txt(c,'Миш, ты меня слышишь?',420,706,40));
 if(A(2)>0){c.save();c.globalAlpha=0.9;bigText(c,'…',W/2,300,220,'#fff',1,0,28);c.restore()}
 if(A(3)>0)glow(c,w.mi.head.x,w.mi.head.y,260,'rgba(255,220,150,A)',0.4*ease(A(3)/0.6));c.restore()}
// 58-59: хриплый шёпот
function shotWhisper(c,t,d,T,m){const A=i=>m[i]!=null?t-m[i]:-1;c.save();cam(c,500,1040,1.12+0.14*ease(t/d),0,0);ward(c,T,{glass:false,speaker:false});
 const w=ward(c,T,{glass:false,speaker:false});const mi=w.mi;const op=A(1)>0?ease(A(1)/0.5):0;
 c.save();c.fillStyle=`rgba(255,244,214,${0.35*op})`;c.fillRect(-200,-200,W+400,H+400);c.restore();glow(c,mi.head.x,mi.head.y,320,'rgba(255,230,170,A)',0.5*op);
 if(A(2)>0)bub(c,40,560,860,330,mi.head.x+20,mi.head.y-mi.HR-10,back(A(2)/0.3),()=>{txt(c,'Лиза, ты опять',470,680,70);txt(c,'не сделала дроби.',470,790,70,'#2b3a66')});
 lizaChair(c,T,{eyes:'wide',mouth:'o',brow:1,tear:T*0.4},{lean:0.15});c.restore()}
// 60: не поверила своим ушам
function shotDisbelief(c,t,d,T){c.save();cam(c,560,900,1.0+0.1*ease(t/d),Math.sin(T*28)*3,0);wardBlur(c,T);
 const l=doll(c,{...LIZA,x:560,y:1700,s:2.7,face:-1,noLegs:true,expr:{eyes:'wide',mouth:'o',brow:1,tear:T*0.6},pose:{headTilt:0.05,armL:[2.4,3.3],armR:[2.2,3.1]}});tearsBoth(c,l,T);
 c.save();c.strokeStyle='#ffd60a';c.lineWidth=12;c.lineCap='round';for(let i=0;i<8;i++){const a=i*Math.PI/4+T*0.4;c.beginPath();c.moveTo(l.head.x+Math.cos(a)*250,l.head.y+Math.sin(a)*250);c.lineTo(l.head.x+Math.cos(a)*330,l.head.y+Math.sin(a)*330);c.stroke()}c.restore();c.restore()}

function hook(c,T){const a=1-ease((T-2.0)/0.3);if(a<=0)return;c.save();c.globalAlpha=a;bigText(c,'ЧАСТЬ 4',W/2,1720,150,'#ffd60a',0.7+0.3*back(T/0.3),-0.02,26);c.restore()}
function outro(c,T){const s=window.DATA.outro;if(T<s)return;bigText(c,'ОН ПРОСНУЛСЯ?',W/2,1650,110,'#ffd60a',0.7+0.3*back((T-s)/0.3),-0.02,24);if(T>s+0.4)bigText(c,'ЧАСТЬ 5 — ФИНАЛ',W/2,1780,70,'#fff',0.7+0.3*back((T-s-0.4)/0.3),0,14)}
Object.assign(FN,{shotCallParents,shotParentsRun,shotFrozen,shotMonitorLive,shotDoctorExplain,shotGoodSign,shotLizaFear,shotVoices4,shotCountVoices,shotWhoSends,shotWeeks,shotFingers,shotMonths,shotRoutine,shotBatteryDead,shotPulseDrops,shotPressButton,shotPulseBack,shotHeHears,shotLizaAsks,shotWhisper,shotDisbelief});

// «Маяк», часть 5 (финал) — сцены. Подключается после shots6.js
function lyo(c,o){const m=stick(c,{col:'#e3a84a',...o});const f=o.face||1;c.save();c.beginPath();c.arc(m.head.x,m.head.y,m.HR,0,7);c.clip();c.fillStyle='#eef2f4';c.fillRect(m.head.x-m.HR,m.head.y-m.HR*0.9,m.HR*2,m.HR*0.5);c.fillStyle='rgba(185,190,202,0.95)';c.beginPath();c.arc(m.head.x-f*m.HR*0.8,m.head.y+m.HR*0.12,m.HR*0.34,0,7);c.fill();c.restore();
 for(const h of [m.hf,m.hb]){c.fillStyle='#eef2f4';c.beginPath();c.arc(h.x,h.y,20*(o.s||1),0,7);c.fill();c.strokeStyle='rgba(120,140,150,0.6)';c.lineWidth=3*(o.s||1);c.beginPath();c.moveTo(h.x-14*(o.s||1),h.y-6*(o.s||1));c.lineTo(h.x+14*(o.s||1),h.y+6*(o.s||1));c.stroke()}return m}
function wheelchair(c,x,fy,s,f){c.strokeStyle='#2b3c46';c.lineCap='round';c.lineWidth=12*s;c.beginPath();c.moveTo(x-f*60*s,fy-170*s);c.lineTo(x+f*110*s,fy-170*s);c.lineTo(x+f*130*s,fy-40*s);c.moveTo(x-f*60*s,fy-170*s);c.lineTo(x-f*84*s,fy-390*s);c.lineTo(x-f*130*s,fy-400*s);c.stroke();
 c.lineWidth=11*s;c.beginPath();c.arc(x-f*14*s,fy-84*s,84*s,0,7);c.stroke();c.lineWidth=4*s;for(let i=0;i<6;i++){const a=i*Math.PI/3;c.beginPath();c.moveTo(x-f*14*s,fy-84*s);c.lineTo(x-f*14*s+Math.cos(a)*80*s,fy-84*s+Math.sin(a)*80*s);c.stroke()}
 c.lineWidth=9*s;c.beginPath();c.arc(x+f*130*s,fy-28*s,28*s,0,7);c.stroke()}
const SITW={crouch:0.5,lean:0.04,legL:[1.4,0.1],legR:[1.32,0.02]};
function roomBg(c,T,fy){const wg=c.createLinearGradient(0,0,0,fy);wg.addColorStop(0,'#cfdadf');wg.addColorStop(1,'#aebdc4');c.fillStyle=wg;c.fillRect(-200,-200,W+400,fy+200);
 c.fillStyle='#f4efe2';c.fillRect(640,340,330,380);glow(c,800,530,620,'rgba(255,244,214,A)',0.5);c.strokeStyle='#7f949c';c.lineWidth=16;c.strokeRect(640,340,330,380);c.beginPath();c.moveTo(805,340);c.lineTo(805,720);c.stroke();
 const fg=c.createLinearGradient(0,fy,0,H);fg.addColorStop(0,'#8ea0a8');fg.addColorStop(1,'#4c5a60');c.fillStyle=fg;c.fillRect(-200,fy,W+400,H-fy+200);
 c.fillStyle='#4c5a60';c.fillRect(196,900,14,520);c.fillStyle='#39464c';c.beginPath();c.roundRect(70,640,280,220,18);c.fill();c.fillStyle='#0a0f12';c.fillRect(88,658,244,150);
 c.fillStyle='#4c5a60';c.fillRect(120,1330,880,26);c.fillRect(140,1356,22,70);c.fillRect(960,1356,22,70);c.fillRect(120,1130,26,226);
 c.fillStyle='#f3f6f8';c.beginPath();c.roundRect(146,1250,850,86,22);c.fill();c.fillStyle='#fff';c.beginPath();c.roundRect(170,1196,230,80,36);c.fill();c.fillStyle='#8fb2c8';c.beginPath();c.roundRect(760,1206,220,60,14);c.fill()}
const KNEEL={crouch:0.55,lean:0.42,headTilt:0.36,legL:[1.25,-1.0],legR:[0.2,-1.5],armL:[0.3,0.2],armR:[0.2,0.1]};
// ---------- письмо падает ----------
function shotFall(c,t,d,T,m){const fy=1420,a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1,a3=m[3]!=null?t-m[3]:-1;c.save();cam(c,540,1100,1.1+0.1*ease(t/d),0,0);
 roomBg(c,T,fy);
 const k=clamp(t/0.7);paperMini(c,330,lerp(900,1640,k*k),lerp(-1.2,0.3,k),0.6);
 const mm=stick(c,{...OLD,x:600,y:1640,s:1.7,face:-1,t:T,scarf:SCARF,eyes:{sad:true,dy:10,blink:0.4},pose:{...KNEEL,bob:Math.sin(T*24)*1.5}});tears(c,mm,-1,T,2);
 c.restore();
 const gh=(txt,y,a)=>{if(a<=0)return;c.save();c.globalAlpha=clamp(a/0.3)*0.75;c.font='900 150px M';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#2b3c46';c.fillText(txt,540,y);if(a3>0){const w=c.measureText(txt).width;c.strokeStyle='#d0403a';c.lineWidth=16;c.lineCap='round';c.beginPath();c.moveTo(540-w/2,y+6);c.lineTo(540-w/2+w*clamp(a3/0.4),y-6);c.stroke()}c.restore()};
 gh('30 ЛЕТ',300,a1);gh('4 ДНЯ',470,a2)}
// ---------- медсестра ----------
function shotNurse(c,t,d,T,m){const fy=1420,A=i=>m[i]!=null?t-m[i]:-1,up=ease(A(2)/0.6);c.save();cam(c,560,1080,1.06+0.06*ease(t/d),0,0);
 roomBg(c,T,fy);paperMini(c,250,1640,0.3,0.6);
 const turned=t>0.5;
 const mm=stick(c,{...OLD,x:440,y:1640,s:1.7,face:turned?1:-1,t:T,scarf:SCARF,eyes:{wide:A(2)>0?1.4:1.1,sad:A(2)<0},pose:A(2)>0?{crouch:lerp(0.55,0,up),lean:lerp(0.3,0.02,up),legL:[lerp(1.25,0.1,up),lerp(-1.0,0.05,up)],legR:[lerp(0.2,-0.1,up),lerp(-1.5,-0.12,up)],armL:[0.3,0.4],armR:[0.1,0.2],bob:Math.sin(T*24)*1.5}:{...KNEEL,lean:0.25,headTilt:turned?-0.1:0.36}});
 const nn=stick(c,{x:880,y:1650,s:1.55,face:-1,col:'#6fa8c0',hat:'#ffffff',t:T,eyes:{},pose:{lean:0.04,armL:[0.9+Math.sin(T*6)*0.15,1.8],armR:[0.1,0.3],bob:Math.sin(T*1.8)*2}});
 c.fillStyle='#e0403a';c.fillRect(nn.head.x-8,nn.head.y-nn.HR*1.25,16,44);c.fillRect(nn.head.x-22,nn.head.y-nn.HR*1.25+14,44,16);
 const B=[null,['ВЫ К АЛЕКСЕЮ?'],['ОН ОЧНУЛСЯ','СЕГОДНЯ НОЧЬЮ'],['И СПРОСИЛ:','ГОРИТ ЛИ МАЯК?'],['МЫ НЕ ЗНАЛИ,','ЧТО ОТВЕТИТЬ']];
 for(let i=4;i>=1;i--){if(A(i)>0){bubble(c,170,290,780,B[i].length>1?330:230,nn.head.x-30,nn.head.y-nn.HR-70,B[i],96,back(A(i)/0.26));break}}
 c.restore()}
// ---------- видео ----------
function shotPhone2(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1;c.save();cam(c,540,860,1.0+0.07*ease(t/d),0,0);
 const wg=c.createLinearGradient(0,0,0,H);wg.addColorStop(0,'#cfdadf');wg.addColorStop(1,'#93a6ae');c.fillStyle=wg;c.fillRect(-100,-100,W+200,H+200);
 c.strokeStyle='#e3a84a';c.lineCap='round';c.lineWidth=120;c.beginPath();c.moveTo(1160,2000);c.lineTo(930,1560);c.stroke();
 c.fillStyle='#14151d';c.beginPath();c.roundRect(196,140,688,1330,84);c.fill();c.strokeStyle='#33364a';c.lineWidth=6;c.stroke();
 c.save();c.beginPath();c.roundRect(222,170,636,1270,60);c.clip();c.fillStyle='#000';c.fillRect(222,170,636,1270);c.translate(222,240);c.scale(636/1080,636/1080);
 if(a2>0)shotIgnite(c,a2+0.2,4,T);else if(a1>0)shotStairsMany(c,a1+1,5,T,[0]);else{shotCrowd(c,3.6,5,T,[0,0.5,1.0]);c.fillStyle='rgba(0,0,0,0.35)';c.fillRect(0,0,W,H);c.fillStyle='#fff';c.beginPath();c.moveTo(470,820);c.lineTo(470,1080);c.lineTo(690,950);c.closePath();c.fill()}
 c.restore();
 heart(c,790,930,0.62,'#ff4d6a');c.fillStyle='#fff';c.font='900 30px M';c.textAlign='center';c.fillText('3,4M',790,990);c.beginPath();c.roundRect(760,1030,60,48,16);c.fill();c.fillText('210K',790,1118);
 c.fillStyle='rgba(255,255,255,0.3)';c.fillRect(250,1408,580,6);c.fillStyle='#fff';c.fillRect(250,1408,580*clamp(t/d),6);c.fillStyle='#0a0a10';c.beginPath();c.roundRect(470,186,140,34,17);c.fill();
 c.fillStyle='#eef2f4';c.beginPath();c.ellipse(900,1420,78,124,0.5,0,7);c.fill();c.strokeStyle='rgba(120,140,150,0.6)';c.lineWidth=5;for(let i=0;i<4;i++){c.beginPath();c.moveTo(850+i*10,1340+i*50);c.lineTo(960+i*8,1380+i*50);c.stroke()}
 c.restore()}
// ---------- коридор ----------
function corridorBg(c,sc,fy,win){const wg=c.createLinearGradient(0,300,0,fy);wg.addColorStop(0,'#c9d6dc');wg.addColorStop(1,'#9fb2ba');c.fillStyle=wg;c.fillRect(-200,-200,W+400,fy+200);c.fillStyle='#7f949c';c.fillRect(-200,1120,W+400,30);c.fillStyle='#b9c8ce';c.fillRect(-200,-200,W+400,520);
 for(let i=0;i<5;i++){const x=W+300-((sc+i*520)%2600);c.fillStyle='#f7fbfd';c.beginPath();c.roundRect(x,250,260,40,20);c.fill();glow(c,x+130,290,300,'rgba(255,255,255,A)',0.35)}
 for(let i=0;i<4;i++){const x=W+400-((sc+i*650)%2600);c.fillStyle='#e9eef0';c.fillRect(x,560,300,940);c.strokeStyle='#8fa2aa';c.lineWidth=10;c.strokeRect(x,560,300,940);c.fillStyle='#6f828a';c.fillRect(x+240,1040,36,14)}
 const fg=c.createLinearGradient(0,fy,0,H);fg.addColorStop(0,'#8ea0a8');fg.addColorStop(1,'#4c5a60');c.fillStyle=fg;c.fillRect(-200,fy,W+400,H-fy+200);
 if(win>0){glow(c,W+60,900,1100*win,'rgba(255,244,214,A)',0.75*win);c.save();c.globalCompositeOperation='lighter';const lg=c.createLinearGradient(W,0,W-900*win,0);lg.addColorStop(0,`rgba(255,244,214,${0.5*win})`);lg.addColorStop(1,'rgba(255,244,214,0)');c.fillStyle=lg;c.beginPath();c.moveTo(W+100,500);c.lineTo(W-900*win,1420);c.lineTo(W-900*win,1700);c.lineTo(W+100,1700);c.fill();c.restore()}}
function shotWheel(c,t,d,T,m){const fy=1500,z=1-ease(((m[1]!=null?t-m[1]:t-1)+0.3)/0.9),x=lerp(360,560,t/d);c.save();cam(c,lerp(540,x+30,z),lerp(1000,1090,z),1.0+0.75*z,0,0);
 corridorBg(c,t*160,fy,0.5+0.3*t/d);
 stick(c,{x:x-250,y:fy+20,s:1.5,face:1,col:'#6fa8c0',hat:'#ffffff',t:T,pose:{...walk(T*4.5,0.3),lean:0.14,armL:[1.2,1.5],armR:[1.1,1.4]}});
 const mm=lyo(c,{x,y:fy-168+96*1.35+10,s:1.35,face:1,t:T,shadow:false,eyes:{sad:true,blink:0.3},pose:{...SITW,armL:[0.9,1.5],armR:[0.8,1.4]}});tears(c,mm,1,T,2);
 wheelchair(c,x,fy+20,1.0,1);c.restore()}
function shotWalk(c,t,d,T){const fy=1500,k=t/d;c.save();cam(c,540,1000,1.04+0.08*ease(k),0,Math.abs(Math.sin(T*3.4))*-5);
 corridorBg(c,t*150,fy,0.35+0.65*ease(k));
 const mm=stick(c,{...OLD,hat:null,x:lerp(300,470,k),y:fy+30,s:1.5,face:1,t:T,scarf:SCARF,eyes:{wide:1.2},pose:{...walk(T*3.4,0.3),lean:0.08,armL:[0.9,1.4]}});
 const p=mm.hf;c.fillStyle='#2a2f44';c.beginPath();c.moveTo(p.x-50,p.y+30);c.quadraticCurveTo(p.x,p.y-50,p.x+50,p.y+30);c.fill();
 c.restore();const n=Math.max(1,Math.ceil(20*(1-ease(k))));bigText(c,String(n),W/2,300,230,'#2b3c46',1+0.05*Math.abs(Math.sin(T*3.4)),0,0);bigText(c,'ШАГОВ',W/2,460,80,'#2b3c46',1,0,0)}
// ---------- у окна ----------
function windowBg(c,T,fy){const wg=c.createLinearGradient(0,0,0,fy);wg.addColorStop(0,'#cfdadf');wg.addColorStop(1,'#aebdc4');c.fillStyle=wg;c.fillRect(-200,-200,W+400,fy+200);
 c.save();c.beginPath();c.rect(480,330,680,880);c.clip();sky(c,['#6fa3c7','#a9cbe0','#f3e2c4'],900);clouds(c,T,420,'rgba(255,255,255,0.7)',19,4);const g=c.createLinearGradient(0,900,0,1210);g.addColorStop(0,'#4f86a8');g.addColorStop(1,'#2f5f82');c.fillStyle=g;c.fillRect(480,900,680,320);
 c.strokeStyle='rgba(255,255,255,0.35)';c.lineWidth=4;for(let i=0;i<8;i++){const y=920+i*36;c.beginPath();for(let x=480;x<1160;x+=30)c.lineTo(x,y+Math.sin(x/90+T+i)*4);c.stroke()}c.restore();
 glow(c,820,760,900,'rgba(255,244,214,A)',0.45);c.strokeStyle='#7f949c';c.lineWidth=20;c.strokeRect(480,330,680,880);c.beginPath();c.moveTo(820,330);c.lineTo(820,1210);c.stroke();c.fillStyle='#93a6ae';c.fillRect(450,1210,740,34);
 const fg=c.createLinearGradient(0,fy,0,H);fg.addColorStop(0,'#8ea0a8');fg.addColorStop(1,'#4c5a60');c.fillStyle=fg;c.fillRect(-200,fy,W+400,H-fy+200);
 c.save();c.globalCompositeOperation='lighter';const lg=c.createLinearGradient(820,1200,300,1900);lg.addColorStop(0,'rgba(255,244,214,0.35)');lg.addColorStop(1,'rgba(255,244,214,0)');c.fillStyle=lg;c.beginPath();c.moveTo(480,1244);c.lineTo(1160,1244);c.lineTo(900,1920);c.lineTo(-100,1920);c.fill();c.restore()}
function shotWindow(c,t,d,T,m){const fy=1500,A=i=>m[i]!=null?t-m[i]:-1,x=690;c.save();cam(c,560,1020,1.03+0.08*ease(t/d),0,0);
 windowBg(c,T,fy);
 const gk=A(4)>0?ease(A(4)/0.6):0;
 c.save();c.globalAlpha=1-gk*0.85;lyo(c,{x,y:fy-168+96*1.35+10,s:1.35,face:1,t:T,shadow:false,eyes:{},pose:{...SITW,armL:[0.9,1.5],armR:[0.8,1.4]}});c.restore();
 if(gk>0){c.save();c.globalAlpha=gk;glow(c,x+20,fy-330,520,'rgba(255,200,130,A)',0.45);stick(c,{x:x+10,y:fy-168+96*0.9+6,s:0.9,face:1,col:'#e3a84a',scarf:SCARF,t:T,shadow:false,pose:{...SITW,armL:[0.9,1.5],armR:[0.8,1.4]}});c.restore()}
 wheelchair(c,x,fy+20,1.0,1);
 const k=easeOut(t/1.6);const mm=stick(c,{...OLD,hat:null,x:lerp(-160,250,k),y:fy+40,s:1.5,face:1,t:T,scarf:SCARF,eyes:{wide:1.3},pose:k<1?{...walk(T*3.4,0.3),lean:0.08,armL:[0.9,1.4]}:{lean:0.04,armL:[0.9,1.4],armR:[0.1,0.2],bob:Math.sin(T*24)*1.2}});
 const p=mm.hf;c.fillStyle='#2a2f44';c.beginPath();c.moveTo(p.x-50,p.y+30);c.quadraticCurveTo(p.x,p.y-50,p.x+50,p.y+30);c.fill();
 if(A(1)>0&&A(2)<0)inset(c,290,560,185,back(A(1)/0.3),()=>{c.fillStyle='#b9c8ce';c.fillRect(100,370,380,380);lyo(c,{x:250,y:560+60+425*2.4,s:2.4,face:1,noLegs:true,shadow:false,t:T})});
 if(A(2)>0&&A(3)<0.2)inset(c,290,560,185,back(A(2)/0.3),()=>{c.fillStyle='#b9c8ce';c.fillRect(100,370,380,380);for(const [hx,hy] of [[220,590],[370,540]]){c.strokeStyle='#e3a84a';c.lineWidth=70;c.lineCap='round';c.beginPath();c.moveTo(hx-40,hy+260);c.lineTo(hx,hy+60);c.stroke();c.fillStyle='#eef2f4';c.beginPath();c.arc(hx,hy,62,0,7);c.fill();c.strokeStyle='rgba(120,140,150,0.6)';c.lineWidth=6;for(let i=-1;i<2;i++){c.beginPath();c.moveTo(hx-50,hy+i*26-10);c.lineTo(hx+50,hy+i*26+10);c.stroke()}}});
 c.restore()}
function brightClose(c,T,side){const wg=c.createLinearGradient(0,0,0,H);wg.addColorStop(0,'#cfdadf');wg.addColorStop(1,'#9fb2ba');c.fillStyle=wg;c.fillRect(-200,-200,W+400,H+400);glow(c,side>0?W+120:-120,820,1300,'rgba(255,244,214,A)',0.8)}
function shotSorry2(c,t,d,T,m){const a2=m[2]!=null?t-m[2]:-1,a3=m[3]!=null?t-m[3]:-1,k=ease(t/1.5);c.save();cam(c,520,930,1.0+0.08*ease(t/d),0,0);brightClose(c,T,1);
 const mm=stick(c,{...OLD,hat:null,x:420,y:2600,s:3.4,face:1,t:T,noLegs:true,shadow:false,scarf:SCARF,rim:'rgba(255,244,214,0.8)',rimDir:1,eyes:{sad:true,dy:lerp(0,14,k),blink:0.2},pose:{lean:lerp(0,0.12,k),headTilt:lerp(0,0.3,k),armL:[0.2,0.3],armR:[-0.1,0.1],bob:Math.sin(T*24)*2}});tears(c,mm,1,T,2);
 if(a2>0)bubble(c,300,260,720,a3>0?340:230,mm.head.x+60,mm.head.y-mm.HR-36,a3>0?['ПРОСТИ МЕНЯ.','Я УСНУЛ…']:['ПРОСТИ МЕНЯ.'],104,a3>0?1:back(a2/0.26));
 c.restore()}
function shotTurn(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1,tu=t>0.7;c.save();cam(c,560,930,1.0+0.08*ease(t/d),0,0);brightClose(c,T,1);
 const mm=lyo(c,{x:640,y:2640,s:3.6,face:tu?-1:1,t:T,noLegs:true,shadow:false,rim:'rgba(255,244,214,0.8)',rimDir:1,eyes:{wide:tu?1.25:1,sad:false},pose:{lean:0,headTilt:tu?-0.04:0.05,armL:[0.2,0.3],armR:[-0.1,0.1],bob:Math.sin(T*1.8)*4}});
 if(tu)tears(c,mm,-1,T,2);
 if(a1>0&&a2<0)bubble(c,90,300,640,230,mm.head.x-60,mm.head.y-mm.HR-36,['Я ЗНАЮ, ПАПА'],96,back(a1/0.26));
 if(a2>0)bubble(c,90,230,740,420,mm.head.x-60,mm.head.y-mm.HR-36,['НО ПОТОМ ТЫ','НЕ СПАЛ','30 ЛЕТ'],100,back(a2/0.28));
 c.restore()}
function shotHugScarf(c,t,d,T,m){const fy=1500,a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1,a3=m[3]!=null?t-m[3]:-1,x=660;
 const hug=a2>0?1-ease(a2/0.6):ease(t/0.8),mv=a2>0?clamp((a2-0.3)/(Math.max(0.5,(m[3]||0)-(m[2]||0))+0.2)):0,on=mv>=1;
 c.save();cam(c,560,1060,1.15+0.1*ease(t/d),0,0);windowBg(c,T,fy);
 const s=lyo(c,{x,y:fy-168+96*1.35+10,s:1.35,face:-1,t:T,shadow:false,scarf:on?SCARF:null,eyes:{blink:hug>0.7?1:0},pose:{...SITW,lean:0.04+0.2*hug,armL:[lerp(0.8,1.4,hug),lerp(1.4,1.6,hug)],armR:[0.8,1.4]}});
 wheelchair(c,x,fy+20,1.0,-1);
 const f=stick(c,{...OLD,hat:null,x:lerp(380,430,hug),y:fy+40,s:1.5,face:1,t:T,scarf:(a2>0.3)?null:SCARF,eyes:{blink:hug>0.7?1:0},pose:{crouch:0.5,lean:0.12+0.3*hug,legL:[1.25,-1.0],legR:[0.2,-1.5],armL:[lerp(1.3,1.45,hug),lerp(1.5,1.6,hug)],armR:[lerp(1.1,1.3,hug),1.5]}});
 if(a2>0.3&&!on){const px=lerp(f.neck.x,s.neck.x-10,ease(mv)),py=lerp(f.neck.y+10,s.neck.y+14,ease(mv))-Math.sin(mv*Math.PI)*90;c.strokeStyle=SCARF;c.lineWidth=28;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(px-50,py-6);c.lineTo(px,py);for(let i=1;i<=5;i++)c.lineTo(px+6+Math.sin(T*4+i)*i*3,py+i*26);c.stroke()}
 if(a1>0||on){for(let i=0;i<3;i++){const q=((T*0.6+i/3)%1);heart(c,560+Math.sin(i*2+T)*70,820-q*240,0.55+q*0.3,`rgba(255,110,120,${(1-q)})`)}}
 c.restore()}
// ---------- возвращение ----------
function shotReturn(c,t,d,T,m){const a1=m[1]!=null&&t>m[1],k=easeOut(t/2.2),wv=i=>[2.5+Math.sin(T*9+i)*0.35,2.9+Math.sin(T*9+i)*0.2];c.save();cam(c,560,1020,1.04+0.06*ease(t/d),0,0);
 const st=i=>({armL:a1?wv(i):[0.12,0.25],eyes:{wide:1.2}});
 const r=dayScene(c,t,T,{v:[st(0),st(1),st(2),st(3)],m:{x:lerp(1300,840,k),eyes:{},pose:k<1?{...walk(T*6,0.4),lean:0.1}:{lean:0.02,armL:[0.2,0.3],armR:[-0.1,0.1]}}});
 stick(c,{...SON,hat:null,x:lerp(1460,1000,k),y:1330+56,s:1.3,face:-1,t:T,scarf:SCARF,eyes:{wide:1.15},pose:k<1?{...walk(T*6+1.6,0.4),lean:0.1}:{lean:0.02,armL:[0.2,0.3],armR:[-0.1,0.1]}});
 c.restore()}
function shotKeyGive(c,t,d,T,m){const a1=m[1]!=null?t-m[1]:-1,rc=ease(t/0.7);c.save();cam(c,650,1050,1.3+0.08*ease(t/d),0,0);
 const r=dayScene(c,t,T,{v:[{},{},{},{armL:[lerp(0.2,2.2,rc),lerp(0.4,2.5,rc)],eyes:{wide:1.25},tilt:-0.2}],m:{x:800,eyes:{wide:1.25,dy:8},pose:{lean:0.2,headTilt:0.2,armL:[lerp(0.3,1.2,rc),lerp(0.5,1.6,rc)],armR:[0.1,0.3]}}});
 stick(c,{...SON,hat:null,x:980,y:1330+56,s:1.3,face:-1,t:T,scarf:SCARF,pose:{lean:0.02}});
 const h=r.R[3].hf;c.fillStyle='#d9a441';c.fillRect(h.x-6,h.y-70,12,70);c.strokeStyle='#d9a441';c.lineWidth=10;c.beginPath();c.arc(h.x,h.y-88,20,0,7);c.stroke();glow(c,h.x,h.y-70,90,'rgba(255,220,120,A)',0.6);
 if(a1>0)bubble(c,190,380,800,330,r.R[3].head.x+10,r.R[3].head.y-r.R[3].HR-30,['МЫ НЕ ПРОПУСТИЛИ','НИ ОДНОЙ НОЧИ'],84,back(a1/0.28));
 c.restore()}
function shotStairsTwoB(c,t,d,T,m){const u=0.3+t*0.45,a1=m[1]!=null?t-m[1]:-1,a2=m[2]!=null?t-m[2]:-1;
 stairsScene(c,t,d,T,[{u:u-0.24,draw:p=>{stick(c,{...SON,hat:null,rim:'rgba(255,200,120,0.5)',x:p.x,y:p.y,s:0.84,face:p.ev?1:-1,t:T,shadow:false,scarf:SCARF,pose:{...walk(T*7+1.2,0.5),lean:0.22}})}},
  {u,draw:p=>{const mm=stick(c,{...OLD,rim:'rgba(255,200,120,0.5)',x:p.x,y:p.y,s:0.8,face:p.ev?1:-1,t:T,shadow:false,pose:{...walk(T*7,0.5),lean:0.24,armL:[0.8,1.5]}});lantern(c,mm.hf,0.8,T,1.15)}}],u-0.1);
 const num=a2>0?140:a1>0?139:Math.floor(lerp(120,138,ease(t/(m[1]||d))));const pk=a2>0?back(a2/0.3):a1>0?back(a1/0.25):1;
 bigText(c,String(num),W/2,290,230,'#ffd60a',0.75+0.25*pk,0,26);bigText(c,'СТУПЕНЕЙ. ВДВОЁМ',W/2,455,66,'#fff',1,0,14)}

function hook(c,T){const a=1-ease((T-2.4)/0.25);if(a<=0)return;c.save();c.globalAlpha=a;bigText(c,'ЧАСТЬ 5',W/2,290,170,'#ffd60a',0.7+0.3*back(T/0.3),-0.03,26);if(T>0.25)bigText(c,'ФИНАЛ',W/2,450,100,'#fff',0.7+0.3*back((T-0.25)/0.3),0,18);c.restore()}
function outro(c,T){const s=window.DATA.outro;if(T<s)return;bigText(c,'КОНЕЦ',W/2,270,150,'#ffd60a',0.7+0.3*back((T-s)/0.3),-0.02,26);if(T>s+0.5)bigText(c,'ПОДПИШИСЬ — НОВАЯ ИСТОРИЯ СКОРО',W/2,410,46,'#fff',0.7+0.3*back((T-s-0.5)/0.3),0,11)}
Object.assign(FN,{shotFall,shotNurse,shotPhone2,shotWheel,shotWalk,shotWindow,shotSorry2,shotTurn,shotHugScarf,shotReturn,shotKeyGive,shotStairsTwoB});

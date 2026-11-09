const pptxgen = require("pptxgenjs");
const F = "Arial";

function base(pres, title){ pres.layout="LAYOUT_WIDE"; pres.title=title; }
const W=13.33,H=7.5;

/* ---------- Deck 1: student ---------- */
async function student(){
  const p=new pptxgen(); base(p,"Հայաստանի պատմության հիմնական փուլերը");
  const D="2B1B1F", R="8E1B2E", A="F4A259", L="FBF3EE", G="6B5A5E";
  const title=(s,t,dark)=>s.addText(t,{x:0.8,y:0.5,w:11.7,h:1,fontFace:F,fontSize:36,bold:true,color:dark?"FFFFFF":R,isTextBox:true,margin:0,valign:"middle"});

  let s=p.addSlide(); s.background={color:R};
  s.addShape(p.ShapeType.ellipse,{x:9.3,y:-1.2,w:6,h:6,fill:{color:"A62B3F"},line:{color:"A62B3F"}});
  s.addShape(p.ShapeType.ellipse,{x:10.6,y:3.6,w:4.4,h:4.4,fill:{color:A,transparency:15},line:{color:A,transparency:15}});
  s.addText("Հայաստանի պատմության հիմնական փուլերը",{x:0.8,y:2.0,w:8.6,h:2.4,fontFace:F,fontSize:46,bold:true,color:"FFFFFF",isTextBox:true,margin:0,valign:"middle"});
  s.addText("Ուրարտուից մինչև անկախություն",{x:0.8,y:4.5,w:8,h:0.6,fontFace:F,fontSize:22,color:"F6D9B5",isTextBox:true,margin:0});
  s.addText("Պատմություն  ·  ուսանողական ներկայացում",{x:0.8,y:6.5,w:8,h:0.4,fontFace:F,fontSize:14,color:"E9C4C9",isTextBox:true,margin:0});

  s=p.addSlide(); s.background={color:"FFFFFF"}; title(s,"Ինչի մասին կխոսենք");
  const plan=[["01","Ուրարտու և Արտաշեսյանները","մ.թ.ա. IX–I դդ."],["02","Քրիստոնեություն և այբուբեն","301 և 405 թթ."],["03","Բագրատունիների Հայաստան","885–1045 թթ."],["04","Նոր ժամանակները","1918 և 1991 թթ."]];
  plan.forEach((c,i)=>{const x=0.8+i*3.0;
    s.addShape(p.ShapeType.roundRect,{x,y:2.0,w:2.8,h:3.9,fill:{color:L},line:{color:L},rectRadius:0.15,shadow:{type:"outer",color:"000000",opacity:0.12,blur:8,offset:2,angle:90}});
    s.addShape(p.ShapeType.ellipse,{x:x+0.3,y:2.35,w:0.9,h:0.9,fill:{color:R},line:{color:R}});
    s.addText(c[0],{x:x+0.3,y:2.35,w:0.9,h:0.9,fontFace:F,fontSize:20,bold:true,color:"FFFFFF",align:"center",valign:"middle",isTextBox:true,margin:0});
    s.addText(c[1],{x:x+0.2,y:3.5,w:2.5,h:1.4,fontFace:F,fontSize:16,bold:true,color:D,valign:"top",isTextBox:true,margin:0});
    s.addText(c[2],{x:x+0.3,y:5.1,w:2.3,h:0.5,fontFace:F,fontSize:14,color:G,isTextBox:true,margin:0});
  });

  s=p.addSlide(); s.background={color:"FFFFFF"}; title(s,"Ուրարտու. առաջին պետությունը Հայկական լեռնաշխարհում");
  s.addText([
    {text:"Հիմնադրվել է մ.թ.ա. IX դարում, մայրաքաղաքը՝ Տուշպա (Վանա լիճ)",options:{bullet:true,breakLine:true}},
    {text:"Զարգացած երկրագործություն, ոռոգման ջրանցքներ, մետաղագործություն",options:{bullet:true,breakLine:true}},
    {text:"Կառուցել է ամրոցներ՝ Էրեբունի (մ.թ.ա. 782), Թեյշեբաինի",options:{bullet:true,breakLine:true}},
    {text:"Մ.թ.ա. VI դարում պետությունը թուլանում է, և այն փոխարինում է Երվանդունիների հայկական թագավորությունը",options:{bullet:true}}
  ],{x:0.8,y:1.9,w:7.2,h:4.6,fontFace:F,fontSize:18,color:D,paraSpaceAfter:14,valign:"top",isTextBox:true,margin:0});
  s.addShape(p.ShapeType.roundRect,{x:8.7,y:1.9,w:3.8,h:4.4,fill:{color:R},line:{color:R},rectRadius:0.15});
  s.addText("782 մ.թ.ա.",{x:8.9,y:2.5,w:3.4,h:1,fontFace:F,fontSize:40,bold:true,color:"FFFFFF",align:"center",isTextBox:true,margin:0});
  s.addText("Երևանի հիմնադրումը՝ Էրեբունի ամրոցը",{x:9.1,y:3.8,w:3.0,h:1.4,fontFace:F,fontSize:18,color:"F6D9B5",align:"center",valign:"top",isTextBox:true,margin:0});

  s=p.addSlide(); s.background={color:D}; title(s,"Տիգրան Մեծ. Հայաստանը մեծ տերություն",true);
  s.addText("95–55",{x:0.8,y:2.2,w:5.5,h:1.6,fontFace:F,fontSize:80,bold:true,color:A,isTextBox:true,margin:0});
  s.addText("մ.թ.ա. Տիգրան II-ի թագավորության տարիները",{x:0.8,y:3.9,w:5.2,h:0.9,fontFace:F,fontSize:18,color:"E9D9DC",isTextBox:true,margin:0,valign:"top"});
  const st=[["3","ծով՝ Սև, Կասպից և Միջերկրական"],["Տիգրանակերտ","նոր մայրաքաղաք"],["Արտաշեսյաններ","թագավորական տոհմ"]];
  st.forEach((c,i)=>{const y=2.1+i*1.55;
    s.addShape(p.ShapeType.roundRect,{x:7.0,y,w:5.5,h:1.35,fill:{color:"3D272C"},line:{color:"3D272C"},rectRadius:0.12});
    s.addText(c[0],{x:7.2,y,w:3.1,h:1.35,fontFace:F,fontSize:c[0].length>2?18:36,bold:true,color:A,valign:"middle",isTextBox:true,margin:0});
    s.addText(c[1],{x:10.3,y,w:2.1,h:1.35,fontFace:F,fontSize:14,color:"FFFFFF",valign:"middle",isTextBox:true,margin:0});
  });

  s=p.addSlide(); s.background={color:"FFFFFF"}; title(s,"Երկու շրջադարձային իրադարձություն");
  [["301 թ.","Քրիստոնեությունը պետական կրոն","Տրդատ III թագավորը և Գրիգոր Լուսավորիչը Հայաստանը դարձնում են աշխարհում առաջին քրիստոնյա երկիրը։"],
   ["405 թ.","Հայոց այբուբենի ստեղծումը","Մեսրոպ Մաշտոցը ստեղծում է 36 տառ։ Սկսվում են գրավոր գրականությունը և թարգմանական շարժումը։"]].forEach((c,i)=>{
    const x=0.8+i*6.0;
    s.addShape(p.ShapeType.roundRect,{x,y:1.9,w:5.7,h:4.6,fill:{color:L},line:{color:L},rectRadius:0.15});
    s.addText(c[0],{x:x+0.4,y:2.2,w:4.9,h:1,fontFace:F,fontSize:48,bold:true,color:R,isTextBox:true,margin:0});
    s.addText(c[1],{x:x+0.4,y:3.3,w:4.9,h:0.8,fontFace:F,fontSize:22,bold:true,color:D,isTextBox:true,margin:0,valign:"top"});
    s.addText(c[2],{x:x+0.4,y:4.2,w:4.9,h:2,fontFace:F,fontSize:16,color:G,isTextBox:true,margin:0,valign:"top"});
  });

  s=p.addSlide(); s.background={color:"FFFFFF"}; title(s,"Ժամանակագրություն");
  s.addShape(p.ShapeType.line,{x:1.2,y:4.0,w:10.9,h:0,line:{color:R,width:3}});
  [["782 մ.թ.ա.","Էրեբունի"],["95 մ.թ.ա.","Տիգրան Մեծ"],["301","Քրիստոնեություն"],["405","Այբուբեն"],["885","Բագրատունիներ"],["1918","Առաջին Հանրապետություն"],["1991","Անկախություն"]].forEach((e,i)=>{
    const x=1.4+i*1.75;
    s.addShape(p.ShapeType.ellipse,{x:x-0.15,y:3.85,w:0.3,h:0.3,fill:{color:A},line:{color:R,width:2}});
    const up=i%2===0;
    s.addText(e[0],{x:x-1.2,y:up?2.5:4.45,w:2.4,h:0.5,fontFace:F,fontSize:18,bold:true,color:R,align:"center",isTextBox:true,margin:0});
    s.addText(e[1],{x:x-1.2,y:up?3.05:5.0,w:2.4,h:0.7,fontFace:F,fontSize:15,color:D,align:"center",valign:"top",isTextBox:true,margin:0});
  });

  s=p.addSlide(); s.background={color:R};
  s.addText("Եզրակացություն",{x:0.8,y:0.9,w:11,h:1,fontFace:F,fontSize:38,bold:true,color:"FFFFFF",isTextBox:true,margin:0});
  s.addText([
    {text:"Հայ ժողովուրդը պետականություն ունի ավելի քան 2 800 տարի",options:{bullet:true,breakLine:true}},
    {text:"Հավատը և գիրը դարձան ազգային ինքնության հիմքը",options:{bullet:true,breakLine:true}},
    {text:"1991 թ. անկախությունը պատմական շարունակությունն է",options:{bullet:true}}
  ],{x:0.8,y:2.2,w:10.5,h:3,fontFace:F,fontSize:22,color:"FFFFFF",paraSpaceAfter:18,valign:"top",isTextBox:true,margin:0});
  s.addText("Շնորհակալություն ուշադրության համար",{x:0.8,y:6.2,w:10,h:0.6,fontFace:F,fontSize:20,color:"F6D9B5",isTextBox:true,margin:0});
  await p.writeFile({fileName:"nimush-student.pptx"});
}

/* ---------- Deck 2: business ---------- */
async function business(){
  const p=new pptxgen(); base(p,"Ընկերության ներկայացում");
  const N="0B3C49", T="1FA3A3", Y="F2B134", L="F1F7F8", G="5A6E73";
  const title=(s,t,dark)=>s.addText(t,{x:0.8,y:0.5,w:11.7,h:1,fontFace:F,fontSize:36,bold:true,color:dark?"FFFFFF":N,isTextBox:true,margin:0,valign:"middle"});

  let s=p.addSlide(); s.background={color:N};
  s.addShape(p.ShapeType.roundRect,{x:8.6,y:1.2,w:3.8,h:3.8,fill:{color:T},line:{color:T},rectRadius:0.3,rotate:8});
  s.addShape(p.ShapeType.roundRect,{x:9.6,y:3.4,w:2.6,h:2.6,fill:{color:Y},line:{color:Y},rectRadius:0.3,rotate:-6});
  s.addText("Ընկերության անվանումը",{x:0.8,y:2.0,w:7.5,h:1.8,fontFace:F,fontSize:46,bold:true,color:"FFFFFF",isTextBox:true,margin:0,valign:"middle"});
  s.addText("Բիզնես ներկայացում գործընկերների համար",{x:0.8,y:4.0,w:7.5,h:0.8,fontFace:F,fontSize:22,color:"BFE6E6",isTextBox:true,margin:0,valign:"top"});
  s.addText("2027",{x:0.8,y:6.5,w:3,h:0.4,fontFace:F,fontSize:14,color:"8FB8BD",isTextBox:true,margin:0});

  s=p.addSlide(); s.background={color:"FFFFFF"}; title(s,"Մեր մասին");
  s.addText("Մենք օգնում ենք բիզնեսներին աճել՝ արագ, հստակ և թափանցիկ։ Աշխատում ենք 2018 թվականից և մեր հաճախորդների շրջանում կան փոքր ու միջին ընկերություններ ամբողջ Հայաստանից։",{x:0.8,y:1.9,w:6.2,h:3.2,fontFace:F,fontSize:20,color:N,valign:"top",isTextBox:true,margin:0});
  [["7+","տարվա փորձ"],["150","իրականացված նախագիծ"],["96%","գոհ հաճախորդ"]].forEach((c,i)=>{const y=1.9+i*1.55;
    s.addShape(p.ShapeType.roundRect,{x:7.7,y,w:4.8,h:1.35,fill:{color:L},line:{color:L},rectRadius:0.12});
    s.addText(c[0],{x:7.95,y,w:1.9,h:1.35,fontFace:F,fontSize:38,bold:true,color:T,valign:"middle",isTextBox:true,margin:0});
    s.addText(c[1],{x:9.85,y,w:2.5,h:1.35,fontFace:F,fontSize:16,color:N,valign:"middle",isTextBox:true,margin:0});
  });

  s=p.addSlide(); s.background={color:L}; title(s,"Ինչ ենք առաջարկում");
  [["Ծառայություն 1","Կարճ նկարագրություն՝ ինչ է ստանում հաճախորդը և ինչ արդյունք է ունենում։"],["Ծառայություն 2","Կարճ նկարագրություն՝ ինչ է ստանում հաճախորդը և ինչ արդյունք է ունենում։"],["Ծառայություն 3","Կարճ նկարագրություն՝ ինչ է ստանում հաճախորդը և ինչ արդյունք է ունենում։"]].forEach((c,i)=>{
    const x=0.8+i*4.0;
    s.addShape(p.ShapeType.roundRect,{x,y:2.0,w:3.7,h:4.2,fill:{color:"FFFFFF"},line:{color:"FFFFFF"},rectRadius:0.15,shadow:{type:"outer",color:"000000",opacity:0.12,blur:8,offset:2,angle:90}});
    s.addShape(p.ShapeType.ellipse,{x:x+0.35,y:2.4,w:0.9,h:0.9,fill:{color:T},line:{color:T}});
    s.addText(String(i+1),{x:x+0.35,y:2.4,w:0.9,h:0.9,fontFace:F,fontSize:22,bold:true,color:"FFFFFF",align:"center",valign:"middle",isTextBox:true,margin:0});
    s.addText(c[0],{x:x+0.35,y:3.55,w:3.0,h:0.6,fontFace:F,fontSize:22,bold:true,color:N,isTextBox:true,margin:0});
    s.addText(c[1],{x:x+0.35,y:4.25,w:3.0,h:1.7,fontFace:F,fontSize:15,color:G,valign:"top",isTextBox:true,margin:0});
  });

  s=p.addSlide(); s.background={color:"FFFFFF"}; title(s,"Աճի դինամիկան");
  s.addChart(p.charts.BAR,[{name:"Եկամուտ (մլն ֏)",labels:["2022","2023","2024","2025","2026"],values:[18,27,41,58,80]}],
    {x:0.8,y:1.8,w:7.6,h:4.9,barDir:"col",chartColors:[T],showValue:true,dataLabelPosition:"outEnd",dataLabelColor:N,dataLabelFontSize:14,dataLabelFontFace:F,
     catAxisLabelColor:G,catAxisLabelFontSize:14,catAxisLabelFontFace:F,valAxisHidden:true,valGridLine:{style:"none"},catGridLine:{style:"none"},showLegend:false,showTitle:false});
  s.addShape(p.ShapeType.roundRect,{x:9.0,y:2.2,w:3.5,h:3.8,fill:{color:N},line:{color:N},rectRadius:0.15});
  s.addText("×4.4",{x:9.2,y:2.6,w:3.1,h:1.2,fontFace:F,fontSize:54,bold:true,color:Y,align:"center",isTextBox:true,margin:0});
  s.addText("աճ 5 տարվա ընթացքում",{x:9.3,y:3.9,w:2.9,h:1.2,fontFace:F,fontSize:18,color:"FFFFFF",align:"center",valign:"top",isTextBox:true,margin:0});

  s=p.addSlide(); s.background={color:L}; title(s,"Ինչպես ենք աշխատում");
  ["Քննարկում","Առաջարկ","Իրականացում","Հանձնում"].forEach((t,i)=>{const x=0.8+i*3.0;
    s.addShape(p.ShapeType.ellipse,{x:x,y:2.6,w:1.3,h:1.3,fill:{color:i===3?Y:T},line:{color:i===3?Y:T}});
    s.addText(String(i+1),{x,y:2.6,w:1.3,h:1.3,fontFace:F,fontSize:32,bold:true,color:i===3?N:"FFFFFF",align:"center",valign:"middle",isTextBox:true,margin:0});
    if(i<3) s.addShape(p.ShapeType.line,{x:x+1.45,y:3.25,w:1.35,h:0,line:{color:"9DB8BC",width:2,dashType:"dash"}});
    s.addText(t,{x:x-0.2,y:4.2,w:2.9,h:0.6,fontFace:F,fontSize:20,bold:true,color:N,isTextBox:true,margin:0});
    s.addText("Կարճ բացատրություն քայլի մասին",{x:x-0.2,y:4.8,w:2.6,h:1.0,fontFace:F,fontSize:14,color:G,valign:"top",isTextBox:true,margin:0});
  });

  s=p.addSlide(); s.background={color:N};
  s.addText("Կապվեք մեզ հետ",{x:0.8,y:1.0,w:11,h:1,fontFace:F,fontSize:40,bold:true,color:"FFFFFF",isTextBox:true,margin:0});
  [["Հեռախոս","+374 00 000 000"],["Էլ. փոստ","info@company.am"],["Հասցե","Երևան, Աբովյան 1"]].forEach((c,i)=>{const y=2.5+i*1.15;
    s.addText(c[0],{x:0.8,y,w:2.6,h:0.8,fontFace:F,fontSize:16,color:"8FB8BD",valign:"middle",isTextBox:true,margin:0});
    s.addText(c[1],{x:3.4,y,w:7,h:0.8,fontFace:F,fontSize:26,bold:true,color:"FFFFFF",valign:"middle",isTextBox:true,margin:0});
  });
  s.addText("Շնորհակալություն",{x:0.8,y:6.3,w:6,h:0.6,fontFace:F,fontSize:20,color:Y,isTextBox:true,margin:0});
  await p.writeFile({fileName:"nimush-biznes.pptx"});
}
(async()=>{await student();await business();})();

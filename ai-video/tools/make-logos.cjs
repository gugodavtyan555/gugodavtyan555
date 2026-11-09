// Генерирует assets/logos.js из пакета simple-icons (npm i simple-icons).  node tools/make-logos.cjs claude elevenlabs pexels …
const si=require('simple-icons'),fs=require('fs'),path=require('path');
const keys=process.argv.slice(2).length?process.argv.slice(2):['claude','elevenlabs','pexels','googlegemini','perplexity','notion','github','telegram','tiktok','anthropic'];
const L={};for(const k of keys){const i=si['si'+k[0].toUpperCase()+k.slice(1)];if(!i){console.error('нет логотипа:',k);continue;}L[k]={path:i.path,hex:'#'+i.hex,title:i.title};}
fs.writeFileSync(path.join(__dirname,'..','assets','logos.js'),'// сгенерировано tools/make-logos.cjs (simple-icons, CC0). Товарные знаки принадлежат их владельцам.\nwindow.LOGOS='+JSON.stringify(L)+';\n');
console.log('OK',Object.keys(L).join(', '));

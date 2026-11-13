// Usage: node render.js <episode_dir> [fps] — renders frames from video.html and muxes with mix.wav → <ep>/final.mp4
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
(async()=>{const ep=path.resolve(process.argv[2]),fps=+(process.argv[3]||30),only=process.argv[4];
 const DATA={timeline:JSON.parse(fs.readFileSync(ep+'/timeline.json')),scenes:JSON.parse(fs.readFileSync(ep+'/scenes.json'))};
 const total=Math.round(DATA.timeline.total*fps),fr=ep+'/frames';fs.rmSync(fr,{recursive:true,force:true});fs.mkdirSync(fr);
 const b=await chromium.launch(),P=only?1:6;
 const list=only?only.split(',').map(s=>Math.round(+s*fps)):[...Array(total).keys()];
 await Promise.all([...Array(P).keys()].map(async p=>{const pg=await b.newPage({viewport:{width:1080,height:1920}});
  await pg.addInitScript(d=>{window.DATA=d},DATA);await pg.goto('file://'+path.resolve(__dirname,'video.html'));
  await pg.evaluate(()=>document.fonts.load('100px Anton'));pg.on('pageerror',e=>{console.error(e);process.exit(1)});
  for(let i=p;i<list.length;i+=P){const f=list[i];await pg.evaluate(t=>render(t),f/fps);
   await pg.screenshot({path:`${fr}/${String(only?i:f).padStart(5,'0')}.jpg`,type:'jpeg',quality:95})}}));
 await b.close();if(only)return;
 execFileSync('ffmpeg',['-y','-v','error','-framerate',fps,'-i',fr+'/%05d.jpg','-i',ep+'/mix.wav','-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',ep+'/final.mp4']);
 fs.rmSync(fr,{recursive:true,force:true});console.log('done',total,'frames');})();

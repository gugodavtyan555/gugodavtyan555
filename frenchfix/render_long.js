// Usage: node render_long.js <episode_dir> [fps=30] [workers=4] [from_sec] [to_sec]
// Landscape/long renderer: each worker pipes JPEG frames straight into ffmpeg (no frames on disk), then chunks are concatenated and muxed with mix.wav.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),{spawn,execFileSync}=require('child_process');
(async()=>{const ep=path.resolve(process.argv[2]),fps=+(process.argv[3]||30),W=+(process.argv[4]||4);
 const DATA={timeline:JSON.parse(fs.readFileSync(ep+'/timeline.json')),scenes:JSON.parse(fs.readFileSync(ep+'/scenes.json'))};
 const vw=DATA.scenes.land?1920:1080,vh=DATA.scenes.land?1080:1920;
 const total=Math.round(DATA.timeline.total*fps),ch=Math.ceil(total/W),dir=ep+'/chunks';fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir);
 const b=await chromium.launch();
 await Promise.all([...Array(W).keys()].map(async w=>{const a=w*ch,z=Math.min(total,a+ch);if(a>=z)return;
  const pg=await b.newPage({viewport:{width:vw,height:vh}});await pg.addInitScript(d=>{window.DATA=d},DATA);
  await pg.goto('file://'+path.resolve(__dirname,'video.html'));await pg.evaluate(()=>document.fonts.load('100px Anton'));
  pg.on('pageerror',e=>{console.error(e);process.exit(1)});
  const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','veryfast','-crf','21','-pix_fmt','yuv420p',`${dir}/c${w}.mp4`],{stdio:['pipe','inherit','inherit']});
  for(let f=a;f<z;f++){await pg.evaluate(t=>render(t),f/fps);const buf=await pg.screenshot({type:'jpeg',quality:92});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if((f-a)%1500==0)console.log('w'+w,f-a,'/',z-a)}
  ff.stdin.end();await new Promise(r=>ff.on('close',r));await pg.close()}));
 await b.close();
 fs.writeFileSync(dir+'/list.txt',[...Array(W).keys()].filter(w=>fs.existsSync(`${dir}/c${w}.mp4`)).map(w=>`file 'c${w}.mp4'`).join('\n'));
 execFileSync('ffmpeg',['-y','-v','error','-f','concat','-safe','0','-i',dir+'/list.txt','-i',ep+'/mix.wav','-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',ep+'/final.mp4']);
 fs.rmSync(dir,{recursive:true,force:true});console.log('done',total,'frames');})();

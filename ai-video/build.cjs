const {chromium}=require('playwright');const {spawn}=require('child_process');const path=require('path');const dir=__dirname;
const out=process.argv[2]||path.join(dir,'out.mp4'),only=process.argv[3]; // only=png-путь для превью кадра
(async()=>{
const b=await chromium.launch();
const pg=await b.newPage({viewport:{width:540,height:960},deviceScaleFactor:2});
await pg.goto('file://'+dir+'/render.html');
const fps=await pg.evaluate(()=>CONFIG.fps),total=await pg.evaluate(()=>TOTAL());
if(only){await pg.evaluate(t=>renderAt(t),+process.env.T||1);await pg.locator('#c').screenshot({path:only});await b.close();process.exit(0);}
const n=Math.round(total*fps);
const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate',String(fps),'-i','-',
 '-f','lavfi','-t',String(total),'-i',`sine=frequency=110:sample_rate=44100`,
 '-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-c:a','aac','-af','volume=0.0',out],{stdio:['pipe','inherit','inherit']});
for(let f=0;f<n;f++){
  await pg.evaluate(t=>renderAt(t),f/fps);
  const buf=await pg.locator('#c').screenshot({type:'png'});
  if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));
}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('OK',out,n,'frames');
})();

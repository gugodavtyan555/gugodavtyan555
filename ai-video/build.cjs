const {chromium}=require('playwright');const {spawn}=require('child_process');const path=require('path');const dir=__dirname;
const out=process.argv[2]||path.join(dir,'out.mp4'),only=process.argv[3]; // only=png-путь для превью кадра
(async()=>{
const b=await chromium.launch();
const pg=await b.newPage({viewport:{width:540,height:960},deviceScaleFactor:2});
await pg.goto('file://'+dir+'/render.html');
const fps=await pg.evaluate(()=>CONFIG.fps),total=await pg.evaluate(()=>TOTAL());
if(only){await pg.evaluate(t=>renderAt(t),+process.env.T||1);await pg.locator('#c').screenshot({path:only});await b.close();process.exit(0);}
const n=Math.round(total*fps);
const fs=require('fs');const voice=[path.join(dir,'audio','mix.wav'),path.join(dir,'audio','voice.wav')].find(f=>fs.existsSync(f))||'';
const music=['music.mp3','music.wav','music.m4a'].map(f=>path.join(dir,f)).find(f=>fs.existsSync(f));
const args=['-y','-v','error','-f','image2pipe','-framerate',String(fps),'-i','-'];
if(voice){args.push('-i',voice);
  if(music&&!/mix\.wav$/.test(voice)){args.push('-stream_loop','-1','-i',music,'-filter_complex',
   `[2:a]volume=0.12[m];[m][1:a]sidechaincompress=threshold=0.03:ratio=8[d];[1:a][d]amix=inputs=2:duration=first:normalize=0[a]`,'-map','0:v','-map','[a]');}
  else args.push('-map','0:v','-map','1:a');
}else args.push('-f','lavfi','-t',String(total),'-i','anullsrc=r=44100:cl=mono','-map','0:v','-map','1:a');
args.push('-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-c:a','aac','-b:a','192k','-shortest',out);
const ff=spawn('ffmpeg',args,{stdio:['pipe','inherit','inherit']});
for(let f=0;f<n;f++){
  await pg.evaluate(t=>renderAt(t),f/fps);
  const buf=await pg.locator('#c').screenshot({type:'png'});
  if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));
}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('OK',out,n,'frames');
})();

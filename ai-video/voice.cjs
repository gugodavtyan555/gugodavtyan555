// Озвучка: node voice.cjs        (ELEVENLABS_API_KEY в env)
// PROVIDER=mock node voice.cjs   — только для проверки конвейера (писк вместо голоса)
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const {execFileSync}=require('child_process');
const dir=__dirname,ad=path.join(dir,'audio');fs.mkdirSync(ad,{recursive:true});
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(dir,'scenes.js'),'utf8'),ctx);
const cfg=ctx.window.CONFIG,provider=process.env.PROVIDER||'elevenlabs';
const sh=(c,a)=>execFileSync(c,a,{encoding:'utf8'});
const dur=f=>parseFloat(sh('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',f]));
const vc=sc=>cfg.voices[sc.who||'R'];
async function tts(text,out,v){
  if(provider==='mock'){const d=Math.max(1.2,text.length*0.07);
    sh('ffmpeg',['-y','-v','error','-f','lavfi','-i',`sine=frequency=220:duration=${d}`,'-af','tremolo=f=6:d=0.9,volume=0.4','-ar','44100',out]);return;}
  const key=process.env.ELEVENLABS_API_KEY;if(!key)throw new Error('Нет ELEVENLABS_API_KEY');
  if(!v||/ВСТАВЬ/.test(v.id))throw new Error('Впиши voices.R/S.id в scenes.js');
  const r=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${v.id}?output_format=mp3_44100_128`,{
    method:'POST',headers:{'xi-api-key':key,'content-type':'application/json'},
    body:JSON.stringify({text,model_id:v.model||'eleven_v3',
      voice_settings:{stability:v.stability??0.5}})});
  if(!r.ok)throw new Error('ElevenLabs '+r.status+': '+(await r.text()).slice(0,200));
  fs.writeFileSync(out,Buffer.from(await r.arrayBuffer()));
}
(async()=>{
  const cache=path.join(ad,'cache.json');const c=fs.existsSync(cache)?JSON.parse(fs.readFileSync(cache)):{};
  const timing=[],parts=[];
  for(let i=0;i<cfg.scenes.length;i++){
    const sc=cfg.scenes[i],v=vc(sc),tempo=v.tempo||1,f=path.join(ad,String(i+1).padStart(2,'0')+(provider==='mock'?'.wav':'.mp3'));
    const h=provider+crypto.createHash('md5').update((sc.say||'')+JSON.stringify(v)).digest('hex');
    let d;
    if(!sc.say){d=cfg.sceneSec;}
    else{if(c[f]!==h||!fs.existsSync(f)){process.stdout.write(`озвучиваю ${i+1}/${cfg.scenes.length}… `);await tts(sc.say,f,v);c[f]=h;console.log('ok');}
      d=Math.max(cfg.minSceneSec||2,dur(f)/tempo+0.35);}
    timing.push(+d.toFixed(3));
    const seg=path.join(ad,`seg${i}.wav`);
    if(sc.say)sh('ffmpeg',['-y','-v','error','-i',f,'-af',`atempo=${tempo},apad=whole_dur=${d}`,'-ar','44100','-ac','1',seg]);
    else sh('ffmpeg',['-y','-v','error','-f','lavfi','-i',`anullsrc=r=44100:cl=mono`,'-t',String(d),seg]);
    parts.push(seg);
  }
  fs.writeFileSync(cache,JSON.stringify(c));
  fs.writeFileSync(path.join(dir,'timing.js'),'window.TIMING='+JSON.stringify(timing)+';\n');
  fs.writeFileSync(path.join(ad,'list.txt'),parts.map(p=>`file '${p}'`).join('\n'));
  sh('ffmpeg',['-y','-v','error','-f','concat','-safe','0','-i',path.join(ad,'list.txt'),'-c','copy',path.join(ad,'voice.wav')]);
  console.log('готово: audio/voice.wav, timing.js,',timing.reduce((a,b)=>a+b,0).toFixed(1),'сек');
})().catch(e=>{console.error(e.message);process.exit(1)});

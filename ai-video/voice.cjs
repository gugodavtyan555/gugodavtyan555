// Озвучка с пословной разметкой: node voice.cjs   (ELEVENLABS_API_KEY в env; AUDIO_DIR — папка кэша)
// PROVIDER=mock — писк вместо голоса (проверка конвейера)
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const {execFileSync}=require('child_process');
const dir=__dirname,ad=process.env.AUDIO_DIR||path.join(dir,'audio');fs.mkdirSync(ad,{recursive:true});
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(dir,'scenes.js'),'utf8'),ctx);
const cfg=ctx.window.CONFIG,provider=process.env.PROVIDER||'elevenlabs';
const LEAD=0.35,TAIL=0.30,END_HOLD=0.6;                 // пауза до реплики / после неё / в конце ролика
const sh=(c,a)=>execFileSync(c,a,{encoding:'utf8'});
const dur=f=>parseFloat(sh('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',f]));
const vc=sc=>cfg.voices[sc.who||'R'];
function wordsFrom(chars,starts,ends){                  // символы → слова (без [тегов])
  const out=[];let cur='',s=0,e=0,inTag=false;
  chars.forEach((ch,i)=>{
    if(ch==='['){inTag=true;return;} if(ch===']'){inTag=false;return;} if(inTag)return;
    if(/\s/.test(ch)){if(cur){out.push([cur,s,e]);cur='';}return;}
    if(!cur)s=starts[i]; cur+=ch; e=ends[i];
  });if(cur)out.push([cur,s,e]);return out;
}
async function tts(text,out,v){                         // → {words}
  if(provider==='mock'){const d=Math.max(1.2,text.replace(/\[[^\]]*\]/g,'').length*0.07);
    sh('ffmpeg',['-y','-v','error','-f','lavfi','-i',`sine=frequency=220:duration=${d}`,'-af','tremolo=f=6:d=0.9,volume=0.4','-ar','44100',out]);
    const ws=text.replace(/\[[^\]]*\]/g,'').trim().split(/\s+/);return {words:ws.map((w,i)=>[w,i*d/ws.length,(i+.9)*d/ws.length])};}
  const key=process.env.ELEVENLABS_API_KEY;if(!key)throw new Error('Нет ELEVENLABS_API_KEY');
  if(!v||/ВСТАВЬ/.test(v.id))throw new Error('Впиши voices.R/S.id в scenes.js');
  const r=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${v.id}/with-timestamps?output_format=mp3_44100_128`,{
    method:'POST',headers:{'xi-api-key':key,'content-type':'application/json'},
    body:JSON.stringify({text,model_id:v.model||'eleven_v3',voice_settings:{stability:v.stability??0.5}})});
  if(!r.ok)throw new Error('ElevenLabs '+r.status+': '+(await r.text()).slice(0,200));
  const j=await r.json();fs.writeFileSync(out,Buffer.from(j.audio_base64,'base64'));
  const a=j.alignment||j.normalized_alignment;
  return {words:wordsFrom(a.characters,a.character_start_times_seconds,a.character_end_times_seconds)};
}
(async()=>{
  const cache=path.join(ad,'cache.json');const c=fs.existsSync(cache)?JSON.parse(fs.readFileSync(cache)):{};
  const timing=[],words=[],parts=[];
  for(let i=0;i<cfg.scenes.length;i++){
    const sc=cfg.scenes[i],v=vc(sc),tempo=v.tempo||1,ext=provider==='mock'?'.wav':'.mp3';
    const f=path.join(ad,String(i+1).padStart(2,'0')+ext),wf=f+'.words.json';
    const h=provider+crypto.createHash('md5').update((sc.say||'')+JSON.stringify(v)).digest('hex');
    let d,ws=[];
    if(!sc.say){d=cfg.sceneSec;}
    else{
      if(c[f]!==h||!fs.existsSync(f)||!fs.existsSync(wf)){process.stdout.write(`озвучиваю ${i+1}/${cfg.scenes.length}… `);
        const r=await tts(sc.say,f,v);fs.writeFileSync(wf,JSON.stringify(r.words));c[f]=h;console.log('ok');}
      ws=JSON.parse(fs.readFileSync(wf)).map(([w,s,e])=>[w,+(LEAD+s/tempo).toFixed(3),+(LEAD+e/tempo).toFixed(3)]);
      d=Math.max(cfg.minSceneSec||2,LEAD+dur(f)/tempo+TAIL+(i===cfg.scenes.length-1?END_HOLD:0));
    }
    timing.push(+d.toFixed(3));words.push(ws);
    const seg=path.join(ad,`seg${i}.wav`);
    if(sc.say)sh('ffmpeg',['-y','-v','error','-i',f,'-af',`atempo=${tempo},adelay=${Math.round(LEAD*1000)}:all=1,apad=whole_dur=${d}`,'-ar','44100','-ac','1',seg]);
    else sh('ffmpeg',['-y','-v','error','-f','lavfi','-i','anullsrc=r=44100:cl=mono','-t',String(d),seg]);
    parts.push(seg);
  }
  fs.writeFileSync(cache,JSON.stringify(c));
  fs.writeFileSync(path.join(ad,'timing.js'),'window.TIMING='+JSON.stringify(timing)+';\nwindow.WORDS='+JSON.stringify(words)+';\n');
  fs.writeFileSync(path.join(ad,'list.txt'),parts.map(p=>`file '${p}'`).join('\n'));
  sh('ffmpeg',['-y','-v','error','-f','concat','-safe','0','-i',path.join(ad,'list.txt'),'-c','copy',path.join(ad,'voice.wav')]);
  console.log('готово: voice.wav, timing.js,',timing.reduce((a,b)=>a+b,0).toFixed(1),'сек');
})().catch(e=>{console.error(e.message);process.exit(1)});

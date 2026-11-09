// Производство роликов: node produce.cjs [ep01 ep02 …]  → out/<ep>.mp4 + out/<ep>.txt (подпись) + out/schedule.csv
// Нужны: ELEVENLABS_API_KEY в env (+ на облачной машине NODE_USE_ENV_PROXY=1), playwright, ffmpeg, numpy.
const fs=require('fs'),path=require('path'),vm=require('vm'),{execFileSync}=require('child_process');
const dir=__dirname,out=path.join(dir,'out');fs.mkdirSync(out,{recursive:true});
const load=f=>{const c={window:{}};vm.runInNewContext(fs.readFileSync(f,'utf8'),c);return c.window;};
const base=load(path.join(dir,'base.js')).BASE;
const eps=process.argv.slice(2).length?process.argv.slice(2):fs.readdirSync(path.join(dir,'episodes')).filter(f=>/^ep\d+\.js$/.test(f)).map(f=>f.replace('.js','')).sort();
const rows=[['файл','дата','время (Ереван)','заголовок','подпись','хэштеги']];
const start=new Date(process.env.START||new Date(Date.now()+864e5).toISOString().slice(0,10));
eps.forEach((ep,i)=>{
  const E=load(path.join(dir,'episodes',ep+'.js')).EPISODE;
  const cfg={...base,scenes:E.scenes};
  fs.writeFileSync(path.join(dir,'scenes.js'),'// сгенерировано produce.cjs из episodes/'+ep+'.js\nwindow.CONFIG = '+JSON.stringify(cfg,null,1)+';\n');
  fs.rmSync(path.join(dir,'audio','cache.json'),{force:true});
  console.log('==',ep,E.title);
  execFileSync('node',['voice.cjs'],{cwd:dir,stdio:'inherit'});
  execFileSync('python3',['mix.py'],{cwd:dir,stdio:'inherit'});
  execFileSync('node',['build.cjs',path.join(out,ep+'.mp4')],{cwd:dir,stdio:'inherit'});
  const cap=E.caption+'\n\n'+E.hashtags;fs.writeFileSync(path.join(out,ep+'.txt'),cap+'\n');
  const d=new Date(start.getTime()+i*864e5).toISOString().slice(0,10);
  rows.push([ep+'.mp4',d,'19:00',E.title,E.caption,E.hashtags]);
});
const csv=rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n');
fs.writeFileSync(path.join(out,'schedule.csv'),'﻿'+csv+'\n');console.log('OK',eps.join(', '));

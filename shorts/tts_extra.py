# Досъёмка отдельных кусков озвучки и пересборка. usage: python3 tts_extra.py <workdir> <order, напр. 0,1,2,X,3>
# Новые куски берутся из <workdir>/<ключ>.txt, уже озвученные (t<ключ>_out.json) не перезаказываются.
import json,subprocess,base64,sys,os
wd,order=sys.argv[1],sys.argv[2].split(',')
allw=[];off=0.0;files=[]
for k in order:
    if not os.path.exists(f'{wd}/t{k}_out.json'):
        ch=open(f'{wd}/{k}.txt').read().strip()
        body={"text":ch,"model_id":"eleven_v3","language_code":"ru","voice_settings":{"stability":0.5,"similarity_boost":0.8,"style":0.3,"speed":1.0}}
        json.dump(body,open(f'{wd}/t{k}.json','w'),ensure_ascii=False)
        r=subprocess.run(["curl","-sS","-X","POST","https://api.elevenlabs.io/v1/text-to-speech/nPczCjzI2devNBz1zQrb/with-timestamps?output_format=mp3_44100_128","-H","Content-Type: application/json","-d",f"@{wd}/t{k}.json","-o",f"{wd}/t{k}_out.json","-w","%{http_code}","--max-time","120"],capture_output=True,text=True)
        if r.stdout.strip()!='200': os.remove(f'{wd}/t{k}_out.json'); print('FAILED',k,r.stdout); sys.exit(1)
    d=json.load(open(f'{wd}/t{k}_out.json')); open(f'{wd}/v{k}.mp3','wb').write(base64.b64decode(d['audio_base64']))
    a=d['alignment']; w='';s=None;out=[]
    for c,st,en in zip(a['characters'],a['character_start_times_seconds'],a['character_end_times_seconds']):
        if c.isspace():
            if w: out.append([w,s,e]); w='';s=None
        else:
            if s is None: s=st
            w+=c; e=en
    if w: out.append([w,s,e])
    out=[o for o in out if o[0] not in ('—','-')]
    dur=out[-1][2]+0.42
    allw+=[[w,s+off,e+off] for w,s,e in out]; files.append((f'{wd}/v{k}.mp3',dur)); off+=dur
json.dump(allw,open(f'{wd}/words.json','w'),ensure_ascii=False)
inp=[];fc=[]
for i,(f,dur) in enumerate(files):
    inp+=["-i",f]; fc.append(f"[{i}:a]atrim=0:{dur-0.05},asetpts=PTS-STARTPTS,apad=whole_dur={dur}[a{i}]")
fc.append(''.join(f'[a{i}]' for i in range(len(files)))+f"concat=n={len(files)}:v=0:a=1[o]")
subprocess.run(["ffmpeg","-y","-loglevel","error",*inp,"-filter_complex",';'.join(fc),"-map","[o]",f"{wd}/voice.wav"],check=True)
print(len(allw),'words, voice',round(allw[-1][2],2))
si=0;line=[]
for w,s,e in allw:
    if not line: st=s
    line.append(w)
    if w[-1] in '.?!…':
        print(si,round(st,2),' '.join(line)); si+=1; line=[]

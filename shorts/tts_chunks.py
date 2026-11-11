# Озвучка длинного текста короткими кусками (ElevenLabs), склейка и тайминги слов.
# usage: python3 tts_chunks.py <workdir>   (читает <workdir>/text.txt, пишет voice.wav и words.json)
import json,subprocess,base64,re,sys
wd=sys.argv[1]; text=open(f'{wd}/text.txt').read().strip()
sents=re.findall(r'[^.?!…]+[.?!…]+\s*',text)
chunks=[];cur=''
for s in sents:
    if len(cur)+len(s)>360 and cur: chunks.append(cur.strip());cur=''
    cur+=s
if cur.strip(): chunks.append(cur.strip())
print(len(chunks),[len(c) for c in chunks])
allw=[];off=0.0;files=[]
for i,ch in enumerate(chunks):
    body={"text":ch,"model_id":"eleven_v3","language_code":"ru","voice_settings":{"stability":0.5,"similarity_boost":0.8,"style":0.3,"speed":1.0}}
    json.dump(body,open(f'{wd}/t{i}.json','w'),ensure_ascii=False)
    r=subprocess.run(["curl","-sS","-X","POST","https://api.elevenlabs.io/v1/text-to-speech/nPczCjzI2devNBz1zQrb/with-timestamps?output_format=mp3_44100_128","-H","Content-Type: application/json","-d",f"@{wd}/t{i}.json","-o",f"{wd}/t{i}_out.json","-w","%{http_code}","--max-time","120"],capture_output=True,text=True)
    if r.stdout.strip()!='200':
        print('FAILED chunk',i,r.stdout,r.stderr[:200]); sys.exit(1)   # не повторяем автоматически
    d=json.load(open(f'{wd}/t{i}_out.json'))
    open(f'{wd}/v{i}.mp3','wb').write(base64.b64decode(d['audio_base64']))
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
    allw+=[[w,s+off,e+off] for w,s,e in out]
    files.append((f'{wd}/v{i}.mp3',dur)); off+=dur
    print('chunk',i,'ok',round(dur,2))
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

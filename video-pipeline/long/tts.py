import json,subprocess,base64,os,sys
segs=json.load(open('script.json')); V='N2lVS1w4EtoT3dr4eOWO'
only=sys.argv[1:]
for s in segs:
    out=f"tts/{s['id']}.json"
    if os.path.exists(out) and s['id'] not in only: continue
    body={"text":s['text'],"model_id":"eleven_v3","language_code":"ru","voice_settings":{"stability":0.0}}
    for attempt in range(3):
        r=subprocess.run(['curl','-sS','-m','240',f'https://api.elevenlabs.io/v1/text-to-speech/{V}/with-timestamps?output_format=mp3_44100_128','-H','xi-api-key: dummy','-H','Content-Type: application/json','-d',json.dumps(body)],capture_output=True,text=True)
        try: d=json.loads(r.stdout)
        except Exception: d={}
        if 'audio_base64' in d: break
        print(s['id'],'retry',str(d)[:200] or r.stderr[:200],flush=True)
        if 'language_code' in str(d): body.pop('language_code',None)
    else: print('FAILED',s['id']); continue
    open(f"tts/{s['id']}.mp3",'wb').write(base64.b64decode(d['audio_base64'])); json.dump(d['alignment'],open(out,'w'))
    dur=d['alignment']['character_end_times_seconds'][-1]; print(s['id'],len(s['text']),round(dur,1),round(len(s['text'])/dur,1),flush=True)

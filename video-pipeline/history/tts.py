import json,requests,base64,sys,os
V='N2lVS1w4EtoT3dr4eOWO'; ids=sys.argv[1:]
for s in json.load(open('script.json')):
    if ids and s['id'] not in ids: continue
    r=requests.post(f'https://api.elevenlabs.io/v1/text-to-speech/{V}/with-timestamps?output_format=mp3_44100_128',headers={'xi-api-key':'dummy'},
      json={'text':s['text'],'model_id':'eleven_v3','language_code':'ru','voice_settings':{'stability':0.0,'speed':1.06}})
    d=r.json()
    if 'audio_base64' not in d: print(s['id'],str(d)[:200]); continue
    open(f"tts/{s['id']}.mp3",'wb').write(base64.b64decode(d['audio_base64'])); json.dump(d['alignment'],open(f"tts/{s['id']}.json",'w')); print(s['id'],len(s['text']))

"""voice + ducked music + whoosh/impact on timeline hits -> mix.wav (run in the short's folder)"""
import json,subprocess,re
tl=json.load(open('timeline.json')); T=tl['total']; ins=[]; fl=[]
for i,(sid,t0) in enumerate(tl['voice']):
    o=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',f'tts/{sid}.mp3','-af','ebur128','-f','null','-'],capture_output=True,text=True).stderr
    I=float(re.findall(r'I:\s+(-?[\d.]+) LUFS',o)[-1]); g=max(-8,min(8,-18-I)); ins+=['-i',f'tts/{sid}.mp3']; fl.append(f"[{i}:a]volume={g:.2f}dB,adelay={int(t0*1000)}:all=1[a{i}]")
n=len(tl['voice']); fl.append(''.join(f'[a{i}]' for i in range(n))+f"amix=inputs={n}:normalize=0,apad=whole_dur={T:.3f},loudnorm=I=-14:TP=-1.5:LRA=8,aresample=44100,aformat=channel_layouts=stereo[v]")
subprocess.check_call(['ffmpeg','-v','error','-y']+ins+['-filter_complex',';'.join(fl),'-map','[v]','-t',f'{T:.3f}','voice.wav'])
fl=[]; outs=[]
for j,t in enumerate(tl['hits']):
    fl.append(f"[0:a]volume=0.55,adelay={max(0,int((t-0.25)*1000))}:all=1[w{j}]"); fl.append(f"[1:a]volume=0.5,adelay={int(t*1000)}:all=1[i{j}]"); outs+=[f'[w{j}]',f'[i{j}]']
fl.append(''.join(outs)+f"amix=inputs={len(outs)}:normalize=0,apad=whole_dur={T:.3f},aresample=44100,aformat=channel_layouts=stereo[s]")
subprocess.check_call(['ffmpeg','-v','error','-y','-i','el_whoosh.mp3','-i','el_impact.mp3','-filter_complex',';'.join(fl),'-map','[s]','-t',f'{T:.3f}','sfx.wav'])
SC="sidechaincompress=threshold=0.05:ratio=3:attack=15:release=350"
subprocess.check_call(['ffmpeg','-v','error','-y','-i','voice.wav','-ss','21','-i','el_music.mp3','-i','sfx.wav','-filter_complex',
 f"[0:a]asplit=2[v][sc];[1:a]volume=-10.5dB,afade=t=in:d=0.15,afade=t=out:st={T-0.5:.2f}:d=0.5,aresample=44100,aformat=channel_layouts=stereo[m];[m][sc]{SC}[md];[v][md][2:a]amix=inputs=3:normalize=0,alimiter=limit=0.95,aresample=48000[o]",'-map','[o]','-t',f'{T:.3f}','mix.wav']); print('mix ok',round(T,2))

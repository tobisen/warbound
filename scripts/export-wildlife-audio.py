"""Reproducible crops of licensed field recordings; see wildlife-251.md.
Mono PCM masters decoded at 24kHz with Chrome OfflineAudioContext.
No synthesized substitute is exported. Derivative deer/fox clips: CC BY-SA4.0.
"""
from pathlib import Path
import wave,struct,json,math,hashlib
root=Path(__file__).resolve().parent.parent
cuts={'deer':[(32.9,2.0),(39.8,2.0),(11.9,2.0)],'fox':[(22.95,.8),(2.05,1.05),(28.55,.8)],'rabbit':[(11.65,.65),(22.3,.65),(34.4,.65)]}
authors={'deer':'Lawrence Shove; copyright The British Library Board','fox':'Aubrey John Williams; copyright The British Library Board','rabbit':'kessir'}
licenses={'deer':'CC-BY-SA-4.0','fox':'CC-BY-SA-4.0','rabbit':'CC0-1.0'}
entries={}
for kind in ['deer','rabbit','fox']:
    segments=cuts[kind]
    with wave.open(str(root/f'assets/audio/wildlife-sources/{kind}.wav'),'rb') as f:
        rate=f.getframerate();raw=f.readframes(f.getnframes());samples=struct.unpack('<'+'h'*(len(raw)//2),raw)
    variants=[]
    for index,(start,duration) in enumerate(segments):
        data=list(samples[round(start*rate):round((start+duration)*rate)])
        # Remove DC; modest peak normalization and 20ms fades, no pitch change.
        mean=sum(data)/len(data);peak=max(abs(x-mean) for x in data);gain=.72*32767/peak
        output=[round((x-mean)*gain*min(1,i/(rate*.02),(len(data)-1-i)/(rate*.02))) for i,x in enumerate(data)]
        name=f'animal-{kind}'+('' if index==0 else f'-{index+1}')+'.wav'
        for folder in ['assets/audio','public/audio']:
            with wave.open(str(root/f'{folder}/{name}'),'wb') as f:
                f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes(struct.pack('<'+'h'*len(output),*output))
        variants.append({'file':f'audio/{name}','master':f'assets/audio/{name}','start':start,'duration':duration,'rate':rate,'channels':1,'bits':16,'author':authors[kind],'license':licenses[kind],'sha256':hashlib.sha256((root/f'public/audio/{name}').read_bytes()).hexdigest()})
    entries[kind]={**variants[0],'variants':variants,'placeholder':False,'listeningVerified':False}
(root/'public/audio/wildlife-manifest.json').write_text(json.dumps({'version':2,'origin':'Licensed field recordings; cropped, DC removed, normalized, faded','source':'assets/sources/wildlife-251.md','entries':entries},indent=2)+'\n')

"""Original layered large-unit cues from the project's credited recorded materials.
No network, noise generators or additional Python dependencies. PCM runtime assets.
"""
from pathlib import Path
import array, hashlib, json, math, wave
root=Path(__file__).resolve().parent.parent
rate=24000
recipes={
 'large-capital':(2.0,[('cannon',0,.72,.8),('cannon',.16,.58,.9),('siege',.03,.3,.7)]),
 'large-zeppelin':(1.6,[('bow',0,.45,.7),('siege',.16,.6,.65),('buildingHit',.34,.5,.8)]),
 'large-behemoth':(1.2,[('impact',0,.8,.55),('melee',.05,.4,.65),('impact',.25,.55,.45)]),
}
materials=json.loads((root/'assets/sources/audio-identity/material-effects.json').read_text())
manifest={}
for name,(duration,layers) in recipes.items():
 out=[0.0]*round(duration*rate)
 for source,delay,gain,pitch in layers:
  with wave.open(str(root/'public/audio'/f'{source}.wav'),'rb') as f:
   channels,width,sr=f.getnchannels(),f.getsampwidth(),f.getframerate()
   if width!=2:raise ValueError('Expected signed16 PCM material')
   data=array.array('h',f.readframes(f.getnframes()))
   mono=[sum(data[i:i+channels])/channels/32768 for i in range(0,len(data),channels)]
  for i in range(round(delay*rate),len(out)):
   at=(i-round(delay*rate))*sr/rate*pitch;k=int(at)
   if k+1>=len(mono):break
   out[i]+=gain*(mono[k]+(mono[k+1]-mono[k])*(at-k))
 peak=max(abs(x) for x in out);scale=.78/peak
 pcm=array.array('h',(round(x*scale*32767*min(1,i/120,(len(out)-1-i)/300)) for i,x in enumerate(out)))
 target=root/'public/audio'/f'{name}.wav'
 with wave.open(str(target),'wb') as f:f.setparams((1,2,rate,len(pcm),'NONE','not compressed'));f.writeframes(pcm.tobytes())
 manifest[name]={'layers':layers,'duration':duration,'peak':.78,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'license':'CC0-1.0','sourceMasters':[{'path':str((root/'public/audio'/f'{cue}.wav').relative_to(root)),'sha256':hashlib.sha256((root/'public/audio'/f'{cue}.wav').read_bytes()).hexdigest()} for cue,_,_,_ in layers],'sources':[source for cue,_,_,_ in layers for source in materials['entries'][cue]['sources']],'listeningVerified':False}
(root/'assets/sources/leviathans/audio.json').write_text(json.dumps(manifest,indent=2)+'\n')

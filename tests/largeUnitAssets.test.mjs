import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {unitFrame,motion,artAtlas,directions} from '../src/presentation/animation';
import {audioFiles} from '../src/config/audio';
const atlas=JSON.parse(readFileSync('public/assets/leviathans-atlas.json','utf8'));
it('all large units have their own directional idle/move/attack/death frames and correct atlas routes',()=>{
 expect(Object.keys(atlas.frames)).toHaveLength(768);
 for(const type of ['capital','zeppelin','behemoth'])for(const owner of ['player','enemy'])for(const facing of directions)for(const action of ['idle','walk','attack','death'])for(let i=0;i<4;i++){
 const id=unitFrame({...motion(undefined,{x:0,y:0},action,0,type,owner),facing},i/(action==='death'?8:6)+.001);expect(artAtlas(type)).toBe('leviathans');expect(atlas.frames[id]?.frame).toMatchObject({w:96,h:96});
 }
});
it('three original recorded-material mixes are non-silent, unclipped, distinct and delivered as local PCM',()=>{
 const audit=JSON.parse(readFileSync('assets/sources/leviathans/audio.json','utf8')),hashes=new Set();
 for(const name of ['large-capital','large-zeppelin','large-behemoth']){expect(audioFiles).toContain(name);const bytes=readFileSync(`public/audio/${name}.wav`),entry=audit[name],hash=createHash('sha256').update(bytes).digest('hex');expect(hash).toBe(entry.sha256);hashes.add(hash);expect(bytes.subarray(0,4).toString()).toBe('RIFF');expect(bytes.readUInt32LE(24)).toBe(24000);let peak=0;for(let i=44;i<bytes.length;i+=2)peak=Math.max(peak,Math.abs(bytes.readInt16LE(i)));expect(peak).toBeGreaterThan(1000);expect(peak).toBeLessThan(32767);expect(entry.layers.length).toBeGreaterThan(1);}
 expect(hashes.size).toBe(3);
});

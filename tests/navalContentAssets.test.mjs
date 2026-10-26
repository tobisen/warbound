import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import {readRGBA} from '../scripts/read-rgba-png.mjs';
import {unitFrame,motion,artAtlas,directions} from '../src/presentation/animation';
import {buildingFrame} from '../src/presentation/assets';
const manifest=JSON.parse(readFileSync('public/assets/manifest.json')),atlas=JSON.parse(readFileSync('public/assets/naval-content-atlas.json')),image=readRGBA('public/assets/naval-content-atlas.png');
it('provides both complete faction hulls in all eight directions and four states, without missing frames or opaque cutouts',()=>{
 expect(Object.keys(atlas.frames)).toHaveLength(520);
 for(const [role,faction]of [['cutter','crown'],['bombard','dwarves']])for(const owner of ['player','enemy'])for(const direction of directions)for(const state of ['idle','walk','attack','death'])for(let index=0;index<4;index++){
  const pose={...motion(undefined,{x:0,y:0},state,0,role,owner,undefined,faction),facing:direction},id=unitFrame(pose,index/8),f=atlas.frames[id].frame;
  expect(artAtlas(role)).toBe('naval-content');expect(manifest.frames[id]).toMatchObject({atlas:'naval-content',anchor:{x:32,y:40}});
  expect(f.x+f.w).toBeLessThanOrEqual(image.width);expect(f.y+f.h).toBeLessThanOrEqual(image.height);
  let visible=0;for(let y=0;y<f.h;y++)for(let x=0;x<f.w;x++){const alpha=image.data[((f.y+y)*image.width+f.x+x)*4+3];visible+=Number(alpha>0);if(x===0||y===0||x===f.w-1||y===f.h-1)expect(alpha,`${id} clipped border`).toBe(0);}
  expect(visible,`${id} empty sprite`).toBeGreaterThan(100);expect(visible).toBeLessThan(f.w*f.h*.85);
 }
});
it('provides distinct foundation, construction, complete and damage foundry art with valid logical footprint',()=>{
 for(const owner of ['player','enemy'])for(const [remaining,hp]of [[18,180],[4,180],[0,180],[0,50]]){
  const id=buildingFrame('navalFoundry',owner,remaining,18,'crown',hp);expect(atlas.frames[id]).toBeDefined();expect(manifest.frames[id]).toMatchObject({atlas:'naval-content',logicalFootprint:{width:64,height:64},width:96,height:96});
 }
 expect(readFileSync('assets/sources/naval-content/cutter.png').length).toBeGreaterThan(10000);expect(readFileSync('assets/sources/naval-content/bombard.png').length).toBeGreaterThan(10000);
});

import {readFileSync,writeFileSync} from 'node:fs';
import {Surface,png} from './pixelArt.mjs';
import {readRGBA} from './read-rgba-png.mjs';
import {cell,draw} from '../assets/sources/visual-refresh/frames.mjs';
const directions=['e','se','s','sw','w','nw','n','ne'],states=['idle','walk','attack','death'];
const units=[['survey','elves'],['raider','clans'],['mortarShip','dwarves'],['tender','crown'],['torpedoBoat','goblins'],['marine','crown'],['marine','clans'],['sapper','dwarves'],['sapper','goblins'],['harpooner','elves']];
const frames={},manifest=JSON.parse(readFileSync('public/assets/manifest.json')),image=new Surface(2048,5888);let cursor=0;
const prefix=f=>f==='crown'?'':f+'-';
function add(id,sprite,x,y,meta){image.blit(sprite,x,y);const w=sprite.width,h=sprite.height;frames[id]={frame:{x,y,w,h},rotated:false,trimmed:false,spriteSourceSize:{x:0,y:0,w,h},sourceSize:{w,h}};manifest.frames[id]={atlas:'island-fleets',width:w,height:h,...meta};}
for(const [role,faction] of units){const land=['marine','sapper','harpooner'].includes(role),name=faction==='clans'&&role==='marine'||faction==='goblins'&&role==='sapper'?`${faction}-${role}`:role,sheet=readRGBA(`assets/sources/island-fleets/${name}.png`);
 for(const owner of ['player','enemy'])for(const [col,direction]of directions.entries())for(const [row,state]of states.entries()){
  const source=cell(sheet,col,row,8,4);
  for(let index=0;index<4;index++){const id=`${prefix(faction)}${role}-${owner}-${direction}-${state}-${index}`,sprite=draw(source,64,64,{bottom:land?44:45,maxWidth:land?48:60,maxHeight:land?42:42,owner,state,index,direction});add(id,sprite,cursor%32*64,Math.floor(cursor/32)*64,{kind:'unit',type:role,faction,owner,direction,state,frame:index,anchor:{x:32,y:land?44:40}});cursor++;}
 }
}
let b=0;for(const role of ['drydock','signalTower','navalAcademy','marineBarracks']){const sheet=readRGBA(`assets/sources/island-fleets/${role}.png`);for(const faction of ['crown','clans','elves','dwarves','goblins'])for(const owner of ['player','enemy'])for(const [col,stage]of ['complete','damaged','foundation','building'].entries()){const sprite=draw(cell(sheet,col,0,4,1),96,96,{bottom:76,maxWidth:92,maxHeight:72,owner,state:stage});add(`${prefix(faction)}${role}-${owner}-${stage}`,sprite,b%20*96,5120+Math.floor(b/20)*96,{kind:'building',buildingType:role,faction,owner,stage,anchor:{x:48,y:72},logicalFootprint:{width:64,height:64}});b++;}}
writeFileSync('public/assets/island-fleets-atlas.png',png(image));writeFileSync('public/assets/island-fleets-atlas.json',JSON.stringify({frames,meta:{image:'island-fleets-atlas.png',size:{w:image.width,h:image.height},scale:'1'}},null,2)+'\n');manifest.atlases['island-fleets']={image:'assets/island-fleets-atlas.png',data:'assets/island-fleets-atlas.json',width:image.width,height:image.height,source:'assets/sources/island-fleets/'};writeFileSync('public/assets/manifest.json',JSON.stringify(manifest,null,2)+'\n');console.log(Object.keys(frames).length+' Island Fleets frames');

import {readFileSync,writeFileSync} from 'node:fs';
import {Surface,png} from './pixelArt.mjs';
import {readRGBA} from './read-rgba-png.mjs';
import {cell,draw} from '../assets/sources/visual-refresh/frames.mjs';
const directions=['e','se','s','sw','w','nw','n','ne'],states=['idle','walk','attack','death'];
const image=new Surface(1536,4608),frames={},manifest=JSON.parse(readFileSync('public/assets/manifest.json'));let cursor=0;
for(const [role,faction]of [['capital','crown'],['zeppelin','goblins'],['behemoth','clans']]){
 const sheet=readRGBA(`assets/sources/leviathans/${role}.png`);
 for(const owner of ['player','enemy'])for(const [col,direction]of directions.entries())for(const [row,state]of states.entries())for(let index=0;index<4;index++){
  const sprite=draw(cell(sheet,col,row,8,4),96,96,{bottom:role==='zeppelin'?80:76,maxWidth:88,maxHeight:role==='zeppelin'?76:72,owner,state,index,direction}),id=`${role}-${owner}-${direction}-${state}-${index}`,x=cursor%16*96,y=Math.floor(cursor/16)*96;cursor++;
  image.blit(sprite,x,y);frames[id]={frame:{x,y,w:96,h:96},rotated:false,trimmed:false,spriteSourceSize:{x:0,y:0,w:96,h:96},sourceSize:{w:96,h:96}};
  manifest.frames[id]={atlas:'leviathans',width:96,height:96,kind:'unit',type:role,faction,owner,direction,state,frame:index,anchor:{x:48,y:role==='zeppelin'?48:72}};
 }
}
writeFileSync('public/assets/leviathans-atlas.png',png(image));writeFileSync('public/assets/leviathans-atlas.json',JSON.stringify({frames,meta:{image:'leviathans-atlas.png',size:{w:image.width,h:image.height},scale:'1'}},null,2)+'\n');manifest.atlases.leviathans={image:'assets/leviathans-atlas.png',data:'assets/leviathans-atlas.json',width:image.width,height:image.height,source:'assets/sources/leviathans/'};writeFileSync('public/assets/manifest.json',JSON.stringify(manifest,null,2)+'\n');console.log(`${cursor} original large-unit frames exported`);

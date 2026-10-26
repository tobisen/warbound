import {readFileSync,writeFileSync} from 'node:fs';
import {Surface,png} from './pixelArt.mjs';
import {readRGBA} from './read-rgba-png.mjs';
import {cell,draw} from '../assets/sources/visual-refresh/frames.mjs';
const directions=['e','se','s','sw','w','nw','n','ne'],states=['idle','walk','attack','death'],items=[];
for(const [role,prefix] of [['cutter',''],['bombard','dwarves-']]){
 const source=readRGBA(`assets/sources/naval-content/${role}.png`);
 for(const owner of ['player','enemy'])for(const [column,direction] of directions.entries())for(const [row,state] of states.entries()){
  const sprite=cell(source,column,row,8,4);
  for(let index=0;index<4;index++)items.push({id:`${prefix}${role}-${owner}-${direction}-${state}-${index}`,kind:'unit',type:role,image:draw(sprite,64,64,{bottom:45,maxWidth:60,maxHeight:42,owner,state,index,direction})});
 }
}
const foundry=readRGBA('assets/sources/naval-content/naval-foundry.png');
const image=new Surface(1024,2144),frames={},manifest=JSON.parse(readFileSync('public/assets/manifest.json'));
for(const [index,item] of items.entries()){
 const x=index%16*64,y=Math.floor(index/16)*64;image.blit(item.image,x,y);frames[item.id]={frame:{x,y,w:64,h:64},rotated:false,trimmed:false,spriteSourceSize:{x:0,y:0,w:64,h:64},sourceSize:{w:64,h:64}};manifest.frames[item.id]={atlas:'naval-content',width:64,height:64,anchor:{x:32,y:40},kind:'unit',type:item.type};
}
for(const [oi,owner] of ['player','enemy'].entries())for(const [column,state] of ['complete','damaged','foundation','building'].entries()){
 const id=`navalFoundry-${owner}-${state}`,sprite=draw(cell(foundry,column,0,4,1),96,96,{bottom:76,maxWidth:94,maxHeight:72,owner,state,index:0,direction:'s'}),x=(oi*4+column)*96,y=2048;
 image.blit(sprite,x,y);frames[id]={frame:{x,y,w:96,h:96},rotated:false,trimmed:false,spriteSourceSize:{x:0,y:0,w:96,h:96},sourceSize:{w:96,h:96}};manifest.frames[id]={atlas:'naval-content',width:96,height:96,anchor:{x:48,y:72},kind:'building',buildingType:'navalFoundry',logicalFootprint:{width:64,height:64}};
}
writeFileSync('public/assets/naval-content-atlas.png',png(image));writeFileSync('public/assets/naval-content-atlas.json',JSON.stringify({frames,meta:{image:'naval-content-atlas.png',size:{w:image.width,h:image.height},scale:'1'}},null,2)+'\n');manifest.atlases['naval-content']={image:'assets/naval-content-atlas.png',data:'assets/naval-content-atlas.json',width:image.width,height:image.height,source:'assets/sources/naval-content/'};writeFileSync('public/assets/manifest.json',JSON.stringify(manifest,null,2)+'\n');console.log(`${Object.keys(frames).length} naval content frames`);

import {factions,type FactionId} from '../config/factions';
import {factionLore} from '../config/factionLore';
import {spriteCrop} from './spriteCrop';
import './factionPortrait.css';
type Frame={x:number;y:number;w:number;h:number};
let source:Promise<{image:HTMLImageElement;frames:Record<string,{frame:Frame}>}>|undefined;
function atlas(){return source??=Promise.all([
 fetch(`${import.meta.env.BASE_URL}assets/units-atlas.json`).then(r=>{if(!r.ok)throw Error('Faction atlas unavailable');return r.json() as Promise<{frames:Record<string,{frame:Frame}>}>;}),
 new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=`${import.meta.env.BASE_URL}assets/units-atlas.png`;})
]).then(([data,image])=>({image,frames:data.frames}));}
export function syncFactionPortrait(description:HTMLElement,faction:FactionId):void{
 let card=description.parentElement!.querySelector<HTMLElement>('.faction-story');
 if(!card){card=document.createElement('figure');card.className='faction-story';card.innerHTML='<canvas width="128" height="128" role="img"></canvas><figcaption></figcaption>';description.before(card);}
 if(card.dataset.faction===faction)return;card.dataset.faction=faction;
 const canvas=card.querySelector('canvas')!,context=canvas.getContext('2d')!;
 context.clearRect(0,0,128,128);canvas.setAttribute('aria-label',`${factions[faction].label} — ${factions[faction].unitNames.soldier}`);
 card.querySelector('figcaption')!.textContent=factionLore[faction];
 const current=card;
 void atlas().then(({image,frames})=>{if(current.dataset.faction!==faction)return;const frame=frames[`${factions[faction].artPrefix}soldier-player-s-idle-0`].frame;
 const scratch=document.createElement('canvas');scratch.width=frame.w;scratch.height=frame.h;const ctx=scratch.getContext('2d')!;ctx.drawImage(image,frame.x,frame.y,frame.w,frame.h,0,0,frame.w,frame.h);
 const bounds=spriteCrop(ctx.getImageData(0,0,frame.w,frame.h).data,frame.w,frame.h);const scale=Math.min(112/bounds.width,112/bounds.height);context.imageSmoothingEnabled=false;context.drawImage(scratch,bounds.x,bounds.y,bounds.width,bounds.height,(128-bounds.width*scale)/2,(128-bounds.height*scale)/2,bounds.width*scale,bounds.height*scale);canvas.dataset.loaded=faction;
 }).catch(()=>{canvas.setAttribute('aria-label','Unit image could not be loaded');});
}

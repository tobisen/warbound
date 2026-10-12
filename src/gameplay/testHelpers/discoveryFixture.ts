/** Synthetic rendering stress only; this does not demonstrate paid AI construction. */
import {createMatch} from '../match';
import {matchFog} from '../matchFog';
import {visibleMinimapData} from '../../presentation/minimap';
export {visibleMinimapData};
export function fixture(reveal:boolean){let m=createMatch('skirmish','easy',undefined,'frontier');m.combat.enemies=Array.from({length:400},(_,i)=>{const x=1900+i%20*48,y=1900+Math.floor(i/20)*48;return {id:`bench-${i}`,kind:'base' as const,hp:300,position:{x:x+16,y:y+16},footprint:{x,y,width:32,height:32},buildingType:'farm' as const,faction:m.factions?.enemy??'clans'};});m.placement.defenses=Array.from({length:512},(_,i)=>({id:`wall-${i+1}` as const,kind:'wall' as const,owner:'player' as const,hp:100,footprint:{x:1500+i%32*32,y:1500+Math.floor(i/32)*32,width:32,height:32},construction:{remainingSeconds:0,builderId:null},level:1 as const,upgradeRemaining:null,cooldown:0}));m.fog=matchFog(m);if(reveal){m.fog.teams.player.visible.fill(true);m.fog.teams.player.explored.fill(true);}return m;}

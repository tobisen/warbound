import {isRegionalDesign} from '../config/organicTerrain';
import {regionDefinition,regionThirdStart} from '../config/mapRegions';
import type {TerrainDesign} from '../config/organicTerrain';
import {additionalStarts,extraPlayerStarts,playerIds,playerColors,type PlayerDefinition,type PlayerId} from '../config/players';
import {defaultFactions,type MatchFactions} from '../config/factions';
import type {AIProfileId} from '../config/aiProfiles';
import {enemyBaseConfig} from '../config/scenarios';
import {gatheringConfig} from '../config/gathering';
import {maps,type MapId} from '../config/maps';
import {bodyFits,createMap,overlaps} from './map';
import {baseFootprint} from './buildingSelection';
import {spawnCandidates,hasSpawnExit} from './spawning';
import type {Position} from './movement';

export interface PlayerOwned {playerId?:PlayerId}
export function ownerOf(entity:PlayerOwned&{owner?:string}):PlayerId{return entity.playerId??(entity.owner==='enemy'?'enemy':'player');}
export function playerTeam(id:PlayerId,roster?:readonly PlayerDefinition[]):number{return roster?.find(p=>p.id===id)?.teamId??playerIds.indexOf(id)+1;}
export function playerRelation(a:PlayerId,b:PlayerId,roster?:readonly PlayerDefinition[]):'own'|'ally'|'enemy'{return a===b?'own':playerTeam(a,roster)===playerTeam(b,roster)?'ally':'enemy';}
export const canControl=(actor:PlayerId,target:PlayerId)=>actor===target;
export const canHarm=(actor:PlayerId,target:PlayerId,roster?:readonly PlayerDefinition[])=>playerRelation(actor,target,roster)==='enemy';
export const canSupport=(actor:PlayerId,target:PlayerId,roster?:readonly PlayerDefinition[])=>playerRelation(actor,target,roster)!=='enemy';
export function matchPlayers(factions:MatchFactions=defaultFactions,profile:AIProfileId='balanced',count=2):PlayerDefinition[]{
 if(!Number.isInteger(count)||count<2||count>5)throw Error('Unsupported player count');
 return playerIds.slice(0,count).map((id,i)=>({teamId:i+1,id,controller:i===0?'human':'ai',faction:i===0?factions.player:i===1?factions.enemy:(['elves','dwarves','goblins'] as const)[i-2],color:playerColors[i],profile}));
}
export function playerStart(map:MapId,id:PlayerId,design?:TerrainDesign):Position{
 const authored=maps[map].skirmishStarts?.[playerIds.indexOf(id)];if(authored)return {...authored};
 if(id==='player')return {...gatheringConfig.basePosition};
 if(id==='ai-3'||id==='ai-4'){const point=extraPlayerStarts[map]?.[id==='ai-3'?0:1];if(!point)throw Error('Map has no extra start');return {...point};}
 if(id==='ai-2'){const p=isRegionalDesign(design)&&additionalStarts[map]?regionThirdStart:additionalStarts[map];if(!p)throw Error('Map has no third start');return {...p};}
 const rect=regionDefinition(map,maps[map],design).enemyBase??enemyBaseConfig.footprint;return {x:rect.x+rect.width/2,y:rect.y+rect.height/2};
}
/** Validate physical footprint and a reachable worker exit before offering a slot. */
export function validatePlayerStarts(mapId:MapId,players:readonly PlayerDefinition[],design:TerrainDesign|'legacy'='regions'):boolean{
 try{
 const layout=design==='legacy'?undefined:design,map=createMap(mapId,undefined,'trees','expanded',layout),rects=players.map(p=>p.id==='player'?baseFootprint(playerStart(mapId,p.id,layout)):{x:playerStart(mapId,p.id,layout).x-48,y:playerStart(mapId,p.id,layout).y-48,width:96,height:96});
 if(new Set(players.map(p=>p.id)).size!==players.length)return false;
 if(rects.some((r,i)=>!bodyFits(map,{x:r.x+r.width/2,y:r.y+r.height/2},r.width/2)||rects.some((other,j)=>j!==i&&overlaps(r,other))))return false;
 const occupied={...map,obstacles:[...map.obstacles,...rects]};
 return rects.every(r=>spawnCandidates(occupied,r,'base').some(p=>hasSpawnExit(occupied,p)));
 }catch{return false;}
}

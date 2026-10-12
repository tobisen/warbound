import type {Enemy} from './combat';
import type {FogState} from './fog';
import {entityVisible,entityPresented} from './visibility';
/** Public visual fields only: no production, orders, workers or research in memory. */
export type KnownBuilding=Pick<Enemy,'id'|'kind'|'position'|'footprint'|'hp'|'buildingType'|'faction'|'playerId'|'construction'>;
const snapshot=(e:Enemy):KnownBuilding=>({id:e.id,kind:e.kind,position:{...e.position},footprint:{...e.footprint!},hp:e.hp,...(e.buildingType?{buildingType:e.buildingType}:{}),...(e.faction?{faction:e.faction}:{}),...(e.playerId?{playerId:e.playerId}:{}),...(e.construction?{construction:{remainingSeconds:e.construction.remainingSeconds,builderId:null}}:{})});
export function observeEnemyBuildings(fog:FogState,enemies:readonly Enemy[]):FogState {
 const visible=enemies.filter(e=>e.hp>0&&e.footprint&&entityVisible(fog,'player',e));
 const memory=new Map((fog.buildings??[]).filter(e=>!entityVisible(fog,'player',e)).map(e=>[e.id,e]));
 for(const e of visible)memory.set(e.id,snapshot(e));
 if(!memory.size&&!fog.buildings)return fog;
 return {...fog,buildings:[...memory.values()]};
}
/** Current troops plus last observed buildings. Hidden new buildings never enter presentation. */
export function presentationEnemies(fog:FogState|undefined,enemies:readonly Enemy[]):Enemy[]{
 if(!fog)return [...enemies];
 return [...enemies.filter(e=>!e.footprint&&entityPresented(fog,'player',e)),...(fog.buildings??[]).filter(e=>!entityVisible(fog,'player',e)),...enemies.filter(e=>e.footprint&&entityVisible(fog,'player',e))];
}

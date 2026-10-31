import {transportCapacity,transportContactRange} from './fleetService';
import {hasMainBase} from './extraBases';
import {isAir} from './domains';
import {unitStats,combatUnitStats} from '../config/unit';
import {bodyFits,overlaps,tileCenter} from './map';
import {segmentFits} from './navigation';
import {marineFlightMap} from './terrainNavigation';
import {unitBody} from './spawning';
import {placementVisible} from './visibility';
import {cleanDestroyed} from './destruction';
import type {Unit} from './gathering';
import type {Position} from './movement';
import type {MatchState} from './match';
const size=(u:Unit)=>u.kind==='worker'?unitStats.size:combatUnitStats(u).size;
function contact(m:MatchState,ship:Position,point:Position){return Math.hypot(ship.x-point.x,ship.y-point.y)<=transportContactRange(m.factions?.player??'crown',m.research)+1e-9&&segmentFits(marineFlightMap(m.map),ship,point,0);}
/** Immediate boarding only: players first move units to a free visible shore. */
export function loadTransport(m:MatchState,shipId:string):MatchState {
 if(m.outcome!=='playing'||m.paused||!!m.multiplePlayers&&!hasMainBase(m))return m;
 const ship=m.navy?.ships.find(s=>s.id===shipId&&s.role==='transport'&&s.hp>0);if(!ship)return m;
 let seats=transportCapacity(m.factions?.player??'crown',m.research)-(ship.passengers?.length??0);
 const boarding=m.gathering.units.filter(u=>!isAir(u)&&u.selected&&(u.hp??1)>0&&(!m.fog||placementVisible(m.fog,unitBody(u.position,size(u))))&&bodyFits({...m.map,bodyHalf:size(u)/2},u.position,size(u)/2)&&contact(m,ship.position,u.position)&&seats-->0);
 if(!boarding.length)return m;
 const passengers=boarding.map((u):Unit=>({...u,selected:false,commandMode:undefined,orderQueue:undefined,navigation:undefined,target:{...u.position},order:{kind:'idle'},...(u.kind==='soldier'?{attackMoveTarget:undefined,autoOrigin:undefined,autoDisabled:true}: {})}));
 return cleanDestroyed({...m,gathering:{...m.gathering,units:m.gathering.units.filter(u=>!boarding.includes(u))},navy:{...m.navy!,ships:m.navy!.ships.map(s=>s===ship?{...s,passengers:[...(s.passengers??[]),...passengers]}:s)}});
}
/** Plan the entire landing before mutation; a crowded/hidden/invalid shore rejects all. */
export function unloadTransport(m:MatchState,shipId:string,point:Position):MatchState {
 if(m.outcome!=='playing'||m.paused||!!m.multiplePlayers&&!hasMainBase(m))return m;
 const ship=m.navy?.ships.find(s=>s.id===shipId&&s.role==='transport'&&s.selected&&s.hp>0),passengers=ship?.passengers;
 if(!ship||!passengers?.length||!contact(m,ship.position,point))return m;
 const occupied=[...m.gathering.units.filter(u=>!isAir(u)).map(u=>unitBody(u.position,size(u))),...m.combat.enemies.filter(e=>e.hp>0&&!isAir(e)&&!e.footprint).map(e=>unitBody(e.position,24))];
 const points:Position[]=[point];
 for(let row=Math.max(0,Math.floor((point.y-48)/m.map.tileSize));row<=Math.floor((point.y+48)/m.map.tileSize);row++)for(let column=Math.max(0,Math.floor((point.x-48)/m.map.tileSize));column<=Math.floor((point.x+48)/m.map.tileSize);column++){const p=tileCenter(m.map,{column,row});if(p)points.push(p);}
 points.sort((a,b)=>Math.hypot(a.x-point.x,a.y-point.y)-Math.hypot(b.x-point.x,b.y-point.y));
 const landed:Unit[]=[];
 // Click itself must name visible legal land, rather than silently searching from water.
 const firstBody=unitBody(point,size(passengers[0]));
 if(!bodyFits(m.map,point,size(passengers[0])/2)||m.fog&&!placementVisible(m.fog,firstBody))return m;
 for(const unit of passengers){const p=points.find(p=>{const body=unitBody(p,size(unit));return contact(m,ship.position,p)&&bodyFits(m.map,p,size(unit)/2)&&(!m.fog||placementVisible(m.fog,body))&&!occupied.some(o=>overlaps(o,body));});if(!p)return m;occupied.push(unitBody(p,size(unit)));landed.push({...unit,position:{...p},target:{...p},selected:false,commandMode:undefined,orderQueue:undefined,navigation:undefined,order:{kind:'idle'}});}
 return {...m,gathering:{...m.gathering,units:[...m.gathering.units,...landed]},navy:{...m.navy!,ships:m.navy!.ships.map(s=>s===ship?{...s,passengers:[]}:s)}};
}

/** Explain the same landing transaction used by pointer orders, without moving any entity. */
export function transportLandingError(m:MatchState,shipId:string,point:Position):string|null {
 const ship=m.navy?.ships.find(s=>s.id===shipId&&s.role==='transport'&&s.selected&&s.hp>0);
 if(!ship?.passengers?.length)return 'Select a transport with passengers.';
 const range=transportContactRange(m.factions?.player??'crown',m.research);
 if(Math.hypot(ship.position.x-point.x,ship.position.y-point.y)>range)return `Move closer: landing must be within ${range}px of the transport.`;
 if(!bodyFits(m.map,point,size(ship.passengers[0])/2))return 'Choose dry, unobstructed land at the coast.';
 if(m.fog&&!placementVisible(m.fog,unitBody(point,size(ship.passengers[0]))))return 'Scout this shore first: the landing must be visible.';
 if(!contact(m,ship.position,point))return 'An obstacle blocks access from the transport to this shore.';
 return unloadTransport(m,shipId,point)===m?'Not enough free space for every passenger. Try another beach.':null;
}

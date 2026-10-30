import {fleetDoctrineConfig as cfg} from '../config/fleetDoctrine';
import {factionForTeam} from '../config/factions';
import {footprintDistance} from './approach';
import type {MatchState} from './match';
import type {ResearchState} from './research';

export const transportCapacity=(faction:string,research?:Pick<ResearchState,'assaultRamps'>)=>faction==='clans'&&research?.assaultRamps?cfg.assault.capacity:4;
export const transportContactRange=(faction:string,research?:Pick<ResearchState,'assaultRamps'>)=>transportCapacity(faction,research)===cfg.assault.capacity?cfg.assault.contactRange:64;
export function fleetVision(faction:string,role:string|undefined,research?:Pick<ResearchState,'tidewatch'>){
 const armed=role!=='transport'&&role!=='submarine';
 return {detector:armed?(faction==='elves'&&research?.tidewatch?cfg.tidewatch.detection:96):0,radius:faction==='elves'&&research?.tidewatch&&armed?cfg.tidewatch.shipVision:undefined};
}
/** Local finite paid maintenance; no new entity scans unless the technology is active. */
export function serviceFleet(m:MatchState,delta:number):MatchState {
 if(delta<=0||m.paused||m.outcome!=='playing'||!m.navy||m.factions?.player!=='crown'||!m.research?.convoyService)return m;
 const docks=[...(m.navy.harbor?[m.navy.harbor]:[]),...(m.placement.producers??[]).filter(b=>b.kind==='harbor')].filter(b=>b.hp>0&&b.construction.remainingSeconds===0);
 if(!docks.length)return m;
 const f=factionForTeam(m,'player');let wood=m.gathering.wood,gold=m.gathering.goldBalance??0;
 const repair=(hp:number,max:number,rate:number)=>{const restored=Math.max(0,Math.min(max-hp,rate*delta,wood/cfg.convoy.woodPerHP,gold/cfg.convoy.goldPerHP));wood-=restored*cfg.convoy.woodPerHP;gold-=restored*cfg.convoy.goldPerHP;return hp+restored;};
 const ships=m.navy.ships.map(ship=>{
  if(ship.hp<=0||ship.order.kind!=='idle'||ship.transfer||!docks.some(d=>footprintDistance(ship.position,d.footprint)<=cfg.convoy.radius))return ship;
  return {...ship,hp:repair(ship.hp,f.naval.units[ship.role??'warship'].hp,cfg.convoy.hullPerSecond),...(ship.passengers?{passengers:ship.passengers.map(u=>(u.hp??0)>0?{...u,hp:repair(u.hp!,f.units[u.kind==='worker'?'worker':u.archetype??'soldier'].hp,cfg.convoy.passengerPerSecond)}:u)}:{})};
 });
 return {...m,gathering:{...m.gathering,wood,goldBalance:gold},navy:{...m.navy,ships}};
}

/** The same maintenance cost and radius apply to an AI Human fleet. */
export function serviceEnemyFleet(m:MatchState,delta:number):MatchState {
 if(delta<=0||m.paused||m.outcome!=='playing'||m.factions?.enemy!=='crown'||!m.enemyPolicy?.research.convoyService||!m.enemyProduction)return m;
 const docks=m.combat.enemies.filter(e=>e.hp>0&&e.buildingType==='harbor'&&e.construction?.remainingSeconds===0&&e.footprint);
 if(!docks.length)return m;
 const f=factionForTeam(m,'enemy'),bank=m.enemyProduction;let wood=bank.wood,gold=bank.gold;
 const repair=(hp:number,max:number,rate:number)=>{const restored=Math.max(0,Math.min(max-hp,rate*delta,wood/cfg.convoy.woodPerHP,gold/cfg.convoy.goldPerHP));wood-=restored*cfg.convoy.woodPerHP;gold-=restored*cfg.convoy.goldPerHP;return hp+restored;};
 const enemies=m.combat.enemies.map(e=>e.kind==='ship'&&e.hp>0&&(!e.order||e.order.kind==='idle')&&docks.some(d=>footprintDistance(e.position,d.footprint!)<=cfg.convoy.radius)?{...e,hp:repair(e.hp,f.naval.units[e.navalRole??'transport'].hp,cfg.convoy.hullPerSecond)}:e);
 const dockedTransport=enemies.some(e=>e.kind==='ship'&&(!e.navalRole||e.navalRole==='transport')&&e.hp>0&&(!e.order||e.order.kind==='idle')&&docks.some(d=>footprintDistance(e.position,d.footprint!)<=cfg.convoy.radius));
 const enemyNaval=m.enemyNaval&&dockedTransport?{...m.enemyNaval,passengers:m.enemyNaval.passengers.map(e=>e.hp>0?{...e,hp:repair(e.hp,f.units[e.role??'soldier'].hp,cfg.convoy.passengerPerSecond)}:e)}:m.enemyNaval;
 return {...m,combat:{...m.combat,enemies},enemyNaval,enemyProduction:{...bank,wood,gold,spent:{wood:(bank.spent?.wood??0)+bank.wood-wood,gold:(bank.spent?.gold??0)+bank.gold-gold}}};
}

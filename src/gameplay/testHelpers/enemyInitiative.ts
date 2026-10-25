import {createMatch,updateMatch} from '../match';
import {strategyFor} from '../enemyStrategy';
import {cleanDestroyed} from '../destruction';
import {enemyPopulation} from '../enemyConstruction';
import {enemySupply} from '../enemyUnits';
import {difficultyProfiles,type Difficulty} from '../../config/difficulty';
import type {MapId} from '../../config/maps';

/** Passive, persistent human targets use the multiplayer hit sink. No AI resources,
 * vision, positions or production are injected. Losses at 12min are explicit. */
export function simulateEnemyInitiative(map:MapId,difficulty:Difficulty,seconds=1200,onSnapshot?:(snapshot:unknown)=>void){
 let m=createMatch('skirmish',difficulty,undefined,map);
 const home=m.combat.enemies.find(e=>e.kind==='base')!.position;
 let firstHit:number|undefined,firstScout:number|undefined,firstDispatch:number|undefined,firstExpansion:number|undefined,thirdBase:number|undefined;
 let removed=0,jobsBeforeLoss=0,hitsAfterLoss=0,maxArmySupply=0,maxBuildings=0,scoutTime:number|undefined,preLossSurvivors=0;
 const dispatches:number[]=[],snapshots:{time:number;jobs:number;workers:number;bases:number;armySupply:number;buildings:string[]}[]=[],damage={total:0};
 const initialIds=m.combat.enemies.map(e=>e.id);
 for(let t=0;t<seconds;t++){
  if(t===720){preLossSurvivors=m.combat.enemies.filter(e=>e.kind==='unit').length;jobsBeforeLoss=m.enemyProduction!.acceptedJobs;const victims=m.combat.enemies.filter(e=>!e.footprint&&e.kind==='unit'&&e.role!=='scout'&&!m.enemyAI!.reserve.includes(e.id));for(const e of victims.slice(0,Math.max(1,Math.ceil(victims.length*.7)))){e.hp=0;removed++;}m=cleanDestroyed(m);}
  const previous=m.enemyAI!.lastDispatchSeconds;
  m=updateMatch(m,1,{side:'enemy',onHit:(_target,_attacker,amount)=>{firstHit??=t+1;damage.total+=amount;if(t>=720)hitsAfterLoss++;}});
  if(m.enemyAI!.lastDispatchSeconds!==previous){firstDispatch??=t+1;dispatches.push(t+1);}
  const recon=strategyFor(m)?.recon;
  if(recon?.ids.some(id=>{const e=m.combat.enemies.find(e=>e.id===id);return e&&Math.hypot(e.position.x-home.x,e.position.y-home.y)>400;}))scoutTime??=t+1;
  if(m.combat.enemies.some(e=>!e.footprint&&Math.hypot(e.position.x-home.x,e.position.y-home.y)>640))firstScout??=t+1;
  const bases=m.combat.enemies.filter(e=>(e.kind==='base'||e.buildingType==='outpost')&&(!e.construction||e.construction.remainingSeconds===0)).length;
  if(bases>=2)firstExpansion??=t+1;if(bases>=3)thirdBase??=t+1;
  const armySupply=m.combat.enemies.filter(e=>!e.footprint&&e.kind!=='worker').reduce((n,e)=>n+enemySupply(e,m.factions!.enemy),0);
  maxArmySupply=Math.max(maxArmySupply,armySupply);maxBuildings=Math.max(maxBuildings,m.combat.enemies.filter(e=>e.footprint).length);
  if(t%120===119){const snapshot={time:t+1,jobs:m.enemyProduction!.acceptedJobs,workers:m.combat.enemies.filter(e=>e.kind==='worker').length,bases,armySupply,buildings:m.combat.enemies.filter(e=>e.footprint).map(e=>e.buildingType??e.kind??'building'),bank:{wood:Math.round(m.enemyProduction!.wood),gold:Math.round(m.enemyProduction!.gold)},priority:strategyFor(m)?.priority,knownNodes:m.enemyKnowledge!.nodes.length,knownBase:m.enemyKnowledge!.playerBase,groups:m.enemyAI!.groups.map(g=>({status:g.status,size:g.members.length})),scouts:m.combat.enemies.filter(e=>e.role==='scout').length};snapshots.push(snapshot);onSnapshot?.(snapshot);}
 }
 const bank=m.enemyProduction!,cargo=(type:'wood'|'gold')=>m.combat.enemies.reduce((n,e)=>n+(e.work&&(e.work.cargoType??'wood')===type?e.work.cargo:0),0);
 const ledgerError=Object.fromEntries((['wood','gold'] as const).map(type=>[type,bank[type]+bank.spent![type]+cargo(type)+(bank.lostCargo?.[type]??0)-difficultyProfiles[difficulty].budget[type]-bank.extracted![type]]));
 return {match:m,report:{map,difficulty,seconds:m.waves.elapsedSeconds,firstHit,firstScout,scoutTime,firstDispatch,firstExpansion,thirdBase,dispatches,removed,preLossSurvivors,jobsBeforeLoss,jobsAfterLoss:bank.acceptedJobs-jobsBeforeLoss,hitsAfterLoss,damage:damage.total,maxArmySupply,maxBuildings,population:enemyPopulation(m),research:m.enemyPolicy!.research,baseDevelopment:bank.baseDevelopment,ledgerError,initialUnitsSurvive:initialIds.every(id=>m.combat.enemies.some(e=>e.id===id)),snapshots}};
}

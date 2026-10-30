import {createMatch,updateMatch,type MatchState} from '../match';
import {strategyFor} from '../enemyStrategy';
import {resourceNodes} from '../gathering';
import {difficultyProfiles,type Difficulty} from '../../config/difficulty';
import type {MapId} from '../../config/maps';
export function territoryFixture(difficulty:Difficulty='normal',map:MapId='plains128'){const m=createMatch('skirmish',difficulty,undefined,map);m.matchId='00000000-0000-4000-8000-000000000001';return m;}
export function territorySnapshot(m:MatchState){
 const bases=m.combat.enemies.filter(e=>e.hp>0&&(e.kind==='base'||e.buildingType==='outpost')).map(e=>({id:e.id,position:e.position,remaining:e.construction?.remainingSeconds??0}));
 const plan=strategyFor(m),scout=m.combat.enemies.find(e=>plan?.recon?.ids.includes(e.id));
 return {seconds:m.waves.elapsedSeconds,bases,workers:m.combat.enemies.filter(e=>e.kind==='worker').length,jobs:m.enemyProduction!.acceptedJobs,workerOrders:m.combat.enemies.filter(e=>e.kind==='worker').map(e=>({id:e.id,position:e.position,work:e.work,navigation:e.navigation?{status:e.navigation.status,destination:e.navigation.destination,error:e.navigation.error}:undefined})),bank:{wood:m.enemyProduction!.wood,gold:m.enemyProduction!.gold},knownNodes:m.enemyKnowledge!.nodes.length,knownMines:m.enemyKnowledge!.nodes.filter(n=>n.resource==='gold').map(n=>({id:n.id,position:n.position,remaining:n.remaining})),explored:m.fog!.teams.enemy.explored.filter(Boolean).length,tiles:m.fog!.columns*m.fog!.rows,scout:scout?{id:scout.id,position:scout.position,goal:plan?.recon?.goal,status:scout.navigation?.status,error:scout.navigation?.error,index:plan?.recon?.index}:undefined,priority:plan?.priority,sites:plan?.expansionSites,failed:m.enemyRecovery?.expansionPlan?.failed,outcome:m.outcome};
}
export function territoryLedger(m:MatchState){const bank=m.enemyProduction!,cargo=(type:'wood'|'gold')=>m.combat.enemies.reduce((sum,e)=>sum+(e.work&&(e.work.cargoType??'wood')===type?e.work.cargo:0),0);return Object.fromEntries((['wood','gold'] as const).map(type=>[type,bank[type]+bank.spent![type]+cargo(type)+(bank.lostCargo?.[type]??0)-difficultyProfiles[m.difficulty??'normal'].budget[type]-bank.extracted![type]]));}
export {updateMatch,resourceNodes};

export {encodeSave,decodeSave} from '../save';

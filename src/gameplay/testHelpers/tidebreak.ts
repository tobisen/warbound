import {enqueueProduction} from '../productionQueue';
import {matchPopulation} from '../navy';
import {orderUnits} from '../gathering';
import {identityFor,campaignMissionsFor} from '../../config/campaignSeries';
import {tidebreakMission} from '../../config/seaBattle';
import {startCampaignMission} from '../campaign';
import {campaignPhase} from '../campaignPhases';
import {updateMatch,type MatchState} from '../match';
import {issueOrder} from '../commandOrders';
import {beginPlacement,placeBuilding,placementObstacles} from '../placement';
import {technologyFor} from '../productionPrerequisites';
import {startResearch} from '../research';
import {trainShip} from '../navy';
import {prepareSeaBattleTactics,seaBattleTacticalOrders} from './seaBattleTactics';
export function tidebreak(){const identity=identityFor('crown','normal');return startCampaignMission({version:1,identity,completed:campaignMissionsFor(identity.campaignId).filter(m=>m.id!==tidebreakMission).map(m=>m.id)},tidebreakMission,'normal',{player:'crown',enemy:'dwarves'})!;}
/** Uses actual scouting, paid build/research/production and transport commands. */
export function tidebreakOrders(m:MatchState,strategy:'screen'|'logistics'):MatchState {
 const phase=campaignPhase(m),run=m.campaignRun!;
 const navalPhase=phase?.goal==='position'?2:phase?.goal==='base'?3:phase?.goal==='enemy-fleet'?1:0;
 m=seaBattleTacticalOrders({...m,campaignRun:{...run,phase:navalPhase}},phase?.goal==='sea-position'?phase.points![0]:{x:1600,y:480},strategy==='screen');m={...m,campaignRun:run};
 const scout=m.gathering.units.find(u=>u.kind==='soldier'&&u.archetype==='scout');
 if(phase?.goal==='explore'&&scout?.order.kind==='idle'){
  m={...m,gathering:{...m.gathering,units:m.gathering.units.map(u=>({...u,selected:u===scout}))},navy:{...m.navy!,ships:m.navy!.ships.map(s=>({...s,selected:false}))}};
  m=issueOrder(m,{kind:'move',destination:phase.points![0]});
 }
 if(strategy==='logistics'){
  if(!m.placement.producers?.some(p=>p.kind==='navalFoundry')){
   const worker=m.gathering.units.find(u=>u.kind==='worker');m={...m,gathering:{...m.gathering,units:m.gathering.units.map(u=>({...u,selected:u===worker}))}};
   const built=placeBuilding(beginPlacement(m.placement,'navalFoundry'),{x:576,y:640},m.gathering.wood,placementObstacles(m.gathering),{map:m.map,gathering:m.gathering,enemies:m.combat.enemies,technology:technologyFor(m,'player')});
   if(built.gathering)m={...m,gathering:built.gathering,placement:built.placement,map:built.map!};
  }
  for(const kind of ['convoyService','navalLogistics'] as const)m={...m,...startResearch(m.gathering,m.research!,m.placement,kind)};
  m=trainShip(m,'cutter');
  if(m.research?.convoyService){for(const kind of ['attack','defense'] as const)m={...m,...startResearch(m.gathering,m.research!,m.placement,kind)};}
  if(phase?.goal==='base'||phase?.goal==='position'){const queued=enqueueProduction(m.gathering,m.soldierProduction,{kind:'barracks',footprint:m.placement.barracks,technology:technologyFor(m,'player')},matchPopulation(m));m={...m,gathering:queued.gathering,soldierProduction:queued.production};}
 }
 return m;
}
export function simulateTidebreak(strategy:'screen'|'logistics',onPhase?:(m:MatchState)=>void){
 let m=prepareSeaBattleTactics(tidebreak());
 // The logistics plan must reserve its real starting bank for the foundry.
 if(strategy==='logistics'){m=tidebreak();for(const [index,u] of m.gathering.units.filter(u=>u.kind==='worker').entries()){const node=index===2?m.gathering.gold!:m.gathering.node;m.gathering={...m.gathering,units:orderUnits(m.gathering.units.map(w=>({...w,selected:w.id===u.id})),node.position,node)};}}
 for(let i=0;i<720*4&&m.outcome==='playing';i++){
  if(i%4===0)m=tidebreakOrders(m,strategy);
  const previous=m.campaignRun!.phase;m=updateMatch(m,.25);if(previous!==m.campaignRun!.phase)onPhase?.(m);
 }
 return m;
}

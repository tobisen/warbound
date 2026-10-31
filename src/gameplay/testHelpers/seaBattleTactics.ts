import {requestTransport} from '../autoTransport';
import {issueOrder} from '../commandOrders';
import {isAir,canAttackDomain} from '../domains';
import {seaBattle} from './seaBattle';
import {updateMatch,type MatchState} from '../match';
import {orderUnits,resourceNodes} from '../gathering';
import {trainShip,commandShips,attackShips} from '../navy';
import {startResearch} from '../research';
import {entityVisible} from '../visibility';
/** Legal orders and paid reinforcements; no health, damage, resources, fog or deaths injected. */
export function prepareSeaBattleTactics(m:MatchState=seaBattle()):MatchState {
 for(const [index,u]of m.gathering.units.filter(u=>u.kind==='worker'&&!(m.campaignMission==='crown-tidebreak-relief'&&!m.campaignRun?.legacyTidebreak&&['unit-1','unit-2'].includes(u.id))).entries()){
  const node=index===2?m.gathering.gold!:m.gathering.node;
  m.gathering={...m.gathering,units:orderUnits(m.gathering.units.map(w=>({...w,selected:w.id===u.id})),node.position,node)};
 }
 for(let i=0;i<3;i++)m=trainShip(m,'warship');
 for(const kind of ['attack','defense'] as const){const result=startResearch(m.gathering,m.research!,m.placement,kind);m={...m,...result};}
 return m;
}
export function seaBattleTacticalOrders(m:MatchState,passage={x:1600,y:480},reinforce=true):MatchState {
 const armed=m.navy!.ships.filter(s=>s.hp>0&&s.role!=='transport'),visible=m.combat.enemies.filter(e=>e.hp>0&&(e.kind==='ship'&&e.navalRole||m.campaignRun!.phase>=2&&(e.role==='archer'||e.buildingType==='harbor'))&&(!m.fog||entityVisible(m.fog,'player',e)));
 const near=visible.sort((a,b)=>Math.min(...armed.map(s=>Math.hypot(s.position.x-a.position.x,s.position.y-a.position.y)))-Math.min(...armed.map(s=>Math.hypot(s.position.x-b.position.x,s.position.y-b.position.y))))[0];
 if(near){m={...m,navy:{...m.navy!,ships:m.navy!.ships.map(s=>({...s,selected:s.role!=='transport'&&canAttackDomain(s,near,m.factions!.player)&&(s.order.kind!=='attack'||s.order.enemyId!==near.id)}))}};m={...m,navy:attackShips(m,near.id)};}
 else {
  const goal=m.campaignRun!.phase===0?passage:{x:2288,y:880};
  const idle=armed.some(s=>s.order.kind==='idle'&&Math.hypot(s.position.x-goal.x,s.position.y-goal.y)>96);
  if(idle){m={...m,navy:{...m.navy!,ships:m.navy!.ships.map(s=>({...s,selected:s.role!=='transport'&&s.order.kind==='idle'}))}};m={...m,navy:commandShips(m,goal)};}
 }
 if(m.campaignRun!.phase>=2){
  const ferry=m.navy!.ships.find(s=>s.id==='ship-15');
  const home=m.gathering.units.some(u=>u.kind==='soldier'&&!isAir(u)&&u.position.x<768);
  if(ferry&&!ferry.transfer){
   if(home&&!ferry.passengers?.length){
    if(ferry.position.x>900){if(ferry.order.kind==='idle'){m={...m,navy:{...m.navy!,ships:m.navy!.ships.map(s=>({...s,selected:s.id===ferry.id}))}};m={...m,navy:commandShips(m,{x:800,y:640})};}}
    else {m={...m,gathering:{...m.gathering,units:m.gathering.units.map(u=>({...u,selected:u.kind==='soldier'&&!isAir(u)&&u.position.x<768}))}};m=requestTransport(m,ferry.id,'load');}
   }else if(ferry.passengers?.length){
    if(ferry.position.x<2300){if(ferry.order.kind==='idle'){m={...m,navy:{...m.navy!,ships:m.navy!.ships.map(s=>({...s,selected:s.id===ferry.id}))}};m={...m,navy:commandShips(m,{x:2384,y:880})};}}
    else m=requestTransport(m,ferry.id,'unload');
   }
  }
  const landed=m.gathering.units.filter(u=>u.kind==='soldier'&&!isAir(u)&&u.position.x>2300);
  if(landed.some(u=>u.order.kind==='idle')){
   m={...m,gathering:{...m.gathering,units:m.gathering.units.map(u=>({...u,selected:u.kind==='soldier'&&!isAir(u)&&u.position.x>2300&&u.order.kind==='idle'}))},navy:{...m.navy!,ships:m.navy!.ships.map(s=>({...s,selected:false}))}};
   m=issueOrder(m,{kind:'attack-move',destination:m.campaignRun!.phase===2?{x:2496,y:864}:{x:2704,y:464}});
  }
 }
 // Sustain paid reinforcement only from the real delivered economy and supply.
 if(reinforce&&m.waves.elapsedSeconds%4<.25)m=trainShip(m,'warship');
 return m;
}
export function simulateSeaBattle(seconds=720,onPhase?:(m:MatchState)=>void){
 let m=prepareSeaBattleTactics(),peak=0;const snapshots=[];
 for(let i=0;i<seconds*4&&m.outcome==='playing';i++){
  if(i%4===0)m=seaBattleTacticalOrders(m);
  const previous=m.campaignRun!.phase;m=updateMatch(m,.25);if(previous!==m.campaignRun!.phase)onPhase?.(m);peak=Math.max(peak,m.combat.projectiles?.length??0);
  if(i%240===239)snapshots.push({seconds:m.waves.elapsedSeconds,ships:m.navy!.ships.length,enemyShips:m.combat.enemies.filter(e=>e.kind==='ship').length,phase:m.campaignRun!.phase,baseHP:m.combat.baseHP,wood:m.gathering.wood,gold:m.gathering.goldBalance});
 }
 return {match:m,peak,snapshots};
}

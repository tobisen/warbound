import {legacyTidebreakPlan} from '../config/tidebreakObjectives';
import {tidebreakMission} from '../config/seaBattle';
import {hasEnemyBase} from './enemyBases';
import {seriesMissionPlan,type CampaignId} from '../config/campaignSeries';
import {campaignPlans,type CampaignPhase} from '../config/campaignPhases';
import {scenarioWaves} from '../config/scenarios';
import {operationFor} from '../config/operations';
import {isExplored} from './fog';
import {isAir} from './domains';
import {passengerUnits} from './navy';
import {operationOutcome} from './operations';
import type {MatchState} from './match';
export interface CampaignRun {version:1;campaignId?:CampaignId;phase:number;legacyTidebreak?:true;navalHoldStartedSeconds?:number;waveStartedSeconds?:number}
export function campaignPlan(m:MatchState){return m.campaignMission===tidebreakMission&&m.campaignRun?.legacyTidebreak?legacyTidebreakPlan:m.campaignMission&&m.campaignRun?m.campaignRun.campaignId?seriesMissionPlan(m.campaignMission,m.campaignRun.campaignId):campaignPlans[m.campaignMission]:undefined;}
export function campaignPhase(m:MatchState){return campaignPlan(m)?.phases[m.campaignRun!.phase];}
export function campaignPhaseMet(m:MatchState,p:CampaignPhase):boolean{
 const land=m.gathering.units.filter(u=>u.kind==='soldier'&&(u.hp??0)>0&&!isAir(u));
 switch(p.goal){
  case 'blockade':return controlsBlockade(m,p)&&m.campaignRun?.navalHoldStartedSeconds!==undefined&&m.waves.elapsedSeconds-m.campaignRun.navalHoldStartedSeconds+1e-9>=(p.seconds??20);
  case 'embark':return p.unitIds!.every(id=>passengerUnits(m.navy).some(u=>u.id===id&&(u.hp??0)>0));
  case 'evacuate':return p.unitIds!.every(id=>m.gathering.units.some(u=>u.id===id&&(u.hp??0)>0&&Math.hypot(u.position.x-p.points![0].x,u.position.y-p.points![0].y)<=224));
  case 'tutorial':return m.tutorial?.step===6;
  case 'force':return [...m.gathering.units,...passengerUnits(m.navy)].filter(u=>u.kind==='soldier'&&(u.archetype??'soldier')===p.role&&(u.hp??0)>0).length>=(p.count??1);
  case 'research':return (m.research?.[p.research!]??0)>0;
  case 'enemy-fleet':return !m.combat.enemies.some(e=>e.hp>0&&e.kind==='ship'&&e.navalRole&&e.navalRole!=='transport');
  case 'sea-position':return p.points!.every(point=>(m.navy?.ships??[]).filter(s=>s.hp>0&&s.role!=='transport'&&Math.hypot(s.position.x-point.x,s.position.y-point.y)<=160).length>=(p.count??1)&&!m.combat.enemies.some(e=>e.hp>0&&e.kind==='ship'&&Math.hypot(e.position.x-point.x,e.position.y-point.y)<=224));
  case 'fleet':return (m.navy?.ships??[]).filter(s=>(s.role??'warship')===p.ship&&s.hp>0).length>=(p.count??1);
  case 'prepare':return !!m.placement.barracks&&(m.placement.barracksHP??1)>0&&(m.placement.construction?.remainingSeconds??0)===0&&[...land,...passengerUnits(m.navy).filter(u=>u.kind==='soldier'&&(u.hp??0)>0&&!isAir(u))].length>=2;
  case 'explore':return !!m.fog&&p.points!.every(point=>isExplored(m.fog!,'player',point));
  case 'waves':return m.waves.nextWave===scenarioWaves(m.scenario!,m.difficulty!).length&&!m.combat.enemies.some(e=>e.hp>0&&e.kind!=='base');
  case 'position':return p.points!.every(point=>land.some(u=>Math.hypot(u.position.x-point.x,u.position.y-point.y)<=64));
  case 'expand':return p.points!.every(point=>(m.placement.bases??[]).some(b=>b.hp>0&&b.construction.remainingSeconds===0&&Math.hypot(b.footprint.x+b.footprint.width/2-point.x,b.footprint.y+b.footprint.height/2-point.y)<=96));
  case 'base':return !hasEnemyBase(m.combat,m.map);
  case 'transport':return !!m.navy?.harbor&&m.navy.harbor.hp>0&&m.navy.harbor.construction.remainingSeconds===0&&m.navy.ships.some(s=>s.role==='transport'&&s.hp>0);
  case 'guards':return !!operationFor(m.scenario)&&operationFor(m.scenario)!.guards.every(g=>!m.combat.enemies.some(e=>e.id===g.id&&e.hp>0));
  case 'operation':return operationOutcome(m)==='victory';
 }
}
export function controlsBlockade(m:MatchState,p:CampaignPhase):boolean {return p.points!.every(point=>(m.navy?.ships??[]).filter(s=>s.hp>0&&s.role!=='transport'&&s.role!=='survey'&&s.role!=='tender'&&Math.hypot(s.position.x-point.x,s.position.y-point.y)<=160).length>=(p.count??3)&&!m.combat.enemies.some(e=>e.hp>0&&e.kind==='ship'&&Math.hypot(e.position.x-point.x,e.position.y-point.y)<=224));}
export function navalMissionLost(m:MatchState):boolean {return m.campaignMission===tidebreakMission&&!m.campaignRun?.legacyTidebreak&&['unit-1','unit-2'].some(id=>![...m.gathering.units,...passengerUnits(m.navy)].some(u=>u.id===id&&(u.hp??0)>0));}
/** Permanent phase completion is also the one-shot transition ledger. No reward respawns. */
export function advanceCampaignPhases(m:MatchState):MatchState{
 const plan=campaignPlan(m);if(!plan||m.combat.baseHP<=0||operationOutcome(m)==='defeat')return m;
 const current=campaignPhase(m),hold=current?.goal==='blockade'&&controlsBlockade(m,current)?m.campaignRun!.navalHoldStartedSeconds??m.waves.elapsedSeconds:undefined;
 if(hold!==m.campaignRun!.navalHoldStartedSeconds)m={...m,campaignRun:{...m.campaignRun!,navalHoldStartedSeconds:hold}};
 let phase=m.campaignRun!.phase;
 while(phase<plan.phases.length&&campaignPhaseMet(m,plan.phases[phase]))phase++;
 const waveStartedSeconds=plan.phases.some(p=>p.goal==='waves')&&phase>=2?(m.campaignRun!.waveStartedSeconds??m.waves.elapsedSeconds):undefined;
 return phase===m.campaignRun!.phase&&waveStartedSeconds===m.campaignRun!.waveStartedSeconds?m:{...m,campaignRun:{...m.campaignRun!,version:1,phase,...(phase!==m.campaignRun!.phase?{navalHoldStartedSeconds:undefined}:{}),...(waveStartedSeconds!==undefined?{waveStartedSeconds}:{})}};
}
export function campaignObjective(m:MatchState):string{
 const plan=campaignPlan(m);if(!plan)return '';
 const phase=m.campaignRun!.phase;
 return phase===plan.phases.length?'All campaign objectives complete.':`Phase ${phase+1}/${plan.phases.length} · ${plan.phases[phase].text}${plan.phases[phase].goal==='blockade'?` Hold: ${Math.floor(m.campaignRun!.navalHoldStartedSeconds===undefined?0:m.waves.elapsedSeconds-m.campaignRun!.navalHoldStartedSeconds)}/${plan.phases[phase].seconds}s.`:''}${phase>0?' Previous phase complete.':''}`;
}

export function campaignWaveSchedule(m:MatchState){const schedule=scenarioWaves(m.scenario??'survival',m.difficulty??'normal');if(!m.campaignRun||!campaignPlan(m)?.phases.some(p=>p.goal==='waves'))return schedule;const start=m.campaignRun.waveStartedSeconds;return schedule.map(w=>({...w,atSeconds:start===undefined?Infinity:start+w.atSeconds}));}

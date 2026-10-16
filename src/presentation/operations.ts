import {campaignPhase,campaignObjective} from '../gameplay/campaignPhases';
import {operationFor} from '../config/operations';
import {isVisible,isExplored} from '../gameplay/fog';
import {controlsCapture} from '../gameplay/operations';
import {passengerUnits} from '../gameplay/navy';
import type {MatchState} from '../gameplay/match';
export function operationMessage(m:MatchState):string{
 const objective=campaignObjective(m);if(objective)return objective;
 const o=operationFor(m.scenario);if(!o)return '';
 const remaining=o.guards.filter(g=>m.combat.enemies.some(e=>e.id===g.id&&e.hp>0)).length;
 if(o.kind==='escort')return `Ridge Courier: ${[...m.gathering.units,...passengerUnits(m.navy)].some(u=>u.id===o.courier.id&&(u.hp??0)>0)?'alive':'lost'} · Guards remaining: ${remaining}/2 · Safe zone (${o.zone.x},${o.zone.y}), radius ${o.radius}px.`;
 if(o.kind==='rescue')return `Camp guards remaining: ${remaining}/2 · Bring a living combat unit to (${o.zone.x},${o.zone.y}), radius ${o.radius}px.`;
 return `Banner hold: ${(m.capture?.holdSeconds??0).toFixed(1)}/${o.holdSeconds}s · ${controlsCapture(m)?'Uncontested':'Bring land combatants; enemies or absence reset time'} · Zone (${o.zone.x},${o.zone.y}).`;
}
/** Briefed locations are public mission data, not visibility into hidden entities. */
export function missionTargets(m:MatchState){
 const phase=campaignPhase(m),operation=operationFor(m.scenario);
 const points=phase?.points??((!m.campaignRun||phase?.goal==='operation')&&operation?[operation.zone]:[]);
 return points.filter(point=>phase?.goal!=='explore'||!m.fog||!isExplored(m.fog,'player',point)).map((position,index)=>({position:{...position},radius:phase?.goal==='expand'?96:phase?.goal==='position'?64:operation&&phase?.goal==='operation'?operation.radius:24,color:0xffdf73,label:`Goal ${index+1} (${position.x},${position.y})`}));
}
export function operationMarkers(m:MatchState){
 const targets=missionTargets(m),o=operationFor(m.scenario);if(!o)return targets;
 const markers:{position:{x:number;y:number};radius:number;color:number;label:string}[]=[...targets];
 if(!targets.some(t=>t.position.x===o.zone.x&&t.position.y===o.zone.y)&&(!m.fog||isExplored(m.fog,'player',o.zone)))markers.push({position:{...o.zone},radius:o.radius,color:0xd5b66b,label:o.kind==='escort'?'Safe Zone':o.kind==='rescue'?'Rescue Camp':'Coastal Banner'});
 if(o.kind==='escort'){const courier=m.gathering.units.find(u=>u.id===o.courier.id&&(u.hp??0)>0);if(courier)markers.push({position:{...courier.position},radius:18,color:0xd5b66b,label:o.courier.name});}
 for(const guard of o.guards){const enemy=m.combat.enemies.find(e=>e.id===guard.id);if(enemy&&enemy.hp>0&&(!m.fog||isVisible(m.fog,'player',enemy.position)))markers.push({position:{...enemy.position},radius:18,color:0xf47c70,label:guard.name});}
 return markers;
}
export function renderOperation(m:MatchState):void{const el=document.getElementById('operation-objective')!,message=operationMessage(m);if(el.textContent!==message)el.textContent=message;el.hidden=!message;if(m.campaignRun)document.getElementById('match-status')!.hidden=true;}

export function renderMissionStep(m:MatchState):void{
 const el=document.getElementById('mission-step')!;
 const message=m.outcome==='victory'?'Victory — mission complete.':m.outcome==='defeat'?'Defeat — mission ended.':operationMessage(m)||document.getElementById('tutorial-objective')!.textContent||document.getElementById('match-status')!.textContent||'';
 if(el.textContent!==message)el.textContent=message;
 el.hidden=!message;
}

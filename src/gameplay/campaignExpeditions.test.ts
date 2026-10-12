import {expect,it} from 'vitest';
import {expandedCampaignMissions} from '../config/campaignExpeditions';
import {campaignMissions,campaignDetails} from '../config/campaign';
import {campaignMissionsFor,identityFor} from '../config/campaignSeries';
import {factions,factionIds,type UnitRole} from '../config/factions';
import {scenarioWaves} from '../config/scenarios';
import {operationFor} from '../config/operations';
import {campaignMissionStatus,startCampaignMission,completeCampaignMission,nextCampaignMissionId,validateCampaignProgress} from './campaign';
import {campaignPhaseMet,advanceCampaignPhases} from './campaignPhases';
import {createMatch,updateMatch,type MatchState} from './match';
import {encodeSave,decodeSave} from './save';
import {fogIndex} from './fog';
import {cleanDestroyed} from './destruction';
import {bodyFits,overlaps} from './map';
import {planRoute} from './navigation';
import {domainBodyFits} from './terrainNavigation';
import {beginPlacement,placeBuilding} from './placement';
import type {CampaignPhase} from '../config/campaignPhases';
const view={camera:{x:0,y:0},building:null};
const admitted=(mission:typeof expandedCampaignMissions[number])=>startCampaignMission({version:1,identity:identityFor(mission.faction,'normal'),completed:campaignMissionsFor(identityFor(mission.faction,'normal').campaignId).map(m=>m.id)},mission.id,'normal',{player:mission.faction,enemy:'clans'})!;
const roundtrip=(m:MatchState)=>{const r=decodeSave(encodeSave(m,view));expect(r.ok,r.ok?'':r.error).toBe(true);if(!r.ok)throw Error(r.error);return r.match;};
function troops(m:MatchState,role:UnitRole,count:number,point={x:600,y:480}){
 for(let i=0;i<count;i++)m.gathering.units.push({id:`unit-${m.production.nextUnitNumber++}`,owner:'player',kind:'soldier',...(role==='soldier'?{}:{archetype:role as Exclude<UnitRole,'worker'|'soldier'>}),hp:factions[m.factions!.player].units[role].hp,position:{...point},target:{...point},selected:false,cargo:0,order:{kind:'idle'}});
 m.soldierProduction.nextUnitNumber=m.production.nextUnitNumber;
 for(const b of m.placement.bases??[])b.production.nextUnitNumber=m.production.nextUnitNumber;
}
/** Explicit component preconditions, not injected units presented as a paid playthrough. */
function satisfy(m:MatchState,p:CampaignPhase):MatchState{
 const f=factions[m.factions!.player];
 if(p.goal==='prepare'){
  m.gathering.wood=200;m.gathering.goldBalance=100;m.gathering.units[0].selected=true;
  const built=placeBuilding(beginPlacement(m.placement,'barracks'),{x:512,y:384},m.gathering.wood,[],{map:m.map,gathering:m.gathering,enemies:m.combat.enemies});
  expect(built.placement.barracks).toBeTruthy();m={...m,map:built.map!,placement:built.placement,gathering:built.gathering!};m.placement.construction={remainingSeconds:0,builderId:null};m.gathering.units[0].order={kind:'idle'};troops(m,'soldier',2);
 }
 if(p.goal==='explore')for(const point of p.points!)m.fog!.teams.player.explored[fogIndex(m.fog!,point)!]=true;
 if(p.goal==='position')for(const point of p.points!)troops(m,'soldier',1,point);
 if(p.goal==='expand')for(const point of p.points!){const footprint={x:point.x-32,y:point.y-32,width:64,height:64};m.placement.bases=[{id:'base-1',owner:'player',hp:f.buildings.base.hp,footprint,construction:{remainingSeconds:0,builderId:null},production:{remainingSeconds:null,nextUnitNumber:m.production.nextUnitNumber}}];m.placement.nextBaseNumber=2;m.map={...m.map,revision:m.map.revision+1,obstacles:[...m.map.obstacles,footprint]};}
 if(p.goal==='force')troops(m,p.role!,p.count!);
 if(p.goal==='research')m.research={...m.research!,[p.research!]:1};
 if(p.goal==='transport'||p.goal==='fleet'){
  const footprint={x:672,y:320,width:64,height:64};if(!m.navy?.harbor)m.map={...m.map,revision:m.map.revision+1,obstacles:[...m.map.obstacles,footprint]};
  m.navy={harbor:{owner:'player',hp:f.naval.harbor.hp,footprint,construction:{remainingSeconds:0,builderId:null}},production:{remainingSeconds:null,nextUnitNumber:1},ships:[]};
  const role=p.goal==='transport'?'transport':p.ship!;for(let i=0;i<(p.count??1);i++)m.navy.ships.push({id:`ship-${i+1}`,kind:'ship',role,owner:'player',hp:f.naval.units[role].hp,position:{x:784,y:400+i*48},target:{x:784,y:400+i*48},selected:false,...(role==='transport'?{passengers:[]}:{}),order:{kind:'idle'}});m.navy.production.nextUnitNumber=m.navy.ships.length+1;
 }
 if(['base','guards','waves','operation'].includes(p.goal)){m=cleanDestroyed({...m,combat:{...m.combat,enemies:m.combat.enemies.map(e=>({...e,hp:0}))}});}
 if(p.goal==='waves')m.waves.nextWave=scenarioWaves(m.scenario!,m.difficulty!).length;
 if(p.goal==='operation'){const o=operationFor(m.scenario)!;if(o.kind==='escort'){const courier=m.gathering.units.find(u=>u.id===o.courier.id)!;courier.position={...o.zone};courier.target={...o.zone};}else troops(m,'soldier',1,o.zone);}
 return m;
}
it('preserves eight legacy operations and gives every race fifteen with seven exclusive IDs',()=>{
 expect(campaignMissions).toHaveLength(8);expect(expandedCampaignMissions).toHaveLength(35);expect(new Set(expandedCampaignMissions.map(m=>m.id)).size).toBe(35);
 for(const faction of factionIds){const identity=identityFor(faction,'normal'),list=campaignMissionsFor(identity.campaignId);expect(list).toHaveLength(15);expect(new Set(list.slice(8).map(m=>'plan' in m&&m.plan.map)).size).toBeGreaterThanOrEqual(5);expect(new Set(list.slice(8).map(m=>'faction' in m&&m.faction))).toEqual(new Set([faction]));
  const progress={version:1 as const,identity,completed:campaignMissions.map(m=>m.id)};expect(campaignMissionStatus(progress,list[8].id)).toBe('available');expect(campaignMissionStatus(progress,list[9].id)).toBe('locked');expect(validateCampaignProgress(progress)).toEqual(progress);
 }
});
it.each(expandedCampaignMissions)('$id has a valid unique start, full phase sequence and Save at every transition',mission=>{
 let m=admitted(mission);expect(m).toBeTruthy();expect(m.map.id).toBe(mission.plan.map);expect(m.factions!.player).toBe(mission.faction);expect(campaignDetails(mission.id).title).toBe(mission.title);expect(campaignDetails(mission.id).briefing.length).toBeGreaterThan(100);m=roundtrip(m);
 const dead={...m,combat:{...m.combat,baseHP:0}};expect(updateMatch(dead,0).outcome).toBe('defeat');
 for(const p of mission.plan.phases){const phase=m.campaignRun!.phase;expect(campaignPhaseMet(m,p),`${mission.id}/${phase} initially unmet`).toBe(false);m=satisfy(m,p);expect(campaignPhaseMet(m,p),`${mission.id}/${phase} satisfied`).toBe(true);m=advanceCampaignPhases(m);expect(m.campaignRun!.phase).toBe(phase+1);m=updateMatch(m,0);m=roundtrip(m);}
 expect(m.outcome).toBe('victory');const identity=identityFor(mission.faction,'normal'),list=campaignMissionsFor(identity.campaignId),progress={version:1 as const,identity,completed:list.map(m=>m.id).filter(id=>id!==mission.id)};
 expect(completeCampaignMission(progress,m).completed).toContain(mission.id);const index=list.findIndex(x=>x.id===mission.id);expect(nextCampaignMissionId(m,progress)).toBe(list[index+1]?.id??null);
 const replay=admitted(mission);expect(replay.campaignRun!.phase).toBe(0);expect(replay.outcome).toBe('playing');expect(replay.gathering.units.filter(u=>u.kind==='soldier')).toHaveLength(0);
 const foreign=expandedCampaignMissions.find(x=>x.faction!==mission.faction)!;expect(startCampaignMission(progress,foreign.id,'normal',{player:mission.faction,enemy:'clans'})).toBeNull();
 if(mission.scenario==='mission-escort'){const lost=admitted(mission);lost.gathering.units=lost.gathering.units.filter(u=>u.id!=='unit-4');expect(updateMatch(lost,0).outcome).toBe('defeat');}
},30000);
it.each(expandedCampaignMissions)('$id coordinates retain land routes, build space and actual operation triggers',mission=>{
 const m=admitted(mission),origin=m.gathering.units[0].position,naval=mission.scenario==='mission-sea';
 for(const p of mission.plan.phases)for(const point of p.points??[]){expect(bodyFits(m.map,point,12),`${mission.id}: land ${JSON.stringify(point)}`).toBe(true);
  const from=naval?(m.map.id==='coast'?{x:960,y:320}:{x:960,y:480}):origin;expect(planRoute({...m.map,bodyHalf:12},from,point).status,`${mission.id}: route ${JSON.stringify(point)}`).not.toBe('blocked');
  if(p.goal==='expand')expect(m.map.obstacles.some(o=>overlaps(o,{x:point.x-32,y:point.y-32,width:64,height:64}))).toBe(false);
 }
 const o=operationFor(m.scenario);if(o){expect(bodyFits(m.map,o.zone,12)).toBe(true);expect(planRoute({...m.map,bodyHalf:12},origin,o.zone).status).not.toBe('blocked');for(const g of o.guards)expect(bodyFits(m.map,g.position,12)).toBe(true);}
 if(naval){expect(domainBodyFits(m.map,'water',{x:784,y:400},16)).toBe(true);expect(bodyFits(m.map,m.map.id==='coast'?{x:960,y:320}:{x:960,y:480},12)).toBe(true);}
},30000);

it('the expansion goal requires a completed living paid base at the authored clearing',()=>{
 let m=admitted(expandedCampaignMissions[0]);const goal=expandedCampaignMissions[0].plan.phases.find(p=>p.goal==='expand')!,point=goal.points![0];
 expect(campaignPhaseMet(m,goal)).toBe(false);m=satisfy(m,goal);expect(campaignPhaseMet(m,goal)).toBe(true);
 m.placement.bases![0].construction.remainingSeconds=1;expect(campaignPhaseMet(m,goal)).toBe(false);
 m.placement.bases![0].construction.remainingSeconds=0;m.placement.bases![0].hp=0;expect(campaignPhaseMet(m,goal)).toBe(false);
 m.placement.bases![0].hp=100;m.placement.bases![0].footprint={x:512,y:384,width:64,height:64};expect(campaignPhaseMet(m,goal)).toBe(false);expect(point.x).toBeGreaterThan(500);
});
it('Save75 rejects foreign or legacy-spoofed expeditions and migrates genuine74',()=>{
 const m=admitted(expandedCampaignMissions[0]),doc=JSON.parse(encodeSave(m,view));
 doc.configVersion='tribute-config-74';expect(decodeSave(JSON.stringify(doc)).ok).toBe(false);
 doc.configVersion='tribute-config-75';doc.state.campaignRun.campaignId=identityFor('clans','normal').campaignId;expect(decodeSave(JSON.stringify(doc)).ok).toBe(false);
 const old=JSON.parse(encodeSave(createMatch('skirmish','normal',undefined,undefined,1,'balanced',undefined,undefined,'regions'),view));old.configVersion='tribute-config-74';expect(decodeSave(JSON.stringify(old)).ok).toBe(true);
});

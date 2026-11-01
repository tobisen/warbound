import {expect,it} from 'vitest';
import {factions,factionIds,factionsForPlayer} from '../config/factions';
import {roleResearchKinds,roleResearchAvailable} from '../config/roleResearch';
import {campaignMissions} from '../config/campaign';
import {identityFor} from '../config/campaignSeries';
import {missionContent} from '../config/campaignContent';
import {actionPanel} from '../presentation/actionPanel';
import {researchHost} from '../presentation/researchPages';
import {technologyView} from '../presentation/technologyView';
import {createMatch,type MatchState} from './match';
import {beginPlacement,placeBuilding,placementError,placementObstacles,type ProducerKind} from './placement';
import {updateConstruction} from './construction';
import {technologyFor,missingPrerequisites} from './productionPrerequisites';
import {hasMainBase} from './extraBases';
import {startBaseUpgrade,advanceBaseUpgrade} from './baseUpgrade';
import {startCampaignMission} from './campaign';
import {researchPrerequisites,researchReason,canResearch,startResearch,updateResearch,researchRecipe,type ResearchKind} from './research';
import {encodeSave,decodeSave} from './save';
import {matchFog} from './matchFog';
import type {BuildingSelection} from './buildingSelection';
import {applyCheat} from './cheats';
import {largeUnitFixture} from './testHelpers/largeUnitFixture';

function build(m:MatchState,kind:ProducerKind|'forge'|'base',finish=false,remote=false):MatchState {
 m.gathering.units=m.gathering.units.map((u,i)=>({...u,selected:i===0}));
 const p=beginPlacement(m.placement,kind),context={gathering:m.gathering,map:m.map,enemies:m.combat.enemies,technology:technologyFor(m,'player')};
 let point;
 for(let y=128;y<992&&!point;y+=32)for(let x=192;x<768;x+=32)if((!remote||Math.hypot(x+32-m.gathering.base.x,y+32-m.gathering.base.y)>=480)&&!placementError(p,{x,y},m.gathering.wood,placementObstacles(m.gathering),context)){point={x,y};break;}
 expect(point,`reachable ${kind} site`).toBeDefined();
 const r=placeBuilding(p,point!,m.gathering.wood,placementObstacles(m.gathering),context);
 expect(r.gathering).toBeDefined();m={...m,placement:r.placement,gathering:r.gathering!,map:r.map!};
 return finish?{...m,...updateConstruction(m.gathering,m.placement,m.map,100)}:m;
}
function load(m:MatchState) {
 m.fog=matchFog(m);const decoded=decodeSave(encodeSave(m,{camera:{x:0,y:0},building:null}));
 expect(decoded.ok,decoded.ok?'':decoded.error).toBe(true);if(!decoded.ok)throw Error(decoded.error);return decoded.match;
}
function reason(m:MatchState,kind:ResearchKind) {return researchReason(m.gathering,m.research!,m.placement,kind,true,hasMainBase(m));}
function start(m:MatchState,kind:ResearchKind) {return {...m,...startResearch(m.gathering,m.research!,m.placement,kind,true,hasMainBase(m))};}

it.each(factionIds)('%s: an unfinished selected expansion cannot hide the completed base for Worker Tools I–III, including Load',faction=>{
 let m=createMatch('skirmish','beginner',factionsForPlayer(faction),'twinwake');m=applyCheat(m,'icanseemyhousefromhere');
 m=build(m,'base');expect(m.placement.bases![0].construction.remainingSeconds).toBeGreaterThan(0);
 for(const level of [0,1,2]) {
  m.research={attack:0,defense:0,workerTools:level,job:null};
  for(const state of [m,load(m)]) {
   expect(reason(state,'workerTools')).toBeNull();
   expect(actionPanel(state,'base-1',true)['research-workerTools']).toMatchObject({visible:true,reason:''});
   const started=start(state,'workerTools'),recipe=researchRecipe(factions[faction],'workerTools',level);
   expect(started.research!.job).toEqual({kind:'workerTools',remainingSeconds:recipe.durationSeconds});
   expect(started.gathering.wood).toBe(state.gathering.wood-recipe.cost.wood);
   expect(started.gathering.goldBalance).toBe(state.gathering.goldBalance!-recipe.cost.gold);
   const restored=load(started);expect(restored.research).toEqual(started.research);
   expect(updateResearch(restored.research!,restored.placement,100,true,faction,hasMainBase(restored)).workerTools).toBe(level+1);
  }
 }
 m.combat.baseHP=0;expect(reason(m,'workerTools')).toBe('Complete main building');expect(start(m,'workerTools').research).toBe(m.research);
 m={...m,...updateConstruction(m.gathering,m.placement,m.map,100)};
 expect(hasMainBase(m)).toBe(true);expect(reason(m,'workerTools')).toBeNull();
});

it.each(factionIds)('%s: completed roles, all research levels, UI and paid admission agree regardless of base level',faction=>{
 let m=largeUnitFixture(faction);m=applyCheat(m,'icanseemyhousefromhere');
 for(const kind of ['barracks','stable','siegeWorks','navalFoundry','drydock','signalTower','navalAcademy','marineBarracks'] as const)m=build(m,kind,true);
 const kinds:ResearchKind[]=['attack','defense','workerTools',...roleResearchKinds.filter(k=>roleResearchAvailable(k,faction))];
 for(const kind of kinds)for(const level of kind==='workerTools'?[0,1,2]:kind==='attack'||kind==='defense'?[0,1]:[0]) {
  const state=structuredClone(m);state.research={attack:0,defense:0,job:null,[kind]:level};
  const host=researchHost(kind,level),selected=state.placement.producers?.find(p=>p.kind===host)?.id??host as BuildingSelection;
  for(const building of researchPrerequisites(factions[faction],kind,level).buildings??[]) {
   const unfinished=structuredClone(state);
   if(building==='base')unfinished.combat.baseHP=0;
   else {
    const primary=unfinished.placement[building as 'forge'];if(primary)primary.construction.remainingSeconds=1;
    for(const site of unfinished.placement.producers??[])if(site.kind===building)site.construction.remainingSeconds=1;
   }
   const missing=building==='base'?'Complete main building':`Complete ${factions[faction].buildingNames[building]}`;
   expect(reason(unfinished,kind)).toBe(missing);
   expect(actionPanel(unfinished,selected,true)[`research-${kind}`].reason).toBe(missing);
   expect(start(unfinished,kind).gathering).toBe(unfinished.gathering);
  }
  expect(missingPrerequisites(factions[faction],researchPrerequisites(factions[faction],kind,level),technologyFor(state,'player'))).toEqual([]);
  expect(actionPanel(state,selected,true)[`research-${kind}`]).toMatchObject({visible:true,reason:''});
  expect(canResearch(state.gathering,state.research!,state.placement,kind,true,hasMainBase(state))).toBe(true);
  const started=start(state,kind);expect(started.research!.job?.kind).toBe(kind);
  const done=updateResearch(started.research!,started.placement,100,true,faction);expect(done[kind]).toBe(level+1);
  expect(start(started,kind).gathering).toBe(started.gathering);
 }
 // Main-building upgrades retain the completed base and its lower-level capabilities.
 m.combat.baseDevelopment={level:1,remainingSeconds:null};
 for(const seconds of [20,30]){m=advanceBaseUpgrade(startBaseUpgrade(m),seconds).match;expect(reason(m,'workerTools')).toBeNull();}
 expect(technologyFor(m,'player').baseLevel).toBe(3);
 expect(missingPrerequisites(factions[faction],{baseLevel:2,buildings:['base']},technologyFor(m,'player'))).toEqual([]);
});

it.each(factionIds)('%s: a ready second academy at another base wins over unfinished/dead instances and survives Save',faction=>{
 let m=largeUnitFixture(faction);m=applyCheat(m,'icanseemyhousefromhere');
 m=build(m,'base',true,true);m=build(m,'academy',true,true);m=build(m,'academy');
 m.placement.academy!.construction.remainingSeconds=1;
 m.research={attack:1,defense:1,job:null};
 const ready=m.placement.producers!.find(p=>p.kind==='academy'&&p.construction.remainingSeconds===0)!;
 expect(ready.footprint).not.toEqual(m.placement.academy!.footprint);
 expect(Math.hypot(ready.footprint.x+32-m.gathering.base.x,ready.footprint.y+32-m.gathering.base.y)).toBeGreaterThanOrEqual(480);
 for(const state of [m,load(m)])for(const kind of ['attack','defense','healerTraining','submarineDesign'] as const){
  expect(actionPanel(state,ready.id,true)[`research-${kind}`].reason).toBe('');
  const started=start(state,kind);expect(started.research!.job?.kind).toBe(kind);expect(load(started).research).toEqual(started.research);
  expect(updateResearch(started.research!,started.placement,100,true,faction)[kind]).toBe((state.research![kind]??0)+1);
 }
 ready.hp=0;
 expect(reason(m,'attack')).toBe(`Complete ${factions[faction].buildingNames.academy}`);
 expect(start(m,'attack').gathering).toBe(m.gathering);
 m.placement.academy!.construction.remainingSeconds=0;
 expect(reason(m,'attack')).toBeNull();
});

it('reports exact missing buildings and resources, preserves exclusivity, campaign unlocks and completed prior research',()=>{
 let m=largeUnitFixture('dwarves');m.research={attack:1,defense:1,job:null};
 expect(reason(m,'siegeShells')).toBe('Complete Naval Foundry');m=applyCheat(m,'icanseemyhousefromhere');m=build(m,'navalFoundry',true);
 expect(reason(m,'siegeShells')).toBe('Complete Siege Foundry');m=build(m,'siegeWorks',true);
 expect(reason(m,'siegeShells')).toBeNull();
 expect(technologyView(m).nodes.find(n=>n.id==='research-siegeShells')!.missing).toEqual([]);
 m.gathering.goldBalance=0;expect(reason(m,'siegeShells')).toBe('Not enough gold');expect(start(m,'siegeShells').gathering).toBe(m.gathering);
 m.gathering.goldBalance=10000;const started=start(m,'siegeShells');expect(reason(started,'preciseShells')).toBe('Exclusive alternative already chosen');
 for(const faction of factionIds) {
  let campaign=startCampaignMission({version:1,identity:identityFor(faction,'normal'),completed:campaignMissions.map(m=>m.id)},'the-siege','normal',factionsForPlayer(faction))!;
  campaign=applyCheat(campaign,'icanseemyhousefromhere');
  expect(reason(campaign,'attack')).toMatch(/Complete/);campaign=build(campaign,'forge',true);
  expect(reason(campaign,'attack')).toBeNull();expect(start(campaign,'attack').research!.job?.kind).toBe('attack');
  campaign.research!.attack=1;
  expect(reason(campaign,'attack')).toBe('Locked for this campaign mission');
  expect(actionPanel(campaign,'academy',true)['research-attack'].reason).toBe(reason(campaign,'attack'));
  expect(start(campaign,'attack').gathering).toBe(campaign.gathering);
  expect(reason(campaign,'healerTraining')).toBe('Locked for this campaign mission');
  expect(actionPanel(campaign,'academy',true)['research-healerTraining'].reason).toBe(reason(campaign,'healerTraining'));
  expect(load(campaign).gathering.campaignContent).toEqual(missionContent('the-siege'));
 }
},15000);

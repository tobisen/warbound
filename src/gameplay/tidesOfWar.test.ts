import {expect,it} from 'vitest';
import {factions,factionIds} from '../config/factions';
import {factionResearchKinds,roleResearchAvailable,roleResearchConfig} from '../config/roleResearch';
import {createMatch} from './match';
import {startResearch,canResearch,updateResearch} from './research';
import {serviceFleet,transportCapacity} from './fleetService';
import {visionObservers} from './matchFog';
import {prepareNavalCombat,prepareEnemySubmarines} from './navalCombat';
import {advanceProjectiles} from './projectiles';
import {createNavy,type Ship} from './navy';
import {decodeSave,encodeSave} from './save';
import {actionPanel} from '../presentation/actionPanel';
import {prepareArmyPlan} from './combinedArmy';
import {tidebreakMission} from '../config/seaBattle';
import {campaignMissionsFor,identityFor} from '../config/campaignSeries';
import {startCampaignMission} from './campaign';
const view={camera:{x:0,y:0},building:null};
function ready(faction:typeof factionIds[number]='crown'){
 const m=createMatch('skirmish','normal',{player:faction,enemy:'clans'});
 m.gathering.wood=800;m.gathering.goldBalance=800;
 const footprint={x:512,y:384,width:64,height:64};
 m.placement.producers=[{id:'producer-1',kind:'navalFoundry',owner:'player',hp:factions[faction].buildings.navalFoundry.hp,footprint,construction:{remainingSeconds:0,builderId:null},production:{remainingSeconds:null,nextUnitNumber:4}}];m.placement.nextProducerNumber=2;m.map.obstacles.push(footprint);
 m.placement.siegeWorks={id:'siegeWorks',owner:'player',hp:180,footprint:{x:608,y:384,width:64,height:64},construction:{remainingSeconds:0,builderId:null},production:{remainingSeconds:null,nextUnitNumber:4}};m.map.obstacles.push(m.placement.siegeWorks.footprint);return m;
}
it.each(factionIds)('%s pays for only its own new choices and persists active/completed research',faction=>{
 for(const kind of factionResearchKinds){let m=ready(faction);const allowed=roleResearchAvailable(kind,faction),cfg=roleResearchConfig[kind];
  expect(canResearch(m.gathering,m.research!,m.placement,kind)).toBe(allowed);
  expect(actionPanel(m,'base',true)[`research-${kind}`].visible).toBe(allowed);
  const before=m.gathering.wood;m={...m,...startResearch(m.gathering,m.research!,m.placement,kind)};
  if(!allowed){expect(m.gathering.wood).toBe(before);continue;}
  expect(m.gathering.wood).toBe(before-cfg.cost.wood);let save=decodeSave(encodeSave(m,view));expect(save.ok,save.ok?'':save.error).toBe(true);
  m.research=updateResearch(m.research!,m.placement,cfg.durationSeconds,true,faction);expect(m.research[kind]).toBe(1);
  expect(canResearch(m.gathering,m.research,m.placement,kind)).toBe(false);save=decodeSave(encodeSave(m,view));expect(save.ok,save.ok?'':save.error).toBe(true);
 }
});
it('Dwarf ammunition locks its alternative while queued, active and completed; forged saves are rejected',()=>{
 let m=ready('dwarves');m={...m,...startResearch(m.gathering,m.research!,m.placement,'siegeShells')};
 expect(canResearch(m.gathering,m.research!,m.placement,'preciseShells')).toBe(false);
 m.research=updateResearch(m.research!,m.placement,28,true,'dwarves');expect(canResearch(m.gathering,m.research,m.placement,'preciseShells')).toBe(false);
 m.research.preciseShells=1;expect(()=>encodeSave(m,view)).toThrow('exclusive research');
 const queued=ready('dwarves');queued.research!.job={kind:'navalLogistics',remainingSeconds:30};queued.research!.queue=['preciseShells'];expect(canResearch(queued.gathering,queued.research!,queued.placement,'siegeShells')).toBe(false);
});
function ship(role:Ship['role']='warship'):Ship{return {id:'ship-1',kind:'ship',role,hp:60,owner:'player',selected:false,position:{x:800,y:700},target:{x:800,y:700},order:{kind:'idle'}};}
it('Convoy Service repairs only docked idle living hulls/passengers, charges both resources and never resurrects',()=>{
 const m=ready();m.research!.convoyService=1;m.navy={...createNavy(),harbor:{owner:'player',hp:160,footprint:{x:704,y:640,width:64,height:64},construction:{remainingSeconds:0,builderId:null}}};
 const ferry={...ship('transport'),passengers:[{...m.gathering.units[0],hp:10}]};m.navy.ships=[ferry,{...ship(),id:'ship-2',order:{kind:'move'}}];const next=serviceFleet(m,2);
 expect(next.navy!.ships[0].hp).toBe(68);expect(next.navy!.ships[0].passengers![0].hp).toBe(14);expect(next.navy!.ships[1].hp).toBe(60);
 expect(m.gathering.wood-next.gathering.wood).toBeCloseTo(3);expect(m.gathering.goldBalance!-next.gathering.goldBalance!).toBeCloseTo(1.2);
 m.gathering.wood=0;expect(serviceFleet(m,100).navy!.ships[0].hp).toBe(60);m.navy.ships[0].hp=0;expect(serviceFleet(m,100).navy!.ships[0].hp).toBe(0);
});
it('Orc ramps and Elf Tidewatch change logistics/vision without granting global information',()=>{
 expect(transportCapacity('clans',{assaultRamps:1})).toBe(6);expect(transportCapacity('clans',{})).toBe(4);expect(transportCapacity('crown',{assaultRamps:1})).toBe(4);
 const m=ready('elves');m.research!.tidewatch=1;m.navy={...createNavy(),ships:[ship(),{...ship('transport'),id:'ship-2'}]};
 expect(visionObservers(m).find(o=>o.id==='ship-1')).toMatchObject({radius:288,detectorRadius:192});expect(visionObservers(m).find(o=>o.id==='ship-2')!.detectorRadius).toBe(0);
 expect(factions.clans.naval.units.warship.targets).toEqual(['sea','building']);expect(factions.elves.naval.units.warship.targets).toEqual(['sea','air']);
});
it('Bombard chooses area control or building damage; volatile torpedoes damage sea targets only and cost own hull symmetrically',()=>{
 const targets=[{id:'enemy-ship-1',kind:'ship' as const,hp:200,position:{x:840,y:700}},{id:'enemy-ship-2',kind:'ship' as const,hp:200,position:{x:856,y:716}},{id:'enemy-produced-1',kind:'unit' as const,hp:200,position:{x:840,y:700}}];
 for(const faction of ['dwarves','goblins'] as const){const role=faction==='dwarves'?'bombard':'submarine',research={attack:0,defense:0,job:null,...(faction==='dwarves'?{siegeShells:1}:{volatileTorpedoes:1})};const navy={...createNavy(),ships:[{...ship(role),order:{kind:'attack' as const,enemyId:'enemy-ship-1'}}]};
  const result=prepareNavalCombat(navy,targets,.1,undefined,1,1,()=>true,factions[faction].naval.units.warship,faction,research);expect(result.shots).toHaveLength(1);expect(result.shots[0].projectile.splashRadius).toBe(48);
  const damage=advanceProjectiles(result.shots.map(s=>s.projectile),targets,1).damage;expect(damage.has('enemy-ship-1')).toBe(true);expect(damage.has('enemy-ship-2')).toBe(true);expect(damage.has('enemy-produced-1')).toBe(false);
  expect(result.navy!.ships[0].hp).toBe(faction==='goblins'?56:60);
  if(faction==='goblins'){navy.ships[0].hp=4;expect(prepareNavalCombat(navy,targets,10,undefined,1,1,()=>true,factions[faction].naval.units.warship,faction,research).shots).toHaveLength(0);
   const ai=prepareEnemySubmarines([{id:'enemy-ship-1',kind:'ship',navalRole:'submarine',position:{x:800,y:700},hp:60,order:{kind:'defend',targetId:'ship-1'}}],[{id:'ship-1',kind:'ship',owner:'player',domain:'sea',hp:90,footprint:{x:824,y:684,width:32,height:32}}],.1,undefined,1,'goblins',1,()=>true,research);expect(ai.enemies[0].hp).toBe(56);expect(ai.shots[0].projectile.splashRadius).toBe(48);
  }
 }
 const r=prepareNavalCombat({...createNavy(),ships:[{...ship('bombard'),order:{kind:'attack',enemyId:'enemy-ship-1'}}]},targets,.1,undefined,1,1,()=>true,factions.dwarves.naval.units.warship,'dwarves',{attack:0,defense:0,job:null,preciseShells:1});expect(r.shots[0].projectile.damageByDomain?.building).toBe(3);expect(r.shots[0].projectile.splashRadius).toBeUndefined();
});
it('Fleet/Siege doctrines alter paid composition weights and survive strict Save',()=>{
 const fleet=createMatch('skirmish','easy',undefined,'coast',1,'fleet'),siege=createMatch('skirmish','easy',undefined,'coast',1,'siege');
 expect(prepareArmyPlan(fleet).armyPlan!.weights.scout).toBe(2);expect(prepareArmyPlan(siege).armyPlan!.weights.ballista).toBe(4);
 for(const m of [fleet,siege]){const save=decodeSave(encodeSave(m,view));expect(save.ok,save.ok?'':save.error).toBe(true);}
});
it('Tidebreak is a separate, unlockable phased campaign expedition with legal starting fleets and strict Save',()=>{
 const identity=identityFor('crown','normal'),missions=campaignMissionsFor(identity.campaignId),progress={version:1 as const,identity,completed:missions.filter(m=>m.id!==tidebreakMission).map(m=>m.id)};
 const m=startCampaignMission(progress,tidebreakMission,'normal',{player:'crown',enemy:'clans'})!;expect(m.factions!.enemy).toBe('dwarves');expect(m.navy!.ships).toHaveLength(16);expect(m.campaignRun!.phase).toBe(0);
 const save=decodeSave(encodeSave(m,view));expect(save.ok,save.ok?'':save.error).toBe(true);
});

import {loadTransport,unloadTransport} from './transport';
import {matchFog} from './matchFog';
import {createEnemyProduction,updateEnemyProduction} from './enemyProduction';
it('six Orc passengers board, persist and land on a straight visible shore; missing ramps rejects the overloaded save',()=>{
 let m=createMatch('skirmish','beginner',{player:'clans',enemy:'crown'},'islands');m.research!.assaultRamps=1;
 m.gathering.units=Array.from({length:6},(_,i)=>({...m.gathering.units[0],id:`unit-${i+1}`,selected:true,position:{x:656+(i%2)*32,y:400+Math.floor(i/2)*32},target:{x:656+(i%2)*32,y:400+Math.floor(i/2)*32},order:{kind:'idle' as const}}));m.production.nextUnitNumber=m.soldierProduction.nextUnitNumber=7;
 m.navy={...createNavy(),production:{remainingSeconds:null,nextUnitNumber:2},ships:[{...ship('transport'),hp:100,selected:true,passengers:[],position:{x:720,y:432},target:{x:720,y:432}}]};m.fog=matchFog(m);m.fog.revealed=true;m.fog.teams.player.visible.fill(true);m.fog.teams.player.explored.fill(true);
 m=loadTransport(m,'ship-1');expect(m.navy!.ships[0].passengers).toHaveLength(6);expect(m.gathering.units).toHaveLength(0);
 const raw=encodeSave(m,view),loaded=decodeSave(raw);expect(loaded.ok,loaded.ok?'':loaded.error).toBe(true);
 const doc=JSON.parse(raw);delete doc.state.research.assaultRamps;expect(decodeSave(JSON.stringify(doc)).ok).toBe(false);
 m=unloadTransport(m,'ship-1',{x:688,y:432});expect(m.navy!.ships[0].passengers).toHaveLength(0);expect(m.gathering.units).toHaveLength(6);
});
it('Fleet and Siege produce different paid armies from the same mature economy and legal prerequisites',()=>{
 const result=(profile:'fleet'|'siege')=>{const m=prepareArmyPlan(createMatch('skirmish','normal',{player:'crown',enemy:'clans'},'arena',1,profile)),base=m.combat.enemies.find(e=>e.kind==='base')!;
 const buildings=(['siegeWorks','aviary','academy','stable'] as const).map(kind=>({...base,id:`enemy-${kind}`,kind:'building' as const,buildingType:kind,construction:{remainingSeconds:0,builderId:null}}));
 const state={...createEnemyProduction(undefined,true),wood:1500,gold:1500,cap:100,spent:{wood:0,gold:0}};
 const r=updateEnemyProduction(state,{...m.combat,enemies:[base,...buildings]},m.gathering,m.map,250,'clans',{armyPlan:m.armyPlan,technology:{baseLevel:3,buildings:['base','barracks','forge','farm','stable','academy','aviary','siegeWorks'],research:{attack:2,defense:2}},site:{...base,construction:{remainingSeconds:0,builderId:null}},population:{cap:100,used:0,reserved:0}});
 expect(r.state.wood+r.state.spent!.wood).toBe(1500);expect(r.state.gold+r.state.spent!.gold).toBe(1500);return r.combat.enemies.filter(e=>e.role);
 };
 const fleet=result('fleet'),siege=result('siege');expect(siege.filter(e=>e.role==='ballista'||e.role==='catapult').length).toBeGreaterThan(fleet.filter(e=>e.role==='ballista'||e.role==='catapult').length);expect(fleet.filter(e=>e.role==='scout').length).toBeGreaterThan(siege.filter(e=>e.role==='scout').length);
});

import {serviceEnemyFleet} from './fleetService';
it('AI Human dock service spends the same real bank and preserves its expense ledger',()=>{
 const m=createMatch('skirmish','normal',{player:'clans',enemy:'crown'},'coast');m.enemyPolicy!.research.convoyService=1;m.enemyProduction!.wood=10;m.enemyProduction!.gold=10;const spent={...m.enemyProduction!.spent!};
 m.combat.enemies.push({id:'enemy-harbor',kind:'building',buildingType:'harbor',hp:160,position:{x:736,y:672},footprint:{x:704,y:640,width:64,height:64},construction:{remainingSeconds:0,builderId:null}},{id:'enemy-ship-1',kind:'ship',navalRole:'warship',hp:60,position:{x:800,y:700},order:{kind:'idle'}});
 const r=serviceEnemyFleet(m,2);expect(r.combat.enemies.at(-1)!.hp).toBe(68);expect(r.enemyProduction!.wood).toBe(8);expect(r.enemyProduction!.gold).toBeCloseTo(9.2);expect(r.enemyProduction!.spent!.wood).toBe((spent.wood??0)+2);
});
it.each(['dwarves','goblins'] as const)('strict Save accepts researched %s naval splash in flight and rejects unearned splash',faction=>{
 const m=createMatch('skirmish','normal',{player:faction,enemy:'clans'},'islands'),role=faction==='dwarves'?'bombard':'submarine',kind=faction==='dwarves'?'siegeShells':'volatileTorpedoes';m.research![kind]=1;
 const own={...ship(role),position:{x:720,y:512},target:{x:720,y:512},order:{kind:'attack' as const,enemyId:'enemy-ship-1'}};
 const target={id:'enemy-ship-1',kind:'ship' as const,owner:'enemy' as const,navalRole:'warship' as const,hp:100,position:{x:752,y:512},order:{kind:'idle' as const}};
 m.navy={...createNavy(),ships:[own],production:{remainingSeconds:null,nextUnitNumber:2}};m.enemyNaval!.production.nextUnitNumber=2;m.combat.enemies.push(target);
 const result=prepareNavalCombat(m.navy,[target],.1,undefined,1,1,()=>true,factions[faction].naval.units.warship,faction,m.research);m.navy=result.navy;m.combat.projectiles=result.shots.map(s=>s.projectile);m.combat.nextProjectileNumber=result.nextProjectileNumber;
 const raw=encodeSave(m,view),saved=decodeSave(raw);expect(saved.ok,saved.ok?'':saved.error).toBe(true);const doc=JSON.parse(raw);delete doc.state.research[kind];expect(decodeSave(JSON.stringify(doc)).ok).toBe(false);
});
it('migrates genuine Save76 without issuing technology, while rejecting forged new data on an old version',()=>{
 const raw=JSON.parse(encodeSave(createMatch('skirmish'),view));raw.configVersion='tribute-config-76';expect(decodeSave(JSON.stringify(raw)).ok).toBe(true);raw.state.research.convoyService=1;expect(decodeSave(JSON.stringify(raw)).ok).toBe(false);
});

import {canAttackDomain} from './domains';
it('Dwarf Coast Ballista counters ships from land, gives up anti-air and reduces its siege multiplier',()=>{
 const unit={kind:'unit' as const,role:'ballista' as const},r=factions.dwarves.units.ballista;
 expect(canAttackDomain(unit,{kind:'ship'},'dwarves')).toBe(true);expect(canAttackDomain(unit,{kind:'unit',role:'air'},'dwarves')).toBe(false);
 expect(r.damageByDomain?.sea).toBe(1.75);expect(r.buildingDamageMultiplier).toBe(1.25);expect(factions.crown.units.ballista.buildingDamageMultiplier).toBe(2);
});

it('migrates a Save76 Orc cannon shell in flight and can save it again under the new hull rules',()=>{
 const m=createMatch('skirmish','normal',{player:'clans',enemy:'crown'},'islands');
 const own={...ship('warship'),hp:100,position:{x:720,y:512},target:{x:720,y:512},order:{kind:'attack' as const,enemyId:'enemy-ship-1'}};
 const target={id:'enemy-ship-1',kind:'ship' as const,owner:'enemy' as const,navalRole:'warship' as const,hp:90,position:{x:752,y:512},order:{kind:'idle' as const}};
 m.navy={...createNavy(),ships:[own],production:{remainingSeconds:null,nextUnitNumber:2}};m.enemyNaval!.production.nextUnitNumber=2;m.combat.enemies.push(target);
 const fired=prepareNavalCombat(m.navy,[target],.1,undefined,1,1,()=>true,factions.clans.naval.units.warship,'clans',m.research);m.combat.projectiles=fired.shots.map(s=>s.projectile);m.combat.nextProjectileNumber=fired.nextProjectileNumber;
 const raw=JSON.parse(encodeSave(m,view));raw.configVersion='tribute-config-76';Object.assign(raw.state.combat.projectiles[0],{damage:16,targets:['land','air','sea','building'],damageByDomain:{air:.75}});
 const loaded=decodeSave(JSON.stringify(raw));expect(loaded.ok,loaded.ok?'':loaded.error).toBe(true);
 if(loaded.ok){expect(loaded.match.combat.projectiles![0]).toMatchObject({damage:30,targets:['sea','building']});expect(()=>encodeSave(loaded.match,view)).not.toThrow();}
 raw.state.combat.projectiles[0].damage=999;expect(decodeSave(JSON.stringify(raw)).ok).toBe(false);
});

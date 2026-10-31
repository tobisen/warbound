import {isIslandMap} from '../config/islandMaps';
import {fleetBuildings,isFleetBuilding,fleetShips} from '../config/islandFleets';
import {validExpansionSites} from './enemyExpansionSites';
import {navalContentAI} from '../config/seaBattle';
import {navalFoundryAvailable,navalRoleAvailable} from '../config/navy';
import {skirmishAISettings} from '../config/skirmishPacing';
import {enemyObjective,type EnemyObjective} from './enemyObjectives';
import type {EnemyAISettings} from '../config/enemyAI';
import {prepareEnemyRecon,type EnemyRecon} from './enemyRecon';
import {roleResearchAvailable,researchConflict,roleResearchKinds,roleResearchConfig,isRoleResearch} from '../config/roleResearch';
import {enemyStrategyConfig, enemyStrategyLimits as limits} from '../config/enemyStrategy';
import {aiProfile} from '../config/aiProfiles';
import {isRegionalDesign} from '../config/organicTerrain';
import {regionBuildSites,regionDefinition,regionExpansion} from '../config/mapRegions';
import {maps} from '../config/maps';
import {factionForTeam} from '../config/factions';
import {baseUpgradeConfig} from '../config/baseUpgrade';
import {enemyExpansionConfig} from '../config/enemyExpansion';
import {enemyConstructionConfig} from '../config/enemyConstruction';
import {enemyBuildingView,enemyPopulation} from './enemyConstruction';
import {enemyBase} from './enemyBases';
import {overlaps,nearbyObstacles} from './map';
import {entityVisible,placementVisible} from './visibility';
import {buildingAvailability,technologyFor} from './productionPrerequisites';
import {researchRecipe} from './research';
import type {EnemyPriority} from './enemyPolicy';
import type {MatchState} from './match';
import type {Position} from './movement';
import type {Footprint,ProducerKind} from './placement';

export interface EnemyStrategy {
 phase:'economy'|'scouting'|'buildup'|'expansion'|'attack'|'recovery'|'defense';
 objective?:EnemyObjective;
 attackMembers?:string[];
 failedTarget?:Position;
 failedUntil?:number;
 recon?:EnemyRecon;
 nextDecisionSeconds:number;
 buildCursor?:number;
 expansionCursor?:number;
 blockedBuildingUntil?:Partial<Record<NonNullable<EnemyStrategy['building']>,number>>;
 blockedExpansionUntil?:number;
 priority:EnemyPriority;
 building?:Exclude<ProducerKind,'harbor'>|'farm'|'forge';
 buildingTarget?:number;
 minimumAttackSize:number;
 workerTarget:number;
 armyCap:number;
 reserve:{wood:number;gold:number};
 expand:boolean;
 threatened:boolean;
 attackPower:number;
 expansionSites:Position[];
}
/** Historical maps and scripted campaigns retain their authored pacing. */
export const usesEnemyStrategy=(m:MatchState)=>m.scenario==='skirmish'&&!m.campaignMission&&isRegionalDesign(m.map.design)&&!!m.enemyProduction?.roster&&!!m.enemyPolicy&&!!m.enemyRecovery;
export const strategyFor=(m:MatchState)=>usesEnemyStrategy(m)?m.enemyPolicy?.strategy:undefined;
export const strategySettings=(m:MatchState)=>enemyStrategyConfig[m.difficulty??'normal'];
function visibleHostiles(m:MatchState){return m.gathering.units.filter(u=>(u.hp??0)>0&&(!m.fog||entityVisible(m.fog,'enemy',u)));}
export function strategicBuildSites(m:MatchState):Position[]{
 const base=enemyBase(m.combat,m.map);if(!base?.footprint)return [];
 return [...(m.aiContext?.buildSites??regionDefinition(m.map.id??'arena',maps[m.map.id??'arena'],m.map.design).enemyBuildSites??regionBuildSites(base.footprint)),...m.combat.enemies.filter(e=>e.hp>0&&e.buildingType==='outpost'&&e.construction?.remainingSeconds===0).flatMap(e=>regionBuildSites(e.footprint!))];
}
function visibleSite(m:MatchState,rect:Footprint){return !m.fog||placementVisible({...m.fog,teams:{...m.fog.teams,player:m.fog.teams.enemy}},rect);}
function freeSite(m:MatchState,rect:Footprint){return rect.x>=0&&rect.y>=0&&rect.x+rect.width<=m.map.width&&rect.y+rect.height<=m.map.height&&(!visibleSite(m,rect)||!nearbyObstacles(m.map,rect).some(o=>overlaps(rect,o)));}
/** Bounded, deterministic candidates around remembered deposits and the map's authored scout site. */
export function strategicExpansionSites(m:MatchState):Position[]{
 const base=enemyBase(m.combat,m.map);if(!base?.footprint)return [];
 const nodes=(m.enemyKnowledge?.nodes??[]).filter(n=>n.remaining>0);
 const scoutPoint=regionExpansion(base.footprint,m.map.id??'arena');
 const points=[scoutPoint,...nodes.filter(n=>n.resource==='gold').flatMap(n=>[{x:n.position.x-144,y:n.position.y+96},{x:n.position.x+96,y:n.position.y-144},{x:n.position.x-144,y:n.position.y-144},...Array.from({length:8},(_,i)=>({x:n.position.x-48+Math.round(Math.cos(i*Math.PI/4)*limits.expansionSearchRadius/32)*32,y:n.position.y-48+Math.round(Math.sin(i*Math.PI/4)*limits.expansionSearchRadius/32)*32}))])];
 return validExpansionSites(m,points,scoutPoint).sort((a,b)=>Math.hypot(a.x-(m.enemyNaval?.colony?.target.x??base.position.x),a.y-(m.enemyNaval?.colony?.target.y??base.position.y))-Math.hypot(b.x-(m.enemyNaval?.colony?.target.x??base.position.x),b.y-(m.enemyNaval?.colony?.target.y??base.position.y))||a.x-b.x||a.y-b.y).slice(0,limits.maxCandidates);
}
/** Derived, transient plan: no navigation searches; paid executors revalidate every action. */
export function prepareEnemyStrategy(m:MatchState):MatchState {
 if(!usesEnemyStrategy(m)||!enemyBase(m.combat,m.map)||m.waves.elapsedSeconds+1e-9<(strategyFor(m)?.nextDecisionSeconds??0))return m;
 const cfg=strategySettings(m),f=factionForTeam(m,'enemy'),profile=aiProfile(m),bank=m.enemyProduction!,p=enemyBuildingView(m),pop=enemyPopulation(m),r=m.enemyPolicy!.research,time=m.waves.elapsedSeconds;
 const own=m.combat.enemies.filter(e=>e.hp>0),workers=own.filter(e=>e.kind==='worker').length,army=own.filter(e=>!e.footprint&&e.kind!=='worker'&&e.kind!=='ship'),bases=own.filter(e=>e.kind==='base'||e.buildingType==='outpost'),readyBases=bases.filter(e=>!e.construction||e.construction.remainingSeconds===0);
 const hostiles=visibleHostiles(m),threatened=hostiles.some(u=>u.kind==='soldier'&&bases.some(b=>Math.hypot(u.position.x-b.position.x,u.position.y-b.position.y)<=limits.dangerRange));
 const workerTarget=Math.min(cfg.maxWorkers,2+Math.floor(time/cfg.workerStepSeconds)+2*(readyBases.length-1));
 const armyCap=Math.min(cfg.maxArmy,bank.cap+Math.floor(time/120)*4+4*(readyBases.length-1),Math.max(bank.cap,workers*3));
 const minimumArmy=time>=120?Math.max(profile.minArmy,cfg.minimumAttackSize+Math.max(1,Math.max(2,readyBases.length)+profile.reserveDelta)):profile.minArmy;
 const expansionSites=strategicExpansionSites(m),minArmy=Math.max(profile.minArmy,profile.expansionArmy);
 const settling=m.enemyNaval?.colony?.stage==='settling';
 const expand=settling||time>=(strategyFor(m)?.blockedExpansionUntil??0)&&time>=cfg.expansionSeconds*(m.aiProfile==='economic'?.75:m.aiProfile==='defensive'?1.25:1)+Math.max(0,bases.length-1)*cfg.expansionInterval&&bases.length<Math.min(cfg.maxBases,Math.max(1,Math.floor(m.map.width*m.map.height/(1024*1024))))&&!threatened&&workers>=3&&army.length>=minArmy&&(!profile.expansionResearch||r.attack>=1&&r.defense>=1||time>=cfg.expansionSeconds+120)&&!own.some(e=>e.construction&&e.construction.remainingSeconds>0)&&expansionSites.length>0;
 let priority:EnemyPriority='army',building:EnemyStrategy['building'];
 const buildingSpace=strategicBuildSites(m).some(point=>{const rect={...point,width:64,height:64};return freeSite(m,rect)&&visibleSite(m,rect);});
 const fleetRole=isIslandMap(m.map.id)?fleetShips.find(k=>navalRoleAvailable(f.id,k)&&!own.some(e=>e.navalRole===k)):undefined;
 const supplyMargin=fleetRole?Math.max(enemyConstructionConfig.supplyMargin,f.naval.units[fleetRole].supply):enemyConstructionConfig.supplyMargin;
 const pending=own.some(e=>e.construction&&e.construction.remainingSeconds>0);
 const choose=(kind:NonNullable<EnemyStrategy['building']>,reason:EnemyPriority)=>{if(time>=(strategyFor(m)?.blockedBuildingUntil?.[kind]??0)&&!pending&&buildingSpace&&!buildingAvailability(f,kind,technologyFor(m,'enemy'))){building=kind;priority=reason;return true;}return false;};
 if(workers<2)priority='workers';
 else if(!p.barracks)choose('barracks','barracks');
 else if(pop.used+pop.reserved>=pop.cap-supplyMargin&&(p.farms?.length??0)<enemyConstructionConfig.maxFarms)choose('farm','supply');
 else if(fleetRole&&p.producers?.some(b=>b.kind==='navalAcademy'&&b.construction.remainingSeconds===0)&&!m.enemyNaval?.production.queue?.some(j=>j.kind===fleetRole))priority='fleet';
 else if(settling)priority='expansion';
 else if(workers<workerTarget&&(!threatened||army.length>=profile.minArmy))priority='workers';
 else if(army.length+(m.enemyNaval?.passengers.length??0)<(m.enemyNaval?Math.min(2,minimumArmy):minimumArmy)||threatened)priority='army';
 else if(expand)priority='expansion';
 else if(!r.job){
  const fleetMissing=isIslandMap(m.map.id)&&p.forge?.construction.remainingSeconds===0?(['navalAcademy','marineBarracks','signalTower','drydock'] as const).find(k=>!p.producers?.some(s=>s.kind===k)):undefined;
  const marineOrder=m.aiProfile==='defensive'?['armoredHulls','repairCrane','navalOptics','coastalGunnery']:m.aiProfile==='siege'?['coastalGunnery','armoredHulls','marineDrill','repairCrane']:m.aiProfile==='economic'||f.id==='elves'?['lightHulls','navalOptics','marineDrill','repairCrane']:['lightHulls','coastalGunnery','marineDrill','navalOptics'];
  const marineTech=isIslandMap(m.map.id)?marineOrder.find((k):k is import('../config/roleResearch').RoleResearchKind=>isRoleResearch(k)&&!r[k]&&!researchConflict(k,r)&&roleResearchConfig[k].buildings.every(b=>technologyFor(m,'enemy').buildings.includes(b))):undefined;
  if(marineTech)priority=marineTech as import('../config/roleResearch').RoleResearchKind;
  else if(fleetMissing)choose(fleetMissing,fleetMissing);
  else if(!p.forge)choose('forge','forge');
  else if(p.forge.construction.remainingSeconds===0){
   const first=profile.researchFirst,second=first==='attack'?'defense':'attack';
   if(r[first]<1)priority=first;
   else if(r[second]<1)priority=second;
   else if(!p.academy)choose('academy','academy');
   else if(p.academy.construction.remainingSeconds===0){
    if((bank.baseDevelopment?.level??1)<2&&bank.baseDevelopment?.remainingSeconds==null)priority='baseUpgrade';
    else if((bank.baseDevelopment?.level??1)>=2){
     const missing=(m.aiProfile==='siege'?['siegeWorks','stable','aviary','navalFoundry'] as const:m.aiProfile==='fleet'?['navalFoundry','aviary','stable','siegeWorks'] as const:['stable','aviary','siegeWorks','navalFoundry'] as const).find(k=>k==='navalFoundry'?navalContentAI(m)&&!!m.enemyNaval&&navalFoundryAvailable(f.id)&&!p.producers?.some(s=>s.kind===k):!p[k]);
     if(missing)choose(missing,missing);
     else if(r[first]<2)priority=first;
     else if(r[second]<2)priority=second;
     else if(bank.baseDevelopment?.level===2&&bank.baseDevelopment.remainingSeconds==null)priority='baseUpgrade';
     else priority=roleResearchKinds.find(k=>roleResearchAvailable(k,f.id)&&!researchConflict(k,r)&&!r[k]&&roleResearchConfig[k].buildings.every(b=>b==='navalFoundry'||b==='drydock'||b==='signalTower'||b==='navalAcademy'||b==='marineBarracks'?p.producers?.some(s=>s.kind===b&&s.hp>0&&s.construction.remainingSeconds===0):p[b]?.construction.remainingSeconds===0))??'army';
    }
   }
  }
 }
 // Add throughput only for a supported, busy economy, capped by workers and bases.
 if(priority==='army'&&!threatened&&!pending&&workers>=6&&bank.wood>=limits.producerWood&&bank.gold>=limits.producerGold&&army.length<armyCap&&bank.production.remainingSeconds!==null){
  const count=own.filter(e=>e.buildingType==='barracks').length;
  if(count<Math.min(3,readyBases.length+1))choose('barracks','barracks');
 }
 const reserve=priority==='fleet'&&fleetRole?f.naval.units[fleetRole].cost:building?f.buildings[building].cost:priority==='workers'?f.units.worker.cost:priority==='expansion'?enemyExpansionConfig.cost:priority==='baseUpgrade'?baseUpgradeConfig[(bank.baseDevelopment?.level??1)===1?2:3].cost:priority==='attack'||priority==='defense'||isRoleResearch(priority)?researchRecipe(f,priority,r[priority]??0).cost:{wood:0,gold:0};
 const previous=strategyFor(m),attackMembers=m.enemyAI?.groups.filter(g=>g.status==='attack').flatMap(g=>g.members)??[];
 const lostAttack=!!previous?.attackMembers&&previous.attackMembers.length>=cfg.minimumAttackSize&&previous.attackMembers.filter(id=>own.some(e=>e.id===id)).length<previous.attackMembers.length/2;
 const failedTarget=lostAttack?previous?.objective?.position:previous?.failedTarget,failedUntil=lostAttack?time+90:previous?.failedUntil;
 const objective=enemyObjective(m,previous?.objective,failedUntil&&time<failedUntil?failedTarget:undefined);
 const phase:EnemyStrategy['phase']=threatened?'defense':workers<3||!p.barracks?'economy':priority==='expansion'?'expansion':army.length<minimumArmy&&m.enemyAI?.lastDispatchSeconds!=null?'recovery':!m.enemyKnowledge?.playerBase?'scouting':m.enemyAI?.groups.some(g=>g.status==='attack')?'attack':'buildup';
 const strategy:EnemyStrategy={phase,objective,attackMembers,failedTarget,failedUntil,recon:strategyFor(m)?.recon,expansionCursor:strategyFor(m)?.expansionCursor,buildCursor:strategyFor(m)?.buildCursor,blockedBuildingUntil:strategyFor(m)?.blockedBuildingUntil,blockedExpansionUntil:strategyFor(m)?.blockedExpansionUntil,nextDecisionSeconds:time+cfg.decisionSeconds,minimumAttackSize:cfg.minimumAttackSize,priority,building,buildingTarget:building?own.filter(e=>e.buildingType===building).length+1:undefined,workerTarget,armyCap,reserve:{...reserve},expand,threatened,attackPower:objective?.power??0,expansionSites};
 return prepareEnemyRecon({...m,enemyPolicy:{...m.enemyPolicy!,strategy}});
}

/** Failed paid-action admission backs off without starving production or paying for invalid sites. */
export function deferEnemyInvestment(m:MatchState,kind:NonNullable<EnemyStrategy['building']>|'expansion',buildCursor?:number):MatchState {
 const strategy=strategyFor(m);if(!strategy||!m.enemyPolicy)return m;
 const retryAt=m.waves.elapsedSeconds+15;
 return {...m,enemyPolicy:{...m.enemyPolicy,strategy:{...strategy,...(buildCursor!==undefined?(kind==='expansion'?{expansionCursor:buildCursor}:{buildCursor}):{}),priority:'army',building:undefined,reserve:{wood:0,gold:0},...(kind==='expansion'?{expand:false,blockedExpansionUntil:retryAt}:{blockedBuildingUntil:{...strategy.blockedBuildingUntil,[kind]:retryAt}})}}};
}

/** Personality stays independent; deadlines prevent indefinite buildup on large maps. */
export function strategicAISettings(m:MatchState,settings:EnemyAISettings):EnemyAISettings {
 const plan=strategyFor(m);
 const reconIds=plan?.recon?.ids??[];
 // A small paid army must retain a field detachment after adding another base.
 // Count actual bodies, since heavy recipes consume more than one supply slot.
 const available=m.combat.enemies.filter(e=>e.hp>0&&e.id.startsWith('enemy-produced-')&&e.role!=='scout'&&!e.navalLanding&&!reconIds.includes(e.id)).length;
 return skirmishAISettings(m,{...settings,...(plan?{reconIds,reserveCount:Math.min(settings.reserveCount,Math.max(0,available-plan.minimumAttackSize))}:{})});
}

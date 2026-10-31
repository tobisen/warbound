import {prepareEnemyColony,type EnemyColony} from './enemyColonies';
import {islandNavalPlan} from './islandNavalPlan';
import {isIslandMap} from '../config/islandMaps';
import {fleetShips,fleetStats} from '../config/islandFleets';
import {navalRoleAvailable} from '../config/navy';
import {navalContentAI} from '../config/seaBattle';
import {skirmishAttackSeconds} from '../config/skirmishPacing';
import {isRegionalDesign} from '../config/organicTerrain';
import {hasEnemyBase} from './enemyBases';
import {isAir} from './domains';
import {enemyNavigationMap} from './map';
import {factionForTeam} from '../config/factions';
import {enemyNavalConfig as legacyCfg} from '../config/enemyNaval';
import {navyConfig} from '../config/navy';
import {canAfford} from './economy';
import {enemyWorker} from './enemyGathering';
import {enemyPopulation} from './enemyConstruction';
import {updateSite} from './construction';
import {coastalFootprint,domainMap,planDomainRoute,advanceDomainRoute,marineFlightMap} from './terrainNavigation';
import {bodyFits,overlaps,replaceObstacles} from './map';
import {spawnCandidates,hasSpawnExit,unitBody} from './spawning';
import {approachRoute} from './approach';
import {planRoute,segmentFits} from './navigation';
import {entityVisible,placementVisible} from './visibility';
import type {MatchState} from './match';
import type {Enemy} from './combat';
import type {ProductionState} from './production';
import type {GatheringState} from './gathering';
import type {Position} from './movement';
export interface EnemyNavalState {colony?:EnemyColony;nextColonySeconds?:number;production:ProductionState;passengers:Enemy[];phase:'waiting'|'loading'|'sailing'|'landed'|'finished'}
export const createEnemyNaval=():EnemyNavalState=>({production:{remainingSeconds:null,nextUnitNumber:1},passengers:[],phase:'waiting'});
function seen(m:MatchState,rect:Parameters<typeof placementVisible>[1]){return !m.fog||placementVisible({...m.fog,teams:{...m.fog.teams,player:m.fog.teams.enemy}},rect);}
function spend(m:MatchState,cost:{wood:number;gold:number}):MatchState {const bank=m.enemyProduction!;return {...m,enemyProduction:{...bank,wood:bank.wood-cost.wood,gold:bank.gold-cost.gold,spent:{wood:(bank.spent?.wood??0)+cost.wood,gold:(bank.spent?.gold??0)+cost.gold}}};}
export function prepareEnemyNaval(m:MatchState):MatchState {
 const cfg=islandNavalPlan(m);
 if(!m.enemyNaval||!m.enemyProduction||!hasEnemyBase(m.combat,m.map))return m;
 const site=m.combat.enemies.find(e=>e.buildingType==='harbor'&&!e.id.startsWith('enemy-producer-'));
 const available=m.combat.enemies.filter(e=>e.work&&e.hp>0&&e.work.order.kind!=='build'&&e.id!==m.enemyNaval?.colony?.workerId).sort((a,b)=>a.id.localeCompare(b.id,'en',{numeric:true}));
 if(site?.construction?.remainingSeconds===0)return m;
 if(site){const current=m.combat.enemies.find(e=>e.id===site.construction?.builderId&&e.work?.order.kind==='build'&&e.work.order.buildingId==='harbor');if(current)return m;const builder=available.find(e=>approachRoute(enemyNavigationMap(m.map),e.position,site.footprint!,24).status!=='blocked');return builder?{...m,combat:{...m.combat,enemies:m.combat.enemies.map(e=>e===site?{...e,construction:{...e.construction!,builderId:builder.id}}:e===builder?{...e,navigation:undefined,work:{...e.work!,order:{kind:'build',buildingId:'harbor'}}}:e)}}:m;}
 // Distant regional bases must actually scout the authored harbor before spending.
 if(isRegionalDesign(m.map.design)&&!seen(m,cfg.harbor)&&m.enemyNaval.production.nextUnitNumber===1){const target=isIslandMap(m.map.id)?cfg.loading:{x:944,y:352},scout=available.find(e=>e.work!.cargo===0);if(scout&&approachRoute(enemyNavigationMap(m.map),scout.position,cfg.harbor,24).status!=='blocked')return {...m,combat:{...m.combat,enemies:m.combat.enemies.map(e=>e===scout?{...e,navigation:planRoute(enemyNavigationMap(m.map),e.position,target),work:{...e.work!,target,order:{kind:'move' as const}}}:e)}};}
 if(!isIslandMap(m.map.id)&&m.enemyNaval.production.nextUnitNumber>1&&!m.enemyPolicy?.research.submarineDesign||!seen(m,cfg.harbor)||!coastalFootprint(m.map,cfg.harbor)||!canAfford({wood:m.enemyProduction.wood,goldBalance:m.enemyProduction.gold},factionForTeam(m,'enemy').naval.harbor.cost))return m;
 const builder=available.find(e=>approachRoute(enemyNavigationMap(m.map),e.position,cfg.harbor,24).status!=='blocked');if(!builder||[...m.gathering.units,...m.combat.enemies.filter(e=>!e.footprint)].filter(e=>!isAir(e)).some(e=>overlaps(cfg.harbor,unitBody(e.position,24))))return m;
 m=spend(m,factionForTeam(m,'enemy').naval.harbor.cost);return {...m,map:replaceObstacles(m.map,[...m.map.obstacles,cfg.harbor]),combat:{...m.combat,enemies:[...m.combat.enemies.map(e=>e.id===builder.id?{...e,navigation:undefined,work:{...e.work!,order:{kind:'build' as const,buildingId:'harbor' as const}}}:e),{id:'enemy-harbor',owner:'enemy',kind:'building',buildingType:'harbor',hp:factionForTeam(m,'enemy').naval.harbor.hp,footprint:{...cfg.harbor},position:{x:cfg.harbor.x+32,y:cfg.harbor.y+32},construction:{remainingSeconds:factionForTeam(m,'enemy').naval.harbor.constructionSeconds,builderId:builder.id}}]}};
}
function freeWaterSpawn(m:MatchState,foot:NonNullable<Enemy['footprint']>){const map={...domainMap(m.map,'water'),bodyHalf:16};return spawnCandidates(map,foot,'barracks',32).find(p=>hasSpawnExit(map,p)&&![...m.gathering.units,...m.combat.enemies.filter(e=>!e.footprint),...(m.navy?.ships??[])].filter(e=>!isAir(e)).some(e=>overlaps(unitBody(p,32),unitBody(e.position,32))));}
function contact(m:MatchState,a:Position,b:Position){return Math.hypot(a.x-b.x,a.y-b.y)<=navyConfig.transport.contactRange+1e-9&&segmentFits(marineFlightMap(m.map),a,b,0);}
/** Naval bodies are excluded from the land movement scheduler; only this adapter moves them. */
export function updateEnemyNaval(m:MatchState,delta:number):MatchState {
 if(!m.enemyNaval||delta<=0||m.paused||m.outcome!=='playing')return m;
 m=prepareEnemyColony(m);
 if(!m.enemyNaval)return m;
 let cfg=islandNavalPlan(m,m.enemyNaval?.colony?.stage!=='settling'?m.enemyNaval?.colony?.target:undefined);const island=isIslandMap(m.map.id);
 const sailing=m.enemyNaval?.phase==='sailing'?m.combat.enemies.find(e=>e.kind==='ship'&&!e.navalRole):undefined;
 if(sailing?.order?.kind==='muster'){const goal=sailing.order.destination,beach=cfg.beaches?.find(b=>b.water.x===goal.x&&b.water.y===goal.y);if(beach)cfg={...cfg,waterGoal:beach.water,landing:beach.land};}
 let state=m.enemyNaval,site=m.combat.enemies.find(e=>e.buildingType==='harbor'&&!e.id.startsWith('enemy-producer-'));
 if(!hasEnemyBase(m.combat,m.map))return {...m,enemyNaval:{...state,production:{...state.production,queue:[],remainingSeconds:null}}};
 let productionDelta=delta;
 if(site?.construction&&site.construction.remainingSeconds>0){const g:GatheringState={...m.gathering,faction:factionForTeam(m,'enemy').id,units:m.combat.enemies.flatMap(e=>{const w=enemyWorker(e);return w?[w]:[];})};const result=updateSite(g,site.construction,site.footprint!,'harbor',enemyNavigationMap(m.map),delta);const workers=new Map(result.gathering.units.map(u=>[u.id,u]));m={...m,combat:{...m.combat,enemies:m.combat.enemies.map(e=>{const u=workers.get(e.id);return e===site?{...e,construction:result.job}:u&&u.kind==='worker'?{...e,position:u.position,navigation:u.navigation,work:{...e.work!,target:u.target,order:u.order}}:e;})}};site=m.combat.enemies.find(e=>e.buildingType==='harbor'&&!e.id.startsWith('enemy-producer-'));productionDelta=result.completedAfterSeconds===undefined?0:Math.max(0,delta-result.completedAfterSeconds);}
 const p=state.production,recipe=factionForTeam(m,'enemy').naval.units.transport;
 if(site?.construction?.remainingSeconds===0&&(p.nextUnitNumber===1||island&&!m.combat.enemies.some(e=>e.kind==='ship'&&!e.navalRole&&e.hp>0))&&!p.queue?.length&&m.enemyProduction&&canAfford({wood:m.enemyProduction.wood,goldBalance:m.enemyProduction.gold},recipe.cost)&&enemyPopulation(m).used+enemyPopulation(m).reserved+recipe.supply<=enemyPopulation(m).cap){m=spend(m,recipe.cost);state={...state,production:{...p,queue:[{id:`enemy-harbor-job-${p.nextJobNumber??1}`,kind:'transport',supply:recipe.supply,cost:{...recipe.cost},durationSeconds:recipe.durationSeconds,remainingSeconds:recipe.durationSeconds}],remainingSeconds:recipe.durationSeconds,nextJobNumber:(p.nextJobNumber??1)+1},phase:'waiting',passengers:[]};}
 if(site?.construction?.remainingSeconds===0&&state.production.nextUnitNumber>1&&!state.production.queue?.length&&m.enemyProduction){
  const faction=factionForTeam(m,'enemy'),advanced=faction.id==='crown'?'cutter':faction.id==='dwarves'?'bombard':undefined;
  const combatShips=m.combat.enemies.filter(e=>e.kind==='ship'&&e.navalRole&&e.hp>0),playerShips=m.navy?.ships.filter(s=>s.hp>0&&(!m.fog||entityVisible(m.fog!,'enemy',s)))??[];
  const unique=fleetShips.find(r=>navalRoleAvailable(faction.id,r)),academy=m.combat.enemies.some(e=>e.buildingType==='navalAcademy'&&e.hp>0&&e.construction?.remainingSeconds===0);
  const role=island&&academy&&unique&&!combatShips.some(e=>e.navalRole===unique)?unique:island&&combatShips.length<3?'warship':navalContentAI(m)&&advanced&&m.enemyPolicy?.research.navalLogistics&&combatShips.filter(e=>e.navalRole===advanced).length<2?advanced:m.enemyPolicy?.research.submarineDesign&&!combatShips.some(e=>e.navalRole==='submarine')?'submarine':navalContentAI(m)&&(playerShips.length||m.aiProfile==='fleet')&&combatShips.length<(m.aiProfile==='fleet'?6:Math.min(6,playerShips.length))?'warship':undefined;
  if(role){const r=faction.naval.units[role],n=state.production.nextJobNumber??2,pop=enemyPopulation(m);if(canAfford({wood:m.enemyProduction.wood,goldBalance:m.enemyProduction.gold},r.cost)&&pop.used+pop.reserved+r.supply<=pop.cap){m=spend(m,r.cost);state={...state,production:{...state.production,queue:[{id:`enemy-harbor-job-${n}`,kind:role,supply:r.supply,cost:{...r.cost},durationSeconds:r.durationSeconds,remainingSeconds:r.durationSeconds}],remainingSeconds:r.durationSeconds,nextJobNumber:n+1}};}}
 }

 if(site?.construction?.remainingSeconds===0&&state.production.queue?.length){const job=state.production.queue[0],remainingSeconds=Math.max(0,job.remainingSeconds-productionDelta),position=remainingSeconds<=1e-9?freeWaterSpawn(m,site.footprint!):undefined;if(position){const role=job.kind as import('../config/navy').ShipRole,ship:Enemy={id:`enemy-ship-${state.production.nextUnitNumber}`,kind:'ship',...(role!=='transport'?{navalRole:role}:{}),owner:'enemy',hp:factionForTeam(m,'enemy').naval.units[role].hp,position,order:role!=='transport'?{kind:'idle'}:{kind:'muster',destination:{...cfg.waterStart}},...(role!=='transport'?{}:{navigation:planDomainRoute(m.map,'water',position,cfg.waterStart,16)})};m={...m,combat:{...m.combat,enemies:[...m.combat.enemies,ship]}};state={...state,production:{...state.production,queue:[],remainingSeconds:null,nextUnitNumber:state.production.nextUnitNumber+1}};}else state={...state,production:{...state.production,queue:[{...job,remainingSeconds}],remainingSeconds}};}
 if(island){const carrier=m.combat.enemies.find(e=>e.kind==='ship'&&!e.navalRole&&e.hp>0);const goal=state.phase==='sailing'||state.phase==='landed'?cfg.waterGoal:cfg.waterStart;
  m={...m,combat:{...m.combat,enemies:m.combat.enemies.map(e=>{
   if(e.kind!=='ship'||!e.navalRole||e.hp<=0||e.order?.kind==='defend')return e;
   const destination=e.navalRole==='survey'?cfg.waterGoal:e.navalRole==='tender'&&carrier?carrier.position:goal;
   if(Math.hypot(e.position.x-destination.x,e.position.y-destination.y)<48)return e;
   const route=e.navigation&&e.navigation.revision===m.map.revision&&Math.hypot(e.navigation.destination.x-destination.x,e.navigation.destination.y-destination.y)<96?e.navigation:planDomainRoute(m.map,'water',e.position,destination,16);
   const step=advanceDomainRoute(m.map,'water',e.position,route,16,fleetStats(factionForTeam(m,'enemy').naval.units[e.navalRole],m.enemyPolicy?.research).speed,delta);
   return {...e,position:step.position,navigation:step.route,order:{kind:'muster' as const,destination}};
  })}};
 }
 if(island&&state.phase==='landed'){const carrier=m.combat.enemies.find(e=>e.kind==='ship'&&!e.navalRole&&e.hp>0);if(carrier){if(Math.hypot(carrier.position.x-cfg.waterStart.x,carrier.position.y-cfg.waterStart.y)<1){state={...state,phase:'waiting'};}else m={...m,combat:{...m.combat,enemies:m.combat.enemies.map(e=>e===carrier?{...e,navigation:e.navigation?.destination.x===cfg.waterStart.x&&e.navigation.destination.y===cfg.waterStart.y?e.navigation:planDomainRoute(m.map,'water',e.position,cfg.waterStart,16),order:{kind:'muster' as const,destination:cfg.waterStart}}:e)}};}}
 let ship=m.combat.enemies.find(e=>e.kind==='ship'&&!e.navalRole&&e.hp>0);if(!ship)return {...m,enemyNaval:state};
 if(!state.colony&&state.phase==='waiting'&&m.waves.elapsedSeconds>=(m.scenario==='skirmish'&&!m.campaignMission?skirmishAttackSeconds(m):cfg.launchSeconds[m.difficulty??'normal']+(isRegionalDesign(m.map.design)?90:0))&&!m.enemyAI?.threatId){const army=m.combat.enemies.filter(e=>!isAir(e)&&e.kind==='unit'&&e.id.startsWith('enemy-produced-')&&!e.navalLanding&&e.hp>0&&(!island||planRoute(enemyNavigationMap(m.map),e.position,cfg.loading).status!=='blocked')).slice(0,cfg.passengers);if(army.length===cfg.passengers){const committed=new Set(army.map(e=>e.id));m={...m,...(m.enemyAI?{enemyAI:{...m.enemyAI,reserve:m.enemyAI.reserve.filter(id=>!committed.has(id)),defenders:m.enemyAI.defenders.filter(d=>!committed.has(d.id)),groups:m.enemyAI.groups.map(g=>({...g,members:g.members.filter(id=>!committed.has(id)),destinations:Object.fromEntries(Object.entries(g.destinations).filter(([id])=>!committed.has(id)))})).filter(g=>g.members.length)}}:{}),combat:{...m.combat,enemies:m.combat.enemies.map(e=>army.includes(e)?{...e,navalLanding:true,navigation:planRoute(enemyNavigationMap(m.map),e.position,cfg.loading),order:{kind:'muster',destination:{...cfg.loading}}}:e)}};state={...state,phase:'loading'};}}
 if(ship.order?.kind==='muster'){const route=ship.navigation??planDomainRoute(m.map,'water',ship.position,ship.order.destination,16),step=advanceDomainRoute(m.map,'water',ship.position,route,16,fleetStats(factionForTeam(m,'enemy').naval.units.transport,m.enemyPolicy?.research).speed,delta);ship={...ship,position:step.position,navigation:step.route};m={...m,combat:{...m.combat,enemies:m.combat.enemies.map(e=>e.id===ship!.id?ship!:e)}};}
 if(state.phase==='loading'){const army=m.combat.enemies.filter(e=>state.colony?.stage==='loading'?[state.colony.workerId,state.colony.guardId].includes(e.id)&&e.hp>0:e.kind==='unit'&&e.navalLanding&&e.hp>0&&(!island||e.order?.kind==='muster'&&e.order.destination.x===cfg.loading.x&&e.order.destination.y===cfg.loading.y));if(island&&army.length<cfg.passengers){const released=new Set(army.map(e=>e.id));const colonist=state.colony?.workerId;state={...state,phase:'waiting',colony:undefined,nextColonySeconds:m.waves.elapsedSeconds+60};m={...m,combat:{...m.combat,enemies:m.combat.enemies.map(e=>e.id===colonist&&e.work?{...e,navigation:undefined,work:{...e.work,order:{kind:'idle' as const}}}:released.has(e.id)?{...e,navalLanding:undefined,navigation:undefined,order:{kind:'idle' as const}}:e)}};}else if(army.length===cfg.passengers&&army.every(e=>contact(m,ship!.position,e.position))&&Math.hypot(ship.position.x-cfg.waterStart.x,ship.position.y-cfg.waterStart.y)<1e-9){state={...state,phase:'sailing',...(state.colony?{colony:{...state.colony,stage:'sailing'}}:{}),passengers:army.map(e=>({...e,navigation:undefined,...(e.work?{work:{...e.work,order:{kind:'idle' as const}}}:{order:{kind:'idle' as const}})}))};const loaded=new Set(army.map(e=>e.id));m={...m,combat:{...m.combat,enemies:m.combat.enemies.filter(e=>!loaded.has(e.id)).map(e=>e.id===ship!.id?{...e,navigation:planDomainRoute(m.map,'water',e.position,cfg.waterGoal,16),order:{kind:'muster',destination:{...cfg.waterGoal}}}:e)}};}}
 if(state.phase==='sailing'&&Math.hypot(ship.position.x-cfg.waterGoal.x,ship.position.y-cfg.waterGoal.y)<1e-9){const points=[cfg.landing,...[0,-1,1].flatMap(dy=>[0,-1].map(dx=>({x:cfg.landing.x+dx*32,y:cfg.landing.y+dy*32})))],occupied=[...m.gathering.units,...m.combat.enemies.filter(e=>!e.footprint)].filter(e=>!isAir(e)).map(e=>unitBody(e.position,24)),landed:Enemy[]=[];for(const passenger of state.passengers){const point=points.find(p=>bodyFits(enemyNavigationMap(m.map),p,12)&&seen(m,unitBody(p,24))&&contact(m,ship!.position,p)&&!occupied.some(o=>overlaps(o,unitBody(p,24))));if(!point)break;occupied.push(unitBody(point,24));landed.push({...passenger,position:{...point},navigation:undefined,...(passenger.work?{work:{...passenger.work,target:state.colony!.target,order:{kind:'move' as const}}}:{order:{kind:'attack-move' as const,destination:{...(state.colony?.target??m.enemyKnowledge?.playerBase??cfg.landSearch)}}})});}if(landed.length===state.passengers.length){state={...state,passengers:[],phase:'landed',...(state.colony?{colony:{...state.colony,stage:'settling' as const}}:{})};m={...m,combat:{...m.combat,enemies:[...m.combat.enemies,...landed]}};}else if(island&&cfg.beaches){const index=cfg.beaches.findIndex(b=>b.water.x===cfg.waterGoal.x&&b.water.y===cfg.waterGoal.y);const alternate=[...cfg.beaches.slice(index+1),...cfg.beaches.slice(0,index)].find(b=>Math.hypot(b.water.x-cfg.waterGoal.x,b.water.y-cfg.waterGoal.y)>=96&&(!seen(m,unitBody(b.land,24))||bodyFits(enemyNavigationMap(m.map),b.land,12)&&!occupied.some(o=>overlaps(o,unitBody(b.land,24)))));if(alternate)m={...m,combat:{...m.combat,enemies:m.combat.enemies.map(e=>e.id===ship!.id?{...e,navigation:planDomainRoute(m.map,'water',e.position,alternate.water,16),order:{kind:'muster' as const,destination:alternate.water}}:e)}};}}
 return {...m,enemyNaval:state};
}

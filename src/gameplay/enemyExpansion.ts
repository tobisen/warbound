import {enemyStrategyLimits} from '../config/enemyStrategy';
import {strategyFor,strategicExpansionSites,deferEnemyInvestment} from './enemyStrategy';
import {commandMappedMove} from './navigation';
import {placementVisible} from './visibility';
import {isRegionalDesign} from '../config/organicTerrain';
import {regionExpansion} from '../config/mapRegions';
import {resourceNodes} from './gathering';
import {enemyBase,hasEnemyBase} from './enemyBases';
import {aiProfile} from '../config/aiProfiles';
import {isAir} from './domains';
import {enemyNavigationMap} from './map';
import {knownEnemyNode} from './enemyKnowledge';
import {barracksConfig} from '../config/buildings';
import {enemyExpansionConfig as config} from '../config/enemyExpansion';
import {enemyPolicyConfig} from '../config/enemyPolicy';
import {unitStats,combatUnitStats} from '../config/unit';
import {canAfford} from './economy';
import {enemyWorker} from './enemyGathering';
import {canReachFootprint} from './approach';
import {updateSite} from './construction';
import {overlaps,replaceObstacles} from './map';
import {hasSpawnExit,spawnCandidates,unitBody} from './spawning';
import type {GatheringState,Worker} from './gathering';
import type {MatchState} from './match';
import type {GateFor} from './traffic';
import type {Footprint} from './placement';
export function isEnemyExpansionScout(m:MatchState,e:import('./combat').Enemy):boolean {
 if(!isRegionalDesign(m.map.design)||e.work?.order.kind!=='move')return false;
 const base=enemyBase(m.combat,m.map);if(!base?.footprint)return false;
 const first=regionExpansion(base.footprint,m.map.id??'arena'),target=e.work.target;
 if(target.x===first.x+48&&target.y===first.y+48)return true;
 return (m.enemyKnowledge?.nodes??[]).some(n=>(n.resource??'wood')==='gold'&&[{x:n.position.x-144,y:n.position.y+96},{x:n.position.x+96,y:n.position.y-144},{x:n.position.x-144,y:n.position.y-144}].some(p=>target.x===Math.floor(p.x/32)*32+48&&target.y===Math.floor(p.y/32)*32+48));
}
export function wantsEnemyExpansion(m:MatchState):boolean {
 if(strategyFor(m))return strategyFor(m)!.expand;
 return !!m.enemyRecovery&&!!m.enemyPolicy&&m.combat.enemies.some(e=>e.buildingType==='barracks'&&e.hp>0&&e.construction?.remainingSeconds===0)&&(!aiProfile(m).expansionResearch||m.enemyPolicy.research.attack>=1&&m.enemyPolicy.research.defense>=1)&&!m.combat.enemies.some(e=>e.buildingType==='outpost'&&e.construction?.remainingSeconds!==0)&&m.combat.enemies.filter(e=>e.kind==='worker'&&e.hp>0).length>=2&&m.combat.enemies.filter(e=>!e.footprint&&e.kind!=='worker'&&e.hp>0).length>=aiProfile(m).expansionArmy&&(isRegionalDesign(m.map.design)?resourceNodes(m.gathering).some(n=>(knownEnemyNode(m,n)?.remaining??0)>0):((knownEnemyNode(m,m.gathering.node)?.remaining??0)>0||(knownEnemyNode(m,m.gathering.gold)?.remaining??0)>0));
}
function builderFor(m:MatchState,rect:Footprint,budget?:{remaining:number}){
 return m.combat.enemies.filter(e=>e.kind==='worker'&&e.hp>0&&e.work?.order.kind!=='build').sort((a,b)=>Math.hypot(a.position.x-rect.x,a.position.y-rect.y)-Math.hypot(b.position.x-rect.x,b.position.y-rect.y)||a.id.localeCompare(b.id,'en',{numeric:true})).find(e=>(!budget||budget.remaining-->0)&&canReachFootprint(enemyNavigationMap(m.map),e.position,rect,barracksConfig.constructionRange));
}
export function prepareEnemyExpansion(m:MatchState):MatchState {
 if(!m.enemyRecovery||!m.enemyProduction||!hasEnemyBase(m.combat,m.map))return m;
 const site=m.combat.enemies.find(e=>e.buildingType==='outpost'&&e.construction?.remainingSeconds!==0);
 if(site?.construction?.remainingSeconds===0)return m;
 if(site){const current=m.combat.enemies.find(e=>e.id===site.construction!.builderId&&e.hp>0&&e.work?.order.kind==='build'&&e.work.order.buildingId===site.id.slice(6));if(current&&current.navigation?.status!=='blocked')return m;}
 if(m.waves.elapsedSeconds+1e-9<m.enemyRecovery.nextExpansionAttemptSeconds)return m;
 if(!site&&!wantsEnemyExpansion(m))return m;
 if(!site&&strategyFor(m)&&strategyFor(m)!.priority!=='expansion'&&strategyFor(m)!.priority!=='army')return m;
 m={...m,enemyRecovery:{...m.enemyRecovery,nextExpansionAttemptSeconds:m.waves.elapsedSeconds+config.retrySeconds}};
 if(site){const builder=builderFor(m,site.footprint!);if(!builder)return m;return {...m,combat:{...m.combat,enemies:m.combat.enemies.map(e=>e.id===site.id?{...e,construction:{...e.construction!,builderId:builder.id}}:e.id===builder.id?{...e,navigation:undefined,work:{...e.work!,order:{kind:'build',buildingId:site.id.slice(6) as 'outpost'|`outpost-${number}`}}}:e)}};}
 if(m.combat.enemies.some(e=>e.construction&&e.construction.remainingSeconds>0)||!canAfford({wood:m.enemyProduction!.wood,goldBalance:m.enemyProduction!.gold},config.cost))return m;
 const outposts=m.combat.enemies.filter(e=>e.buildingType==='outpost');
 // Further dropoffs follow remembered resource sites, never hidden live resources.
 const known=m.enemyKnowledge?.nodes??resourceNodes(m.gathering).filter(n=>!!n);
 const additional=isRegionalDesign(m.map.design)?known.filter(n=>(n.resource??'wood')==='gold'&&n.remaining>0&&!m.combat.enemies.some(e=>(e.kind==='base'||e.buildingType==='outpost')&&Math.hypot(e.position.x-n.position.x,e.position.y-n.position.y)<320)).flatMap(n=>[{x:n.position.x-144,y:n.position.y+96},{x:n.position.x+96,y:n.position.y-144},{x:n.position.x-144,y:n.position.y-144}].map(p=>({x:Math.floor(p.x/32)*32,y:Math.floor(p.y/32)*32}))):[];
 const candidates=strategyFor(m)?strategicExpansionSites(m):outposts.length?additional:isRegionalDesign(m.map.design)?[regionExpansion(enemyBase(m.combat,m.map)!.footprint!,m.map.id??'arena')]:config.candidates;
 const next=1+Math.max(0,...outposts.map(e=>e.id==='enemy-outpost'?1:Number(e.id.slice(14)))),id:'outpost'|`outpost-${number}`=next===1?'outpost':`outpost-${next}`;
 const strategy=strategyFor(m),cursor=(strategy?.expansionCursor??0)%Math.max(1,candidates.length),ordered=strategy?[...candidates.slice(cursor),...candidates.slice(0,cursor)]:candidates,budget=strategy?{remaining:enemyStrategyLimits.maxPlacementSearches}:undefined;let examined=0;
 for(const point of ordered){examined++;const rect={...point,width:config.size,height:config.size};
  if(m.enemyKnowledge&&m.fog&&!placementVisible({...m.fog,teams:{...m.fog.teams,player:m.fog.teams.enemy}},rect)){
   const scout=m.combat.enemies.find(e=>e.kind==='worker'&&e.hp>0&&e.work?.order.kind!=='build');
   if(!scout)continue;
   if(scout.work?.order.kind==='move'&&scout.work.target.x===rect.x+48&&scout.work.target.y===rect.y+48){if(scout.navigation?.status==='blocked')continue;return m;}
   if(budget&&budget.remaining--<=0)return deferEnemyInvestment(m,'expansion',cursor+examined-1);
   const moved=commandMappedMove([{...enemyWorker(scout)!,selected:true}],{x:rect.x+48,y:rect.y+48},enemyNavigationMap(m.map))[0] as Worker;
   if(moved.navigation?.status==='blocked')continue;
   return {...m,combat:{...m.combat,enemies:m.combat.enemies.map(e=>e.id===scout.id?{...e,navigation:moved.navigation,work:{...e.work!,target:moved.target,order:moved.order}}:e)}};
  }
  if(rect.x<0||rect.y<0||rect.x+rect.width>m.map.width||rect.y+rect.height>m.map.height||m.map.obstacles.some(o=>overlaps(rect,o)))continue;
  if(m.gathering.units.some(u=>!isAir(u)&&overlaps(rect,unitBody(u.position,(u.kind==='worker'?unitStats:combatUnitStats(u)).size)))||m.combat.enemies.filter(e=>!e.footprint&&!isAir(e)).some(e=>overlaps(rect,unitBody(e.position,unitStats.size))))continue;
  const builder=builderFor(m,rect,budget);if(!builder){if(budget&&budget.remaining<=0)return deferEnemyInvestment(m,'expansion',cursor+examined);continue;}
  const map=replaceObstacles(m.map,[...m.map.obstacles,rect]);if(!spawnCandidates(map,rect,'base').some(p=>hasSpawnExit(map,p)))continue;
  const bank=m.enemyProduction!;return {...m,map,enemyProduction:{...bank,wood:bank.wood-config.cost.wood,gold:bank.gold-config.cost.gold,spent:{wood:(bank.spent?.wood??0)+config.cost.wood,gold:(bank.spent?.gold??0)+config.cost.gold}},combat:{...m.combat,enemies:[...m.combat.enemies.map(e=>e.id===builder.id?{...e,navigation:undefined,work:{...e.work!,order:{kind:'build' as const,buildingId:id}}}:e),{id:'enemy-'+id,owner:'enemy',kind:'building',buildingType:'outpost',hp:config.hp,position:{x:rect.x+config.size/2,y:rect.y+config.size/2},footprint:rect,construction:{remainingSeconds:config.constructionSeconds,builderId:builder.id}}]}};
 }
 return strategyFor(m)?deferEnemyInvestment(m,'expansion',cursor+examined):m;
}
export function updateEnemyExpansion(m:MatchState,delta:number,gateFor?:GateFor):MatchState {
 const site=m.combat.enemies.find(e=>e.buildingType==='outpost'&&e.construction?.remainingSeconds!==0),base=enemyBase(m.combat,m.map);if(!site?.construction||!base||site.construction.remainingSeconds===0)return m;
 const g:GatheringState={...m.gathering,base:base.position,baseSize:base.footprint!.width,units:m.combat.enemies.flatMap(e=>{const w=enemyWorker(e);return w?[w]:[];})};
 const result=updateSite(g,site.construction,site.footprint!,site.id.slice(6) as 'outpost'|`outpost-${number}`,enemyNavigationMap(m.map),delta,gateFor?(id=>gateFor(id.replace(/^player:/,'enemy:'))):undefined);const byId=new Map(result.gathering.units.map(u=>[u.id,u as Worker]));
 return {...m,combat:{...m.combat,enemies:m.combat.enemies.map(e=>{if(e.id===site.id)return {...e,construction:result.job};const u=byId.get(e.id);return u?{...e,position:u.position,navigation:u.navigation,work:{cargo:u.cargo,cargoType:u.cargoType,target:u.target,order:u.order}}:e;})}};
}

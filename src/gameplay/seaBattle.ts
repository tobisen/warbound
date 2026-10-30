import {isSeaBattleMission,seaBattleDifficulty} from '../config/seaBattle';
import {factionForTeam} from '../config/factions';
import {matchFog} from './matchFog';
import {bodyFits,replaceObstacles} from './map';
import {domainMap,coastalFootprint,planDomainRoute,advanceDomainRoute} from './terrainNavigation';
import {entityVisible} from './visibility';
import {createNavy,type Ship} from './navy';
import {createEnemyNaval} from './enemyNaval';
import type {MatchState} from './match';
import type {Enemy} from './combat';
import type {Footprint} from './placement';

const ready={remainingSeconds:0,builderId:null};
/** Explicit initial expedition forces, not recurring rewards or unpaid production. */
export function initializeSeaBattle(m:MatchState):void {
 if(!isSeaBattleMission(m.campaignMission))return;
 const player=factionForTeam(m,'player'),enemy=factionForTeam(m,'enemy'),cfg=seaBattleDifficulty[m.difficulty??'normal'];
 const add=(foot:Footprint)=>m.map.obstacles.push(foot);
 const harbor={x:704,y:640,width:64,height:64};
 if(!coastalFootprint(m.map,harbor))throw Error('Stormgate harbor is not coastal');
 m.navy={...createNavy(),harbor:{owner:'player',hp:player.naval.harbor.hp,footprint:harbor,construction:{...ready}}};add(harbor);
 const barracks={x:480,y:512,width:64,height:64},forge={x:576,y:512,width:64,height:64};
 m.placement.barracks=barracks;m.placement.barracksHP=player.buildings.barracks.hp;m.placement.barracksOwner='player';m.placement.construction={...ready};add(barracks);
 m.placement.forge={id:'forge',owner:'player',hp:player.buildings.forge.hp,footprint:forge,construction:{...ready}};add(forge);
 for(let i=0;i<8;i++){const footprint={x:128+i%4*96,y:576+Math.floor(i/4)*96,width:64,height:64};m.placement.farms!.push({id:`farm-${i+1}`,owner:'player',hp:player.buildings.farm.hp,footprint,construction:{...ready}});add(footprint);}
 m.placement.nextFarmNumber=9;m.combat.baseDevelopment={level:2,remainingSeconds:null};
 m.gathering.wood=220;m.gathering.goldBalance=140;
 for(let i=0;i<4;i++){const position={x:464+i*40,y:416};m.gathering.units.push({id:`unit-${i+4}`,kind:'soldier',owner:'player',hp:player.units.soldier.hp,cargo:0,selected:false,position,target:{...position},order:{kind:'idle'}});}
 // Existing unarmed flyer scouts water and coast but cannot land or attack.
 const scoutPosition={x:576,y:384};m.gathering.units.push({id:'unit-8',kind:'soldier',archetype:'scout',owner:'player',hp:player.units.scout.hp,cargo:0,selected:false,position:scoutPosition,target:{...scoutPosition},order:{kind:'idle'}});
 m.production.nextUnitNumber=m.soldierProduction.nextUnitNumber=9;
 for(let i=0;i<16;i++){const role=i>=14?'transport':i>=12?'cutter':'warship',position={x:880+i%4*80,y:384+Math.floor(i/4)*96};const recipe=player.naval.units[role];m.navy.ships.push({id:`ship-${i+1}`,kind:'ship',role,owner:'player',hp:recipe.hp,selected:false,position,target:{...position},order:{kind:'idle'},...(role==='transport'?{passengers:[]}:{})});}
 m.navy.production.nextUnitNumber=17;
 m.enemyNaval={...createEnemyNaval(),phase:'finished',production:{remainingSeconds:null,nextUnitNumber:cfg.enemyShips+1}};
 for(let i=0;i<cfg.enemyShips;i++){
  const role=i>=cfg.enemyShips-2?'bombard':'warship',squad=Math.floor(i/5),position={x:1776+i%5*80,y:400+squad*256};
  m.combat.enemies.push({id:`enemy-ship-${i+1}`,owner:'enemy',kind:'ship',navalRole:role,hp:enemy.naval.units[role].hp,position,order:{kind:'idle'}});
 }
 const enemyHarbor={x:2368,y:832,width:64,height:64};
 if(!coastalFootprint(m.map,enemyHarbor))throw Error('Stormgate enemy harbor is not coastal');
 m.combat.enemies.push({id:'enemy-harbor',kind:'building',buildingType:'harbor',owner:'enemy',hp:enemy.naval.harbor.hp,position:{x:2400,y:864},footprint:enemyHarbor,construction:{...ready}});add(enemyHarbor);
 for(let i=0;i<8;i++){const footprint={x:2528+i%4*96,y:640+Math.floor(i/4)*96,width:64,height:64};m.combat.enemies.push({id:`enemy-farm-${i+1}`,kind:'building',buildingType:'farm',owner:'enemy',hp:enemy.buildings.farm.hp,position:{x:footprint.x+32,y:footprint.y+32},footprint,construction:{...ready}});add(footprint);}
 // Longbows/crossbows already attack ships from shore; these guards use ordinary target acquisition.
 for(let i=0;i<3;i++)m.combat.enemies.push({id:`enemy-produced-${i+1}`,kind:'unit',role:'archer',owner:'enemy',hp:enemy.units.archer.hp,position:{x:2496+i*64,y:928},order:{kind:'idle'}});
 if(m.enemyProduction){m.enemyProduction.production.nextUnitNumber=4;m.enemyProduction.acceptedJobs=3;m.enemyProduction.baseDevelopment={level:2,remainingSeconds:null};}
 const water=domainMap(m.map,'water');
 if([...m.navy.ships,...m.combat.enemies.filter(e=>e.kind==='ship')].some(s=>!bodyFits(water,s.position,16)))throw Error('Stormgate fleet starts outside navigable water');
 m.map=replaceObstacles(m.map,m.map.obstacles);m.fog=matchFog(m);
}
/** Authored staggered squadrons; no new spawns and no hidden target lookup. */
export function advanceSeaBattle(m:MatchState,delta:number):MatchState {
 if(!isSeaBattleMission(m.campaignMission)||delta<=0)return m;
 const cfg=seaBattleDifficulty[m.difficulty??'normal'],targets=(m.navy?.ships??[]).filter(s=>s.hp>0&&(!m.fog||entityVisible(m.fog,'enemy',s)));
 const enemies=m.combat.enemies.map((e):Enemy=>{
  if(e.kind!=='ship'||!e.navalRole||e.navalRole==='submarine'||e.hp<=0)return e;
  const target=targets.filter(s=>Math.hypot(s.position.x-e.position.x,s.position.y-e.position.y)<=448).sort((a,b)=>Math.hypot(a.position.x-e.position.x,a.position.y-e.position.y)-Math.hypot(b.position.x-e.position.x,b.position.y-e.position.y)||a.id.localeCompare(b.id))[0];
  if(target)return {...e,order:{kind:'defend',targetId:target.id}};
  if(m.waves.elapsedSeconds<cfg.release+Math.floor((Number(e.id.slice(11))-1)/5)*40)return {...e,order:{kind:'idle'}};
  const goal={x:864,y:704+(Number(e.id.slice(11))%3)*64},recipe=factionForTeam(m,'enemy').naval.units[e.navalRole];
  const route=e.order?.kind==='muster'&&e.navigation?e.navigation:planDomainRoute(m.map,'water',e.position,goal,recipe.size/2);
  const step=advanceDomainRoute(m.map,'water',e.position,route,recipe.size/2,recipe.speed,delta);
  return {...e,position:step.position,navigation:step.route,order:{kind:'muster',destination:goal}};
 });
 return {...m,combat:{...m.combat,enemies}};
}

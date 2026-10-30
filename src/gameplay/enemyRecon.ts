import {enemyNavigationMap} from './map';
import {enemyBase} from './enemyBases';
import {searchWaypoints} from './enemyKnowledge';
import {planRoute} from './navigation';
import {enemyUnitStats} from './enemyUnits';
import {entityVisible} from './visibility';
import {autoScoutGoal} from './scouting';
import {isExplored} from './fog';
import {strategyFor,strategySettings} from './enemyStrategy';
import type {MatchState} from './match';
import type {Position} from './movement';

export interface EnemyRecon {ids:string[];index:number;goal?:Position;blocked?:Position[];retreatUntil:number}
/** Called only at the strategic cadence. Routes and contacts use ordinary owner fog. */
export function prepareEnemyRecon(m:MatchState):MatchState {
 const strategy=strategyFor(m),home=enemyBase(m.combat,m.map);if(!strategy||!home)return m;
 const time=m.waves.elapsedSeconds,old:EnemyRecon=strategy.recon??{ids:[],index:0,retreatUntil:0};
 const attacking=new Set(m.enemyAI?.groups.filter(g=>g.status==='attack').flatMap(g=>g.members));
 const army=m.combat.enemies.filter(e=>e.hp>0&&e.kind==='unit'&&['soldier','archer','cavalry'].includes(e.role??'soldier')&&!e.navalLanding&&!attacking.has(e.id));
 let ids=old.ids.filter(id=>army.some(e=>e.id===id));
 if(time>=strategySettings(m).scoutSeconds&&!strategy.threatened&&!m.enemyNaval&&!ids.length&&army.length>=3){
  const candidate=army.filter(e=>!m.enemyAI?.reserve.includes(e.id)).sort((a,b)=>Number(b.role==='archer')-Number(a.role==='archer')||a.id.localeCompare(b.id,'en',{numeric:true}))[0];
  if(candidate)ids=[candidate.id];
 }
 if(!ids.length)return {...m,enemyPolicy:{...m.enemyPolicy!,strategy:{...strategy,recon:{...old,ids}}}};
 const members=m.combat.enemies.filter(e=>ids.includes(e.id)),scout=members[0];
 const hostiles=m.gathering.units.filter(u=>u.kind==='soldier'&&u.hp>0&&(!m.fog||entityVisible(m.fog,'enemy',u)));
 const danger=members.some(e=>e.hp<enemyUnitStats(e,m.factions?.enemy).hp*.6||hostiles.some(u=>Math.hypot(e.position.x-u.position.x,e.position.y-u.position.y)<352));
 const towers=m.aiContext?.humanHostile===false?[]:(m.placement.defenses??[]).filter(t=>t.kind==='tower'&&t.hp>0&&(!m.fog||entityVisible(m.fog,'enemy',{footprint:t.footprint,position:{x:t.footprint.x+16,y:t.footprint.y+16}})));
 let retreatUntil=old.retreatUntil;
 if(danger||members.some(e=>towers.some(t=>Math.hypot(e.position.x-t.footprint.x,e.position.y-t.footprint.y)<384)))retreatUntil=time+45;
 let index=old.index,goal=old.goal;const blocked=[...(old.blocked??[])];
 if(scout.navigation?.status==='blocked'&&goal&&!blocked.some(p=>p.x===goal!.x&&p.y===goal!.y))blocked.push(goal);
 const returning=old.retreatUntil>0&&old.goal?.x===home.position.x-128&&old.goal?.y===home.position.y+160;
 if(strategy.threatened||time<retreatUntil)goal={x:home.position.x-128,y:home.position.y+160};
 else if(!goal||returning&&time>=old.retreatUntil||Math.hypot(scout.position.x-goal.x,scout.position.y-goal.y)<64||scout.navigation?.status==='arrived'||scout.navigation?.status==='blocked'){
  const points=[...searchWaypoints(m,'resource'),...searchWaypoints(m,'attack')];
  if(goal)index++;
  while(index<points.length&&m.fog&&isExplored(m.fog,'enemy',points[index]))index++;
  goal=index<points.length?points[index]:autoScoutGoal(m,scout.position,'enemy',goal,blocked.slice(-256));
 }
 // A single scout needs one route, not a formation search. Keep the active route
 // when a goal was adjusted or terrain changed; normal navigation repairs revisions.
 const changed=old.goal?.x!==goal!.x||old.goal?.y!==goal!.y||members.some(e=>e.order?.kind!=='muster'||e.navigation?.status==='blocked');
 let enemies=m.combat.enemies;
 if(changed)enemies=enemies.map(e=>ids.includes(e.id)?{...e,navigation:planRoute({...enemyNavigationMap(m.map),bodyHalf:enemyUnitStats(e,m.factions?.enemy).size/2},e.position,goal!,(e.navigation?.commandNumber??0)+1),order:{kind:'muster',destination:{...goal!}}}:e);
 return {...m,combat:{...m.combat,enemies},enemyPolicy:{...m.enemyPolicy!,strategy:{...strategy,recon:{ids,index,goal,blocked:blocked.slice(-256),retreatUntil}}}};
}

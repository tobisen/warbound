import {battleEnemies,validSeaMonsterAreas,seaMonsterTarget} from './bosses';
import {unitBody} from './spawning';
import {acquireTargets} from './acquisition';
import {threatResponseConfig as cfg} from '../config/threatResponse';
import {factions} from '../config/factions';
import {combatUnitStats,unitStats,workerStats} from '../config/unit';
import {canAttackDomain,isAir,movementMap,targetDomain} from './domains';
import {domainMap} from './terrainNavigation';
import {bodyFits} from './map';
import {planRoute,advanceRoute,type RouteState} from './navigation';
import {canDefend} from './selfDefense';
import {canHarm} from './players';
import {entityVisible} from './visibility';
import {enemyRangedStats,enemyUnitStats} from './enemyUnits';
import type {MatchState} from './match';
import type {Unit} from './gathering';
import type {Ship} from './navy';
import type {Enemy} from './combat';
import type {Position} from './movement';
export interface ThreatRetreat {order:object;attackerId:string;route:RouteState;nextPlan:number}
export function retreating(u:Unit|Ship):boolean{return !!u.threatRetreat&&u.threatRetreat.order===u.order;}
const distance=(a:Position,b:Position)=>Math.hypot(a.x-b.x,a.y-b.y);
function segmentDistance(p:Position,a:Position,b:Position){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return distance(p,{x:a.x+t*dx,y:a.y+t*dy});}
/** Pure bounded local response. No new order, queue, cargo or work identity is created. */
export function prepareThreatResponses(m:MatchState,delta:number):MatchState {
 if(delta<=0||m.paused||m.outcome!=='playing')return m;
 const time=m.waves.elapsedSeconds,faction=m.factions?.player??'crown';
 const seaAreas=m.bosses?.sea?.length?validSeaMonsterAreas(m.map):[];
 const hostiles=battleEnemies(m).filter(e=>e.hp>0&&(!e.footprint||e.boss)&&canHarm('player',e.playerId??'enemy',m.multiplePlayers?.roster)&&(!m.fog||entityVisible(m.fog,'player',e)));
 const respond=(original:Unit|Ship):Unit|Ship=>{
  let u=original;
  if((u.hp??0)<=0)return u;
  if(u.threatHit){const remainingSeconds=(u.threatHit.remainingSeconds??2)-delta;u={...u,threatHit:remainingSeconds>0?{...u.threatHit,remainingSeconds}:undefined};}
  // Move/attack/hold/Stop and transport transfers belong to the player. Patrol
  // and economic work can pause locally, then resume with their original goals.
  const eligible=u.commandMode?.kind!=='hold'&&!(u.kind==='ship'&&u.transfer)&&!(u.kind==='soldier'&&u.autoDisabled)&&u.order.kind!=='attack'&&(u.order.kind!=='move'||u.commandMode?.kind==='patrol');
  if(!eligible)return u.threatRetreat?{...u,threatRetreat:undefined}:u;
  const active=retreating(u)?u.threatRetreat:undefined;
  if(!active&&!u.threatHit&&u.threatCheck?.order===u.order&&u.threatCheck.after>time)return u;
  u={...u,threatCheck:{order:u.order,after:time+cfg.checkSeconds}};
  const threatens=(e:Enemy)=>{const f=e.faction??m.factions?.enemy??'clans',naval=e.kind==='ship'&&!e.seaMonster?factions[f].naval.units[e.navalRole??'transport']:undefined,ranged=enemyRangedStats(e,f),range=naval?.range??ranged?.range??enemyUnitStats(e,f).range;
   const remembered=u.threatHit?.order===u.order&&u.threatHit.attackerId===e.id||active?.attackerId===e.id;
   if(e.kind==='worker'&&!remembered&&e.selfDefense?.attackerId!==u.id&&!(e.order?.kind==='defend'&&e.order.targetId===u.id))return false;
   const directed=u.threatHit?.attackerId===e.id&&u.threatHit.order===u.order||e.selfDefense?.attackerId===u.id||e.order?.kind==='defend'&&e.order.targetId===u.id;
   if(u.kind==='worker'&&u.order.kind!=='idle'&&!directed&&e.order?.kind!=='attack-move')return false;
   const notice=naval||ranged||e.boss||e.seaMonster?cfg.noticeRadius:cfg.meleeNotice;
   const zone=e.seaMonster?seaAreas.find(z=>z.id===e.seaMonster!.id):undefined;
   const compatible=e.seaMonster?!!zone&&seaMonsterTarget(m.map,zone,{id:u.id,kind:u.kind,owner:'player',hp:u.hp??0,domain:targetDomain(u),footprint:unitBody(u.position,u.kind==='ship'?factions[faction].naval.units[u.role??'warship'].size:u.kind==='worker'?unitStats.size:combatUnitStats(u,faction).size)}):canAttackDomain(naval?{...e,role:e.navalRole}:e,u,f);
   return distance(u.position,e.position)<=Math.max(active?Math.min(cfg.releaseRadius,notice+96):notice,remembered?range+32:0)&&compatible&&(!!e.boss||!!e.seaMonster||(naval?.damage??ranged?.damage??enemyUnitStats(e,f).damagePerSecond)>0);
  };
  const threats=hostiles.filter(threatens);
  if(!threats.length)return active?{...u,threatRetreat:undefined,navigation:undefined}:u;
  threats.sort((a,b)=>distance(u.position,a.position)-distance(u.position,b.position)||a.id.localeCompare(b.id));
  const threat=threats.find(e=>e.id===active?.attackerId)??threats[0];
  if(canDefend(u,threat,faction,m.map))return {...u,threatRetreat:undefined,selfDefense:{attackerId:threat.id,order:u.order}};
  if(u.kind==='soldier'){const acquired=acquireTargets([{...u,threatRetreat:undefined}],threats,m.map,()=>true,faction)[0];if(acquired.order.kind==='attack')return acquired;}
  const stats=u.kind==='ship'?factions[faction].naval.units[u.role??'warship']:u.kind==='worker'?workerStats(faction):combatUnitStats(u,faction),half=(u.kind==='worker'?unitStats.size:stats.size)/2;
  const map={...(u.kind==='ship'?domainMap(m.map,'water'):movementMap(m.map,u)),bodyHalf:half};
  let retreat=active;
  if(!retreat||time>=retreat.nextPlan&&(retreat.route.status!=='moving'||distance(u.position,threat.position)<96)){
   const safety=(p:Position)=>Math.min(...threats.map(e=>distance(p,e.position))),current=safety(u.position),candidates:Position[]=[];
   for(const radius of cfg.escapeDistances)for(let i=0;i<16;i++){const a=i*Math.PI/8,p={x:u.position.x+Math.cos(a)*radius,y:u.position.y+Math.sin(a)*radius};if(safety(p)>=current+cfg.minimumGain&&bodyFits(map,p,half))candidates.push(p);}
   candidates.sort((a,b)=>safety(b)-safety(a)||distance(a,u.position)-distance(b,u.position)||a.y-b.y||a.x-b.x);
   for(const p of candidates.slice(0,cfg.candidateRoutes)){
    const route=planRoute(map,u.position,p);if(route.status==='blocked')continue;
    const path=[u.position,...route.waypoints];
    if(threats.some(e=>path.slice(1).some((b,i)=>segmentDistance(e.position,path[i],b)<Math.min(48,distance(u.position,e.position)-6))))continue;
    retreat={order:u.order,attackerId:threat.id,route,nextPlan:time+cfg.replanSeconds};break;
   }
   if(!retreat)return {...u,orderError:'No safe escape route'};
   retreat={...retreat,nextPlan:time+cfg.replanSeconds};
  }
  if(!retreat)return u;
  const moved=advanceRoute(map,u.position,retreat.route,stats.speed,delta);
  return {...u,position:moved.position,selfDefense:undefined,orderError:undefined,threatRetreat:{...retreat,route:moved.route}};
 };
 return {...m,gathering:{...m.gathering,units:m.gathering.units.map(u=>respond(u) as Unit)},...(m.navy?{navy:{...m.navy,ships:m.navy.ships.map(u=>respond(u) as Ship)}}:{})};
}

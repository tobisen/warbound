import {isIslandMap,islandCharts,islandMaps} from '../config/islandMaps';
import {enemyNavigationMap} from './map';
import {planRoute} from './navigation';
import {islandNavalPlan} from './islandNavalPlan';
import type {MatchState} from './match';
import type {Position} from './movement';
export interface EnemyColony {target:Position;workerId:string;guardId:string;stage:'loading'|'sailing'|'settling';startedSeconds:number}
const distance=(a:Position,b:Position)=>Math.hypot(a.x-b.x,a.y-b.y);
/** Public chart positions guide exploration. Deposits and construction still require actual vision. */
export function colonyDestination(m:MatchState):Position|undefined {
 if(!isIslandMap(m.map.id))return;
 const home=m.combat.enemies.find(e=>e.kind==='base')?.position;if(!home)return;
 const starts=m.aiContext?.chartedStarts??islandMaps[m.map.id].skirmishStarts!.slice(0,2);
 const remoteBase=m.combat.enemies.some(e=>e.buildingType==='outpost'&&distance(e.position,home)>800);
 if(remoteBase&&!m.combat.enemies.some(e=>e.kind==='unit'&&e.navalLanding&&starts.some(s=>distance(s,home)>800&&distance(e.position,s)<700)))return;
 const candidates=islandCharts(m.map.id).filter(p=>distance(p,home)>800&&!m.combat.enemies.some(e=>(e.kind==='base'||e.buildingType==='outpost')&&distance(e.position,p)<800))
  .sort((a,b)=>Number(starts.some(s=>distance(s,a)<400))-Number(starts.some(s=>distance(s,b)<400))||distance(a,home)-distance(b,home))
  // Occupied start islands are attacked first. Neutral islands can be settled before fighting.
  ;
 const neutral=candidates.find(p=>!starts.some(s=>distance(s,p)<400));if(neutral)return neutral;
 // On fully occupied charts, a surviving assault must establish a foothold first.
 const beachhead=candidates.find(p=>m.combat.enemies.some(e=>e.kind==='unit'&&e.navalLanding&&e.hp>0&&distance(e.position,p)<700));
 return beachhead?{x:beachhead.x,y:beachhead.y+256}:undefined;
}
export function prepareEnemyColony(m:MatchState):MatchState {
 const state=m.enemyNaval;if(!state||m.paused||m.outcome!=='playing'||!isIslandMap(m.map.id))return m;
 if(state.colony){
  const c=state.colony,worker=[...m.combat.enemies,...state.passengers].find(e=>e.id===c.workerId&&e.hp>0);
  const complete=c.stage==='settling'&&m.combat.enemies.some(e=>e.buildingType==='outpost'&&e.construction?.remainingSeconds===0&&distance(e.position,c.target)<800);
  if(!worker||complete||c.stage!=='sailing'&&m.waves.elapsedSeconds-c.startedSeconds>240)return {...m,enemyNaval:{...state,colony:undefined,nextColonySeconds:m.waves.elapsedSeconds+90},combat:{...m.combat,enemies:m.combat.enemies.map(e=>e.id===c.workerId&&e.work?.order.kind==='move'?{...e,navigation:undefined,work:{...e.work,order:{kind:'idle'}}}:e)}};
  return m;
 }
 if(!m.combat.enemies.some(e=>e.kind==='ship'&&!e.navalRole&&e.hp>0)||state.phase!=='waiting'||m.waves.elapsedSeconds<(state.nextColonySeconds??(m.aiProfile==='economic'?150:m.aiProfile==='offensive'?450:240))||m.enemyAI?.threatId)return m;
 const escorts=m.combat.enemies.filter(e=>e.kind==='ship'&&e.navalRole&&e.navalRole!=='survey'&&e.navalRole!=='tender'&&e.hp>0);if(escorts.length<(m.aiProfile==='economic'?1:2))return m;
 const target=colonyDestination(m);if(!target)return m;
 const cfg=islandNavalPlan(m),workers=m.combat.enemies.filter(e=>e.work&&e.hp>0&&e.work.cargo===0&&e.work.order.kind!=='build');if(workers.length<3)return m;
 const worker=workers.find(e=>planRoute(enemyNavigationMap(m.map),e.position,cfg.loading).status!=='blocked');
 const guard=m.combat.enemies.find(e=>e.kind==='unit'&&e.id.startsWith('enemy-produced-')&&!e.navalLanding&&e.role!=='air'&&e.role!=='scout'&&e.hp>0&&planRoute(enemyNavigationMap(m.map),e.position,cfg.loading).status!=='blocked');if(!worker||!guard)return m;
 const committed=new Set([worker.id,guard.id]);
 return {...m,enemyNaval:{...state,phase:'loading',colony:{target,workerId:worker.id,guardId:guard.id,stage:'loading',startedSeconds:m.waves.elapsedSeconds}},
  ...(m.enemyAI?{enemyAI:{...m.enemyAI,reserve:m.enemyAI.reserve.filter(id=>!committed.has(id)),defenders:m.enemyAI.defenders.filter(d=>!committed.has(d.id)),groups:m.enemyAI.groups.map(g=>({...g,members:g.members.filter(id=>!committed.has(id)),destinations:Object.fromEntries(Object.entries(g.destinations).filter(([id])=>!committed.has(id)))})).filter(g=>g.members.length)}}:{}),
  combat:{...m.combat,enemies:m.combat.enemies.map(e=>e.id===worker.id?{...e,navigation:planRoute(enemyNavigationMap(m.map),e.position,cfg.loading),work:{...e.work!,target:cfg.loading,order:{kind:'move'}}}:e.id===guard.id?{...e,navalLanding:true,navigation:planRoute(enemyNavigationMap(m.map),e.position,cfg.loading),order:{kind:'muster',destination:cfg.loading}}:e)}};
}

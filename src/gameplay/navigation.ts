import {movementMap,isAir} from './domains';
import type {FactionId} from '../config/factions';
import { navigationConfig } from '../config/navigation';
import type { MovementGate } from './traffic';
import { soldierStats, combatUnitStats, unitStats,workerStats } from '../config/unit';
import type { Unit } from './gathering';
import { nearbyObstacles, bodyFits, tileCenter, worldTile, type Tile, type WorldMap } from './map';
import { moveTowards, type Position } from './movement';

export type RouteError = 'outside-world' | 'blocked-target' | 'blocked-start' | 'unreachable' | 'no-space';
export interface RouteState {
  commandNumber: number;
  goalKey?: string;
  retryAfter?: number;
  targetId?: string;
  destination: Position;
  waypoints: Position[];
  revision: number;
  status: 'moving' | 'arrived' | 'blocked';
  error?: RouteError;
}
export type RouteResult = { ok: true; waypoints: Position[] } | { ok: false; error: RouteError };
const key = (tile: Tile) => `${tile.column},${tile.row}`;
const same = (a: Position, b: Position) => a.x === b.x && a.y === b.y;
const directions=[[0,-1],[1,0],[0,1],[-1,0]] as const;

/** Swept square-body collision, including the connector between a point and a tile center. */
export function segmentFits(map: WorldMap, a: Position, b: Position, half = map.bodyHalf??navigationConfig.halfBody): boolean {
  if (!bodyFits(map, a, half) || !bodyFits(map, b, half)) return false;
  for (const obstacle of nearbyObstacles(map,{x:Math.min(a.x,b.x)-half,y:Math.min(a.y,b.y)-half,width:Math.abs(b.x-a.x)+half*2,height:Math.abs(b.y-a.y)+half*2})) {
    let enter = 0, exit = 1;
    for (const axis of ['x', 'y'] as const) {
      const extent = axis === 'x' ? obstacle.width : obstacle.height;
      const low = obstacle[axis] - half + 1e-9, high = obstacle[axis] + extent + half - 1e-9;
      const delta = b[axis] - a[axis];
      if (delta === 0) { if (a[axis] < low || a[axis] > high) { enter = 2; break; } }
      else {
        const t1 = (low - a[axis]) / delta, t2 = (high - a[axis]) / delta;
        enter = Math.max(enter, Math.min(t1, t2)); exit = Math.min(exit, Math.max(t1, t2));
      }
    }
    if (enter <= exit) return false;
  }
  return true;
}

function connectors(map: WorldMap, point: Position, half: number): Tile[] {
  const tile = worldTile(map, point)!;
  const result: Tile[] = [];
  // Fixed local connector search permits valid off-center starts beside partial footprints.
  for (let row = tile.row - 1; row <= tile.row + 1; row++) {
    for (let column = tile.column - 1; column <= tile.column + 1; column++) {
      const candidate = { column, row }, center = tileCenter(map, candidate);
      if (center && segmentFits(map, point, center, half)) result.push(candidate);
    }
  }
  return result.sort((a,b) => {
    const ca=tileCenter(map,a)!,cb=tileCenter(map,b)!;
    return Math.hypot(ca.x-point.x,ca.y-point.y)-Math.hypot(cb.x-point.x,cb.y-point.y)
      || a.row-b.row || a.column-b.column;
  });
}

const connectivityCache=new WeakMap<WorldMap['obstacles'],{length:number;entries:Map<string,{labels:Int32Array;next:number;points:Map<string,Tile[]>}>}>();
/** Placement needs connectivity, never a shortest path. Label each visited component
 * once per terrain/body snapshot, sharing work across actors and building anchors. */
export function placementRouteExists(map:WorldMap,start:Position,destination:Position):boolean {
 const half=map.bodyHalf??navigationConfig.halfBody;
 const columns=Math.ceil(map.width/map.tileSize),rows=Math.ceil(map.height/map.tileSize),target=map.interactionTarget,body=map.blockingTarget;
 const cacheKey=`${map.width}:${map.height}:${map.tileSize}:${map.revision}:${half}:${target?`${target.x},${target.y},${target.width},${target.height}`:''}:${body?`${body.x},${body.y},${body.width},${body.height}`:''}`;
 let cache=connectivityCache.get(map.obstacles);
 if(!cache||cache.length!==map.obstacles.length){cache={length:map.obstacles.length,entries:new Map()};connectivityCache.set(map.obstacles,cache);}
 let entry=cache.entries.get(cacheKey);
 if(!entry&&segmentFits(map,start,destination,half))return true;
 if(!entry){entry={labels:new Int32Array(columns*rows),next:0,points:new Map()};if(cache.entries.size>=8)cache.entries.delete(cache.entries.keys().next().value!);cache.entries.set(cacheKey,entry);}
 const points=(p:Position)=>{const key=`${p.x},${p.y}`;let result=entry!.points.get(key);if(!result){result=bodyFits(map,p,half)?connectors(map,p,half):[];if(entry!.points.size>=4096)entry!.points.clear();entry!.points.set(key,result);}return result;};
 const index=(t:Tile)=>t.row*columns+t.column,starts=points(start),goals=points(destination),canStep=gridSteps(map,half);
 if(!starts.length||!goals.length)return segmentFits(map,start,destination,half);
 for(const first of starts){
  const firstIndex=index(first);
  if(!entry.labels[firstIndex]){
   const label=++entry.next,queue=[first];entry.labels[firstIndex]=label;
   for(let cursor=0;cursor<queue.length;cursor++){
    const tile=queue[cursor];
    for(const [dx,dy] of directions){
     const next={column:tile.column+dx,row:tile.row+dy};
     if(next.column<0||next.row<0||next.column>=columns||next.row>=rows||entry.labels[index(next)])continue;
     if(canStep(tile,next)){entry.labels[index(next)]=label;queue.push(next);}
    }
   }
  }
  if(goals.some(g=>entry!.labels[index(g)]===entry!.labels[firstIndex]))return true;
 }
 return segmentFits(map,start,destination,half);
}

const gridCache=new WeakMap<WorldMap['obstacles'],{length:number;entries:Map<string,{known:Uint8Array;open:Uint8Array}>}>();
/** Reuse exact swept tile edges across different destinations and army members.
 * Dynamic target bodies are checked separately; they never invalidate terrain. */
function gridSteps(map:WorldMap,half:number):(a:Tile,b:Tile)=>boolean {
 const columns=Math.ceil(map.width/map.tileSize),rows=Math.ceil(map.height/map.tileSize);
 const ignored=map.interactionTarget,key=`${map.width}:${map.height}:${map.tileSize}:${map.revision}:${half}:${ignored?`${ignored.x},${ignored.y},${ignored.width},${ignored.height}`:''}`;
 let cache=gridCache.get(map.obstacles);if(!cache||cache.length!==map.obstacles.length){cache={length:map.obstacles.length,entries:new Map()};gridCache.set(map.obstacles,cache);}
 let grid=cache.entries.get(key);if(!grid){grid={known:new Uint8Array(columns*rows),open:new Uint8Array(columns*rows)};if(cache.entries.size>=8)cache.entries.delete(cache.entries.keys().next().value!);cache.entries.set(key,grid);}
 const staticMap=map.blockingTarget?{...map,blockingTarget:undefined}:map;
 const center=(t:Tile)=>({x:t.column*map.tileSize+Math.min(map.tileSize,map.width-t.column*map.tileSize)/2,y:t.row*map.tileSize+Math.min(map.tileSize,map.height-t.row*map.tileSize)/2});
 return (a,b)=>{
 if(b.column<0||b.row<0||b.column>=columns||b.row>=rows)return false;
 const direction=b.column>a.column?1:b.column<a.column?2:b.row>a.row?4:8,index=a.row*columns+a.column;
 const start=center(a),end=center(b);
 if(!(grid.known[index]&direction)){
  const fits=segmentFits(staticMap,start,end,half),reverse=direction===1?2:direction===2?1:direction===4?8:4,other=b.row*columns+b.column;
  grid.known[index]|=direction;grid.known[other]|=reverse;
  if(fits){grid.open[index]|=direction;grid.open[other]|=reverse;}
 }
 if(!(grid.open[index]&direction))return false;
 const body=map.blockingTarget;
 return !body||body.x>Math.max(start.x,end.x)+half||body.x+body.width<Math.min(start.x,end.x)-half||body.y>Math.max(start.y,end.y)+half||body.y+body.height<Math.min(start.y,end.y)-half||segmentFits(map,start,end,half);
 };
}

interface GoalTree {queue:Tile[];cursor:number;parent:Map<string,Tile|null>;depth:Map<string,number>}
const goalCache=new WeakMap<WorldMap['obstacles'],{length:number;goals:Map<string,GoalTree>}>();
/** Linear string pulling: keep only bends that the complete square body cannot bypass. */
function simplifyRoute(map:WorldMap,start:Position,route:Position[],half:number):Position[] {
 const result:Position[]=[];let anchor=start,lastSafe:Position|undefined;
 for(const point of route){
  if(segmentFits(map,anchor,point,half)){lastSafe=point;continue;}
  if(!lastSafe)return route;
  result.push(lastSafe);anchor=lastSafe;
  if(!segmentFits(map,anchor,point,half))return route;
  lastSafe=point;
 }
 if(lastSafe&&!same(anchor,lastSafe))result.push(lastSafe);
 return result;
}
/** Bounded synchronous four-neighbor BFS; stable tie order, no diagonal corner cutting. */
export function findRoute(map: WorldMap, start: Position, destination: Position,
  half = map.bodyHalf??navigationConfig.halfBody): RouteResult {
  if (!worldTile(map, destination)) return { ok: false, error: 'outside-world' };
  if (!bodyFits(map, destination, half)) return { ok: false, error: 'blocked-target' };
  if (!bodyFits(map, start, half)) return { ok: false, error: 'blocked-start' };
  if (same(start, destination)) return { ok: true, waypoints: [] };
  // Avoid backtracking to tile centers when the exact destination already has a safe direct segment.
  if (segmentFits(map,start,destination,half)) return {ok:true,waypoints:[{...destination}]};
  const target=map.interactionTarget,body=map.blockingTarget;
  const cacheKey=`${target?`${target.x},${target.y},${target.width},${target.height}`:''}:${body?`${body.x},${body.y},${body.width},${body.height}`:''}:${map.width}:${map.height}:${map.tileSize}:${map.revision}:${half}:${destination.x},${destination.y}`;
  let cache=goalCache.get(map.obstacles);if(!cache||cache.length!==map.obstacles.length){cache={length:map.obstacles.length,goals:new Map()};goalCache.set(map.obstacles,cache);}
  let tree=cache.goals.get(cacheKey);if(!tree){const queue=connectors(map,destination,half);tree={queue,cursor:0,parent:new Map(queue.map(t=>[key(t),null])),depth:new Map(queue.map(t=>[key(t),0]))};if(cache.goals.size>=32)cache.goals.delete(cache.goals.keys().next().value!);cache.goals.set(cacheKey,tree);}
  const starts=connectors(map,start,half),startKeys=new Set(starts.map(key)),canStep=gridSteps(map,half);
  let bestDepth=Math.min(...starts.map(t=>tree!.depth.get(key(t))??Infinity));
  // A single bounded reverse BFS serves carriers sharing a delivery point. Finish
  // the preceding level so equal-depth tie order never depends on earlier queries.
  while(tree.cursor<tree.queue.length&&tree.cursor<navigationConfig.maxVisited&&(bestDepth===Infinity||(tree.depth.get(key(tree.queue[tree.cursor]))??Infinity)<bestDepth)){
    const tile=tree.queue[tree.cursor++],depth=tree.depth.get(key(tile))!;
    for(const [dx,dy]of directions){const neighbor={column:tile.column+dx,row:tile.row+dy},id=key(neighbor);if(tree.parent.has(id))continue;const next=tileCenter(map,neighbor);if(next&&canStep(tile,neighbor)){tree.parent.set(id,tile);tree.depth.set(id,depth+1);tree.queue.push(neighbor);if(startKeys.has(id))bestDepth=Math.min(bestDepth,depth+1);}}
  }
  // More small shared goals, with the previous eight-full-search node budget.
  while(cache.goals.size>1&&[...cache.goals.values()].reduce((sum,t)=>sum+t.queue.length,0)>navigationConfig.maxVisited*8)cache.goals.delete(cache.goals.keys().next().value!);
  const first=starts.find(t=>tree!.depth.get(key(t))===bestDepth);if(!first)return {ok:false,error:'unreachable'};
  const route:Position[]=[];let current:Tile|null=first;while(current){route.push(tileCenter(map,current)!);current=tree.parent.get(key(current))??null;}
  if(!same(route[route.length-1],destination))route.push({...destination});
  return {ok:true,waypoints:simplifyRoute(map,start,route,half)};
}

export function planRoute(map: WorldMap, position: Position, destination: Position, commandNumber=1): RouteState {
  const result=findRoute(map,position,destination);
  return { commandNumber, destination:{...destination}, revision:map.revision,
    waypoints:result.ok?result.waypoints:[],status:result.ok?(result.waypoints.length?'moving':'arrived'):'blocked',
    ...(!result.ok?{error:result.error}:{}) };
}

export function advanceRoute(map: WorldMap, position: Position, route: RouteState, speed: number, delta: number, gate?:MovementGate) {
  const current=route.revision===map.revision?route:planRoute(map,position,route.destination,route.commandNumber);
  let point={...position},remaining=Math.max(0,gate?gate(position,current,speed,Math.max(0,delta)):delta);
  if(current.status==='blocked')return {position:point,route:current,remaining};
  const waypoints=current.waypoints.map(p=>({...p}));
  while(waypoints.length) {
    const target=waypoints[0],distance=Math.hypot(target.x-point.x,target.y-point.y);
    if(!segmentFits(map,point,target))return {position:point,remaining,
      route:{...current,waypoints:[],status:'blocked' as const,error:'unreachable' as const}};
    if(distance===0){waypoints.shift();continue;}
    if(speed<=0 || remaining<=0)break;
    const time=distance/speed;
    point=remaining >= time ? {...target} : moveTowards(point,target,speed,remaining);
    remaining=Math.max(0,remaining-time);
    if(same(point,target))waypoints.shift();else break;
  }
  return {position:point,remaining,route:{...current,waypoints,status:waypoints.length?'moving' as const:'arrived' as const}};
}

export function commandMappedMove(units: Unit[], destination: Position, map: WorldMap): Unit[] {
  return units.map(unit=>{
    if(!unit.selected)return unit;
    const unitMap={...movementMap(map,unit),bodyHalf:(unit.kind==='worker'?unitStats:combatUnitStats(unit)).size/2};
    if(isAir(unit)&&!bodyFits(unitMap,destination,unitMap.bodyHalf))return unit;
    const navigation=planRoute(unitMap,unit.position,destination,(unit.navigation?.commandNumber??0)+1);
    return {...unit,...(unit.kind==='soldier'?{attackMoveTarget:undefined,autoOrigin:undefined,autoDisabled:false}:{}),navigation,target:{...destination},order:{kind:navigation.status==='moving'?'move':'idle'}};
  });
}

export function updateMappedMove(unit: Unit, map: WorldMap, delta: number, gate?:MovementGate,faction?:FactionId): Unit {
  map={...movementMap(map,unit),bodyHalf:(unit.kind==='worker'?unitStats:combatUnitStats(unit,faction)).size/2};
  const route=unit.navigation??planRoute(map,unit.position,unit.target);
  const step=advanceRoute(map,unit.position,route,unit.kind==='worker'?workerStats(faction).speed:combatUnitStats(unit,faction).speed,delta,gate);
  return {...unit,position:step.position,navigation:step.route,
    order:{kind:step.route.status==='moving'?'move':'idle'}};
}

/** One bounded search for all free formation slots, rather than one failed BFS per slot. */
export function findFormationRoute(map:WorldMap,start:Position,candidates:readonly Position[],half:number):{destination:Position;waypoints:Position[]}|undefined {
 if(!bodyFits(map,start,half)||!candidates.length)return undefined;
 const first=candidates[0];if(same(start,first))return {destination:first,waypoints:[]};if(segmentFits(map,start,first,half))return {destination:first,waypoints:[{...first}]};
 const goals=new Map<string,{destination:Position;index:number}>();
 candidates.forEach((destination,index)=>{for(const tile of connectors(map,destination,half))if(!goals.has(key(tile)))goals.set(key(tile),{destination,index});});
 const canStep=gridSteps(map,half);
 const queue=connectors(map,start,half),parent=new Map<string,Tile|null>(queue.map(t=>[key(t),null]));
 let best:{tile:Tile;destination:Position;index:number}|undefined;
 for(let index=0;index<queue.length&&index<navigationConfig.maxVisited;index++){
  const tile=queue[index],goal=goals.get(key(tile));
  if(goal&&(!best||goal.index<best.index)){best={...goal,tile};if(goal.index===0)break;}
  for(const [dx,dy]of directions){const neighbor={column:tile.column+dx,row:tile.row+dy};if(parent.has(key(neighbor)))continue;const next=tileCenter(map,neighbor);if(next&&canStep(tile,neighbor)){parent.set(key(neighbor),tile);queue.push(neighbor);}}
 }
 if(!best)return undefined;
 const route:Position[]=[];let current:Tile|null=best.tile;while(current){route.unshift(tileCenter(map,current)!);current=parent.get(key(current))??null;}if(!same(route[route.length-1],best.destination))route.push({...best.destination});return {destination:best.destination,waypoints:simplifyRoute(map,start,route,half)};
}

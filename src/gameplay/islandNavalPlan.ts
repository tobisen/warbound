import {isIslandMap,islandMaps} from '../config/islandMaps';
import {enemyNavalConfig} from '../config/enemyNaval';
import {createMap,bodyFits,replaceObstacles,overlaps} from './map';
import {coastalFootprint,domainMap,planDomainRoute} from './terrainNavigation';
import {findRoute} from './navigation';
import type {MatchState} from './match';
import type {Position} from './movement';
import type {Footprint} from './placement';
type Shore={land:Position;water:Position};
export type IslandNavalPlan=typeof enemyNavalConfig&{beaches?:Shore[]};
const cache=new Map<string,IslandNavalPlan>();
const distance=(a:Position,b:Position)=>Math.hypot(a.x-b.x,a.y-b.y);
/** Derive geography from public map terrain, never hidden enemy units or buildings. */
export function islandNavalPlan(m:MatchState,targetOverride?:Position):IslandNavalPlan {
 if(!isIslandMap(m.map.id))return enemyNavalConfig;
 const base=m.combat.enemies.find(e=>e.kind==='base')?.position??islandMaps[m.map.id].skirmishStarts![1];
 const target=targetOverride??m.aiContext?.attackWaypoints.at(-1)??islandMaps[m.map.id].skirmishStarts![0];
 const key=`${m.map.id}:${base.x},${base.y}:${target.x},${target.y}`;const old=cache.get(key);if(old)return old;
 const terrain=createMap(m.map.id,undefined,'trees','expanded',m.map.design),water=domainMap(terrain,'water'),shores:Shore[]=[];
 for(let y=48;y<terrain.height-32;y+=32)for(let x=48;x<terrain.width-32;x+=32){const land={x,y};if(!bodyFits(terrain,land,12))continue;
  for(const [dx,dy]of [[32,0],[-32,0],[0,32],[0,-32]]){const sea={x:x+dx,y:y+dy};if(bodyFits(water,sea,16))shores.push({land,water:sea});}
 }
 const home=shores.filter(s=>distance(s.land,base)<800&&findRoute(terrain,base,s.land).ok).sort((a,b)=>distance(a.land,base)+distance(a.water,target)*.2-distance(b.land,base)-distance(b.water,target)*.2);
 const beaches=shores.filter(s=>distance(s.land,target)<800&&findRoute(terrain,s.land,target).ok).sort((a,b)=>distance(a.water,base)+distance(a.land,target)*.5-distance(b.water,base)-distance(b.land,target)*.5);
 for(const shore of home.slice(0,48)){
  const candidates:Footprint[]=[];for(let dy=-128;dy<=128;dy+=32)for(let dx=-128;dx<=128;dx+=32)candidates.push({x:Math.floor(shore.land.x/32)*32+dx,y:Math.floor(shore.land.y/32)*32+dy,width:64,height:64});
  const harbor=candidates.filter(rect=>coastalFootprint(terrain,rect)&&!overlaps(rect,{x:shore.land.x-24,y:shore.land.y-24,width:48,height:48})&&!overlaps(rect,{x:shore.water.x-16,y:shore.water.y-16,width:32,height:32})).sort((a,b)=>distance(a,base)-distance(b,base)).find(rect=>findRoute(replaceObstacles(terrain,[...terrain.obstacles,rect]),base,shore.land).ok);
  if(!harbor)continue;
  const reachable=beaches.filter(s=>planDomainRoute(terrain,'water',shore.water,s.water,16).status!=='blocked');if(!reachable.length)continue;
  const homePlan=targetOverride?islandNavalPlan(m):undefined;
  const plan={...enemyNavalConfig,harbor:homePlan?.harbor??harbor,loading:homePlan?.loading??shore.land,waterStart:homePlan?.waterStart??shore.water,waterGoal:reachable[0].water,landing:reachable[0].land,landSearch:target,beaches:reachable};if(cache.size>=32)cache.delete(cache.keys().next().value!);cache.set(key,plan);return plan;
 }
 throw new Error(`No connected naval plan for ${key}`);
}

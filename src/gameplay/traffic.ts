import {unitStats} from '../config/unit';
import {trafficConfig as config} from '../config/traffic';
import {bodyFits,tileCenter,type WorldMap} from './map';
import type {Position} from './movement';
import type {RouteState} from './navigation';
const compareIds=new Intl.Collator('en',{numeric:true}).compare;
export type MovementGate=(position:Position,route:RouteState,speed:number,delta:number)=>number;
export type GateFor=(id:string)=>MovementGate;
export interface TrafficBody {id:string;position:Position;half:number;speed:number;active:boolean;waypoints:readonly Position[]}
interface PassageZones {ids:Int32Array;count:number;columns:number;rows:number}
interface PassageSnapshot {signature:string;length:number;zones:PassageZones;free:Uint8Array;narrow:Uint8Array;rects:Map<string,import('./placement').Footprint>}
const cache=new WeakMap<WorldMap['obstacles'],PassageSnapshot>();
const previous=new Map<string,PassageSnapshot>();
/** A felled tree or new footprint changes only nearby tile clearance. Relabel
 * narrow passages after those local updates, without rescanning world collision. */
function passageZones(map:WorldMap):PassageZones {
 const signature=`${map.revision}:${map.width}:${map.height}:${map.tileSize}`,old=cache.get(map.obstacles);
 if(old?.signature===signature&&old.length===map.obstacles.length)return old.zones;
 const columns=Math.ceil(map.width/map.tileSize),rows=Math.ceil(map.height/map.tileSize),length=columns*rows;
 const key=`${map.id}:${map.design}:${map.terrainLayout}:${map.width}:${map.height}:${map.tileSize}`;
 const rectKey=(r:import('./placement').Footprint)=>`${r.x},${r.y},${r.width},${r.height}`;
 const rects=new Map(map.obstacles.map(r=>[rectKey(r),{...r}])),before=previous.get(key);
 const changed=before?[...map.obstacles.filter(r=>!before.rects.has(rectKey(r))),...[...before.rects].filter(([k])=>!rects.has(k)).map(([,r])=>r)]:[];
 const incremental=!!before&&changed.length<=64;
 const free=incremental?before.free.slice():new Uint8Array(length),narrow=incremental?before.narrow.slice():new Uint8Array(length),dirty=new Set<number>();
 const refresh=(x:number,y:number)=>{const i=y*columns+x,p=tileCenter(map,{column:x,row:y});free[i]=Number(!!p&&bodyFits(map,p,unitStats.size/2));dirty.add(i);};
 if(incremental){for(const r of changed)for(let y=Math.max(0,Math.floor((r.y-unitStats.size/2)/map.tileSize));y<=Math.min(rows-1,Math.floor((r.y+r.height+unitStats.size/2)/map.tileSize));y++)for(let x=Math.max(0,Math.floor((r.x-unitStats.size/2)/map.tileSize));x<=Math.min(columns-1,Math.floor((r.x+r.width+unitStats.size/2)/map.tileSize));x++)refresh(x,y);}
 else for(let y=0;y<rows;y++)for(let x=0;x<columns;x++)refresh(x,y);
 const neighbors=(i:number)=>{const x=i%columns,y=Math.floor(i/columns);return [y>0?i-columns:-1,x+1<columns?i+1:-1,y+1<rows?i+columns:-1,x>0?i-1:-1].filter(n=>n>=0);};
 const affected=new Set(dirty);for(const i of dirty)for(const n of neighbors(i))affected.add(n);
 for(const i of affected)narrow[i]=Number(!!free[i]&&neighbors(i).filter(n=>free[n]).length<=2);
 const ids=new Int32Array(length).fill(-1);let count=0;
 for(let i=0;i<length;i++){
  if(!narrow[i]||ids[i]>=0)continue;
  const queue=[i];ids[i]=count;
  for(let cursor=0;cursor<queue.length;cursor++)for(const n of neighbors(queue[cursor]))if(narrow[n]&&ids[n]<0){ids[n]=count;queue.push(n);}
  count++;
 }
 const zones={ids,count,columns,rows},snapshot={signature,length:map.obstacles.length,zones,free,narrow,rects};
 cache.set(map.obstacles,snapshot);if(previous.size>=8&&!previous.has(key))previous.delete(previous.keys().next().value!);previous.set(key,snapshot);return zones;
}
/** Admission is per simulation step, derived from live bodies. Idle bodies never retain a lock. */
export function trafficGates(map:WorldMap,bodies:readonly TrafficBody[],elapsed:number,delta:number):GateFor{
 const zones=passageZones(map);
 if(!zones.count)return ()=> (_p,_r,_s,d)=>d;
 const hits=(p:Position,half:number)=>{const found=new Set<number>();for(let y=Math.floor((p.y-half+1e-6)/map.tileSize);y<=Math.floor((p.y+half-1e-6)/map.tileSize);y++)for(let x=Math.floor((p.x-half+1e-6)/map.tileSize);x<=Math.floor((p.x+half-1e-6)/map.tileSize);x++){if(x<0||y<0||x>=zones.columns||y>=zones.rows)continue;const zone=zones.ids[y*zones.columns+x];if(zone>=0)found.add(zone);}return found;};
 const trace=(position:Position,points:readonly Position[],half:number,distanceLimit:number)=>{const entries=new Map<number,number>();let previous=position,walked=0;
  for(const end of points){const length=Math.hypot(end.x-previous.x,end.y-previous.y);if(length===0){previous=end;continue;}const distance=Math.min(length,Math.max(0,distanceLimit-walked));let sampled=0;
   while(sampled<distance){const next=Math.min(distance,sampled+config.traceSpacing),p={x:previous.x+(end.x-previous.x)*next/length,y:previous.y+(end.y-previous.y)*next/length};for(const zone of hits(p,half))if(!entries.has(zone))entries.set(zone,walked+sampled);sampled=next;}
   walked+=distance;if(walked>=distanceLimit)break;previous=end;
  }return entries;};
 const sorted=[...bodies].sort((a,b)=>compareIds(a.id,b.id)),owners=new Map<number,string>(),candidates=new Map<number,string[]>();
 for(const b of sorted){if(!b.active)continue;for(const zone of hits(b.position,b.half))if(!owners.has(zone))owners.set(zone,b.id);for(const zone of trace(b.position,b.waypoints,b.half,b.speed*delta+config.traceSpacing).keys()){const list=candidates.get(zone)??[];list.push(b.id);candidates.set(zone,list);}}
 const winners=new Map<number,string>();for(const [zone,ids] of candidates)winners.set(zone,ids[Math.floor((elapsed+1e-9)/config.passageWindowSeconds)%ids.length]);
 const byId=new Map(sorted.map(b=>[b.id,b]));
 return id=>(position,route,speed,time)=>{if(route.status!=='moving'||speed<=0||time<=0)return time;const b=byId.get(id);if(!b)return time;let allowed=time;
  for(const [zone,distance] of trace(position,route.waypoints,b.half,speed*time)){const owner=owners.get(zone),winner=winners.get(zone)??id;if(owner!==undefined&&owner!==id||owner===undefined&&winner!==id){allowed=Math.min(allowed,distance/speed);break;}owners.set(zone,id);}
  return allowed;
 };
}

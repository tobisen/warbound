import {navigationConfig} from '../config/navigation';
import type {Position} from './movement';
import type {WorldMap} from './map';
import {bodyFits,worldTile} from './map';
import {findFormationRoute,planRoute,segmentFits,placementRouteExists,type RouteState} from './navigation';
const compareIds=new Intl.Collator('en',{numeric:true}).compare;
export interface FormationMember {id:string;position:Position;half:number;domain:'land'|'water'|'air';map:WorldMap;commandNumber:number}
export function formationCandidates(destination:Position,spacing=navigationConfig.groupSpacing,radius=navigationConfig.groupRadius):Position[]{
 const points:{point:Position;distance:number;row:number;column:number}[]=[];
 for(let row=-radius;row<=radius;row++)for(let column=-radius;column<=radius;column++)points.push({point:{x:destination.x+column*spacing,y:destination.y+row*spacing},distance:row*row+column*column,row,column});
 return points.sort((a,b)=>a.distance-b.distance||a.row-b.row||a.column-b.column).map(p=>p.point);
}
/** Stable assignments on command only. Existing traffic/separation handles narrow passages en route. */
export function allocateFormation(members:readonly FormationMember[],destination:Position):Map<string,RouteState>{
 const result=new Map<string,RouteState>(),placed:{point:Position;half:number;domain:string}[]=[];
 const sorted=[...members].sort((a,b)=>b.half-a.half||compareIds(a.id,b.id));
 const spacing=Math.max(navigationConfig.groupSpacing,...members.map(u=>u.half*2+4));
 const radius=Math.min(8,Math.max(navigationConfig.groupRadius,Math.ceil(Math.sqrt(members.length))));
 const points=formationCandidates(destination,spacing,radius);
 const shared:{map:WorldMap;half:number;points:Position[];routes:Position[][]}[]=[];
 for(const member of sorted){
  if(!worldTile(member.map,destination)){result.set(member.id,planRoute({...member.map,bodyHalf:member.half},member.position,destination,member.commandNumber));continue;}
  let pool=shared.find(p=>p.map.obstacles===member.map.obstacles&&p.half===member.half&&p.map.width===member.map.width&&p.map.height===member.map.height&&p.map.revision===member.map.revision&&p.map.interactionTarget===member.map.interactionTarget&&p.map.blockingTarget===member.map.blockingTarget);
  if(!pool){pool={map:member.map,half:member.half,points:points.filter(p=>bodyFits(member.map,p,member.half)),routes:[]};shared.push(pool);}
  let candidates=pool.points.filter(point=>!placed.some(p=>p.domain===member.domain&&Math.abs(p.point.x-point.x)<p.half+member.half+2&&Math.abs(p.point.y-point.y)<p.half+member.half+2));
  const compatible=shared.filter(p=>p.map.obstacles===member.map.obstacles&&p.half>=member.half&&p.map.width===member.map.width&&p.map.height===member.map.height&&p.map.revision===member.map.revision&&p.map.interactionTarget===member.map.interactionTarget&&p.map.blockingTarget===member.map.blockingTarget);
  // Both connectors must fit; the shared middle was validated for an equal or
  // larger body on this exact map. Keep each member's own formation slot.
  const reuse=(goal:Position|undefined)=>{
   if(!goal)return;
   if(segmentFits(member.map,member.position,goal,member.half))return {destination:goal,waypoints:member.position.x===goal.x&&member.position.y===goal.y?[]:[{...goal}]};
   for(const p of compatible)for(const path of p.routes){
    if(!path.length||!segmentFits(member.map,path[path.length-1],goal,member.half))continue;
    const join=path.findIndex(point=>segmentFits(member.map,member.position,point,member.half));
    if(join>=0)return {destination:goal,waypoints:[...path.slice(join).map(point=>({...point})),{...goal}]};
   }
  };
  let reused=reuse(candidates[0]);
  if(!reused){
   const firstReachable=candidates.findIndex(p=>placementRouteExists({...member.map,bodyHalf:member.half},member.position,p));
   candidates=firstReachable<0?[]:candidates.slice(firstReachable);
   reused=reuse(candidates[0]);
  }
  // Connectivity already selected the preferred reachable slot. Preserve the
  // original source-BFS path order without enumerating alternate contacts again.
  const route=reused??findFormationRoute(member.map,member.position,candidates.slice(0,1),member.half);
  if(route&&!reused&&pool.routes.length<8)pool.routes.push(route.waypoints);
  if(route){placed.push({point:route.destination,half:member.half,domain:member.domain});result.set(member.id,{commandNumber:member.commandNumber,destination:{...route.destination},waypoints:route.waypoints,revision:member.map.revision,status:route.waypoints.length?'moving':'arrived'});}
  else result.set(member.id,{commandNumber:member.commandNumber,destination:{...member.position},waypoints:[],revision:member.map.revision,status:'blocked',error:'no-space'});
 }
 return result;
}

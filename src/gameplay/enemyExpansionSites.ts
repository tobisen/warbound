import {isRegionalDesign} from '../config/organicTerrain';
import {baseFootprint} from './buildingSelection';
import {isVisible} from './fog';
import {attackTargets} from './domains';
import {enemyExpansionConfig as config} from '../config/enemyExpansion';
import {enemyStrategyLimits as limits} from '../config/enemyStrategy';
import {nearbyObstacles,overlaps} from './map';
import {entityVisible,placementVisible} from './visibility';
import {resourceNodes} from './gathering';
import type {MatchState} from './match';
import type {Position} from './movement';
import type {Footprint} from './placement';
export interface ExpansionPlan {failed:{point:Position;retryAt:number}[];scout?:Position}
export function expansionVisible(m:MatchState,rect:Footprint):boolean{return !m.fog||placementVisible({...m.fog,teams:{...m.fog.teams,player:m.fog.teams.enemy}},rect);}
export const knownExpansionResources=(m:MatchState)=>m.enemyKnowledge?.nodes??resourceNodes(m.gathering).filter(n=>!m.fog||isVisible(m.fog,'enemy',n.position));
export const expansionSpacing=(m:MatchState)=>Math.max(config.size*3,Math.min(m.scenario==='skirmish'&&!m.campaignMission&&!!m.enemyPolicy?.strategy&&isRegionalDesign(m.map.design)&&Math.min(m.map.width,m.map.height)>=3072?limits.largeBaseSpacing:limits.baseSpacing,Math.min(m.map.width,m.map.height)/3));
/** All policies use the same owner-known bases/sites and remembered resources.
 * Hidden dynamic occupancy is checked only by the executor after scouting. */
export function validExpansionSites(m:MatchState,points:readonly Position[],scoutPoint?:Position):Position[]{
 const own=m.combat.enemies.filter(e=>e.hp>0&&e.footprint),bases=own.filter(e=>e.kind==='base'||e.buildingType==='outpost');
 const known=knownExpansionResources(m);
 const useful=known.filter(n=>n.remaining>0&&!bases.some(b=>Math.hypot(b.position.x-n.position.x,b.position.y-n.position.y)<Math.min(expansionSpacing(m),limits.resourceRange)));
 const threats=m.gathering.units.filter(u=>u.kind==='soldier'&&attackTargets(u,m.factions?.player??'crown').length>0&&(u.hp??0)>0&&(!m.fog||entityVisible(m.fog,'enemy',u)));
 const danger=[...threats.map(u=>u.position),...(m.placement.defenses??[]).filter(t=>t.kind==='tower'&&t.hp>0&&t.construction.remainingSeconds===0&&(!m.fog||entityVisible(m.fog,'enemy',{footprint:t.footprint,position:{x:t.footprint.x+t.footprint.width/2,y:t.footprint.y+t.footprint.height/2}}))).map(t=>({x:t.footprint.x+t.footprint.width/2,y:t.footprint.y+t.footprint.height/2}))];
 const knownBase=m.enemyKnowledge?.playerBase??(m.combat.baseHP>0&&(!m.fog||entityVisible(m.fog,'enemy',{position:m.gathering.base,footprint:baseFootprint(m.gathering.base)}))?m.gathering.base:undefined);
 if(knownBase)danger.push(knownBase);
 const seen=new Set<string>();
 return points.map(p=>({x:Math.floor(p.x/32)*32,y:Math.floor(p.y/32)*32})).filter(p=>{
  const key=`${p.x}:${p.y}`;if(seen.has(key))return false;seen.add(key);
  const rect={...p,width:config.size,height:config.size},center={x:p.x+config.size/2,y:p.y+config.size/2};
  return rect.x>=0&&rect.y>=0&&rect.x+rect.width<=m.map.width&&rect.y+rect.height<=m.map.height
   &&own.every(b=>!overlaps(rect,b.footprint!))
   &&bases.every(b=>Math.hypot(center.x-b.position.x,center.y-b.position.y)>=expansionSpacing(m))
   &&(useful.some(n=>Math.hypot(center.x-n.position.x,center.y-n.position.y)<=limits.resourceRange)||scoutPoint?.x===p.x&&scoutPoint.y===p.y&&!expansionVisible(m,rect))
   &&danger.every(p=>Math.hypot(center.x-p.x,center.y-p.y)>limits.dangerRange)
   &&(!expansionVisible(m,rect)||!nearbyObstacles(m.map,rect).some(o=>overlaps(rect,o)));
 });
}

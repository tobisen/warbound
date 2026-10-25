import {combinedArmyConfig} from '../config/combinedArmy';
import {enemyUnitStats,enemyRangedStats,enemySoldier} from './enemyUnits';
import type {FactionId} from '../config/factions';
import { updateEnemyDefense,type PlayerVisibility } from './enemyDefense';
import { enemyAIConfig,type EnemyAISettings } from '../config/enemyAI';
import { commandGroupMove } from './groupMovement';
import type { CombatState,Enemy } from './combat';
import type { Unit } from './gathering';
import type { WorldMap } from './map';
import type { Position } from './movement';
export interface EnemyGroup {id:string;status:'muster'|'ready'|'attack';members:string[];destinations:Record<string,Position>;startedAt:number;dispatchedAt?:number;dispatchedSize?:number}
export interface Defender {id:string;groupId?:string;destination?:Position}
export interface EnemyAIState {reserve:string[];defenders:Defender[];threatId:string|null;elapsedSeconds:number;nextGroupNumber:number;groups:EnemyGroup[];lastDispatchSeconds:number|null}
export const createEnemyAI=():EnemyAIState=>({reserve:[],defenders:[],threatId:null,elapsedSeconds:0,nextGroupNumber:1,groups:[],lastDispatchSeconds:null});
export function updateEnemyAI(state:EnemyAIState,combat:CombatState,map:WorldMap,playerBase:Position,delta:number,playerUnits:Unit[]=[],settings:EnemyAISettings=enemyAIConfig,visible?:PlayerVisibility,faction:FactionId='clans'){
 const combatPower=(e:Enemy)=>{const ranged=enemyRangedStats(e,faction);return Math.sqrt(Math.max(0,e.hp)*(ranged?ranged.damage/ranged.attackInterval:enemyUnitStats(e,faction).damagePerSecond??0));};
 const elapsedSeconds=state.elapsedSeconds+Math.max(0,delta),alive=new Set(combat.enemies.filter(e=>e.hp>0&&e.kind!=='base'&&e.role!=='scout').map(e=>e.id));
 let groups=state.groups.map(g=>({...g,members:g.members.filter(id=>alive.has(id)),destinations:Object.fromEntries(Object.entries(g.destinations).filter(([id])=>alive.has(id)))})).filter(g=>g.members.length);
 const defense=updateEnemyDefense({...state,groups},combat,map,playerBase,playerUnits,settings,visible,faction);groups=defense.state.groups;
 let enemies=defense.combat.enemies,nextGroupNumber=state.nextGroupNumber,lastDispatchSeconds=state.lastDispatchSeconds;
 // Tactical retreat is bounded to one decision per gameplay second. Existing muster timeout gates retry.
 if(settings.regroup&&Math.floor(elapsedSeconds)!==Math.floor(state.elapsedSeconds))groups=groups.map(g=>{
  if(g.status!=='attack')return g;
  const time=elapsedSeconds-(g.dispatchedAt??elapsedSeconds),members=enemies.filter(e=>g.members.includes(e.id));
  const longRoute=Math.hypot(settings.muster.x-playerBase.x,settings.muster.y-playerBase.y)>1024;
  const weakened=g.members.length<Math.ceil((longRoute?g.dispatchedSize??settings.groupSize:settings.groupSize)/2)&&time>=combinedArmyConfig.retreatAfterSeconds;
  const blocked=members.length>0&&members.every(e=>e.navigation?.status==='blocked')&&time>=combinedArmyConfig.blockedAfterSeconds;
  if(!weakened&&!blocked)return g;
  const orders=commandGroupMove(members.map(e=>({...enemySoldier(e,faction),selected:true})),settings.muster,map),byId=new Map(orders.map(u=>[u.id,u]));
  enemies=enemies.map(e=>{const u=byId.get(e.id);return u?{...e,navigation:u.navigation,order:{kind:'muster' as const,destination:{...u.target}}}:e;});
  return {...g,status:'muster',startedAt:elapsedSeconds,dispatchedAt:undefined,destinations:Object.fromEntries(orders.map(u=>[u.id,{...u.target}]))};
 });
 // Join waiting detachments when observed opposition requires a larger army.
 if(((settings.attackPower??0)>0||(settings.minimumAttackSize??1)>1)&&Math.floor(elapsedSeconds)!==Math.floor(state.elapsedSeconds)){
  const power=(g:EnemyGroup)=>g.members.reduce((sum,id)=>{const e=enemies.find(e=>e.id===id)!;return sum+combatPower(e);},0);
  const waiting=groups.filter(g=>g.status!=='attack');
  let lead=waiting.find(g=>g.members.length<(settings.minimumAttackSize??1)||power(g)<(settings.attackPower??0));
  const original=lead;
  if(lead){
   for(const donor of waiting.filter(g=>g.id!==lead!.id)){
    lead={...lead,startedAt:Math.min(lead.startedAt,donor.startedAt),members:[...lead.members,...donor.members]};groups=groups.filter(g=>g.id!==donor.id);
    if(lead.members.length>=(settings.minimumAttackSize??1)&&power(lead)>=(settings.attackPower??0))break;
   }
   if(lead.members.length>original!.members.length){
    const ids=new Set(lead.members),orders=commandGroupMove(enemies.filter(e=>ids.has(e.id)).map(e=>({...enemySoldier(e,faction),selected:true})),settings.muster,map),byId=new Map(orders.map(u=>[u.id,u]));
    enemies=enemies.map(e=>{const u=byId.get(e.id);return u?{...e,navigation:u.navigation,order:{kind:'muster' as const,destination:{...u.target}}}:e;});
    const merged=lead;groups=groups.map(g=>g.id===merged.id?{...merged,status:'muster',destinations:Object.fromEntries(orders.map(u=>[u.id,{...u.target}]))}:g);
   }
  }
 }
 const assigned=new Set([...groups.flatMap(g=>g.members),...defense.protectedIds]);
 const recruits=enemies.filter(e=>e.hp>0&&e.role!=='scout'&&e.id.startsWith('enemy-produced-')&&!e.navalLanding&&!assigned.has(e.id)).sort((a,b)=>a.id.localeCompare(b.id,'en',{numeric:true}));
 for(const recruit of recruits){
  let group=groups.find(g=>(g.status==='muster'||!!settings.minimumAttackSize&&g.status==='ready')&&g.members.length<Math.max(settings.groupSize,settings.minimumAttackSize??1));
  if(!group){group={id:`enemy-group-${nextGroupNumber++}`,status:'muster',members:[],destinations:{},startedAt:elapsedSeconds};groups.push(group);}
  const members=[...group.members,recruit.id];
  const units:Unit[]=members.map(id=>{const e=enemies.find(e=>e.id===id)!;return {...enemySoldier(e,faction),selected:true};});
  const orders=commandGroupMove(units,settings.muster,map);
  const destinations=Object.fromEntries(orders.map(u=>[u.id,{...u.target}]));
  enemies=enemies.map(e=>{const u=orders.find(u=>u.id===e.id);return u?{...e,navigation:u.navigation,order:{kind:'muster' as const,destination:{...u.target}}}:e;});
  groups=groups.map(g=>g.id===group!.id?{...g,status:'muster',members,destinations}:g);
 }
 groups=groups.map(g=>{
  if(g.status==='muster'){
   const arrived=g.members.every(id=>{const e=enemies.find(e=>e.id===id)!,p=g.destinations[id];return Math.hypot(e.position.x-p.x,e.position.y-p.y)<1e-6;});
   if(g.members.length>=(settings.minimumAttackSize??1)&&(g.members.length>=settings.groupSize&&arrived||elapsedSeconds-g.startedAt+1e-9>=settings.musterTimeout))g={...g,status:'ready'};
  }
  const power=(settings.attackPower??0)>0?g.members.reduce((sum,id)=>{const e=enemies.find(e=>e.id===id)!;return sum+combatPower(e);},0):0;
  if(!defense.threat&&g.members.length>=(settings.minimumAttackSize??1)&&power>=(settings.attackPower??0)&&g.status==='ready'&&elapsedSeconds+1e-9>=settings.firstAttackSeconds&&(lastDispatchSeconds===null||elapsedSeconds-lastDispatchSeconds+1e-9>=settings.dispatchGapSeconds)){
   enemies=enemies.map(e=>g.members.includes(e.id)?{...e,navigation:undefined,order:{kind:'attack-move' as const,destination:{...playerBase}}}:e);
   lastDispatchSeconds=elapsedSeconds;return {...g,status:'attack',dispatchedAt:elapsedSeconds,dispatchedSize:g.members.length};
  }
  return g;
 });
 return {combat:{...combat,enemies},state:{...defense.state,elapsedSeconds,nextGroupNumber,groups,lastDispatchSeconds}};
}

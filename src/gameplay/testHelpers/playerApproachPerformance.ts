import {createMatch,type MatchState} from '../match';
import {bodyFits} from '../map';
import {matchFog} from '../matchFog';
import {entityVisible} from '../visibility';
import {commandGroupMove} from '../groupMovement';
import {issueOrder} from '../commandOrders';
/** Explicit durable stress army above paid supply, ordinary AI/fog/combat and
 * selected-group UI. Models the player approaching a hidden enemy base. */
export function armyMovementFixture(_players=2,count=128,_gate=false){
 const m=createMatch('skirmish','normal',undefined,'plains128');m.matchId='00000000-0000-4000-8000-000000000001';m.waves.elapsedSeconds=600;m.combat.baseHP=100000;m.enemyAI!.elapsedSeconds=600;m.enemyAI!.lastDispatchSeconds=600;m.enemyProduction!.wood=m.enemyProduction!.gold=0;
 const base=m.combat.enemies.find(e=>e.kind==='base')!;base.hp=100000;
 const spots=(x:number,y:number,n:number)=>{const points=[];for(let r=0;r<40&&points.length<n;r++)for(let c=0;c<12&&points.length<n;c++){const p={x:x+c*32,y:y+r*32};if(bodyFits(m.map,p,12))points.push(p);}if(points.length<n)throw Error('No army fixture ground');return points;};
 m.gathering.units.push(...spots(base.position.x-1664,base.position.y+128,count).map((position,i)=>({id:`approach-player-${i}`,kind:'soldier' as const,hp:10000,selected:true,cargo:0 as const,position,target:position,order:{kind:'idle' as const}})));
 m.combat.enemies.push(...spots(base.position.x-160,base.position.y+128,32).map((position,i)=>({id:`approach-defender-${i}`,kind:'unit' as const,owner:'enemy' as const,role:i%3===0?'archer' as const:'soldier' as const,hp:10000,position,order:{kind:'idle' as const}})));
 m.fog=matchFog(m);return m;
}
export function assembleArmy(m:MatchState){const own=m.gathering.units.filter(u=>u.id.startsWith('approach-player-')),p=own[0].position;return {...m,gathering:{...m.gathering,units:[...m.gathering.units.filter(u=>!u.id.startsWith('approach-player-')),...commandGroupMove(own,{x:p.x+96,y:p.y+64},m.map)]}};}
export function dispatchArmy(m:MatchState){const target=m.combat.enemies.find(e=>e.kind==='base')!.position;return issueOrder(m,{kind:'attack-move',destination:{x:target.x-64,y:target.y+96}});}
export function armyObservation(m:MatchState){return {visible:m.combat.enemies.filter(e=>e.id.startsWith('approach-defender-')&&entityVisible(m.fog!,'player',e)).length,baseVisible:entityVisible(m.fog!,'player',m.combat.enemies.find(e=>e.kind==='base')!),damage:m.gathering.units.some(u=>u.id.startsWith('approach-player-')&&(u.hp??0)<10000),outcome:m.outcome};}

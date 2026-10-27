import {createMatch,updateMatch,type MatchState} from '../match';
import {bodyFits} from '../map';
import {matchFog} from '../matchFog';
import {entityVisible} from '../visibility';
/** Explicit load test, above paid supply with durable bodies; real fog/combat/AI ticks. */
export function attackPerformanceFixture():MatchState {
 const m=createMatch('skirmish','normal');
 m.matchId='00000000-0000-4000-8000-000000000001';m.combat.baseHP=100000;
 m.enemyProduction!.wood=m.enemyProduction!.gold=0;
 m.waves.elapsedSeconds=600;m.enemyAI!.elapsedSeconds=600;
 const base=m.gathering.base;
 const spots=(x:number,y:number,count:number)=>{
  const found=[];
  for(let row=0;row<16&&found.length<count;row++)for(let col=0;col<12&&found.length<count;col++){
   const p={x:x+col*32,y:y+row*32};if(bodyFits(m.map,p,12))found.push(p);
  }
  if(found.length<count)throw Error('Attack load fixture has insufficient free ground');return found;
 };
 const defenders=spots(base.x+96,base.y-96,24),attackers=spots(base.x+1024,base.y-128,40);
 // The destination was scouted previously; current fog is still computed normally.
 m.enemyKnowledge!.playerBase={...base};
 m.gathering.units.push(...defenders.map((position,i)=>({id:`attack-defender-${i}`,kind:'soldier' as const,archetype:i%3===0?'archer' as const:undefined,owner:'player' as const,hp:10000,cargo:0 as const,selected:false,position,target:{...position},order:{kind:'idle' as const}})));
 const ids=attackers.map((_,i)=>`attack-enemy-${i}`);
 m.combat.enemies.push(...attackers.map((position,i)=>({id:ids[i],kind:'unit' as const,role:i%4===0?'archer' as const:'soldier' as const,owner:'enemy' as const,hp:10000,position,order:{kind:'attack-move' as const,destination:{...base}}})));
 m.enemyAI!.groups=[{id:'attack-load',status:'attack',members:ids,destinations:{},startedAt:590,dispatchedAt:600,dispatchedSize:ids.length}];m.enemyAI!.lastDispatchSeconds=600;
 m.fog=matchFog(m);return m;
}
export {updateMatch};
export function attackObservation(m:MatchState){return {visible:m.combat.enemies.filter(e=>e.id.startsWith('attack-enemy-')&&entityVisible(m.fog!,'player',e)).length,damage:m.gathering.units.some(u=>u.id.startsWith('attack-defender-')&&(u.hp??0)<10000),shots:m.combat.projectiles?.length??0,baseHP:m.combat.baseHP,outcome:m.outcome};}

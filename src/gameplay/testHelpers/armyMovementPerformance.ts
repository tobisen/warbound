import {createMatch,updateMatch,type MatchState} from '../match';
import {bodyFits} from '../map';
import {matchFog} from '../matchFog';
import {entityVisible} from '../visibility';
import {matchPlayers} from '../players';
import {withGateRules} from '../gates';
import {projectMultiplePlayers} from '../multiplePlayers';
import {commandGroupMove} from '../groupMovement';
import {enemySoldier} from '../enemyUnits';
/** Explicit stress fixture: durable, injected forces above paid supply. AI retains
 * ordinary planning, terrain, fog and combat. Not a paid economy/expansion proof. */
export function armyMovementFixture(players=2,count=80,gate=false):MatchState {
 let m=createMatch('skirmish','normal',undefined,'plains128',1,'balanced',players>2?matchPlayers(undefined,undefined,players).map((p,i)=>({...p,teamId:i?2:1})):undefined);
 m.matchId='00000000-0000-4000-8000-000000000001';m.combat.baseHP=100000;
 const base=m.gathering.base;
 const spots=(x:number,y:number,n:number,columns=24)=>{const found=[];for(let row=0;row<32&&found.length<n;row++)for(let col=0;col<columns&&found.length<n;col++){const p={x:x+col*32,y:y+row*32};if(bodyFits(m.map,p,12))found.push(p);}if(found.length<n)throw Error('Insufficient fixture ground');return found;};
 m.gathering.units.push(...spots(base.x+96,base.y-96,32,6).map((position,i)=>({id:`movement-defender-${i}`,kind:'soldier' as const,archetype:i%3===0?'archer' as const:undefined,owner:'player' as const,hp:10000,cargo:0 as const,selected:false,position,target:{...position},order:{kind:'idle' as const}})));
 const actors=m.multiplePlayers?.ai.map(b=>b.state)??[m];
 actors.forEach((a,index)=>{
  a.enemyProduction!.wood=a.enemyProduction!.gold=0;a.waves.elapsedSeconds=600;a.enemyAI!.elapsedSeconds=600;a.enemyKnowledge!.playerBase={...base};
  const attackers=spots(base.x+1408,base.y-128+index*128,count),ids=attackers.map((_,i)=>`movement-enemy-${i}`);
  a.combat.enemies.push(...attackers.map((position,i)=>({id:ids[i],kind:'unit' as const,role:i%4===0?'archer' as const:'soldier' as const,owner:'enemy' as const,hp:10000,position,order:{kind:'idle' as const}})));
  a.enemyAI!.groups=[{id:'movement-load',status:'muster',members:ids,destinations:{},startedAt:600}];a.enemyAI!.lastDispatchSeconds=600;
 });
 if(gate)m=withGateRules({...m,placement:{...m.placement,defenses:[{id:'gate-1',kind:'gate',owner:'player',hp:10000,footprint:{x:Math.floor((base.x+96)/32)*32,y:Math.floor(base.y/32)*32,width:32,height:32},construction:{remainingSeconds:0,builderId:null},level:1,upgradeRemaining:null,cooldown:0,open:false}]}});
 m.waves.elapsedSeconds=600;if(m.multiplePlayers){m=projectMultiplePlayers(m);for(const bot of m.multiplePlayers!.ai)bot.state.map=m.map;}m.fog=matchFog(m);return m;
}
/** Real group assignment measured inside the first rendered update. */
export function assembleArmy(m:MatchState):MatchState {
 const actors=m.multiplePlayers?.ai.map(b=>b.state)??[m];
 for(const a of actors){
  const members=a.combat.enemies.filter(e=>e.id.startsWith('movement-enemy-'));
  const orders=commandGroupMove(members.map(e=>({...enemySoldier(e,a.factions?.enemy??'clans'),selected:true})),{x:m.gathering.base.x+1280,y:m.gathering.base.y+256},a.map),byId=new Map(orders.map(u=>[u.id,u]));
  a.combat.enemies=a.combat.enemies.map(e=>{const u=byId.get(e.id);return u?{...e,navigation:u.navigation,order:{kind:'muster',destination:u.target}}:e;});
  a.enemyAI!.groups[0].destinations=Object.fromEntries(orders.map(u=>[u.id,u.target]));
 }
 return m.multiplePlayers?projectMultiplePlayers(m):m;
}
export function dispatchArmy(m:MatchState):MatchState {
 for(const a of m.multiplePlayers?.ai.map(b=>b.state)??[m]){
  a.combat.enemies=a.combat.enemies.map(e=>e.id.startsWith('movement-enemy-')?{...e,navigation:undefined,order:{kind:'attack-move',destination:{...m.gathering.base}}}:e);
  a.enemyAI!.groups=a.enemyAI!.groups.map(g=>({...g,status:'attack',dispatchedAt:a.waves.elapsedSeconds,dispatchedSize:g.members.length}));
 }
 return m.multiplePlayers?projectMultiplePlayers(m):m;
}
export function armyObservation(m:MatchState){return {visible:m.combat.enemies.filter(e=>e.id.includes('movement-enemy-')&&entityVisible(m.fog!,'player',e)).length,damage:m.gathering.units.some(u=>u.id.startsWith('movement-defender-')&&(u.hp??0)<10000),positions:m.combat.enemies.filter(e=>e.id.includes('movement-enemy-')).map(e=>e.position),outcome:m.outcome};}
export {updateMatch};

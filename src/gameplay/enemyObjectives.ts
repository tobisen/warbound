import {defenseConfig,towerSpecializations} from '../config/defenses';
import {combatUnitStats,rangedStats} from '../config/unit';
import {enemyUnitStats,enemyRangedStats} from './enemyUnits';
import {playerTargets} from './targets';
import {entityVisible} from './visibility';
import {searchWaypoints} from './enemyKnowledge';
import {enemyBase} from './enemyBases';
import {strategySettings} from './enemyStrategy';
import type {MatchState} from './match';
import type {Position} from './movement';
export interface EnemyObjective {position:Position;kind:'base'|'raid'|'probe';until:number;power:number}
/** Reassess observed targets at a bounded cadence. Hidden bank, resources and units
 * never inform a raid. An outmatched army probes a different route instead. */
export function enemyObjective(m:MatchState,previous?:EnemyObjective,avoid?:Position):EnemyObjective|undefined {
 const time=m.waves.elapsedSeconds;if(previous&&time<previous.until&&(!avoid||Math.hypot(previous.position.x-avoid.x,previous.position.y-avoid.y)>448))return previous;
 const known=m.enemyKnowledge?.playerBase;if(!known)return;
 const visible=(p:{position:Position;footprint?:import('./placement').Footprint})=>!m.fog||entityVisible(m.fog,'enemy',p);
 const hostiles=m.gathering.units.filter(u=>u.kind==='soldier'&&u.hp>0&&visible(u));
 const towers=m.aiContext?.humanHostile===false?[]:(m.placement.defenses??[]).filter(t=>t.kind==='tower'&&t.hp>0&&t.construction.remainingSeconds===0&&visible({position:{x:t.footprint.x+16,y:t.footprint.y+16},footprint:t.footprint}));
 const powerAt=(p:Position)=>hostiles.reduce((sum,u)=>{if(u.kind!=='soldier'||Math.hypot(u.position.x-p.x,u.position.y-p.y)>448)return sum;const f=u.faction??m.factions?.player,stats=combatUnitStats(u,f),ranged=rangedStats(u,f);return sum+Math.sqrt(u.hp*(ranged?ranged.damage/ranged.attackInterval:stats.damagePerSecond??0));},0)+towers.filter(t=>Math.hypot(t.footprint.x-p.x,t.footprint.y-p.y)<448).reduce((sum,t)=>sum+Math.sqrt(t.hp*(t.specialization?towerSpecializations[t.specialization].damage:defenseConfig.tower.damage)/defenseConfig.tower.interval),0);
 const own=m.combat.enemies.filter(e=>e.kind==='unit'&&e.hp>0&&e.role!=='scout'&&!m.enemyAI?.reserve.includes(e.id)&&!m.enemyPolicy?.strategy?.recon?.ids.includes(e.id));
 const power=own.reduce((sum,e)=>{const stats=enemyUnitStats(e,m.factions?.enemy),ranged=enemyRangedStats(e,m.factions?.enemy??'clans');return sum+Math.sqrt(e.hp*(ranged?ranged.damage/ranged.attackInterval:stats.damagePerSecond??0));},0);
 const ratio=strategySettings(m).attackRatio;
 const targets=m.aiContext?.humanHostile===false?[]:playerTargets(m.gathering,m.combat,m.placement,m.navy).filter(t=>t.kind!=='tower'&&t.kind!=='wall'&&t.kind!=='gate'&&t.kind!=='soldier'&&t.kind!=='ship'&&visible({position:{x:t.footprint.x+t.footprint.width/2,y:t.footprint.y+t.footprint.height/2},footprint:t.footprint}));
 const candidates=[{position:known,kind:'base' as const},...targets.map(t=>({position:{x:t.footprint.x+t.footprint.width/2,y:t.footprint.y+t.footprint.height/2},kind:'raid' as const}))].map(t=>({...t,power:powerAt(t.position)*ratio}));
 const chosen=candidates.filter(t=>t.power<=power&&(!avoid||Math.hypot(t.position.x-avoid.x,t.position.y-avoid.y)>448)).sort((a,b)=>a.power-b.power||Number(a.kind==='raid')-Number(b.kind==='raid'))[0];
 if(chosen)return {...chosen,until:time+30};
 const home=enemyBase(m.combat,m.map)!.position;
 const points=searchWaypoints(m,'attack').filter(p=>Math.hypot(p.x-known.x,p.y-known.y)>640&&Math.hypot(p.x-home.x,p.y-home.y)>320);
 const probe=points[Math.floor(time/90)%Math.max(1,points.length)];
 return probe?{position:{...probe},kind:'probe',until:time+30,power:0}:{position:known,kind:'base',until:time+30,power:powerAt(known)*ratio};
}

import {fleetStats,isMarine} from '../config/islandFleets';
import {factionForTeam} from '../config/factions';
import {workerCombatConfig,combatUnitStats,rangedStats} from '../config/unit';
import {upgradeMultiplier} from '../config/upgrades';
import {attackTargets} from '../gameplay/domains';
import {abilityEffects} from '../gameplay/abilities';
import {spellModifiers} from '../gameplay/spells';
import type {MatchState} from '../gameplay/match';
import type {Unit} from '../gameplay/gathering';
import type {Ship} from '../gameplay/navy';
const number=(n:number)=>Number(n.toFixed(2)).toString();
/** Outgoing damage before target armor/counters; reads the combat recipes and live buffs. */
export function unitAttacks(m:MatchState,u:Unit|Ship):string[]{
 const f=factionForTeam(m,'player'),tech=upgradeMultiplier(f.upgrades.attack.multiplier,m.research?.attack);
 const labels={land:'ground',sea:'ships',air:'air',building:'buildings'};
 if(u.kind==='worker')return [`Attack: Melee · ${workerCombatConfig.damagePerSecond} damage/s · ${workerCombatConfig.range}px · continuous · ground, buildings`];
 const role=u.kind==='ship'?u.role??'warship':u.archetype??'soldier';
 if(role==='transport'||role==='scout'||role==='survey'||role==='tender')return ['Attack: None'];
 const cfg=u.kind==='ship'?fleetStats(f.naval.units[role as 'warship'|'submarine'],m.research):combatUnitStats(u,f.id);
 const ranged=u.kind==='ship'?f.naval.units[role as 'warship'|'submarine']:rangedStats(u,f.id);
 const multiplier=tech*(u.kind==='soldier'&&isMarine(role)&&m.research?.marineDrill?1.25:1)*(u.kind==='ship'?1:abilityEffects(m.gathering,u).attackMultiplier*spellModifiers(u).attack);
 const targets=u.kind==='ship'?f.naval.units[role as 'warship'|'submarine'].targets:attackTargets(u,f.id);
 const name=role==='submarine'?'Torpedo':role==='warship'?'Cannon':ranged?'Projectile':'Melee';
 const damage=(ranged?.damage??('damagePerSecond' in cfg?cfg.damagePerSecond??0:0))*multiplier;
 const attacks=targets.map(domain=>{const modifier=domain==='building'&&f.id==='dwarves'&&role==='bombard'&&m.research?.preciseShells?3*(m.research?.coastalGunnery?1.25:1):('damageByDomain' in cfg?(cfg.damageByDomain as Partial<Record<import('../config/domains').TargetDomain,number>>|undefined)?.[domain]??1:1)*(domain==='building'&&'buildingDamageMultiplier' in cfg?cfg.buildingDamageMultiplier??1:1);return `Attack: ${name} (${labels[domain]}) · ${number(damage*modifier)} ${ranged?'damage/hit':'damage/s'} · ${cfg.range}px · ${ranged?`${ranged.attackInterval}s cooldown`:'continuous'}`;});
 return [...attacks,...(role==='bombard'&&m.research?.siegeShells?['Siege Shells:48px splash · sea/buildings only']:[]),...(role==='submarine'&&f.id==='goblins'&&m.research?.volatileTorpedoes?['Volatile Torpedoes:48px sea splash ·4 own HP per shot · stops at4 HP']:[]),...(ranged?[`Attack cooldown remaining: ${number(u.attackCooldown??0)}s`]:[]),'Damage before target armor; target counters apply.'];
}

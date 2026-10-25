import {expect,it} from 'vitest';
import {factionIds,factions} from '../config/factions';
import {createMatch} from './match';
import {updateCombat,type Enemy} from './combat';
import {canAttackDomain} from './domains';
import {rangedStats} from '../config/unit';
import {advanceProjectiles} from './projectiles';
import {acquireTargets} from './acquisition';
import {createNavy} from './navy';
import type {Soldier} from './gathering';
import {createMap} from './map';
const unit=(archetype:Soldier['archetype']):Soldier=>({kind:'soldier',archetype,id:'unit-4',selected:true,hp:100,cargo:0,position:{x:200,y:200},target:{x:200,y:200},order:{kind:'attack',enemyId:'target'}});
it.each(factionIds)('%s ranged roster fires and hits ground/sea/air; melee rejects sea/air',f=>{const m=createMatch();m.gathering.faction=f;for(const role of ['archer','catapult','ballista','specialist','air'] as const){const u=unit(role);if(!rangedStats(u,f))continue;for(const domain of ['land','sea','air'] as const){const enemy:Enemy={id:'target',hp:1000,order:{kind:'idle'},position:{x:280,y:200},...(domain==='sea'?{kind:'ship' as const}:domain==='air'?{role:'air' as const}:{kind:'unit' as const})};expect(canAttackDomain(u,enemy,f),`${role}/${domain}`).toBe(true);const hit=updateCombat({...m.gathering,units:[u]},{baseHP:240,enemies:[enemy]},.5);expect(hit.combat.enemies[0].hp,`${role}/${domain}`).toBeLessThan(1000);}}for(const role of [undefined,'cavalry','giant'] as const)for(const target of [{kind:'ship'},{role:'air'}])expect(canAttackDomain(unit(role),target,f)).toBe(false);expect(canAttackDomain({kind:'ship',role:'submarine'},{role:'air'},f)).toBe(false);});
it('submarine torpedoes retain sea-only masks and cannot splash into air/land',()=>{const cfg=factions.crown.naval.units.submarine;expect(cfg.targets).toEqual(['sea']);const p={id:'arrow-1',targetId:'air',position:{x:100,y:100},destination:{x:100,y:100},speed:280,remainingLife:3,damage:24,hitRadius:20,targets:cfg.targets};expect(advanceProjectiles([p],[{id:'air',role:'air',hp:100,position:p.destination}],1).damage.size).toBe(0);});
it('shore acquisition, firing, travel and enemy symmetry hit ships without walking onto water',()=>{const map=createMap('islands','legacy');const m=createMatch();m.gathering.units=[{...unit('archer'),position:{x:672,y:208},target:{x:672,y:208},order:{kind:'idle'}}];const target:Enemy={id:'target',kind:'ship',hp:1000,position:{x:752,y:208},order:{kind:'idle'}};const acquired=acquireTargets(m.gathering.units,[target],map);expect(acquired[0].order.kind).toBe('attack');const hit=updateCombat({...m.gathering,units:acquired},{baseHP:240,enemies:[target]},.5,map);expect(hit.combat.enemies[0].hp).toBeLessThan(1000);expect(hit.gathering.units[0].position.x).toBe(672);const navy=createNavy();navy.ships=[{kind:'ship',role:'transport',id:'ship-1',owner:'player',selected:false,hp:1000,position:target.position,target:target.position,order:{kind:'idle'}}];const enemy={...target,id:'enemy-1',kind:'unit' as const,role:'archer' as const,position:{x:672,y:208},order:{kind:'defend' as const,targetId:'ship-1'}};const reverse=updateCombat({...m.gathering,units:[]},{baseHP:240,enemies:[enemy]},.5,map,undefined,undefined,undefined,undefined,undefined,navy);expect(reverse.navy!.ships[0].hp).toBeLessThan(1000);});

it.each(factionIds)('%s flyers hit moving air targets with the shared combat lifecycle',f=>{
 const m=createMatch('skirmish','normal',{player:f,enemy:f});
 const attacker={...unit('air'),owner:'player' as const,faction:f,hp:factions[f].units.air.hp};
 let gathering:typeof m.gathering={...m.gathering,units:[attacker]},combat={baseHP:240,enemies:[{id:'target',role:'air' as const,kind:'unit' as const,hp:1000,position:{x:300,y:200},order:{kind:'idle' as const}}]};
 for(let i=0;i<35;i++){
  combat.enemies[0].position={x:300,y:200+Math.sin(i*.16)*65};
  const r=updateCombat(gathering,combat,.05);gathering=r.gathering;combat=r.combat as typeof combat;
 }
 expect(combat.enemies[0].hp).toBeLessThan(1000);
});

it('specialized anti-air towers lock and hit moving air; ground/ordinary towers retain their masks',async()=>{
 const {towerShots}=await import('./towers');
 const tower={id:'tower-1' as const,kind:'tower' as const,owner:'player' as const,footprint:{x:192,y:192,width:32,height:32},hp:160,construction:{remainingSeconds:0,builderId:null},level:2 as const,specialization:'air' as const,upgradeRemaining:null,cooldown:0};
 let placement={active:false,barracks:null,defenses:[tower]} as import('./placement').PlacementState,shots:import('./projectiles').Projectile[]=[],next=1,damage=0;
 for(let i=0;i<30;i++){
  const target={id:'target',kind:'unit' as const,role:'air' as const,hp:1000,position:{x:350,y:208+Math.sin(i*.15)*80}};
  const fired=towerShots(placement,[target],.05,next,()=>true);placement=fired.placement!;next=fired.next;
  const result=advanceProjectiles([...shots,...fired.shots.map(s=>s.projectile)],[target],.05);shots=result.projectiles;damage+=result.damage.get(target.id)??0;
 }
 expect(damage).toBeGreaterThanOrEqual(16);
 const air={id:'air',role:'air' as const,hp:100,position:{x:280,y:208}},ground={...air,id:'land',role:'soldier' as const};
 for(const defense of [{...tower,level:1 as const,specialization:undefined},{...tower,specialization:'ground' as const}]){
  expect(towerShots({...placement,defenses:[defense]},[air],1,1,()=>true).shots).toEqual([]);
  expect(towerShots({...placement,defenses:[defense]},[ground],1,1,()=>true).shots.length).toBeGreaterThan(0);
 }
 expect(towerShots({...placement,defenses:[tower]},[ground],1,1,()=>true).shots).toEqual([]);
 expect(towerShots({...placement,defenses:[tower]},[air],1,1,()=>false).shots).toEqual([]);
});

import { describe, expect, it } from 'vitest';
import { advanceProjectiles, type Projectile } from './projectiles';
const arrow=(extra:Partial<Projectile>={}):Projectile=>({id:'arrow-1',targetId:'enemy-1',position:{x:100,y:100},destination:{x:200,y:100},speed:100,remainingLife:2,damage:12,hitRadius:16,...extra});
const enemy={id:'enemy-1',hp:36,position:{x:200,y:100}};
describe('projectile lifecycle',()=>{
 it.each([1,10,100])('hits exactly once with %s time steps',steps=>{
  let shots=[arrow()],damage=0;for(let i=0;i<steps;i++){const r=advanceProjectiles(shots,[enemy],1/steps);shots=r.projectiles;damage+=r.damage.get(enemy.id)??0;}
  expect(damage).toBe(12);expect(shots).toEqual([]);expect(advanceProjectiles(shots,[enemy],100).damage.size).toBe(0);
 });
 it('uses fixed aim point, including hit-radius edge, and consumes misses',()=>{
  expect(advanceProjectiles([arrow()],[{...enemy,position:{x:216,y:100}}],1).damage.get(enemy.id)).toBe(12);
  const miss=advanceProjectiles([arrow()],[{...enemy,position:{x:216.01,y:100}}],1);expect(miss.projectiles).toEqual([]);expect(miss.damage.size).toBe(0);
 });
 it('expires before impact and rejects dead/missing/hidden targets',()=>{
  const expired=advanceProjectiles([arrow({remainingLife:.5})],[enemy],1);expect(expired.projectiles).toEqual([]);expect(expired.damage.size).toBe(0);
  for(const targets of [[],[{...enemy,hp:0}]])expect(advanceProjectiles([arrow()],targets,1).projectiles).toEqual([]);
  expect(advanceProjectiles([arrow()],[enemy],1,undefined,()=>false).damage.size).toBe(0);
 });
 it('cannot cross terrain even in one long step',()=>{
  const map={width:800,height:600,tileSize:32,revision:0,obstacles:[{x:144,y:80,width:32,height:64}]};
  const result=advanceProjectiles([arrow()],[enemy],2,map);expect(result.damage.size).toBe(0);expect(result.projectiles).toEqual([]);
 });
});

it('steers toward moving visible air targets, including splash, with unchanged speed/lifetime/damage',()=>{
 for(const splashRadius of [undefined,40]){
  let shots=[arrow({airborne:true,targets:['air'],splashRadius,speed:300})],total=0;
  for(let i=1;i<=30;i++){
   const moving={...enemy,role:'air' as const,position:{x:200,y:100+i*4}};
   const previous=shots[0],result=advanceProjectiles(shots,[moving],.05);total+=result.damage.get(enemy.id)??0;
   if(result.projectiles.length){expect(Math.hypot(result.projectiles[0].position.x-previous.position.x,result.projectiles[0].position.y-previous.position.y)).toBeLessThanOrEqual(15+1e-9);expect(result.projectiles[0].destination).toEqual(moving.position);}
   shots=result.projectiles;
  }
  expect(total).toBe(12);expect(shots).toEqual([]);
 }
});
it('never homes onto hidden, dead or domain-incompatible air targets and still expires',()=>{
 const air={...enemy,role:'air' as const,position:{x:260,y:180}},shot=arrow({airborne:true,targets:['air']});
 expect(advanceProjectiles([shot],[air],.1,undefined,()=>false).projectiles).toEqual([]);
 expect(advanceProjectiles([shot],[{...air,hp:0}],.1).projectiles).toEqual([]);
 expect(advanceProjectiles([arrow({targets:['land']})],[air],1).damage.size).toBe(0);
 const expired=advanceProjectiles([shot],[{...air,position:{x:1000,y:1000}}],3);expect(expired.projectiles).toEqual([]);expect(expired.damage.size).toBe(0);
});

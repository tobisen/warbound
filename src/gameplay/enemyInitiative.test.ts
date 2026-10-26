import {it,expect,afterAll} from 'vitest';
import {simulateEnemyInitiative} from './testHelpers/enemyInitiative';
import {decodeSave,encodeSave} from './save';
import {skirmishPacing} from '../config/skirmishPacing';
import {enemyStrategyConfig} from '../config/enemyStrategy';
import type {Difficulty} from '../config/difficulty';
import type {MapId} from '../config/maps';

const reports:ReturnType<typeof simulateEnemyInitiative>['report'][]=[];
for(const [map,difficulty] of [['arena','normal'],['plains96','normal'],['arena','easy'],['arena','hard'],['arena','beginner']] as [MapId,Difficulty][]){
 it(`takes initiative on ${map}/${difficulty} over twenty gameplay minutes and recovers after losses`,()=>{
  const {match:m,report:r}=simulateEnemyInitiative(map,difficulty);reports.push(r);
  expect(r.seconds).toBe(1200);
  const goals={beginner:{scout:180,attack:1080,expansion:840},easy:{scout:120,attack:900,expansion:720},normal:{scout:120,attack:660,expansion:540},hard:{scout:120,attack:540,expansion:420}}[difficulty];
  expect(r.scoutTime).toBeLessThanOrEqual(goals.scout);
  expect(r.firstScout).toBeLessThanOrEqual(goals.scout);
  expect(r.firstDispatch).toBeLessThanOrEqual(goals.attack);
  expect(r.firstDispatch).toBeGreaterThanOrEqual(skirmishPacing[difficulty].first);
  expect(r.firstHit).toBeGreaterThanOrEqual(skirmishPacing[difficulty].first);
  expect(r.firstHit).toBeLessThanOrEqual(goals.attack+120);
  expect(r.firstExpansion).toBeLessThanOrEqual(goals.expansion);
  if(difficulty==='normal'||difficulty==='hard')expect(r.thirdBase).toBeLessThanOrEqual(1200);
  expect(r.snapshots[4].jobs).toBeGreaterThan(r.snapshots[1].jobs);
  expect(r.snapshots[4].buildings.length).toBeGreaterThan(r.snapshots[0].buildings.length);
  // Before the injected loss, every completed accepted job still lives; queued
  // jobs explain the difference. The player has not attacked the AI.
  const at720=r.snapshots[5];expect(r.preLossSurvivors).toBe(at720.jobs);
  expect(r.removed).toBeGreaterThan(0);
  expect(r.jobsAfterLoss).toBeGreaterThan(0);
  expect(r.hitsAfterLoss).toBeGreaterThan(0);
  expect(r.dispatches.some(t=>t>720)).toBe(true);
  expect(r.dispatches.slice(1).every((time,i)=>time-r.dispatches[i]>=skirmishPacing[difficulty].gap)).toBe(true);
  expect(r.maxArmySupply).toBeLessThanOrEqual(enemyStrategyConfig[difficulty].maxArmy);
  expect(r.maxBuildings).toBeLessThanOrEqual(20);
  expect(m.combat.enemies.filter(e=>e.kind==='worker').length).toBeLessThanOrEqual(enemyStrategyConfig[difficulty].maxWorkers);
  expect(r.initialUnitsSurvive).toBe(true);
  for(const value of Object.values(r.ledgerError))expect(value).toBeCloseTo(0,6);
  const save=decodeSave(encodeSave(m,{camera:{x:0,y:0},building:null}));expect(save.ok,save.ok?'':save.error).toBe(true);
 // Latest CI measured593s/600s budget on Plains96; retain headroom for CPU variance.
 // This is a wall-clock budget; gameplay criteria and assertions stay1200s.
 },map==='plains96'?900000:difficulty==='hard'?600000:300000);
}
afterAll(()=>{
 const easy=reports.find(r=>r.map==='arena'&&r.difficulty==='easy')!,normal=reports.find(r=>r.map==='arena'&&r.difficulty==='normal')!,hard=reports.find(r=>r.map==='arena'&&r.difficulty==='hard')!;
 if(!easy||!normal||!hard)return; // Allow a targeted difficulty run; the complete suite compares all three.
 expect(hard.firstDispatch).toBeLessThan(normal.firstDispatch!);
 expect(normal.firstDispatch).toBeLessThan(easy.firstDispatch!);
 expect(hard.firstExpansion).toBeLessThan(easy.firstExpansion!);
 expect(hard.maxArmySupply).toBeGreaterThan(easy.maxArmySupply);
});

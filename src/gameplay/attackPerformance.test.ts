import {expect,it,vi} from 'vitest';
import {attackPerformanceFixture,attackObservation,updateMatch} from './testHelpers/attackPerformance';
import * as interaction from './approach';
it('a large hidden force becomes visible and fights while unchanged exploration routes are reused',()=>{
 let m=attackPerformanceFixture();expect(attackObservation(m).visible).toBe(0);
 const search=vi.spyOn(interaction,'approachRoute');
 try{
  m=updateMatch(m,1/60);const plans=()=>search.mock.calls.filter(c=>c[5]===true).length;
  expect(plans()).toBe(40);const initial=plans();
  for(let i=0;i<30;i++)m=updateMatch(m,1/60);
  expect(plans()).toBe(initial); // No forty new route searches every frame.
  for(let i=31;i<420;i++)m=updateMatch(m,1/60);
  const observation=attackObservation(m);expect(observation.visible).toBeGreaterThan(0);expect(observation.damage).toBe(true);expect(observation.outcome).toBe('playing');
  expect(m.combat.enemies.some(e=>e.id.startsWith('attack-enemy-')&&e.hp<10000)).toBe(true);
  expect(m.fog!.teams.player.visible.some(v=>!v)).toBe(true);
 }finally{search.mockRestore();}
},30000);

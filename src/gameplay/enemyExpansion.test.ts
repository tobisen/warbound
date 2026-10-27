import {createClassicMatch as createMatch} from './testHelpers/classicMatch';
import {expect,it} from 'vitest';
import {updateMatch,type MatchState} from './match';
import {prepareEnemyConstruction,enemyPopulation} from './enemyConstruction';
import {prepareEnemyExpansion,updateEnemyExpansion,wantsEnemyExpansion} from './enemyExpansion';
import {updateEnemyGathering} from './enemyGathering';
import {enemyPriority} from './enemyPolicy';
import {cleanDestroyed} from './destruction';
import {encodeSave,decodeSave} from './save';
import {enemyExpansionConfig} from '../config/enemyExpansion';
const view={camera:{x:0,y:0},building:null};
/** Ready initial barracks/learned upgrades/three army: explicit component preconditions. */
export function fixture():MatchState {
 const m=prepareEnemyConstruction(createMatch('skirmish','normal'));delete m.enemyKnowledge;m.fog!.teams.enemy.visible.fill(true);m.fog!.teams.enemy.explored.fill(true);
 // Explicit component visibility over candidate sites/resources, without knowledge of the hostile base.
 for(let row=12;row<=15;row++)for(let col=11;col<=15;col++)m.fog!.teams.enemy.visible[row*m.fog!.columns+col]=false;
 const bar=m.combat.enemies.find(e=>e.buildingType==='barracks')!;bar.construction={remainingSeconds:0,builderId:null};
 m.combat.enemies.find(e=>e.id==='enemy-worker-1')!.position={x:596,y:304};for(const e of m.combat.enemies)if(e.work)e.work.order={kind:'idle'};
 m.combat.enemies.push(...Array.from({length:3},(_,i)=>({id:`army-${i}`,owner:'enemy' as const,hp:36,position:{x:700+i*30,y:500},order:{kind:'idle' as const}})));
 m.enemyPolicy!.research={attack:1,defense:1,job:null};m.enemyProduction!.wood=100;m.enemyProduction!.gold=40;m.enemyProduction!.extracted={wood:234,gold:68};m.enemyProduction!.spent={wood:214,gold:48};m.gathering.node.remaining-=234;m.gathering.gold!.remaining-=68;m.waves.elapsedSeconds=2;return m;
}
it('expands only after army, upgrades and surviving economy; one site and one payment',()=>{
 expect(wantsEnemyExpansion(createMatch('skirmish'))).toBe(false);let m=fixture();expect(enemyPriority(m)).toBe('expansion');m=prepareEnemyExpansion(m);expect(m.enemyProduction!.wood).toBe(20);expect(m.enemyProduction!.gold).toBe(20);expect(m.combat.enemies.find(e=>e.id==='enemy-outpost')!.footprint).toEqual({x:608,y:256,width:96,height:96});expect(prepareEnemyExpansion(m).enemyProduction!.wood).toBe(20);expect(m.combat.enemies.filter(e=>e.buildingType==='outpost')).toHaveLength(1);
});
it('insufficient bank and blocked candidates cost nothing; a site cannot start beside another build',()=>{
 let m=fixture();m.enemyProduction!.wood=79;expect(prepareEnemyExpansion(m).enemyProduction!.wood).toBe(79);expect(prepareEnemyExpansion(m).combat.enemies.some(e=>e.buildingType==='outpost')).toBe(false);m=fixture();m.map.obstacles.push(...enemyExpansionConfig.candidates.map(p=>({...p,width:96,height:96})));expect(prepareEnemyExpansion(m).enemyProduction!.wood).toBe(100);expect(prepareEnemyExpansion(m).combat.enemies.some(e=>e.buildingType==='outpost')).toBe(false);m=fixture();m.combat.enemies.find(e=>e.buildingType==='barracks')!.construction!.remainingSeconds=1;expect(prepareEnemyExpansion(m).combat.enemies.some(e=>e.buildingType==='outpost')).toBe(false);
});
it('requires ten seconds of builder contact; supply and delivery activate only after completion',()=>{
 let m=prepareEnemyExpansion(fixture());const cap=enemyPopulation(m).cap;m=updateEnemyExpansion(m,9.9);expect(m.combat.enemies.find(e=>e.id==='enemy-outpost')!.construction!.remainingSeconds).toBeCloseTo(.1);expect(enemyPopulation(m).cap).toBe(cap);m=updateEnemyExpansion(m,.1);expect(enemyPopulation(m).cap).toBe(cap+8);const worker=m.combat.enemies.find(e=>e.id==='enemy-worker-1')!;worker.work={cargo:5,cargoType:'wood',target:worker.position,order:{kind:'deliver',nodeId:'wood-1'}};const before=m.enemyProduction!.wood;m=updateEnemyGathering(m,0);expect(m.enemyProduction!.wood).toBe(before+5);expect(m.combat.enemies.find(e=>e.id===worker.id)!.work!.cargo).toBe(0);
});
it('builder death pauses then a paid replacement can resume without paying for the site twice',()=>{
 let m=prepareEnemyExpansion(fixture());m.combat.enemies.find(e=>e.id==='enemy-worker-1')!.hp=0;m=cleanDestroyed(m);const cost=m.enemyProduction!.spent!.wood;expect(updateEnemyExpansion(m,100).combat.enemies.find(e=>e.id==='enemy-outpost')!.construction!.remainingSeconds).toBe(10);m.waves.elapsedSeconds=4;m=prepareEnemyExpansion(m);expect(m.combat.enemies.find(e=>e.id==='enemy-outpost')!.construction!.builderId).toBe('enemy-worker-2');expect(m.enemyProduction!.spent!.wood).toBe(cost);
});
it('destroyed expansion removes delivery/supply/footprint and rebuilt base pays again',()=>{
 let m=updateEnemyExpansion(prepareEnemyExpansion(fixture()),10);const out=m.combat.enemies.find(e=>e.id==='enemy-outpost')!;out.hp=0;m=cleanDestroyed(m);expect(m.map.obstacles.some(o=>o.x===608&&o.y===256&&o.width===96)).toBe(false);expect(enemyPopulation(m).cap).toBe(8);m.enemyProduction!.wood=100;m.enemyProduction!.gold=40;m.waves.elapsedSeconds=4;m=prepareEnemyExpansion(m);expect(m.enemyProduction!.wood).toBe(20);expect(m.enemyProduction!.spent!.wood).toBe(374);
});
it('save/load in construction and after completion, strict timers, pause and restart',()=>{
 const m=updateEnemyExpansion(prepareEnemyExpansion(fixture()),3);m.paused=true;const loaded=decodeSave(encodeSave(m,view));expect(loaded.ok).toBe(true);if(!loaded.ok)return;expect(loaded.match.enemyRecovery).toEqual(m.enemyRecovery);expect(updateMatch(loaded.match,100)).toBe(loaded.match);const completed=updateEnemyExpansion({...loaded.match,paused:false},7);expect(decodeSave(encodeSave(completed,view)).ok).toBe(true);expect(createMatch('skirmish').combat.enemies.some(e=>e.buildingType==='outpost')).toBe(false);for(const mutate of [(d:any)=>d.state.combat.enemies.find((e:any)=>e.id==='enemy-outpost').construction.remainingSeconds=11,(d:any)=>d.state.combat.enemies.find((e:any)=>e.id==='enemy-outpost').footprint.width=64,(d:any)=>delete d.state.enemyRecovery]){const d=JSON.parse(encodeSave(m,view));mutate(d);expect(decodeSave(JSON.stringify(d)).ok).toBe(false);}
});

it('unfinished or destroyed dropoff cannot credit cargo and a loaded carrier keeps its wood',()=>{
 let m=prepareEnemyExpansion(fixture());const worker=m.combat.enemies.find(e=>e.id==='enemy-worker-2')!;worker.position={x:596,y:320};worker.work={cargo:5,cargoType:'wood',target:worker.position,order:{kind:'deliver',nodeId:'wood-1'}};const before=m.enemyProduction!.wood;m=updateEnemyGathering(m,0);expect(m.enemyProduction!.wood).toBe(before);expect(m.combat.enemies.find(e=>e.id===worker.id)!.work!.cargo).toBe(5);m=updateEnemyExpansion(m,10);m.combat.enemies.find(e=>e.id==='enemy-outpost')!.hp=0;m=cleanDestroyed(m);m=updateEnemyGathering(m,0);expect(m.enemyProduction!.wood).toBe(before);expect(m.combat.enemies.find(e=>e.id===worker.id)!.work!.cargo).toBe(5);expect(m.combat.enemies.find(e=>e.id===worker.id)!.navigation!.goalKey).toContain('960:96');
});

it('AI outpost can be built below aircraft while a ground unit still blocks the site',()=>{for(const air of [true,false]){const m=fixture();m.gathering.units.push({id:'unit-4',kind:'soldier',owner:'player',...(air?{archetype:'scout' as const}:{}),hp:60,cargo:0,selected:false,position:{x:656,y:304},target:{x:656,y:304},order:{kind:'idle'}});const site=prepareEnemyExpansion(m).combat.enemies.find(e=>e.buildingType==='outpost');expect(site?.footprint?.x===608&&site?.footprint?.y===256).toBe(air);}});

it('builds another paid dropoff beside remembered resources and resumes its distinct job',()=>{
 let m=updateEnemyExpansion(prepareEnemyExpansion(fixture()),10);m.map.design='woodlands';
 m.enemyKnowledge={nodes:[{id:'gold-1',position:{x:1056,y:480},remaining:800,resource:'gold'}],playerBase:null,resourceScoutIndex:0,attackScoutIndex:0};
 m.fog!.teams.enemy.explored.fill(true);m.fog!.teams.enemy.visible.fill(true);m.enemyProduction!.wood=100;m.enemyProduction!.gold=40;m.waves.elapsedSeconds=20;
 const started=prepareEnemyExpansion(m),site=started.combat.enemies.find(e=>e.id==='enemy-outpost-2');
 expect(site).toBeDefined();expect(started.enemyProduction!.wood).toBe(20);expect(started.enemyProduction!.gold).toBe(20);
 expect(started.combat.enemies.find(e=>e.id===site!.construction!.builderId)!.work!.order).toEqual({kind:'build',buildingId:'outpost-2'});
 expect(prepareEnemyExpansion(started).enemyProduction!.wood).toBe(20);
 const builder=started.combat.enemies.find(e=>e.id===site!.construction!.builderId)!;builder.position={x:site!.footprint!.x-12,y:site!.position.y};
 const completed=updateEnemyExpansion(started,10);expect(completed.combat.enemies.find(e=>e.id===site!.id)!.construction!.remainingSeconds).toBe(0);
});

it('does not select a further expansion from hidden live resource changes',()=>{
 let a=updateEnemyExpansion(prepareEnemyExpansion(fixture()),10);a.map.design='woodlands';a.enemyKnowledge={nodes:[],playerBase:null,resourceScoutIndex:0,attackScoutIndex:0};a.enemyProduction!.wood=100;a.enemyProduction!.gold=40;a.waves.elapsedSeconds=20;
 const b=structuredClone(a);b.gathering.gold!.remaining=0;b.gathering.gold!.position={x:1040,y:700};
 expect(prepareEnemyExpansion(a).combat.enemies).toEqual(prepareEnemyExpansion(b).combat.enemies);
 expect(prepareEnemyExpansion(a).enemyProduction!.wood).toBe(100);
});

import {vi} from 'vitest';
import * as approach from './approach';
import {validExpansionSites,expansionSpacing} from './enemyExpansionSites';
import {overlaps} from './map';
it('applies separation to the main base and every completed or planned owner-known base, even without map obstacles',()=>{
 const m=fixture(),main=m.combat.enemies.find(e=>e.kind==='base')!,point=enemyExpansionConfig.candidates[0];
 expect(validExpansionSites(m,[main.footprint!,point])).toEqual([point]);
 for(const remainingSeconds of [0,10]){
  const footprint={...point,width:96,height:96},position={x:point.x+48,y:point.y+48};
  const copy=structuredClone(m);copy.combat.enemies.push({id:'enemy-outpost',kind:'building',buildingType:'outpost',owner:'enemy',hp:240,position,footprint,construction:{remainingSeconds,builderId:null}});
  expect(validExpansionSites(copy,[point,{x:point.x+96,y:point.y},enemyExpansionConfig.candidates[2]])).not.toContainEqual(point);
  for(const site of validExpansionSites(copy,enemyExpansionConfig.candidates))for(const b of copy.combat.enemies.filter(e=>e.kind==='base'||e.buildingType==='outpost')){
   expect(Math.hypot(site.x+48-b.position.x,site.y+48-b.position.y)).toBeGreaterThanOrEqual(expansionSpacing(copy));expect(overlaps({...site,width:96,height:96},b.footprint!)).toBe(false);
  }
 }
 const started=prepareEnemyExpansion(m),site=started.combat.enemies.find(e=>e.buildingType==='outpost')!;
 expect(Math.hypot(site.position.x-main.position.x,site.position.y-main.position.y)).toBeGreaterThanOrEqual(320);
});
it('uses a different valid candidate when the first is physically blocked',()=>{
 const m=fixture(),first=enemyExpansionConfig.candidates[0];m.map.obstacles.push({...first,width:96,height:96});
 const result=prepareEnemyExpansion(m),site=result.combat.enemies.find(e=>e.buildingType==='outpost');
 expect(site).toBeDefined();expect(site!.footprint).not.toMatchObject(first);expect(result.enemyProduction!.wood).toBe(20);
});
it('remembers a failed access attempt and tries another candidate rather than repeating the same coordinates',()=>{
 let m=fixture();const search=vi.spyOn(approach,'canReachFootprint').mockReturnValue(false);
 try{
  m=prepareEnemyExpansion(m);expect(search).toHaveBeenCalledTimes(2);expect(m.enemyRecovery!.expansionPlan!.failed).toHaveLength(1);
  const failed=m.enemyRecovery!.expansionPlan!.failed[0];expect(m.enemyProduction!.wood).toBe(100);
  const saved=encodeSave(m,view);expect(JSON.parse(saved).state.enemyRecovery.expansionPlan).toBeUndefined();expect(decodeSave(saved).ok).toBe(true);
  search.mockClear();search.mockReturnValue(true);m.waves.elapsedSeconds+=1;m=prepareEnemyExpansion(m);
  const site=m.combat.enemies.find(e=>e.buildingType==='outpost')!;expect(site).toBeDefined();expect(site.footprint).not.toMatchObject(failed.point);
  expect(search.mock.calls.every(call=>call[2].x!==failed.point.x||call[2].y!==failed.point.y)).toBe(true);
 }finally{search.mockRestore();}
});
it('waits without repeated access searches if every candidate failed, then reevaluates after backoff',()=>{
 let m=fixture();const search=vi.spyOn(approach,'canReachFootprint').mockReturnValue(false);
 try{
  for(let tick=0;tick<3;tick++){m=prepareEnemyExpansion(m);m.waves.elapsedSeconds+=1;}
  expect(m.enemyRecovery!.expansionPlan!.failed).toHaveLength(3);const count=search.mock.calls.length;
  for(let tick=0;tick<8;tick++){m=prepareEnemyExpansion(m);m.waves.elapsedSeconds+=1;}
  expect(search).toHaveBeenCalledTimes(count);expect(m.combat.enemies.some(e=>e.buildingType==='outpost')).toBe(false);expect(m.enemyProduction!.wood).toBe(100);
  m.waves.elapsedSeconds+=15;search.mockReturnValue(true);m=prepareEnemyExpansion(m);
  expect(m.combat.enemies.some(e=>e.buildingType==='outpost')).toBe(true);expect(search.mock.calls.length).toBeGreaterThan(count);
 }finally{search.mockRestore();}
});
it('no room, no remembered resources, or known danger means no overlapping fallback or payment',()=>{
 for(const reason of ['small','resources','danger']){
  const m=fixture();m.enemyKnowledge={nodes:[],playerBase:null,resourceScoutIndex:0,attackScoutIndex:0};
  if(reason==='small'){m.map.width=192;m.map.height=192;}else if(reason==='danger'){m.enemyKnowledge.nodes=[{id:'known',position:{x:656,y:304},remaining:500,resource:'gold'}];m.enemyKnowledge.playerBase={x:656,y:304};}
  const result=prepareEnemyExpansion(m);expect(result.combat.enemies.some(e=>e.buildingType==='outpost')).toBe(false);expect(result.enemyProduction!.wood).toBe(100);
 }
});

it('legacy AI without a knowledge snapshot still uses current sight and scouts before paying for a hidden site',()=>{
 const m=fixture();m.fog!.teams.enemy.visible.fill(false);m.fog!.teams.enemy.explored.fill(false);
 const hidden=structuredClone(m);hidden.gathering.node.remaining=0;hidden.gathering.gold!.remaining=0;
 expect(prepareEnemyExpansion(m).combat.enemies).toEqual(prepareEnemyExpansion(hidden).combat.enemies);
 expect(prepareEnemyExpansion(m).enemyProduction!.wood).toBe(100);
 // Reveal just the remembered resource, not the proposed building footprint.
 const node=m.gathering.node.position,col=Math.floor(node.x/32),row=Math.floor(node.y/32);m.fog!.teams.enemy.visible[row*m.fog!.columns+col]=true;
 const scouted=prepareEnemyExpansion(m);expect(scouted.enemyProduction!.wood).toBe(100);expect(scouted.combat.enemies.some(e=>e.buildingType==='outpost')).toBe(false);
 expect(scouted.enemyRecovery!.expansionPlan?.scout).toBeDefined();
});

it('avoids visible defense towers without consulting hidden live towers',()=>{
 const m=fixture(),point=enemyExpansionConfig.candidates[0];m.fog!.teams.enemy.visible.fill(false);
 m.enemyKnowledge={nodes:[{id:'known-gold',resource:'gold',position:{x:650,y:180},remaining:500}],playerBase:null,resourceScoutIndex:0,attackScoutIndex:0};
 expect(validExpansionSites(m,[point])).toEqual([point]);
 const footprint={x:720,y:352,width:32,height:32};m.placement.defenses=[{id:'tower-1',kind:'tower',owner:'player',hp:160,footprint,construction:{remainingSeconds:0,builderId:null},level:1,upgradeRemaining:null,cooldown:0}];
 expect(validExpansionSites(m,[point])).toEqual([point]);
 m.fog!.teams.enemy.visible[11*m.fog!.columns+22]=true;
 expect(validExpansionSites(m,[point])).toEqual([]);
});

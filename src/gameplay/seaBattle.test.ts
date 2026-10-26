import {seaBattle as battle} from './testHelpers/seaBattle';
import {expect,it} from 'vitest';
import {createMatch,updateMatch} from './match';
import {seaBattleMission,seaBattleDifficulty} from '../config/seaBattle';
import {identityFor,campaignMissionsFor} from '../config/campaignSeries';
import {startCampaignMission} from './campaign';
import {domainBodyFits,findDomainRoute} from './terrainNavigation';
import {validMatchOptions} from './matchSettings';
import {mapDiscoveries} from '../config/discoveries';
import {campaignPlan,campaignPhaseMet} from './campaignPhases';
import {bodyFits} from './map';
import {resourceNodes} from './gathering';
import {decodeSave,encodeSave} from './save';

it('starts a real scalable naval expedition with legal fleets, coastal production and supply',()=>{
 for(const difficulty of Object.keys(seaBattleDifficulty) as (keyof typeof seaBattleDifficulty)[]){
  const m=battle(difficulty);expect(m).not.toBeNull();expect(m.factions).toEqual({player:'crown',enemy:'dwarves'});
  expect(m.navy!.ships.length).toBe(16);expect(m.combat.enemies.filter(e=>e.kind==='ship').length).toBe(seaBattleDifficulty[difficulty].enemyShips);
  expect(m.navy!.ships.every(s=>domainBodyFits(m.map,'water',s.position,16))).toBe(true);
  expect(m.gathering.units.filter(u=>u.kind==='soldier'&&u.archetype==='scout')).toHaveLength(1);
  expect(m.campaignRun!.phase).toBe(0);expect(m.outcome).toBe('playing');
 }
});
it('saves the expedition and retains its exact phase and fleets',()=>{
 const m=battle(),save=decodeSave(encodeSave(m,{camera:{x:800,y:256},building:null}));
 expect(save.ok,save.ok?'':save.error).toBe(true);
 if(save.ok){expect(save.match.campaignMission).toBe(seaBattleMission);expect(save.match.navy!.ships.length).toBe(16);expect(save.match.campaignRun).toEqual(m.campaignRun);}
});

import {simulateSeaBattle} from './testHelpers/seaBattleTactics';
it('can break the blockade with focus fire and genuinely paid reinforcements',()=>{
 const phases:number[]=[];const result=simulateSeaBattle(720,m=>{phases.push(m.campaignRun!.phase);const saved=decodeSave(encodeSave(m,{camera:{x:0,y:0},building:null}));expect(saved.ok,saved.ok?'':saved.error).toBe(true);});expect(phases).toEqual([1,2,3,4]);console.log(JSON.stringify(result.snapshots));
 expect(result.match.combat.baseHP).toBeGreaterThan(0);expect(result.match.campaignRun!.phase).toBeGreaterThanOrEqual(2);expect(result.peak).toBeGreaterThan(0);expect(result.match.outcome).toBe('victory');
},120000);

it('keeps three sea lanes, an optional resource island and campaign-only map identity after Save',()=>{
 const m=battle();expect(validMatchOptions({scenario:'skirmish',difficulty:'normal',map:'straits'})).toBe(false);
 const saved=decodeSave(encodeSave(m,{camera:{x:0,y:0},building:null}));expect(saved.ok).toBe(true);if(!saved.ok)return;
 for(const map of [m.map,saved.match.map]){
  for(const via of [{x:1600,y:480},{x:1600,y:1216},{x:1600,y:1952}]){
   expect(findDomainRoute(map,'water',{x:960,y:640},via,16).ok).toBe(true);
   expect(findDomainRoute(map,'water',via,{x:2272,y:640},16).ok).toBe(true);
  }
  expect(findDomainRoute(map,'land',m.gathering.units[0].position,{x:2496,y:864},12).ok).toBe(false);
  expect(bodyFits(map,{x:1328,y:1808},12)).toBe(true);
 }
 const island=resourceNodes(m.gathering).filter(n=>n.id.endsWith('-3'));expect(island.map(n=>n.resource).sort()).toEqual(['gold','wood']);expect(island.every(n=>n.remaining>0)).toBe(true);
 for(const d of mapDiscoveries('straits','regions'))expect(bodyFits(m.map,d.position,20)).toBe(true);
});

it('requires armed ships and landed ground combatants rather than transports, workers or aircraft',()=>{
 const m=battle(),phases=campaignPlan(m)!.phases,passage=phases[0].points![0];
 expect(campaignPhaseMet(m,phases[0])).toBe(false);
 for(const e of m.combat.enemies.filter(e=>e.kind==='ship'))e.position={x:2176,y:1280};
 for(const s of m.navy!.ships.filter(s=>s.role!=='transport').slice(0,3))s.position={...passage};
 expect(campaignPhaseMet(m,phases[0])).toBe(true);
 m.combat.enemies.find(e=>e.kind==='ship')!.position={...passage};expect(campaignPhaseMet(m,phases[0])).toBe(false);
 m.combat.enemies=m.combat.enemies.filter(e=>e.kind!=='ship');for(const s of m.navy!.ships)s.role='transport';expect(campaignPhaseMet(m,phases[0])).toBe(false);
 const beach=phases[2].points![0];for(const u of m.gathering.units)if(u.kind==='worker'||u.kind==='soldier'&&u.archetype==='scout')u.position={...beach};
 expect(campaignPhaseMet(m,phases[2])).toBe(false);
 m.gathering.units.find(u=>u.kind==='soldier'&&!u.archetype)!.position={...beach};expect(campaignPhaseMet(m,phases[2])).toBe(true);
});

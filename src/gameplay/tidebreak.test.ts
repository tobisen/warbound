import {expect,it} from 'vitest';
import {simulateTidebreak,tidebreak} from './testHelpers/tidebreak';
import {decodeSave,encodeSave} from './save';
import {updateMatch} from './match';
import {campaignPhaseMet,campaignPlan} from './campaignPhases';
import {completeCampaignMission} from './campaign';
import {identityFor} from '../config/campaignSeries';
import {tidebreakMission} from '../config/seaBattle';
it.each(['screen','logistics'] as const)('wins Tidebreak with %s using actual scouting, combat, costs and landing; saves every phase',strategy=>{
 const phases:number[]=[];const m=simulateTidebreak(strategy,m=>{phases.push(m.campaignRun!.phase);const save=decodeSave(encodeSave(m,{camera:{x:0,y:0},building:null}));expect(save.ok,save.ok?'':save.error).toBe(true);});
 console.log(strategy,JSON.stringify({outcome:m.outcome,phase:m.campaignRun!.phase,time:m.waves.elapsedSeconds,bank:[m.gathering.wood,m.gathering.goldBalance],research:m.research,ships:m.navy!.ships.length}));
 expect(m.outcome).toBe('victory');expect(phases).toContain(4);expect(phases).toContain(5);expect(phases.at(-1)).toBe(6);
 if(strategy==='logistics')expect(m.research!.convoyService).toBe(1);
 const progress=completeCampaignMission({version:1,identity:identityFor('crown','normal'),completed:[]},m);expect(progress.completed).toContain(tidebreakMission);
},120000);
it('does not count aircraft/passengers as a landing and base loss takes precedence',()=>{
 const m=tidebreak(),landing=campaignPlan(m)!.phases[4];m.gathering.units.find(u=>u.kind==='soldier'&&u.archetype==='scout')!.position={...landing.points![0]};expect(campaignPhaseMet(m,landing)).toBe(false);
 m.combat.baseHP=0;expect(updateMatch(m,.1).outcome).toBe('defeat');
});

import {terrainPatches,bodyFits} from './map';
import {seaBattle} from './testHelpers/seaBattle';
import {mapDiscoveries} from '../config/discoveries';
import {findDomainRoute} from './terrainNavigation';
import {resourceNodes} from './gathering';
it('has its own Reef Island chart, reachable sea approaches and finite accessible forward resources',()=>{
 const m=tidebreak(),old=seaBattle();expect(m.map.id).toBe('tidebreak');expect(terrainPatches(m.map)).not.toEqual(terrainPatches(old.map));
 expect(bodyFits(m.map,{x:2000,y:1552},12)).toBe(true);expect(bodyFits(old.map,{x:2000,y:1552},12)).toBe(false);
 for(const d of mapDiscoveries('tidebreak',m.map.design))expect(bodyFits(m.map,d.position,12)).toBe(true);
 for(const p of [{x:1600,y:480},{x:1600,y:1216},{x:1600,y:1952}])expect(findDomainRoute(m.map,'water',{x:960,y:640},p,16).ok).toBe(true);
 expect(resourceNodes(m.gathering).filter(n=>n.id.endsWith('-4')).map(n=>[n.resource,n.remaining])).toEqual([['wood',600],['gold',1500]]);
 expect(findDomainRoute(m.map,'land',m.gathering.units[0].position,{x:2000,y:1552},12).ok).toBe(false);
});

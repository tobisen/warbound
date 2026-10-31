import {it,expect} from 'vitest';
import {tidebreak,simulateTidebreak} from './testHelpers/tidebreak';
import {campaignPhaseMet,advanceCampaignPhases,controlsBlockade,navalMissionLost,campaignPlan} from './campaignPhases';
import {decodeSave,encodeSave} from './save';
import {updateMatch,createMatch} from './match';
import {legacyTidebreakPlan} from '../config/tidebreakObjectives';
const view={camera:{x:0,y:0},building:null};
it('blockade requires both channels, armed ships and continuous uncontested time',()=>{
 let m=tidebreak();m.campaignRun!.phase=2;const goal=campaignPlan(m)!.phases[2];m.combat.enemies=m.combat.enemies.filter(e=>e.kind!=='ship');
 const armed=m.navy!.ships.filter(s=>s.role!=='transport');armed.forEach((s,i)=>s.position={...goal.points![i<3?0:1]});
 expect(controlsBlockade(m,goal)).toBe(true);m=advanceCampaignPhases(m);expect(m.campaignRun!.navalHoldStartedSeconds).toBe(0);
 m.waves.elapsedSeconds=19;m=advanceCampaignPhases(m);expect(m.campaignRun!.phase).toBe(2);
 armed[0].position={x:960,y:640};m=advanceCampaignPhases(m);expect(m.campaignRun!.navalHoldStartedSeconds).toBeUndefined();
 armed[0].position={...goal.points![0]};m=advanceCampaignPhases(m);m.waves.elapsedSeconds=38;expect(campaignPhaseMet(m,goal)).toBe(false);m.waves.elapsedSeconds=39;expect(campaignPhaseMet(m,goal)).toBe(true);
 m.combat.enemies.push({id:'enemy-ship-99',kind:'ship',owner:'enemy',hp:80,navalRole:'warship',position:{...goal.points![1]},order:{kind:'idle'}});expect(controlsBlockade(m,goal)).toBe(false);
});
it('evacuation tracks identities, live passengers and actual unloading; loss precedes victory',()=>{
 const m=tidebreak(),goal=campaignPlan(m)!.phases[5],refugees=m.gathering.units.filter(u=>['unit-1','unit-2'].includes(u.id));
 expect(navalMissionLost(m)).toBe(false);m.gathering.units=m.gathering.units.filter(u=>!refugees.includes(u));m.navy!.ships.find(s=>s.role==='transport')!.passengers=refugees;
 expect(navalMissionLost(m)).toBe(false);expect(campaignPhaseMet(m,goal)).toBe(false);
 m.navy!.ships.find(s=>s.role==='transport')!.passengers=[];expect(navalMissionLost(m)).toBe(true);expect(updateMatch(m,.1).outcome).toBe('defeat');
 m.gathering.units.push(...refugees.map(u=>({...u,position:{...goal.points![0]}})));expect(campaignPhaseMet(m,goal)).toBe(true);
 m.combat.baseHP=0;m.campaignRun!.phase=5;expect(updateMatch(m,.1).outcome).toBe('defeat');
});
it('Save78 Tidebreak keeps its former six phases and worker locations, rather than inventing refugees',()=>{
 const m=tidebreak();m.gathering.units.filter(u=>u.kind==='worker').forEach((u,i)=>{u.position={x:400+i*32,y:400};u.target={...u.position};});
 const doc=JSON.parse(encodeSave(m,view));doc.configVersion='tribute-config-78';const loaded=decodeSave(JSON.stringify(doc));expect(loaded.ok,JSON.stringify(loaded)).toBe(true);
 if(loaded.ok){expect(loaded.match.campaignRun!.legacyTidebreak).toBe(true);expect(campaignPlan(loaded.match)).toBe(legacyTidebreakPlan);expect(loaded.match.gathering.units[0].position).toEqual({x:400,y:400});expect(navalMissionLost(loaded.match)).toBe(false);}
});
it('new evacuation wins with the enemy command intact and round-trips its final state',()=>{
 const m=simulateTidebreak('screen');expect(m.outcome).toBe('victory');expect(m.combat.enemies.some(e=>e.kind==='base'&&e.hp>0)).toBe(true);expect(decodeSave(encodeSave(m,view)).ok).toBe(true);
},120000);
it('single-player Save78 loads without colony fields and rejects injected legacy fields',()=>{
 const doc=JSON.parse(encodeSave(createMatch('skirmish','normal',undefined,'trident'),view));doc.configVersion='tribute-config-78';expect(decodeSave(JSON.stringify(doc)).ok).toBe(true);doc.state.enemyNaval.nextColonySeconds=10;expect(decodeSave(JSON.stringify(doc)).ok).toBe(false);
});

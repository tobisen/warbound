import {largeUnitFixture as ready} from './testHelpers/largeUnitFixture';
import {expect,it} from 'vitest';
import {createMatch,type MatchState} from './match';
import {factions,factionsForPlayer,type FactionId} from '../config/factions';
import {trainFlyer,updateFlightProduction} from './flightProduction';
import {trainGiant} from './giants';
import {updateHealerProduction} from './healers';
import {trainShip,updateNavy,canTrainShip} from './navy';
import {updateCombat,type Enemy} from './combat';
import {prepareNavalCombat} from './navalCombat';
import {updateEnemyNaval} from './enemyNaval';
import {updateEnemyProduction} from './enemyProduction';
import {matchFog} from './matchFog';
import {encodeSave,decodeSave} from './save';
import {technologyFor} from './productionPrerequisites';
import {targetDomain,canAttackDomain} from './domains';
import {combatUnitStats} from '../config/unit';
import {commandMappedMove} from './navigation';
import {updateGathering} from './gathering';
import {actionPanel} from '../presentation/actionPanel';
import {identityFor} from '../config/campaignSeries';
import {missionContent} from '../config/campaignContent';
const view={camera:{x:0,y:0},building:null};
function roundtrip(m:MatchState){const r=decodeSave(encodeSave({...m,fog:matchFog(m)},view));expect(r.ok,r.ok?'':r.error).toBe(true);if(!r.ok)throw Error(r.error);return r.match;}
it.each([['goblins','zeppelin'],['clans','behemoth']] as const)('%s produces its own new unit, with real cost, tech, supply, queue/save, movement and faction limits',(f,role)=>{
 let m=ready(f),recipe=factions[f].units[role];const train=(s:MatchState)=>role==='zeppelin'?trainFlyer(s,role):trainGiant(s,role);
 const locked={...m,research:{...m.research!,attack:1}};expect(train(locked).gathering).toBe(locked.gathering);
 m=train(m);expect(m.gathering.wood).toBe(1200-recipe.cost.wood);expect(m.gathering.goldBalance).toBe(1000-recipe.cost.gold);
 m=roundtrip(m);m=role==='zeppelin'?updateFlightProduction(m,42):updateHealerProduction(m,40);
 const unit=m.gathering.units.find(u=>u.kind==='soldier'&&u.archetype===role)!;expect(unit).toMatchObject({hp:recipe.hp,archetype:role,faction:f});expect(targetDomain(unit)).toBe(recipe.domain);
 m=roundtrip(m);m.gathering.units=m.gathering.units.map(u=>({...u,selected:u.id===unit.id}));m.gathering.units=commandMappedMove(m.gathering.units,{x:720,y:600},m.map);m.gathering=updateGathering(m.gathering,3,m.map);expect(m.gathering.units.find(u=>u.id===unit.id)!.position).not.toEqual(unit.position);
 expect(actionPanel(ready('crown'),role==='zeppelin'?'aviary':'academy',true)[`train-${role}`].visible).toBe(false);
 expect(missionContent(f==='goblins'?'goblins-two-sided-bargain':'clans-warband-confluence').units).toContain(role);expect(identityFor(f,'normal')).toBeTruthy();
});
it('behemoth smashes buildings, stays unable to hit aircraft, and takes damage from ordinary ranged counters',()=>{
 let m=updateHealerProduction(trainGiant(ready('clans'),'behemoth'),40),g=m.gathering.units.find(u=>u.kind==='soldier'&&u.archetype==='behemoth')!;
 g={...g,position:{x:600,y:460},target:{x:600,y:460},order:{kind:'attack',enemyId:'enemy-building'}};const building:Enemy={id:'enemy-building',kind:'building',buildingType:'forge',hp:1000,position:{x:630,y:460},footprint:{x:614,y:444,width:32,height:32}};
 const r=updateCombat({...m.gathering,units:[g]},{baseHP:240,enemies:[building]},1);expect(r.combat.enemies[0].hp).toBe(868);
 expect(canAttackDomain(g,{role:'air'},'clans')).toBe(false);const archer:Enemy={id:'archer',kind:'unit',role:'archer',owner:'enemy',hp:50,position:{x:700,y:460},order:{kind:'defend',targetId:g.id}};
 let fight:Pick<ReturnType<typeof updateCombat>,'gathering'|'combat'>={gathering:{...m.gathering,units:[{...g,order:{kind:'idle' as const}}]},combat:{baseHP:240,enemies:[archer]}};for(let i=0;i<20;i++)fight=updateCombat(fight.gathering,fight.combat,.1,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,'crown');expect(fight.gathering.units[0].hp).toBeLessThan(560);
});
it('zeppelin bombs ground with splash, cannot shoot air and is vulnerable to anti-air',()=>{
 const m=updateFlightProduction(trainFlyer(ready('goblins'),'zeppelin'),42),u=m.gathering.units.find(u=>u.kind==='soldier'&&u.archetype==='zeppelin')!;u.position={x:600,y:460};u.target=u.position;u.order={kind:'attack',enemyId:'target'};
 expect(canAttackDomain(u,{kind:'ship'},'goblins')).toBe(true);expect(canAttackDomain(u,{role:'air'},'goblins')).toBe(false);
 let r=updateCombat({...m.gathering,units:[u]},{baseHP:240,enemies:[{id:'target',kind:'unit',hp:300,position:{x:800,y:460},order:{kind:'idle'}},{id:'splash',kind:'unit',hp:300,position:{x:816,y:460},order:{kind:'idle'}}]},.1);
 expect(r.combat.projectiles?.[0]).toMatchObject({splashRadius:40,airborne:true});for(let i=0;i<15;i++)r=updateCombat(r.gathering,r.combat,.1);expect(r.combat.enemies.every(e=>e.hp<300)).toBe(true);
});
it.each([['goblins','zeppelin'],['clans','behemoth']] as const)('AI pays the same %s %s recipe at its real producer',(f,role)=>{
 const m=ready(f),site={id:'enemy-barracks',kind:'building' as const,buildingType:'barracks' as const,owner:'enemy' as const,hp:120,footprint:{x:1728,y:640,width:64,height:64},position:{x:1760,y:672},construction:{remainingSeconds:0,builderId:null}};
 m.combat.enemies.push(site,{...site,id:'enemy-special',buildingType:role==='zeppelin'?'aviary':'academy'});const technology={baseLevel:3,buildings:['base','forge','barracks','academy','aviary'] as const,research:{attack:2,defense:2}};
 const original=factions[f].roster;factions[f].roster=['worker',role];try{const bank={...m.enemyProduction!,roster:true as const,wood:1000,gold:1000,cap:50};const r=updateEnemyProduction(bank,m.combat,m.gathering,m.map,45,f,{site,technology,population:{used:0,reserved:0,cap:50}});expect(r.combat.enemies.some(e=>e.role===role)).toBe(true);expect(r.state.wood).toBeLessThanOrEqual(1000-factions[f].units[role].cost.wood);}finally{factions[f].roster=original;}
});
import {capitalFixture} from './testHelpers/largeUnitFixture';
it('capital is paid, tech-gated, queued/saved, vulnerable to air and fires its configured broadside',()=>{
 let m=capitalFixture();expect(canTrainShip(m,'capital')).toBe(true);const noDock={...m,placement:{...m.placement,producers:m.placement.producers!.filter(p=>p.kind!=='drydock')}};expect(canTrainShip(noDock,'capital')).toBe(false);
 const bank=m.gathering.wood;m=trainShip(m,'capital');expect(m.gathering.wood).toBe(bank-200);m=roundtrip(m);m=updateNavy(m,44.9);expect(m.navy!.ships).toHaveLength(0);m=updateNavy(m,.1);expect(m.navy!.ships[0]).toMatchObject({role:'capital',hp:520});m=roundtrip(m);
 const ship=m.navy!.ships[0];expect(canAttackDomain(ship,{role:'air'},'crown')).toBe(false);expect(canAttackDomain({kind:'ship',role:'submarine'},ship,'clans')).toBe(true);
 ship.order={kind:'attack',enemyId:'enemy-ship-2'};const r=prepareNavalCombat(m.navy,[{id:'enemy-ship-2',kind:'ship',navalRole:'warship',owner:'enemy',hp:100,position:{x:ship.position.x+100,y:ship.position.y}}],.1,undefined,1,1,()=>true,undefined,'crown');expect(r.shots[0].projectile).toMatchObject({damage:52,navalRole:'capital',targets:['sea','building']});
});
it('enemy capital uses the same tech/cost/duration through its normal fleet queue',()=>{
 let m=capitalFixture();m.factions!.enemy='crown';m.enemyProduction!.wood=1000;m.enemyProduction!.gold=1000;m.enemyProduction!.baseDevelopment={level:3,remainingSeconds:null};m.enemyPolicy!.research={attack:2,defense:2,job:null};
 const harbor=m.navy!.harbor!;m.combat.enemies=[...m.combat.enemies,...['drydock','navalAcademy'].map((kind,i)=>({id:`enemy-${kind}`,kind:'building' as const,buildingType:kind as 'drydock'|'navalAcademy',owner:'enemy' as const,hp:180,position:{x:1700+i*96,y:640},footprint:{x:1664+i*96,y:608,width:64,height:64},construction:{remainingSeconds:0,builderId:null}})),{id:'enemy-harbor',kind:'building',buildingType:'harbor',owner:'enemy',hp:160,footprint:harbor.footprint,position:{x:harbor.footprint.x+32,y:harbor.footprint.y+32},construction:{remainingSeconds:0,builderId:null}}];
 m.enemyNaval!.production.nextUnitNumber=2;m.combat.enemies.push({id:'enemy-ship-1',kind:'ship',owner:'enemy',hp:90,position:{x:1024,y:1024},order:{kind:'idle'}});
 m.combat.enemies.push(...Array.from({length:8},(_,i)=>({id:`enemy-farm-${i+1}`,kind:'building' as const,buildingType:'farm' as const,owner:'enemy' as const,hp:80,position:{x:1700,y:800+i*96},footprint:{x:1664,y:768+i*96,width:64,height:64},construction:{remainingSeconds:0,builderId:null}})));
 m=updateEnemyNaval(m,.1);expect(m.enemyNaval!.production.queue?.[0]).toMatchObject({kind:'capital',durationSeconds:45,cost:{wood:200,gold:160}});expect(m.enemyProduction!.wood).toBe(800);m=updateEnemyNaval(m,45);expect(m.combat.enemies.some(e=>e.kind==='ship'&&e.navalRole==='capital')).toBe(true);
});

import {campaignPhaseMet} from './campaignPhases';
it('unarmed support cannot satisfy armed naval objectives or block combat-fleet victory',()=>{
 const m=capitalFixture(),point={x:1024,y:1024};m.combat.enemies=[];m.navy!.ships=['tender','survey','transport'].map((role,i)=>({id:`ship-${i+1}`,kind:'ship',role:role as 'tender'|'survey'|'transport',owner:'player',hp:100,selected:false,position:point,target:point,order:{kind:'idle'}}));
 const goal={goal:'sea-position' as const,points:[point],count:1,text:'Armed ships'};expect(campaignPhaseMet(m,goal)).toBe(false);m.navy!.ships.push({...m.navy!.ships[0],id:'ship-4',role:'capital'});expect(campaignPhaseMet(m,goal)).toBe(true);
 m.combat.enemies=[{id:'support',kind:'ship',navalRole:'tender',hp:100,position:point}];expect(campaignPhaseMet(m,{goal:'enemy-fleet',text:'Combat fleet'})).toBe(true);
});

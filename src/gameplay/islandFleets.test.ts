import {saveConfig} from '../config/save';
import {maps,mapResourceTotals} from '../config/maps';
import {it,expect} from 'vitest';
import {unitAttacks} from '../presentation/unitAttacks';
import {createMatch} from './match';
import {islandMapIds} from '../config/islandMaps';
import {factionsForPlayer,factions,factionIds} from '../config/factions';
import {decodeSave,encodeSave} from './save';
import {islandNavalPlan} from './islandNavalPlan';
import {domainBodyFits,planDomainRoute} from './terrainNavigation';
import {findRoute} from './navigation';
import {resourceNodes} from './gathering';
import {bodyFits} from './map';
it.each(islandMapIds)('%s starts, resources, disconnected islands, naval plan and strict initial Save',id=>{
 const m=createMatch('skirmish','normal',factionsForPlayer('crown'),id);const plan=islandNavalPlan(m);
 expect(m.map.width).toBe(maps[id].world!.width);expect(m.map.height).toBe(maps[id].world!.height);expect(m.fog!.teams.player.visible).toHaveLength(m.map.width*m.map.height/(32*32));const totals=mapResourceTotals(id,'trees','expanded',m.map.design);for(const resource of ['wood','gold'])expect(resourceNodes(m.gathering).filter(n=>n.resource===resource).reduce((n,r)=>n+r.remaining,0)).toBe(totals[resource as 'wood'|'gold']);

 expect(domainBodyFits(m.map,'water',plan.waterStart,16)).toBe(true);
 expect(domainBodyFits(m.map,'water',plan.waterGoal,16)).toBe(true);
 expect(planDomainRoute(m.map,'water',plan.waterStart,plan.waterGoal,16).status).not.toBe('blocked');
 expect(findRoute(m.map,m.gathering.base,m.combat.enemies.find(e=>e.kind==='base')!.position).ok).toBe(false);
 const decoded=decodeSave(encodeSave(m,{camera:{x:0,y:0},building:null}));expect(decoded.ok,JSON.stringify(decoded)).toBe(true);
},60000);

it.each(islandMapIds.flatMap(map=>factionIds.map(enemy=>({map,enemy}))))('$map / $enemy paid AI builds fleet and lands',async({map,enemy})=>{
 const {updateMatch}=await import('./match');
 let m=createMatch('skirmish','normal',{player:'crown',enemy},map);const phases=new Set<string>(),ships=new Set<string>();
 for(let i=0;i<1440&&m.outcome==='playing';i++){
  m=updateMatch(m,.5);phases.add(m.enemyNaval!.phase);for(const e of m.combat.enemies)if(e.kind==='ship')ships.add(e.navalRole??'transport');
  if(i%120===0){let encoded:string;try{encoded=encodeSave(m,{camera:{x:0,y:0},building:null});}catch(e){console.log('BAD',m.waves.elapsedSeconds,m.combat.enemies.filter(e=>e.production));throw e;}const load=decodeSave(encoded);expect(load.ok,JSON.stringify({time:m.waves.elapsedSeconds,load})).toBe(true);}
 }
 const summary={time:m.waves.elapsedSeconds,phases:[...phases],ships:[...ships],outcome:m.outcome,naval:m.enemyNaval,enemies:m.combat.enemies.map(e=>({id:e.id,type:e.buildingType??e.navalRole??e.role,hp:e.hp,pos:e.position,work:e.work,order:e.order})),bank:m.enemyProduction};

 expect([...phases],JSON.stringify(summary)).toContain('landed');expect(ships.has('warship')).toBe(true);expect([...ships],JSON.stringify(summary)).toContain(fleetShips.find(r=>navalRoleAvailable(enemy,r)));expect(m.combat.baseHP,JSON.stringify(summary)).toBeLessThan(factions.crown.buildings.base.hp);expect(m.enemyProduction!.spent!.wood).toBeGreaterThan(100);
},180000);

import {fleetBuildings,fleetShips,marineRoles,fleetResearch,fleetStats} from '../config/islandFleets';
import {roleResearchConfig} from '../config/roleResearch';
import {beginPlacement,placeBuilding,type PlacementState} from './placement';
import {technologyFor} from './productionPrerequisites';
import {updateMatch,type MatchState} from './match';
import {matchFog,visionObservers} from './matchFog';
import {trainExtraProducer,updateExtraProducers} from './extraProducers';
import {placeHarbor,harborPlacementError,trainShip,canTrainShip,updateNavy,commandShips,type Ship} from './navy';
import {navalRoleAvailable,type ShipRole} from '../config/navy';
import {startResearch,updateResearch,canResearch,createResearch} from './research';
import {prepareNavalCombat} from './navalCombat';
import {serviceFleet,fleetVision,serviceEnemyFleet} from './fleetService';
import {coastalFootprint} from './terrainNavigation';
import {requestTransport,updateTransportTransfers} from './autoTransport';
import {loadTransport,unloadTransport,transportLandingError} from './transport';
import {canAttackDomain} from './domains';
import type {FactionId} from '../config/factions';
const view={camera:{x:0,y:0},building:null};
function saveRoundtrip(m:MatchState){const loaded=decodeSave(encodeSave({...m,fog:matchFog(m)},view));expect(loaded.ok,JSON.stringify(loaded.ok?{}:loaded)).toBe(true);return loaded;}
// Funded component fixture, ordinary placement/building/queue rules. AI probes above use untouched starts.
function buildFleet(faction:FactionId):MatchState{
 let m=createMatch('skirmish','normal',factionsForPlayer(faction),'twinwake');m.gathering.wood=1000;m.gathering.goldBalance=1000;m.fog=undefined;
 m.gathering.units=m.gathering.units.map((u,i)=>({...u,selected:i===0}));
 for(const [i,kind]of (['barracks','forge',...fleetBuildings,'farm'] as const).entries()){
  m.fog=undefined;const site=kind==='farm'?{x:288,y:416}:{x:288+(i%3)*128,y:544+Math.floor(i/3)*128},wood=m.gathering.wood,gold=m.gathering.goldBalance!;
  const r=placeBuilding(beginPlacement(m.placement,kind),site,wood,[],{technology:technologyFor(m,'player'),map:m.map,gathering:m.gathering,enemies:m.combat.enemies});
  expect(r.gathering,kind).toBeTruthy();m={...m,placement:r.placement,map:r.map!,gathering:r.gathering!};expect(m.gathering.wood).toBe(wood-factions[faction].buildings[kind].cost.wood);expect(m.gathering.goldBalance).toBe(gold-factions[faction].buildings[kind].cost.gold);
  for(let t=0;t<160;t++){m=updateMatch(m,.25);if(technologyFor(m,'player').buildings.includes(kind))break;}expect(technologyFor(m,'player').buildings,kind).toContain(kind);
 }
 m.fog=undefined;m.gathering.units=m.gathering.units.map((u,i)=>({...u,selected:i===0}));m.placement=beginPlacement(m.placement,'harbor');
 let site;for(let y=96;y<1024&&!site;y+=32)for(let x=64;x<864;x+=32){if(coastalFootprint(m.map,{x,y,width:64,height:64})&&!harborPlacementError(m,{x,y})){site={x,y};break;}}
 expect(site).toBeTruthy();m=placeHarbor(m,site!);expect(m.navy?.harbor).toBeTruthy();for(let t=0;t<200&&m.navy!.harbor!.construction.remainingSeconds>0;t++)m=updateMatch(m,.25);expect(m.navy!.harbor!.construction.remainingSeconds).toBe(0);return m;
}
it.each(factionIds)('%s builds four buildings and produces its additional infantry and ship through paid queues',faction=>{
 let m=buildFleet(faction);const role=marineRoles.find(r=>factions[faction].roster.includes(r))!,ship=fleetShips.find(r=>navalRoleAvailable(faction,r))!,producer=m.placement.producers!.find(p=>p.kind==='marineBarracks')!;
 const bank=m.gathering.wood;m=trainExtraProducer(m,producer.id,role);expect(m.gathering.wood).toBe(bank-factions[faction].units[role].cost.wood);saveRoundtrip(m);
 for(let t=0;t<80&&!m.gathering.units.some(u=>u.kind==='soldier'&&u.archetype===role);t++)m=updateMatch(m,.25);
 expect(m.gathering.units.some(u=>u.kind==='soldier'&&u.archetype===role&&u.faction===faction)).toBe(true);
 for(const other of fleetShips)expect(canTrainShip(m,other),other).toBe(other===ship);
 m=trainShip(m,ship);expect(m.navy!.production.queue?.[0].kind).toBe(ship);saveRoundtrip(m);
 for(let t=0;t<160&&!m.navy!.ships.length;t++)m=updateMatch(m,.25);expect(m.navy!.ships[0]?.role).toBe(ship);saveRoundtrip(m);
 const tower=visionObservers(m).find(o=>o.id===m.placement.producers!.find(b=>b.kind==='signalTower')!.id)!;expect(tower.radius).toBe(512);expect(tower.detectorRadius).toBe(256);
},60000);
it('six paid technologies complete, exclude competing hulls and stop when their producer is destroyed',()=>{
 let m=buildFleet('crown');for(const kind of fleetResearch){const g={...m.gathering,wood:1000,goldBalance:1000},r=createResearch();expect(canResearch(g,r,m.placement,kind)).toBe(true);const started=startResearch(g,r,m.placement,kind);expect(started.gathering.wood).toBe(1000-roleResearchConfig[kind].cost.wood);const finished=updateResearch(started.research,m.placement,24);expect(finished[kind]).toBe(1);saveRoundtrip({...m,gathering:started.gathering,research:finished});
 const missing={...m.placement,producers:m.placement.producers!.filter(p=>p.kind!==roleResearchConfig[kind].buildings[0])};expect(canResearch(g,r,missing,kind)).toBe(false);expect(updateResearch(started.research,missing,24).job).toBeNull();}
 const r=startResearch(m.gathering,createResearch(),m.placement,'lightHulls').research;expect(canResearch(m.gathering,r,m.placement,'armoredHulls')).toBe(false);
 expect(fleetStats(factions.dwarves.naval.units.mortarShip,{lightHulls:1,coastalGunnery:1})).toMatchObject({speed:60,damageByDomain:{building:2.8125}});
 expect(fleetVision('elves','survey',{navalOptics:1})).toEqual({radius:608,detector:224});expect(fleetVision('elves','warship',{navalOptics:1,tidewatch:1}).radius).toBe(384);expect(fleetVision('crown','warship',{navalOptics:1}).radius).toBe(416);
},60000);
it.each(fleetShips)('%s projectile masks preserve sea/land/air/building rules',role=>{
 const f=factionIds.find(id=>navalRoleAvailable(id,role))!,cfg=factions[f].naval.units[role];
 for(const domain of ['sea','air','land','building'] as const){const enemy={id:'target',kind:domain==='sea'?'ship' as const:domain==='building'?'building' as const:'unit' as const,...(domain==='air'?{role:'air' as const}:{}),...(domain==='building'?{footprint:{x:144,y:80,width:32,height:32}}:{}),position:{x:160,y:96},hp:100};const ship:Ship={id:'ship-1',kind:'ship',role,owner:'player',hp:cfg.hp,selected:true,position:{x:96,y:96},target:{x:96,y:96},order:{kind:'attack',enemyId:'target'}};
 const result=prepareNavalCombat({harbor:null,ships:[ship],production:{remainingSeconds:null,nextUnitNumber:2}},[enemy],.1,undefined,1,1,()=>true,factions[f].naval.units.warship,f);expect(result.shots.length>0,domain).toBe(cfg.targets.includes(domain));if(result.shots[0])expect(result.shots[0].projectile.navalRole).toBe(role);
 }
});
it('drydock/tender repair is paid, idle-only and crane improves rate, with enemy parity',()=>{
 const m=buildFleet('crown'),dock=m.placement.producers!.find(p=>p.kind==='drydock')!;
 const ship:Ship={id:'ship-1',kind:'ship',role:'warship',owner:'player',hp:40,selected:false,position:{x:dock.footprint.x+80,y:dock.footprint.y},target:{x:dock.footprint.x+80,y:dock.footprint.y},order:{kind:'idle'}};m.navy!.ships=[ship];
 const basic=serviceFleet(m,1);expect(basic.navy!.ships[0].hp).toBe(46);expect(basic.gathering.wood).toBeCloseTo(m.gathering.wood-1.5);
 expect(serviceFleet({...m,research:{...m.research!,repairCrane:1}},1).navy!.ships[0].hp).toBe(52);
 expect(serviceFleet({...m,navy:{...m.navy!,ships:[{...ship,order:{kind:'move'}}]}},1).navy!.ships[0].hp).toBe(40);
 const offshore={...m,placement:{...m.placement,producers:[]},navy:{...m.navy!,ships:[ship,{...ship,id:'ship-2',role:'tender' as const,hp:100}]}};expect(serviceFleet(offshore,1).navy!.ships[0].hp).toBe(44);expect(serviceFleet({...offshore,gathering:{...m.gathering,wood:0}},1).navy!.ships[0].hp).toBe(40);
 const enemy={...m,factions:{player:'crown' as const,enemy:'crown' as const},combat:{...m.combat,enemies:[{id:'enemy-ship-1',kind:'ship' as const,navalRole:'warship' as const,hp:40,position:ship.position,order:{kind:'idle' as const}},{id:'enemy-producer-1',kind:'building' as const,buildingType:'drydock' as const,hp:240,position:ship.position,footprint:dock.footprint,construction:{remainingSeconds:0,builderId:null}}]}};
 expect(serviceEnemyFleet(enemy,1).combat.enemies[0].hp).toBe(46);
},60000);
it.each(islandMapIds)('%s transports a ground troop between actual shores and rejects open water landings',id=>{
 let m=createMatch('skirmish','normal',factionsForPlayer('crown'),id);m.fog=undefined;const p=islandNavalPlan(m),unit={...m.gathering.units[0],position:p.landing,target:p.landing,selected:true};m.gathering.units=[unit];
 const ship:Ship={id:'ship-1',kind:'ship',role:'transport',owner:'player',hp:90,position:p.waterGoal,target:p.waterGoal,selected:true,passengers:[],order:{kind:'idle'}};m.navy={harbor:null,ships:[ship],production:{remainingSeconds:null,nextUnitNumber:2}};
 m=loadTransport(m,'ship-1');expect(m.navy!.ships[0].passengers).toHaveLength(1);m.navy=commandShips(m,p.waterStart);for(let i=0;i<1000&&m.navy!.ships[0].order.kind==='move';i++)m=updateNavy(m,.1);expect(m.navy!.ships[0].position).toEqual(p.waterStart);
 expect(transportLandingError(m,'ship-1',p.waterStart)).toContain('dry');expect(transportLandingError(m,'ship-1',{x:0,y:0})).toContain('closer');expect(unloadTransport(m,'ship-1',p.waterStart)).toBe(m);m=unloadTransport(m,'ship-1',p.loading);expect(m.navy!.ships[0].passengers).toHaveLength(0);expect(m.gathering.units).toHaveLength(1);expect(bodyFits(m.map,m.gathering.units[0].position,12)).toBe(true);
});
it('Save77 migrates, while legacy documents cannot smuggle new content',()=>{
 const old=JSON.parse(encodeSave(createMatch('skirmish'),view));old.configVersion='tribute-config-77';expect(decodeSave(JSON.stringify(old)).ok).toBe(true);old.state.research.lightHulls=1;expect(decodeSave(JSON.stringify(old)).ok).toBe(false);
 const island=JSON.parse(encodeSave(createMatch('skirmish','normal',factionsForPlayer('crown'),'twinwake'),view));island.configVersion='tribute-config-77';expect(decodeSave(JSON.stringify(island)).ok).toBe(false);
});

import {matchPlayers} from './players';
it('Four Crowns starts four owners on separate islands with independent paid economies and Save78',()=>{
 let m=createMatch('skirmish','normal',undefined,'crownsea',1,'balanced',matchPlayers(undefined,undefined,4));expect(m.multiplePlayers!.ai).toHaveLength(3);
 m=updateMatch(m,20);expect(m.multiplePlayers!.ai.every(b=>b.state.enemyProduction!.spent!.wood>0)).toBe(true);saveRoundtrip(m);
 const fleets=new Map<string,Set<string>>(),landed=new Set<string>();for(let i=0;i<1400&&m.outcome==='playing';i++){m=updateMatch(m,.5);for(const bot of m.multiplePlayers!.ai){const roles=fleets.get(bot.id)??new Set<string>();for(const e of bot.state.combat.enemies)if(e.kind==='ship')roles.add(e.navalRole??'transport');fleets.set(bot.id,roles);if(bot.state.enemyNaval?.phase==='landed')landed.add(bot.id);}if(i%120===0)saveRoundtrip(m);if(landed.size&&[...fleets.values()].every(roles=>roles.has('warship')&&roles.has('transport')))break;}expect([...fleets],JSON.stringify([...fleets].map(([id,roles])=>({id,roles:[...roles]})))).toHaveLength(3);for(const roles of fleets.values()){expect([...roles]).toContain('transport');expect([...roles]).toContain('warship');}expect(landed.size).toBeGreaterThan(0);saveRoundtrip(m);
 const old=createMatch('skirmish','normal',undefined,'lakehold',1,'balanced',matchPlayers(undefined,undefined,4));const doc=JSON.parse(encodeSave(old,view));doc.configVersion='tribute-config-77';doc.human=doc.human.replaceAll(saveConfig.configVersion,'tribute-config-77');for(const bot of doc.ai)bot.document=bot.document.replaceAll(saveConfig.configVersion,'tribute-config-77');expect(decodeSave(JSON.stringify(doc)).ok).toBe(true);
},180000);
import {updateCombat} from './combat';
it('Marine Drill changes actual land damage and armored hulls reduce actual incoming projectiles',()=>{
 const m=createMatch('skirmish');m.fog=undefined;const marine={id:'unit-4',kind:'soldier' as const,archetype:'marine' as const,faction:'crown' as const,hp:95,cargo:0 as const,selected:true,position:{x:100,y:100},target:{x:100,y:100},order:{kind:'attack' as const,enemyId:'enemy-1'}};
 const gathering={...m.gathering,units:[marine]},combat={...m.combat,enemies:[{id:'enemy-1',kind:'unit' as const,hp:100,position:{x:120,y:100},order:{kind:'idle' as const}}]};
 const hit=(drill:number)=>updateCombat(gathering,combat,.1,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,'clans',undefined,undefined,{...createResearch(),marineDrill:drill}).combat.enemies[0].hp;
 expect((100-hit(1))/(100-hit(0))).toBeCloseTo(1.25);
 const ship:Ship={id:'ship-1',kind:'ship',role:'warship',owner:'player',hp:90,selected:false,position:{x:100,y:100},target:{x:100,y:100},order:{kind:'idle'}};
 const shot={id:'enemy-arrow-1',owner:'enemy' as const,shooterId:'enemy-1',targetId:'ship-1',position:{x:100,y:100},destination:{x:100,y:100},speed:280,damage:20,remainingLife:1,hitRadius:20,targets:['sea' as const]};
 const damage=(armor:number)=>90-updateCombat({...gathering,units:[]},{...combat,enemies:[],projectiles:[shot]},.1,undefined,undefined,undefined,undefined,undefined,undefined,{harbor:null,ships:[ship],production:{remainingSeconds:null,nextUnitNumber:2}},undefined,'clans',undefined,undefined,{...createResearch(),armoredHulls:armor}).navy!.ships[0].hp;
 expect(damage(0)).toBe(20);expect(damage(1)).toBe(16);
});

import {updateEnemyNaval} from './enemyNaval';
import {replaceObstacles} from './map';
it('island transports choose another beach when landing is occupied and replace a sunk carrier through a paid queue',()=>{
 let m=createMatch('skirmish','normal',factionsForPlayer('crown'),'twinwake');m.fog=undefined;const plan=islandNavalPlan(m);
 m.enemyNaval={production:{remainingSeconds:null,nextUnitNumber:2},phase:'sailing',passengers:[1,2].map(n=>({id:`enemy-produced-${n}`,kind:'unit',role:'soldier',owner:'enemy',hp:48,navalLanding:true,position:plan.loading,order:{kind:'idle'}}))};
 const carrier={id:'enemy-ship-1',kind:'ship' as const,owner:'enemy' as const,hp:100,position:plan.waterGoal,order:{kind:'muster' as const,destination:plan.waterGoal}};
 m.combat.enemies.push(carrier);m.map=replaceObstacles(m.map,[...m.map.obstacles,{x:plan.landing.x-48,y:plan.landing.y-48,width:96,height:96}]);
 const diverted=updateEnemyNaval(m,.1),ship=diverted.combat.enemies.find(e=>e.id===carrier.id)!;expect(ship.order?.kind).toBe('muster');expect(ship.order).not.toEqual(carrier.order);expect(diverted.enemyNaval!.passengers).toHaveLength(2);
 m={...m,map:createMatch('skirmish','normal',factionsForPlayer('crown'),'twinwake').map};m.combat.enemies=m.combat.enemies.filter(e=>e.id!==carrier.id);m.combat.enemies.push({id:'enemy-harbor',kind:'building',buildingType:'harbor',owner:'enemy',hp:160,position:{x:plan.harbor.x+32,y:plan.harbor.y+32},footprint:plan.harbor,construction:{remainingSeconds:0,builderId:null}});m.enemyNaval={...m.enemyNaval!,passengers:[],phase:'finished'};const bank=m.enemyProduction!.wood;
 const replaced=updateEnemyNaval(m,.1);expect(replaced.enemyNaval!.production.queue?.[0].kind).toBe('transport');expect(replaced.enemyProduction!.wood).toBe(bank-factions.clans.naval.units.transport.cost.wood);
});
it('armored hulls apply once in multi-player shared damage resolution',()=>{
 const original=createMatch('skirmish','normal',undefined,'crownsea',1,'balanced',matchPlayers(undefined,undefined,4));
 const damage=(armoredHulls:number)=>{const m=structuredClone(original),pos={x:1400,y:1400};m.research={...createResearch(),armoredHulls};m.navy={harbor:null,production:{remainingSeconds:null,nextUnitNumber:2},ships:[{id:'ship-1',kind:'ship',role:'warship',owner:'player',hp:90,selected:false,position:pos,target:pos,order:{kind:'idle'}}]};
 const bot=m.multiplePlayers!.ai[0];bot.state.combat.enemies.push({id:'enemy-ship-1',kind:'ship',navalRole:'warship',owner:'enemy',hp:90,position:{x:1464,y:1400},order:{kind:'idle'},attackCooldown:10});bot.state.combat.projectiles=[{id:'enemy-arrow-1',owner:'enemy',shooterId:'enemy-ship-1',targetId:'ship-1',position:pos,destination:pos,speed:280,damage:20,remainingLife:1,hitRadius:20,targets:['sea']}];const result=updateMatch(m,.05);return 90-result.navy!.ships[0].hp;};
 expect(damage(0)).toBe(20);expect(damage(1)).toBe(16);
});
it('coastal gunnery stacks with existing precise bombard shells and active shots survive Save78',()=>{
 const m=createMatch('skirmish','normal',factionsForPlayer('dwarves'),'twinwake'),pos=islandNavalPlan(m).waterStart,cfg=factions.dwarves.naval.units.bombard;
 m.research={...createResearch(),preciseShells:1,coastalGunnery:1};
 const target={id:'historical-building',kind:'building' as const,position:{x:pos.x+100,y:pos.y},footprint:{x:pos.x+80,y:pos.y-16,width:32,height:32},hp:100};
 m.navy={harbor:null,production:{remainingSeconds:null,nextUnitNumber:2},ships:[{id:'ship-1',kind:'ship',role:'bombard',owner:'player',hp:cfg.hp,selected:false,position:pos,target:pos,order:{kind:'attack',enemyId:target.id}}]};
 const result=prepareNavalCombat(m.navy,[target],.1,undefined,1,1,()=>true,factions.dwarves.naval.units.warship,'dwarves',m.research);
 expect(result.shots[0]?.projectile.damageByDomain?.building).toBe(3.75);expect(unitAttacks(m,m.navy.ships[0]).find(s=>s.includes('(buildings)'))).toContain(`${cfg.damage*3.75} damage/hit`);m.combat.projectiles=result.shots.map(s=>s.projectile);m.combat.nextProjectileNumber=2;m.navy.ships[0].order={kind:'idle'};saveRoundtrip(m);
});
it('a lost loading soldier releases the survivor so the AI can assemble another landing party',()=>{
 const m=createMatch('skirmish','normal',factionsForPlayer('crown'),'twinwake'),p=islandNavalPlan(m);m.fog=undefined;
 m.enemyNaval={production:{remainingSeconds:null,nextUnitNumber:2},phase:'loading',passengers:[]};
 m.combat.enemies.push({id:'enemy-ship-1',kind:'ship',hp:90,position:p.waterStart,order:{kind:'muster',destination:p.waterStart}},{id:'enemy-produced-1',kind:'unit',hp:48,role:'soldier',navalLanding:true,position:p.loading,order:{kind:'muster',destination:p.loading}});
 const next=updateEnemyNaval(m,.1);expect(next.enemyNaval?.phase).toBe('waiting');expect(next.combat.enemies.find(e=>e.id==='enemy-produced-1')?.navalLanding).toBeUndefined();
});

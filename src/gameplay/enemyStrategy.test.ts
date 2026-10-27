import {expect,it} from 'vitest';
import {createMatch,updateMatch,type MatchState} from './match';
import {prepareEnemyStrategy,strategyFor,strategicExpansionSites} from './enemyStrategy';
import {enemyPopulation,prepareEnemyConstruction} from './enemyConstruction';
import {prepareEnemyExpansion} from './enemyExpansion';
import {updateEnemyProduction} from './enemyProduction';
import {technologyFor} from './productionPrerequisites';
import {cleanDestroyed} from './destruction';
import {decodeSave,encodeSave} from './save';
import {matchPlayers} from './players';
import {projectMultiplePlayers} from './multiplePlayers';

function ready():MatchState {
 let m=prepareEnemyConstruction(createMatch('skirmish','normal'));
 m.fog!.teams.enemy.visible.fill(true);m.fog!.teams.enemy.explored.fill(true);
 const barracks=m.combat.enemies.find(e=>e.buildingType==='barracks')!;
 barracks.construction={remainingSeconds:0,builderId:null};
 for(const e of m.combat.enemies)if(e.work)e.work.order={kind:'idle'};
 for(let i=0;i<6;i++)m.combat.enemies.push({id:`enemy-produced-${i+1}`,kind:'unit',owner:'enemy',role:i%2?'archer':'soldier',hp:48,position:{x:1420+i*30,y:1700},order:{kind:'idle'}});
 m.enemyProduction!.production.nextUnitNumber=7;m.enemyProduction!.acceptedJobs=6;
 m.enemyProduction!.wood=500;m.enemyProduction!.gold=300;
 m.enemyPolicy!.research={attack:1,defense:1,job:null};
 // Explicit paid-component fixture. Natural economy/ledger is verified separately below.
 m.waves.elapsedSeconds=240;
 m.combat.enemies.push({...m.combat.enemies.find(e=>e.kind==='worker')!,id:'enemy-worker-3',position:{x:1600,y:1500}});
 m.enemyRecovery!.production.nextUnitNumber=4;
 for(let i=1;i<=2;i++){const footprint={x:1800,y:1300+i*96,width:64,height:64};m.combat.enemies.push({id:`enemy-farm-${i}`,kind:'building',buildingType:'farm',owner:'enemy',hp:100,position:{x:1832,y:1332+i*96},footprint,construction:{remainingSeconds:0,builderId:null}});m.map.obstacles.push(footprint);}
 for(let i=4;i<=6;i++)m.combat.enemies.push({...m.combat.enemies.find(e=>e.kind==='worker')!,id:`enemy-worker-${i}`,position:{x:1600+(i-3)*32,y:1500}});
 m.enemyRecovery!.production.nextUnitNumber=7;
 return m;
}
it('develops an unattacked real skirmish economy and army, then replaces losses from delivered resources',()=>{
 let m=createMatch('skirmish','normal');
 const snapshots=[];
 for(let t=0;t<240;t++){
  m=updateMatch(m,1);
  if(t%60===59)snapshots.push({time:t+1,workers:m.combat.enemies.filter(e=>e.kind==='worker').length,jobs:m.enemyProduction!.acceptedJobs,buildings:m.combat.enemies.filter(e=>e.footprint).map(e=>e.buildingType??e.kind),bank:[m.enemyProduction!.wood,m.enemyProduction!.gold],priority:strategyFor(m)?.priority});
 }
 expect(snapshots.at(-1)!.jobs).toBeGreaterThan(snapshots[0].jobs);
 expect(m.outcome).toBe('playing');
 expect(m.enemyProduction!.acceptedJobs).toBeGreaterThan(6);
 expect(m.combat.enemies.filter(e=>e.kind==='worker').length).toBeGreaterThan(2);
 expect(m.combat.enemies.some(e=>e.buildingType==='forge'&&e.construction?.remainingSeconds===0)).toBe(true);
 expect(m.combat.enemies.some(e=>e.buildingType==='outpost'&&e.construction?.remainingSeconds===0)).toBe(true);
 const before=m.enemyProduction!.acceptedJobs;
 for(const e of m.combat.enemies)if(!e.footprint&&e.kind!=='worker')e.hp=0;
 m=cleanDestroyed(m);
 for(let t=0;t<60;t++)m=updateMatch(m,1);
 expect(m.enemyProduction!.acceptedJobs).toBeGreaterThan(before);
 const loaded=decodeSave(encodeSave(m,{camera:{x:0,y:0},building:null}));
 expect(loaded.ok,loaded.ok?'':loaded.error).toBe(true);
 expect(m.enemyProduction!.wood).toBeGreaterThanOrEqual(0);expect(m.enemyProduction!.gold).toBeGreaterThanOrEqual(0);
},60000);
it('selects spaced resource bases, pays once, and ignores hidden enemy changes',()=>{
 let a=ready();a.enemyKnowledge!.nodes=[{...a.gathering.gold!,remaining:3000}];
 // Use the authored expansion mine actually present in this map.
 a.enemyKnowledge!.nodes=[...a.gathering.extraNodes!.filter(n=>n.resource==='gold')];
 a=prepareEnemyStrategy(a);expect(strategyFor(a)!.expand).toBe(true);
 const sites=strategicExpansionSites(a);expect(sites.length).toBeGreaterThan(0);
 const b=structuredClone(a);b.fog!.teams.enemy.visible.fill(false);const hidden=structuredClone(b);
 b.gathering.units.push({id:'hidden',kind:'soldier',hp:9999,owner:'player',position:{x:100,y:100},target:{x:100,y:100},order:{kind:'idle'},selected:false,cargo:0});
 hidden.map.obstacles.push({x:sites[0].x,y:sites[0].y,width:96,height:96});hidden.gathering.gold!.remaining=0;
 expect(strategicExpansionSites(b)).toEqual(strategicExpansionSites(hidden));
 const started=prepareEnemyExpansion(a),site=started.combat.enemies.find(e=>e.buildingType==='outpost')!;
 expect(site).toBeDefined();expect(started.enemyProduction!.wood).toBe(a.enemyProduction!.wood-80);
 expect(prepareEnemyExpansion(started).enemyProduction!.wood).toBe(started.enemyProduction!.wood);
 expect(Math.hypot(site.position.x-a.combat.enemies[0].position.x,site.position.y-a.combat.enemies[0].position.y)).toBeGreaterThanOrEqual(320);
});
it('does not reserve expansion forever on an obstructed map, and refuses nearby visible threats',()=>{
 const a=ready();a.enemyKnowledge!.nodes=[...a.gathering.extraNodes!.filter(n=>n.resource==='gold')];
 const sites=strategicExpansionSites(a);expect(sites.length).toBeGreaterThan(0);
 a.map.obstacles=[...a.map.obstacles,...sites.map(s=>({...s,width:96,height:96}))];
 const blocked=prepareEnemyStrategy(a);expect(strategyFor(blocked)!.expand).toBe(false);expect(strategyFor(blocked)!.priority).not.toBe('expansion');
 const b=ready();b.enemyKnowledge!.nodes=[...b.gathering.extraNodes!.filter(n=>n.resource==='gold')];
 const base=b.combat.enemies.find(e=>e.kind==='base')!;
 b.gathering.units.push({id:'threat',kind:'soldier',hp:60,owner:'player',position:{x:base.position.x-128,y:base.position.y},target:base.position,order:{kind:'idle'},selected:false,cargo:0});
 const threatened=prepareEnemyStrategy(b);expect(strategyFor(threatened)!.threatened).toBe(true);expect(strategyFor(threatened)!.expand).toBe(false);
});
it('keeps an infrastructure budget while training from surplus, and honors actual supply',()=>{
 let m=ready();m.combat.enemies=m.combat.enemies.filter(e=>e.buildingType!=='farm');m=prepareEnemyStrategy(m);const plan=strategyFor(m)!;expect(plan.priority).toBe('supply');
 const bank=m.enemyProduction!,result=updateEnemyProduction(bank,m.combat,m.gathering,m.map,0,m.factions!.enemy,{site:m.combat.enemies.find(e=>e.buildingType==='barracks'),population:enemyPopulation(m),technology:technologyFor(m,'enemy'),armyCap:plan.armyCap,reserve:plan.reserve});
 // Supply is initially full: growth must build supply before another paid unit can fit.
 expect(result.state.acceptedJobs).toBe(bank.acceptedJobs);
 m.combat.enemies=m.combat.enemies.filter(e=>e.id!=='enemy-produced-6');
 const trained=updateEnemyProduction(bank,m.combat,m.gathering,m.map,0,m.factions!.enemy,{site:m.combat.enemies.find(e=>e.buildingType==='barracks'),population:{cap:30,used:8,reserved:0},technology:technologyFor(m,'enemy'),armyCap:plan.armyCap,reserve:plan.reserve});
 expect(trained.state.acceptedJobs).toBeGreaterThan(bank.acceptedJobs);expect(trained.state.wood).toBeGreaterThanOrEqual(plan.reserve.wood);expect(trained.state.gold).toBeGreaterThanOrEqual(plan.reserve.gold);
});
it('caches decisions by gameplay time and gives harder AI faster decisions without income',()=>{
 const easy=ready();easy.difficulty='easy';const hard=structuredClone(easy);hard.difficulty='hard';
 const a=prepareEnemyStrategy(easy),b=prepareEnemyStrategy(hard);
 expect(strategyFor(a)!.nextDecisionSeconds).toBeGreaterThan(strategyFor(b)!.nextDecisionSeconds);
 expect(prepareEnemyStrategy(a)).toBe(a);expect(b.enemyProduction).toEqual(hard.enemyProduction);
 const paused={...b,paused:true};expect(updateMatch(paused,30)).toBe(paused);
});
it('four opponents keep independent bounded plans and paid construction with unique entities',()=>{
 let m=createMatch('skirmish','normal',undefined,'plains128',1,'balanced',matchPlayers(undefined,undefined,5));
 m=updateMatch(m,12);
 const bots=m.multiplePlayers!.ai;expect(bots).toHaveLength(4);
 expect(new Set(bots.map(b=>strategyFor(b.state))).size).toBe(4);
 for(const bot of bots){expect(bot.state.enemyProduction!.spent!.wood).toBeGreaterThan(0);expect(strategyFor(bot.state)!.armyCap).toBeLessThanOrEqual(32);expect(bot.state.combat.enemies.filter(e=>e.kind==='worker').length).toBeLessThanOrEqual(12);}
 const ids=projectMultiplePlayers(m).combat.enemies.map(e=>e.id);expect(new Set(ids).size).toBe(ids.length);
 const loaded=decodeSave(encodeSave(m,{camera:{x:0,y:0},building:null}));expect(loaded.ok,loaded.ok?'':loaded.error).toBe(true);
},30000);
it('backs off from unreachable building sites without charging, and releases the army budget',()=>{
 let m=ready();
 for(const [i,e]of m.combat.enemies.filter(e=>e.kind==='worker').entries())e.position={x:800+i*32,y:800};
 m.map.obstacles.push({x:760,y:760,width:300,height:16},{x:760,y:840,width:300,height:16},{x:760,y:760,width:16,height:96},{x:1040,y:760,width:16,height:96});
 m=prepareEnemyStrategy(m);const bank={wood:m.enemyProduction!.wood,gold:m.enemyProduction!.gold};
 expect(strategyFor(m)!.building).toBe('forge');
 const blocked=prepareEnemyConstruction(m);
 expect(strategyFor(blocked)!.priority).toBe('army');expect(strategyFor(blocked)!.reserve).toEqual({wood:0,gold:0});
 expect(blocked.enemyProduction!.wood).toBe(bank.wood);expect(blocked.enemyProduction!.gold).toBe(bank.gold);
 expect(blocked.combat.enemies.some(e=>e.buildingType==='forge')).toBe(false);
 const later=prepareEnemyStrategy({...blocked,waves:{...blocked.waves,elapsedSeconds:244}});
 expect(strategyFor(later)!.building).toBeUndefined();
 expect(strategyFor(later)!.blockedBuildingUntil!.forge).toBe(255);
});

import {createEnemyAI,updateEnemyAI} from './enemyAI';
import {enemyAIConfig} from '../config/enemyAI';
it('holds small groups after timeout, replenishes them and joins forces against observed strength',()=>{
 const map={width:1280,height:960,tileSize:32,revision:0,obstacles:[]};
 const enemies=Array.from({length:4},(_,i)=>({id:`enemy-produced-${i+1}`,kind:'unit' as const,owner:'enemy' as const,role:'soldier' as const,hp:48,position:{x:850+i*32,y:320},order:{kind:'idle' as const}}));
 const settings={...enemyAIConfig,reserveCount:0,groupSize:3,minimumAttackSize:3,firstAttackSeconds:0};
 let r=updateEnemyAI(createEnemyAI(),{baseHP:240,enemies:enemies.slice(0,2)},map,{x:100,y:100},60,[],settings);
 expect(r.state.groups[0].status).toBe('muster');expect(r.combat.enemies.every(e=>e.order?.kind==='muster')).toBe(true);
 r=updateEnemyAI(r.state,{...r.combat,enemies:[...r.combat.enemies,enemies[2]]},map,{x:100,y:100},1,[],settings);
 expect(r.state.groups[0].members).toHaveLength(3);
 // Two already waiting detachments should form one force, rather than attack separately.
 const state={...createEnemyAI(),groups:[{id:'enemy-group-1',status:'ready' as const,members:enemies.slice(0,2).map(e=>e.id),destinations:Object.fromEntries(enemies.slice(0,2).map(e=>[e.id,e.position])),startedAt:0},{id:'enemy-group-2',status:'ready' as const,members:enemies.slice(2).map(e=>e.id),destinations:Object.fromEntries(enemies.slice(2).map(e=>[e.id,e.position])),startedAt:0}],nextGroupNumber:3};
 const joined=updateEnemyAI(state,{baseHP:240,enemies},map,{x:100,y:100},1,[],{...settings,attackPower:70});
 expect(joined.state.groups).toHaveLength(1);expect(joined.state.groups[0].members).toHaveLength(4);
 expect(joined.state.groups[0].status).toBe('muster');
});
it('keeps a guard at home and another at a completed resource base',()=>{
 const m=ready(),footprint={x:1000,y:1000,width:96,height:96};
 m.combat.enemies.push({id:'enemy-outpost',kind:'building',buildingType:'outpost',owner:'enemy',hp:240,position:{x:1048,y:1048},footprint,construction:{remainingSeconds:0,builderId:null}});m.map.obstacles=m.combat.enemies.flatMap(e=>e.footprint?[e.footprint]:[]);
 const r=updateEnemyAI(createEnemyAI(),m.combat,m.map,{x:100,y:100},1,[],{...enemyAIConfig,reserveCount:2,guardExpansions:true});
 expect(r.state.reserve).toHaveLength(2);
 const guards=r.combat.enemies.filter(e=>r.state.reserve.includes(e.id));
 expect(guards.some(e=>e.order?.kind==='muster'&&e.order.destination.x===footprint.x-32)).toBe(true);
 expect(guards.some(e=>e.order?.kind==='muster'&&e.order.destination.x===m.combat.enemies.find(e=>e.kind==='base')!.footprint!.x-32)).toBe(true);
});
it('orders tech prerequisites and adds bounded production capacity when an employed economy supports it',()=>{
 let m=ready();
 const replan=()=>{delete m.enemyPolicy!.strategy;m=prepareEnemyStrategy(m);return strategyFor(m)!;};
 let n=0;
 const complete=(kind:'forge'|'academy'|'stable'|'aviary'|'siegeWorks')=>{const footprint={x:1120+n++*96,y:1280,width:64,height:64};m.combat.enemies.push({id:`enemy-${kind}`,kind:'building',buildingType:kind,owner:'enemy',hp:130,position:{x:footprint.x+32,y:footprint.y+32},footprint,construction:{remainingSeconds:0,builderId:null}});m.map.obstacles.push(footprint);};
 expect(replan().building).toBe('forge');complete('forge');expect(replan().building).toBe('academy');complete('academy');expect(replan().priority).toBe('baseUpgrade');
 m.enemyProduction!.baseDevelopment={level:2,remainingSeconds:null};
 expect(replan().building).toBe('stable');complete('stable');expect(replan().building).toBe('aviary');complete('aviary');expect(replan().building).toBe('siegeWorks');complete('siegeWorks');
 expect(replan().priority).toBe('attack');
 m.enemyPolicy!.research.job={kind:'attack',remainingSeconds:8};
 m.enemyProduction=updateEnemyProduction(m.enemyProduction!,m.combat,m.gathering,m.map,0,m.factions!.enemy,{site:m.combat.enemies.find(e=>e.buildingType==='barracks'),population:enemyPopulation(m),technology:technologyFor(m,'enemy'),armyCap:20}).state;
 expect(replan().building).toBe('barracks');
 const copy={...m.combat.enemies.find(e=>e.buildingType==='barracks')!,id:'enemy-producer-1'};m.combat.enemies.push(copy);
 expect(replan().building).toBeUndefined();
});
it('continues through the midgame without needing enemy attacks or unit losses',()=>{
 let m=createMatch('skirmish','normal'),at240=0;
 // Shared multiplayer combat scope supplies no attackable targets, keeping this
 // economy endurance fixture running after a passive human would have lost.
 for(let t=0;t<600;t++){
  m=updateMatch(m,1,{side:'enemy',targets:[]});
  if(t===239)at240=m.enemyProduction!.acceptedJobs;
 }
 expect(m.enemyProduction!.acceptedJobs).toBeGreaterThan(at240);
 expect(m.enemyProduction!.baseDevelopment?.level).toBeGreaterThanOrEqual(2);
 expect(m.combat.enemies.some(e=>e.buildingType==='stable'&&e.construction?.remainingSeconds===0)).toBe(true);
 expect(m.combat.enemies.filter(e=>e.kind==='worker')).toHaveLength(10);
 expect(m.enemyProduction!.wood).toBeGreaterThanOrEqual(0);expect(m.enemyProduction!.gold).toBeGreaterThanOrEqual(0);
 const loaded=decodeSave(encodeSave(m,{camera:{x:0,y:0},building:null}));expect(loaded.ok,loaded.ok?'':loaded.error).toBe(true);
},60000);

it('retains legacy policy when a save or component fixture has no worker recovery system',()=>{const m=createMatch('skirmish');delete m.enemyRecovery;expect(prepareEnemyStrategy(m)).toBe(m);expect(strategyFor(m)).toBeUndefined();});

it('does not duplicate a completed building while the cached investment plan is still active',()=>{
 let m=createMatch('skirmish','normal');m.enemyProduction!.wood=500;m.enemyProduction!.gold=300;m.fog!.teams.enemy.visible.fill(true);
 m=prepareEnemyConstruction(prepareEnemyStrategy(m));
 const bar=m.combat.enemies.find(e=>e.buildingType==='barracks')!;bar.construction={remainingSeconds:0,builderId:null};
 for(const e of m.combat.enemies)if(e.work)e.work.order={kind:'idle'};
 m.waves.elapsedSeconds=1;const wood=m.enemyProduction!.wood;
 const again=prepareEnemyConstruction(m);expect(again.combat.enemies.filter(e=>e.buildingType==='barracks')).toHaveLength(1);expect(again.enemyProduction!.wood).toBe(wood);
});

import {createEnemyNaval} from './enemyNaval';
it('develops technology while the existing naval transport limits ground troops to two seats',()=>{
 const m=ready();m.enemyNaval=createEnemyNaval();m.combat.enemies=m.combat.enemies.filter(e=>!e.role||['enemy-produced-1','enemy-produced-2'].includes(e.id));
 expect(strategyFor(prepareEnemyStrategy(m))!.building).toBe('forge');
});

it('scouts the authored expansion before its resources are known, but cannot pay for an empty visible site',()=>{
 let m=ready();m.enemyKnowledge!.nodes=[];m.fog!.teams.enemy.visible.fill(false);m=prepareEnemyStrategy(m);
 expect(strategyFor(m)!.expand).toBe(true);expect(strategyFor(m)!.priority).toBe('expansion');const bank=m.enemyProduction!.wood;
 m=prepareEnemyExpansion(m);expect(m.enemyRecovery!.expansionPlan?.scout).toBeDefined();expect(m.enemyProduction!.wood).toBe(bank);expect(m.combat.enemies.some(e=>e.buildingType==='outpost')).toBe(false);
 m.fog!.teams.enemy.visible.fill(true);m.waves.elapsedSeconds+=1;m=prepareEnemyExpansion(m);
 expect(m.enemyProduction!.wood).toBe(bank);expect(m.combat.enemies.some(e=>e.buildingType==='outpost')).toBe(false);
});

import {it,expect} from 'vitest';
import {createMatch} from './match';
import {prepareEnemyStrategy,strategyFor,strategicAISettings,strategicExpansionSites,deferEnemyInvestment} from './enemyStrategy';
import {prepareEnemyExpansion} from './enemyExpansion';
import {prepareEnemyRecon} from './enemyRecon';
import {enemyObjective} from './enemyObjectives';
import {enemyAttackDestination,updateEnemyExploration} from './enemyKnowledge';
import {createEnemyAI,updateEnemyAI} from './enemyAI';
import {enemyAIConfig} from '../config/enemyAI';
import {prepareScouting} from './scouting';

function fixture(openRoute=false){
 const m=createMatch('skirmish');m.waves.elapsedSeconds=100;
 if(openRoute)m.map={...m.map,obstacles:[]};
 const home=m.combat.enemies.find(e=>e.kind==='base')!.position;
 for(let i=1;i<=6;i++)m.combat.enemies.push({id:`enemy-produced-${i}`,kind:'unit',owner:'enemy',role:i===3?'archer':'soldier',hp:45,position:{x:home.x-100+i*32,y:home.y+160},order:{kind:'idle'}});
 m.enemyProduction!.acceptedJobs=6;m.enemyProduction!.production.nextUnitNumber=7;
 return prepareEnemyStrategy(m);
}
it('assigns one early paid combat scout, preserves two guards and caches its route between decisions',()=>{
 const m=fixture(true),plan=strategyFor(m)!;expect(plan.recon!.ids).toHaveLength(1);
 expect(plan.recon!.ids[0]).toBe('enemy-produced-3');
 const settings=strategicAISettings(m,{...enemyAIConfig,reserveCount:2});
 const r=updateEnemyAI(m.enemyAI!,m.combat,m.map,m.gathering.base,1,[],settings);
 expect(r.state.reserve).toHaveLength(2);expect(r.state.reserve).not.toContain(plan.recon!.ids[0]);
 expect(r.state.groups.flatMap(g=>g.members)).not.toContain(plan.recon!.ids[0]);
 expect(r.combat.enemies.find(e=>e.id===plan.recon!.ids[0])!.order).toEqual(m.combat.enemies.find(e=>e.id===plan.recon!.ids[0])!.order);
 expect(prepareEnemyStrategy(m)).toBe(m);
 const later=prepareEnemyStrategy({...m,waves:{...m.waves,elapsedSeconds:103}});
 expect(later.combat.enemies.find(e=>e.id===plan.recon!.ids[0])!.navigation).toBe(m.combat.enemies.find(e=>e.id===plan.recon!.ids[0])!.navigation);
});
it('ground reconnaissance ignores hidden threats and retreats from observed danger without losing its workers',()=>{
 const a=fixture(),id=strategyFor(a)!.recon!.ids[0],scout=a.combat.enemies.find(e=>e.id===id)!;
 scout.position={x:1000,y:1100};
 a.gathering.units.push({id:'threat',kind:'soldier',owner:'player',hp:60,cargo:0,selected:false,position:{x:1100,y:1100},target:{x:1100,y:1100},order:{kind:'idle'}});
 a.fog!.teams.enemy.visible.fill(false);
 const hidden=prepareEnemyRecon(a);expect(strategyFor(hidden)!.recon!.retreatUntil).toBe(0);
 const b=structuredClone(a);b.fog!.teams.enemy.visible.fill(true);
 const observed=prepareEnemyRecon(b);expect(strategyFor(observed)!.recon!.retreatUntil).toBe(145);
 expect(observed.combat.enemies.filter(e=>e.kind==='worker')).toEqual(a.combat.enemies.filter(e=>e.kind==='worker'));
 const killed=structuredClone(observed);killed.combat.enemies=killed.combat.enemies.filter(e=>e.id!==id);killed.waves.elapsedSeconds=150;
 const replaced=prepareEnemyRecon(killed);expect(strategyFor(replaced)!.recon!.ids).toHaveLength(1);expect(strategyFor(replaced)!.recon!.ids).not.toContain(id);
});
it('raids a visible undefended economic target instead of repeatedly sending troops into overwhelming defense',()=>{
 const m=fixture();m.enemyKnowledge!.playerBase={...m.gathering.base};m.fog!.teams.enemy.visible.fill(true);
 for(let i=0;i<8;i++)m.gathering.units.push({id:`guard-${i}`,kind:'soldier',hp:60,cargo:0,selected:false,position:{x:400+i*8,y:450},target:{x:400,y:450},order:{kind:'idle'}});
 const farm={x:1024,y:736,width:64,height:64};m.placement.farms=[{id:'farm-1',owner:'player',hp:100,footprint:farm,construction:{remainingSeconds:0,builderId:null}}];
 const objective=enemyObjective(m)!;expect(objective.kind).toBe('raid');expect(objective.position).toEqual({x:1056,y:768});expect(objective.power).toBe(0);
 m.enemyPolicy!.strategy={...strategyFor(m)!,objective};
 const e=m.combat.enemies.find(e=>e.kind==='unit')!;e.order={kind:'attack-move',destination:m.gathering.base};
 expect(enemyAttackDestination(m)).toEqual(objective.position);
 expect(updateEnemyExploration(m).combat.enemies.find(u=>u.id===e.id)!.order).toEqual({kind:'attack-move',destination:objective.position});
 expect(enemyObjective(m,objective)).toBe(objective);
 m.placement.farms=[];expect(enemyObjective(m)?.kind).toBe('probe');
});
it('hidden armies, buildings and banks cannot change strategic targeting',()=>{
 const m=fixture();m.enemyKnowledge!.playerBase={...m.gathering.base};m.fog!.teams.enemy.visible.fill(false);
 const a=enemyObjective(m),b=structuredClone(m);b.gathering.wood=99999;b.gathering.goldBalance=99999;
 b.gathering.units.push({id:'hidden-army',kind:'soldier',hp:9999,cargo:0,selected:false,position:m.gathering.base,target:m.gathering.base,order:{kind:'idle'}});
 expect(enemyObjective(b)).toEqual(a);
});
it('joins surviving small detachments even when no enemy power threshold is set',()=>{
 const enemies=Array.from({length:4},(_,i)=>({id:`enemy-produced-${i+1}`,kind:'unit' as const,owner:'enemy' as const,role:'soldier' as const,hp:48,position:{x:850+i*32,y:320},order:{kind:'idle' as const}}));
 const groups=[0,1].map(i=>({id:`enemy-group-${i+1}`,status:'muster' as const,members:enemies.slice(i*2,i*2+2).map(e=>e.id),destinations:Object.fromEntries(enemies.slice(i*2,i*2+2).map(e=>[e.id,e.position])),startedAt:0}));
 const r=updateEnemyAI({...createEnemyAI(),groups,nextGroupNumber:3},{baseHP:240,enemies},{width:1280,height:960,tileSize:32,revision:0,obstacles:[]},{x:100,y:100},60,[],{...enemyAIConfig,reserveCount:0,groupSize:6,minimumAttackSize:3,firstAttackSeconds:0});
 expect(r.state.groups).toHaveLength(1);expect(r.state.groups[0].status).toBe('attack');expect(r.state.groups[0].members).toHaveLength(4);
});
it('automatic air scouts avoid visible anti-air and recheck on a five second cadence',()=>{
 const m=fixture();const e={id:'enemy-produced-7',kind:'unit' as const,owner:'enemy' as const,role:'scout' as const,hp:35,position:{x:900,y:900},scouting:{mode:'auto' as const,waypoints:[{x:700,y:800}],index:0,nextPlanSeconds:0},order:{kind:'idle' as const}};
 m.combat.enemies.push(e);m.gathering.units.push({id:'aa',kind:'soldier',archetype:'archer',hp:40,owner:'player',cargo:0,selected:false,position:{x:1000,y:900},target:{x:1000,y:900},order:{kind:'idle'}});
 m.fog!.teams.enemy.visible.fill(false);expect(prepareScouting(m).combat.enemies.at(-1)!.scouting!.waypoints).toEqual(e.scouting.waypoints);
 m.fog!.teams.enemy.visible.fill(true);const safe=prepareScouting(m),scout=safe.combat.enemies.at(-1)!;
 expect(scout.scouting!.waypoints).not.toEqual(e.scouting.waypoints);expect(scout.scouting!.nextPlanSeconds).toBe(105);
 expect(prepareScouting(safe).combat.enemies.at(-1)!.navigation).toBe(scout.navigation);
});
it('a failed attack triggers a different approach for ninety gameplay seconds',()=>{
 let m=fixture();m.enemyKnowledge!.playerBase={...m.gathering.base};m.waves.elapsedSeconds=240;
 const ids=m.combat.enemies.filter(e=>e.kind==='unit').map(e=>e.id);
 m.enemyAI!.groups=[{id:'enemy-group-1',members:ids,destinations:Object.fromEntries(ids.map(id=>[id,m.gathering.base])),status:'attack',startedAt:0,dispatchedAt:200,dispatchedSize:6}];
 delete m.enemyPolicy!.strategy;m=prepareEnemyStrategy(m);expect(strategyFor(m)!.objective!.kind).toBe('base');
 m.combat.enemies=m.combat.enemies.filter(e=>!ids.slice(0,4).includes(e.id));m.waves.elapsedSeconds=244;
 m=prepareEnemyStrategy(m);expect(strategyFor(m)!.failedUntil).toBe(334);expect(strategyFor(m)!.objective!.kind).toBe('probe');
 expect(enemyAttackDestination(m)).not.toEqual(m.enemyKnowledge!.playerBase);
});

it('a blocked expansion backs off without spending and a different known site remains eligible later',()=>{
 let m=fixture();m.waves.elapsedSeconds=240;m.fog!.teams.enemy.visible.fill(true);m.fog!.teams.enemy.explored.fill(true);
 m.enemyKnowledge!.nodes=m.gathering.extraNodes!.filter(n=>n.resource==='gold').map(n=>({...n}));
 const worker=m.combat.enemies.find(e=>e.kind==='worker')!;
 for(let i=3;i<=6;i++)m.combat.enemies.push({...structuredClone(worker),id:`enemy-worker-${i}`});
 m.enemyPolicy!.research={attack:1,defense:1,job:null};m.enemyProduction!.wood=500;m.enemyProduction!.gold=300;
 const footprint={x:1440,y:1632,width:64,height:64};m.combat.enemies.push({id:'enemy-barracks',kind:'building',buildingType:'barracks',owner:'enemy',hp:150,position:{x:1472,y:1664},footprint,construction:{remainingSeconds:0,builderId:null}});
 for(let i=1;i<=2;i++){const foot={x:1792,y:1248+i*96,width:64,height:64};m.combat.enemies.push({id:`enemy-farm-${i}`,kind:'building',buildingType:'farm',owner:'enemy',hp:100,position:{x:foot.x+32,y:foot.y+32},footprint:foot,construction:{remainingSeconds:0,builderId:null}});m.map.obstacles.push(foot);}
 delete m.enemyPolicy!.strategy;m=prepareEnemyStrategy(m);
 const sites=strategicExpansionSites(m);expect(sites.length).toBeGreaterThan(1);
 const before={wood:m.enemyProduction!.wood,gold:m.enemyProduction!.gold};
 const deferred=deferEnemyInvestment(m,'expansion',1);expect(strategyFor(deferred)!.expand).toBe(false);expect(strategyFor(deferred)!.reserve).toEqual({wood:0,gold:0});
 deferred.map.obstacles.push({...sites[0],width:96,height:96});deferred.waves.elapsedSeconds=256;
 const retry=prepareEnemyStrategy(deferred);expect(strategyFor(retry)!.expand).toBe(true);expect(strategyFor(retry)!.priority).toBe('expansion');
 const built=prepareEnemyExpansion(retry),site=built.combat.enemies.find(e=>e.buildingType==='outpost');expect(site).toBeDefined();expect(site!.footprint).not.toEqual({...sites[0],width:96,height:96});
 expect(built.enemyProduction!.wood).toBe(before.wood-80);expect(built.enemyProduction!.gold).toBe(before.gold-20);
});

import {knownEnemyNode,observeEnemyKnowledge} from './enemyKnowledge';
it('indexes each owner knowledge snapshot without leaking hidden stock or retaining replaced observations',()=>{
 let a=fixture();const node=a.gathering.node;
 a.enemyKnowledge!.nodes=[{...node,remaining:123}];
 expect(knownEnemyNode(a,node)!.remaining).toBe(123);
 const b=structuredClone(a);b.enemyKnowledge!.nodes=[{...node,remaining:77}];
 expect(knownEnemyNode(b,node)!.remaining).toBe(77);
 a.gathering.node.remaining=0;a.fog!.teams.enemy.visible.fill(false);
 a=observeEnemyKnowledge(a);expect(knownEnemyNode(a,node)!.remaining).toBe(123);
 a.fog!.teams.enemy.visible.fill(true);a=observeEnemyKnowledge(a);expect(knownEnemyNode(a,node)!.remaining).toBe(0);
 const extra=a.gathering.gold!;a.enemyKnowledge!.nodes=[];expect(knownEnemyNode(a,extra)).toBeUndefined();
 a.enemyKnowledge!.nodes.push({...extra,remaining:88});expect(knownEnemyNode(a,extra)!.remaining).toBe(88);
 a.enemyKnowledge!.nodes=[];expect(knownEnemyNode(a,extra)).toBeUndefined();
});

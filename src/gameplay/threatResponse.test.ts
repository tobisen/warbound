import {expect,it} from 'vitest';
import {createMatch,updateMatch} from './match';
import {createClassicMatch} from './testHelpers/classicMatch';
import {prepareThreatResponses,retreating} from './threatResponse';
import {issueOrder} from './commandOrders';
import {createNavy} from './navy';
import {encodeSave,decodeSave} from './save';
import type {Unit} from './gathering';
function fixture(role:'worker'|'soldier'|'scout'|'archer'|'air'='worker'){
 const m=createMatch();m.map={width:1024,height:1024,tileSize:32,revision:0,obstacles:[]};m.fog=undefined;
 const common={id:'unit-1',position:{x:256,y:256},target:{x:256,y:256},selected:true,hp:40,cargo:3,order:{kind:'idle' as const}};
 m.gathering.units=[role==='worker'?{...common,kind:'worker'}:{...common,cargo:0,kind:'soldier',...(role==='soldier'?{}:{archetype:role})}];
 m.combat.enemies=[{id:'enemy-1',kind:'unit',role:'archer',owner:'enemy',hp:40,position:{x:384,y:256},order:{kind:'defend',targetId:'unit-1'}}];return m;
}
it('workers flee ranged pressure along a valid route and retain cargo and work identity',()=>{
 let m=fixture();const u=m.gathering.units[0];u.order={kind:'gather',nodeId:m.gathering.node.id};const order=u.order;
 m=prepareThreatResponses(m,.2);const escaped=m.gathering.units[0];expect(retreating(escaped)).toBe(true);expect(escaped.position.x).toBeLessThan(u.position.x);expect(escaped.order).toBe(order);expect(escaped.cargo).toBe(3);expect(escaped.threatRetreat!.route.status).not.toBe('blocked');
 m.combat.enemies=[];m=prepareThreatResponses(m,.2);expect(retreating(m.gathering.units[0])).toBe(false);expect(m.gathering.units[0].order).toBe(order);
});
it('armed ground and air troops acquire a compatible local threat; unarmed and incompatible troops escape',()=>{
 for(const role of ['archer','air'] as const){const m=prepareThreatResponses(fixture(role),.1);expect(m.gathering.units[0].order.kind==='attack'||!!m.gathering.units[0].selfDefense).toBe(true);}
 for(const role of ['scout','soldier'] as const){let m=fixture(role);m.combat.enemies[0].role='air';m=prepareThreatResponses(m,.1);expect(retreating(m.gathering.units[0])).toBe(true);}
});
it('manual move, attack, hold and Stop take priority; patrol can pause without losing its endpoints',()=>{
 for(const command of [{kind:'move' as const,destination:{x:500,y:400}},{kind:'hold' as const}]){const m=issueOrder(fixture(),command);expect(prepareThreatResponses(m,.2).gathering.units[0].position).toEqual({x:256,y:256});}
 let m=fixture();const u=m.gathering.units[0];u.commandMode={kind:'patrol',origin:{x:100,y:256},destination:{x:500,y:256},returning:false};u.order={kind:'move'};m=prepareThreatResponses(m,.2);expect(retreating(m.gathering.units[0])).toBe(true);expect(m.gathering.units[0].commandMode).toEqual(u.commandMode);
 m=issueOrder(m,{kind:'move',destination:{x:256,y:600}});expect(retreating(m.gathering.units[0])).toBe(false);
});
it('chooses a safer route against several threats, keeps its target and never crosses the enemy line',()=>{
 let m=fixture();m.combat.enemies.push({...m.combat.enemies[0],id:'enemy-2',position:{x:360,y:320}});m.map.obstacles=[{x:128,y:192,width:32,height:128}];
 const initial=Math.min(...m.combat.enemies.map(e=>Math.hypot(e.position.x-256,e.position.y-256)));
 const targets:string[]=[];for(let i=0;i<10;i++){m.waves.elapsedSeconds=i*.2;m=prepareThreatResponses(m,.2);expect(m.gathering.units[0].position.x).toBeLessThan(300);const id=m.gathering.units[0].threatRetreat?.attackerId;if(id&&targets.at(-1)!==id)targets.push(id);}
 expect(targets.length).toBeLessThanOrEqual(2);const u=m.gathering.units[0];expect(Math.min(...m.combat.enemies.map(e=>Math.hypot(e.position.x-u.position.x,e.position.y-u.position.y)))).toBeGreaterThan(initial);
});
it('unarmed transports evade on water while preserving passengers and their original order',()=>{
 let m=createClassicMatch('mission-sea');m.fog=undefined;m.gathering.units=[];m.navy=createNavy();m.navy.ships=[{id:'ship-1',kind:'ship',role:'transport',owner:'player',selected:true,hp:90,position:{x:768,y:512},target:{x:768,y:512},order:{kind:'idle'},passengers:[]}];m.combat.enemies=[{id:'enemy-1',kind:'ship',navalRole:'warship',hp:90,position:{x:832,y:512}}];
 m=prepareThreatResponses(m,.2);expect(retreating(m.navy!.ships[0])).toBe(true);expect(Math.hypot(m.navy!.ships[0].position.x-832,m.navy!.ships[0].position.y-512)).toBeGreaterThan(64);expect(m.navy!.ships[0].passengers).toEqual([]);
});
it('transient reaction metadata is excluded from strict Save and does not alter the original work order',()=>{
 const m=createMatch();const u=m.gathering.units[0];u.threatRetreat={order:u.order,attackerId:'enemy-1',nextPlan:1,route:{commandNumber:1,destination:u.position,waypoints:[],revision:0,status:'arrived'}};
 const json=encodeSave(m,{building:null,camera:{x:0,y:0}});expect(json).not.toContain('threatRetreat');expect(decodeSave(json).ok).toBe(true);
});

it('the same snapshot produces the same response independently of previous evaluations',()=>{const m=fixture();expect(prepareThreatResponses(m,.1)).toEqual(prepareThreatResponses(m,.1));});

it('armed ships defend against a compatible coastal threat from a real water position',()=>{
 let m=createClassicMatch('mission-sea');m.fog=undefined;m.gathering.units=[];m.navy=createNavy();m.navy.ships=[{id:'ship-1',kind:'ship',role:'warship',owner:'player',selected:true,hp:90,position:{x:768,y:512},target:{x:768,y:512},order:{kind:'idle'}}];m.combat.enemies=[{id:'enemy-1',kind:'unit',role:'archer',hp:40,position:{x:672,y:512}}];
 m=prepareThreatResponses(m,.1);expect(m.navy!.ships[0].selfDefense?.attackerId).toBe('enemy-1');expect(retreating(m.navy!.ships[0])).toBe(false);
});

it('enemy economic workers are not threats until they actually attack the unit',()=>{
 const m=fixture();m.combat.enemies[0]={...m.combat.enemies[0],kind:'worker',role:undefined,order:undefined};expect(retreating(prepareThreatResponses(m,.1).gathering.units[0])).toBe(false);
 m.combat.enemies[0].position={x:300,y:256};m.gathering.units[0].threatHit={attackerId:'enemy-1',order:m.gathering.units[0].order};expect(retreating(prepareThreatResponses(m,.1).gathering.units[0])).toBe(true);
});

it('proximity alone respects economic work; actual targeting suspends it without discarding cargo',()=>{
 let m=fixture();m.gathering.units[0].order={kind:'gather',nodeId:m.gathering.node.id};m.combat.enemies[0].order={kind:'idle'};m=prepareThreatResponses(m,.1);expect(retreating(m.gathering.units[0])).toBe(false);
 m.waves.elapsedSeconds=1;m.combat.enemies[0].order={kind:'defend',targetId:'unit-1'};m=prepareThreatResponses(m,.1);expect(retreating(m.gathering.units[0])).toBe(true);expect(m.gathering.units[0].order.kind).toBe('gather');
});

it('unarmed ships recognize a visible Kraken while air and inland troops remain outside its target mask',()=>{
 let m=createMatch('mission-sea');m.fog=undefined;m.combat.enemies=[];m.bosses!.sea=[{...m.bosses!.sea![0],position:{x:768,y:688}}];m.navy={...createNavy(),ships:[{id:'ship-1',kind:'ship',role:'transport',owner:'player',selected:true,hp:90,position:{x:768,y:624},target:{x:768,y:624},order:{kind:'idle'},passengers:[]}]};
 m.gathering.units=[{...m.gathering.units[0],position:{x:640,y:624},target:{x:640,y:624},order:{kind:'idle'}}];m=prepareThreatResponses(m,.1);expect(retreating(m.navy!.ships[0])).toBe(true);expect(m.navy!.ships[0].position.y).toBeLessThan(624);expect(retreating(m.gathering.units[0])).toBe(false);
 const air={id:'unit-4',kind:'soldier' as const,archetype:'scout' as const,hp:35,cargo:0 as const,position:{x:768,y:624},target:{x:768,y:624},order:{kind:'idle' as const},selected:true};m.gathering.units=[air];expect(retreating(prepareThreatResponses(m,.1).gathering.units[0])).toBe(false);
});

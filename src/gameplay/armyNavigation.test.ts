import {expect,it,vi} from 'vitest';
import {approachRoute} from './approach';
import {bodyFits,type WorldMap} from './map';
import {allocateFormation} from './formations';
import * as navigation from './navigation';
const world=():WorldMap=>({width:1024,height:768,tileSize:32,revision:0,obstacles:[{x:480,y:96,width:32,height:512}]});
it('moving combat bodies share terrain while preserving physical contact, detours and occlusion',()=>{
 const map=world(),start={x:160,y:160};
 for(const x of [704,736,384,704])for(const half of [11,12,20])for(const range of [24,128]){
  const target={x,y:160,width:32,height:32},overlay={...map,bodyHalf:half,blockingTarget:target},copy={...map,bodyHalf:half,obstacles:[...map.obstacles,target]};
  const actual=approachRoute(overlay,start,target,range),expected=approachRoute(copy,start,target,range);
  expect(actual).toEqual(expected);expect(bodyFits(overlay,{x:x+16,y:176},half)).toBe(false);
  let previous=start;for(const point of actual.waypoints){expect(navigation.segmentFits(copy,previous,point,half)).toBe(true);previous=point;}
 }
});
it('invalidates shared tile edges after terrain edits, init pushes, dimensions and body size changes',()=>{
 const map=world(),start={x:160,y:160},goal={x:800,y:160};
 for(const current of [map,{...map,bodyHalf:20},{...map,width:900,height:640}])expect(navigation.findRoute(current,start,goal)).toEqual(navigation.findRoute({...current,obstacles:[...current.obstacles]},start,goal));
 map.obstacles.push({x:480,y:0,width:32,height:768});
 expect(navigation.findRoute(map,start,goal).ok).toBe(false);
 map.obstacles[1].height=64;map.revision++;
 expect(navigation.findRoute(map,start,goal).ok).toBe(true);
});
it('routes a large formation through a shared safe corridor without one full search per member',()=>{
 const map=world(),members=Array.from({length:64},(_,i)=>({id:`u-${i}`,position:{x:128+i%8*32,y:160+Math.floor(i/8)*32},half:12,domain:'land' as const,map,commandNumber:1}));
 const search=vi.spyOn(navigation,'findFormationRoute');
 try{
  const assigned=allocateFormation(members,{x:784,y:224});expect(assigned.size).toBe(64);expect(search.mock.calls.length).toBeLessThan(16);
  for(const member of members){const route=assigned.get(member.id)!;expect(route.status).not.toBe('blocked');let previous=member.position;for(const point of route.waypoints){expect(navigation.segmentFits(map,previous,point,member.half)).toBe(true);previous=point;}expect(previous).toEqual(route.destination);}
  expect(new Set([...assigned.values()].map(r=>JSON.stringify(r.destination))).size).toBe(64);
 }finally{search.mockRestore();}
});
it('never shares a corridor across an impassable wall or incompatible body clearance',()=>{
 const map=world();map.obstacles.push({x:480,y:0,width:32,height:768});
 const members=[{id:'left',position:{x:160,y:160},half:12,domain:'land' as const,map,commandNumber:1},{id:'right',position:{x:720,y:160},half:20,domain:'land' as const,map,commandNumber:1}];
 const assigned=allocateFormation(members,{x:800,y:160});expect(assigned.get('left')!.status).toBe('blocked');expect(assigned.get('right')!.status).not.toBe('blocked');
});
it('takes a clear direct segment instead of backtracking through another member’s corridor',()=>{
 const map=world(),members=[{id:'a-leader',position:{x:160,y:160},half:12,domain:'land' as const,map,commandNumber:1},{id:'b-near-goal',position:{x:750,y:224},half:12,domain:'land' as const,map,commandNumber:1}];
 const route=allocateFormation(members,{x:784,y:224}).get('b-near-goal')!;
 expect(navigation.segmentFits(map,members[1].position,route.destination,12)).toBe(true);
 expect(route.waypoints).toEqual([route.destination]);
});

import {enemyNavigationMap} from './map';
it('shares gate-aware enemy collision snapshots across units while invalidating real gate and terrain changes',()=>{
 const map=world(),gate={x:160,y:160,width:32,height:32};map.enemyPassageBlocks=[gate];
 const first=enemyNavigationMap(map);
 expect(enemyNavigationMap({...map}).obstacles).toBe(first.obstacles);
 expect(enemyNavigationMap({...map,enemyPassageBlocks:map.enemyPassageBlocks.map(b=>({...b}))}).obstacles).toBe(first.obstacles);
 expect(bodyFits(map,{x:176,y:176},12)).toBe(true);expect(bodyFits(first,{x:176,y:176},12)).toBe(false);
 const extra={x:224,y:160,width:32,height:32};map.enemyPassageBlocks.push(extra);
 const added=enemyNavigationMap(map);expect(added.obstacles).not.toBe(first.obstacles);expect(bodyFits(added,{x:240,y:176},12)).toBe(false);
 map.enemyPassageBlocks[0].x=320;map.revision++;
 const moved=enemyNavigationMap(map);expect(moved.obstacles).not.toBe(added.obstacles);expect(bodyFits(moved,{x:336,y:176},12)).toBe(false);expect(bodyFits(moved,{x:176,y:176},12)).toBe(true);
 map.obstacles.push({x:128,y:320,width:64,height:32});const terrain=enemyNavigationMap(map);expect(terrain.obstacles).not.toBe(moved.obstacles);expect(bodyFits(terrain,{x:160,y:336},12)).toBe(false);
 const unblocked={...map,enemyPassageBlocks:undefined};expect(enemyNavigationMap(unblocked)).toBe(unblocked);expect(bodyFits(unblocked,{x:336,y:176},12)).toBe(true);
 expect(enemyNavigationMap(first)).toBe(first);
});

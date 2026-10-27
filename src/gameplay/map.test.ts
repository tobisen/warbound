import type { Position } from './movement';
import { describe, expect, it } from 'vitest';
import { arenaConfig } from '../config/arena';
import { waveSchedule } from '../config/waves';
import { createMatch } from './match';
import { createMap, worldTile, tileCenter, tileFootprint, blockedTile, bodyFits, replaceObstacles } from './map';

describe('hand-authored world map', () => {
  it('roundtrips all tile centers including the clipped bottom row', () => {
    const map={...createMap(), width:800,height:600};
    for(let row=0;row<19;row++)for(let column=0;column<25;column++) {
      const tile={column,row};expect(worldTile(map,tileCenter(map,tile)!)).toEqual(tile);
    }
    expect(tileFootprint(map,{column:0,row:18})?.height).toBe(24);
    expect(tileCenter(map,{column:0,row:18})?.y).toBe(588);
  });
  it('rejects invalid/outside coordinates without clamping', () => {
    const m={...createMap(), width:800,height:600};
    for(const p of [{x:-1,y:0},{x:800,y:0},{x:0,y:600},{x:NaN,y:0},{x:0,y:Infinity}])expect(worldTile(m,p)).toBeNull();
    expect(tileFootprint(m,{column:.5,row:0})).toBeNull();expect(tileCenter(m,{column:25,row:0})).toBeNull();
  });
  it('rasterizes partial overlaps while body queries respect exact footprints', () => {
    const m=replaceObstacles({...createMap(),width:800,height:600},[{x:33,y:33,width:1,height:1}]);
    expect(blockedTile(m,{column:1,row:1})).toBe(true);
    expect(blockedTile(m,{column:0,row:0})).toBe(false);
    expect(bodyFits(m,{x:34,y:34},12)).toBe(false);
    expect(bodyFits(m,{x:16,y:16},12)).toBe(true);
    expect(bodyFits(m,{x:16,y:588},12)).toBe(true);
    expect(bodyFits(m,{x:16,y:599},12)).toBe(false);
  });
  it('preserves current direct economy/defense routes and valid starts/entries', () => {
    const m=createMap();
    const paths: Position[][]=arenaConfig.workers.map(p=>[p,arenaConfig.node]);
    paths.push([arenaConfig.node,arenaConfig.base]);
    for(let i=0;i<Math.max(...waveSchedule.map(w=>w.count));i++) {
      const entry={x:arenaConfig.enemyEntry.x,y:arenaConfig.enemyEntry.y+i*arenaConfig.enemyEntry.spacing};
      expect(bodyFits(m,entry,12)).toBe(true);
      paths.push([entry,arenaConfig.base]);
      paths.push([entry,{x:596,y:416}]);
    }
    for(const [a,b] of paths)for(let i=0;i<=100;i++) {
      const t=i/100;expect(bodyFits(m,{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t},12)).toBe(true);
    }
  });
  it('revisions and new matches own obstacle data independently', () => {
    const a=createMap(),b=replaceObstacles(a,[]);
    expect(b.revision).toBe(1);expect(a.obstacles).not.toHaveLength(0);
    const fresh=createMatch().map;
    const state=createMatch();state.map.obstacles[0].x=500;state.map.revision=10;
    expect(createMatch().map).toEqual(fresh);
  });
});

it('reuses spatial candidates while honoring interaction exclusions and obstacle revisions',async()=>{
 const {nearbyObstacles}=await import('./map');
 const obstacles=Array.from({length:40},(_,i)=>({x:i*32,y:64,width:32,height:32}));
 const map={...createMap(),width:2048,height:512,obstacles};const area={x:65,y:65,width:10,height:10};
 const first=nearbyObstacles(map,area);expect(nearbyObstacles(map,{...area,x:70})).toBe(first);
 const target=obstacles[2];expect(nearbyObstacles({...map,interactionTarget:target},area)).not.toContain(target);
 expect(nearbyObstacles(map,area)).toContain(target);
 const revised=replaceObstacles(map,obstacles.filter(o=>o!==target));expect(nearbyObstacles(revised,area)).not.toContainEqual(target);
 // Initialization additions to the same array must invalidate both index and query cache.
 const added={...target};map.obstacles.push(added);expect(nearbyObstacles(map,area)).toContain(added);
});

import {withoutFootprints} from './map';
it('shot endpoint exclusions reuse a collision snapshot and invalidate on terrain revisions and initialization additions',()=>{
 const a={x:96,y:96,width:64,height:64},b={x:224,y:96,width:64,height:64},map={width:512,height:512,tileSize:32,revision:0,obstacles:[a,b]};
 const first=withoutFootprints(map,[{...a}]);expect(first.obstacles).toEqual([b]);expect(withoutFootprints({...map},[{...a}]).obstacles).toBe(first.obstacles);
 expect(withoutFootprints(map,[{x:180,y:180,width:24,height:24}])).toBe(map);
 expect(withoutFootprints(map,[a,b]).obstacles).toEqual([]);expect(map.obstacles).toEqual([a,b]);
 const c={x:320,y:320,width:32,height:32};map.obstacles.push(c);expect(withoutFootprints(map,[a]).obstacles).toEqual([b,c]);
 const revised=replaceObstacles(map,[a]);expect(withoutFootprints(revised,[a]).obstacles).toEqual([]);
 map.revision++;map.obstacles[1]={...b,x:256};expect(withoutFootprints(map,[a]).obstacles).toEqual([map.obstacles[1],c]);
});

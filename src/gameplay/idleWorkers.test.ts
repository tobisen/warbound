import {expect,it} from 'vitest';
import {idleWorkers,nextIdleWorker} from './idleWorkers';
import type {Worker,Unit} from './gathering';
const worker=(id:string,extra:Partial<Worker>={}):Worker=>({id,kind:'worker',owner:'player',hp:35,cargo:0,selected:false,position:{x:300,y:300},target:{x:300,y:300},order:{kind:'idle'},...extra});
it('cycles in stable numeric order, wraps, skips busy/dead workers and handles removal',()=>{
 const units=[worker('unit-10'),worker('unit-2'),worker('unit-1',{order:{kind:'gather',nodeId:'wood'}})],before=structuredClone(units);
 expect(nextIdleWorker(units)?.id).toBe('unit-2');expect(nextIdleWorker(units,'unit-2')?.id).toBe('unit-10');expect(nextIdleWorker(units,'unit-10')?.id).toBe('unit-2');expect(units).toEqual(before);
 expect(nextIdleWorker(units.slice(0,1),'unit-2')?.id).toBe('unit-10');expect(nextIdleWorker([])).toBeUndefined();
});
it('excludes all active work, queued commands, movement, modes and self defense',()=>{
 const orders:Worker['order'][]=[{kind:'gather',nodeId:'wood'},{kind:'deliver',nodeId:'wood'},{kind:'build',buildingId:'barracks'},{kind:'repair',buildingId:'barracks'},{kind:'move'},{kind:'attack',enemyId:'enemy-1'}];
 const order={kind:'idle'} as const;
 const units:Unit[]=[...orders.map((order,i)=>worker(`unit-${i+1}`,{order})),worker('dead',{hp:0}),worker('queued',{orderQueue:[{kind:'move',destination:{x:400,y:300}}]}),worker('hold',{commandMode:{kind:'hold'}}),worker('moving',{navigation:{commandNumber:1,destination:{x:400,y:300},waypoints:[{x:400,y:300}],revision:0,status:'moving'}}),worker('defending',{order,selfDefense:{attackerId:'enemy-1',order}}),{...worker('soldier'),kind:'soldier',hp:60,cargo:0,order:{kind:'idle'}},worker('idle',{cargo:3}),worker('blocked',{navigation:{commandNumber:1,destination:{x:300,y:300},waypoints:[],revision:0,status:'blocked'}})];
 expect(idleWorkers(units).map(u=>u.id)).toEqual(['blocked','idle']);
});

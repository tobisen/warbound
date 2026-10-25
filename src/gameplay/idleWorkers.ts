import {defending} from './selfDefense';
import type {Unit,Worker} from './gathering';

/** Orders, pending orders and active command modes take precedence over motion. */
export function idleWorkers(units:readonly Unit[]):Worker[]{
 return units.filter((u):u is Worker=>u.kind==='worker'&&(u.hp??1)>0&&u.order.kind==='idle'&&!u.commandMode&&!u.orderQueue?.length&&u.navigation?.status!=='moving'&&!defending(u))
  .sort((a,b)=>a.id.localeCompare(b.id,'en',{numeric:true}));
}
export function nextIdleWorker(units:readonly Unit[],previousId?:string):Worker|undefined {
 const workers=idleWorkers(units),index=workers.findIndex(u=>u.id===previousId);
 return workers[(index+1)%workers.length];
}

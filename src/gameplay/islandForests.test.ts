import {expect,it} from 'vitest';
import {islandMapIds} from '../config/islandMaps';
import {maps,mapResources} from '../config/maps';
import {createMatch,updateMatch} from './match';
import {encodeSave,decodeSave} from './save';
import {matchStats} from './matchStats';
import {resourceNodes} from './gathering';
const view={camera:{x:0,y:0},building:null};
it.each(islandMapIds)('%s provides several finite clusters and comparable woodland at every starting island',id=>{
 const resources=mapResources(id,'trees'),starts=maps[id].skirmishStarts!,budgets=starts.map((_,i)=>resources.filter(n=>n.resource==='wood'&&(n.id.startsWith(`island-${i}-`)||i===0&&n.id==='wood-1')).reduce((sum,n)=>sum+n.amount,0));
 expect(Math.min(...budgets)).toBeGreaterThanOrEqual(6000);expect(Math.max(...budgets)/Math.min(...budgets)).toBeLessThan(1.2);
 for(const [i]of starts.entries()){const trees=resources.filter(n=>n.id.startsWith(`island-${i}-`)&&n.tree);expect(trees.length).toBeGreaterThanOrEqual(30);expect(trees.some(n=>n.id.includes('-grove-0-'))).toBe(true);expect(trees.some(n=>n.id.includes('-grove-1-'))).toBe(true);}
});
it.each(islandMapIds)('%s migrates genuine79 forest geometry without replacing balances, troops or harvested stock',id=>{
 const m=createMatch('skirmish','normal',undefined,id),doc=JSON.parse(encodeSave(m,view)),g=doc.state.gathering,added=g.extraNodes.filter((n:{id:string})=>n.id.includes('-grove-'));
 doc.configVersion='tribute-config-79';g.extraNodes=g.extraNodes.filter((n:{id:string})=>!n.id.includes('-grove-'));
 for(const n of g.extraNodes)if(/^island-\d+-tree-/.test(n.id))n.remaining=60;
 doc.state.map.obstacles=doc.state.map.obstacles.filter((r:{x:number;y:number;width:number;height:number})=>!added.some((n:{position:{x:number;y:number}})=>r.x===n.position.x-16&&r.y===n.position.y-16&&r.width===32&&r.height===32));
 for(const team of ['player','enemy'])for(const n of added)delete doc.state.fog.forest?.[team]?.[n.id];
 const loaded=decodeSave(JSON.stringify(doc));expect(loaded.ok,loaded.ok?'':loaded.error).toBe(true);if(!loaded.ok)return;
 expect(matchStats(loaded.match).player.wood.gathered).toBe(0);expect(loaded.match.gathering.wood).toBe(m.gathering.wood);expect(loaded.match.gathering.units.map(u=>u.position)).toEqual(m.gathering.units.map(u=>u.position));expect(loaded.match.map.legacyIslandForests).toBe(true);expect(resourceNodes(loaded.match.gathering).filter(n=>n.id.includes('-grove-'))).toHaveLength(0);expect(resourceNodes(loaded.match.gathering).find(n=>n.id==='island-0-tree-0-0')?.remaining).toBe(60);
 expect(decodeSave(encodeSave(loaded.match,view)).ok).toBe(true);
});
it.each(['twinwake','farreach'] as const)('%s retains wood after a fifteen-minute paid AI economy and uses the added groves',id=>{
 let m=createMatch('skirmish','normal',undefined,id);m.combat.baseHP=100000;for(let i=0;i<1800&&m.outcome==='playing';i++)m=updateMatch(m,.5);
 expect(m.waves.elapsedSeconds).toBe(900);expect(m.enemyProduction!.extracted!.wood).toBeGreaterThan(500);
 expect(resourceNodes(m.gathering).filter(n=>n.resource==='wood'&&n.id.startsWith('island-1-')).reduce((sum,n)=>sum+n.remaining,0)).toBeGreaterThan(3000);
 expect(m.combat.enemies.some(e=>e.work?.order.kind==='gather'&&e.work.order.nodeId.includes('tree')||e.work?.order.kind==='gather'&&e.work.order.nodeId.includes('grove'))).toBe(true);
},30000);

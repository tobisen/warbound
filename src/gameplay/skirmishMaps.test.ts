import {mapDiscoveries} from '../config/discoveries';
import {it,expect} from 'vitest';
import {newSkirmishIds} from '../config/skirmishMaps';
import {maps} from '../config/maps';
import {createMatch,updateMatch} from './match';
import {matchPlayers,validatePlayerStarts,playerStart} from './players';
import {encodeSave,decodeSave} from './save';
import {terrainPatches,bodyFits,createMap} from './map';
import {domainBodyFits,findDomainRoute} from './terrainNavigation';
import {findRoute} from './navigation';
import {resourceNodes} from './gathering';
it.each(newSkirmishIds)('%s has five separated, connected start regions, resources and correct bounds',id=>{
 const roster=matchPlayers(undefined,undefined,5);expect(validatePlayerStarts(id,roster,'woodlands-connected')).toBe(true);const m=createMatch('skirmish','normal',undefined,id,1,'balanced',roster),starts=roster.map(p=>playerStart(id,p.id,m.map.design));
 expect(m.map.width).toBe(maps[id].world!.width);expect(new Set(starts.map(p=>`${p.x},${p.y}`)).size).toBe(5);
 for(const [i,start]of starts.entries()){for(const [j,other]of starts.entries())if(i!==j)expect(Math.hypot(start.x-other.x,start.y-other.y)).toBeGreaterThan(650);
 const nodes=resourceNodes(m.gathering);for(const resource of ['wood','gold'])expect(nodes.some(n=>(n.resource??'wood')===resource&&Math.hypot(n.position.x-start.x,n.position.y-start.y)<600)).toBe(true);}
 for(const p of terrainPatches(m.map)){expect(p.column).toBeGreaterThanOrEqual(0);expect(p.row).toBeGreaterThanOrEqual(0);expect((p.column+p.columns)*32).toBeLessThanOrEqual(m.map.width);expect((p.row+p.rows)*32).toBeLessThanOrEqual(m.map.height);}
 const terrain=createMap(id,undefined,'trees','expanded','woodlands-connected');for(const start of starts.slice(1)){const path=findRoute(terrain,{x:400,y:550},{x:start.x,y:start.y+128},12);expect(path.ok).toBe(true);expect(findRoute(m.map,{x:400,y:550},{x:start.x,y:start.y+128},12).ok).toBe(true);}
 for(const discovery of mapDiscoveries(id,m.map.design))expect(bodyFits(m.map,discovery.position,20)).toBe(true);
 const waters=terrainPatches(m.map).filter(p=>p.kind==='water');let water:{x:number;y:number}|undefined;for(const patch of waters){const point={x:(patch.column+.5)*32,y:(patch.row+.5)*32};if(domainBodyFits(terrain,'water',point,12)){water=point;break;}}expect(water).toBeDefined();expect(domainBodyFits(terrain,'land',water!,12)).toBe(false);expect(domainBodyFits(terrain,'water',starts[0],12)).toBe(false);expect(findDomainRoute(terrain,'water',water!,water!,12).ok).toBe(true);
},60000);
it.each(newSkirmishIds)('%s supports1–4 AI, paid construction, Save/load and restart',id=>{
 for(const count of [2,3,4,5]){const roster=matchPlayers(undefined,undefined,count);let m=createMatch('skirmish','normal',undefined,id,1,'balanced',count>2?roster:undefined);m=updateMatch(m,5);
 for(const bot of m.multiplePlayers?.ai??[])expect(bot.state.enemyProduction!.spent!.wood).toBeGreaterThan(0);
 const json=encodeSave(m,{camera:{x:0,y:0},building:null});expect(new TextEncoder().encode(json).byteLength).toBeLessThan(4_000_000);const loaded=decodeSave(json);expect(loaded.ok,loaded.ok?'':loaded.error).toBe(true);if(loaded.ok){expect(loaded.match.map.id).toBe(id);expect(loaded.match.multiplePlayers?.roster).toEqual(m.multiplePlayers?.roster);}
 expect(createMatch('skirmish','normal',undefined,id,1,'balanced',count>2?roster:undefined).waves.elapsedSeconds).toBe(0);
 }
},120000);

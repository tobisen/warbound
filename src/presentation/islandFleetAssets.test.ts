import {it,expect} from 'vitest';
import json from '../../public/assets/island-fleets-atlas.json?raw';
import {factionIds} from '../config/factions';
import {fleetBuildings,fleetShips,marineRoles} from '../config/islandFleets';
import {navalRoleAvailable} from '../config/navy';
import {motion,unitFrame,artAtlas} from './animation';
import {buildingFrame} from './assets';
const atlas=JSON.parse(json);
it('new units have actual own atlas frames for both teams, all eight directions and complete animation states',()=>{
 for(const faction of factionIds)for(const role of [...fleetShips.filter(r=>navalRoleAvailable(faction,r)),...marineRoles])for(const owner of ['player','enemy'] as const)for(const direction of ['n','ne','e','se','s','sw','w','nw'] as const)for(const state of ['idle','walk','attack','death'] as const)for(let frame=0;frame<4;frame++){
 const m={...motion(undefined,{x:100,y:100},state,0,role,owner,undefined,faction),facing:direction,action:state};expect(artAtlas(role)).toBe('island-fleets');const key=unitFrame(m,frame/8);expect(atlas.frames[key],key).toBeDefined();
 }
});
it('four functional buildings have complete/damaged/construction frames for every faction and owner',()=>{
 for(const f of factionIds)for(const kind of fleetBuildings)for(const owner of ['player','enemy'] as const)for(const [left,hp]of [[0,999],[0,1],[5,999],[1,999]]){const key=buildingFrame(kind,owner,left,5,f,hp);expect(atlas.frames[key],key).toBeDefined();}
});

import {expect,it} from 'vitest';
import {createMatch} from './match';
import {bodyFits,overlaps} from './map';
import {decodeSave,encodeSave} from './save';
import {matchPopulation} from './navy';
import {enqueueProduction,updateQueuedProduction} from './productionQueue';
import {beginPlacement,placementError,placementObstacles} from './placement';
import {actionPanel} from '../presentation/actionPanel';
import {factions} from '../config/factions';
import {unitBody} from './spawning';

it('keeps a 256-unit army, 64 farms, five expansions and 140 producers through paid training and Save',()=>{
 let m=createMatch('skirmish','normal',undefined,'plains96');
 m.gathering.wood=500;m.gathering.goldBalance=500;
 const locations=[];
 for(let y=32;y<m.map.height-64&&locations.length<210;y+=96)for(let x=32;x<m.map.width-64&&locations.length<210;x+=96){
  const rect={x,y,width:64,height:64};
  if(bodyFits(m.map,{x:x+32,y:y+32},32)&&!m.gathering.units.some(u=>overlaps(rect,unitBody(u.position,24)))){locations.push(rect);m.map.obstacles.push(rect);}
 }
 expect(locations).toHaveLength(210);
 const construction={remainingSeconds:0,builderId:null},production={remainingSeconds:null,nextUnitNumber:257};
 m.placement.farms=locations.slice(0,64).map((footprint,i)=>({id:`farm-${i+1}`,owner:'player',hp:80,footprint,construction}));m.placement.nextFarmNumber=65;
 m.placement.bases=locations.slice(64,69).map((footprint,i)=>({id:`base-${i+1}`,owner:'player',hp:240,footprint,construction,production:{...production}}));m.placement.nextBaseNumber=6;
 m.placement.barracks=locations[69];m.placement.barracksOwner='player';m.placement.barracksHP=factions.crown.buildings.barracks.hp;m.placement.construction=construction;
 m.placement.producers=locations.slice(70).map((footprint,i)=>({id:`producer-${i+1}`,kind:'barracks',owner:'player',hp:factions.crown.buildings.barracks.hp,footprint,construction,production:{...production}}));m.placement.nextProducerNumber=141;
 for(let y=32;y<m.map.height-32&&m.gathering.units.length<256;y+=32)for(let x=32;x<m.map.width-32&&m.gathering.units.length<256;x+=32){if(!bodyFits(m.map,{x,y},12))continue;m.gathering.units.push({id:`unit-${m.gathering.units.length+1}`,kind:'soldier',owner:'player',hp:60,cargo:0,selected:false,position:{x,y},target:{x,y},order:{kind:'idle'}});}
 m.production.nextUnitNumber=257;m.soldierProduction.nextUnitNumber=257;
 m.gathering.units[0].selected=true;
 expect(actionPanel(m,null,true)['build-farm'].reason).toBe('');expect(actionPanel(m,null,true)['build-base'].reason).toBe('');
 expect(beginPlacement(m.placement,'farm').active).toBe(true);expect(beginPlacement(m.placement,'base').active).toBe(true);
 const b={kind:'barracks' as const,footprint:m.placement.barracks,bounds:m.map,technology:{baseLevel:1,buildings:['base','barracks'] as const,research:{}}};
 const paid=enqueueProduction(m.gathering,m.soldierProduction,b,matchPopulation(m));expect(paid.production.queue).toHaveLength(1);
 const trained=updateQueuedProduction(paid.gathering,paid.production,5,b,{map:m.map,enemies:m.combat.enemies});
 m={...m,gathering:trained.gathering,soldierProduction:trained.production};expect(m.gathering.units).toHaveLength(257);
 // Other producer counters follow the shared sequence before serialization.
 m.production.nextUnitNumber=258;for(const p of [...m.placement.bases!,...m.placement.producers!])p.production.nextUnitNumber=258;
 const started=performance.now(),json=encodeSave(m,{camera:{x:0,y:0},building:null}),loaded=decodeSave(json);
 expect(loaded.ok,loaded.ok?'':loaded.error).toBe(true);if(!loaded.ok)throw Error(loaded.error);
 expect(loaded.match.gathering.units).toHaveLength(257);expect(loaded.match.placement.producers).toHaveLength(140);expect(loaded.match.placement.bases).toHaveLength(5);
 expect(matchPopulation(loaded.match)).toEqual(matchPopulation(m));
 expect(new Set(loaded.match.gathering.units.map(u=>u.id)).size).toBe(257);
 console.info(JSON.stringify({units:257,farms:64,bases:5,producers:140,saveBytes:new TextEncoder().encode(json).length,saveLoadMs:performance.now()-started}));
 // Resource/terrain collision remains enforced beyond the old count limits.
 expect(placementError({...m.placement,active:true,kind:'farm'},locations[0],m.gathering.wood,placementObstacles(m.gathering),{map:m.map,gathering:m.gathering,enemies:[]})).not.toBeNull();
},30000);

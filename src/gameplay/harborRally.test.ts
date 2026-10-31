import {matchFog} from './matchFog';
import {expect,it} from 'vitest';
import {createClassicMatch as createMatch} from './testHelpers/classicMatch';
import {placeHarbor,trainShip,updateNavy,commandShips} from './navy';
import {updateConstruction} from './construction';
import {trainExtraProducer,updateExtraProducers,setExtraProducer} from './extraProducers';
import {setHarborRally,clearHarborRally} from './harborRally';
import {decodeSave,encodeSave} from './save';
import {inspectBuildingAt} from './buildingInspection';
import {selectionInfo} from '../presentation/selectionInfo';
import {actionPanel} from '../presentation/actionPanel';
const view={camera:{x:0,y:0},building:null};
function ports(){let m=createMatch('mission-outpost','easy');m.gathering.wood=1000;m.gathering.goldBalance=1000;m.gathering.units[0].selected=true;m.fog=undefined;
 for(const point of [{x:192,y:416},{x:96,y:416}]){m.placement={...m.placement,active:true,kind:'harbor'};m=placeHarbor(m,point);m=updateNavy(m,100);m={...m,...updateConstruction(m.gathering,m.placement,m.map,100)};}
 return m;
}
it('multiple paid ports remain buildable and independently selectable with paid queues and water waypoints after load',()=>{
 let m=ports();const extra=m.placement.producers![0];expect(extra.kind).toBe('harbor');expect(actionPanel(m,null,true)['build-harbor'].reason).toBe('');expect(inspectBuildingAt(m,{x:128,y:448})).toBe(extra.id);
 const a={x:176,y:512},b={x:208,y:512};m.navy!.production=setHarborRally(m,m.navy!.production,m.navy!.harbor!.footprint,a);
 m=setExtraProducer(m,{...extra,production:setHarborRally(m,extra.production,extra.footprint,b)});
 m.gathering.units=m.gathering.units.map(u=>({...u,selected:false}));expect(selectionInfo(m,'harbor').detail).toContain('Shift + right-click: clear');expect(selectionInfo(m,extra.id).stats).toContain(`Waypoint: ${b.x}, ${b.y}`);
 expect(m.navy!.production.rally).toEqual(a);expect(m.placement.producers![0].production.rally).toEqual(b);
 m.placement.farms=[{id:'farm-1',owner:'player',hp:80,footprint:{x:544,y:384,width:64,height:64},construction:{remainingSeconds:0,builderId:null}}];m.placement.nextFarmNumber=2;m.map.obstacles.push(m.placement.farms[0].footprint);m=trainShip(trainShip(m));m=trainExtraProducer(m,extra.id,'transport');
 m.fog=matchFog(m);const loaded=decodeSave(encodeSave(m,view));expect(loaded.ok,loaded.ok?'':loaded.error).toBe(true);if(!loaded.ok)return;m=loaded.match;
 m=updateExtraProducers(updateNavy(m,16),16);expect(m.navy!.ships).toHaveLength(3);expect(new Set(m.navy!.ships.map(s=>s.id)).size).toBe(3);
 expect(m.navy!.ships.filter(s=>s.target.x===a.x)).toHaveLength(2);expect(m.navy!.ships.find(s=>s.role==='transport')!.target).toEqual(b);
 for(let i=0;i<80;i++)m=updateNavy(m,.1);
 expect(m.navy!.ships.every(s=>s.navigation?.status==='arrived')).toBe(true);
 expect(m.navy!.ships.filter(s=>s.role!=='transport').every(s=>s.position.x===a.x)).toBe(true);
 expect(decodeSave(encodeSave(m,view)).ok).toBe(true);
});
it('invalid land and disconnected water retain the prior point; clearing affects only future ships',()=>{
 let m=ports();const p=m.navy!.production,foot=m.navy!.harbor!.footprint,valid=setHarborRally(m,p,foot,{x:176,y:512});
 expect(setHarborRally(m,valid,foot,{x:400,y:300})).toMatchObject({rally:valid.rally,rallyError:expect.any(String)});
 const blocked={...m,map:{...m.map,revision:m.map.revision+1,obstacles:[...m.map.obstacles,{x:0,y:480,width:m.map.width,height:8}]}};
 expect(setHarborRally(blocked,valid,foot,{x:1152,y:336}).rallyError).toContain('No water route');
 m.navy!.production=valid;m=trainShip(m);m=updateNavy(m,8);const target=m.navy!.ships[0].target;m.navy!.production=clearHarborRally(m.navy!.production);expect(m.navy!.production.rally).toBeUndefined();expect(m.navy!.ships[0].target).toEqual(target);
 m.navy!.ships[0].selected=true;expect(commandShips(m,{x:208,y:512})!.ships[0].target).toEqual({x:208,y:512});
});

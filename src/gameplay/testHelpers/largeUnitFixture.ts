import {createMatch} from '../match';
import {factions,factionsForPlayer,type FactionId} from '../../config/factions';
import {matchFog} from '../matchFog';
export function largeUnitFixture(f:FactionId){const m=createMatch('skirmish','normal',factionsForPlayer(f),'twinwake');m.gathering.wood=1200;m.gathering.goldBalance=1000;m.combat.baseDevelopment={level:3,remainingSeconds:null};m.research={attack:2,defense:2,job:null};
 for(const [i,kind]of (['forge','academy','aviary'] as const).entries()){const b={id:kind,owner:'player' as const,hp:factions[f].buildings[kind].hp,footprint:{x:288+i*128,y:544,width:64,height:64},construction:{remainingSeconds:0,builderId:null},production:{remainingSeconds:null,nextUnitNumber:4}};if(kind==='forge')delete (b as {production?:unknown}).production;Object.assign(m.placement,{[kind]:b});m.map.obstacles.push(b.footprint);}
 m.placement.farms=[0,1,2].map(i=>({id:`farm-${i+1}`,owner:'player' as const,hp:factions[f].buildings.farm.hp,footprint:{x:288+i*128,y:672,width:64,height:64},construction:{remainingSeconds:0,builderId:null}}));m.placement.nextFarmNumber=4;m.map.obstacles.push(...m.placement.farms.map(b=>b.footprint));m.fog=matchFog(m);return m;}
import {placeHarbor,harborPlacementError,updateNavy} from '../navy';
import {coastalFootprint} from '../terrainNavigation';
/** Explicit funded component setup. Unit production still pays and runs its real FIFO. */
export function capitalFixture(){let m=largeUnitFixture('crown');
 m.placement.producers=['drydock','navalAcademy'].map((kind,i)=>({id:`producer-${i+1}`,kind:kind as 'drydock'|'navalAcademy',owner:'player' as const,hp:factions.crown.buildings[kind as 'drydock'].hp,footprint:{x:192,y:544+i*128,width:64,height:64},construction:{remainingSeconds:0,builderId:null},production:{remainingSeconds:null,nextUnitNumber:4}}));m.placement.nextProducerNumber=3;m.map.obstacles.push(...m.placement.producers.map(p=>p.footprint));
 m.fog=undefined;m.gathering.units=m.gathering.units.map((u,i)=>({...u,selected:i===0}));m.placement={...m.placement,active:true,kind:'harbor'};
 let site;for(let y=96;y<1024&&!site;y+=32)for(let x=64;x<864;x+=32)if(coastalFootprint(m.map,{x,y,width:64,height:64})&&!harborPlacementError(m,{x,y})){site={x,y};break;}
 if(!site)throw Error('No free capital harbor');m=updateNavy(placeHarbor(m,site),100);m.fog=matchFog(m);return m;
}

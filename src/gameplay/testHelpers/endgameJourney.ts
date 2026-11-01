import {createMatch,type MatchState} from '../match';
import {applyCheat} from '../cheats';
import {beginPlacement,placeBuilding,placementError,placementObstacles,type ProducerKind} from '../placement';
import {updateConstruction} from '../construction';
import {technologyFor} from '../productionPrerequisites';
import {startResearch,updateResearch,type ResearchKind} from '../research';
import {startBaseUpgrade,advanceBaseUpgrade} from '../baseUpgrade';
import {coastalFootprint} from '../terrainNavigation';
import {harborPlacementError,placeHarbor,trainShip,updateNavy} from '../navy';
import {trainFlyer,updateFlightProduction} from '../flightProduction';
import {trainGiant} from '../giants';
import {updateHealerProduction} from '../healers';
import {trainExtraProducer,updateExtraProducers} from '../extraProducers';
import {matchFog} from '../matchFog';
/** Diagnostic journey: official resource cheat funds the bank, but no buildings,
 * research levels or units are injected. Every prerequisite is paid and finished
 * through its normal construction/research/production API. Not an economy playtest. */
export function endgameJourney(){
 let m=applyCheat(createMatch('skirmish','beginner',undefined,'twinwake'),'icanseemyhousefromhere');const steps:string[]=[];
 const build=(kind:ProducerKind|'forge'|'farm')=>{
  m.gathering.units=m.gathering.units.map((u,i)=>({...u,selected:i===0}));const placement=beginPlacement(m.placement,kind),context={technology:technologyFor(m,'player'),map:m.map,gathering:m.gathering,enemies:m.combat.enemies};let point;
  for(let y=128;y<992&&!point;y+=32)for(let x=192;x<768;x+=32)if(!placementError(placement,{x,y},m.gathering.wood,placementObstacles(m.gathering),context)){point={x,y};break;}
  if(!point)throw Error(`No reachable ${kind} site`);
  const r=placeBuilding(placement,point,m.gathering.wood,placementObstacles(m.gathering),context);if(!r.gathering||!r.map)throw Error(`Cannot build ${kind}`);
  m={...m,placement:r.placement,gathering:r.gathering,map:r.map};m={...m,...updateConstruction(m.gathering,m.placement,m.map,100)};steps.push(`Built ${kind}`);
 };
 const research=(kind:ResearchKind)=>{const next=startResearch(m.gathering,m.research!,m.placement,kind);if(next.research===m.research)throw Error(`Cannot research ${kind}`);m={...m,...next,research:updateResearch(next.research,m.placement,100,true,'crown')};steps.push(`Research ${kind} ${m.research![kind]}`);};
 build('barracks');build('forge');research('attack');research('defense');build('academy');research('attack');research('defense');
 for(const seconds of [20,30]){const next=startBaseUpgrade(m);if(next===m)throw Error('Cannot upgrade main building');m=advanceBaseUpgrade(next,seconds).match;steps.push(`Base ${m.combat.baseDevelopment!.level}`);}
 for(let i=0;i<4;i++)build('farm');
 for(const kind of ['aviary','drydock','signalTower','navalAcademy','marineBarracks'] as const)build(kind);
 for(const kind of ['lightHulls','navalOptics','repairCrane','marineDrill'] as const)research(kind);
 m.placement={...m.placement,active:true,kind:'harbor'};let coast;
 for(let y=96;y<1024&&!coast;y+=32)for(let x=64;x<864;x+=32)if(coastalFootprint(m.map,{x,y,width:64,height:64})&&!harborPlacementError({...m,fog:undefined},{x,y})){coast={x,y};break;}
 if(!coast)throw Error('No reachable harbor');m=updateNavy(placeHarbor({...m,fog:undefined},coast),100);if(!m.navy?.harbor)throw Error('Harbor was not built');steps.push('Built harbor');
 m=updateNavy(trainShip(m,'capital'),45);m=updateFlightProduction(trainFlyer(m,'air'),40);m=updateHealerProduction(trainGiant(m,'giant'),40);
 const marine=m.placement.producers!.find(b=>b.kind==='marineBarracks')!;m=updateExtraProducers(trainExtraProducer(m,marine.id,'marine'),30);
 const roles=[...m.gathering.units.map(u=>u.kind==='worker'?'worker':u.archetype??'soldier'),...m.navy!.ships.map(u=>u.role)];for(const role of ['capital','air','giant','marine'])if(!roles.includes(role as 'worker'))throw Error(`Missing paid ${role}`);
 m.fog=matchFog(m);return {match:m,steps,roles};
}

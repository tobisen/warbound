import type {MatchState} from './match';
import type {ProductionState} from './production';
import type {Footprint} from './placement';
import type {Position} from './movement';
import {domainBodyFits,planDomainRoute} from './terrainNavigation';
import {harborSpawn} from './navy';
/** Use a real water exit and a water-only route. Invalid commands retain the last point. */
export function setHarborRally(m:MatchState,p:ProductionState,footprint:Footprint,target:Position):ProductionState {
 if(!domainBodyFits(m.map,'water',target,16))return {...p,rallyError:'Choose open water. The previous waypoint is unchanged.'};
 const start=harborSpawn(m,footprint,false);
 if(!start||planDomainRoute(m.map,'water',start,target,16).status==='blocked')return {...p,rallyError:'No water route from this harbor. The previous waypoint is unchanged.'};
 return {...p,rally:{...target},rallyError:undefined};
}
export function clearHarborRally(p:ProductionState):ProductionState {return {...p,rally:undefined,rallyError:undefined};}

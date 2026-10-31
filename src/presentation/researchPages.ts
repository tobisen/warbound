import {roleResearchConfig,isRoleResearch} from '../config/roleResearch';
/** Prerequisite lists are not research locations. Each research has one host. */
export function researchHost(kind:string,level=0):string {
 if(kind==='workerTools')return 'base';
 if(kind==='attack'||kind==='defense')return level===0?'forge':'academy';
 if(kind==='siegeShells'||kind==='preciseShells')return 'navalFoundry';
 return isRoleResearch(kind)?roleResearchConfig[kind].buildings.at(-1)!:'';
}

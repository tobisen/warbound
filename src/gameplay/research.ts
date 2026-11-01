import {navalFoundryAvailable} from '../config/navy';
import {roleResearchAvailable,researchConflict,roleResearchConfig,isRoleResearch,type RoleResearchKind} from '../config/roleResearch';
import {workerToolsConfig} from '../config/workerTools';
import {contentReason} from '../config/campaignContent';
import {researchAvailability} from './productionPrerequisites';
import {productionFaction,factions,type FactionId} from '../config/factions';
import { canAfford,payCost } from './economy';
import type { GatheringState } from './gathering';
import type { PlacementState } from './placement';
export type ResearchKind=RoleResearchKind|'attack'|'defense'|'workerTools';
export interface ResearchState {lightHulls?:number;armoredHulls?:number;navalOptics?:number;repairCrane?:number;marineDrill?:number;coastalGunnery?:number;convoyService?:number;assaultRamps?:number;tidewatch?:number;siegeShells?:number;preciseShells?:number;volatileTorpedoes?:number;queue?:ResearchKind[];navalLogistics?:number;cavalryArmor?:number;healerTraining?:number;scoutOptics?:number;submarineDesign?:number;attack:number;defense:number;workerTools?:number;job:{kind:ResearchKind;remainingSeconds:number}|null}
export const createResearch=():ResearchState=>({attack:0,defense:0,job:null});
export function forgeReady(p:PlacementState){return !!p.forge&&(p.forge.hp??0)>0&&p.forge.construction.remainingSeconds===0;}
export function academyReady(p:PlacementState){return !!p.academy&&p.academy.hp>0&&p.academy.construction.remainingSeconds===0||!!p.producers?.some(b=>b.kind==='academy'&&b.hp>0&&b.construction.remainingSeconds===0);}
export const researchLevel=(r:ResearchState,kind:ResearchKind)=>r[kind]??0;
export function researchRecipe(f:import('../config/factions').FactionDefinition,kind:ResearchKind,level:number){
 if(isRoleResearch(kind))return roleResearchConfig[kind];
 if(kind==='workerTools')return workerToolsConfig[Math.min(2,level)]!;
 const r=f.upgrades[kind];return level>=1?{...r,cost:{wood:r.cost.wood*2,gold:r.cost.gold*2},durationSeconds:12}:r;
}
/** Authoritative admission reason shared by the buttons and the paid transaction. */
export function researchReason(g:GatheringState,r:ResearchState,p:PlacementState,kind:ResearchKind,playing=true,mainReady=true):string|null {
 const level=researchLevel(r,kind),f=productionFaction(g);
 if(!playing)return 'Match is paused or ended';
 if(isRoleResearch(kind)&&(!roleResearchAvailable(kind,f.id)||kind==='navalLogistics'&&!navalFoundryAvailable(f.id)))return 'Unavailable for this faction';
 if(kind!=='workerTools'&&contentReason(g.campaignContent,'research',kind))return 'Locked for this campaign mission';
 if(level>=(isRoleResearch(kind)?1:kind==='workerTools'?3:f.upgrades[kind].maxLevel))return 'Already researched';
 if(researchConflict(kind,r))return 'Exclusive alternative already chosen';
 if(r.job?.kind===kind)return 'Research in progress';
 if(r.queue?.includes(kind))return 'Research queued';
 if(isRoleResearch(kind)){
  for(const b of roleResearchConfig[kind].buildings){const site=b==='navalFoundry'||b==='drydock'||b==='signalTower'||b==='navalAcademy'||b==='marineBarracks'?undefined:p[b];
   if(!(site&&site.hp>0&&site.construction.remainingSeconds===0)&&!p.producers?.some(s=>s.kind===b&&s.hp>0&&s.construction.remainingSeconds===0))return `Complete ${f.buildingNames[b]}`;
  }
 }else if(kind==='workerTools'){if(!mainReady)return 'Complete main building';}
 else {const reason=researchAvailability(f,kind,{buildings:[...(forgeReady(p)?['forge' as const]:[]),...(academyReady(p)?['academy' as const]:[])],research:r});if(reason)return reason;}
 const cost=researchRecipe(f,kind,level).cost,wood=g.wood<cost.wood,gold=(g.goldBalance??0)<cost.gold;
 return wood&&gold?'Not enough wood and gold':wood?'Not enough wood':gold?'Not enough gold':null;
}
export function canResearch(g:GatheringState,r:ResearchState,p:PlacementState,kind:ResearchKind,playing=true,mainReady=true){
 return researchReason(g,r,p,kind,playing,mainReady)===null;
}
export function startResearch(g:GatheringState,r:ResearchState,p:PlacementState,kind:ResearchKind,playing=true,mainReady=true){
 const recipe=researchRecipe(productionFaction(g),kind,researchLevel(r,kind));
 return canResearch(g,r,p,kind,playing,mainReady)?{gathering:payCost(g,recipe.cost),research:r.job?{...r,queue:[...(r.queue??[]),kind]}:{...r,job:{kind,remainingSeconds:recipe.durationSeconds}}}:{gathering:g,research:r};
}
export function updateResearch(r:ResearchState,p:PlacementState,delta:number,playing=true,faction:FactionId='crown',mainReady=true):ResearchState {
 if(!playing)return r;
 if(!mainReady)return r.job||r.queue?.length?{...r,job:null,...(r.queue?{queue:[]}:{})}:r;
 const valid=(kind:ResearchKind)=>isRoleResearch(kind)?roleResearchConfig[kind].buildings.every(b=>{const site=b==='navalFoundry'||b==='drydock'||b==='signalTower'||b==='navalAcademy'||b==='marineBarracks'?undefined:p[b];return !!site&&site.hp>0&&site.construction.remainingSeconds===0||!!p.producers?.some(s=>s.kind===b&&s.hp>0&&s.construction.remainingSeconds===0);}):kind==='workerTools'?mainReady:forgeReady(p)&&(researchLevel(r,kind)<1||academyReady(p));
 let queue=(r.queue??[]).filter(valid),job=r.job;
 if(job&&!valid(job.kind))job=null;
 let next:ResearchState={...r,job,...(r.queue?{queue}: {})};
 let time=Math.max(0,delta);
 while(job||queue.length){
  if(!job){const kind=queue.shift()!;job={kind,remainingSeconds:researchRecipe(factions[faction],kind,researchLevel(next,kind)).durationSeconds};}
  const left=Math.max(0,job.remainingSeconds-time);
  if(left>1e-10){job={...job,remainingSeconds:left};break;}
  time=Math.max(0,time-job.remainingSeconds);
  const kind=job.kind;
  next={...next,[kind]:Math.min(isRoleResearch(kind)?1:kind==='workerTools'?3:factions[faction].upgrades[kind].maxLevel,researchLevel(next,kind)+1)};job=null;
 }
 if(!r.job&&!r.queue?.length)return r;
 return {...next,job,...(r.queue?{queue}: {})};
}

export function researchSummary(r:ResearchState,faction:FactionId='crown'):string {
 const f=factions[faction],label=(kind:ResearchKind)=>isRoleResearch(kind)?roleResearchConfig[kind].name:kind==='workerTools'?'Worker Tools':f.upgrades[kind].name;
 const job=r.job;
 const active=job?`${label(job.kind)} ${Math.round(100*(1-job.remainingSeconds/researchRecipe(f,job.kind,researchLevel(r,job.kind)).durationSeconds))}% · ${job.remainingSeconds.toFixed(1)}s remaining`:'Research idle';
 return active+(r.queue?.length?' · Queue: '+r.queue.map((kind,i)=>`${i+1}. ${label(kind)}`).join(' → '):'');
}

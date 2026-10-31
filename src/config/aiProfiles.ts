import type {EnemyAISettings} from './enemyAI';
export const aiProfiles={
 fleet:{label:'Fleet',description:'Invests in escort hulls and early Light Hulls/coastal weapons; escorts worker transports to neutral islands. On water maps fields escorts before siege ships; on land uses mobile scouts and archers.',minArmy:3,expansionArmy:3,expansionResearch:false,researchFirst:'defense',groupDelta:0,reserveDelta:0,defenderDelta:0,attackTime:1.2,dispatchTime:1.2,defenseRange:1},
 siege:{label:'Siege',description:'Builds Siege Works before cavalry and aircraft, fields ballistas/catapults and defensive escorts, then attacks in larger groups. Flank the slow siege train.',minArmy:3,expansionArmy:4,expansionResearch:true,researchFirst:'attack',groupDelta:2,reserveDelta:1,defenderDelta:1,attackTime:1.4,dispatchTime:1.3,defenseRange:1.1},
 balanced:{label:'Standard',description:'Existing balanced production, researched expansion and attack timing.',minArmy:3,expansionArmy:3,expansionResearch:true,researchFirst:'attack',groupDelta:0,reserveDelta:0,defenderDelta:0,attackTime:1,dispatchTime:1,defenseRange:1},
 defensive:{label:'Defensive',description:'Larger defensive reserve; on islands prioritizes Reinforced Bulkheads and Repair Cranes. Later attacks and expansion.',minArmy:4,expansionArmy:6,expansionResearch:true,researchFirst:'defense',groupDelta:2,reserveDelta:1,defenderDelta:2,attackTime:1.6,dispatchTime:2,defenseRange:1.25},
 offensive:{label:'Offensive',description:'Build an army before tech; attack earlier and often, with a smaller reserve.',minArmy:5,expansionArmy:6,expansionResearch:true,researchFirst:'attack',groupDelta:1,reserveDelta:-1,defenderDelta:-1,attackTime:.75,dispatchTime:.7,defenseRange:.8},
 economic:{label:'Economic',description:'Smaller initial army; sends a guarded worker transport to neutral islands with one escort. Prioritizes fast hulls and scouting, then attacks later.',minArmy:2,expansionArmy:2,expansionResearch:false,researchFirst:'defense',groupDelta:1,reserveDelta:0,defenderDelta:0,attackTime:2,dispatchTime:1.6,defenseRange:1},
} as const;
export type AIProfileId=keyof typeof aiProfiles;
export function isAIProfile(v:unknown):v is AIProfileId{return typeof v==='string'&&Object.hasOwn(aiProfiles,v);}
export const aiProfile=(m:{aiProfile?:AIProfileId})=>aiProfiles[m.aiProfile??'balanced'];
export function profileAISettings(base:EnemyAISettings,id:AIProfileId='balanced'):EnemyAISettings {
 const p=aiProfiles[id];return {...base,groupSize:Math.max(1,base.groupSize+p.groupDelta),reserveCount:Math.max(0,base.reserveCount+p.reserveDelta),maxDefenders:Math.max(1,base.maxDefenders+p.defenderDelta),firstAttackSeconds:base.firstAttackSeconds*p.attackTime,dispatchGapSeconds:base.dispatchGapSeconds*p.dispatchTime,defenseRange:base.defenseRange*p.defenseRange};
}

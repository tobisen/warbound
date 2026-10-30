export const roleResearchKinds=['convoyService','assaultRamps','tidewatch','siegeShells','preciseShells','volatileTorpedoes','navalLogistics','cavalryArmor','healerTraining','scoutOptics','submarineDesign'] as const;
export type RoleResearchKind=typeof roleResearchKinds[number];
export const roleResearchConfig={
 convoyService:{name:'Convoy Service',cost:{wood:70,gold:45},durationSeconds:24,buildings:['navalFoundry'] as const,description:'Humans: idle ships within160px of a completed friendly harbor repair4 HP/s for0.25 wood and0.1 gold/HP. Transports also heal living passengers2 HP/s while docked. No repair while attacking or moving.'},
 assaultRamps:{name:'Assault Ramps',cost:{wood:60,gold:40},durationSeconds:20,buildings:['navalFoundry'] as const,description:'Orcs: transports carry6 troops instead of4 and transfer across96px of shore instead of64px. Land a larger assault behind your short-range Fire Barges; supply costs remain unchanged.'},
 tidewatch:{name:'Tidewatch',cost:{wood:55,gold:45},durationSeconds:20,buildings:['navalFoundry'] as const,description:'Elves: armed surface ships gain288px vision and192px submarine detection. Moonwing scouts gain352px vision. Detection still requires current line of sight.'},
 siegeShells:{name:'Siege Shells',cost:{wood:80,gold:65},durationSeconds:28,buildings:['navalFoundry','siegeWorks'] as const,description:'Dwarves: Bombard shells splash within48px against ships/buildings. Mutually exclusive with Precise Shells; aircraft and land troops remain invalid targets.'},
 preciseShells:{name:'Precise Shells',cost:{wood:80,gold:65},durationSeconds:28,buildings:['navalFoundry','siegeWorks'] as const,description:'Dwarves: Bombard building multiplier rises from1.8 to3.0 for coastal demolition. Mutually exclusive with Siege Shells; no area damage.'},
 volatileTorpedoes:{name:'Volatile Torpedoes',cost:{wood:55,gold:60},durationSeconds:22,buildings:['navalFoundry'] as const,description:'Goblins: submarine torpedoes splash within48px against ships only. Each shot costs the firing submarine4 HP and stops at4 HP; retreat before an escort finds you.'},
 navalLogistics:{name:'Naval Logistics',cost:{wood:100,gold:75},durationSeconds:30,buildings:['navalFoundry'] as const,description:'Humans unlock the fast Tide Runner escort (ships/air); Dwarves unlock the slow long-range Bombard (ships/buildings). Invest in specialized hulls instead of immediate warships.'},
 submarineDesign:{name:'Submarine Design',cost:{wood:45,gold:30},durationSeconds:12,buildings:['forge','academy'] as const,description:'Unlocks harbor submarines: water only, torpedoes against ships only; enemy detection requires nearby detector and current vision.'},
 cavalryArmor:{name:'Cavalry Armor',cost:{wood:45,gold:30},durationSeconds:12,buildings:['forge','stable'] as const,description:'Cavalry only: 20% less incoming damage; stacks once with normal defense research.'},
 healerTraining:{name:'Healer Training',cost:{wood:45,gold:30},durationSeconds:12,buildings:['forge','academy'] as const,description:'Healers only: +50 maximum mana; initial mana, regeneration, Heal amount/range/cost/cooldown unchanged.'},
 scoutOptics:{name:'Scout Optics',cost:{wood:45,gold:30},durationSeconds:12,buildings:['forge','aviary'] as const,description:'Scouts detect submarines within128px and current team vision; ordinary288px vision unchanged.'},
};
export const isRoleResearch=(kind:string):kind is RoleResearchKind=>roleResearchKinds.some(k=>k===kind);
export const cavalryArmorMultiplier=(role:string|undefined,level=0)=>role==='cavalry'&&level>=1?.8:1;
export const trainedHealerMana=(role:string|undefined,level=0)=>role==='healer'&&level>=1?50:0;
export const scoutDetectionRadius=128;
export const scoutDetectorRadius=(role:string|undefined,level=0)=>role==='scout'&&level>=1?scoutDetectionRadius:0;

export const factionResearch = {convoyService:'crown',assaultRamps:'clans',tidewatch:'elves',siegeShells:'dwarves',preciseShells:'dwarves',volatileTorpedoes:'goblins'} as const;
export type FactionResearchKind=keyof typeof factionResearch;
export const factionResearchKinds=Object.keys(factionResearch) as FactionResearchKind[];
export function roleResearchAvailable(kind:RoleResearchKind,faction:string):boolean {
 return kind in factionResearch?factionResearch[kind as FactionResearchKind]===faction:kind!=='navalLogistics'||faction==='crown'||faction==='dwarves';
}
export function researchConflict(kind:string,r:{siegeShells?:number;preciseShells?:number;job?:{kind:string}|null;queue?:readonly string[]}):boolean {
 const other=kind==='siegeShells'?'preciseShells':kind==='preciseShells'?'siegeShells':undefined;
 return !!other&&!!(r[other]||r.job?.kind===other||r.queue?.includes(other));
}

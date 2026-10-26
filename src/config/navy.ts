import {shipTargets} from './domains';
/** Preliminary shared recipe for both factions; naval balancing belongs to RTS-087. */
export const navyConfig={
 transport:{searchRadius:256,boardingRadius:512,transferSeconds:30,targets:[] as const,cost:{wood:40,gold:10},durationSeconds:8,supply:2,capacity:4,contactRange:64},
 harbor:{tileSize:32,footprintTiles:2,cost:{wood:40,gold:10},hp:160,constructionSeconds:5,constructionRange:24},
 submarine:{targets:['sea'] as const,cost:{wood:75,gold:50},durationSeconds:20,supply:3,size:32,speed:125,hp:100,spawnGap:8,range:160,damage:24,attackInterval:1.8,projectileSpeed:280,projectileLifetime:3,hitRadius:20},
 ship:{targets:shipTargets,damageByDomain:{air:.75},cost:{wood:40,gold:15},durationSeconds:8,supply:2,size:32,speed:110,hp:90,spawnGap:8,range:192,damage:16,attackInterval:1.5,projectileSpeed:280,projectileLifetime:3,hitRadius:20},
};

export const shipRoles=['warship','transport','submarine','cutter','bombard'] as const;
export type ShipRole=typeof shipRoles[number];
export const isShipRole=(v:string):v is ShipRole=>shipRoles.some(k=>k===v);
export const advancedNaval={
 cutter:{...navyConfig.ship,targets:['sea','air'] as const,cost:{wood:55,gold:25},durationSeconds:12,supply:2,hp:65,speed:165,range:160,damage:10,attackInterval:.85,damageByDomain:{air:1.25}},
 bombard:{...navyConfig.ship,targets:['sea','building'] as const,cost:{wood:110,gold:75},durationSeconds:28,supply:4,hp:160,speed:60,range:288,damage:38,attackInterval:3.5,damageByDomain:{building:1.8}},
};

export const navalRoleAvailable=(faction:string,role:ShipRole)=>role==='cutter'?faction==='crown':role==='bombard'?faction==='dwarves':true;
export const navalFoundryAvailable=(faction:string)=>faction==='crown'||faction==='dwarves';

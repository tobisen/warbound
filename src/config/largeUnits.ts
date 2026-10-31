/** Original late-game units. Existing FIFO, fog, armor and target masks apply. */
export const largeLandRoles=['zeppelin','behemoth'] as const;
export const largeUnitPurpose={
 capital:'Storm Ark · Human capital ship: durable sea/coastal broadside, no anti-air. Submarines, torpedo boats and aircraft counter it. Base III, attack/defense II, Naval Academy and Drydock.',
 zeppelin:'Brass Leviathan · Goblin bombardment zeppelin: 352px vision, slow 288px bombing with40px splash; ground/ships/buildings only. Archers, escort ships and Anti-Air towers counter it.',
 behemoth:'Ironback Behemoth · Orc armored dinosaur: slow, costly siege beast, 3× melee building damage. Cannot attack air or ships; ranged kiting and focused fire counter it.',
};
export const largeLandRecipes={
 zeppelin:{role:'zeppelin' as const,art:'zeppelin' as const,healable:false,domain:'air' as const,combatMode:'projectile' as const,trainedAt:'aviary' as const,targets:['land','sea','building'] as const,cost:{wood:170,gold:140},durationSeconds:42,supply:6,hp:330,speed:70,size:40,selectionSize:64,visionRadius:352,range:288,aggroRange:320,damage:40,attackInterval:3,projectileSpeed:250,projectileLifetime:3,hitRadius:22,splashRadius:40,prerequisites:{baseLevel:3,buildings:['aviary','academy'] as const,research:{attack:2,defense:2}}},
 behemoth:{role:'behemoth' as const,art:'behemoth' as const,domain:'land' as const,combatMode:'melee' as const,trainedAt:'academy' as const,targets:['land','building'] as const,cost:{wood:160,gold:130},durationSeconds:40,supply:6,hp:560,speed:52,size:32,selectionSize:64,range:44,aggroRange:160,damagePerSecond:44,buildingDamageMultiplier:3,prerequisites:{baseLevel:3,buildings:['academy'] as const,research:{attack:2,defense:2}}},
};
export const capitalRecipe={cost:{wood:200,gold:160},durationSeconds:45,supply:7,hp:520,speed:58,size:32,range:272,damage:52,attackInterval:3.2,targets:['sea','building'] as const,damageByDomain:{building:1.75}};

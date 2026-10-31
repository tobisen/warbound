export const fleetBuildings=['drydock','signalTower','navalAcademy','marineBarracks'] as const;
export const fleetShips=['survey','raider','mortarShip','tender','torpedoBoat'] as const;
export const marineRoles=['marine','sapper','harpooner'] as const;
export const fleetResearch=['lightHulls','armoredHulls','navalOptics','repairCrane','marineDrill','coastalGunnery'] as const;
export const isFleetBuilding=(s:string):s is typeof fleetBuildings[number]=>fleetBuildings.some(k=>k===s);
export const isFleetShip=(s:string):s is typeof fleetShips[number]=>fleetShips.some(k=>k===s);
export const isMarine=(s:string):s is typeof marineRoles[number]=>marineRoles.some(k=>k===s);
export const fleetBuildingPurpose={drydock:'Paid hull repair within224px:6HP/s,0.25 wood+0.1 gold per HP; idle ships only. Repair Cranes doubles speed.',signalTower:'Coastal lookout:512px vision and256px submarine detection in current sight. Unlocks Naval Optics and Harpooners.',navalAcademy:'Unlocks your unique faction ship; choose faster hulls or damage protection. Research coastal weapons.',marineBarracks:'Dedicated amphibious infantry production. Humans/Orcs: marines; Dwarves/Goblins: sappers; Elves: harpooners.'};

export function fleetStats<T extends {speed:number;damageByDomain?:Partial<Record<'land'|'sea'|'air'|'building',number>>}>(base:T,research?:{lightHulls?:number;coastalGunnery?:number}):T {
 return {...base,speed:base.speed*(research?.lightHulls?1.2:1),...(research?.coastalGunnery?{damageByDomain:{...base.damageByDomain,building:(base.damageByDomain?.building??1)*1.25}}:{})};
}

export const fleetUnitPurpose={
 survey:'Unarmed Elven survey launch: 512px vision, 160px submarine detection in current sight. Fast and fragile; avoid escorts.',
 raider:'Orc Flame Galley: fast close-range sea/coastal raider; 1.5× building damage. Longer-range ships and aircraft counter it.',
 mortarShip:'Dwarf Mortar Monitor: slow heavy sea/coastal artillery; 352px range, 2.25× building damage, 5 supply. Needs close escort; cannot target aircraft.',
 tender:'Human Repair Tender: unarmed support. Idle near idle damaged ships to repair 4 HP/s within 128px for 0.25 wood + 0.1 gold/HP. Cannot repair itself.',
 torpedoBoat:'Goblin Torpedo Skiff: fast, visible, fragile ship hunter; 36 damage/2.2s at 112px. Ships only; escort fire and aircraft counter it.',
 marine:'Amphibious assault infantry: transport to establish a beachhead. Humans are tougher; Orc Boarding Marauders are faster and hit harder. Melee ground/buildings only.',
 sapper:'Fragile demolition specialist: 6× melee building damage. Dwarves wear heavier armor; Goblin Fuse Runners rush targets. Needs escorts against infantry.',
 harpooner:'Elven Harpooner: 208px ranged coastal defense; 2× ship, 1.5× air and 0.5× ground damage. Cannot attack buildings.',
};

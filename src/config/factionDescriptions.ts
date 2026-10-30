import type {FactionId} from './factions';
/** Based on the implemented recipes and abilities, not artwork lore. */
export const factionDescriptions:Record<FactionId,string>={
 crown:'A balanced army with sturdy buildings and defensive melee troops. Banner Guards and Plate Craft reward a protected formation; a Naval Foundry and Naval Logistics unlock fast Tide Runner sea/air escorts instead of heavier general-purpose ships. Convoy Service turns completed harbors into paid repair stations and heals embarked troops.',
 clans:'Fast, aggressive melee troops and Raiders. Fury raises outgoing damage for short assaults. Hunters have shorter range, so close the distance and support the front line. Fire Barges trade range and anti-air for close sea/coast salvos; Assault Ramps carries six troops.',
 elves:'Long-range bows, quick Marksmen and True Shot favor scouting and careful positioning. Lighter troops and buildings need protection from close assaults. Swift Sails hunt sea/air targets; Tidewatch expands ship/scout vision and submarine detection.',
 dwarves:'Durable infantry, Bulwarks, strong buildings and armored ships. Brace supports holding ground. Naval Logistics unlocks a slow long-range Bombard for sea/building siege; it needs escorts against aircraft and flanking. Coast Ballistas punish ships from land but cannot hit aircraft. Choose Siege Shells for ship clusters or Precise Shells for coastal demolition.',
 goblins:'Low-cost structures, Grenadier splash and aggressive Overcharge favor raids and mixed firepower. Fragile units and buildings are vulnerable; Overcharge also increases incoming damage. Volatile Torpedoes gives submarines sea splash at the cost of their own hull; spread-out escorts counter them.',
};

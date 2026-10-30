/** Shared doctrine rules for human/AI simulation, presentation and strict Save. */
export const fleetDoctrineConfig={
 convoy:{radius:160,hullPerSecond:4,passengerPerSecond:2,woodPerHP:.25,goldPerHP:.1},
 assault:{capacity:6,contactRange:96},
 tidewatch:{shipVision:288,scoutVision:352,detection:192},
 shells:{splashRadius:48,buildingMultiplier:3},
 volatile:{splashRadius:48,hullCost:4},
} as const;

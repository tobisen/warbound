/** Strategy limits are goals, always subordinate to paid costs, real supply and map capacity. */
export const enemyStrategyConfig = {
 beginner: {scoutSeconds:90, attackSeconds:360, raidSeconds:300, expansionInterval:540, minimumAttackSize:2,decisionSeconds:8, workerStepSeconds:120, maxWorkers:6, maxArmy:8, expansionSeconds:300, maxBases:2, attackRatio:1.5},
 easy: {scoutSeconds:60, attackSeconds:300, raidSeconds:270, expansionInterval:480, minimumAttackSize:3,decisionSeconds:5, workerStepSeconds:90, maxWorkers:8, maxArmy:12, expansionSeconds:240, maxBases:2, attackRatio:1.35},
 normal: {scoutSeconds:30, attackSeconds:240, raidSeconds:210, expansionInterval:420, minimumAttackSize:3,decisionSeconds:3, workerStepSeconds:60, maxWorkers:10, maxArmy:24, expansionSeconds:180, maxBases:3, attackRatio:1.2},
 hard: {scoutSeconds:15, attackSeconds:180, raidSeconds:150, expansionInterval:300, minimumAttackSize:4,decisionSeconds:1.5, workerStepSeconds:45, maxWorkers:12, maxArmy:32, expansionSeconds:150, maxBases:3, attackRatio:1.1},
};
export const enemyStrategyLimits = {baseSpacing:320, resourceRange:448, dangerRange:448, maxCandidates:24, maxPlacementSearches:2, producerWood:160, producerGold:60};

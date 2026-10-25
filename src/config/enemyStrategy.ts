/** Strategy limits are goals, always subordinate to paid costs, real supply and map capacity. */
export const enemyStrategyConfig = {
 beginner: {minimumAttackSize:2,decisionSeconds:8, workerStepSeconds:120, maxWorkers:6, maxArmy:8, expansionSeconds:300, maxBases:2, attackRatio:1.5},
 easy: {minimumAttackSize:3,decisionSeconds:5, workerStepSeconds:90, maxWorkers:8, maxArmy:12, expansionSeconds:240, maxBases:2, attackRatio:1.35},
 normal: {minimumAttackSize:3,decisionSeconds:3, workerStepSeconds:60, maxWorkers:10, maxArmy:24, expansionSeconds:180, maxBases:3, attackRatio:1.2},
 hard: {minimumAttackSize:4,decisionSeconds:1.5, workerStepSeconds:45, maxWorkers:12, maxArmy:32, expansionSeconds:150, maxBases:3, attackRatio:1.1},
};
export const enemyStrategyLimits = {baseSpacing:320, resourceRange:448, dangerRange:448, maxCandidates:24, maxPlacementSearches:2, producerWood:160, producerGold:60};

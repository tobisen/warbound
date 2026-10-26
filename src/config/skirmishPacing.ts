import type {MatchState} from '../gameplay/match';
import type {EnemyAISettings} from './enemyAI';

/** Gameplay seconds (1x = one game second per real second). Campaign clocks stay authored. */
export const skirmishPacing={
 beginner:{first:960,min:900,max:1080,gap:300},
 easy:{first:810,min:720,max:900,gap:240},
 normal:{first:600,min:540,max:660,gap:180},
 hard:{first:480,min:420,max:540,gap:150},
} as const;
export function skirmishAttackSeconds(m:Pick<MatchState,'difficulty'|'aiProfile'>):number {
 const p=skirmishPacing[m.difficulty??'normal'];
 return m.aiProfile==='offensive'?p.min:m.aiProfile==='defensive'||m.aiProfile==='economic'?p.max:p.first;
}
/** Applied after strategy/personality: every Skirmish map observes the preparation window. */
export function skirmishAISettings(m:MatchState,settings:EnemyAISettings):EnemyAISettings {
 if(m.scenario!=='skirmish'||m.campaignMission)return settings;
 const p=skirmishPacing[m.difficulty??'normal'];
 return {...settings,regroupFromDispatch:true,firstAttackSeconds:skirmishAttackSeconds(m),dispatchGapSeconds:p.gap*(m.aiProfile==='offensive'?.9:m.aiProfile==='defensive'||m.aiProfile==='economic'?1.25:1)};
}

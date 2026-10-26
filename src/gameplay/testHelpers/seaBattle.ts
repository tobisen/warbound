import {identityFor,campaignMissionsFor} from '../../config/campaignSeries';
import {seaBattleMission,seaBattleDifficulty} from '../../config/seaBattle';
import {startCampaignMission} from '../campaign';
export function seaBattle(difficulty:keyof typeof seaBattleDifficulty='normal'){
 const identity=identityFor('crown',difficulty),missions=campaignMissionsFor(identity.campaignId);
 return startCampaignMission({version:1,identity,completed:missions.filter(m=>m.id!==seaBattleMission).map(m=>m.id)},seaBattleMission,difficulty,{player:'crown',enemy:'clans'})!;
}

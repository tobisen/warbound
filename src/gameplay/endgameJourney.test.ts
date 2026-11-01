import {expect,it} from 'vitest';import {endgameJourney} from './testHelpers/endgameJourney';import {encodeSave,decodeSave} from './save';import {matchPopulation} from './navy';
it('reaches four playable endgame roles from base I with paid prerequisite chains, four strategic buildings and four role researches',()=>{
 const {match:m,steps,roles}=endgameJourney();expect(m.combat.baseDevelopment?.level).toBe(3);expect(m.research).toMatchObject({attack:2,defense:2,lightHulls:1,navalOptics:1,repairCrane:1,marineDrill:1});
 for(const role of ['capital','air','giant','marine'])expect(roles).toContain(role);
 for(const kind of ['drydock','signalTower','navalAcademy','marineBarracks'])expect(steps).toContain(`Built ${kind}`);
 const pop=matchPopulation(m);expect(pop.used).toBeLessThanOrEqual(pop.cap);const save=decodeSave(encodeSave(m,{camera:{x:0,y:0},building:null}));expect(save.ok,save.ok?'':save.error).toBe(true);
},30000);

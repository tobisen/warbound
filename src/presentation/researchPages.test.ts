import {expect,it} from 'vitest';
import {researchHost} from './researchPages';
import {actionPanel,actionIds} from './actionPanel';
import {createMatch} from '../gameplay/match';
import {roleResearchKinds} from '../config/roleResearch';
it('shows research only at its host, including prerequisite-locked options, without pages',()=>{
 for(const faction of ['crown','clans','elves','dwarves','goblins'] as const){const m=createMatch();m.factions!.player=faction;
 for(const host of ['base','forge','academy','stable','aviary','siegeWorks','navalFoundry','producer-1','harbor'] as const){
  const model=actionPanel(m,host,true);
  for(const kind of ['attack','defense','workerTools',...roleResearchKinds] as const)if(model[`research-${kind}`].visible)expect(researchHost(kind)).toBe(host);
  expect(actionIds.filter(id=>id.startsWith('research-')&&model[id].visible).length).toBeLessThanOrEqual(8);
 }
 m.research!.attack=1;expect(actionPanel(m,'forge',true)['research-attack'].visible).toBe(false);expect(actionPanel(m,'academy',true)['research-attack']).toMatchObject({visible:true});
 }
});

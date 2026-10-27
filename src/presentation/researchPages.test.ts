import {expect,it} from 'vitest';
import {researchPage,researchPageSize} from './researchPages';
import {actionPanel,actionIds,actionGroup} from './actionPanel';
import {createMatch} from '../gameplay/match';
it('keeps every main-building research option reachable with no page exceeding two four-column rows',()=>{
 for(const faction of ['crown','clans','elves','dwarves','goblins'] as const){
  const m=createMatch();m.factions!.player=faction;
  const model=actionPanel(m,'base',true),options=actionIds.filter(id=>actionGroup(id)==='Research'&&model[id].visible);
  const reached=[];for(let page=0;page<researchPage(options,0).pages;page++){
   const result=researchPage(options,page);expect(Math.ceil(result.options.length/4)).toBeLessThanOrEqual(2);reached.push(...result.options);
  }
  expect(reached).toEqual(options);expect(new Set(reached).size).toBe(options.length);
 }
});
it('clamps a page after selection changes, including empty and future larger rosters',()=>{
 expect(researchPage([],9)).toEqual({current:0,pages:1,options:[]});
 const options=Array.from({length:33},(_,i)=>i);
 expect(researchPage(options,-1).current).toBe(0);
 expect(researchPage(options,99)).toEqual({current:4,pages:5,options:[32]});
 expect(researchPage(options,1).options).toHaveLength(researchPageSize);
});

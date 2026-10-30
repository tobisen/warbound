import {expect,it} from 'vitest';
import {territoryFixture,territorySnapshot,territoryLedger,updateMatch} from './testHelpers/aiTerritory';
import {strategyFor} from './enemyStrategy';
import {expansionSpacing} from './enemyExpansionSites';
import {encodeSave,decodeSave} from './save';
for(const difficulty of ['normal','easy','beginner'] as const)it(`${difficulty} explores and pays for three geographically separate Plains128 bases within 25 minutes`,()=>{
 let m=territoryFixture(difficulty),thirdBase:number|undefined,firstScout:number|undefined;
 const goals=new Set<string>(),earlyNodes=m.enemyKnowledge!.nodes.length;
 // Only damage to persistent passive human targets is redirected. Every AI unit,
 // resource delivery, sight observation, route and building uses ordinary gameplay.
 for(let t=0;t<1500;t++){
  m=updateMatch(m,1,{side:'enemy'});
  const scout=strategyFor(m)?.recon;
  if(scout?.ids.length){firstScout??=t+1;if(scout.goal)goals.add(JSON.stringify(scout.goal));}
  const bases=m.combat.enemies.filter(e=>e.hp>0&&(e.kind==='base'||e.buildingType==='outpost')&&(!e.construction||e.construction.remainingSeconds===0));
  if(bases.length>=3)thirdBase??=t+1;
 }
 const result=territorySnapshot(m),bases=result.bases.filter(b=>b.remaining===0);
 expect(result.seconds).toBe(1500);expect(result.outcome).toBe('playing');
 expect(firstScout).toBeLessThanOrEqual(180);expect(goals.size).toBeGreaterThan(10);
 expect(result.knownNodes).toBeGreaterThan(earlyNodes);expect(result.knownMines.length).toBeGreaterThanOrEqual(4);
 expect(result.explored/result.tiles).toBeGreaterThan(.3);expect(thirdBase).toBeLessThanOrEqual(1500);expect(bases.length).toBeGreaterThanOrEqual(3);
 for(let i=0;i<bases.length;i++)for(const b of bases.slice(i+1))expect(Math.hypot(b.position.x-bases[i].position.x,b.position.y-bases[i].position.y)).toBeGreaterThanOrEqual(expansionSpacing(m));
 for(const error of Object.values(territoryLedger(m)))expect(error).toBeCloseTo(0,6);
 const loaded=decodeSave(encodeSave(m,{camera:{x:0,y:0},building:null}));expect(loaded.ok,loaded.ok?'':loaded.error).toBe(true);
 expect(m.enemyProduction!.spent!.wood).toBeGreaterThanOrEqual(160);expect(m.enemyProduction!.wood).toBeGreaterThanOrEqual(0);expect(m.enemyProduction!.gold).toBeGreaterThanOrEqual(0);
},300000);

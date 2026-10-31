import {it,expect} from 'vitest';
import {createMatch,updateMatch} from './match';
import {encodeSave,decodeSave} from './save';
import {colonyDestination} from './enemyColonies';
import {cleanDestroyed} from './destruction';
import {factionIds} from '../config/factions';
import {islandNavalPlan} from './islandNavalPlan';
import {planDomainRoute} from './terrainNavigation';
const view={camera:{x:0,y:0},building:null};
it.each(['trident','farreach','crownsea'] as const)('%s economic AI carries a paid worker, settles and works a remote outpost; resumes each phase',map=>{
 let m=createMatch('skirmish','normal',{player:'crown',enemy:'clans'},map);m.aiProfile='economic';
 expect(colonyDestination(m)).toBeDefined();const target=colonyDestination(m)!,plan=islandNavalPlan(m,target),home=islandNavalPlan(m);
 expect(plan.harbor).toEqual(home.harbor);expect(planDomainRoute(m.map,'water',plan.waterStart,plan.waterGoal,16).status).not.toBe('blocked');
 const phases=new Set<string>();let outpost=false,worked=false,finishedAt=Infinity;
 for(let i=0;i<1600&&m.outcome==='playing';i++){
  m=updateMatch(m,.5);const colony=m.enemyNaval?.colony;
  if(colony&&!phases.has(colony.stage)){phases.add(colony.stage);const loaded=decodeSave(encodeSave(m,view));expect(loaded.ok,JSON.stringify(loaded.ok?{}:loaded)).toBe(true);if(loaded.ok)m=loaded.match;}
  if(m.combat.enemies.some(e=>e.buildingType==='outpost'&&e.position.y>1200&&e.construction?.remainingSeconds===0)){outpost=true;finishedAt=Math.min(finishedAt,m.waves.elapsedSeconds);}
  worked=m.combat.enemies.some(e=>e.work&&e.position.y>1200&&e.work.cargo>0);
  if(outpost&&worked&&m.waves.elapsedSeconds>finishedAt+10)break;
 }
 expect([...phases]).toEqual(expect.arrayContaining(['loading','sailing','settling']));expect(outpost).toBe(true);expect(worked).toBe(true);expect(m.enemyProduction!.spent!.wood).toBeGreaterThan(200);expect(decodeSave(encodeSave(m,view)).ok).toBe(true);
},180000);
it.each(factionIds)('%s fields paid escorts and researches marine technology before the general late-tech chain',enemy=>{
 let m=createMatch('skirmish','normal',{player:'crown',enemy},'trident');m.aiProfile='fleet';
 for(let i=0;i<1200;i++){m=updateMatch(m,.5);if(m.enemyPolicy?.research.lightHulls)break;}
 expect(m.enemyPolicy?.research.lightHulls).toBe(1);expect(m.waves.elapsedSeconds).toBeLessThan(600);expect(m.combat.enemies.filter(e=>e.kind==='ship').length).toBeGreaterThan(1);

},180000);
it('a sunk colonist carrier loses its real passengers, clears the assignment and remains saveable',()=>{
 let m=createMatch('skirmish','normal',{player:'crown',enemy:'clans'},'trident');m.aiProfile='economic';
 for(let i=0;i<1400&&m.enemyNaval?.colony?.stage!=='sailing';i++)m=updateMatch(m,.5);
 expect(m.enemyNaval?.passengers.some(e=>e.kind==='worker')).toBe(true);const bad=JSON.parse(encodeSave(m,view));bad.state.enemyNaval.colony.target={x:32,y:32};expect(decodeSave(JSON.stringify(bad)).ok).toBe(false);const ids=m.enemyNaval!.passengers.map(e=>e.id);m.combat.enemies.find(e=>e.kind==='ship'&&!e.navalRole)!.hp=0;m=cleanDestroyed(m);
 expect(m.enemyNaval!.passengers).toHaveLength(0);expect(m.enemyNaval!.colony).toBeUndefined();expect(m.combat.enemies.some(e=>ids.includes(e.id))).toBe(false);expect(decodeSave(encodeSave(m,view)).ok).toBe(true);
},180000);

it.each([['defensive','armoredHulls'],['siege','coastalGunnery']] as const)('%s doctrine pays for its own early naval priority', (profile,tech)=>{
 let m=createMatch('skirmish','normal',{player:'crown',enemy:'dwarves'},'trident');m.aiProfile=profile;
 for(let i=0;i<1200&&!m.enemyPolicy?.research[tech];i++)m=updateMatch(m,.5);
 expect(m.enemyPolicy?.research[tech]).toBe(1);if(profile==='defensive')expect(m.enemyPolicy?.research.lightHulls??0).toBe(0);
},180000);

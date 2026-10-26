import {expect,it} from 'vitest';
import {skirmishAISettings,skirmishAttackSeconds,skirmishPacing} from '../config/skirmishPacing';
import {difficultyProfiles,type Difficulty} from '../config/difficulty';
import {aiProfiles,profileAISettings,type AIProfileId} from '../config/aiProfiles';
import {createMatch} from './match';
import {createEnemyAI,updateEnemyAI} from './enemyAI';
import {strategicAISettings} from './enemyStrategy';

for(const difficulty of Object.keys(skirmishPacing) as Difficulty[])it(`gates ${difficulty} planned attacks, then permits regrouped pressure across personalities and maps`,()=>{
 for(const profile of Object.keys(aiProfiles) as AIProfileId[])for(const map of ['arena','islands','plains96'] as const){
  const m=createMatch('skirmish',difficulty,undefined,map,1,profile),cfg=skirmishPacing[difficulty];
  const settings=strategicAISettings(m,profileAISettings(difficultyProfiles[difficulty].ai,profile));
  expect(settings.firstAttackSeconds).toBeGreaterThanOrEqual(cfg.min);expect(settings.firstAttackSeconds).toBeLessThanOrEqual(cfg.max);
  const world={width:1280,height:960,tileSize:32,revision:0,obstacles:[]},members=['enemy-produced-1','enemy-produced-2','enemy-produced-3'];
  const combat={baseHP:100,enemies:members.map((id,i)=>({id,kind:'unit' as const,role:'soldier' as const,hp:60,position:{x:896+i*32,y:320},order:{kind:'idle' as const}}))};
  const groups=[{id:'enemy-group-1',status:'ready' as const,members,destinations:Object.fromEntries(combat.enemies.map(e=>[e.id,e.position])),startedAt:0}];
  const initial={...createEnemyAI(),elapsedSeconds:settings.firstAttackSeconds-1,groups};
  const tuned={...settings,reserveCount:0,minimumAttackSize:1,groupSize:3};
  const before=updateEnemyAI(initial,combat,world,{x:400,y:400},.9,[],tuned);
  expect(before.state.lastDispatchSeconds).toBeNull();expect(before.state.groups[0].status).toBe('ready');
  const first=updateEnemyAI(before.state,before.combat,world,{x:400,y:400},.1,[],tuned);
  expect(first.state.lastDispatchSeconds).toBeCloseTo(skirmishAttackSeconds(m));
  const retry={...first.state,groups:structuredClone(groups)};
  const waiting=updateEnemyAI(retry,first.combat,world,{x:400,y:400},settings.dispatchGapSeconds-1,[],tuned);
  expect(waiting.state.lastDispatchSeconds).toBe(first.state.lastDispatchSeconds);
  const next=updateEnemyAI(waiting.state,waiting.combat,world,{x:400,y:400},1,[],tuned);
  expect(next.state.lastDispatchSeconds).toBeCloseTo(settings.firstAttackSeconds+settings.dispatchGapSeconds);
 }
});
it('keeps campaign timing intact and allows visible local defense during grace',()=>{
 const m=createMatch('mission-sea','normal'),base=profileAISettings(difficultyProfiles.normal.ai);
 expect(skirmishAISettings(m,base)).toBe(base);
 const world={width:1280,height:960,tileSize:32,revision:0,obstacles:[]};
 const combat={baseHP:100,enemies:[{id:'enemy-base',kind:'base' as const,hp:200,position:{x:900,y:300},footprint:{x:868,y:268,width:64,height:64}},{id:'enemy-produced-1',kind:'unit' as const,role:'soldier' as const,hp:60,position:{x:820,y:300},order:{kind:'idle' as const}}]};
 const skirmish=createMatch('skirmish'),settings=skirmishAISettings(skirmish,base);
 const intruder={id:'unit-8',kind:'soldier' as const,hp:60,owner:'player' as const,position:{x:800,y:300},target:{x:800,y:300},selected:false,cargo:0 as const,order:{kind:'idle' as const}};
 const defense=updateEnemyAI(createEnemyAI(),combat,world,{x:400,y:400},1,[intruder],settings);
 expect(defense.state.threatId).toBe(intruder.id);expect(defense.state.lastDispatchSeconds).toBeNull();expect(defense.combat.enemies[1].order?.kind).toBe('defend');
});

it('does not retreat an intact small Skirmish dispatch just because technology raised the desired group size',()=>{
 const m=createMatch('skirmish'),world={width:1280,height:960,tileSize:32,revision:0,obstacles:[]};
 const member={id:'enemy-produced-1',kind:'unit' as const,role:'soldier' as const,hp:60,position:{x:800,y:320},order:{kind:'attack-move' as const,destination:{x:400,y:400}}};
 const group={id:'enemy-group-1',status:'attack' as const,members:[member.id],destinations:{[member.id]:{x:896,y:320}},startedAt:0,dispatchedAt:600,dispatchedSize:1};
 const initial={...createEnemyAI(),elapsedSeconds:630,groups:[group],lastDispatchSeconds:600},settings=skirmishAISettings(m,{...difficultyProfiles.normal.ai,groupSize:5,reserveCount:0,regroup:true});
 const intact=updateEnemyAI(initial,{baseHP:100,enemies:[member]},world,{x:400,y:400},1,[],settings);expect(intact.state.groups[0].status).toBe('attack');
 const depleted=updateEnemyAI({...initial,groups:[{...group,dispatchedSize:4}]},{baseHP:100,enemies:[member]},world,{x:400,y:400},1,[],settings);expect(depleted.state.groups[0].status).not.toBe('attack');
});

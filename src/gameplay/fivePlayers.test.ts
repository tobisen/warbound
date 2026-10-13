import {it,expect} from 'vitest';
import {matchPlayers,validatePlayerStarts,canHarm,playerStart} from './players';
import {createMatch,updateMatch} from './match';
import {encodeSave,decodeSave} from './save';
import {projectMultiplePlayers} from './multiplePlayers';
import {teamOutcome,playerEliminated} from './teamResults';
import {minimapData} from '../presentation/minimap';
import {matchStats} from './matchStats';
import {resultScore,validHighscore} from './highscores';
it.each([2,3,4,5])('runs %i participants with independent paid AI, fog, Save and restart',count=>{
 const roster=matchPlayers(undefined,'balanced',count);roster.forEach((p,i)=>{if(i)p.difficulty=i%2?'beginner':'hard';});
 expect(validatePlayerStarts('plains128',roster,'woodlands-connected')).toBe(true);
 let m=createMatch('skirmish','normal',undefined,'plains128',1,'balanced',count>2?roster:undefined);
 if(count===2){expect(m.multiplePlayers).toBeUndefined();m=updateMatch(m,5);expect(m.enemyProduction!.spent!.wood).toBeGreaterThan(0);}else{
 expect(m.multiplePlayers!.ai).toHaveLength(count-1);expect(new Set(m.combat.enemies.map(e=>e.id)).size).toBe(m.combat.enemies.length);
 for(let i=0;i<120;i++)m=updateMatch(m,.5);
 for(const bot of m.multiplePlayers!.ai){expect(bot.state.enemyProduction!.spent!.wood).toBeGreaterThan(0);expect(bot.state.combat.enemies.some(e=>e.kind==='worker')).toBe(true);expect(bot.vision.visible.some(Boolean)).toBe(true);expect(bot.state.difficulty).toBe(roster.find(p=>p.id===bot.id)!.difficulty);}
 const data=minimapData(m);expect(new Set(data.markers.filter(p=>p.id.endsWith('enemy-base')).map(p=>p.color)).size).toBe(count-1);
 }
 const loaded=decodeSave(encodeSave(m,{camera:{x:0,y:0},building:null}));expect(loaded.ok,loaded.ok?'':loaded.error).toBe(true);if(!loaded.ok)return;expect(loaded.match.multiplePlayers?.roster).toEqual(m.multiplePlayers?.roster);
 const restarted=createMatch('skirmish','normal',undefined,'plains128',1,'balanced',count>2?roster:undefined);expect(restarted.waves.elapsedSeconds).toBe(0);expect(restarted.multiplePlayers?.ai.length).toBe(count>2?count-1:undefined);
},60000);
it('five owners preserve ally vision, elimination, victory/defeat and highscore ownership',()=>{
 const roster=matchPlayers(undefined,undefined,5);roster[4].teamId=1;
 let m=createMatch('skirmish','normal',undefined,'plains128',1,'balanced',roster);
 expect(canHarm('player','ai-4',roster)).toBe(false);expect(canHarm('ai-3','ai-4',roster)).toBe(true);
 const ally=playerStart('plains128','ai-4',m.map.design),enemy=playerStart('plains128','ai-3',m.map.design);const tile=(p:{x:number;y:number})=>Math.floor(p.y/32)*m.fog!.columns+Math.floor(p.x/32);
 expect(m.fog!.teams.player.visible[tile(ally)]).toBe(true);expect(m.fog!.teams.player.visible[tile(enemy)]).toBe(false);
 for(const bot of m.multiplePlayers!.ai.filter(b=>b.id!=='ai-4'))bot.state.combat.enemies.find(e=>e.kind==='base')!.hp=0;
 m=projectMultiplePlayers(m);expect(teamOutcome(m)).toBe('victory');m.outcome='victory';m.matchId='00000000-0000-4000-8000-000000000001';expect(validHighscore(resultScore(m))).toBe(true);expect(Object.keys(matchStats(m).players!)).toHaveLength(5);
 m.combat.baseHP=0;expect(playerEliminated(m,'player')).toBe(true);expect(teamOutcome(m)).toBe('victory');m.multiplePlayers!.ai.find(b=>b.id==='ai-4')!.state.combat.enemies.find(e=>e.kind==='base')!.hp=0;expect(teamOutcome(m)).toBe('defeat');
},60000);

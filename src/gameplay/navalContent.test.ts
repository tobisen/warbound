import {expect,it} from 'vitest';
import {seaBattle} from './testHelpers/seaBattle';
import {createMatch,type MatchState} from './match';
import {factions} from '../config/factions';
import {navalRoleAvailable} from '../config/navy';
import {placeBuilding,beginPlacement,placementObstacles} from './placement';
import {technologyFor} from './productionPrerequisites';
import {updateConstruction} from './construction';
import {canResearch,startResearch,updateResearch} from './research';
import {canTrainShip,trainShip,updateNavy,type Ship} from './navy';
import {prepareNavalCombat,prepareEnemySubmarines} from './navalCombat';
import {prepareEnemyNaval,updateEnemyNaval} from './enemyNaval';
import {cleanDestroyed} from './destruction';
import {decodeSave,encodeSave} from './save';
import {actionPanel} from '../presentation/actionPanel';

const view={camera:{x:0,y:0},building:null};
function funded(){const m=seaBattle();m.gathering.wood=500;m.gathering.goldBalance=500;m.fog!.revealed=true;m.fog!.teams.player.visible.fill(true);m.fog!.teams.player.explored.fill(true);m.gathering.units[0].selected=true;return m;}
function foundry(m:MatchState){
 const result=placeBuilding(beginPlacement(m.placement,'navalFoundry'),{x:576,y:640},m.gathering.wood,placementObstacles(m.gathering),{map:m.map,gathering:m.gathering,enemies:m.combat.enemies,technology:technologyFor(m,'player')});
 expect(result.gathering).toBeDefined();return {...m,placement:result.placement,gathering:result.gathering!,map:result.map!};
}
it('pays for land workshop, requires completed prerequisites, researches once, then trains a real paid Tide Runner',()=>{
 let m=funded();expect(canResearch(m.gathering,m.research!,m.placement,'navalLogistics')).toBe(false);expect(canTrainShip(m,'cutter')).toBe(false);
 const before={wood:m.gathering.wood,gold:m.gathering.goldBalance!};m=foundry(m);expect(m.gathering.wood).toBe(before.wood-95);expect(m.gathering.goldBalance).toBe(before.gold-55);
 const id=m.placement.producers![0].id;expect(m.gathering.units[0].order).toEqual({kind:'build',buildingId:id});expect(m.placement.producers![0].construction.remainingSeconds).toBe(18);
 expect(canResearch(m.gathering,m.research!,m.placement,'navalLogistics')).toBe(false);
 const constructed=updateConstruction(m.gathering,m.placement,m.map,40);m={...m,...constructed};expect(m.placement.producers![0].construction.remainingSeconds).toBe(0);
 const started=startResearch(m.gathering,m.research!,m.placement,'navalLogistics');m={...m,...started};expect(m.gathering.wood).toBe(before.wood-195);expect(m.gathering.goldBalance).toBe(before.gold-130);
 expect(startResearch(m.gathering,m.research!,m.placement,'navalLogistics').gathering).toBe(m.gathering);
 const active=decodeSave(encodeSave(m,view));expect(active.ok,active.ok?'':active.error).toBe(true);
 m.research=updateResearch(m.research!,m.placement,30);expect(m.research.navalLogistics).toBe(1);
 const paid=trainShip(m,'cutter');expect(paid.gathering.wood).toBe(m.gathering.wood-55);expect(paid.gathering.goldBalance).toBe(m.gathering.goldBalance!-25);expect(paid.navy!.production.queue![0].kind).toBe('cutter');
 const finished=updateNavy(paid,12);expect(finished.navy!.ships.at(-1)).toMatchObject({role:'cutter',hp:65});expect(finished.navy!.ships.length).toBe(m.navy!.ships.length+1);
 expect(actionPanel(finished,'harbor',true)['train-bombard'].visible).toBe(false);expect(actionPanel(finished,id,true)['research-navalLogistics'].visible).toBe(true);
 const saved=decodeSave(encodeSave(finished,view));expect(saved.ok,saved.ok?'':saved.error).toBe(true);
});
it('a destroyed workshop cancels dependent research and frees its collision footprint',()=>{
 let m=foundry(funded());const p=m.placement.producers![0];p.construction={remainingSeconds:0,builderId:null};m.gathering.units[0].order={kind:'idle'};
 const started=startResearch(m.gathering,m.research!,m.placement,'navalLogistics');m={...m,...started};p.hp=0;m=cleanDestroyed(m);
 expect(m.research!.job).toBeNull();expect(m.placement.producers).toHaveLength(0);expect(m.map.obstacles.some(o=>o.x===p.footprint.x&&o.y===p.footprint.y)).toBe(false);
});
it('gives the factions distinct hulls, target masks, mobility, supply and actual shot recipes',()=>{
 expect(factions.crown.naval.units.cutter.name).not.toBe(factions.crown.naval.units.warship.name);
 expect(factions.crown.naval.units.cutter.speed).toBeGreaterThan(factions.crown.naval.units.warship.speed);expect(factions.dwarves.naval.units.bombard.speed).toBeLessThan(factions.dwarves.naval.units.warship.speed);
 for(const faction of Object.keys(factions))expect(navalRoleAvailable(faction,'cutter')).toBe(faction==='crown');
 for(const faction of Object.keys(factions))expect(navalRoleAvailable(faction,'bombard')).toBe(faction==='dwarves');
 for(const [role,faction,allowed]of [['cutter','crown',['ship','air']],['bombard','dwarves',['ship','building']]] as const){
  const recipe=factions[faction].naval.units[role];
  for(const type of ['ship','air','unit','building'] as const){
   const e={id:'enemy-1',kind:type==='air'?'unit' as const:type,role:type==='air'?'air' as const:undefined,hp:500,position:{x:250,y:200},...(type==='building'?{footprint:{x:234,y:184,width:32,height:32}}:{})};
   const s:Ship={id:'ship-1',kind:'ship',role,owner:'player',hp:recipe.hp,selected:false,position:{x:200,y:200},target:{x:200,y:200},order:{kind:'attack',enemyId:e.id}};
   const result=prepareNavalCombat({harbor:null,ships:[s],production:{remainingSeconds:null,nextUnitNumber:2}},[e],.1,undefined,1,1,()=>true,factions[faction].naval.units.warship,faction);
   expect(result.shots.length>0).toBe((allowed as readonly string[]).includes(type));
   if(result.shots.length)expect(result.shots[0].projectile).toMatchObject({navalRole:role,damage:recipe.damage,targets:recipe.targets});
  }
 }
 const m=funded();m.research!.navalLogistics=1;expect(canTrainShip(m,'bombard')).toBe(false);
});
it('lets the AI pay for its faction hull only after research and observes the same supply',()=>{
 const m=seaBattle();m.enemyPolicy!.research.navalLogistics=1;
 // Component funding is explicitly removed from the enemy's finite mine and ledgered.
 m.gathering.extraNodes!.find(n=>n.id==='gold-2')!.remaining-=100;m.enemyProduction!.gold+=100;m.enemyProduction!.extracted!.gold+=100;
 m.combat.enemies=m.combat.enemies.filter(e=>e.navalRole!=='bombard');
 const before=m.enemyProduction!.wood,started=updateEnemyNaval(m,.1);expect(started.enemyNaval!.production.queue?.[0].kind).toBe('bombard');expect(started.enemyProduction!.wood).toBe(before-110);
 const completed=updateEnemyNaval(started,28);expect(completed.combat.enemies.some(e=>e.navalRole==='bombard')).toBe(true);
 const saved=decodeSave(encodeSave(completed,view));expect(saved.ok,saved.ok?'':saved.error).toBe(true);
});
it('migrates genuine previous saves without changing economy and rejects new content stamped as v75',()=>{
 const old=createMatch('skirmish'),doc=JSON.parse(encodeSave(old,view));doc.configVersion='tribute-config-75';const loaded=decodeSave(JSON.stringify(doc));expect(loaded.ok,loaded.ok?'':loaded.error).toBe(true);if(loaded.ok)expect(loaded.match.gathering.wood).toBe(old.gathering.wood);
 const fresh=JSON.parse(encodeSave(seaBattle(),view));fresh.configVersion='tribute-config-75';expect(decodeSave(JSON.stringify(fresh)).ok).toBe(false);
});

it('produces a paid Dwarf Bombard and keeps the Human escort unavailable',()=>{
 let m=funded();m.campaignMission=undefined;m.campaignRun=undefined;m.gathering.campaignContent=undefined;m.factions={player:'dwarves',enemy:'dwarves'};m.gathering.faction='dwarves';m.navy!.ships=[];m.navy!.production={remainingSeconds:null,nextUnitNumber:1};m.research!.navalLogistics=1;
 expect(canTrainShip(m,'cutter')).toBe(false);expect(canTrainShip(m,'bombard')).toBe(true);
 const paid=trainShip(m,'bombard');expect(paid.gathering.wood).toBe(390);expect(paid.gathering.goldBalance).toBe(425);expect(paid.navy!.production.queue![0]).toMatchObject({kind:'bombard',supply:4,durationSeconds:28});
 const built=updateNavy(paid,28);expect(built.navy!.ships[0]).toMatchObject({role:'bombard',hp:160});
 const attack=prepareEnemySubmarines([{id:'enemy-ship-2',owner:'enemy',kind:'ship',navalRole:'bombard',hp:160,position:{x:200,y:200},order:{kind:'idle'}}],[{id:'base',kind:'base',owner:'player',hp:500,footprint:{x:300,y:180,width:64,height:64}}],.1,undefined,1,'dwarves',1,()=>true);
 expect(attack.shots[0].projectile).toMatchObject({owner:'enemy',navalRole:'bombard',damage:38,damageByDomain:{building:1.8},marine:true});
});

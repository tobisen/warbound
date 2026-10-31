import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from '../presentations/agentic-coding/node_modules/playwright-core/index.mjs';
const out='artifacts/island-fleets';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),report=[];
try{
 const p=await browser.newPage({viewport:{width:1280,height:720}}),errors=[],warnings=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='warning'||m.type()==='error')warnings.push(m.text());});
 await p.route('**/src/main.ts*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__gameCheck=new Phaser.Game({')});});
 await p.goto('http://127.0.0.1:5195',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__gameCheck?.scene.keys.BootScene?.session&&document.querySelector('#map-select option[value=\"twinwake\"]'));await p.locator('#menu-settings').click();await p.selectOption('#display-resolution','1280x720');await p.selectOption('#display-mode','native');await p.locator('#menu-back').click();await p.locator('#menu-skirmish').click();await p.selectOption('#map-select','twinwake');await p.locator('#start-match').click();await p.waitForFunction(()=>window.__gameCheck?.scene.keys.BootScene?.gathering&&!window.__gameCheck.scene.keys.BootScene.restartPending);
 for(const faction of ['crown','clans','elves','dwarves','goblins']){
  const data=await p.evaluate(async faction=>{const s=window.__gameCheck.scene.keys.BootScene,{createMatch,updateMatch}=await import('/src/gameplay/match.ts'),{factions}=await import('/src/config/factions.ts'),{fleetBuildings,fleetShips,marineRoles}=await import('/src/config/islandFleets.ts'),{navalRoleAvailable}=await import('/src/config/navy.ts'),{trainShip,updateNavy}=await import('/src/gameplay/navy.ts'),{trainExtraProducer,updateExtraProducers}=await import('/src/gameplay/extraProducers.ts'),{replaceObstacles}=await import('/src/gameplay/map.ts');
   // Explicit rendering/production fixture: completed prerequisites, paid normal queues.
   s.update=()=>{};s.sys.sceneUpdate=()=>{};let m=createMatch('skirmish','normal',{player:faction,enemy:'clans'},'twinwake'),f=factions[faction];m.gathering.wood=1000;m.gathering.goldBalance=1000;m.fog=undefined;
   const site=(id,kind,x,y)=>({id,kind,owner:'player',hp:f.buildings[kind].hp,footprint:{x,y,width:64,height:64},construction:{remainingSeconds:0,builderId:null},production:{remainingSeconds:null,nextUnitNumber:4}});
   m.placement={...m.placement,barracks:{x:288,y:544,width:64,height:64},barracksHP:f.buildings.barracks.hp,construction:{remainingSeconds:0,builderId:null},forge:site('forge','forge',416,544),farms:[site('farm-1','farm',288,416)],nextFarmNumber:2,producers:fleetBuildings.map((k,i)=>site(`producer-${i+1}`,k,288+i*96,672)),nextProducerNumber:5};
   const harbor={owner:'player',hp:f.naval.harbor.hp,footprint:{x:256,y:96,width:64,height:64},construction:{remainingSeconds:0,builderId:null}};m.navy={harbor,ships:[],production:{remainingSeconds:null,nextUnitNumber:1}};
   m.map=replaceObstacles(m.map,[...m.map.obstacles,m.placement.barracks,m.placement.forge.footprint,...m.placement.farms.map(b=>b.footprint),...m.placement.producers.map(b=>b.footprint),harbor.footprint]);
   const ship=fleetShips.find(k=>navalRoleAvailable(faction,k)),unit=marineRoles.find(k=>f.roster.includes(k));m=trainShip(m,ship);m=trainExtraProducer(m,'producer-4',unit);
   for(let i=0;i<220;i++){m=updateNavy(m,.2);m=updateExtraProducers(m,.2);}const u=m.gathering.units.find(u=>u.archetype===unit),v=m.navy.ships.find(v=>v.role===ship);if(!u||!v)return {error:'Queue did not spawn',faction,ship,unit,navy:m.navy,producers:m.placement.producers};
   m.fog=(await import('/src/gameplay/matchFog.ts')).matchFog(m);m.navy.ships=m.navy.ships.map(v=>({...v,selected:true}));m.gathering.units=m.gathering.units.map(u=>({...u,selected:false}));s.applyMatch(m);s.selectedBuilding=null;s.cameras.main.setZoom(1);s.cameras.main.centerOn(v.position.x,v.position.y);s.syncVisuals();return {faction,ship,unit,shipPosition:v.position,unitPosition:u.position};
  },faction);assert(!data.error,JSON.stringify(data));
  await p.screenshot({path:`${out}/ship-${faction}.png`});
  await p.evaluate(pos=>{const s=window.__gameCheck.scene.keys.BootScene;s.navy.ships=s.navy.ships.map(v=>({...v,selected:false}));s.gathering.units=s.gathering.units.map(u=>({...u,selected:u.kind==='soldier'}));s.cameras.main.centerOn(pos.x,pos.y);s.syncVisuals();},data.unitPosition);
  await p.screenshot({path:`${out}/infantry-${faction}.png`});report.push(data);
 }
 assert.deepEqual(errors,[]);assert.deepEqual(warnings,[]);await writeFile(`${out}/art-browser.json`,JSON.stringify({report,errors,warnings},null,2));await p.close();
 for(const map of ['twinwake','trident','crownsea','farreach']){
  const p=await browser.newPage({viewport:{width:1280,height:720}});await p.route('**/src/main.ts*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__gameCheck=new Phaser.Game({')});});
  await p.goto('http://127.0.0.1:5195',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__gameCheck?.scene.keys.BootScene?.session&&document.querySelector('#map-select option[value=\"twinwake\"]'));await p.locator('#menu-settings').click();await p.selectOption('#display-resolution','1280x720');await p.selectOption('#display-mode','native');await p.locator('#menu-back').click();await p.locator('#menu-skirmish').click();await p.selectOption('#map-select',map);await p.locator('#start-match').click();await p.waitForFunction(()=>window.__gameCheck?.scene.keys.BootScene?.gathering&&!window.__gameCheck.scene.keys.BootScene.restartPending);
  await p.evaluate(async()=>{const s=window.__gameCheck.scene.keys.BootScene,{applyCheat}=await import('/src/gameplay/cheats.ts');s.update=()=>{};s.sys.sceneUpdate=()=>{};s.applyMatch(applyCheat(s.currentMatch(),'foggoffnow'));s.cameras.main.removeBounds();s.cameras.main.setOrigin(0,0);s.cameras.main.setZoom(Math.min(1100/s.map.width,440/s.map.height));s.cameras.main.setScroll(0,0);s.syncVisuals();});await p.screenshot({path:`${out}/map-${map}.png`});await p.close();
 }
 console.log('PASS: all five faction ships/infantry and four map overviews');
}finally{await browser.close();}

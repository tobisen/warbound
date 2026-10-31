import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from '../presentations/agentic-coding/node_modules/playwright-core/index.mjs';
const out='artifacts/island-fleets';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),results=[];
try{for(const width of [800,1280]){
 const height=width===800?600:720,p=await browser.newPage({viewport:{width,height}}),errors=[],warnings=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='warning'||m.type()==='error')warnings.push(m.text());});
 await p.route('**/src/main.ts*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__gameCheck=new Phaser.Game({')});});
 await p.goto('http://127.0.0.1:5195',{waitUntil:'domcontentloaded'});
 await p.locator('#menu-settings').click();await p.selectOption('#display-resolution',`${width}x${height}`);await p.selectOption('#display-mode','native');await p.locator('#menu-back').click();
 await p.locator('#menu-skirmish').click();
 const maps=await p.locator('#map-select option').evaluateAll(nodes=>nodes.map(n=>({value:n.value,text:n.textContent})));
 for(const id of ['twinwake','trident','crownsea','farreach'])assert(maps.some(m=>m.value===id),id);
 await p.selectOption('#map-select','twinwake');await p.locator('#start-match').click();await p.waitForFunction(()=>window.__gameCheck?.scene.keys.BootScene?.gathering&&!window.__gameCheck.scene.keys.BootScene.restartPending);
 await p.screenshot({path:`${out}/start-${width}.png`});
 const state=await p.evaluate(async()=>{const s=window.__gameCheck.scene.keys.BootScene,{factions}=await import('/src/config/factions.ts'),{beginPlacement,placeBuilding}=await import('/src/gameplay/placement.ts'),{technologyFor}=await import('/src/gameplay/productionPrerequisites.ts'),{updateMatch}=await import('/src/gameplay/match.ts'),{encodeSave,decodeSave}=await import('/src/gameplay/save.ts');
 s.update=()=>{};s.sys.sceneUpdate=()=>{};let m=s.currentMatch();m.gathering.wood=1000;m.gathering.goldBalance=1000;
 // Explicit funded component fixture; real placement, costs, worker construction and queue are exercised below.
 m.fog=undefined;m.gathering.units=m.gathering.units.map((u,i)=>({...u,selected:i===0}));
 const placed=[];for(const [i,kind]of ['barracks','forge','drydock','signalTower','navalAcademy','marineBarracks'].entries()){
  const site={x:288+(i%3)*128,y:544+Math.floor(i/3)*128};const result=placeBuilding(beginPlacement(m.placement,kind),site,m.gathering.wood,[],{technology:technologyFor(m,'player'),map:m.map,gathering:m.gathering,enemies:m.combat.enemies});
  if(!result.gathering)return {error:`placement ${kind}`,placed};m={...m,placement:result.placement,map:result.map,gathering:result.gathering};
  for(let tick=0;tick<200;tick++){m=updateMatch(m,.2);const b=kind==='barracks'?m.placement.construction:kind==='forge'?m.placement.forge.construction:m.placement.producers.find(b=>b.kind===kind).construction;if(b.remainingSeconds===0)break;}
  m.fog=undefined;placed.push(kind);
 }
 m.fog=(await import('/src/gameplay/matchFog.ts')).matchFog(m);m.gathering.units=m.gathering.units.map(u=>({...u,selected:false}));s.applyMatch(m);s.selectedBuilding='producer-4';s.cameras.main.centerOn(416,640);s.syncVisuals();return {placed,save:(()=>{const d=decodeSave(encodeSave(m,{camera:{x:0,y:0},building:null}));return {ok:d.ok,error:d.error};})(),producers:m.placement.producers.map(b=>({id:b.id,kind:b.kind,remaining:b.construction.remainingSeconds}))};});
 await writeFile(`${out}/browser-fixture-${width}.json`,JSON.stringify(state,null,2));assert(!state.error,JSON.stringify(state));assert(state.save.ok,JSON.stringify(state.save));
 await p.screenshot({path:`${out}/buildings-${width}.png`});
 await p.locator('#train-marine').click();
 const marine=await p.evaluate(async()=>{const s=window.__gameCheck.scene.keys.BootScene,{updateMatch}=await import('/src/gameplay/match.ts');let m=s.currentMatch();const queue=m.placement.producers.find(b=>b.kind==='marineBarracks').production.queue;for(let i=0;i<60;i++)m=updateMatch(m,.2);const u=m.gathering.units.find(u=>u.archetype==='marine');if(!u)return {queue,error:'No marine spawned'};m.gathering.units=m.gathering.units.map(v=>({...v,selected:v.id===u.id}));s.applyMatch(m);s.selectedBuilding=null;s.syncVisuals();return {queue,unit:u};});assert(!marine.error,JSON.stringify(marine));assert.equal(marine.queue[0].kind,'marine');
 await p.screenshot({path:`${out}/marine-${width}.png`});
 await p.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;s.gathering.units=s.gathering.units.map(u=>({...u,selected:false}));s.selectedBuilding='producer-3';s.syncVisuals();});
 await p.locator('#research-lightHulls').click();
 const tech=await p.evaluate(async()=>{const s=window.__gameCheck.scene.keys.BootScene,{updateMatch}=await import('/src/gameplay/match.ts');let m=s.currentMatch();const job=m.research.job;for(let i=0;i<125;i++)m=updateMatch(m,.2);s.applyMatch(m);s.syncVisuals();return {job,research:m.research};});assert.equal(tech.job.kind,'lightHulls');assert.equal(tech.research.lightHulls,1);assert(await p.locator('#research-armoredHulls').isDisabled());
 await p.screenshot({path:`${out}/hull-choice-${width}.png`});
 const harbor=await p.evaluate(async()=>{const s=window.__gameCheck.scene.keys.BootScene,{placeHarbor,harborPlacementError}=await import('/src/gameplay/navy.ts'),{coastalFootprint}=await import('/src/gameplay/terrainNavigation.ts'),{updateMatch}=await import('/src/gameplay/match.ts');let m=s.currentMatch();m.fog=undefined;m.gathering.units=m.gathering.units.map((u,i)=>({...u,selected:i===0}));m.placement={...m.placement,active:true,kind:'harbor'};let site;for(let y=96;y<1024&&!site;y+=32)for(let x=64;x<864;x+=32)if(coastalFootprint(m.map,{x,y,width:64,height:64})&&!harborPlacementError(m,{x,y})){site={x,y};break;}if(!site)return {error:'No reachable player harbor'};m=placeHarbor(m,site);for(let i=0;i<200&&m.navy.harbor.construction.remainingSeconds>0;i++)m=updateMatch(m,.2);m.gathering.units=m.gathering.units.map(u=>({...u,selected:false}));s.applyMatch(m);s.selectedBuilding='harbor';s.cameras.main.centerOn(site.x,site.y);s.syncVisuals();return {site,remaining:m.navy.harbor.construction.remainingSeconds};});assert(!harbor.error,JSON.stringify(harbor));assert.equal(harbor.remaining,0);
 await p.locator('#train-tender').click();await p.locator('#train-transport').click();
 const fleet=await p.evaluate(async()=>{const s=window.__gameCheck.scene.keys.BootScene,{updateMatch}=await import('/src/gameplay/match.ts'),{encodeSave,decodeSave}=await import('/src/gameplay/save.ts');let m=s.currentMatch();const queue=m.navy.production.queue;for(let i=0;i<160;i++)m=updateMatch(m,.2);m.navy.ships=m.navy.ships.map(u=>({...u,selected:u.role==='tender'}));s.applyMatch(m);s.selectedBuilding=null;s.cameras.main.centerOn(m.navy.ships[0].position.x,m.navy.ships[0].position.y);s.syncVisuals();const save=decodeSave(encodeSave(m,{camera:{x:0,y:0},building:null}));return {queue,ships:m.navy.ships.map(v=>v.role),save:{ok:save.ok,error:save.error}};});assert.deepEqual(fleet.ships,['tender','transport']);assert(fleet.save.ok,JSON.stringify(fleet.save));
 await p.screenshot({path:`${out}/fleet-${width}.png`});
 await p.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;s.navy.ships=s.navy.ships.map(v=>({...v,selected:false}));s.selectedBuilding='base';s.syncVisuals();});
 const rows=await p.locator('[data-action-group="Research"] button:visible').evaluateAll(nodes=>[...new Set(nodes.filter(n=>n.id.startsWith('research-')||n.id==='upgrade-base').map(n=>Math.round(n.getBoundingClientRect().top)))]);assert(rows.length<=2,JSON.stringify(rows));
 await p.screenshot({path:`${out}/research-${width}.png`});

 assert.deepEqual(errors,[]);assert.deepEqual(warnings.filter(w=>!w.includes('GPU stall')&&!w.includes('deprecated')),[]);
 results.push({width,errors,warnings,producers:state.producers,marine:marine.unit.archetype,research:tech.research,ships:fleet.ships,save:fleet.save,researchRows:rows.length});await p.close();console.log('PASS',width);
 }await writeFile(`${out}/browser.json`,JSON.stringify(results,null,2));
}finally{await browser.close();}

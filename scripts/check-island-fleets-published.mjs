import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from '../presentations/agentic-coding/node_modules/playwright-core/index.mjs';

const url=process.env.W2T_RELEASE_URL??'http://127.0.0.1:5197/warbound/';
const out=process.env.W2T_SCREENSHOTS??'artifacts/island-fleets-publication/local';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const results=[];
try{for(const width of [800,1280]){
 const height=width===800?600:720,p=await browser.newPage({viewport:{width,height}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 // Expose the existing scene in the served bundle; no source modules or gameplay replacements.
 await p.route('**/assets/index-*.js',async r=>{const response=await r.fetch();let body=await response.text();const match=[...body.matchAll(/new ([A-Za-z_$][\w$]*)\.Game\(\{/g)].at(-1);assert(match,'Phaser bootstrap missing');body=body.slice(0,match.index)+'window.__gameCheck='+body.slice(match.index);await r.fulfill({response,body});});
 await p.goto(url,{waitUntil:'networkidle',timeout:60000});
 await p.waitForFunction(()=>!!window.__gameCheck?.scene.keys.BootScene?.gathering);
 const build=await p.locator('#home-release').getAttribute('title');
 if(process.env.W2T_EXPECT_BUILD)assert.equal(build,`Build ${process.env.W2T_EXPECT_BUILD}`);
 await p.locator('#menu-settings').click();await p.selectOption('#display-resolution',`${width}x${height}`);await p.selectOption('#display-mode','native');await p.locator('#menu-back').click();await p.locator('#menu-skirmish').click();
 await p.locator('#skirmish-presets summary').click();
 for(const id of ['trident','crownsea','farreach','twinwake']){await p.locator(`[data-naval-preset="${id}"]`).click();assert.equal(await p.locator('#map-select').inputValue(),id);}
 await p.selectOption('#faction-select','crown');await p.locator('#start-match').click();
 await p.waitForFunction(()=>{const s=window.__gameCheck?.scene.keys.BootScene;return s?.gathering&&!s.restartPending&&s.factions.player==='crown';});
 await p.screenshot({path:`${out}/start-${width}.png`});
 await p.evaluate(()=>{
  const s=window.__gameCheck.scene.keys.BootScene;s.update=()=>{};s.sys.sceneUpdate=()=>{};const m=s.currentMatch();
  m.gathering.wood=1000;m.gathering.goldBalance=1000;
  // Completed buildings are an explicit component fixture, not an economy playthrough.
  const footprint={x:416,y:544,width:64,height:64};
  m.placement.forge={id:'forge',owner:'player',hp:1,footprint,construction:{remainingSeconds:0,builderId:null}};m.map.obstacles.push(footprint);
  m.placement.producers=['drydock','signalTower','navalAcademy','marineBarracks'].map((kind,i)=>({id:`producer-${i+1}`,kind,owner:'player',hp:1,footprint:{x:288+(i%3)*128,y:672+Math.floor(i/3)*128,width:64,height:64},construction:{remainingSeconds:0,builderId:null},production:{remainingSeconds:null,nextUnitNumber:4}}));
  m.placement.nextProducerNumber=5;m.map.obstacles.push(...m.placement.producers.map(b=>b.footprint));
  m.gathering.units=m.gathering.units.map(u=>({...u,selected:false}));s.applyMatch(m);s.selectedBuilding='producer-4';s.cameras.main.centerOn(416,672);s.syncVisuals();
 });
 await p.locator('#train-marine').click();
 const queue=await p.evaluate(()=>window.__gameCheck.scene.keys.BootScene.placement.producers.find(b=>b.kind==='marineBarracks').production.queue);
 assert.equal(queue[0].kind,'marine');
 await p.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;s.selectedBuilding='producer-3';s.syncVisuals();});
 const bounds=await p.locator('#research-lightHulls').boundingBox();assert(bounds&&bounds.x>=0&&bounds.x+bounds.width<=width+1&&bounds.y+bounds.height<=height+1);
 await p.screenshot({path:`${out}/academy-${width}.png`});
 await p.locator('#research-lightHulls').click();
 const paid=await p.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;return {job:s.research.job?.kind,wood:s.gathering.wood,gold:s.gathering.goldBalance};});
 assert.deepEqual(paid,{job:'lightHulls',wood:915,gold:948});
 await p.locator('#match-menu-button').click();await p.locator('#save-match').click();await p.locator('#load-match').click();
 await p.waitForFunction(()=>!window.__gameCheck.scene.keys.BootScene.restartPending);
 const restored=await p.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;return {job:s.research.job?.kind,queue:s.placement.producers.find(b=>b.kind==='marineBarracks').production.queue?.[0]?.kind};});assert.deepEqual(restored,{job:'lightHulls',queue:'marine'});
 assert.deepEqual(errors,[]);results.push({width,build,presets:4,paid,restored,bounds,errors});await p.close();console.log('PASS',width);
 }
 await writeFile(`${out}/browser.json`,JSON.stringify({url,fixture:'Completed funded buildings; real production-bundle presets, paid Marine queue and hull research, native Save/Load. Existing full gameplay tests cover completion and combat.',results},null,2)+'\n');
}finally{await browser.close();}

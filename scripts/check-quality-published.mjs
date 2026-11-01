import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from '../presentations/agentic-coding/node_modules/playwright-core/index.mjs';

const url=process.env.W2T_RELEASE_URL??'http://127.0.0.1:5197/warbound/';
const out=process.env.W2T_SCREENSHOTS??'artifacts/quality-release/published';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),results=[];
try{for(const width of [800,1280])for(const faction of ['crown','goblins','clans','elves','dwarves']){
 const height=width===800?600:720,page=await browser.newPage({viewport:{width,height}}),errors=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&/\/(assets|audio)\//.test(r.url()))failed.push({url:r.url(),status:r.status()});});
 // Expose the existing production scene; no source imports or gameplay replacements.
 await page.route('**/assets/index-*.js',async route=>{const response=await route.fetch();let body=await response.text();const match=[...body.matchAll(/new ([A-Za-z_$][\w$]*)\.Game\(\{/g)].at(-1);assert(match,'Phaser bootstrap missing');body=body.slice(0,match.index)+'window.__gameCheck='+body.slice(match.index);await route.fulfill({response,body});});
 await page.goto(url,{waitUntil:'networkidle',timeout:60000});
 assert.equal(await page.locator('#home-release').innerText(),'v0.9.0');const build=await page.locator('#home-release').getAttribute('title');if(process.env.W2T_EXPECT_BUILD)assert.equal(build,`Build ${process.env.W2T_EXPECT_BUILD}`);
 await page.locator('#menu-settings').click();await page.selectOption('#display-resolution',`${width}x${height}`);await page.selectOption('#display-mode','native');await page.locator('#menu-back').click();await page.locator('#menu-skirmish').click();await page.selectOption('#faction-select',faction);await page.selectOption('#map-select','twinwake');assert.match(await page.locator('#skirmish-water-summary').innerText(),/Sea-focused/);await page.locator('#start-match').click();await page.waitForFunction(()=>!window.__gameCheck.scene.keys.BootScene.restartPending);
 const buildMenu=await page.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;s.gathering.units[0].selected=true;s.selectedBuilding=null;s.syncVisuals();return [...document.querySelectorAll('[data-action-group="Build"] .control:not([hidden])>button')].map(b=>({id:b.id,rect:b.getBoundingClientRect().toJSON()}));});for(const item of buildMenu)assert(item.rect.x>=0&&item.rect.right<=width&&item.rect.bottom<=height,JSON.stringify(item));
 const role={crown:'capital',goblins:'zeppelin',clans:'behemoth'}[faction];
 await page.evaluate(()=>{
  const s=window.__gameCheck.scene.keys.BootScene;s.sys.sceneUpdate=()=>{};s.__tick=Object.getPrototypeOf(s).update.bind(s);s.skipGameplayFrame=false;
  const m=s.currentMatch();m.gathering.wood=4000;m.gathering.goldBalance=4000;m.combat.baseDevelopment={level:3,remainingSeconds:null};m.research={attack:2,defense:2,job:null};
  const building=(id,footprint,production=true)=>({id,owner:'player',hp:1,footprint,construction:{remainingSeconds:0,builderId:null},...(production?{production:{remainingSeconds:null,nextUnitNumber:4}}:{})});
  for(const [i,kind]of ['forge','academy','aviary'].entries()){m.placement[kind]=building(kind,{x:288+i*128,y:544,width:64,height:64},kind!=='forge');m.map.obstacles.push(m.placement[kind].footprint);}
  m.placement.farms=[0,1,2].map(i=>building(`farm-${i+1}`,{x:288+i*128,y:672,width:64,height:64},false));m.placement.nextFarmNumber=4;
  m.placement.producers=['drydock','navalAcademy','navalFoundry'].map((kind,i)=>({...building(`producer-${i+1}`,{x:192,y:544+i*128,width:64,height:64}),kind}));
  m.placement.producers.push({...building('producer-4',{x:608,y:96,width:64,height:64}),kind:'harbor'});m.placement.nextProducerNumber=5;
  m.navy??={harbor:null,ships:[],production:{remainingSeconds:null,nextUnitNumber:1}};
  m.navy.harbor={owner:'player',hp:160,footprint:{x:288,y:96,width:64,height:64},construction:{remainingSeconds:0,builderId:null}};
  m.map.obstacles.push(...m.placement.farms.map(b=>b.footprint),...m.placement.producers.map(b=>b.footprint),m.navy.harbor.footprint);
  m.gathering.units=m.gathering.units.map(u=>({...u,selected:false}));s.applyMatch(m);s.selectedBuilding='academy';s.syncVisuals();
 });
 const research=await page.evaluate(()=>{
  const s=window.__gameCheck.scene.keys.BootScene,report=[];
  for(const host of ['base','forge','academy','producer-2','producer-3']){s.selectedBuilding=host;s.syncVisuals();const items=[...document.querySelectorAll('[data-action-group="Research"] .control:not([hidden])')].map(c=>({id:c.querySelector('button').id,name:c.querySelector('button').dataset.shortLabel,button:c.querySelector('button').getBoundingClientRect().toJSON(),detail:c.querySelector('.research-detail')?.getBoundingClientRect().toJSON(),whiteSpace:getComputedStyle(c.querySelector('button'),'::after').whiteSpace,textOverflow:getComputedStyle(c.querySelector('button'),'::after').textOverflow}));report.push({host,items,rows:new Set(items.map(b=>Math.round(b.button.y))).size});}
  return report;
 });
 assert(!await page.locator('.research-pages').count());for(const host of research){assert(host.rows<=2);for(const item of host.items){assert.equal(item.whiteSpace,'normal');assert.notEqual(item.textOverflow,'ellipsis');assert(!item.name.includes(' · '));assert(item.button.right<=width&&item.button.bottom<=height);if(item.detail)assert(item.detail.bottom<=height);}}
 assert(research.find(r=>r.host==='academy').items.some(r=>r.id==='research-submarineDesign'));assert(!research.find(r=>r.host==='base').items.some(r=>r.id==='research-submarineDesign'));
 await page.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;s.selectedBuilding='producer-2';s.syncVisuals();});await page.locator('#research-lightHulls').click();assert.equal(await page.evaluate(()=>window.__gameCheck.scene.keys.BootScene.research.job?.kind),'lightHulls');await page.screenshot({path:`${out}/${faction}-research-${width}.png`});
 const points=[{x:192,y:32},{x:512,y:32}];
 const worldClick=async(point,button='left')=>{const p=await page.evaluate(point=>{const s=window.__gameCheck.scene.keys.BootScene,c=s.cameras.main,r=s.game.canvas.getBoundingClientRect();return {x:r.left+(point.x-c.worldView.x)*c.zoom*r.width/s.game.canvas.width,y:r.top+(point.y-c.worldView.y)*c.zoom*r.height/s.game.canvas.height};},point);await page.mouse.click(p.x,p.y,{button});};
 if(faction==='crown'){
  for(const [i,id]of ['harbor','producer-4'].entries()){
   await page.evaluate(({id,i})=>{const s=window.__gameCheck.scene.keys.BootScene;s.selectedBuilding=id;s.cameras.main.centerOn(i?640:320,128);s.syncVisuals();},{id,i});await page.waitForTimeout(50);await worldClick(points[i],'right');
   assert.deepEqual(await page.evaluate(id=>{const s=window.__gameCheck.scene.keys.BootScene;return (id==='harbor'?s.navy.production:s.placement.producers.find(b=>b.id===id).production).rally;},id),points[i]);assert.match(await page.locator('#selection-detail').innerText(),/Shift.*right-click/);
  }
  await page.keyboard.down('Shift');await worldClick(points[1],'right');await page.keyboard.up('Shift');assert.equal(await page.evaluate(()=>window.__gameCheck.scene.keys.BootScene.placement.producers[3].production.rally),undefined);await worldClick(points[1],'right');await page.locator('#train-transport').click();
 }
 let paid,produced;
 if(role){
  const host=role==='capital'?'harbor':role==='zeppelin'?'aviary':'academy';await page.evaluate(host=>{const s=window.__gameCheck.scene.keys.BootScene;s.selectedBuilding=host;s.syncVisuals();},host);const before=await page.evaluate(()=>window.__gameCheck.scene.keys.BootScene.gathering.wood);await page.locator(`#train-${role}`).click();
  paid=await page.evaluate(role=>{const s=window.__gameCheck.scene.keys.BootScene;return {wood:s.gathering.wood,queue:(role==='capital'?s.navy.production:role==='zeppelin'?s.placement.aviary.production:s.placement.academy.production).queue.map(j=>j.kind)};},role);assert.deepEqual(paid.queue,[role]);assert.equal(before-paid.wood,{capital:200,zeppelin:170,behemoth:160}[role]);
 }
 // Native strict save/load must preserve jobs, several ports and each waypoint.
 await page.locator('#match-menu-button').click();await page.locator('#save-match').click();await page.locator('#load-match').click();await page.waitForFunction(()=>!window.__gameCheck.scene.keys.BootScene.restartPending);
 const restored=await page.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;s.sys.sceneUpdate=()=>{};s.__tick=Object.getPrototypeOf(s).update.bind(s);return {job:s.research.job?.kind,primary:s.navy.production.rally,extra:s.placement.producers.find(b=>b.kind==='harbor').production.rally,queue:s.navy.production.queue?.map(j=>j.kind),harbors:1+s.placement.producers.filter(b=>b.kind==='harbor').length};});assert.equal(restored.job,'lightHulls');assert.equal(restored.harbors,2);if(faction==='crown'){assert.deepEqual(restored.primary,points[0]);assert.deepEqual(restored.extra,points[1]);assert.deepEqual(restored.queue,['capital']);}
 await page.locator('#resume-match').click();
 if(role){produced=await page.evaluate(role=>{const s=window.__gameCheck.scene.keys.BootScene;s.skipGameplayFrame=false;for(let i=0;i<46;i++)s.__tick(0,1000);const u=role==='capital'?s.navy.ships.find(u=>u.role===role):s.gathering.units.find(u=>u.archetype===role);if(!u)throw Error('No completed '+role);s.gathering.units=s.gathering.units.map(v=>({...v,selected:v.id===u.id}));s.navy.ships=s.navy.ships.map(v=>({...v,selected:v.id===u.id}));s.selectedBuilding=null;s.cameras.main.centerOn(u.position.x,u.position.y);s.syncVisuals();return {id:u.id,hp:u.hp,position:u.position,frame:(role==='capital'?s.shipVisuals:s.visuals).get(u.id).body?.frame?.name??s.shipVisuals.get(u.id)?.frame?.name};},role);assert.equal(produced.hp,{capital:520,zeppelin:330,behemoth:560}[role]);assert(produced.frame?.startsWith(`${role}-`),JSON.stringify(produced));await page.screenshot({path:`${out}/${role}-${width}.png`});}
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);results.push({width,faction,role,build,research,paid,restored,produced,errors,failed});await page.close();console.log('PASS production naval clarity',width,faction);
 }
 for(const width of [800,1280])for(const id of ['first-steps','the-siege']){
  const height=width===800?600:720,page=await browser.newPage({viewport:{width,height}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('warcraft-2-tribute.campaign.v2',JSON.stringify({version:2,campaigns:{'human-frontier-v1/crown/normal':['first-steps','forest-watch']}})));
  await page.route('**/assets/index-*.js',async route=>{const response=await route.fetch();let body=await response.text();const match=[...body.matchAll(/new ([A-Za-z_$][\w$]*)\.Game\(\{/g)].at(-1);assert(match);body=body.slice(0,match.index)+'window.__gameCheck='+body.slice(match.index);await route.fulfill({response,body});});
  await page.goto(url,{waitUntil:'networkidle'});assert.equal(await page.locator('#home-release').innerText(),'v0.9.0');await page.locator('#menu-settings').click();await page.selectOption('#display-resolution',`${width}x${height}`);await page.selectOption('#display-mode','native');await page.locator('#menu-back').click();await page.locator('#menu-campaign').click();await page.selectOption('#faction-select','crown');await page.locator('#campaign-next-faction').click();await page.selectOption('#difficulty-select','normal');await page.locator('#campaign-next-difficulty').click();await page.locator(`[data-campaign-mission="${id}"]`).click();await page.locator('#start-match').click();await page.waitForFunction(()=>!window.__gameCheck.scene.keys.BootScene.restartPending);
  const buildMenu=await page.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;s.gathering.units[0].selected=true;s.selectedBuilding=null;s.syncVisuals();return {mission:s.campaignMission,items:[...document.querySelectorAll('[data-action-group="Build"] .control:not([hidden])>button')].map(b=>({id:b.id,rect:b.getBoundingClientRect().toJSON()}))};});assert.equal(buildMenu.mission,id);assert.equal(buildMenu.items.some(b=>b.id==='build-forge'),id==='the-siege');assert(!buildMenu.items.some(b=>b.id==='build-navalAcademy'));for(const b of buildMenu.items)assert(b.rect.bottom<=height&&b.rect.right<=width);assert.deepEqual(errors,[]);await page.screenshot({path:`${out}/campaign-${id}-${width}.png`});results.push({width,campaign:id,buildMenu,errors});await page.close();console.log('PASS production campaign',width,id);
 }
 await writeFile(`${out}/browser.json`,JSON.stringify({url,fixture:'Fresh isolated storage. Explicit completed-building/funded component fixtures; actual production-bundle menu/research/paid production, native Save/Load and ship waypoint/clear clicks. Actual match ticks complete three large roles. No source module imports, no human economy/balance/listening claim.',results},null,2)+'\n');
}finally{await browser.close();}

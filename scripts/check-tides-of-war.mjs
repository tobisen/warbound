import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from '../presentations/agentic-coding/node_modules/playwright-core/index.mjs';
const out='artifacts/tides-of-war';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),results=[];
try{for(const width of [800,1280])for(const faction of ['crown','clans','elves','dwarves','goblins']){
 const height=width===800?600:720,p=await browser.newPage({viewport:{width,height}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/src/main.ts*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__gameCheck=new Phaser.Game({')});});
 await p.goto(process.env.W2T_UI_URL??'http://127.0.0.1:5194',{waitUntil:'domcontentloaded'});
 await p.locator('#menu-settings').click();await p.selectOption('#display-resolution',`${width}x${height}`);await p.selectOption('#display-mode','native');await p.locator('#menu-back').click();
 await p.locator('#menu-skirmish').click();await p.selectOption('#faction-select',faction);await p.selectOption('#ai-profile-select','fleet');await p.locator('#start-match').click();await p.waitForFunction(()=>!window.__gameCheck.scene.keys.BootScene.restartPending);
 const setup=await p.evaluate(async faction=>{
  const s=window.__gameCheck.scene.keys.BootScene,{factions}=await import('/src/config/factions.ts');s.update=()=>{};s.sys.sceneUpdate=()=>{};const m=s.currentMatch();
  m.gathering.wood=800;m.gathering.goldBalance=800;m.combat.baseDevelopment={level:2,remainingSeconds:null};
  for(const [i,kind] of ['forge','siegeWorks'].entries()){const footprint={x:512+i*96,y:384,width:64,height:64};m.placement[kind]={id:kind,owner:'player',hp:factions[faction].buildings[kind].hp,footprint,construction:{remainingSeconds:0,builderId:null},...(kind==='siegeWorks'?{production:{remainingSeconds:null,nextUnitNumber:4}}:{})};m.map.obstacles.push(footprint);}
  const footprint={x:576,y:576,width:64,height:64};m.placement.producers=[{id:'producer-1',kind:'navalFoundry',owner:'player',hp:180,footprint,construction:{remainingSeconds:0,builderId:null},production:{remainingSeconds:null,nextUnitNumber:4}}];m.placement.nextProducerNumber=2;m.map.obstacles.push(footprint);
  s.applyMatch(m);s.selectedBuilding='base';s.syncVisuals();return {faction:s.factions.player,profile:m.aiProfile};
 },faction);assert.equal(setup.faction,faction);assert.equal(setup.profile,'fleet');
 const reached=[];let chosen;const kind={crown:'convoyService',clans:'assaultRamps',elves:'tidewatch',dwarves:'siegeShells',goblins:'volatileTorpedoes'}[faction];
 for(let index=0;index<4;index++){
  const state=await p.evaluate(()=>{const box=document.querySelector('[data-action-group="Research"]'),items=[...box.querySelectorAll('.control:not([hidden])')];return items.map(w=>{const r=w.getBoundingClientRect();return {id:w.querySelector('button').id,top:r.top,bottom:r.bottom,left:r.left,right:r.right,icon:w.querySelector('button').style.getPropertyValue('--action-icon')};});});
  assert(state.length<=8);assert(new Set(state.map(b=>Math.round(b.top))).size<=2);for(const b of state){assert(b.bottom<=height+1);assert(b.left>=0&&b.right<=width+1);assert(b.icon.startsWith('url('));}reached.push(...state.map(i=>i.id));
  if(state.some(b=>b.id===`research-${kind}`)){chosen=index;await p.screenshot({path:`${out}/${faction}-${width}-research.png`});await p.locator(`#research-${kind}`).click();break;}
  await p.getByRole('button',{name:'Next research page',exact:true}).click();
 }
 assert.notEqual(chosen,undefined);assert.equal(await p.evaluate(()=>window.__gameCheck.scene.keys.BootScene.research.job?.kind),kind);
 const saved=await p.evaluate(async()=>{const s=window.__gameCheck.scene.keys.BootScene,{encodeSave,decodeSave}=await import('/src/gameplay/save.ts');return decodeSave(encodeSave(s.currentMatch(),{camera:{x:0,y:0},building:null})).ok;});assert(saved);
 const complete=await p.evaluate(async kind=>{const s=window.__gameCheck.scene.keys.BootScene,{updateResearch}=await import('/src/gameplay/research.ts'),{roleResearchConfig}=await import('/src/config/roleResearch.ts');s.research=updateResearch(s.research,s.placement,roleResearchConfig[kind].durationSeconds,true,s.factions.player);s.syncVisuals();return {level:s.research[kind],wood:s.gathering.wood,gold:s.gathering.goldBalance};},kind);assert.equal(complete.level,1);
 if(faction==='dwarves')assert(await p.locator('#research-preciseShells').isDisabled());
 await p.locator('#tech-tree-button').click();await p.evaluate(()=>window.__gameCheck.scene.keys.BootScene.syncVisuals());await p.locator('[data-tech-branch="Research"]').click();assert.match(await p.locator('#pause-tech-panel').innerText(),new RegExp({crown:'Convoy Service',clans:'Assault Ramps',elves:'Tidewatch',dwarves:'Siege Shells',goblins:'Volatile Torpedoes'}[faction]));await p.screenshot({path:`${out}/${faction}-${width}-technology.png`});await p.keyboard.press('Escape');
 await p.locator('#match-menu-button').click();await p.locator('#save-match').click();await p.locator('#load-match').click();await p.waitForFunction(()=>!window.__gameCheck.scene.keys.BootScene.restartPending);assert.equal(await p.evaluate(kind=>window.__gameCheck.scene.keys.BootScene.research[kind],kind),1);
 assert.deepEqual(errors,[]);results.push({width,faction,kind,setup,complete,reached,activeSave:saved,nativeSaveLoad:true,errors});await p.close();console.log('PASS',width,faction);
 }
 await writeFile(`${out}/browser.json`,JSON.stringify({fixture:'Native faction/profile menu, funded completed-building component fixture, actual research clicks and costs, strict active save, native Save/load, research page bounds and Tech Tree. No completed economy match claim.',results},null,2)+'\n');
}finally{await browser.close();}

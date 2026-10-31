import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {chromium} from '../presentations/agentic-coding/node_modules/playwright-core/index.mjs';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),report=[];
try{for(const width of [800,1280]){
 const p=await browser.newPage({viewport:{width,height:width===800?600:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/src/main.ts*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__gameCheck=new Phaser.Game({')});});
 await p.goto('http://127.0.0.1:5195',{waitUntil:'domcontentloaded'});await p.locator('#menu-settings').click();await p.selectOption('#display-resolution',`${width}x${width===800?600:720}`);await p.selectOption('#display-mode','native');await p.locator('#menu-back').click();await p.locator('#menu-skirmish').click();await p.locator('#skirmish-presets summary').click();
 for(const [id,count]of [['twinwake',2],['farreach',2],['crownsea',4],['trident',2]]){
  await p.locator(`[data-naval-preset="${id}"]`).click();const state=await p.evaluate(()=>window.__gameCheck.scene.keys.BootScene.session.options);assert.equal(state.map,id);assert.equal(state.players?.length??2,count);assert.match(await p.locator('#skirmish-capacity').innerText(),id==='farreach'?/128 × 96/:id==='trident'?/96 × 72/:id==='twinwake'?/64 × 48/:/96 × 96/);
 }
 await p.screenshot({path:`artifacts/replayability/presets-${width}.png`});await p.locator('#start-match').click();await p.waitForFunction(()=>!window.__gameCheck.scene.keys.BootScene.restartPending);
 await p.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;s.update=()=>{};s.sys.sceneUpdate=()=>{};window.__colony=s.currentMatch();});
 const stages=[];for(const goal of ['sailing','settling','outpost']){
  const result=await p.evaluate(async goal=>{const s=window.__gameCheck.scene.keys.BootScene,{updateMatch}=await import('/src/gameplay/match.ts'),{encodeSave,decodeSave}=await import('/src/gameplay/save.ts');let m=window.__colony;
   for(let i=0;i<1600&&m.outcome==='playing';i++){m=updateMatch(m,.5);if(goal==='outpost'?m.combat.enemies.some(e=>e.buildingType==='outpost'&&e.position.y>1200&&e.construction?.remainingSeconds===0):m.enemyNaval.colony?.stage===goal)break;}
   const saved=decodeSave(encodeSave(m,{camera:{x:0,y:0},building:null}));if(!saved.ok)throw Error(saved.error);window.__colony=saved.match;
   const shown=structuredClone(m);shown.fog.teams.player.visible.fill(true);shown.fog.teams.player.explored.fill(true);s.applyMatch(shown);const focus=goal==='sailing'?m.combat.enemies.find(e=>e.kind==='ship'&&!e.navalRole)?.position:m.combat.enemies.find(e=>e.buildingType==='outpost'&&e.position.y>1200)?.position??m.enemyNaval.colony?.target;s.cameras.main.centerOn(focus.x,focus.y);s.syncVisuals();
   return {goal,time:m.waves.elapsedSeconds,stage:m.enemyNaval.colony?.stage,passengers:m.enemyNaval.passengers.map(e=>e.kind),outposts:m.combat.enemies.filter(e=>e.buildingType==='outpost').map(e=>({position:e.position,ready:e.construction.remainingSeconds===0})),spent:m.enemyProduction.spent,research:m.enemyPolicy.research};
  },goal);
  if(goal==='outpost')assert(result.outposts.some(e=>e.ready&&e.position.y>1200),JSON.stringify(result));else assert.equal(result.stage,goal,JSON.stringify(result));if(goal==='sailing')assert(result.passengers.includes('worker'));stages.push(result);await p.screenshot({path:`artifacts/replayability/colony-${goal}-${width}.png`});
 }
 assert.deepEqual(errors,[]);report.push({width,stages,errors});await p.close();console.log('PASS presets and paid colony',width);
}await writeFile('artifacts/replayability/strategy-browser.json',JSON.stringify({note:'Native viewport. Ordinary menu presets and unmodified starting economy. Accelerated .5s gameplay ticks, Save/resume each stage. Only rendered observation copies reveal fog.',report},null,2));}finally{await browser.close();}

// Native active naval combat with legal orders; no injected health, fog or economy.
// Run without parallel tests when using these timings as performance evidence.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.W2T_PLAYWRIGHT_MODULE??'../presentations/agentic-coding/node_modules/playwright-core/index.mjs');
const prefix=process.env.W2T_PERF_PREFIX??'artifacts/tides-of-war/after';
const browser=await chromium.launch({headless:true,executablePath:process.env.W2T_BROWSER_EXECUTABLE??'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('warcraft-2-tribute.preferences.v1',JSON.stringify({version:1,settings:{display:{resolution:'1280x720',mode:'native'}}})));
 await page.route('**/src/main.ts*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__gameCheck=new Phaser.Game({')});});
 await page.goto(process.env.W2T_UI_URL??'http://127.0.0.1:5194',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__gameCheck?.scene.keys.BootScene?.baseVisual);
 await page.evaluate(async()=>{const {campaignMissionsFor,identityFor,identityKey}=await import('/src/config/campaignSeries.ts'),i=identityFor('crown','normal');localStorage.setItem('warcraft-2-tribute.campaign.v2',JSON.stringify({version:2,campaigns:{[identityKey(i)]:campaignMissionsFor(i.campaignId).filter(m=>m.id!=='crown-stormgate-armada').map(m=>m.id)}}));});
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.__gameCheck?.scene.keys.BootScene?.baseVisual);await page.locator('#menu-campaign').click();await page.selectOption('#faction-select','crown');await page.locator('#campaign-next-faction').click();await page.selectOption('#difficulty-select','normal');await page.locator('#campaign-next-difficulty').click();await page.locator('[data-campaign-mission="crown-stormgate-armada"]').click();await page.locator('#start-match').click();await page.waitForFunction(()=>!window.__gameCheck.scene.keys.BootScene.restartPending);
 const initial=await page.evaluate(async()=>{
  const s=window.__gameCheck.scene.keys.BootScene,{prepareSeaBattleTactics,seaBattleTacticalOrders}=await import('/src/gameplay/testHelpers/seaBattleTactics.ts'),{updateMatch}=await import('/src/gameplay/match.ts'),{cameraFocus}=await import('/src/presentation/cameraFocus.ts');
  let m=prepareSeaBattleTactics();for(let i=0;i<24;i++){if(i%4===0)m=seaBattleTacticalOrders(m);m=updateMatch(m,.25);}
  s.applyMatch(m);s.setCameraScroll(cameraFocus([{x:1550,y:640}],s.map,s.visibleCamera()));s.syncVisuals();
  window.__navalMetrics={update:[],frames:[],shots:[],start:m.waves.elapsedSeconds};window.__navalOrderBatches=0;let tick=0,last=0,nextOrder=m.waves.elapsedSeconds;
  const original=s.sys.sceneUpdate;s.sys.sceneUpdate=function(time,delta){if(s.waves.elapsedSeconds>=nextOrder){s.applyMatch(seaBattleTacticalOrders(s.currentMatch()));nextOrder=s.waves.elapsedSeconds+1;window.__navalOrderBatches++;}return original.call(s,time,delta);};
  s.sys.events.on('preupdate',()=>tick=performance.now());s.sys.events.on('postupdate',()=>{window.__navalMetrics.update.push(performance.now()-tick);window.__navalMetrics.shots.push(s.combat.projectiles?.length??0);});
  s.game.events.on('step',t=>{if(last)window.__navalMetrics.frames.push(t-last);last=t;});
  return {ships:s.navy.ships.length,enemyShips:s.combat.enemies.filter(e=>e.kind==='ship').length,seconds:m.waves.elapsedSeconds};
 });
 await page.waitForTimeout(3000);await page.screenshot({path:prefix+'-naval-battle-1280.png'});await page.waitForTimeout(7000);
 const data=await page.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene,a=window.__navalMetrics,summary=v=>{const x=v.slice(30).sort((a,b)=>a-b);return {samples:x.length,medianMs:x[Math.floor(x.length*.5)],p95Ms:x[Math.floor(x.length*.95)]};};return {update:summary(a.update),frame:summary(a.frames),orderBatches:window.__navalOrderBatches,peakShots:Math.max(...a.shots),seconds:s.waves.elapsedSeconds,phase:s.campaignRun.phase,outcome:s.outcome,ships:s.navy.ships.length,enemyShips:s.combat.enemies.filter(e=>e.kind==='ship').length,canvas:{width:s.game.canvas.width,height:s.game.canvas.height}};});
 assert.equal(initial.ships,16);assert(initial.enemyShips>0&&initial.enemyShips<=15);assert(data.orderBatches>=8);assert(data.peakShots>0);assert(data.update.samples>100);assert(data.seconds>initial.seconds);assert.equal(data.outcome,'playing');assert.deepEqual(errors,[]);
 await page.waitForFunction(()=>window.__gameCheck.scene.keys.BootScene.outcome!=='playing',null,{timeout:120000});
 const playthrough=await page.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;return {outcome:s.outcome,phase:s.campaignRun.phase,seconds:s.waves.elapsedSeconds,baseHP:s.combat.baseHP,ships:s.navy.ships.length,orderBatches:window.__navalOrderBatches};});assert.equal(playthrough.outcome,'victory');await page.screenshot({path:prefix+'-native-victory-1280.png'});
 const report={playthrough,browser:browser.version(),headless:true,note:'Native1280 active combat; legal automated orders, six gameplay seconds of legal setup, first ten real seconds measured, then continued native tactical playthrough. Not a human balance trial.',initial,...data,errors};await writeFile(prefix+'-naval-performance.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await browser.close();}

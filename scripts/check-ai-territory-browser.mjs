// Paid 25-minute skirmish progression in Chrome, then strict Save/load and native
// rendering. Full reveal is human-only and enabled after progression for images.
import {build,createServer} from 'vite';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import assert from 'node:assert/strict';
import {chromium} from '../presentations/agentic-coding/node_modules/playwright-core/index.mjs';
const out='artifacts/army-movement',dir=await mkdtemp(join(tmpdir(),'w2t-territory-ui-'));await mkdir(out,{recursive:true});let browser,server;
try{
 await build({configFile:false,logLevel:'error',build:{outDir:dir,minify:false,lib:{entry:'src/gameplay/testHelpers/aiTerritory.ts',name:'Territory',formats:['iife'],fileName:'fixture'}}});
 server=await createServer({server:{host:'127.0.0.1',port:5196,strictPort:true}});await server.listen();
 browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 for(const difficulty of ['normal','easy','beginner']){
  const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('warcraft-2-tribute.preferences.v1',JSON.stringify({version:1,settings:{display:{resolution:'1280x720',mode:'native'}}})));
  await page.route('**/src/main.ts*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__gameCheck=new Phaser.Game({')});});
  await page.goto('http://127.0.0.1:5196');await page.locator('#menu-skirmish').click();await page.selectOption('#map-select','plains128');await page.selectOption('#difficulty-select',difficulty);await page.locator('#start-match').click();await page.waitForFunction(()=>!window.__gameCheck.scene.keys.BootScene.restartPending);
  await page.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;window.__nativeUpdate=s.update;s.update=()=>{};s.sys.sceneUpdate=s.update;});
  await page.addScriptTag({path:join(dir,'fixture.iife.js')});await page.evaluate(d=>{window.__territory=Territory.territoryFixture(d);window.__hits=0;},difficulty);
  const snapshots=[],scoutGoals=[];let thirdBase;
  for(let t=0;t<1500;t+=60){
   const batch=await page.evaluate(()=>{let m=window.__territory;const goals=[];let third;for(let i=0;i<60;i++){m=Territory.updateMatch(m,1,{side:'enemy',onHit:()=>window.__hits++});const s=Territory.territorySnapshot(m);if(s.scout?.goal)goals.push({time:s.seconds,goal:s.scout.goal,position:s.scout.position});if(s.bases.filter(b=>b.remaining===0).length>=3)third??=s.seconds;}window.__territory=m;return {snapshot:Territory.territorySnapshot(m),goals,third};});
   snapshots.push(batch.snapshot);thirdBase??=batch.third;for(const g of batch.goals)if(!scoutGoals.length||JSON.stringify(g.goal)!==JSON.stringify(scoutGoals.at(-1).goal))scoutGoals.push(g);
  }
  const final=await page.evaluate(()=>{const m=window.__territory,s=window.__gameCheck.scene.keys.BootScene,encoded=Territory.encodeSave(m,{camera:{x:0,y:0},building:null}),loaded=Territory.decodeSave(encoded);if(!loaded.ok)throw Error(loaded.error);s.applyMatch(loaded.match);s.syncVisuals();return {ledger:Territory.territoryLedger(m),hits:window.__hits,saveBytes:encoded.length,saveOK:loaded.ok,enemyVision:m.fog.teams.enemy.visible.filter(Boolean).length};});
  assert(thirdBase<=1500);const bases=snapshots.at(-1).bases.filter(b=>!b.remaining);assert(bases.length>=3);
  const distances=bases.flatMap((a,i)=>bases.slice(i+1).map(b=>Math.hypot(a.position.x-b.position.x,a.position.y-b.position.y)));assert(Math.min(...distances)>=640);for(const error of Object.values(final.ledger))assert(Math.abs(error)<.001);
  await page.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;s.fog={...s.fog,revealed:true};s.fog.teams.player.visible.fill(true);s.fog.teams.player.explored.fill(true);s.syncVisuals();s.update=window.__nativeUpdate;s.sys.sceneUpdate=s.update;});
  await page.waitForFunction(()=>window.__gameCheck.scene.keys.BootScene.waves.elapsedSeconds>=1500.5);
  for(let i=0;i<bases.length;i++){
   await page.evaluate(p=>{const s=window.__gameCheck.scene.keys.BootScene;s.cameras.main.centerOn(p.x,p.y);s.syncVisuals();},bases[i].position);
   await page.screenshot({path:`${out}/territory-final-${difficulty}-base-${i}.png`});
  }
  assert.deepEqual(errors,[]);const report={browser:browser.version(),difficulty,map:'plains128',seconds:1500,thirdBase,minimumBaseDistance:Math.min(...distances),snapshots,scoutGoals,...final,errors,description:'Paid ordinary AI economy/fog, 1s updateMatch steps for 25 gameplay minutes. Passive human damage redirected through existing multiplayer scope to preserve targets. Strict Save/load and actual native frames resume after progression. Human-only full reveal afterward is solely for screenshots; no AI vision/resources/units/build completion injected. Not a human playtest or frame benchmark.'};
  await writeFile(`${out}/territory-final-${difficulty}.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({difficulty,thirdBase,bases,minimumBaseDistance:report.minimumBaseDistance,explored:snapshots.at(-1).explored,knownMines:snapshots.at(-1).knownMines.length,...final}));await page.close();
 }
}finally{await browser?.close();await server?.close();await rm(dir,{recursive:true,force:true});}

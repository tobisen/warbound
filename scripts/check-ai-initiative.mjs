// Natural paid AI progression, then bounded CPU and newly revealed rendering samples.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.W2T_PLAYWRIGHT_MODULE??'playwright-core');
const out=process.env.W2T_ARTIFACTS??'artifacts/ai-initiative',url=process.env.W2T_UI_URL??'http://127.0.0.1:5184/';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.W2T_BROWSER_EXECUTABLE??'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),reports=[];
try{
 for(const {width,count} of [{width:800,count:2},{width:1280,count:5}]){
  const page=await browser.newPage({viewport:{width,height:width===800?600:720}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/src/main.ts*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__gameCheck=new Phaser.Game({')});});
  await page.goto(url,{waitUntil:'domcontentloaded'});await page.locator('#menu-settings').click();await page.selectOption('#display-resolution',`${width}x${width===800?600:720}`);await page.locator('#menu-back').click();await page.locator('#menu-skirmish').click();await page.selectOption('#player-count-select',String(count));await page.selectOption('#map-select',count===5?'plains128':'arena');await page.locator('#start-match').click();await page.waitForFunction(()=>!window.__gameCheck.scene.keys.BootScene.restartPending);
  const progression=await page.evaluate(async count=>{
   const scene=window.__gameCheck.scene.keys.BootScene;scene.update=()=>{};scene.sys.sceneUpdate=()=>{};
   const {createMatch,updateMatch}=await import('/src/gameplay/match.ts');
   const {matchPlayers}=await import('/src/gameplay/players.ts');
   const {encodeSave,decodeSave}=await import('/src/gameplay/save.ts');
   let roster=count===5?matchPlayers(undefined,undefined,5).map((p,i)=>({...p,teamId:i===0?1:2})):undefined;
   let m=createMatch('skirmish','normal',undefined,count===5?'plains128':'arena',1,'balanced',roster),hits=0;
   if(count===5)m.combat.baseHP=100000;
   const started=performance.now();
   for(let t=0;t<300;t++)m=updateMatch(m,1,count===2?{side:'enemy',onHit:()=>hits++}:undefined);
   const progressionMs=performance.now()-started;
   const actors=m.multiplePlayers?.ai.map(bot=>({id:bot.id,m:bot.state}))??[{id:'enemy',m}];
   const ai=actors.map(({id,m})=>({id,workers:m.combat.enemies.filter(e=>e.kind==='worker').length,jobs:m.enemyProduction.acceptedJobs,bases:m.combat.enemies.filter(e=>(e.kind==='base'||e.buildingType==='outpost')&&(!e.construction||e.construction.remainingSeconds===0)).length,buildings:m.combat.enemies.filter(e=>e.footprint).length,phase:m.enemyPolicy.strategy?.phase,bank:{wood:m.enemyProduction.wood,gold:m.enemyProduction.gold}}));
   let save;
   if(count===2){const loaded=decodeSave(encodeSave(m,{camera:{x:0,y:0},building:null}));save={ok:loaded.ok,error:loaded.ok?undefined:loaded.error};if(loaded.ok)m=loaded.match;}
   const samples=[];for(let i=0;i<120;i++){const tick=performance.now();m=updateMatch(m,1/60,count===2?{side:'enemy'}:undefined);if(i>=20)samples.push(performance.now()-tick);}
   samples.sort((a,b)=>a-b);window.__initiativeMatch=m;scene.applyMatch(m);scene.syncVisuals();
   return {fixture:count===5?'Paid four-AI allied team300s; human base has explicit100000HP to preserve the workload. No injected AI entities, resources or vision.':'Paid Normal300s; multiplayer hit sink preserves passive targets, with real fog/range-validated hits.',ai,hits,save,seconds:m.waves.elapsedSeconds,outcome:m.outcome,progressionMs,cpu:{samples:samples.length,medianMs:samples[49],p95Ms:samples[94]},units:m.gathering.units.length+m.combat.enemies.filter(e=>!e.footprint).length};
  },count);
  assert.equal(progression.outcome,'playing');assert.equal(progression.ai.length,count-1);for(const ai of progression.ai){assert(ai.jobs>3);assert(ai.workers>2);assert(ai.bases>=2);assert(ai.buildings<=20);}if(count===2){assert(progression.hits>0);assert.equal(progression.save.ok,true);}
  await page.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene,b=s.combat.enemies.find(e=>e.kind==='base');s.cameras.main.centerOn(b.position.x,b.position.y);s.syncVisuals();});
  await page.screenshot({path:`${out}/natural-${count}-${width}.png`});
  const render=await page.evaluate(()=>{
   const s=window.__gameCheck.scene.keys.BootScene;s.fog.teams.player.visible.fill(true);s.fog.teams.player.explored.fill(true);
   const tick=performance.now();s.syncVisuals();const firstRevealMs=performance.now()-tick,times=[];
   for(let i=0;i<50;i++){const tick=performance.now();s.syncVisuals();if(i>=10)times.push(performance.now()-tick);}times.sort((a,b)=>a-b);
   return {fixture:'Human-only full reveal for rendering; AI vision unchanged',firstRevealMs,medianMs:times[19],p95Ms:times[37]};
  });
  await page.screenshot({path:`${out}/revealed-${count}-${width}.png`});assert.deepEqual(errors,[]);reports.push({width,count,progression,render,errors});
  await writeFile(`${out}/browser.json`,JSON.stringify({chromium:browser.version(),reports,limitations:'Local CPU/render sync measurements, not FPS or a full-match performance guarantee. Durability/hit-sink fixtures are explicit.'},null,2)+'\n');console.log(JSON.stringify(reports.at(-1)));await page.close();
 }
}finally{await browser.close();}

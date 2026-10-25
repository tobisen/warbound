// Browser review + isolated production CPU comparison. Existing local Playwright/Chrome required.
import assert from 'node:assert/strict';
import {mkdir,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {build} from 'vite';
const {chromium}=await import(process.env.W2T_PLAYWRIGHT_MODULE??'playwright-core');
const out=process.env.W2T_ARTIFACTS??'artifacts/strategic-ai',url=process.env.W2T_UI_URL??'http://127.0.0.1:5184/';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.W2T_BROWSER_EXECUTABLE??'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),reports=[];
const temporary=await mkdtemp(join(tmpdir(),'w2t-strategy-'));
try{
 if(process.env.W2T_PROFILE_ONLY!=='1')for(const {width,count} of [{width:800,count:2},{width:1280,count:2},{width:1280,count:5}]){
  const page=await browser.newPage({viewport:{width,height:width===800?600:720}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/src/main.ts*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__gameCheck=new Phaser.Game({')});});
  await page.goto(url,{waitUntil:'domcontentloaded'});await page.locator('#menu-settings').click();await page.selectOption('#display-resolution',`${width}x${width===800?600:720}`);await page.locator('#menu-back').click();await page.locator('#menu-skirmish').click();await page.selectOption('#player-count-select',String(count));await page.selectOption('#map-select',count===5?'plains128':'arena');await page.locator('#start-match').click();await page.waitForFunction(()=>!window.__gameCheck.scene.keys.BootScene.restartPending);
  const progression=await page.evaluate(async count=>{
   const scene=window.__gameCheck.scene.keys.BootScene;scene.update=()=>{};scene.sys.sceneUpdate=()=>{};
   const {createMatch,updateMatch}=await import('/src/gameplay/match.ts');
   const {matchPlayers,playerStart}=await import('/src/gameplay/players.ts'),{projectMultiplePlayers}=await import('/src/gameplay/multiplePlayers.ts');
   let m=createMatch('skirmish','normal',undefined,count===5?'plains128':'arena',1,'balanced',count===5?matchPlayers(undefined,undefined,5):undefined);for(let i=0;i<(count===5?30:240);i++)m=updateMatch(m,1);
   if(count===5){
    const position=(base,i)=>({x:base.x-160+i%5*32,y:base.y+160+Math.floor(i/5)*32});
    for(let i=0;i<16;i++){const p=position(m.gathering.base,i);m.gathering.units.push({id:'unit-'+(100+i),kind:'soldier',owner:'player',hp:60,cargo:0,selected:false,position:p,target:p,order:{kind:'idle'}});}
    m.production.nextUnitNumber=m.soldierProduction.nextUnitNumber=200;
    for(const bot of m.multiplePlayers.ai){const base=playerStart(m.map.id,bot.id,m.map.design);for(let i=0;i<20;i++)bot.state.combat.enemies.push({id:'enemy-produced-'+(100+i),kind:'unit',role:'soldier',owner:'enemy',hp:60,position:position(base,i),order:{kind:'idle'}});bot.state.enemyProduction.production.nextUnitNumber=200;}
    m=projectMultiplePlayers(m);
   }
   scene.applyMatch(m);scene.syncVisuals();
   return {fixture:count===5?'96 injected soldiers after30s paid economy; rendering load only':'Natural paid240s economy',ai:m.multiplePlayers?.ai.length??1,time:m.waves.elapsedSeconds,outcome:m.outcome,workers:m.combat.enemies.filter(e=>e.kind==='worker').length,jobs:m.enemyProduction.acceptedJobs,buildings:m.combat.enemies.filter(e=>e.footprint).map(e=>({kind:e.buildingType??e.kind,remaining:e.construction?.remainingSeconds??0})),bank:{wood:m.enemyProduction.wood,gold:m.enemyProduction.gold}};
  },count);
  assert.equal(progression.outcome,'playing');if(count===2){assert(progression.workers>2);assert(progression.jobs>6);assert(progression.buildings.some(b=>b.kind==='outpost'&&b.remaining===0));}else assert.equal(progression.ai,4);
  await page.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene,b=s.combat.enemies.find(e=>e.kind==='base');s.cameras.main.centerOn(b.position.x,b.position.y);s.syncVisuals();});
  await page.screenshot({path:`${out}/unrevealed-${count}-${width}.png`});
  const render=await page.evaluate(()=>{
   const s=window.__gameCheck.scene.keys.BootScene;s.fog.teams.player.visible.fill(true);s.fog.teams.player.explored.fill(true);
   const firstStarted=performance.now();s.syncVisuals();const firstRevealMs=performance.now()-firstStarted;
   const times=[];for(let i=0;i<70;i++){const started=performance.now();s.syncVisuals();if(i>=10)times.push(performance.now()-started);}
   times.sort((a,b)=>a-b);return {firstRevealMs,medianMs:times[30],p95Ms:times[57],fixture:'Render-only full human visibility; no enemy vision changed. Main enemy base camera.'};
  });
  await page.screenshot({path:`${out}/revealed-${count}-${width}.png`});assert.deepEqual(errors,[]);reports.push({width,count,progression,render,errors});await page.close();
 }
 const entry=join(temporary,'entry.mjs');
 await writeFile(entry,`
 import {createMatch,updateMatch} from ${JSON.stringify(resolve('src/gameplay/match.ts'))};
 import {matchPlayers,playerStart} from ${JSON.stringify(resolve('src/gameplay/players.ts'))};
 import {projectMultiplePlayers} from ${JSON.stringify(resolve('src/gameplay/multiplePlayers.ts'))};
 export {updateMatch};
 export function fixture(army){
  let m=createMatch('skirmish','normal',undefined,'plains128',1,'balanced',matchPlayers(undefined,undefined,5));
  if(!army)return m;
  for(let i=0;i<60;i++)m=updateMatch(m,.5);
  const position=(base,i)=>({x:base.x-160+i%5*32,y:base.y+160+Math.floor(i/5)*32});
  for(let i=0;i<16;i++){const p=position(m.gathering.base,i);m.gathering.units.push({id:'unit-'+(100+i),kind:'soldier',owner:'player',hp:60,cargo:0,selected:false,position:p,target:p,order:{kind:'idle'}});}
  m.production.nextUnitNumber=m.soldierProduction.nextUnitNumber=200;
  for(const bot of m.multiplePlayers.ai){const base=playerStart(m.map.id,bot.id,m.map.design);for(let i=0;i<20;i++)bot.state.combat.enemies.push({id:'enemy-produced-'+(100+i),kind:'unit',role:'soldier',owner:'enemy',hp:60,position:position(base,i),order:{kind:'idle'}});bot.state.enemyProduction.production.nextUnitNumber=200;}
  return projectMultiplePlayers(m);
 }`);
 const changed=['match','enemyAI','enemyConstruction','enemyDefense','enemyExpansion','enemyPolicy','enemyProduction','enemyRecovery','extraEnemyProduction'].map(f=>resolve(`src/gameplay/${f}.ts`));changed.push(resolve('src/config/enemyAI.ts'));
 const cpu=[];
 for(const baseline of process.env.W2T_BROWSER_ONLY==='1'?[]:[true,false]){
  const directory=join(temporary,baseline?'before':'after');
  await build({configFile:false,logLevel:'error',plugins:[{name:'strategy-baseline',enforce:'pre',load(id){if(baseline&&changed.includes(id))return execFileSync('git',['show',`HEAD:${id.slice(process.cwd().length+1)}`],{encoding:'utf8'});}}],build:{outDir:directory,lib:{entry,name:'StrategyCheck',formats:['iife'],fileName:'fixture'}}});
  for(const army of [false,true]){
   const page=await browser.newPage();await page.addScriptTag({path:join(directory,'fixture.iife.js')});
   const timing=await page.evaluate(army=>{
    let m=StrategyCheck.fixture(army);const samples=[],units=()=>m.gathering.units.length+m.combat.enemies.filter(e=>!e.footprint).length,startUnits=units();let decisions=0;
    for(let i=0;i<360;i++){const previous=m.multiplePlayers.ai.map(b=>b.state.enemyPolicy?.strategy),started=performance.now();m=StrategyCheck.updateMatch(m,1/60);samples.push(performance.now()-started);decisions+=m.multiplePlayers.ai.filter((b,n)=>b.state.enemyPolicy?.strategy!==previous[n]).length;}
    const sorted=samples.slice(60).sort((a,b)=>a-b);return {medianMs:sorted[149],p95Ms:sorted[284],startUnits,endUnits:units(),outcome:m.outcome,decisions,seconds:6};
   },army);assert.equal(timing.outcome,'playing');cpu.push({baseline,army,...timing});await page.close();
  }
 }
 const result={chromium:browser.version(),baseline:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),browser:reports,cpu,limitations:'CPU samples are production gameplay, not FPS. Large fixture injects 96 soldiers without payment, matching the existing five-player stress workload. AI behavior intentionally differs; no final-state equality claim.'};
 await writeFile(`${out}/${process.env.W2T_PROFILE_ONLY==='1'?'cpu':'browser'}.json`,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}finally{await browser.close();await rm(temporary,{recursive:true,force:true});}

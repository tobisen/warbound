import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from '../presentations/agentic-coding/node_modules/playwright-core/index.mjs';

const url=process.env.W2T_RELEASE_URL??'http://127.0.0.1:5274/warbound/';
const out=process.env.W2T_SCREENSHOTS??'artifacts/research-publication/candidate';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),results=[];
try {
 for(const width of [800,1280])for(const faction of ['crown','clans','elves','dwarves','goblins']) {
  const height=width===800?600:720,p=await browser.newPage({viewport:{width,height}}),errors=[],failed=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&/\/(assets|audio)\//.test(r.url()))failed.push({url:r.url(),status:r.status()});});
  await p.route('**/assets/index-*.js',async route=>{
   const response=await route.fetch();let body=await response.text();const match=[...body.matchAll(/new ([A-Za-z_$][\w$]*)\.Game\(\{/g)].at(-1);assert(match,'Phaser bootstrap missing');
   body=body.slice(0,match.index)+'window.__gameCheck='+body.slice(match.index);await route.fulfill({response,body});
  });
  await p.goto(url,{waitUntil:'networkidle',timeout:60000});
  assert.equal(await p.locator('#home-release').innerText(),'v0.9.0');
  const build=await p.locator('#home-release').getAttribute('title');if(process.env.W2T_EXPECT_BUILD)assert.equal(build,`Build ${process.env.W2T_EXPECT_BUILD}`);
  await p.locator('#menu-settings').click();await p.selectOption('#display-resolution',`${width}x${height}`);await p.selectOption('#display-mode','native');await p.locator('#menu-back').click();
  await p.locator('#menu-skirmish').click();await p.selectOption('#faction-select',faction);await p.selectOption('#map-select','twinwake');await p.selectOption('#difficulty-select','beginner');await p.locator('#start-match').click();
  await p.waitForFunction(()=>!window.__gameCheck.scene.keys.BootScene.restartPending);
  const freeze=async()=>p.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;s.sys.sceneUpdate=()=>{};s.__tick=Object.getPrototypeOf(s).update.bind(s);s.skipGameplayFrame=false;});
  await freeze();
  // Both cheats use the ordinary input dialog. Buildings and research remain paid.
  for(const code of ['icanseemyhousefromhere','foggoffnow']){await p.locator('#game canvas').focus();await p.keyboard.press('Enter');await p.locator('#cheat-code').fill(code);await p.locator('#cheat-form button[type="submit"]').click();assert(!(await p.locator('#cheat-dialog').isVisible()));}
  await p.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;s.gathering.units=s.gathering.units.map((u,i)=>({...u,selected:i===0}));s.selectedBuilding=null;s.cameras.main.centerOn(736,736);s.syncVisuals();});
  const clickWorld=async point=>{
   await p.evaluate(point=>window.__gameCheck.scene.keys.BootScene.cameras.main.centerOn(point.x,point.y),point);await p.waitForTimeout(60);
   const screen=await p.evaluate(point=>{const s=window.__gameCheck.scene.keys.BootScene,c=s.cameras.main,r=s.game.canvas.getBoundingClientRect();return {x:r.left+(point.x-c.worldView.x)*c.zoom*r.width/s.game.canvas.width,y:r.top+(point.y-c.worldView.y)*c.zoom*r.height/s.game.canvas.height};},point);
   await p.mouse.click(screen.x,screen.y);
  };
  const before=await p.evaluate(()=>window.__gameCheck.scene.keys.BootScene.gathering.wood);
  await p.locator('#build-base').click();await clickWorld({x:736,y:736});
  const foundation=await p.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene,b=s.placement.bases?.[0];if(!b)throw Error('Paid base placement failed: '+document.getElementById('placement-status')?.textContent);return {id:b.id,footprint:b.footprint,remaining:b.construction.remainingSeconds,wood:s.gathering.wood};});
  assert(foundation.remaining>0);assert(foundation.wood<before);
  await clickWorld({x:foundation.footprint.x+foundation.footprint.width/2,y:foundation.footprint.y+foundation.footprint.height/2});
  assert.equal(await p.evaluate(()=>window.__gameCheck.scene.keys.BootScene.selectedBuilding),foundation.id);
  assert(await p.locator('#research-workerTools').isEnabled());assert.equal(await p.locator('#research-workerTools-reason').innerText(),'');
  await p.screenshot({path:`${out}/${faction}-${width}-ready.png`});
  await p.locator('#research-workerTools').click();
  const active=await p.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;return {job:structuredClone(s.research.job),wood:s.gathering.wood};});
  assert.equal(active.job?.kind,'workerTools');assert(active.wood<foundation.wood);
  await p.locator('#match-menu-button').click();await p.locator('#save-match').click();assert.match(await p.locator('#save-status').innerText(),/saved/i);
  await p.locator('#load-match').click();await p.waitForFunction(()=>!window.__gameCheck.scene.keys.BootScene.restartPending&&window.__gameCheck.scene.keys.BootScene.session.phase==='paused');
  await freeze();assert.deepEqual(await p.evaluate(()=>window.__gameCheck.scene.keys.BootScene.research.job),active.job);await p.locator('#resume-match').click();
  const completed=await p.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;for(let i=0;i<22;i++)s.__tick(0,1000);return {tools:s.research.workerTools,baseRemaining:s.placement.bases[0].construction.remainingSeconds};});
  assert.equal(completed.tools,1);assert.equal(completed.baseRemaining,0);
  await clickWorld({x:foundation.footprint.x+foundation.footprint.width/2,y:foundation.footprint.y+foundation.footprint.height/2});
  assert(await p.locator('#research-workerTools').isEnabled());await p.locator('#research-workerTools').click();
  assert.equal(await p.evaluate(()=>window.__gameCheck.scene.keys.BootScene.research.job?.kind),'workerTools');
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);results.push({width,faction,build,foundation,active,completed,saveLoad:true,errors,failed});await p.close();console.log('PASS production research',width,faction);
 }
 await writeFile(`${out}/browser.json`,JSON.stringify({url,note:'Production bundle only; no source-module imports or research/building fixtures. Ordinary cheat dialogs fund/reveal the map. Base placement, selection and research use actual clicks; real match ticks advance construction/research. Menu Save/Load preserves the active job.',results},null,2)+'\n');
} finally {await browser.close();}

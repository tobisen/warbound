import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from '../presentations/agentic-coding/node_modules/playwright-core/index.mjs';

const url=process.env.W2T_RELEASE_URL??'http://127.0.0.1:5275/';
const out=process.env.W2T_SCREENSHOTS??'artifacts/tech-card-input/local';
const cases=process.env.W2T_TECH_CASES?JSON.parse(process.env.W2T_TECH_CASES):[
 {width:800,faction:'crown',mode:'skirmish'},{width:1280,faction:'crown',mode:'skirmish'},
 {width:800,faction:'crown',mode:'campaign'},{width:1280,faction:'crown',mode:'campaign'},
 {width:800,faction:'clans',mode:'skirmish'},{width:1280,faction:'elves',mode:'campaign'},
 {width:800,faction:'dwarves',mode:'campaign'},{width:1280,faction:'goblins',mode:'skirmish'}
];
const series={crown:'human-frontier-v1',clans:'orcs-exodus-v1',elves:'elves-roots-v1',dwarves:'dwarves-road-v1',goblins:'goblins-contract-v1'};
const results=[];await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try {
 for(const scenario of cases) {
  const {width,faction,mode}=scenario,height=width===800?600:720,p=await browser.newPage({viewport:{width,height}}),errors=[],clicks=[];
  p.on('pageerror',e=>errors.push(e.message));
  if(mode==='campaign')await p.addInitScript(({id,faction})=>localStorage.setItem('warcraft-2-tribute.campaign.v2',JSON.stringify({version:2,campaigns:{[`${id}/${faction}/beginner`]:['first-steps','forest-watch']}})),{id:series[faction],faction});
  await p.route('**/src/main.ts*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__gameCheck=new Phaser.Game({')});});
  await p.route('**/assets/index-*.js',async route=>{const response=await route.fetch();let body=await response.text();const match=[...body.matchAll(/new ([A-Za-z_$][\w$]*)\.Game\(\{/g)].at(-1);assert(match);body=body.slice(0,match.index)+'window.__gameCheck='+body.slice(match.index);await route.fulfill({response,body});});
  await p.goto(url,{waitUntil:'networkidle',timeout:60000});const build=await p.locator('#home-release').getAttribute('title');if(process.env.W2T_EXPECT_BUILD)assert.equal(build,`Build ${process.env.W2T_EXPECT_BUILD}`);
  await p.locator('#menu-settings').click();await p.selectOption('#display-resolution',`${width}x${height}`);await p.selectOption('#display-mode','native');await p.locator('#menu-back').click();
  await p.locator(mode==='campaign'?'#menu-campaign':'#menu-skirmish').click();await p.selectOption('#faction-select',faction);
  if(mode==='campaign')await p.locator('#campaign-next-faction').click();
  await p.selectOption('#difficulty-select','beginner');
  if(mode==='campaign'){await p.locator('#campaign-next-difficulty').click();await p.locator('[data-campaign-mission="the-siege"]').click();}else await p.selectOption('#map-select','twinwake');
  await p.locator('#start-match').click();await p.waitForFunction(()=>!window.__gameCheck.scene.keys.BootScene.restartPending);
  await p.evaluate(()=>{window.__techButtonClicks=[];document.addEventListener('click',event=>{const id=event.target instanceof Element?event.target.closest('button')?.id:null;if(id==='upgrade-base'||id?.startsWith('research-'))window.__techButtonClicks.push(id);});});
  const snapshot=()=>p.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;return {research:structuredClone(s.research),base:structuredClone(s.combat.baseDevelopment),wood:s.gathering.wood,gold:s.gathering.goldBalance,elapsed:s.waves.elapsedSeconds,playing:s.gameplayActive(),selected:s.selectedBuilding,buttonClicks:[...window.__techButtonClicks]};});
  const world=async point=>{await p.evaluate(point=>window.__gameCheck.scene.keys.BootScene.cameras.main.centerOn(point.x,point.y),point);await p.waitForTimeout(80);const screen=await p.evaluate(point=>{const s=window.__gameCheck.scene.keys.BootScene,c=s.cameras.main,r=s.game.canvas.getBoundingClientRect();return {x:r.left+(point.x-c.worldView.x)*c.zoom*r.width/s.game.canvas.width,y:r.top+(point.y-c.worldView.y)*c.zoom*r.height/s.game.canvas.height};},point);await p.mouse.click(screen.x,screen.y,{delay:140});};
  const clickCard=async(id,zone='center')=>{
   const before=await snapshot(),point=await p.locator('#'+id).evaluate((button,zone)=>{const card=button.parentElement,r=(zone==='button'?button:zone==='detail'?card.querySelector('.research-detail'):card).getBoundingClientRect(),x=zone==='border'?r.left+1:r.left+r.width/2,y=r.top+r.height/2,target=document.elementFromPoint(x,y),cost=card.querySelector('.research-detail')?.textContent.match(/(\d+) wood \+ (\d+) gold/);return {x,y,hit:target?.className??target?.tagName,disabled:button.matches(':disabled'),reason:document.getElementById(button.id+'-reason')?.textContent,cursor:getComputedStyle(card).cursor,color:getComputedStyle(card).backgroundColor,cost:cost?{wood:Number(cost[1]),gold:Number(cost[2])}:null};},zone);
   await p.mouse.click(point.x,point.y,{delay:160});await p.waitForTimeout(160);const after=await snapshot();clicks.push({id,zone,before,point,after});
   assert(after.elapsed>before.elapsed,'Automatic live match updates must continue across the press');
   if(point.disabled){assert.equal(after.wood,before.wood);assert.equal(after.gold,before.gold);assert.equal(after.buttonClicks.length,before.buttonClicks.length);return {before,after,point};}
   assert(point.cost,'Displayed research cost');assert.equal(before.wood-after.wood,point.cost.wood,`${id}/${zone}: exactly one paid order`);assert.equal(before.gold-after.gold,point.cost.gold);
   assert.equal(after.buttonClicks.filter(k=>k===id).length,before.buttonClicks.filter(k=>k===id).length+1,`${id}: one button activation`);
   if(id==='upgrade-base')assert(after.base.remainingSeconds>0);else assert(after.research.job?.kind===id.slice(9)||after.research.queue?.includes(id.slice(9)),`${id}: real job/queue admission`);
   return {before,after,point};
  };
  await world(await p.evaluate(()=>window.__gameCheck.scene.keys.BootScene.gathering.base));
  if(mode==='skirmish'){const blocked=await clickCard('research-workerTools');assert(blocked.point.disabled,'Fresh unfunded research must stay blocked');}
  for(const code of ['icanseemyhousefromhere','foggoffnow']){await p.locator('#game canvas').focus();await p.keyboard.press('Enter');await p.locator('#cheat-code').fill(code);await p.locator('#cheat-form button[type="submit"]').click();}
  await p.screenshot({path:`${out}/${mode}-${faction}-${width}-ready.png`});
  const tools=await clickCard('research-workerTools');assert(!tools.point.disabled);await clickCard('research-workerTools','detail');
  await clickCard('upgrade-base','border');await clickCard('upgrade-base','center');
  await p.screenshot({path:`${out}/${mode}-${faction}-${width}-base.png`});
  await world(await p.evaluate(()=>window.__gameCheck.scene.keys.BootScene.gathering.units.find(u=>u.kind==='worker').position));await p.locator('#build-forge').click();
  // Choose reachable candidates using the actual HUD preview. The final world
  // click still performs the full ordinary placement transaction and routing.
  const sites=await p.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene,worker=s.gathering.units.find(u=>u.kind==='worker'&&u.selected),points=[];for(let y=128;y<Math.min(992,s.map.height-64);y+=32)for(let x=128;x<Math.min(992,s.map.width-64);x+=32)points.push({x,y});points.sort((a,b)=>Math.hypot(a.x-worker.position.x,a.y-worker.position.y)-Math.hypot(b.x-worker.position.x,b.y-worker.position.y));const valid=[];for(const point of points){s.previewPoint=point;s.syncPlacement();if(!s.placementFeedbackError)valid.push(point);if(valid.length===12)break;}return valid;});
  for(const site of sites){await world(site);if(await p.evaluate(()=>!!window.__gameCheck.scene.keys.BootScene.placement.forge))break;}
  await p.waitForFunction(()=>window.__gameCheck.scene.keys.BootScene.placement.forge?.construction.remainingSeconds===0,null,{timeout:45000});
  await world(await p.evaluate(()=>{const f=window.__gameCheck.scene.keys.BootScene.placement.forge.footprint;return {x:f.x+f.width/2,y:f.y+f.height/2};}));
  await clickCard('research-attack','detail');await clickCard('research-attack','center');await clickCard('research-defense','button');
  await p.screenshot({path:`${out}/${mode}-${faction}-${width}-forge.png`});
  await p.locator('#match-menu-button').click();const saved=await snapshot();await p.locator('#save-match').click();assert.match(await p.locator('#save-status').innerText(),/saved/i);await p.locator('#load-match').click();await p.waitForFunction(()=>!window.__gameCheck.scene.keys.BootScene.restartPending&&window.__gameCheck.scene.keys.BootScene.session.phase==='paused');
  const restored=await snapshot();assert.deepEqual(restored.research,saved.research);assert.deepEqual(restored.base,saved.base);await p.locator('#resume-match').click();
  await p.waitForFunction(()=>window.__gameCheck.scene.keys.BootScene.research.workerTools===1&&window.__gameCheck.scene.keys.BootScene.combat.baseDevelopment.level===2,null,{timeout:35000});
  await world(await p.evaluate(()=>window.__gameCheck.scene.keys.BootScene.gathering.base));await clickCard('research-workerTools','center');
  assert.deepEqual(errors,[]);results.push({scenario,build,clicks,saved,restored,final:await snapshot(),errors});await p.close();console.log('PASS live full-card input',mode,faction,width);
 }
 await writeFile(`${out}/browser.json`,JSON.stringify({url,note:'Automatic scene updates run throughout; no injected research/buildings, no manual ticks or scene freezing. Resource/reveal cheats use their real dialog; campaign progression ledger only unlocks the authored mission. Physical160ms card-center/border/detail/button clicks verify jobs, exact single payment, disabled guards and Menu Save/Load.',results},null,2)+'\n');
}catch(error){await writeFile(`${out}/failure.json`,JSON.stringify({url,results,error:String(error)},null,2)+'\n');throw error;}
finally {await browser.close();}

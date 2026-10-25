import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from '../presentations/agentic-coding/node_modules/playwright-core/index.mjs';
const out='artifacts/gameplay-improvements';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.W2T_BROWSER_EXECUTABLE??'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),reports=[];
try{
 for(const width of [800,1280]){
  const page=await browser.newPage({viewport:{width,height:width===800?600:720}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/src/main.ts*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__gameCheck=new Phaser.Game({')});});
  await page.goto(process.env.W2T_UI_URL??'http://127.0.0.1:5186');await page.locator('#menu-settings').click();await page.selectOption('#display-resolution',width===800?'800x600':'1280x720');await page.selectOption('#display-mode','native');await page.locator('#menu-back').click();await page.locator('#menu-skirmish').click();await page.selectOption('#map-select','plains96');await page.locator('#start-match').click();await page.waitForFunction(()=>!window.__gameCheck.scene.keys.BootScene.restartPending);
  // Stop gameplay time only for deterministic input assertions. Rendering/input still run.
  await page.evaluate(async()=>{const s=window.__gameCheck.scene.keys.BootScene;s.__liveUpdate=s.update;s.__liveSceneUpdate=s.sys.sceneUpdate;s.update=()=>{};s.sys.sceneUpdate=()=>{};const {matchFog}=await import('/src/gameplay/matchFog.ts');s.gathering.units.forEach((u,i)=>{u.order={kind:'idle'};u.navigation=undefined;u.selected=false;u.position={x:800+i*256,y:700+i*128};u.target={...u.position};});s.fog=matchFog(s.currentMatch());s.syncVisuals();});
  const idle=[];
  for(const expected of ['unit-1','unit-2','unit-3','unit-1']){
   await page.locator('#idle-workers').click();
   const state=await page.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene,u=s.gathering.units.filter(u=>u.selected),v=s.visibleCamera(),b=document.getElementById('idle-workers').getBoundingClientRect();return {ids:u.map(u=>u.id),onScreen:u.every(u=>u.position.x>=v.x&&u.position.x<=v.x+v.width&&u.position.y>=v.y&&u.position.y<=v.y+v.height),ringVisible:u.every(u=>s.visuals.get(u.id)?.ring.visible),buttonVisible:b.width>0&&b.height>0&&b.bottom<=innerHeight,label:document.getElementById('idle-workers').textContent};});
   assert.deepEqual(state.ids,[expected]);assert(state.onScreen);assert(state.ringVisible);assert(state.buttonVisible);assert.match(state.label,/3/);idle.push(state);
  }
  await page.screenshot({path:`${out}/idle-${width}.png`});
  await page.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;s.gathering.units[0].order={kind:'gather',nodeId:s.gathering.node.id};s.gathering.units[1].order={kind:'deliver',nodeId:s.gathering.node.id};s.syncVisuals();});await page.locator('#idle-workers').click();assert.deepEqual(await page.evaluate(()=>window.__gameCheck.scene.keys.BootScene.gathering.units.filter(u=>u.selected).map(u=>u.id)),['unit-3']);
  await page.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;s.gathering.units[2].order={kind:'move'};s.syncVisuals();});assert(await page.locator('#idle-workers').isDisabled());
  const setup=await page.evaluate(async()=>{
   const s=window.__gameCheck.scene.keys.BootScene,{createMatch}=await import('/src/gameplay/match.ts'),{bodyFits}=await import('/src/gameplay/map.ts');
   const m=createMatch('skirmish','normal',undefined,'plains96');m.fog.revealed=true;m.gathering.wood=1000;m.gathering.goldBalance=500;
   const base=m.gathering.base,p={x:base.x+160,y:Math.floor((base.y+96)/32)*32},locations=[];
   for(let y=800;y<m.map.height-64&&locations.length<64;y+=96)for(let x=32;x<m.map.width-64&&locations.length<64;x+=96)if(bodyFits(m.map,{x:x+32,y:y+32},32)){const f={x,y,width:64,height:64};locations.push(f);m.map.obstacles.push(f);}
   m.placement.farms=locations.map((footprint,i)=>({id:`farm-${i+1}`,owner:'player',hp:80,footprint,construction:{remainingSeconds:0,builderId:null}}));m.placement.nextFarmNumber=65;
   for(let y=base.y-160;y<base.y+640&&m.gathering.units.length<256;y+=32)for(let x=base.x-160;x<base.x+640&&m.gathering.units.length<256;x+=32){if(!bodyFits(m.map,{x,y},12)||x>=p.x-32&&x<=p.x+64&&y>=p.y-32&&y<=p.y+64)continue;m.gathering.units.push({...m.gathering.units[0],id:`unit-${m.gathering.units.length+1}`,kind:'soldier',hp:60,cargo:0,selected:false,position:{x,y},target:{x,y},order:{kind:'idle'}});}
   m.production.nextUnitNumber=m.soldierProduction.nextUnitNumber=m.gathering.units.length+1;m.gathering.units.forEach((u,i)=>u.selected=i===0);
   s.applyMatch(m);s.cameras.main.setBounds(0,0,s.map.width,s.map.height);const {cameraFocus}=await import('/src/presentation/cameraFocus.ts');s.setCameraScroll(cameraFocus([p],s.map,s.visibleCamera()));s.syncVisuals();
   window.__point=p;window.__previewTimes=[];const sync=s.syncPlacement.bind(s);s.syncPlacement=()=>{const t=performance.now();sync();window.__previewTimes.push(performance.now()-t);};
   const down=s.processDown.bind(s);s.processDown=p=>{const t=performance.now();down(p);window.__clickMs=performance.now()-t;};
   return {units:m.gathering.units.length,farms:locations.length,obstacles:m.map.obstacles.length,world:[m.map.width,m.map.height]};
  });
  assert.equal(setup.units,256);assert(await page.locator('#build-farm').isEnabled());await page.locator('#build-tower').click();
  const screen=async point=>page.evaluate(point=>{const s=window.__gameCheck.scene.keys.BootScene,v=s.visibleCamera(),c=s.cameras.main,b=s.game.canvas.getBoundingClientRect();return {x:b.x+(c.x+(point.x-v.x)*c.zoom)*b.width/s.game.canvas.width,y:b.y+(c.y+(point.y-v.y)*c.zoom)*b.height/s.game.canvas.height};},point);
  const p=await page.evaluate(()=>window.__point),sp=await screen(p);
  const preview=[];
  for(let i=0;i<12;i++){await page.mouse.move(sp.x+i%4,sp.y+i%3);await page.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;s.syncPlacement();});preview.push(await page.evaluate(()=>window.__gameCheck.scene.keys.BootScene.placementFeedbackError));}
  assert(preview.every(x=>x===null));await page.screenshot({path:`${out}/tower-preview-${width}.png`});
  // Cancel and re-enter through actual controls, then click to pay/place once.
  await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>window.__gameCheck.scene.keys.BootScene.placement.active),false);await page.locator('#build-tower').click();await page.mouse.click(sp.x,sp.y);
  const placement=await page.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;return {count:s.placement.defenses?.length,active:s.placement.active,wood:s.gathering.wood,gold:s.gathering.goldBalance,clickMs:window.__clickMs,previewMs:window.__previewTimes};});assert.equal(placement.count,1);assert.equal(placement.active,false);assert.equal(placement.wood,950);assert.equal(placement.gold,480);assert(placement.clickMs<1000);
  // Overlapping a paid site remains red and cannot double-charge.
  await page.locator('#build-tower').click();await page.mouse.move(sp.x,sp.y);await page.evaluate(()=>window.__gameCheck.scene.keys.BootScene.syncPlacement());assert(await page.evaluate(()=>!!window.__gameCheck.scene.keys.BootScene.placementFeedbackError));await page.mouse.click(sp.x,sp.y);assert.equal(await page.evaluate(()=>window.__gameCheck.scene.keys.BootScene.placement.defenses.length),1);await page.screenshot({path:`${out}/tower-invalid-${width}.png`});await page.keyboard.press('Escape');
  const save=await page.evaluate(async()=>{const s=window.__gameCheck.scene.keys.BootScene,{encodeSave,decodeSave}=await import('/src/gameplay/save.ts'),{updateMatch}=await import('/src/gameplay/match.ts');const json=encodeSave(s.currentMatch(),{camera:{x:0,y:0},building:null}),loaded=decodeSave(json);if(!loaded.ok)throw Error(loaded.error);let m=loaded.match;m.paused=false;const times=[];for(let i=0;i<12;i++){const t=performance.now();m=updateMatch(m,.05);times.push(performance.now()-t);}return {bytes:new TextEncoder().encode(json).length,units:m.gathering.units.length,farms:m.placement.farms.length,tickMs:times};});assert.equal(save.units,256);assert.equal(save.farms,64);assert.deepEqual(errors,[]);
  await page.locator('#build-tower').click();
  await page.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;window.__liveSamples=[];window.__liveStart=s.waves.elapsedSeconds;s.update=s.__liveUpdate;s.sys.sceneUpdate=function(time,delta){const t=performance.now();s.__liveSceneUpdate.call(s,time,delta);window.__liveSamples.push(performance.now()-t);};});
  for(let i=0;i<20;i++)await page.mouse.move(sp.x+(i%5)*5,sp.y+Math.floor(i/5)*5);
  await page.waitForFunction(()=>window.__liveSamples.length>=40,null,{timeout:30000});
  const live=await page.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene,samples=window.__liveSamples.slice(5).sort((a,b)=>a-b),seconds=s.waves.elapsedSeconds-window.__liveStart;s.update=()=>{};s.sys.sceneUpdate=()=>{};return {frames:samples.length,seconds,active:s.placement.active,medianCPU:samples[Math.floor(samples.length*.5)],p95CPU:samples[Math.floor(samples.length*.95)]};});assert(live.seconds>0);assert(live.active);await page.keyboard.press('Escape');
  const air=await page.evaluate(async()=>{
   const s=window.__gameCheck.scene.keys.BootScene,{updateCombat}=await import('/src/gameplay/combat.ts');
   const target={id:'enemy-air-check',owner:'enemy',kind:'unit',role:'air',hp:150,position:{x:690,y:450},order:{kind:'idle'}},flyer={id:'unit-300',kind:'soldier',archetype:'air',faction:'crown',owner:'player',hp:180,cargo:0,selected:true,position:{x:530,y:450},target:{x:530,y:450},order:{kind:'attack',enemyId:target.id}};
   s.gathering.units=[flyer];s.combat.enemies=[target];s.combat.projectiles=[];s.selectedBuilding=null;s.placement.active=false;
   s.placement.defenses=[{id:'tower-100',kind:'tower',owner:'player',footprint:{x:512,y:416,width:32,height:32},hp:160,construction:{remainingSeconds:0,builderId:null},level:2,specialization:'air',upgradeRemaining:null,cooldown:0}];
   let shots=0;for(let i=0;i<25;i++){if(!s.combat.enemies.length)break;s.combat.enemies[0].position={x:690,y:450+Math.sin(i*.2)*65};const r=updateCombat(s.gathering,s.combat,.05,s.map,s.placement);s.gathering=r.gathering;s.combat=r.combat;s.placement=r.placement;shots+=s.combat.projectiles?.length??0;}
   const hp=s.combat.enemies[0]?.hp??0;s.syncVisuals();s.visualTime+=1;s.syncVisuals();return {hp,initialHP:150,shots};
  });assert(air.hp<air.initialHP);assert(air.shots>0);await page.screenshot({path:`${out}/air-${width}.png`});
  reports.push({width,idle,setup,placement,save,live,air,errors});await page.close();
 }
 await writeFile(`${out}/browser.json`,JSON.stringify({browser:browser.version(),note:'Explicit stress bodies/buildings and frozen gameplay for deterministic UI;12 real updateMatch ticks after Save/load and40 live scene frames during pointer motion are measured separately. Not human playtesting.',reports},null,2)+'\n');console.log(JSON.stringify(reports));
}finally{await browser.close();}

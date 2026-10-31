import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {chromium} from '../presentations/agentic-coding/node_modules/playwright-core/index.mjs';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const report=[],errors=[];
try{
 const p=await browser.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/src/main.ts*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__gameCheck=new Phaser.Game({')});});
 await p.goto('http://127.0.0.1:5195',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__gameCheck?.scene.keys.BootScene?.session&&document.querySelector('#map-select option[value="twinwake"]'));
 await p.locator('#menu-settings').click();await p.selectOption('#display-resolution','1280x720');await p.selectOption('#display-mode','native');await p.locator('#menu-back').click();await p.locator('#menu-skirmish').click();await p.selectOption('#map-select','twinwake');await p.locator('#start-match').click();await p.waitForFunction(()=>window.__gameCheck?.scene.keys.BootScene?.gathering&&!window.__gameCheck.scene.keys.BootScene.restartPending);
 await p.evaluate(async()=>{const s=window.__gameCheck.scene.keys.BootScene,{createMatch}=await import('/src/gameplay/match.ts');s.update=()=>{};s.sys.sceneUpdate=()=>{};window.__crossingMatch=createMatch('skirmish','normal',{player:'crown',enemy:'clans'},'twinwake');});
 for(const phase of ['sailing','landed','damage']){
  const state=await p.evaluate(async phase=>{const s=window.__gameCheck.scene.keys.BootScene,{updateMatch}=await import('/src/gameplay/match.ts');let m=window.__crossingMatch;
   for(let i=0;i<1440&&m.outcome==='playing';i++){m=updateMatch(m,.5);if(phase==='damage'?m.combat.baseHP<240:m.enemyNaval.phase===phase)break;}
   window.__crossingMatch=m;const ship=m.combat.enemies.find(e=>e.kind==='ship'&&!e.navalRole),troop=m.combat.enemies.find(e=>e.navalLanding&&e.kind==='unit');
   // Reveal only the rendered copy. The AI simulation retains its normal fog and economy.
   const shown=structuredClone(m);shown.fog.teams.player.visible.fill(true);shown.fog.teams.player.explored.fill(true);s.applyMatch(shown);s.selectedBuilding=null;s.cameras.main.setZoom(1);const focus=phase==='sailing'?ship?.position:troop?.position??m.gathering.base;if(focus)s.cameras.main.centerOn(focus.x,focus.y);s.syncVisuals();
   return {requested:phase,phase:m.enemyNaval.phase,time:m.waves.elapsedSeconds,baseHP:m.combat.baseHP,ships:m.combat.enemies.filter(e=>e.kind==='ship').map(e=>({role:e.navalRole??'transport',hp:e.hp,position:e.position})),passengers:m.enemyNaval.passengers.length,landed:m.combat.enemies.filter(e=>e.navalLanding&&e.kind==='unit').length,spent:m.enemyProduction.spent};
  },phase);
  if(phase==='damage')assert(state.baseHP<240,JSON.stringify(state));else assert.equal(state.phase,phase,JSON.stringify(state));
  await p.screenshot({path:`artifacts/island-fleets/crossing-${phase}.png`});report.push(state);
 }
 assert.deepEqual(errors,[]);await writeFile('artifacts/island-fleets/crossing-browser.json',JSON.stringify({report,errors},null,2));console.log('PASS normal-start AI sailing, landing and actual base damage rendered in Chrome');
}finally{await browser.close();}

import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from '../presentations/agentic-coding/node_modules/playwright-core/index.mjs';
const out='artifacts/quality-release';await mkdir(out,{recursive:true});
const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),results=[];
try{for(const width of [800,1280])for(const id of ['first-steps','the-siege','skirmish']){
 const height=width===800?600:720,p=await b.newPage({viewport:{width,height}}),errors=[];
 await p.routeWebSocket('**',ws=>ws.close());p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/src/main.ts*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__gameCheck=new Phaser.Game({')});});
 await p.goto(process.env.W2T_UI_URL??'http://127.0.0.1:5261');
 // Explicit completion ledger unlocks replay selection; no campaign victory is claimed.
 await p.evaluate(async()=>{const {seed}=await import('/src/gameplay/testHelpers/campaignBrowserFixture.ts');localStorage.setItem('warcraft-2-tribute.campaign.v2',JSON.stringify(seed()));});
 await p.reload();await p.locator('#menu-settings').click();await p.selectOption('#display-resolution',`${width}x${height}`);await p.selectOption('#display-mode','native');await p.locator('#menu-back').click();
 if(id==='skirmish'){await p.locator('#menu-skirmish').click();await p.selectOption('#faction-select','crown');}
 else {await p.locator('#menu-campaign').click();await p.selectOption('#faction-select','crown');await p.locator('#campaign-next-faction').click();await p.selectOption('#difficulty-select','normal');await p.locator('#campaign-next-difficulty').click();await p.locator(`[data-campaign-mission="${id}"]`).click();}
 await p.locator('#start-match').click();await p.waitForFunction(()=>!window.__gameCheck.scene.keys.BootScene.restartPending);
 const detail=await p.evaluate(async()=>{const s=window.__gameCheck.scene.keys.BootScene;s.sys.sceneUpdate=()=>{};s.gathering.units[0].selected=true;s.selectedBuilding=null;s.syncVisuals();const {campaignActionReason}=await import('/src/config/campaignContent.ts');const buttons=[...document.querySelectorAll('[data-action-group="Build"] button')];return {mission:s.campaignMission??'skirmish',buildings:buttons.filter(b=>!b.parentElement.hidden).map(b=>b.id),lockedVisible:buttons.filter(b=>!b.parentElement.hidden&&campaignActionReason(s.currentMatch(),b.id)).map(b=>b.id)};});
 const bounds=await p.locator('[data-action-group="Build"] .control:not([hidden])>button').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().toJSON()));for(const r of bounds)assert(r.x>=0&&r.right<=width&&r.bottom<=height,JSON.stringify(r));assert.deepEqual(detail.lockedVisible,[]);assert(detail.buildings.includes('build-barracks'));assert.equal(detail.buildings.includes('build-forge'),id!=='first-steps');if(id==='skirmish')assert(detail.buildings.includes('build-navalAcademy'));assert.equal(detail.mission,id);
 await p.screenshot({path:`${out}/build-menu-${id}-${width}.png`});assert.deepEqual(errors,[]);results.push({width,id,...detail,errors});await p.close();
}await writeFile(`${out}/campaign-build-menu.json`,JSON.stringify(results,null,2));console.log('PASS early campaign / forge unlock / full skirmish build menu at800/1280');}finally{await b.close();}

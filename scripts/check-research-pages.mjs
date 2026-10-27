import assert from 'node:assert/strict';import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from '../presentations/agentic-coding/node_modules/playwright-core/index.mjs';
const out='artifacts/attack-expansion';await mkdir(out,{recursive:true});const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),results=[];
try{for(const width of [640,800,1024,1280,1920]){
 const height=width<=800?600:width===1024?768:width===1280?720:1080,p=await browser.newPage({viewport:{width,height}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(({width,height})=>localStorage.setItem('warcraft-2-tribute.preferences.v1',JSON.stringify({version:1,settings:{display:{resolution:`${width===640?800:width}x${height}`,mode:'native'}}})),{width,height});
 await p.route('**/src/main.ts*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__gameCheck=new Phaser.Game({')});});
 await p.goto(process.env.W2T_UI_URL??'http://127.0.0.1:5193');await p.locator('#menu-skirmish').click();await p.locator('#start-match').click();await p.waitForFunction(()=>!window.__gameCheck.scene.keys.BootScene.restartPending);
 await p.evaluate(async()=>{const s=window.__gameCheck.scene.keys.BootScene;s.update=()=>{};s.sys.sceneUpdate=()=>{};const {applyResourceCheat,resourceCheatCode}=await import('/src/gameplay/cheats.ts');s.applyMatch(applyResourceCheat(s.currentMatch(),resourceCheatCode));s.selectedBuilding='base';s.syncVisuals();});
 const reached=[];
 for(let page=0;page<2;page++){
  const state=await p.evaluate(()=>{const section=document.querySelector('[data-action-group="Research"]'),wrappers=[...section.querySelectorAll('.control:not([hidden])')],rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};};return {options:wrappers.map(e=>({id:e.querySelector('button').id,...rect(e),label:e.getAttribute('aria-label'),tooltip:e.dataset.tooltip})),research:rect(section),queue:rect(document.getElementById('production-queue')),bar:rect(document.getElementById('bottom-bar')),page:section.querySelector('.research-pages').textContent,canvas:{w:window.__gameCheck.canvas.width,h:window.__gameCheck.canvas.height}};});
  const rows=new Set(state.options.map(e=>e.top.toFixed(1)));assert(rows.size<=2);assert(state.options.length<=8);for(const option of state.options){assert(option.bottom<=state.bar.bottom+1);assert(option.right<=state.queue.left+1);assert(option.label&&option.tooltip);}reached.push(...state.options.map(e=>e.id));
  await p.screenshot({path:`${out}/research-${width}-page-${page+1}.png`});results.push({width,page:page+1,...state});
  if(page===0)await p.getByRole('button',{name:'Next research page',exact:true}).click();
 }
 assert(reached.includes('research-navalLogistics'));assert.equal(new Set(reached).size,9);
 // A normal visual sync must preserve the page and cost/status. Click the enabled
 // Worker Tools option on the previous page and verify real paid research starts.
 await p.evaluate(()=>window.__gameCheck.scene.keys.BootScene.syncVisuals());assert(await p.locator('#research-navalLogistics').isVisible());
 await p.getByRole('button',{name:'Previous research page',exact:true}).click();await p.locator('#research-workerTools').hover();await p.waitForTimeout(180);assert.match(await p.locator('#action-tooltip').textContent(),/wood|gold/);
 await p.locator('#research-workerTools').click();assert.equal(await p.evaluate(()=>window.__gameCheck.scene.keys.BootScene.research.job?.kind),'workerTools');
 // Selection changes reset pagination and never leave a now-hidden page selected.
 await p.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;s.selectedBuilding=null;s.syncVisuals();s.selectedBuilding='base';s.syncVisuals();});assert(await p.locator('#research-workerTools').isVisible());assert.deepEqual(errors,[]);await p.close();
}await writeFile(`${out}/research-browser.json`,JSON.stringify({results},null,2)+'\n');console.log('PASS research paging, costs/status, paid click, boundaries at 640/800/1024/1280/1920');}finally{await browser.close();}

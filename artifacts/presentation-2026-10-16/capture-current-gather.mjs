import {chromium} from '/Users/tobiasbertilsson/kod/fasskoll/node_modules/playwright-core/index.mjs';
import {writeFile} from 'node:fs/promises';
const out='/Users/tobiasbertilsson/kod/w2t/artifacts/presentation-2026-10-16';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const reports=[];
try {
for(const map of ['lakehold']){
const p=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.route('**/src/main.ts*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__gameCheck=new Phaser.Game({')});});
await p.goto('http://127.0.0.1:5198',{waitUntil:'networkidle'});await p.locator('#menu-settings').click();await p.selectOption('#display-resolution','1920x1080');await p.selectOption('#display-mode','native');await p.locator('#menu-back').click();await p.locator('#menu-skirmish').click();await p.selectOption('#map-select',map);await p.locator('#start-match').click();await p.waitForFunction(()=>window.__gameCheck?.scene.keys.BootScene?.session.phase==='playing'&&!window.__gameCheck.scene.keys.BootScene.restartPending);await p.waitForTimeout(1500);

await p.evaluate(async()=>{const {updatePreferences}=await import('/src/presentation/preferences.ts');updatePreferences({camera:{edgePan:false}});});
const box=await p.locator('#game canvas').boundingBox();await p.mouse.move(box.x+220,box.y+200);await p.mouse.down();await p.mouse.move(box.x+580,box.y+350);await p.mouse.up();
const node=await p.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene,c=s.cameras.main,b=s.game.canvas.getBoundingClientRect(),n=s.gathering.node.position;return {x:b.x+(n.x-c.scrollX)*c.zoom,y:b.y+(n.y-c.scrollY)*c.zoom};});await p.mouse.click(node.x,node.y,{button:'right'});await p.mouse.move(1910,1070);await p.waitForTimeout(12000);await p.screenshot({path:`${out}/04-nu-gameplay-resursinsamling.png`});if(errors.length)throw Error(JSON.stringify(errors));await p.close();}
}finally{await browser.close();}

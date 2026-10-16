import {chromium} from '/Users/tobiasbertilsson/kod/fasskoll/node_modules/playwright-core/index.mjs';
import {writeFile} from 'node:fs/promises';
const out='/Users/tobiasbertilsson/kod/w2t/artifacts/presentation-2026-10-16';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const reports=[];
try {
const old=await browser.newPage({viewport:{width:820,height:700}});const oldErrors=[];old.on('pageerror',e=>oldErrors.push(e.message));await old.goto('http://127.0.0.1:5199');await old.locator('#game canvas').waitFor();await old.waitForTimeout(1000);await old.screenshot({path:`${out}/01-tidig-mvp-start.png`});reports.push({file:'01-tidig-mvp-start.png',commit:'6740128',type:'Historical version rerun, normal start',errors:oldErrors});await old.close();
for(const map of ['lakehold','fivepasses','rivercrown']){
const p=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.route('**/src/main.ts*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__gameCheck=new Phaser.Game({')});});
await p.goto('http://127.0.0.1:5198',{waitUntil:'networkidle'});await p.locator('#menu-settings').click();await p.selectOption('#display-resolution','1920x1080');await p.selectOption('#display-mode','native');await p.locator('#menu-back').click();await p.locator('#menu-skirmish').click();await p.selectOption('#map-select',map);await p.locator('#start-match').click();await p.waitForFunction(()=>window.__gameCheck?.scene.keys.BootScene?.session.phase==='playing'&&!window.__gameCheck.scene.keys.BootScene.restartPending);await p.waitForTimeout(1500);
await p.evaluate(async()=>{const {updatePreferences}=await import('/src/presentation/preferences.ts');updatePreferences({camera:{edgePan:false}});const s=window.__gameCheck.scene.keys.BootScene;s.update=()=>{};s.sys.sceneUpdate=()=>{};});await p.mouse.move(1910,1070);
if(map==='lakehold'){await p.screenshot({path:`${out}/03-nu-gameplay-bas.png`});reports.push({file:'03-nu-gameplay-bas.png',type:'Current local normal match start'});}
await p.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene,c=s.cameras.main;c.removeBounds();c.setZoom(Math.min(c.width/s.map.width,c.height/s.map.height)*.96);c.centerOn(s.map.width/2,s.map.height/2);s.syncVisuals();});await p.waitForTimeout(200);await p.screenshot({path:`${out}/karta-${map}-fog.png`});
const info=await p.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene;for(const t of Object.values(s.fog.teams)){t.visible.fill(true);t.explored.fill(true);}s.syncVisuals();return {map:s.map.id,width:s.map.width,height:s.map.height};});await p.waitForTimeout(200);await p.screenshot({path:`${out}/karta-${map}-utan-fog.png`});reports.push({...info,files:[`karta-${map}-fog.png`,`karta-${map}-utan-fog.png`],type:'Actual Phaser map, same camera; full visibility injected only for second image',errors});
if(map!=='fivepasses'){await p.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene,c=s.cameras.main;c.setZoom(1);c.centerOn(s.map.width/2,s.map.height/2);s.syncVisuals();});await p.waitForTimeout(200);await p.screenshot({path:`${out}/detalj-${map}-utan-fog.png`});}
if(errors.length)throw Error(JSON.stringify(errors));await p.close();console.log('Captured '+map);
}
await writeFile(`${out}/capture.json`,JSON.stringify(reports,null,2));
}finally{await browser.close();}

// Actual Phaser updates + CDP sampling; identical fixture before/after, no tick throttling.
import {createServer} from 'vite';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from '../presentations/agentic-coding/node_modules/playwright-core/index.mjs';
const stage=process.env.W2T_STAGE??'before',players=Number(process.env.W2T_PLAYERS??2),count=Number(process.env.W2T_ARMY??80),duration=Number(process.env.W2T_SECONDS??40),gate=process.env.W2T_GATE==='1',out='artifacts/army-movement';await mkdir(out,{recursive:true});
const originals=new Map(stage.startsWith('before')?execFileSync('git',['diff','--name-only',process.env.W2T_BASELINE_REF??'HEAD','--','src/gameplay','src/config'],{encoding:'utf8'}).trim().split('\n').filter(p=>p.endsWith('.ts')&&!p.endsWith('.test.ts')&&!p.includes('/testHelpers/')).filter(p=>{try{execFileSync('git',['cat-file','-e',`${process.env.W2T_BASELINE_REF??'HEAD'}:${p}`],{stdio:'ignore'});return true;}catch{return false;}}).map(p=>[resolve(p),execFileSync('git',['show',`${process.env.W2T_BASELINE_REF??'HEAD'}:${p}`],{encoding:'utf8'})]):[]);
const uncachedGate=process.env.W2T_GATE_UNCACHED==='1',mapPath=resolve('src/gameplay/map.ts');
let uncachedMap;
if(uncachedGate){const current=readFileSync(mapPath,'utf8'),start=current.indexOf('const enemyPassageCache=');assert(start>=0);uncachedMap=current.slice(0,start)+"export function enemyNavigationMap(map:WorldMap):WorldMap{return map.enemyPassageBlocks?.length?{...map,enemyPassageBlocks:undefined,obstacles:[...map.obstacles,...map.enemyPassageBlocks]}:map;}\n";}
const server=await createServer({plugins:[{name:'measured-baseline',enforce:'pre',load(id){const path=id.split('?')[0];return uncachedMap&&path===mapPath?uncachedMap:originals.get(path);}}],server:{host:'127.0.0.1',port:5195,strictPort:true}});await server.listen();let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('warcraft-2-tribute.preferences.v1',JSON.stringify({version:1,settings:{display:{resolution:'1280x720',mode:'native'}}})));
 await page.route('**/src/main.ts*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__gameCheck=new Phaser.Game({')});});
 await page.goto('http://127.0.0.1:5195');await page.locator('#menu-skirmish').click();await page.locator('#start-match').click();await page.waitForFunction(()=>!window.__gameCheck.scene.keys.BootScene.restartPending);
 const cdp=await page.context().newCDPSession(page);await cdp.send('Profiler.enable');await cdp.send('Profiler.start');
 await page.evaluate(async({players,count,gate})=>{
  const s=window.__gameCheck.scene.keys.BootScene,f=await import('/src/gameplay/testHelpers/armyMovementPerformance.ts');
  const m=f.armyMovementFixture(players,count,gate);s.applyMatch(m);s.setCameraScroll({x:m.gathering.base.x-160,y:m.gathering.base.y-200});s.syncVisuals();
  window.__metrics={updates:[],visuals:[],render:[],frames:[],events:[]};const ms=window.__metrics,original=s.update;let assembled=false,dispatched=false,revealed=false,fought=false,last=0,renderStart=0,phase='assembly';
  s.update=function(time,delta){const started=performance.now();if(!assembled){this.applyMatch(f.assembleArmy(this.currentMatch()));assembled=true;}if(!dispatched&&this.waves.elapsedSeconds>=603){this.applyMatch(f.dispatchArmy(this.currentMatch()));dispatched=true;ms.events.push({kind:'dispatch',seconds:this.waves.elapsedSeconds-600});}phase=fought?'combat':revealed?'contact':dispatched?'pathing':'assembly';const result=original.call(this,time,delta),cpu=performance.now()-started,o=f.armyObservation(this.currentMatch());ms.updates.push({ms:cpu,phase,seconds:this.waves.elapsedSeconds-600});if(o.visible&&!revealed){revealed=true;ms.events.push({kind:'reveal',seconds:this.waves.elapsedSeconds-600,ms:cpu});}if(o.damage&&!fought){fought=true;ms.events.push({kind:'combat',seconds:this.waves.elapsedSeconds-600,ms:cpu});}return result;};s.sys.sceneUpdate=s.update;
  const visuals=s.syncVisuals;s.syncVisuals=function(...args){const start=performance.now(),result=visuals.apply(this,args);ms.visuals.push(performance.now()-start);return result;};
  s.game.events.on('step',now=>{if(last)ms.frames.push({ms:now-last,phase,seconds:s.waves.elapsedSeconds-600});last=now;});s.game.events.on('prerender',()=>renderStart=performance.now());s.game.events.on('postrender',()=>ms.render.push(performance.now()-renderStart));
 },{players,count,gate});
 await page.waitForFunction(duration=>window.__gameCheck.scene.keys.BootScene.waves.elapsedSeconds>=600+duration,duration,{timeout:180000,polling:500});
 const {profile}=await cdp.send('Profiler.stop');await writeFile(`${out}/${stage}-${players}.cpuprofile`,JSON.stringify(profile));
 const result=await page.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene,m=window.__metrics,stats=values=>{const xs=values.slice().sort((a,b)=>a-b);return {samples:xs.length,p50:xs[Math.floor(xs.length*.5)],p95:xs[Math.floor(xs.length*.95)],max:xs.at(-1),over50ms:xs.filter(x=>x>50).length};};return {phases:Object.fromEntries(['assembly','pathing','contact','combat'].map(p=>[p,{cpu:stats(m.updates.filter(x=>x.phase===p).map(x=>x.ms)),frames:stats(m.frames.filter(x=>x.phase===p).map(x=>x.ms))}])),cpu:stats(m.updates.map(x=>x.ms)),visuals:stats(m.visuals),render:stats(m.render),frames:stats(m.frames.map(x=>x.ms)),events:m.events,slow:m.updates.filter(x=>x.ms>40),frameStalls:m.frames.filter(x=>x.ms>50),gateBlocks:s.map.enemyPassageBlocks?.length??0,outcome:s.outcome,samples:m};});
 await page.screenshot({path:`${out}/${stage}-${players}.png`});await writeFile(`${out}/${stage}-${players}.json`,JSON.stringify({browser:browser.version(),players,attackers:count*(players-1),gate,uncachedGate,duration,...result,errors},null,2)+'\n');console.log(JSON.stringify({...result,samples:undefined}));assert.deepEqual(errors,[]);assert.equal(result.outcome,'playing');assert.equal(result.gateBlocks,gate?1:0);assert(result.events.some(e=>e.kind==='combat'));
}finally{await browser?.close();await server.close();}

// Real Phaser frames with unchanged default tick frequency and fog; no shipped debug API.
import {createServer} from 'vite';import {execFileSync} from 'node:child_process';import {mkdir,writeFile} from 'node:fs/promises';import {resolve} from 'node:path';import assert from 'node:assert/strict';
import {chromium} from '../presentations/agentic-coding/node_modules/playwright-core/index.mjs';
const stage=process.env.W2T_STAGE??'after',before=stage==='before',out='artifacts/attack-expansion';await mkdir(out,{recursive:true});
const oldFiles=['map.ts','combat.ts','projectiles.ts'].map(f=>resolve('src/gameplay',f));
const server=await createServer({plugins:[{name:'attack-baseline',enforce:'pre',load(id){if(before&&oldFiles.includes(id))return execFileSync('git',['show',`${process.env.W2T_BASELINE_REF??'HEAD'}:${id.slice(process.cwd().length+1)}`],{encoding:'utf8'});}}],server:{host:'127.0.0.1',port:5194,strictPort:true}});await server.listen();let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const p=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('warcraft-2-tribute.preferences.v1',JSON.stringify({version:1,settings:{display:{resolution:'1280x720',mode:'native'}}})));
 await p.route('**/src/main.ts*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__gameCheck=new Phaser.Game({')});});
 await p.goto('http://127.0.0.1:5194');await p.locator('#menu-skirmish').click();await p.locator('#start-match').click();await p.waitForFunction(()=>!window.__gameCheck.scene.keys.BootScene.restartPending);
 const cdp=await p.context().newCDPSession(p);await cdp.send('Profiler.enable');await cdp.send('Profiler.start');
 await p.evaluate(async()=>{
  const s=window.__gameCheck.scene.keys.BootScene,fixture=await import('/src/gameplay/testHelpers/attackPerformance.ts');
  const m=fixture.attackPerformanceFixture();s.applyMatch(m);s.setCameraScroll({x:m.gathering.base.x-160,y:m.gathering.base.y-200});s.syncVisuals();
  const metrics={update:[],syncVisuals:[],render:[],frames:[],longFrames:[],events:[]};window.__attackMetrics=metrics;
  const original=s.update;let revealed=false,fought=false,last=0,startRender=0;
  s.update=function(time,delta){const phase=fought?'combat':revealed?'approach':'hidden',start=performance.now();const result=original.call(this,time,delta),ms=performance.now()-start,o=fixture.attackObservation(this.currentMatch());metrics.update.push({ms,phase});if(o.visible&&!revealed){revealed=true;metrics.events.push({kind:'reveal',ms,seconds:this.waves.elapsedSeconds-600,...o});}if(o.damage&&!fought){fought=true;metrics.events.push({kind:'combat',ms,seconds:this.waves.elapsedSeconds-600,...o});}return result;};s.sys.sceneUpdate=s.update;
  const visuals=s.syncVisuals;s.syncVisuals=function(...args){const start=performance.now(),result=visuals.apply(this,args);metrics.syncVisuals.push(performance.now()-start);return result;};
  s.game.events.on('step',now=>{if(last){metrics.frames.push(now-last);if(now-last>50)metrics.longFrames.push({ms:now-last,updates:metrics.update.length,previousUpdate:metrics.update.at(-1),seconds:s.waves.elapsedSeconds-600});}last=now;});s.game.events.on('prerender',()=>startRender=performance.now());s.game.events.on('postrender',()=>metrics.render.push(performance.now()-startRender));
 });
 // 30 seconds of actual simulation frames from hidden approach through fighting.
 await p.waitForFunction(()=>window.__gameCheck.scene.keys.BootScene.waves.elapsedSeconds>=630,null,{timeout:60000});
 const {profile}=await cdp.send('Profiler.stop');await writeFile(`${out}/native-${stage}.cpuprofile`,JSON.stringify(profile));
 const result=await p.evaluate(()=>{const s=window.__gameCheck.scene.keys.BootScene,m=window.__attackMetrics,stats=values=>{const xs=values.slice().sort((a,b)=>a-b);return {samples:xs.length,median:xs[Math.floor(xs.length*.5)],p95:xs[Math.floor(xs.length*.95)],p99:xs[Math.floor(xs.length*.99)],max:Math.max(...xs),over50ms:xs.filter(x=>x>50).length};};return {phases:Object.fromEntries(['hidden','approach','combat'].map(phase=>[phase,stats(m.update.filter(x=>x.phase===phase).map(x=>x.ms))])),visuals:stats(m.syncVisuals),render:stats(m.render),frames:stats(m.frames),events:m.events,longFrames:m.longFrames,renderer:s.game.renderer.type,canvas:{width:s.game.canvas.width,height:s.game.canvas.height},elapsed:s.waves.elapsedSeconds,outcome:s.outcome};});
 await p.screenshot({path:`${out}/native-${stage}.png`});await writeFile(`${out}/native-${stage}.json`,JSON.stringify({browser:browser.version(),...result,errors},null,2)+'\n');console.log(JSON.stringify(result));assert.deepEqual(errors,[]);assert(result.events.some(e=>e.kind==='reveal'));assert(result.events.some(e=>e.kind==='combat'));assert.equal(result.outcome,'playing');
 if(!before){assert.equal(result.frames.over50ms,0,'Noticeable rendered frame stall');assert(result.phases.combat.p95<16.7);assert(result.phases.combat.over50ms===0);assert(result.events.every(e=>e.ms<50));}
}finally{await browser?.close();await server.close();}

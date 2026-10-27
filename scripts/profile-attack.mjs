// Production gameplay, deterministic 40 attackers vs 24 defenders; CDP CPU profile.
import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';import {resolve} from 'node:path';
import {build} from 'vite';import {mkdir,writeFile,mkdtemp,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import assert from 'node:assert/strict';
import {chromium} from '../presentations/agentic-coding/node_modules/playwright-core/index.mjs';
const stage=process.env.W2T_STAGE??'before',out='artifacts/attack-expansion',dir=await mkdtemp(join(tmpdir(),'warbound-attack-'));
await mkdir(out,{recursive:true});let browser;
try{
 const oldFiles=['map.ts','combat.ts','projectiles.ts'].map(f=>resolve('src/gameplay',f));
 await build({configFile:false,logLevel:'error',plugins:[{name:'attack-baseline',enforce:'pre',load(id){if(stage==='before'&&oldFiles.includes(id))return execFileSync('git',['show',`${process.env.W2T_BASELINE_REF??'HEAD'}:${id.slice(process.cwd().length+1)}`],{encoding:'utf8'});}}],build:{outDir:dir,minify:false,lib:{entry:'src/gameplay/testHelpers/attackPerformance.ts',name:'AttackCheck',formats:['iife'],fileName:'fixture'}}});
 browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const page=await browser.newPage();await page.addScriptTag({path:join(dir,'fixture.iife.js')});
 const cdp=await page.context().newCDPSession(page);await cdp.send('Profiler.enable');await cdp.send('Profiler.start');
 const result=await page.evaluate(()=>{
  let m=AttackCheck.attackPerformanceFixture();const samples=[],events=[];let revealed=false,fought=false;
  for(let i=0;i<1800;i++){const start=performance.now();m=AttackCheck.updateMatch(m,1/60);const ms=performance.now()-start,o=AttackCheck.attackObservation(m);samples.push({frame:i,ms,phase:fought?'combat':revealed?'approach':'hidden'});if(o.visible&&!revealed){revealed=true;events.push({kind:'reveal',frame:i,ms,...o});}if(o.damage&&!fought){fought=true;events.push({kind:'combat',frame:i,ms,...o});}}
  const stats=xs=>{const sorted=xs.map(s=>s.ms).sort((a,b)=>a-b);return {samples:sorted.length,median:sorted[Math.floor(sorted.length*.5)],p95:sorted[Math.floor(sorted.length*.95)],p99:sorted[Math.floor(sorted.length*.99)],max:Math.max(...sorted),over50ms:sorted.filter(x=>x>50).length};};
  return {events,phases:Object.fromEntries(['hidden','approach','combat'].map(p=>[p,stats(samples.filter(s=>s.phase===p))])),final:AttackCheck.attackObservation(m),state:JSON.stringify(m),samples};
 });result.stateHash=createHash('sha256').update(result.state).digest('hex');delete result.state;const {profile}=await cdp.send('Profiler.stop');
 await writeFile(`${out}/cpu-${stage}.cpuprofile`,JSON.stringify(profile));await writeFile(`${out}/cpu-${stage}.json`,JSON.stringify({browser:browser.version(),...result},null,2)+'\n');
 console.log(JSON.stringify({...result,samples:undefined}));assert(result.events.some(e=>e.kind==='reveal'));assert(result.events.some(e=>e.kind==='combat'));assert.equal(result.final.outcome,'playing');if(stage!=='before'){assert(result.phases.hidden.max<100);assert(result.phases.combat.p95<16.7);assert.equal(result.phases.combat.over50ms,0);assert(result.events.every(e=>e.ms<50));}
}finally{await browser?.close();await rm(dir,{recursive:true,force:true});}

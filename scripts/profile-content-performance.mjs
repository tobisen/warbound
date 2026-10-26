// Pure gameplay in Chromium: production bundles, identical workloads, no FPS claim.
// W2T_PROFILE_BASELINE=<git ref> compares against that ref without changing the checkout.
import {build} from 'vite';
import {execFileSync} from 'node:child_process';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.W2T_PLAYWRIGHT_MODULE??'playwright-core');
const directory=await mkdtemp(join(tmpdir(),'w2t-five-profile-'));
const changed=['traffic.ts','fog.ts','forestFog.ts','map.ts','multiplePlayers.ts'].map(f=>`src/gameplay/${f}`);
const entry=`
import {createMatch,updateMatch} from ${JSON.stringify(resolve('src/gameplay/match.ts'))};
import {matchPlayers,playerStart} from ${JSON.stringify(resolve('src/gameplay/players.ts'))};
import {projectMultiplePlayers} from ${JSON.stringify(resolve('src/gameplay/multiplePlayers.ts'))};
export {updateMatch};
export function fixture(count,army){
 let m=createMatch('skirmish','normal',undefined,'plains128',1,'balanced',count>2?matchPlayers(undefined,undefined,count):undefined);
 m.matchId='00000000-0000-4000-8000-000000000001';
 if(!army)return m;
 for(let i=0;i<60;i++)m=updateMatch(m,.5);
 const position=(base,i)=>({x:base.x-160+(i%5)*32,y:base.y+160+Math.floor(i/5)*32});
 for(let i=0;i<16;i++){const p=position(m.gathering.base,i);m.gathering.units.push({id:'unit-'+(100+i),kind:'soldier',owner:'player',hp:60,cargo:0,selected:false,position:p,target:{...p},order:{kind:'idle'}});}
 m.production.nextUnitNumber=m.soldierProduction.nextUnitNumber=200;
 for(const bot of m.multiplePlayers.ai){const base=playerStart(m.map.id,bot.id,m.map.design);for(let i=0;i<20;i++)bot.state.combat.enemies.push({id:'enemy-produced-'+(100+i),kind:'unit',role:'soldier',owner:'enemy',hp:60,position:position(base,i),order:{kind:'idle'}});bot.state.enemyProduction.production.nextUnitNumber=200;}
 return projectMultiplePlayers(m);
}`;
const entryPath=join(directory,'entry.mjs');await writeFile(entryPath,entry);
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.W2T_BROWSER_EXECUTABLE?{executablePath:process.env.W2T_BROWSER_EXECUTABLE}:{})});
 const results=[];
 for(const ref of [process.env.W2T_PROFILE_BASELINE,'working-tree'].filter(Boolean)){
  const outDir=join(directory,ref==='working-tree'?'after':'before');
  await build({configFile:false,logLevel:'error',plugins:[{name:'profile-fixture',enforce:'pre',load(id){if(ref==='working-tree')return;const file=changed.find(f=>resolve(f)===id);if(file)return execFileSync('git',['show',`${ref}:${file}`],{encoding:'utf8'});}}],build:{outDir,minify:false,lib:{entry:entryPath,name:'FiveProfile',formats:['iife'],fileName:'fixture'}}});
  for(const [count,army] of [[2,false],[5,false],[5,true]]){
   const page=await browser.newPage();await page.addScriptTag({path:join(outDir,'fixture.iife.js')});
   const cdp=await page.context().newCDPSession(page);await cdp.send('Profiler.enable');await cdp.send('Profiler.start');
   const data=await page.evaluate(({count,army})=>{
    let m=FiveProfile.fixture(count,army);const samples=[],units=()=>m.gathering.units.length+m.combat.enemies.filter(e=>!e.footprint).length,startUnits=units();
    for(let i=0;i<360;i++){const start=performance.now();m=FiveProfile.updateMatch(m,1/60);samples.push(performance.now()-start);}
    const sorted=samples.slice(60).sort((a,b)=>a-b),pick=n=>sorted[Math.floor((sorted.length-1)*n)];
    return {medianMs:pick(.5),p95Ms:pick(.95),totalMs:samples.reduce((a,b)=>a+b,0),startUnits,endUnits:units(),elapsed:m.waves.elapsedSeconds,outcome:m.outcome,state:JSON.stringify(m)};
   },{count,army});
   const {profile}=await cdp.send('Profiler.stop');await writeFile(join(process.cwd(),'artifacts/content-balance',`cpu-profile-${ref==='working-tree'?'after':'before'}-${count}-${army}.json`),JSON.stringify(profile));
   const {state,...timing}=data,result={ref,count,army,...timing,stateHash:createHash('sha256').update(state).digest('hex')};results.push(result);console.log(JSON.stringify(result));assert.equal(result.outcome,'playing');await page.close();
  }
 }
 if(process.env.W2T_PROFILE_BASELINE)for(let i=0;i<3;i++)assert.equal(results[i].stateHash,results[i+3].stateHash,'Optimization changed final gameplay state');
 const report={baselineCommit:process.env.W2T_PROFILE_BASELINE?execFileSync('git',['rev-parse',process.env.W2T_PROFILE_BASELINE],{encoding:'utf8'}).trim():undefined,chromium:browser.version(),kind:'production gameplay CPU, not rendered FPS',results};
 if(process.env.W2T_PROFILE_OUTPUT)await writeFile(process.env.W2T_PROFILE_OUTPUT,JSON.stringify(report,null,2)+'\n');
}finally{await browser?.close();await rm(directory,{recursive:true,force:true});}

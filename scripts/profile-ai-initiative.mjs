// Isolated production CPU comparison: only observed-node lookup differs.
import {build} from 'vite';
import {mkdtemp,readFile,writeFile,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.W2T_PLAYWRIGHT_MODULE??'playwright-core');
const out=process.env.W2T_ARTIFACTS??'artifacts/ai-initiative',directory=await mkdtemp(join(tmpdir(),'w2t-initiative-cpu-'));
const knowledge=resolve('src/gameplay/enemyKnowledge.ts'),current=await readFile(knowledge,'utf8');
const from=current.indexOf('// Observations replace'),to=current.indexOf('export function observeEnemyKnowledge');assert(from>=0&&to>from);
const baseline=current.slice(0,from)+"export function knownEnemyNode(m:MatchState,node:ResourceNode|undefined):ResourceNode|undefined {return node?(m.enemyKnowledge?m.enemyKnowledge.nodes.find(n=>n.id===node.id):node):undefined;}\n"+current.slice(to);
const entry=join(directory,'entry.mjs');
await writeFile(entry,`
import {createMatch,updateMatch} from ${JSON.stringify(resolve('src/gameplay/match.ts'))};
import {matchPlayers} from ${JSON.stringify(resolve('src/gameplay/players.ts'))};
export {updateMatch};
export function fixture(){
 const roster=matchPlayers(undefined,undefined,5).map((p,i)=>({...p,teamId:i===0?1:2}));
 let m=createMatch('skirmish','normal',undefined,'plains128',1,'balanced',roster);m.matchId='00000000-0000-4000-8000-000000000001';m.combat.baseHP=100000;
 for(let t=0;t<300;t++)m=updateMatch(m,1);
 return m;
}`);
let browser;
try{
 for(const before of [true,false])await build({configFile:false,logLevel:'error',plugins:[{name:'linear-knowledge-baseline',enforce:'pre',load(id){if(before&&id===knowledge)return baseline;}}],build:{outDir:join(directory,before?'before':'after'),minify:true,lib:{entry,name:before?'BeforeAI':'AfterAI',formats:['iife'],fileName:'fixture'}}});
 browser=await chromium.launch({headless:true,executablePath:process.env.W2T_BROWSER_EXECUTABLE??'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const page=await browser.newPage();for(const name of ['before','after'])await page.addScriptTag({path:join(directory,name,'fixture.iife.js')});
 const fixture=await page.evaluate(()=>{const m=AfterAI.fixture();window.__aiFixture=JSON.stringify(m);return {seconds:m.waves.elapsedSeconds,units:m.gathering.units.length+m.combat.enemies.filter(e=>!e.footprint).length,bases:m.multiplePlayers.ai.map(b=>b.state.combat.enemies.filter(e=>(e.kind==='base'||e.buildingType==='outpost')&&(!e.construction||e.construction.remainingSeconds===0)).length)};});
 const results=[];
 for(const name of ['BeforeAI','AfterAI']){
  const {state,...timing}=await page.evaluate(name=>{let m=JSON.parse(window.__aiFixture);const module=window[name],samples=[];let decisions=0;for(let i=0;i<180;i++){const old=m.multiplePlayers.ai.map(b=>b.state.enemyPolicy.strategy),started=performance.now();m=module.updateMatch(m,1/60);if(i>=30)samples.push(performance.now()-started);decisions+=m.multiplePlayers.ai.filter((b,n)=>old[n]!==b.state.enemyPolicy.strategy).length;}samples.sort((a,b)=>a-b);return {medianMs:samples[74],p95Ms:samples[142],decisions,seconds:m.waves.elapsedSeconds,state:JSON.stringify(m)};},name);
  results.push({name,...timing,stateHash:createHash('sha256').update(state).digest('hex')});
 }
 assert.equal(results[0].stateHash,results[1].stateHash,'Lookup index changed gameplay');assert(fixture.bases.every(n=>n>=2));
 await mkdir(out,{recursive:true});const report={chromium:browser.version(),fixture,kind:'Production-bundled gameplay CPU; identical cloned paid300s four-AI allied state, human-only100000HP soak. No AI entities/resources/vision injected.180 ticks,30 warmup,1/60s. Only knownEnemyNode lookup changes.',baselineSourceHash:createHash('sha256').update(baseline).digest('hex'),indexedSourceHash:createHash('sha256').update(current).digest('hex'),results};await writeFile(join(out,'cpu-comparison.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await browser?.close();await rm(directory,{recursive:true,force:true});}

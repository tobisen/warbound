// Production-bundled real economy. Persistent passive human targets use the
// existing hit sink; no AI entities, vision, resources, sites or build completion injected.
import {build} from 'vite';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {chromium} from '../presentations/agentic-coding/node_modules/playwright-core/index.mjs';
import assert from 'node:assert/strict';
const stage=process.env.W2T_STAGE??'after',seconds=Number(process.env.W2T_SECONDS??1500),difficulty=process.env.W2T_DIFFICULTY??'normal',map=process.env.W2T_MAP??'plains128',out='artifacts/army-movement',dir=await mkdtemp(join(tmpdir(),'w2t-territory-'));let browser;
try{
 await mkdir(out,{recursive:true});await build({configFile:false,logLevel:'error',build:{outDir:dir,minify:false,lib:{entry:'src/gameplay/testHelpers/aiTerritory.ts',name:'Territory',formats:['iife'],fileName:'fixture'}}});
 browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const page=await browser.newPage();await page.addScriptTag({path:join(dir,'fixture.iife.js')});
 await page.evaluate(({difficulty,map})=>{window.__territory=Territory.territoryFixture(difficulty,map);window.__hits=0;},{difficulty,map});
 const snapshots=[],scoutGoals=[],started=Date.now();let thirdBase;
 for(let t=0;t<seconds;t+=60){
  const batch=await page.evaluate(duration=>{let m=window.__territory;const goals=[];let third;for(let i=0;i<duration;i++){m=Territory.updateMatch(m,1,{side:'enemy',onHit:()=>window.__hits++});const s=Territory.territorySnapshot(m);if(s.scout?.goal)goals.push({time:s.seconds,goal:s.scout.goal,position:s.scout.position});if(s.bases.filter(b=>b.remaining===0).length>=3)third??=s.seconds;}window.__territory=m;return {snapshot:Territory.territorySnapshot(m),goals,third,ledger:Territory.territoryLedger(m),hits:window.__hits};},Math.min(60,seconds-t));
  snapshots.push(batch.snapshot);for(const g of batch.goals)if(!scoutGoals.length||JSON.stringify(g.goal)!==JSON.stringify(scoutGoals.at(-1).goal))scoutGoals.push(g);thirdBase??=batch.third;
  console.log(JSON.stringify({time:t+60,bases:batch.snapshot.bases,knownMines:batch.snapshot.knownMines.length,explored:batch.snapshot.explored,scout:batch.snapshot.scout,bank:batch.snapshot.bank,priority:batch.snapshot.priority,ledger:batch.ledger}));
  const report={stage,difficulty,map,seconds:batch.snapshot.seconds,thirdBase,wallSeconds:(Date.now()-started)/1000,description:'1s simulation steps, paid AI with original starting budget/resources and ordinary fog. Human damage sink preserves passive targets for long skirmish. Not a human playtest or real-time frame benchmark.',snapshots,scoutGoals,ledger:batch.ledger,hits:batch.hits};await writeFile(`${out}/territory-${stage}-${difficulty}-${map}.json`,JSON.stringify(report,null,2)+'\n');
  assert.equal(batch.snapshot.outcome,'playing');for(const error of Object.values(batch.ledger))assert(Math.abs(error)<.001,'Paid ledger mismatch');
 }
}finally{await browser?.close();await rm(dir,{recursive:true,force:true});}

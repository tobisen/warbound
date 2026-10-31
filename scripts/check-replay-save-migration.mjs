import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {chromium} from '../presentations/agentic-coding/node_modules/playwright-core/index.mjs';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const p=await browser.newPage();await p.goto('http://127.0.0.1:5195',{waitUntil:'domcontentloaded'});
 const report=await p.evaluate(async()=>{
  const {createMatch,updateMatch}=await import('/src/gameplay/match.ts'),{matchPlayers}=await import('/src/gameplay/players.ts'),{encodeSave,decodeSave}=await import('/src/gameplay/save.ts'),{tidebreak,tidebreakOrders}=await import('/src/gameplay/testHelpers/tidebreak.ts'),{prepareSeaBattleTactics}=await import('/src/gameplay/testHelpers/seaBattleTactics.ts');
  const view={camera:{x:0,y:0},building:null},multi=createMatch('skirmish','normal',undefined,'crownsea',1,'balanced',matchPlayers(undefined,undefined,4)),doc=JSON.parse(encodeSave(multi,view));
  const compact=!!doc.shared;doc.configVersion='tribute-config-78';doc.human=doc.human.replaceAll('tribute-config-79','tribute-config-78');for(const b of doc.ai)b.document=b.document.replaceAll('tribute-config-79','tribute-config-78');
  const loaded=decodeSave(JSON.stringify(doc));if(!loaded.ok)throw Error(loaded.error);const resaved=decodeSave(encodeSave(loaded.match,view));if(!resaved.ok)throw Error(resaved.error);
  let m=prepareSeaBattleTactics(tidebreak()),held,restored;
  for(let i=0;i<2880&&m.outcome==='playing';i++){
   if(i%4===0)m=tidebreakOrders(m,'screen');m=updateMatch(m,.25);
   const start=m.campaignRun?.navalHoldStartedSeconds;
   if(!held&&start!==undefined&&m.waves.elapsedSeconds-start>=5){held={start,seconds:m.waves.elapsedSeconds,phase:m.campaignRun.phase};const saved=decodeSave(encodeSave(m,view));if(!saved.ok)throw Error(saved.error);m=saved.match;restored={start:m.campaignRun.navalHoldStartedSeconds,seconds:m.waves.elapsedSeconds,phase:m.campaignRun.phase};}
  }
  return {compact,players:loaded.match.multiplePlayers.roster.length,resaved:resaved.ok,held,restored,outcome:m.outcome,seconds:m.waves.elapsedSeconds};
 });assert(report.compact);assert.equal(report.players,4);assert(report.resaved);assert(report.held);assert.deepEqual(report.held,report.restored);assert.equal(report.outcome,'victory');await writeFile('artifacts/replayability/save-migration-browser.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}

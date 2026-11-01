import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from '../presentations/agentic-coding/node_modules/playwright-core/index.mjs';

const out='artifacts/research-regression',results=[];
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try {
 for(const width of [800,1280])for(const faction of ['crown','clans','elves','dwarves','goblins']) {
  const p=await browser.newPage({viewport:{width,height:width===800?600:720}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/src/main.ts*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__gameCheck=new Phaser.Game({')});});
  await p.goto(process.env.RESEARCH_URL??'http://127.0.0.1:5273');
  await p.locator('#menu-settings').click();await p.selectOption('#display-resolution',`${width}x${width===800?600:720}`);await p.selectOption('#display-mode','native');await p.locator('#menu-back').click();
  await p.locator('#menu-skirmish').click();await p.selectOption('#faction-select',faction);await p.selectOption('#map-select','twinwake');await p.locator('#start-match').click();
  await p.waitForFunction(()=>!window.__gameCheck.scene.keys.BootScene.restartPending);
  await p.evaluate(async()=>{
   const s=window.__gameCheck.scene.keys.BootScene,{applyCheat}=await import('/src/gameplay/cheats.ts');
   s.sys.sceneUpdate=()=>{};s.applyMatch(applyCheat(s.currentMatch(),'icanseemyhousefromhere'));
  });
  const select=async host=>p.evaluate(host=>{const s=window.__gameCheck.scene.keys.BootScene;s.gathering.units=s.gathering.units.map(u=>({...u,selected:false}));s.selectedBuilding=s.placement.producers?.find(b=>b.kind===host)?.id??host;s.syncVisuals();},host);
  const inspect=async kind=>p.evaluate(async kind=>{const s=window.__gameCheck.scene.keys.BootScene,{researchReason}=await import('/src/gameplay/research.ts'),{actionPanel}=await import('/src/presentation/actionPanel.ts'),{hasMainBase}=await import('/src/gameplay/extraBases.ts'),b=document.getElementById(`research-${kind}`);return {disabled:b.disabled,reason:document.getElementById(`research-${kind}-reason`).textContent,card:actionPanel(s.currentMatch(),s.selectedBuilding,true)[`research-${kind}`],order:researchReason(s.gathering,s.research,s.placement,kind,s.gameplayActive(),hasMainBase(s.currentMatch()))};},kind);
  const build=async(kind,remote=false)=>p.evaluate(async({kind,remote})=>{
   const s=window.__gameCheck.scene.keys.BootScene,{beginPlacement,placementError,placeBuilding,placementObstacles}=await import('/src/gameplay/placement.ts'),{technologyFor}=await import('/src/gameplay/productionPrerequisites.ts');let m=s.currentMatch();
   m.gathering.units=m.gathering.units.map((u,i)=>({...u,selected:i===0}));
   const placement=beginPlacement(m.placement,kind),context={technology:technologyFor(m,'player'),map:m.map,gathering:m.gathering,enemies:m.combat.enemies};let site;
   for(let y=128;y<992&&!site;y+=32)for(let x=192;x<768;x+=32)if((!remote||Math.hypot(x+32-m.gathering.base.x,y+32-m.gathering.base.y)>=480)&&!placementError(placement,{x,y},m.gathering.wood,placementObstacles(m.gathering),context)){site={x,y};break;}
   if(!site)throw Error('No legal site '+kind);
   const r=placeBuilding(placement,site,m.gathering.wood,placementObstacles(m.gathering),context);if(!r.gathering||!r.map)throw Error('Placement failed '+kind);
   m={...m,placement:r.placement,map:r.map,gathering:r.gathering};s.applyMatch(m);s.syncVisuals();return site;
  },{kind,remote});
  const finishBuilding=async()=>p.evaluate(async()=>{const s=window.__gameCheck.scene.keys.BootScene,{updateConstruction}=await import('/src/gameplay/construction.ts');const r=updateConstruction(s.gathering,s.placement,s.map,100);s.gathering=r.gathering;s.placement=r.placement;s.syncVisuals();});
  const research=async(kind,complete=true)=>{
   const state=await inspect(kind);assert(!state.disabled,`${faction}/${kind}: ${JSON.stringify(state)}`);assert.equal(state.order,null);
   await p.locator(`#research-${kind}`).click();
   return p.evaluate(async({kind,complete})=>{const s=window.__gameCheck.scene.keys.BootScene,{updateResearch}=await import('/src/gameplay/research.ts');if(s.research.job?.kind!==kind)throw Error('UI did not start '+kind);if(complete)s.research=updateResearch(s.research,s.placement,100,true,s.factions.player);s.syncVisuals();return structuredClone(s.research);},{kind,complete});
  };
  const saveLoad=async()=>{
   await p.evaluate(async()=>{const s=window.__gameCheck.scene.keys.BootScene,{matchFog}=await import('/src/gameplay/matchFog.ts');s.fog=matchFog(s.currentMatch());});
   await p.locator('#match-menu-button').click();await p.locator('#save-match').click();assert.match(await p.locator('#save-status').innerText(),/saved/i);
   await p.locator('#load-match').click();await p.waitForFunction(()=>!window.__gameCheck.scene.keys.BootScene.restartPending&&window.__gameCheck.scene.keys.BootScene.session.phase==='paused');
   await p.evaluate(()=>{window.__gameCheck.scene.keys.BootScene.sys.sceneUpdate=()=>{};});await p.locator('#resume-match').click();
  };
  const expansion=await build('base',true);await select('base-1');const otherBase=await inspect('workerTools');
  await p.screenshot({path:`${out}/${faction}-other-base-${width}.png`});
  assert(!otherBase.disabled,`Completed original base ignored: ${JSON.stringify(otherBase)}`);
  await saveLoad();await select('base-1');assert(!(await inspect('workerTools')).disabled);
  await research('workerTools');await finishBuilding();
  await select('forge');const absent=await inspect('attack');assert(absent.disabled);assert.match(absent.reason,/Complete/);
  await build('forge');await select('forge');const foundation=await inspect('attack');assert(foundation.disabled);
  await finishBuilding();await select('forge');const completed=await inspect('attack');
  await p.evaluate(async()=>{const s=window.__gameCheck.scene.keys.BootScene,{actionPanel,renderActionPanel}=await import('/src/presentation/actionPanel.ts'),button=document.getElementById('research-attack');button.disabled=true;renderActionPanel(actionPanel(s.currentMatch(),s.selectedBuilding,true));if(button.disabled)throw Error('Research retained a stale disabled state');});
  await research('attack');await select('forge');await research('defense');
  await build('academy');await select('academy');assert((await inspect('attack')).disabled);
  const remoteAcademy=await build('academy',true);await finishBuilding();await build('academy');
  await select('academy');await research('attack',false);await saveLoad();
  await p.evaluate(async()=>{const s=window.__gameCheck.scene.keys.BootScene,{updateResearch}=await import('/src/gameplay/research.ts');if(s.research.job?.kind!=='attack')throw Error('Lost active research on Load');s.research=updateResearch(s.research,s.placement,100,true,s.factions.player);s.syncVisuals();});
  await select('academy');await research('defense');
  for(const seconds of [20,30]){
   await select('base');await p.locator('#upgrade-base').click();await p.evaluate(async seconds=>{const s=window.__gameCheck.scene.keys.BootScene,{advanceBaseUpgrade}=await import('/src/gameplay/baseUpgrade.ts');s.applyMatch(advanceBaseUpgrade(s.currentMatch(),seconds).match);s.syncVisuals();},seconds);
   await select('base-1');await research('workerTools');
  }
  for(const kind of ['barracks','stable','aviary','siegeWorks','navalFoundry','drydock','signalTower','navalAcademy','marineBarracks']){await build(kind);await finishBuilding();}
  const kinds=await p.evaluate(async()=>{const {roleResearchKinds,roleResearchAvailable}=await import('/src/config/roleResearch.ts'),s=window.__gameCheck.scene.keys.BootScene;window.__requirementsFixture=structuredClone(s.currentMatch());return roleResearchKinds.filter(k=>roleResearchAvailable(k,s.factions.player));});
  for(const kind of kinds){
   const host=await p.evaluate(async kind=>{const s=window.__gameCheck.scene.keys.BootScene,{researchHost}=await import('/src/presentation/researchPages.ts');s.applyMatch(structuredClone(window.__requirementsFixture));s.syncVisuals();return researchHost(kind);},kind);
   await select(host);await research(kind,false);await saveLoad();
   assert.equal(await p.evaluate(()=>window.__gameCheck.scene.keys.BootScene.research.job?.kind),kind);
  }
  // Use an authored campaign identity and its real map/policy; only its completion
  // ledger is a fixture. Research itself still starts through the visible controls.
  await p.evaluate(async faction=>{
   const s=window.__gameCheck.scene.keys.BootScene,{startCampaignMission}=await import('/src/gameplay/campaign.ts'),{campaignMissions}=await import('/src/config/campaign.ts'),{identityFor}=await import('/src/config/campaignSeries.ts'),{factionsForPlayer}=await import('/src/config/factions.ts'),{applyCheat}=await import('/src/gameplay/cheats.ts');
   const m=startCampaignMission({version:1,identity:identityFor(faction,'normal'),completed:campaignMissions.map(m=>m.id)},'the-siege','normal',factionsForPlayer(faction));s.applyMatch(applyCheat(m,'icanseemyhousefromhere'));s.syncVisuals();
  },faction);
  await select('forge');const campaignMissing=await inspect('attack');assert(campaignMissing.disabled);assert.match(campaignMissing.reason,/Complete/);
  await build('forge');await select('forge');assert((await inspect('attack')).disabled);await finishBuilding();await select('forge');await research('attack');
  await select('academy');const campaignLocked=await inspect('attack');assert(campaignLocked.disabled);assert.equal(campaignLocked.reason,'Locked for this campaign mission');
  await saveLoad();await select('forge');await research('defense');
  await build('base');await select('base-1');await research('workerTools',false);await saveLoad();
  assert.equal(await p.evaluate(()=>window.__gameCheck.scene.keys.BootScene.research.job?.kind),'workerTools');
  assert.deepEqual(errors,[]);results.push({width,faction,expansion,remoteAcademy,otherBase,absent,foundation,completed,kinds,campaignMissing,campaignLocked,saveLoad:true,errors});await p.close();console.log('PASS lifecycle/save/campaign',width,faction);
 }
 await writeFile(`${out}/lifecycle.json`,JSON.stringify(results,null,2)+'\n');
} finally {await browser.close();}

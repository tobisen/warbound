import {chromium} from '../presentations/agentic-coding/node_modules/playwright-core/index.mjs';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:5186');
 const cdp=await page.context().newCDPSession(page);await cdp.send('Profiler.enable');await cdp.send('Profiler.start');
 const result=await page.evaluate(async()=>{
  const {createMatch}=await import('/src/gameplay/match.ts'),{towerPlacementError,towerPreviewError,placeTower}=await import('/src/gameplay/towers.ts'),{beginPlacement,cancelPlacement}=await import('/src/gameplay/placement.ts');
  const m=createMatch('skirmish','normal',undefined,'plains96');m.fog.revealed=true;m.gathering.wood=100000;m.gathering.goldBalance=100000;
  const base=m.gathering.base,p={x:base.x+160,y:base.y+96};
  // Preserve real large-map terrain/resources. Bodies and buildings add explicit stress.
  const {bodyFits}=await import('/src/gameplay/map.ts');let number=4;
  for(let y=base.y-160;y<base.y+640;y+=32)for(let x=base.x-160;x<base.x+640;x+=32){if(m.gathering.units.length>=96)break;if(!bodyFits(m.map,{x,y},12)||x>=p.x-32&&x<=p.x+64&&y>=p.y-32&&y<=p.y+64)continue;m.gathering.units.push({...m.gathering.units[0],id:`unit-${number++}`,kind:'soldier',selected:false,position:{x,y},target:{x,y},order:{kind:'idle'},cargo:0});}
  m.gathering.units.forEach((u,i)=>u.selected=i===0);
  for(let i=0;i<48;i++){const f={x:32+i%16*96,y:32+Math.floor(i/16)*96,width:64,height:64};m.placement.farms??=[];m.placement.farms.push({id:`farm-${i+1}`,owner:'player',hp:80,footprint:f,construction:{remainingSeconds:0,builderId:null}});m.map.obstacles.push(f);}
  const times={},timed=(name,f)=>{const start=performance.now(),value=f();times[name]=performance.now()-start;return value;};
  m.placement=timed('begin',()=>beginPlacement(m.placement,'tower',m.map));
  const preview=[];for(let i=0;i<40;i++)preview.push(timed('preview',()=>towerPreviewError(m,{x:p.x+i%3,y:p.y})));
  const previewMs=times.preview;const admission=timed('admission',()=>towerPlacementError(m,p));
  const placed=timed('place',()=>placeTower(m,p));timed('cancel',()=>cancelPlacement(m.placement));
  return {world:[m.map.width,m.map.height],units:m.gathering.units.length,obstacles:m.map.obstacles.length,farms:m.placement.farms.length,point:p,preview:preview[0],previewMs,admission,placed:placed.placement.defenses?.length??0,times};
 });
 const {profile}=await cdp.send('Profiler.stop');const counts=new Map();for(const id of profile.samples??[])counts.set(id,(counts.get(id)??0)+1);const hot=profile.nodes.map(n=>({name:n.callFrame.functionName,url:n.callFrame.url,count:counts.get(n.id)??0})).sort((a,b)=>b.count-a.count).slice(0,18);
 const label=process.env.W2T_PROFILE_LABEL??'before';await writeFile(`artifacts/gameplay-improvements/placement-${label}.json`,JSON.stringify({result,hot},null,2)+'\n');console.log(JSON.stringify({result,hot}));
}finally{await browser.close();}

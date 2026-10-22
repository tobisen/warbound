import {chromium} from 'playwright';
import {PNG} from 'pngjs';
import jsQR from 'jsqr';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url).pathname;
const target=process.env.TALK_URL||'http://127.0.0.1:5205/';
const reportDir=process.env.REPORT_DIR||root+'exports/review';
const slides=JSON.parse(await readFile(root+'src/data/talk.json','utf8'));
const qr=PNG.sync.read(await readFile(root+'public/images/qr-warbound.png'));
if(jsQR(new Uint8ClampedArray(qr.data),qr.width,qr.height)?.data!=='https://tobisen.github.io/warbound/')throw Error('QR mismatch');
if(slides.length!==13||slides.reduce((t,s)=>t+s.seconds,0)!==515)throw Error('Count or timing mismatch');
for(const s of slides)for(const e of s.elements)if(e.x<0||e.y<0||e.x+e.w>1600||e.y+e.h>900)throw Error('Outside slide');
await mkdir(reportDir,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1600,height:900}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(new URL('?print',target).href,{waitUntil:'networkidle'});
 if(await page.title()!=='Warbound – Agentic Coding')throw Error('Document title mismatch');
 const icon=await page.request.get(new URL('favicon.svg',target).href);
 if(!icon.ok()||!(await icon.text()).includes('<svg'))throw Error('Favicon missing');
 const cards=page.locator('.warbound-slide');
 if(await cards.count()!==13)throw Error('Rendered slide count');
 for(let i=0;i<slides.length;i++){
  const card=cards.nth(i);await card.screenshot({path:reportDir+`/slide-${String(i+1).padStart(2,'0')}.png`});
  const issues=await card.evaluate(el=>Array.from(el.querySelectorAll('.talk-text')).filter(n=>n.scrollHeight>n.clientHeight+3||n.scrollWidth>n.clientWidth+3).map(n=>n.textContent));
  if(issues.length)throw Error(`Text overflow slide ${i+1}: ${issues}`);
 }
 const response=await page.request.get(new URL('images/qr-warbound.png',target).href);
 if(!response.ok())throw Error('Published QR missing');
 const liveQr=PNG.sync.read(await response.body());
 if(jsQR(new Uint8ClampedArray(liveQr.data),liveQr.width,liveQr.height)?.data!=='https://tobisen.github.io/warbound/')throw Error('Served QR mismatch');
 if(!await page.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth)))throw Error('Missing image');

 await page.goto(target,{waitUntil:'networkidle'});
 await page.keyboard.press('ArrowRight');await page.waitForTimeout(600);
 await page.keyboard.press('n');await page.waitForTimeout(200);
 if(!await page.getByText('Tid: 55 sekunder.',{exact:true}).isVisible())throw Error('Navigation/notes failed');
 await page.keyboard.press('n');
 await page.setViewportSize({width:1280,height:720});await page.screenshot({path:reportDir+'/browser-1280.png'});
 if(errors.length)throw Error(errors.join('\n'));
 await writeFile(reportDir+'/verification.json',JSON.stringify({slides:13,seconds:515,qrDecoded:true,imagesLoaded:true,textBounds:true,navigation:true,notes:true,browserErrors:errors},null,2)+'\n');
 console.log('PASS: 13 slides, 515s, decoded QR, image loading, text bounds, keyboard navigation, speaker notes.');
}finally{await browser.close();}

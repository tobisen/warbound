import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const target=process.env.TALK_URL||'https://tobisen.github.io/warbound/presentation/';
await mkdir(root+'exports',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try {
 const page=await browser.newPage({viewport:{width:1600,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto(new URL('?print',target).href,{waitUntil:'networkidle'});
 if(!response.ok())throw Error('Presentation unavailable');
 await page.evaluate(()=>document.fonts.ready);
 const slides=page.locator('.warbound-slide');
 if(await slides.count()!==13)throw Error('Expected 13 slides');
 if(!await page.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth)))throw Error('Missing image');
 await page.emulateMedia({media:'print'});
 for(let i=0;i<13;i++){
  const issues=await slides.nth(i).evaluate(el=>Array.from(el.querySelectorAll('.talk-text')).filter(n=>n.scrollHeight>n.clientHeight+3||n.scrollWidth>n.clientWidth+3).map(n=>n.textContent));
  if(issues.length)throw Error(`Text overflow on slide ${i+1}`);
 }
 if(errors.length)throw Error(errors.join('\n'));
 await page.pdf({path:root+'exports/warbound-agentic-coding.pdf',preferCSSPageSize:true,printBackground:true,tagged:true});
 console.log('PDF exported from '+target+'; 13 slides, all images loaded, no text overflow/runtime errors.');
} finally {await browser.close();}

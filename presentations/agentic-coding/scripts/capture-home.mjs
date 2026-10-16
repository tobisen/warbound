import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try {
 const page=await browser.newPage({viewport:{width:1710,height:966},deviceScaleFactor:1});
 await page.goto(process.env.GAME_URL||'http://127.0.0.1:5198/',{waitUntil:'networkidle'});
 await page.locator('#menu-skirmish').waitFor();
 await page.screenshot({path:new URL('../public/images/warbound-startsida.png',import.meta.url).pathname});
} finally {await browser.close();}

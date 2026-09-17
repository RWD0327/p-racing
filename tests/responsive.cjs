// Optional browser QA: PLAYWRIGHT_MODULE may point to an existing Playwright install.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const sizes=[[320,568],[360,640],[390,844],[430,932],[600,800],[681,600],[768,1024],[1024,768],[844,390],[1366,768],[1920,1080]];
(async()=>{
 const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL || 'msedge',headless:true});
 try {
 for(const [width,height] of sizes){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<681,hasTouch:width<1100});
  const page=await context.newPage(); const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error' && /Content Security Policy|Refused to/.test(m.text()))errors.push(m.text());});
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173'); await page.evaluate(()=>document.fonts.ready);
  const layout=await page.evaluate(()=>({header:document.querySelector('.header').getBoundingClientRect().height,main:document.querySelector('main').clientHeight,viewport:innerHeight,overflow:document.documentElement.scrollWidth-innerWidth,panels:[...document.querySelectorAll('main>section')].map(p=>({id:p.id,x:p.scrollWidth-p.clientWidth,y:p.scrollHeight-p.clientHeight,h:p.clientHeight}))}));
  assert.equal(layout.overflow,0,`${width}: document overflow`);
  assert.ok(Math.abs(layout.header+layout.main-layout.viewport)<=1,`${width}: viewport fit`);
  for(const p of layout.panels){assert.equal(p.x,0,`${width}: ${p.id} horizontal overflow`);assert.equal(p.h,layout.main);}
  await page.locator('.wordmark').first().click();
  if(width<681){await page.locator('.menu-toggle').click();}
  await page.locator('#navigation a[href="#join"]').click();
  await page.waitForFunction(()=>!moving);
  assert.ok(await page.evaluate(()=>Math.abs(main.scrollTop-document.querySelector('#join').offsetTop)<2));
  assert.ok(await page.locator('.apply-button').isVisible());
  const target=await page.locator('.apply-button').boundingBox();
  assert.ok(target.x>=0 && target.x+target.width<=width+1);
  assert.ok(target.y>=0 && target.y+target.height<=height+1,`${width}: application button clipped`);
  assert.deepEqual(errors,[],`${width}: browser errors`);
  console.log(JSON.stringify({viewport:`${width}x${height}`,status:'PASS',internalScroll:layout.panels.filter(p=>p.y>1).map(p=>`${p.id}:${p.y}px`)}));
  await context.close();
 }
 // Real browser wheel dispatch and touch dispatch, not only mocked event handlers.
 const c=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await c.newPage();
 await p.goto(process.env.TEST_URL || 'http://127.0.0.1:4173');await p.evaluate(()=>document.fonts.ready);
 const session=await c.newCDPSession(p);
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:200,y:650}]});
 await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:200,y:450}]});
 await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await p.waitForFunction(()=>!moving && activePanel===1);assert.equal(await p.evaluate(()=>activePanel),1);
 await p.setViewportSize({width:1366,height:768});await p.evaluate(()=>showPanel(0,false));
 await p.mouse.move(500,500);await p.mouse.wheel(0,100);await p.waitForFunction(()=>!moving && activePanel===1);
 console.log('PASS: actual browser swipe, wheel and resize alignment');await c.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

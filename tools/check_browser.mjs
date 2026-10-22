// Optional browser checks: Node 22+ and local Chrome; no npm packages required.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
const origin=(process.env.RAYSTATE_PREVIEW_ORIGIN||'http://127.0.0.1:8089/').replace(/\/?$/,'/');
const port=process.env.RAYSTATE_CDP_PORT||'9227';
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'raystate-browser-'));
const chrome=spawn(process.env.CHROME_PATH||'/usr/bin/google-chrome',['--headless=new','--no-sandbox','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-address=127.0.0.1','--remote-debugging-port='+port,'--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
let ws;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const failures=[],results=[];
const assert=(ok,label)=>{if(!ok)failures.push(label)};
try {
 let targets;
 for(let i=0;i<100;i++){
  try{targets=await(await fetch('http://127.0.0.1:'+port+'/json')).json();break}catch{await delay(100)}
 }
 if(!targets)throw Error('Cannot connect to Chrome. Set CHROME_PATH if necessary.');
 ws=new WebSocket(targets.find(x=>x.type==='page').webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true})});
 let next=0;const pending=new Map(),exceptions=[];
 ws.addEventListener('message',({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(!p)return;m.error?p.reject(m.error):p.resolve(m.result)}else if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails)});
 const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++next;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))});
 const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
 await call('Page.enable');await call('Runtime.enable');await call('Network.enable');
 // External Google availability is separate from deterministic website checks.
 await call('Network.setBlockedURLs',{urls:['*://www.google.com/*']});
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 const viewport=width=>call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<600});
 const navigate=async route=>{
  const url=new URL(route.replace(/^\//,''),origin).href;
  await call('Page.navigate',{url});
  let ready=false;
  for(let i=0;i<150;i++){await delay(35);if(await evaluate(`location.href===${JSON.stringify(url)}&&document.readyState==='complete'`)){ready=true;break}}
  if(!ready)throw Error('Page load timed out: '+url);
  await evaluate('document.fonts.ready.then(()=>true)');
 };
 const screenshot=async filename=>{const r=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(filename,Buffer.from(r.data,'base64'))};
 const pages=['','fr/','ar/','privacy-policy/','terms-of-use/','fr/privacy-policy/','fr/terms-of-use/','ar/privacy-policy/','ar/terms-of-use/'];
 for(const route of pages){
  for(const width of [320,390,768,1440]){
   await viewport(width);await navigate(route);
   await evaluate(`Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>null)}))`);
   const state=await evaluate(`({overflow:document.documentElement.scrollWidth>innerWidth+1,broken:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.getAttribute('src')),lang:document.documentElement.lang,dir:document.documentElement.dir,h1:document.querySelectorAll('h1').length,main:document.querySelectorAll('main').length,body:document.querySelector('main').innerText.length})`);
   const label=(route||'/')+' '+width;
   assert(!state.overflow,label+' overflow');assert(!state.broken.length,label+' broken images '+state.broken);assert(state.h1===1&&state.main===1,label+' document structure');assert(state.body>1000,label+' missing content');assert(state.lang===(route.startsWith('ar/')?'ar':route.startsWith('fr/')?'fr':'en'),label+' language');assert(state.dir===(state.lang==='ar'?'rtl':'ltr'),label+' direction');results.push({route,width,...state});
  }
 }
 await viewport(390);await navigate('ar/');
 await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
 assert(await evaluate(`document.activeElement.matches('.skip-link')&&document.activeElement.getBoundingClientRect().top>=0`),'keyboard skip link visible on focus');
 await evaluate(`document.querySelector('.mobile-nav summary').click()`);
 assert(await evaluate(`document.querySelector('.mobile-nav').open`),'native menu opens');
 await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
 assert(await evaluate(`!document.querySelector('.mobile-nav').open&&document.activeElement.matches('summary')`),'Escape closes menu and returns focus');
 await evaluate(`document.querySelector('.mobile-nav summary').click();document.querySelector('.mobile-panel a[href="#products"]').click()`);
 assert(await evaluate(`!document.querySelector('.mobile-nav').open&&location.hash==='#products'`),'section navigation closes menu');
 await evaluate(`document.querySelector('.faq summary').click()`);assert(await evaluate(`document.querySelector('.faq').open`),'native FAQ toggles');
 await evaluate(`document.querySelector('.language-switch a[lang="fr"]').click()`);
 await delay(150);assert(await evaluate(`document.documentElement.lang==='fr'&&location.hash==='#products'`),'language switching preserves section');
 await navigate('ar/privacy-policy/');await evaluate(`document.querySelector('.language-switch a[lang="fr"]').click()`);await delay(150);
 assert(await evaluate(`document.documentElement.lang==='fr'&&location.pathname.includes('privacy-policy')`),'language switching preserves legal document');
 await navigate('');
 assert(await evaluate(`getComputedStyle(document.querySelector('.hero-in')).animationName==='none'`),'reduced motion');
 assert(await evaluate(`document.querySelector('iframe').src.includes('36.810866%2C5.778244')&&document.querySelector('iframe').loading==='lazy'&&document.querySelector('#map a').href.includes('destination=36.810866%2C5.778244')`),'map coordinates and fallback directions');
 assert(await evaluate(`document.querySelector('a[download]').download==='RayState-QR.png'`),'native PNG download');
 // Decode both QR assets independently using an optional test-only jsQR decoder.
 const qrDecoded=[];
 if(process.env.RAYSTATE_QR_DECODER){
  const {default:decode}=await import(process.env.RAYSTATE_QR_DECODER);
  for(const file of ['raystate-website-qr.svg','raystate-website-qr.png']){
   const pixels=await evaluate(`(async()=>{const i=new Image();i.src='assets/${file}';await i.decode();const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;const x=c.getContext('2d');x.drawImage(i,0,0);return {w:c.width,h:c.height,bytes:[...x.getImageData(0,0,c.width,c.height).data]}})()`);
   const result=decode(new Uint8ClampedArray(pixels.bytes),pixels.w,pixels.h);
   assert(result?.data==='https://raystate.com/',file+' independent decode');qrDecoded.push({file,destination:result?.data});
  }
 }
 // Blocked storage must not affect rendering. The website does not use storage.
 const blocked=await call('Page.addScriptToEvaluateOnNewDocument',{source:`Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError')}});Object.defineProperty(window,'sessionStorage',{get(){throw new DOMException('Blocked','SecurityError')}})`});
 await navigate('fr/');assert(await evaluate(`!!document.querySelector('h1')&&document.querySelectorAll('.language-switch a').length===9`),'blocked storage');await call('Page.removeScriptToEvaluateOnNewDocument',{identifier:blocked.identifier});
 // No JavaScript: every route remains complete; native navigation and FAQ still work.
 await call('Emulation.setScriptExecutionDisabled',{value:true});
 for(const route of pages){await navigate(route);assert(await evaluate(`document.querySelector('main').innerText.length>1000`),'no-JS content '+route)}
 await navigate('ar/');await evaluate(`document.querySelector('.mobile-nav summary').click();document.querySelector('.faq summary').click()`);
 assert(await evaluate(`document.querySelector('.mobile-nav').open&&document.querySelector('.faq').open`),'no-JS native menu/FAQ');
 await call('Emulation.setScriptExecutionDisabled',{value:false});
 await navigate('404.html');assert(await evaluate(`document.querySelector('meta[name="robots"]').content==='noindex'&&document.querySelectorAll('main a').length===3`),'self-contained 404');
 await viewport(1440);await navigate('');await screenshot('/tmp/raystate-desktop-final.png');
 await viewport(390);await navigate('ar/');await screenshot('/tmp/raystate-ar-mobile-final.png');
 await navigate('fr/privacy-policy/');await screenshot('/tmp/raystate-fr-privacy-final.png');
 await navigate('');await evaluate(`document.getElementById('qr-heading').scrollIntoView()`);await screenshot('/tmp/raystate-contact-qr-final.png');
 await evaluate(`document.getElementById('map').scrollIntoView()`);await screenshot('/tmp/raystate-contact-map-final.png');
 assert(!exceptions.length,'browser exceptions '+JSON.stringify(exceptions));
 const report={origin,layouts:results.length,qrDecoded,failures,results};fs.writeFileSync('/tmp/raystate-browser-results-'+(origin.includes('raystate-digital-experience')?'prefix':'root')+'.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify({origin,layouts:results.length,qrDecoded,failures},null,2));
 if(failures.length)process.exitCode=1;
}finally{
 const exited=chrome.exitCode!==null?Promise.resolve():new Promise(resolve=>chrome.once('exit',resolve));
 // Ask Chrome to shut down all its workers before removing the temporary profile.
 if(ws?.readyState===WebSocket.OPEN)ws.send(JSON.stringify({id:999999,method:'Browser.close'}));
 else chrome.kill();
 await Promise.race([exited,delay(5000)]);
 if(chrome.exitCode===null)chrome.kill();
 ws?.close();
 try{await fs.promises.rm(profile,{recursive:true,force:true,maxRetries:10,retryDelay:100})}
 catch(error){console.warn('Temporary Chrome profile retained:',profile,error.code)}
}

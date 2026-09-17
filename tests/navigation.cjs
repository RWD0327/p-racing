const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
function setup(overflow = 0) {
 const handlers = {};
 const links = ['about','vehicle','journal','join'].map(id => ({addEventListener(){},attrs:{href:'#'+id},getAttribute(key){return this.attrs[key]},setAttribute(key,value){this.attrs[key]=value},removeAttribute(key){delete this.attrs[key]}}));
 const panels = Array.from({length:5},(_,i)=>({id:['home','about','vehicle','journal','join'][i],offsetTop:i*700,scrollTop:0,clientHeight:700,scrollHeight:700+(i===0?overflow:0),contains:()=>false}));
 const element = {addEventListener(){},setAttribute(){},classList:{remove(){},contains(){return false}},querySelectorAll(){return links}};
 const main = {scrollTop:0,clientHeight:700,querySelectorAll:()=>panels,addEventListener:(name,fn)=>handlers[name]=fn};
 const media = q=>({matches:q==='all',addEventListener(){}});
 const context = vm.createContext({document:{documentElement:{classList:{add(){}}},querySelector:q=>q==='#main'?main:element,querySelectorAll:()=>[],addEventListener(){},fonts:{ready:{then(){}}}},window:{matchMedia:media,addEventListener(){}},matchMedia:media,location:{hash:''},history:{replaceState(a,b,url){handlers.url=url}},performance:{now:()=>0},requestAnimationFrame:fn=>{handlers.frame=fn;return 1},cancelAnimationFrame(){},setTimeout(fn){handlers.idle=fn;return 1},clearTimeout(){}});
 vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../dist/app.js'),'utf8'),context);
 const touch=(name,x,y,count=1)=>{const e={touches:Array.from({length:count},()=>({clientX:x,clientY:y})),cancelable:true,preventDefault(){this.prevented=true}};handlers[name](e);return e;};
 return {handlers,panels,main,touch,links,index:()=>vm.runInContext('activePanel',context)};
}
let s=setup(); s.touch('touchstart',100,500); s.touch('touchmove',100,400); assert.equal(s.index(),1); s.touch('touchmove',100,100); assert.equal(s.index(),1); s.handlers.frame(700); assert.equal(s.main.scrollTop,700);
s.touch('touchend'); s.touch('touchstart',100,100); s.touch('touchmove',100,220); assert.equal(s.index(),0);
s=setup(); s.touch('touchstart',100,400); s.touch('touchmove',200,390); assert.equal(s.index(),0);
s=setup(); s.touch('touchstart',100,400,2); s.touch('touchmove',100,200,2); assert.equal(s.index(),0);
s=setup(300); s.touch('touchstart',100,500); const e=s.touch('touchmove',100,300); assert.equal(s.index(),0); assert.ok(!e.prevented); s.panels[0].scrollTop=300; s.touch('touchmove',100,200); assert.equal(s.index(),0); s.touch('touchend'); s.touch('touchstart',100,500); s.touch('touchmove',100,300); assert.equal(s.index(),1);
console.log('PASS: swipe forward/back, one panel per gesture, exact target, horizontal and multi-touch ignored, overflow preserved');
function wheel(s, deltaY=100) {
 const event={deltaY,deltaX:0,deltaMode:0,ctrlKey:false,preventDefault(){this.prevented=true}};
 s.handlers.wheel(event); return event;
}
s=setup(300); assert.ok(!wheel(s).prevented); s.panels[0].scrollTop=300;
assert.ok(wheel(s).prevented); assert.equal(s.index(),0,'momentum must not leave long content');
s.handlers.idle(); wheel(s); assert.equal(s.index(),1,'fresh gesture should advance');
assert.equal(s.links[0].attrs['aria-current'],'location'); assert.equal(s.handlers.url,'#about');
s.handlers.frame(700); s.handlers.idle(); wheel(s); assert.equal(s.index(),2);
assert.equal(s.links[0].attrs['aria-current'],undefined); assert.equal(s.links[1].attrs['aria-current'],'location');
assert.equal(s.handlers.url,'#vehicle');
console.log('PASS: wheel momentum isolation, current menu indication, section URL synchronization');

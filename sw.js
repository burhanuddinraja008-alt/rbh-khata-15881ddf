var V='v23';
var C='rbh-khata-'+V;
var FILES=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',function(e){self.skipWaiting();e.waitUntil(caches.open(C).then(function(c){return c.addAll(FILES.map(function(f){return new Request(f,{cache:'reload'})}))}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){
 var r=e.request;if(r.method!=='GET')return;
 var u=new URL(r.url);if(u.origin!==location.origin)return;
 if(u.pathname.endsWith('/sw.js'))return;
 var page=r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html');
 if(page){
  e.respondWith(fetch('index.html',{cache:'reload'}).then(function(res){
   if(res&&res.ok){var cp=res.clone();caches.open(C).then(function(c){c.put('index.html',cp)})}
   return res}).catch(function(){return caches.open(C).then(function(c){return c.match('index.html')})}));
  return}
 e.respondWith(caches.open(C).then(function(c){return c.match(r).then(function(hit){return hit||fetch(r).then(function(res){if(res&&res.ok)c.put(r,res.clone());return res})})}));
});

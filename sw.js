var C='rbh-khata-v1';
var FILES=['./','index.html','manifest.json','1-icon-192.png','2-icon-512.png'];
self.addEventListener('install',function(e){self.skipWaiting();e.waitUntil(caches.open(C).then(function(c){return c.addAll(FILES)}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){
 var r=e.request;if(r.method!=='GET')return;
 var u=new URL(r.url);if(u.origin!==location.origin)return;
 var page=r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html');
 e.respondWith(caches.open(C).then(function(c){
  var key=page?'index.html':r;
  return c.match(key).then(function(hit){
   var net=fetch(page?'index.html':r,{cache:'no-cache'}).then(function(res){
    if(res&&res.ok){var cp=res.clone();
     return (page&&hit?hit.clone().text().then(function(o){return cp.clone().text().then(function(n){return o!==n})}):Promise.resolve(false)).then(function(changed){
      c.put(key,cp);
      if(changed)self.clients.matchAll().then(function(cl){cl.forEach(function(x){x.postMessage('updated')})});
      return res})}
    return res}).catch(function(){return hit});
   if(hit){e.waitUntil(net);return hit}
   return net;
  })}))});

const CACHE="seche-v18";
const EXT_CACHE="seche-ext-v1";
const SHELL=["./","index.html","manifest.webmanifest","icon-192-v5.png","icon-512-v5.png","apple-touch-icon-v5.png"];
const EXT=/^https:\/\/(fonts\.googleapis\.com\/|fonts\.gstatic\.com\/|www\.gstatic\.com\/firebasejs\/)/;
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==EXT_CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);
  if(u.origin!==location.origin){
    // polices et module Firebase : depuis le cache d'abord, pour que l'appli démarre sans réseau
    if(EXT.test(r.url))e.respondWith(caches.open(EXT_CACHE).then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{if(res&&(res.ok||res.type==="opaque"))c.put(r,res.clone());return res;}))));
    return;
  }
  e.respondWith(fetch(r).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}return res;}).catch(()=>caches.match(r).then(m=>m||caches.match("index.html"))));
});

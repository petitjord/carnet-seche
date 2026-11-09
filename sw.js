const CACHE="seche-v20";
const EXT_CACHE="seche-ext-v1";
const SHELL=["./","index.html","manifest.webmanifest","icon-192-v5.png","icon-512-v5.png","apple-touch-icon-v5.png"];
const EXT=/^https:\/\/(fonts\.googleapis\.com\/|fonts\.gstatic\.com\/|www\.gstatic\.com\/firebasejs\/)/;
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==EXT_CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
// Réseau en priorité, mais on n'attend jamais plus de 2,5 s : au-delà (réseau absent ou très lent), on sert la version en cache.
function netOrCache(r){
  return caches.open(CACHE).then(c=>new Promise(res=>{
    let done=false;const fin=x=>{if(!done&&x){done=true;res(x);}};
    const t=setTimeout(()=>c.match(r,{ignoreSearch:true}).then(m=>m?fin(m):(r.mode==="navigate"?c.match("index.html").then(fin):null)),2500);
    fetch(r).then(net=>{if(net&&net.ok)c.put(r,net.clone());clearTimeout(t);fin(net);})
      .catch(()=>{clearTimeout(t);c.match(r,{ignoreSearch:true}).then(m=>fin(m||null)).then(()=>{if(!done)c.match("index.html").then(m=>fin(m||Response.error()));});});
  }));
}
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);
  if(u.origin!==location.origin){
    if(EXT.test(r.url))e.respondWith(caches.open(EXT_CACHE).then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{if(res&&(res.ok||res.type==="opaque"))c.put(r,res.clone());return res;}))));
    return;
  }
  e.respondWith(netOrCache(r));
});

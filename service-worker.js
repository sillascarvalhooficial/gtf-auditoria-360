const CACHE='gtf-auditoria-360-v10-mainfix';
const CORE=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin)return;

  // Dados públicos: rede primeiro para evitar apresentação desatualizada; cache apenas como contingência.
  if(u.pathname.endsWith('/dados_publicos.json')){
    e.respondWith(
      fetch(e.request,{cache:'no-store'}).then(r=>{
        const x=r.clone();caches.open(CACHE).then(c=>c.put('./dados_publicos.json',x));return r;
      }).catch(()=>caches.match('./dados_publicos.json'))
    );
    return;
  }

  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).then(r=>{
      const c=r.clone();caches.open(CACHE).then(x=>x.put('./index.html',c));return r;
    }).catch(()=>caches.match('./index.html')));
    return;
  }

  e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{
    const x=r.clone();caches.open(CACHE).then(k=>k.put(e.request,x));return r;
  })));
});

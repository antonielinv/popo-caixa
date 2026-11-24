// POPÔ – funciona sem internet. Troque a versão quando publicar uma atualização.
const VERSAO = 'popo-v1.4';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // lista de bloqueio: sempre direto da internet, nunca guardada
  if (url.pathname.endsWith('acesso.json')) return;
  // página do app: tenta a rede (para pegar atualização) e cai no que está guardado se não houver internet
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request.url, {cache:'no-store'}).then(r => { const c = r.clone(); caches.open(VERSAO).then(x => x.put('./index.html', c)); return r; }).catch(() => caches.match('./index.html')));
    return;
  }
  // resto (ícones, letras do Google Fonts): usa o guardado e guarda o que vier da rede
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
    if (r.ok && (url.origin === location.origin || url.host.includes('fonts.g'))) { const c = r.clone(); caches.open(VERSAO).then(x => x.put(e.request, c)); }
    return r;
  }).catch(() => hit)));
});

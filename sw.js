// Streams received files from OPFS straight to the browser's download manager,
// so a multi-GB file never has to be loaded into page memory.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('fetch', e => {
  const m = new URL(e.request.url).pathname.match(/\/dl\/([^/]+)$/);
  if (!m) return;
  e.respondWith((async () => {
    const opfsName = decodeURIComponent(m[1]);
    const root = await navigator.storage.getDirectory();
    const f = await (await root.getFileHandle(opfsName)).getFile();
    const name = opfsName.replace(/^\d+_/, '');
    return new Response(f.stream(), {headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(f.size),
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
    }});
  })());
});

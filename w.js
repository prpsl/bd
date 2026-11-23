// Disk writer: OPFS sync access handle (Chrome + iOS Safari)
let h, off = 0, failed = false, q = Promise.resolve();
onmessage = e => {
  const d = e.data;
  q = q.then(async () => {
    if (d.open) {
      failed = false;
      const root = await navigator.storage.getDirectory();
      const fh = await root.getFileHandle(d.open, {create: true});
      h = await fh.createSyncAccessHandle();
      h.truncate(0); off = 0;
    } else if (failed) {
      if (d.close) postMessage('closed');
    } else if (d.close) {
      h.flush(); h.close(); postMessage('closed');
    } else {
      off += h.write(new Uint8Array(d), {at: off});
    }
  }).catch(err => {
    if (!failed) postMessage('err:' + (d.open ? 'open ' : d.close ? 'close ' : 'write ') + err);
    failed = true;
    if (d.close) postMessage('closed');
  });
};

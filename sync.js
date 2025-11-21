// iCloud sync wrapper
(async function(){
  const ICLOUD_FILE = "mp-sync.json";
  let root, fileHandle;

  try {
    root = await navigator.storage.getDirectory();
    fileHandle = await root.getFileHandle(ICLOUD_FILE, { create: true });
    const file = await fileHandle.getFile();
    const text = await file.text();
    if (text.trim().length > 0) {
      const cloudData = JSON.parse(text);
      for (const key of Object.keys(cloudData)) {
        localStorage.setItem(key, cloudData[key]);
      }
    }
  } catch (err) { console.warn("iCloud sync unavailable:", err); }

  async function syncToCloud(){
    if (!fileHandle) return;
    const cloudData = {};
    for (let i=0;i<localStorage.length;i++){
      const key = localStorage.key(i);
      cloudData[key] = localStorage.getItem(key);
    }
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(cloudData));
    await writable.close();
  }

  const _set = localStorage.setItem;
  const _remove = localStorage.removeItem;

  localStorage.setItem = function(k,v){ _set.call(localStorage,k,v); syncToCloud(); };
  localStorage.removeItem = function(k){ _remove.call(localStorage,k); syncToCloud(); };

})();

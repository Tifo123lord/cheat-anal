/** Minimal IndexedDB key/value store for uploaded files and preview images (browser only). */
const DB = 'leafpress-files';
const STORE = 'blobs';

let dbPromise: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this browser.'));
      return;
    }
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Could not open IndexedDB.'));
  });
  dbPromise.catch(() => {
    dbPromise = null;
  });
  return dbPromise;
}

function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = fn(tx.objectStore(STORE));
        tx.oncomplete = () => resolve(req.result as T);
        tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed.'));
        tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted (storage full?).'));
      }),
  );
}

export const putBlob = (key: string, blob: Blob): Promise<void> =>
  run<IDBValidKey>('readwrite', (s) => s.put(blob, key)).then(() => undefined);

export const getBlob = (key: string): Promise<Blob | undefined> =>
  run<Blob | undefined>('readonly', (s) => s.get(key));

export const deleteBlobs = async (keys: string[]): Promise<void> => {
  if (!keys.length) return;
  await open().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        keys.forEach((k) => tx.objectStore(STORE).delete(k));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error('IndexedDB delete failed.'));
      }),
  );
};

export const blobKey = (kind: 'file' | 'img'): string =>
  `${kind}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;

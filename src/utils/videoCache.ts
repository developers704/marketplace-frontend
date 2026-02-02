/**
 * Video Cache Utility
 * Uses IndexedDB to cache video chunks for faster playback
 */

const DB_NAME = 'VideoCacheDB';
const DB_VERSION = 1;
const STORE_NAME = 'videoChunks';

interface CachedChunk {
  url: string;
  data: Blob;
  timestamp: number;
  size: number;
}

class VideoCache {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async get(url: string): Promise<Blob | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(url);

      request.onsuccess = () => {
        const result = request.result as CachedChunk | undefined;
        if (result) {
          // Check if cache is still valid (7 days)
          const age = Date.now() - result.timestamp;
          const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
          if (age < maxAge) {
            resolve(result.data);
          } else {
            // Cache expired, delete it
            this.delete(url);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async set(url: string, data: Blob): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const chunk: CachedChunk = {
        url,
        data,
        timestamp: Date.now(),
        size: data.size,
      };
      const request = store.put(chunk);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(url: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(url);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSize(): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const chunks = request.result as CachedChunk[];
        const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
        resolve(totalSize);
      };

      request.onerror = () => reject(request.error);
    });
  }
}

export const videoCache = new VideoCache();


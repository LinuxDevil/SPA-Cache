import IBrowserStorage from './IBrowserStorage';

/**
 * DBTransactionMode is an enum that defines the transaction modes for the IndexedDB.
 */
enum DBTransactionMode {
  READ_WRITE = 'readwrite',
  READ_ONLY = 'readonly'
}

/**
 * IndexedDatabase is a wrapper around the IndexedDB API.
 * @implements IBrowserStorage
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 * @summary It provides a simple interface to store and retrieve data, IndexedDB is a persistent storage mechanism. It is asynchronous and uses promises.
 * @supported Supported browsers for IndexedDB: https://caniuse.com/#feat=indexeddb
 */
class IndexedDatabase implements IBrowserStorage {
  private static readonly DATABASE = process.env.INDEX_DB_NAME || 'development_database';
  private static readonly DB_VERSION = process.env.INDEX_DB_VERSION || '1';
  private static readonly DB_STORE_NAME = process.env.INDEX_DB_STORE_NAME || 'development_store';
  private static database: any;

  constructor() {
    void IndexedDatabase.init();
  }

  /**
   * init is a method that initializes the IndexedDB.
   * It is called when the IndexedDatabase is instantiated.
   */
  public static async init() {
    const request = indexedDB.open(IndexedDatabase.DATABASE, +IndexedDatabase.DB_VERSION);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        this.database = request.result;
        resolve(true);
      };

      request.onupgradeneeded = (event: any) => {
        event.currentTarget.result.createObjectStore(IndexedDatabase.DB_STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });
      };
    });
  }

  /**
   * getObjectStore is a method that gets an object store from the IndexedDB.
   * @param name
   * @param mode
   * @private
   */
  private getObjectStore(name: string, mode: DBTransactionMode) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return IndexedDatabase.database.transaction(name, mode).objectStore(name);
  }

  public set<Value>(key: string, value: Value, successCallback: () => never, errorCallback: () => never): void {
    const store = this.getObjectStore(IndexedDatabase.DB_STORE_NAME, DBTransactionMode.READ_WRITE);
    const request = store.put({ id: key, value });

    request.onsuccess(successCallback());
    request.onerror(errorCallback());
  }

  /**
   * get is a method that gets a value from the IndexedDB.
   * @param key
   */
  public async get<Value>(key: string): Promise<Value> {
    await IndexedDatabase.init();
    const store = this.getObjectStore(IndexedDatabase.DB_STORE_NAME, DBTransactionMode.READ_ONLY);
    const request = store.get(key);

    return new Promise<Value>((resolve) => {
      request.onsuccess = () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        resolve(request.result?.value);
      };
    });
  }

  /**
   * remove is a method that removes a value from the IndexedDB.
   * @param key
   * @param onSuccessCallback
   * @param onErrorCallback
   */
  public remove(key: string, onSuccessCallback: () => never, onErrorCallback: () => never): void {
    const store = this.getObjectStore(IndexedDatabase.DB_STORE_NAME, DBTransactionMode.READ_WRITE);
    store.delete(key).onsuccess(onSuccessCallback()).onerror(onErrorCallback());
  }

  /**
   * removeAll is a method that removes all values from the IndexedDB.
   * @param onSuccessCallback
   * @param onErrorCallback
   */
  public removeAll(onSuccessCallback: () => never, onErrorCallback: () => never): void {
    const store = this.getObjectStore(IndexedDatabase.DB_STORE_NAME, DBTransactionMode.READ_WRITE);
    store.clear().onsuccess(onSuccessCallback()).onerror(onErrorCallback());
  }
}

export default IndexedDatabase;

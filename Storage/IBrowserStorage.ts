/**
 * IBrowserStorage is an interface that defines the methods for the in-browser storage mechanism.
 */
interface IBrowserStorage {
    /**
     * set is a method that sets a value in the storage.
     * @param key The key to set.
     * @param value The value to set.
     * @param onSuccessCallback - optional callback to be called on success
     * @param onErrorCallback - optional callback to be called on error
     */
    set<Value>(key: string, value: Value, onSuccessCallback: () => never, onErrorCallback: () => never): void;
  
    /**
     * get is a method that gets a value from the storage.
     * @param key - the key of the value to get
     */
    get<Value>(key: string): Promise<Value>;
  
    /**
     * remove is a method that removes a value from the storage.
     * @param key - the key of the value to remove
     * @param onSuccessCallback - optional callback to be called on success
     * @param onErrorCallback - optional callback to be called on error
     */
    remove(key: string, onSuccessCallback: () => never, onErrorCallback: () => never): void;
  
    /**
     * removeAll is a method that removes all values from the storage.
     * @param onSuccessCallback - optional callback to be called on success
     * @param onErrorCallback - optional callback to be called on error
     */
    removeAll(onSuccessCallback: () => never, onErrorCallback: () => never): void;
  }
  
  export default IBrowserStorage;
  
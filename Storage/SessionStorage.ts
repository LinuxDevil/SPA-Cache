import IBrowserStorage from './IBrowserStorage';

/**
 * SessionStorage is a class that implements IStorageDispatcher.
 * @implements IBrowserStorage
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
 * @summary It is used to store data in the browser's session storage, it is synchronous and uses callbacks.
 * @supported Supported browsers for SessionStorage: https://caniuse.com/#feat=namevalue-storage
 */
class SessionStorage implements IBrowserStorage {
  public set<Value>(key: string, value: Value): void {
    sessionStorage.setItem(key, <string>(<never>value));
  }

  public get<Value>(key: string): Promise<Value> {
    return Promise.resolve(<Value>(<never>sessionStorage.getItem(key)));
  }

  public remove(key: string): void {
    sessionStorage.removeItem(key);
  }

  public removeAll(): void {
    sessionStorage.clear();
  }
}

export default SessionStorage;


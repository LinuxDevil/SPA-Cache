import IBrowserStorage from './IBrowserStorage';

/**
 * LocalStorage is a class that implements IBrowserStorage.
 * @implements IBrowserStorage
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
 * @summary It is used to store data in the browser's local storage, it is synchronous and uses callbacks.
 * @supported Supported browsers for LocalStorage: https://caniuse.com/#feat=namevalue-storage
 */
export class LocalStorage implements IBrowserStorage {
  public get<Value>(key: string): Promise<Value> {
    return Promise.resolve(<Value>localStorage.getItem(key));
  }

  public remove(key: string): void {
    localStorage.removeItem(key);
  }

  public removeAll(): void {
    localStorage.clear();
  }

  public set<Value>(key: string, value: Value): void {
    localStorage.setItem(key, value as unknown as string);
  }
}

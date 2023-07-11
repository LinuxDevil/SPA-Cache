interface ICache<T> {
    get(key: string): Promise<T | null>;
    set(key: string, value: T): Promise<void>;
    remove(key: string): Promise<void>;
    removeAll(): Promise<void>;
}


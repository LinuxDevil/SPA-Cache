class FIFOCache<T> implements ICache<T> {
    private keys: Array<string> = [];

    constructor(
        private storage: IBrowserStorage,
        private capacity: number
    ) {}

    private storageSuccess(): void {
        // TODO: Implement the success callback
     }

    private storageError(error: string): void {
        console.error(error);
    }

    async get(key: string): Promise<T | null> {
        const value = await this.storage.get<T>(key);
        return value !== undefined ? value : null;
    }

    async set(key: string, value: T): Promise<void> {
        const index = this.keys.indexOf(key);
        if (index !== -1) {
            this.keys.splice(index, 1);
        }

        this.keys.push(key);
        await this.storage.set<T>(key, value, this.storageSuccess, () => this.storageError(`Failed to set key: ${key}`));

        if (this.keys.length > this.capacity) {
            const keyToRemove = this.keys.shift();
            if (keyToRemove) {
                await this.storage.remove(keyToRemove, this.storageSuccess, () => this.storageError(`Failed to remove key: ${keyToRemove}`));
            }
        }
    }

    async remove(key: string): Promise<void> {
        const index = this.keys.indexOf(key);
        if (index !== -1) {
            this.keys.splice(index, 1);
        }
        await this.storage.remove(key, this.storageSuccess, () => this.storageError(`Failed to remove key: ${key}`));
    }

    async removeAll(): Promise<void> {
        for (const key of this.keys) {
            await this.storage.remove(key, this.storageSuccess, () => this.storageError(`Failed to remove key: ${key}`));
        }
        this.keys = [];
    }
}

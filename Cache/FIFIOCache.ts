class FIFOCache<T> implements ICache<T> {
    private keys: Array<string> = [];
    private map: Map<string, T> = new Map();

    constructor(
        private storage: IBrowserStorage,
        private capacity: number
    ) {}

    async get(key: string): Promise<T | null> {
        const value = await this.storage.get<T>(key);
        return value !== undefined ? value : null;
    }

    async set(key: string, value: T): Promise<void> {
        // If key is already in the cache, remove it so it can be added at the end (most recent position)
        const index = this.keys.indexOf(key);
        if (index !== -1) {
            this.keys.splice(index, 1);
        }

        this.keys.push(key);
        await this.storage.set<T>(key, value, () => {}, () => console.error(`Failed to set key: ${key}`));

        // If the cache is over capacity, remove the least recently used (first) key
        if (this.keys.length > this.capacity) {
            const keyToRemove = this.keys.shift();
            if (keyToRemove !== undefined) {
                await this.storage.remove(keyToRemove, () => {}, () => console.error(`Failed to remove key: ${keyToRemove}`));
            }
        }
    }

    async remove(key: string): Promise<void> {
        const index = this.keys.indexOf(key);
        if (index !== -1) {
            this.keys.splice(index, 1);
        }
        await this.storage.remove(key, () => {}, () => console.error(`Failed to remove key: ${key}`));
    }

    async removeAll(): Promise<void> {
        for (const key of this.keys) {
            await this.storage.remove(key, () => {}, () => console.error(`Failed to remove key: ${key}`));
        }
        this.keys = [];
    }
}

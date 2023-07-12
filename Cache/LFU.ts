class FrequencyListNode {
    constructor(
        public frequency: number,
        public keys: Set<string> = new Set(),
        public prev: FrequencyListNode = null,
        public next: FrequencyListNode = null
    ) {}
}

class LFUCache<T> implements ICache<T> {
    private cache: Map<string, { value: T, node: FrequencyListNode }> = new Map();
    private frequencyListHead: FrequencyListNode = new FrequencyListNode(0);

    constructor(
        private storage: IBrowserStorage,
        private capacity: number
    ) {}

    private removeNode(node: FrequencyListNode): void {
        if (node.prev) node.prev.next = node.next;
        if (node.next) node.next.prev = node.prev;
        if (node === this.frequencyListHead) this.frequencyListHead = node.next;
    }

    private insertNode(node: FrequencyListNode, prevNode: FrequencyListNode): void {
        if (prevNode.next) prevNode.next.prev = node;
        node.next = prevNode.next;
        node.prev = prevNode;
        prevNode.next = node;
    }

    private touchNode(key: string, node: FrequencyListNode): void {
        const nextNode = node.next;
        node.keys.delete(key);

        const targetNode = nextNode && nextNode.frequency === node.frequency + 1 ? nextNode : this.createNode(node.frequency + 1, node);
        targetNode.keys.add(key);
        this.cache.get(key).node = targetNode;

        if (!node.keys.size) this.removeNode(node);
    }

    private createNode(frequency: number, prevNode: FrequencyListNode): FrequencyListNode {
        const newNode = new FrequencyListNode(frequency);
        this.insertNode(newNode, prevNode);
        return newNode;
    }

    private storageSuccess(): void { 
        // TODO: Implement the success callback
     }

    private storageError(error: string): void {
        console.error(error);
    }

    async get(key: string): Promise<T | null> {
        if (!this.cache.has(key)) return null;

        const { value, node } = this.cache.get(key);
        this.touchNode(key, node);
        return value;
    }

    async set(key: string, value: T): Promise<void> {
        if (this.cache.size === this.capacity) {
            this.removeLeastFrequentKey();
        }

        const cacheNode = this.cache.get(key);
        if (cacheNode) {
            cacheNode.value = value;
            this.touchNode(key, cacheNode.node);
            return;
        }

        const targetNode = this.frequencyListHead.next && this.frequencyListHead.next.frequency === 1 ? this.frequencyListHead.next : this.createNode(1, this.frequencyListHead);
        targetNode.keys.add(key);
        this.cache.set(key, { value, node: targetNode });
        await this.storage.set<T>(key, value, this.storageSuccess, () => this.storageError(`Failed to set key: ${key}`));
    }

    private removeLeastFrequentKey(): void {
        const leastFrequentKeys = this.frequencyListHead.keys;
        const leastFrequentKey = leastFrequentKeys.values().next().value;
        leastFrequentKeys.delete(leastFrequentKey);
        if (!leastFrequentKeys.size) this.removeNode(this.frequencyListHead);
        this.cache.delete(leastFrequentKey);
        this.storage.remove(leastFrequentKey, this.storageSuccess, () => this.storageError(`Failed to remove key: ${leastFrequentKey}`));
    }

    async remove(key: string): Promise<void> {
        if (!this.cache.has(key)) return;

        const { node } = this.cache.get(key);
        node.keys.delete(key);
        if (!node.keys.size) this.removeNode(node);
        this.cache.delete(key);
        await this.storage.remove(key, this.storageSuccess, () => this.storageError(`Failed to remove key: ${key}`));
    }

    async removeAll(): Promise<void> {
        this.cache.clear();
        this.frequencyListHead = new FrequencyListNode(0);
        await this.storage.removeAll(this.storageSuccess, () => this.storageError("Failed to remove all keys"));
    }
}

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

    private touchNode(node: FrequencyListNode): void {
        const nextNode = node.next;
        node.keys.delete(key);

        if (!nextNode || nextNode.frequency !== node.frequency + 1) {
            const newNode = new FrequencyListNode(node.frequency + 1);
            newNode.keys.add(key);
            this.insertNode(newNode, node);
            this.cache.get(key).node = newNode;
        } else {
            nextNode.keys.add(key);
            this.cache.get(key).node = nextNode;
        }

        if (!node.keys.size) this.removeNode(node);
    }

    async get(key: string): Promise<T | null> {
        if (!this.cache.has(key)) {
            return null;
        } else {
            const { value, node } = this.cache.get(key);
            this.touchNode(node);
            return value;
        }
    }

    async set(key: string, value: T): Promise<void> {
        if (this.cache.size === this.capacity) {
            const leastFrequentKeys = this.frequencyListHead.keys;
            const leastFrequentKey = leastFrequentKeys.values().next().value;
            leastFrequentKeys.delete(leastFrequentKey);
            if (!leastFrequentKeys.size) this.removeNode(this.frequencyListHead);
            this.cache.delete(leastFrequentKey);
            await this.storage.remove(leastFrequentKey, () => {}, () => console.error(`Failed to remove key: ${leastFrequentKey}`));
        }

        if (!this.cache.has(key)) {
            if (!this.frequencyListHead.next || this.frequencyListHead.next.frequency !== 1) {
                const newNode = new FrequencyListNode(1);
                newNode.keys.add(key);
                this.insertNode(newNode, this.frequencyListHead);
            } else {
                this.frequencyListHead.next.keys.add(key);
            }
            this.cache.set(key, { value, node: this.frequencyListHead.next });
            await this.storage.set<T>(key, value, () => {}, () => console.error(`Failed to set key: ${key}`));
        } else {
            const { node } = this.cache.get(key);
            this.cache.get(key).value = value;
            this.touchNode(node);
        }
    }

    remove(key: string): void {
        if (!this.cache.has(key)) return;
        const { node } = this.cache.get(key);
        node.keys.delete(key);
        if (!node.keys.size) this.removeNode(node);
        this.cache.delete(key);
        this.storage.remove(key, () => {}, () => console.error(`Failed to remove key: ${key}`));
    }

    removeAll(): void {
        this.cache.clear();
        this.frequencyListHead = new FrequencyListNode(0);
        this.storage.removeAll(() => {}, () => console.error("Failed to remove all keys"));
    }
}

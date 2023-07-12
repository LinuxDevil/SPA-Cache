class DoublyLinkedListNode {
    constructor(
        public key: string,
        public prev: DoublyLinkedListNode = null,
        public next: DoublyLinkedListNode = null
    ) {}
}

class LRUCache<T> implements ICache<T> {
    private cache: Map<string, DoublyLinkedListNode> = new Map();
    private head: DoublyLinkedListNode = new DoublyLinkedListNode(null);
    private tail: DoublyLinkedListNode = new DoublyLinkedListNode(null);

    constructor(
        private storage: IBrowserStorage,
        private capacity: number
    ) {
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    removeNode(node: DoublyLinkedListNode): void {
        const prev = node.prev;
        const next = node.next;
        prev.next = next;
        next.prev = prev;
    }

    addToHead(node: DoublyLinkedListNode): void {
        node.next = this.head.next;
        node.next.prev = node;
        node.prev = this.head;
        this.head.next = node;
    }

    private storageSuccess(): void { 
        // TODO: Implement the success callback
    }

    private storageError(error: string): void {
        console.error(error);
    }

    async get(key: string): Promise<T | null> {
        const node = this.cache.get(key);
        if (!node) return null;
        this.removeNode(node);
        this.addToHead(node);
        return this.storage.get<T>(key);
    }

    async set(key: string, value: T): Promise<void> {
        let node = this.cache.get(key);

        if (!node) {
            if (this.cache.size === this.capacity) {
                const tailPrev = this.tail.prev;
                this.removeNode(tailPrev);
                this.cache.delete(tailPrev.key);
                this.storage.remove(tailPrev.key, this.storageSuccess, () => this.storageError(`Failed to remove key: ${tailPrev.key}`));
            }

            node = new DoublyLinkedListNode(key);
            this.cache.set(key, node);
        }

        this.removeNode(node);
        this.addToHead(node);
        this.storage.set<T>(key, value, this.storageSuccess, () => this.storageError(`Failed to set key: ${key}`));
    }

    async remove(key: string): Promise<void> {
        const node = this.cache.get(key);
        if (!node) return;
        this.removeNode(node);
        this.cache.delete(key);
        await this.storage.remove(key, this.storageSuccess, () => this.storageError(`Failed to remove key: ${key}`));
    }

    async removeAll(): Promise<void> {
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.cache.clear();
        await this.storage.removeAll(this.storageSuccess, () => this.storageError("Failed to remove all keys"));
    }
}

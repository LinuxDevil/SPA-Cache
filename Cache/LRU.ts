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

    async get(key: string): Promise<T | null> {
        const node = this.cache.get(key);
        if (node) {
            this.removeNode(node);
            this.addToHead(node);
            return this.storage.get<T>(key);
        } else {
            return null;
        }
    }

    async set(key: string, value: T): Promise<void> {
        const node = this.cache.get(key);
        if (node) {
            this.removeNode(node);
            this.addToHead(node);
            this.storage.set<T>(key, value, () => {}, () => console.error(`Failed to set key: ${key}`));
        } else {
            if (this.cache.size === this.capacity) {
                const tailPrev = this.tail.prev;
                this.removeNode(tailPrev);
                this.cache.delete(tailPrev.key);
                this.storage.remove(tailPrev.key, () => {}, () => console.error(`Failed to remove key: ${tailPrev.key}`));
            }

            const newNode = new DoublyLinkedListNode(key);
            this.cache.set(key, newNode);
            this.addToHead(newNode);
            this.storage.set<T>(key, value, () => {}, () => console.error(`Failed to set key: ${key}`));
        }
    }

    remove(key: string): void {
        const node = this.cache.get(key);
        if (node) {
            this.removeNode(node);
            this.cache.delete(key);
            this.storage.remove(key, () => {}, () => console.error(`Failed to remove key: ${key}`));
        }
    }

    removeAll(): void {
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.cache.clear();
        this.storage.removeAll(() => {}, () => console.error("Failed to remove all keys"));
    }
}

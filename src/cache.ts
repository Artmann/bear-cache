type FactoryFunction<K, V> = (key: K) => V

interface CacheOptions {
  maxSize: number
}

const defaultCacheOptions: CacheOptions = {
  maxSize: 100
}

export class Cache<K, V> {
  private readonly cacheOptions: CacheOptions
  private readonly factoryFunction: FactoryFunction<K, V>

  private readonly items: Map<K, V> = new Map()
  private keyAccessOrder: K[] = []

  constructor(factoryFunction: FactoryFunction<K, V>, cacheOptions: Partial<CacheOptions> = {}) {
    this.factoryFunction = factoryFunction
    this.cacheOptions = {
      ...defaultCacheOptions,
      ...cacheOptions
    }
  }

  clear(): void {
    this.items.clear()
    this.keyAccessOrder = []
  }

  delete(key: K): boolean {
    const keyIndex = this.keyAccessOrder.indexOf(key)

    if (keyIndex !== -1) {
      this.keyAccessOrder.splice(keyIndex, 1)
    }

    return this.items.delete(key)
  }

  get(key: K): V {
    const cachedValue = this.items.get(key)

    if (cachedValue !== undefined) {
      this.updateKeyAccessOrder(key)

      return cachedValue
    }

    const freshValue = this.factoryFunction(key)

    this.addItem(key, freshValue)

    return freshValue
  }

  has(key: K): boolean {
    return this.items.has(key)
  }

  listTheCachedItemKeys(): K[] {
    return Array.from(this.items.keys())
  }

  size(): number {
    return this.items.size
  }

  private addItem(key: K, value: V): void {
    const isFull = this.items.size >= this.cacheOptions.maxSize

    if (isFull) {
      this.evictLeastRecentlyUsedItem()
    }

    this.updateKeyAccessOrder(key)

    this.items.set(key, value)
  }

  private evictLeastRecentlyUsedItem(): void {
    const leastRecentlyUsedKey = this.keyAccessOrder.pop()

    if (leastRecentlyUsedKey !== undefined) {
      this.items.delete(leastRecentlyUsedKey)
    }
  }

  private updateKeyAccessOrder(key: K): void {
    const keyIndex = this.keyAccessOrder.indexOf(key)

    if (keyIndex !== -1) {
      this.keyAccessOrder.splice(keyIndex, 1)
    }

    this.keyAccessOrder.unshift(key)
  }
}

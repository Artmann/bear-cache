type FactoryFunction<K, V> = (key: K) => V

interface CacheOptions {
  collectStats: boolean
  maxSize: number
}

const defaultCacheOptions: CacheOptions = {
  collectStats: true,
  maxSize: 100
}

interface CacheStats {
  averageLoadPenalty: () => number
  evictionCount: () => number
  hitCount: () => number
  hitRate: () => number
  missCount: () => number
  missRate: () => number
  requestCount: () => number
}

export class Cache<K, V> {
  private readonly cacheOptions: CacheOptions
  private readonly factoryFunction: FactoryFunction<K, V>

  private readonly items: Map<K, V> = new Map()
  private keyAccessOrder: K[] = []

  private accessCount = 0
  private hitCount = 0
  private missCount = 0
  private evictionCount = 0
  private loadPenaltyValues: number[] = []

  constructor(
    factoryFunction: FactoryFunction<K, V>,
    cacheOptions: Partial<CacheOptions> = {}
  ) {
    this.factoryFunction = factoryFunction
    this.cacheOptions = {
      ...defaultCacheOptions,
      ...cacheOptions
    }
  }

  clear(): void {
    this.items.clear()
    this.keyAccessOrder = []

    this.resetStats()
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

      this.updateAccessStats('hit')

      return cachedValue
    }

    const factoryStart = process.hrtime()
    const freshValue = this.factoryFunction(key)
    const factoryEnd = process.hrtime(factoryStart)

    const factoryDurationInMs = factoryEnd[0] * 1e3 + factoryEnd[1] / 1e6

    this.loadPenaltyValues.push(factoryDurationInMs)

    if (this.loadPenaltyValues.length >= 1000) {
      this.loadPenaltyValues.shift()
    }

    this.addItem(key, freshValue)

    this.updateAccessStats('miss')

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

  stats(): CacheStats {
    return {
      averageLoadPenalty: () => this.loadPenaltyValues.length > 0 ? this.loadPenaltyValues.reduce((a, b) => a + b) / this.loadPenaltyValues.length : 0,
      evictionCount: () => this.evictionCount,
      hitCount: () => this.hitCount,
      hitRate: () => this.accessCount > 0 ? this.hitCount / this.accessCount : 0,
      missCount: () => this.missCount,
      missRate: () => this.accessCount > 0 ? this.missCount / this.accessCount : 0,
      requestCount: () => this.accessCount
    }
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

    this.updateEvictionCount()
  }

  private updateAccessStats(type: 'hit' | 'miss'): void {
    this.accessCount++

    if (type === 'hit') {
      this.hitCount++
    } else {
      this.missCount++
    }

    if (this.accessCount >= Number.MAX_SAFE_INTEGER) {
      this.resetStats()
    }
  }

  private updateEvictionCount(): void {
    this.evictionCount++

    if (this.evictionCount >= Number.MAX_SAFE_INTEGER) {
      this.resetStats()
    }
  }

  private updateKeyAccessOrder(key: K): void {
    const keyIndex = this.keyAccessOrder.indexOf(key)

    if (keyIndex !== -1) {
      this.keyAccessOrder.splice(keyIndex, 1)
    }

    this.keyAccessOrder.unshift(key)
  }

  private resetStats(): void {
    this.accessCount = 0
    this.evictionCount = 0
    this.hitCount = 0
    this.missCount = 0
  }
}

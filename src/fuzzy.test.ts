import { describe, expect, it } from 'vitest'

import { Cache } from '.'

describe('Cache Fuzzing', () => {
  it('should handle random operations without breaking', () => {
    const operations = 1000
    const maxKey = 100
    const cache = new Cache<number, string>((key) => `value-${key}`, { maxSize: 50 })

    // Keep track of expected values for verification
    const expectedValues = new Map<number, string>()

    for (let i = 0; i < operations; i++) {
      const key = Math.floor(Math.random() * maxKey)
      const operation = Math.random()

      // 60% get, 20% delete, 20% clear
      if (operation < 0.6) {
        // Test get operation
        const value = cache.get(key)
        const expectedValue = `value-${key}`

        expect(value).toBe(expectedValue)

        expectedValues.set(key, expectedValue)
      } else if (operation < 0.8) {
        // Test delete operation
        const hadKey = cache.has(key)
        const deleted = cache.delete(key)

        expect(deleted).toBe(hadKey)

        expectedValues.delete(key)
      } else {
        // Test clear operation
        cache.clear()
        expectedValues.clear()
      }

      // Invariant checks after each operation
      expect(cache.size()).toBeLessThanOrEqual(50)

      const cachedKeys = cache.listTheCachedItemKeys()

      expect(new Set(cachedKeys).size).toBe(cachedKeys.length) // No duplicate keys
    }
  })

  it('should handle concurrent operations without breaking', async () => {
    const cache = new Cache<number, Promise<string>>(
      async (key) => {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 10))
        return `value-${key}`
      },
      { maxSize: 50 }
    )

    // Run multiple operations concurrently
    const promises = Array.from({ length: 100 }, async (_, i) => {
      const key = i % 20 // Use a smaller key range to force contention
      const value = await cache.get(key)

      expect(value).toBe(`value-${key}`)
    })

    await Promise.all(promises)

    expect(cache.size()).toBeLessThanOrEqual(50)
  })

  it('should handle different data types correctly', () => {
    interface ComplexKey {
      id: number
      category: string
    }

    interface ComplexValue {
      data: string[]
      timestamp: Date
    }

    const cache = new Cache<ComplexKey, ComplexValue>(
      (key) => ({
        data: [`item-${key.id}`, key.category],
        timestamp: new Date()
      }),
      { maxSize: 10 }
    )

    const keys: ComplexKey[] = [
      { id: 1, category: 'A' },
      { id: 2, category: 'B' },
      { id: 1, category: 'B' }, // Same id, different category
      { id: 2, category: 'A' }
    ]

    // Test with complex objects
    for (const key of keys) {
      const value = cache.get(key)
      expect(value.data).toContain(`item-${key.id}`)
      expect(value.data).toContain(key.category)
      expect(value.timestamp).toBeInstanceOf(Date)
    }
  })

  it('should handle edge cases', () => {
    const cache = new Cache<any, any>((key) => key, { maxSize: 3 })

    // Test with edge case values
    const edgeCases = [
      undefined,
      null,
      0,
      NaN,
      Infinity,
      -Infinity,
      '',
      [],
      {},
      new Date(0),
      Symbol('test'),
      /regex/,
      new Error('test'),
      new Map(),
      new Set(),
      new WeakMap(),
      new WeakSet(),
      new ArrayBuffer(0),
      new Int8Array(0),
      () => { },
      class Test { }
    ]

    for (const value of edgeCases) {
      cache.get(value)
      expect(cache.has(value)).toBe(true)
      expect(cache.get(value)).toBe(value)
    }
  })

  it('should handle factory function errors gracefully', () => {
    let errorCount = 0
    const cache = new Cache<number, string>((key) => {
      if (Math.random() < 0.3) {
        errorCount++
        throw new Error(`Random error for key ${key}`)
      }
      return `value-${key}`
    })

    // Run multiple operations and ensure errors don't corrupt the cache
    for (let i = 0; i < 100; i++) {
      const key = Math.floor(Math.random() * 10)
      try {
        cache.get(key)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    }

    expect(errorCount).toBeGreaterThan(0)
    expect(cache.size()).toBeLessThanOrEqual(10)
  })
})
import { describe, expect, it, vi } from 'vitest'

import { Cache } from './cache'

describe('Cache', () => {
  describe('clear', () => {
    it('clears the cache.', () => {
      const cache = new Cache<number, number>((key) => key)

      cache.get(1)
      cache.get(2)
      cache.get(3)

      expect(cache.size()).toBe(3)

      cache.clear()

      expect(cache.size()).toBe(0)
    })
  })

  describe('delete', () => {
    it('deletes a key from the cache.', () => {
      const cache = new Cache<number, number>((key) => key)

      cache.get(1)
      cache.get(2)
      cache.get(3)

      expect(cache.size()).toBe(3)

      cache.delete(2)

      expect(cache.size()).toBe(2)

      expect(cache.listTheCachedItemKeys()).toEqual([1, 3])
    })

    it('returns true if the key was deleted.', () => {
      const cache = new Cache<number, number>((key) => key)

      cache.get(1)

      expect(cache.delete(1)).toBe(true)
    })

    it('returns false if the key was not deleted.', () => {
      const cache = new Cache<number, number>((key) => key)

      expect(cache.delete(1)).toBe(false)
    })
  })

  describe('get', () => {
    it('returns values from the cache.', () => {
      const cache = new Cache<number, number>((key) => key)

      expect(cache.get(1)).toBe(1)
      expect(cache.get(1)).toBe(1)
      expect(cache.get(1)).toBe(1)

      expect(cache.get(42)).toBe(42)
      expect(cache.get(42)).toBe(42)
      expect(cache.get(42)).toBe(42)
    })

    it('uses the cached value if it exists.', () => {
      const fetchNumber = vi.fn((key: number) => key)

      const cache = new Cache(fetchNumber)

      expect(cache.get(1)).toBe(1)
      expect(cache.get(1)).toBe(1)
      expect(cache.get(1)).toBe(1)

      expect(fetchNumber).toHaveBeenCalledTimes(1)
    })

    it('evicts the least recently used item when the cache is full.', () => {
      const cache = new Cache((key: string) => ({
        id: key.toLowerCase(),
        name: key
      }), { maxSize: 3 })

      cache.get('John')
      cache.get('Marry')
      cache.get('Sally')
      cache.get('Vicky')

      expect(cache.listTheCachedItemKeys()).toEqual(['Marry', 'Sally', 'Vicky'])

      expect(cache.size()).toEqual(3)
    })

    it('updates the key access order when a key is accessed.', () => {
      const cache = new Cache((key: string) => ({
        id: key.toLowerCase(),
        name: key
      }), { maxSize: 3 })

      cache.get('John')
      cache.get('Marry')
      cache.get('Sally')

      cache.get('John')

      expect(cache.listTheCachedItemKeys()).toEqual(['John', 'Marry', 'Sally'])
    })

    it(`doesn't update the cache if the factory function throws an error.`, () => {
      const cache = new Cache(() => {
        throw new Error('Factory function error.')
      })

      expect(() => cache.get(1)).toThrowError('Factory function error.')

      expect(cache.size()).toBe(0)
    })
  })

  describe('has', () => {
    it('returns true if the key exists in the cache.', () => {
      const cache = new Cache<number, number>((key) => key)

      cache.get(1)

      expect(cache.has(1)).toBe(true)
    })

    it('returns false if the key does not exist in the cache.', () => {
      const cache = new Cache<number, number>((key) => key)

      expect(cache.has(1)).toBe(false)
    })
  })
})

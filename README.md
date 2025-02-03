# 🐻 Bear Cache

A lightweight, type-safe LRU cache implementation for TypeScript that hibernates
your expensive computations.

## Features

- Simple LRU (Least Recently Used) caching strategy
- Full TypeScript support with generic key and value types
- Zero dependencies
- Tiny footprint (~1KB minified)
- Factory function pattern for lazy value generation
- Configurable cache size

## Installation

```bash
npm install @bear-cache/core
# or
yarn add @bear-cache/core
# or
bun add @bear-cache/core
```

## Basic Usage

```typescript
import { Cache } from '@bear-cache/core'

// Create a cache with a factory function
const cache = new Cache((key: string) => `Computed value for ${key}`)

// Get a value (will be computed and cached)
const value = cache.get('myKey') // "Computed value for myKey"

// Get the same value (returns from cache without recomputing)
const cachedValue = cache.get('myKey') // "Computed value for myKey"
```

## Real-World Examples

### Caching API Requests

```typescript
import { Cache } from '@bear-cache/core'

interface User {
  id: string
  name: string
  email: string
}

const userCache = new Cache(
  async (userId: string): Promise<User> => {
    const response = await fetch(`/api/users/${userId}`)

    return response.json()
  },
  { maxSize: 1000 }
)

// First call: fetches from API
const user = await userCache.get('123')

// Second call: returns cached value
const sameUser = await userCache.get('123') // Fast! 🐻💨
```

### Caching File Operations

```typescript
import { Cache } from '@bear-cache/core'
import { readFileSync } from 'fs'

const fileCache = new Cache((filePath: string) => {
  return readFileSync(filePath, 'utf8')
})

// First read: reads from disk
const content = fileCache.get('./config.json')

// Subsequent reads: returns from memory
const sameContent = fileCache.get('./config.json')
```

### Caching Expensive Computations

```typescript
import { Cache } from '@bear-cache/core'

const fibonacciCache = new Cache((n: number): number => {
  if (n <= 1) {
    return n
  }

  return fibonacciCache.get(n - 1) + fibonacciCache.get(n - 2)
})

// Computes and caches intermediate results
console.log(fibonacciCache.get(10)) // Fast calculation using cached values
```

## API Reference

### Constructor

```typescript
new Cache<K, V>(factoryFunction: (key: K) => V, options?: Partial<CacheOptions>)
```

### Options

```typescript
interface CacheOptions {
  maxSize: number // Maximum number of items to store (default: 100)
}
```

### Methods

#### `get(key: K): V`

Retrieves a value from the cache. If the value doesn't exist, computes it using
the factory function.

#### `has(key: K): boolean`

Checks if a key exists in the cache.

#### `delete(key: K): boolean`

Removes a key from the cache. Returns true if the key was present.

#### `clear(): void`

Removes all items from the cache.

#### `size(): number`

Returns the current number of items in the cache.

#### `listTheCachedItemKeys(): K[]`

Returns an array of all cached keys.

## License

MIT © [Christoffer Artmann](https://github.com/artmann)

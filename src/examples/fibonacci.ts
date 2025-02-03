import { Cache } from '..'

const fibonacciCache = new Cache((n: number): number => {
  if (n <= 1) {
    return n
  }

  return fibonacciCache.get(n - 1) + fibonacciCache.get(n - 2)
})

// Computes and caches intermediate results
console.log(fibonacciCache.get(10))
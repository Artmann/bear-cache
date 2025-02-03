import { Cache } from '..'

interface Cat {
  breeds: any[],
  id: string
  height: number
  width: number,
  url: string,
}

const catCache = new Cache(
  async (id: string): Promise<Cat> => {
    const response = await fetch(`https://api.thecatapi.com/v1/images/${id}`)
    const data = await response.json()

    return data as Cat
  },
  { maxSize: 1000 }
)

// First call: fetches from API
console.time('First call')

const cat = await catCache.get('0XYvRd7oD')

console.timeEnd('First call')

console.log(cat)

// Second call: returns cached value
console.time('Second call')

const sameCat = await catCache.get('0XYvRd7oD') // Fast! 🐻💨

console.timeEnd('Second call')

console.log(sameCat)

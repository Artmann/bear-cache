import { faker } from '@faker-js/faker'
import { v4 } from 'uuid'
import { describe, expect, it } from 'vitest'

import { Cache } from '.'

describe('Cache', () => {
  it('adds a lot of people to the cache.', () => {
    const ids = Array.from({ length: 1000 }, (_, i) => v4())
    const peopleList = ids.map((id) => ({
      id,
      avatar: faker.image.avatar(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
    }))

    const cache = new Cache((id: string) => {
      const person = peopleList.find((person) => person.id === id)

      if (!person) {
        throw new Error('Person not found')
      }

      return person
    }, { maxSize: 500 })

    for (let i = 0; i < 1000_000; i++) {
      const randomIndex = Math.floor(Math.random() * ids.length)
      const randomId = ids[randomIndex]

      const person = cache.get(randomId)

      expect(person).toEqual(peopleList[randomIndex])
    }

    expect(cache.size()).toEqual(500)
  })
})
import fs from 'fs'

import { Cache } from '..'

function readMarkdownFile(path: string): string {
  return fs.readFileSync(path, 'utf8')
}

const cache = new Cache((key: string) => readMarkdownFile(key))

function cachedReadMarkdownFile(path: string): string {
  return cache.get(path)
}

function main() {
  const filePaths = [
    './sample-files/butternut-squash-soup.md',
    './sample-files/minestrone-soup.md',
    './sample-files/pesto-pasta.md'
  ]

  const iterations = 10_000

  console.log(
    `Benchmarking ${iterations.toLocaleString()} iterations reading ${filePaths.length.toLocaleString()} files.`
  )

  const startTime = process.hrtime()

  for (let i = 0; i < iterations; i++) {
    for (let j = 0; j < filePaths.length; j++) {
      const filePath = filePaths[j]

      readMarkdownFile(filePath)
    }
  }

  const endTime = process.hrtime(startTime)
  const elapsedMilliseconds = endTime[0] * 1000 + endTime[1] / 1e6

  console.log(
    `Reading files without caching took ${elapsedMilliseconds.toFixed(3)} milliseconds.`
  )

  const cachedStartTime = process.hrtime()

  for (let i = 0; i < iterations; i++) {
    for (let j = 0; j < filePaths.length; j++) {
      const filePath = filePaths[j]

      cachedReadMarkdownFile(filePath)
    }
  }

  const cachedEndTime = process.hrtime(cachedStartTime)
  const cachedElapsedMilliseconds =
    cachedEndTime[0] * 1000 + cachedEndTime[1] / 1e6

  console.log(
    `Reading files with caching took ${cachedElapsedMilliseconds.toFixed(3)} milliseconds.`
  )
}

main()

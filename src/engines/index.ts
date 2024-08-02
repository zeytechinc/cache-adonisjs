import { CacheItem } from '../cache.js'
import string from '@adonisjs/core/helpers/string'
import { RedisClusterConnection, RedisConnection } from '@adonisjs/redis'
import redis from '@adonisjs/redis/services/main'
import { RedisService } from '@adonisjs/redis/types'

export interface CacheEngine<T> {
  has(key: string): Promise<boolean>
  set(key: string, data: T | CacheItem<T>): Promise<void>
  get(key: string): Promise<CacheItem<T> | undefined>
  getRaw(key: string): Promise<CacheItem<T> | undefined>
  delete(key: string): Promise<boolean>
  clear(): Promise<void>
  getSize(): Promise<number>
  getOldestKey(): Promise<string | undefined>
  getKeys(): Promise<Set<string>>
  prune(maxSize: number): Promise<number>
}

export class RedisCacheEngine<T> implements CacheEngine<T> {
  #displayName?: string
  #keyPrefix: string
  #keyTtl?: number
  #redisConnection?: string

  constructor(redisConnection?: string, displayName?: string, keyTtl?: number) {
    this.#displayName = displayName
    this.#keyPrefix = ''
    if (this.#displayName) {
      this.#keyPrefix = `${string.snakeCase(this.#displayName)}_`
    }
    this.#redisConnection = redisConnection
    this.keyTtl = keyTtl
  }

  set redisConnection(value: string) {
    this.#redisConnection = value
  }

  set keyTtl(value: number | undefined) {
    this.#keyTtl = value
  }

  #getConnection(): RedisService | RedisConnection | RedisClusterConnection {
    if (this.#redisConnection) {
      return redis.connection(this.#redisConnection)
    }
    return redis
  }

  async has(key: string): Promise<boolean> {
    return (await this.#getConnection().exists(`${this.#keyPrefix}${key}`)) === 1
  }

  async set(key: string, data: T | CacheItem<T>): Promise<void> {
    const finalKey = `${this.#keyPrefix}${key}`
    const now = new Date().getTime()
    let finalData: CacheItem<T>
    if (data instanceof CacheItem) {
      data.lastAccess = now
      finalData = data
    } else {
      finalData = new CacheItem<T>(data as T)
    }
    const pipeline = this.#getConnection().pipeline()
    if (this.#keyTtl) {
      pipeline.setex(finalKey, this.#keyTtl, finalData.serialize())
    } else {
      pipeline.set(finalKey, finalData.serialize())
    }
    pipeline.zadd(this.#keyPrefix, now, finalKey)
    await pipeline.exec()
  }

  async get(key: string): Promise<CacheItem<T> | undefined> {
    const finalKey = `${this.#keyPrefix}${key}`
    const val = await this.#getConnection().get(finalKey)
    if (val) {
      const now = new Date().getTime()
      this.#getConnection().zadd(this.#keyPrefix, now, finalKey) // update the rank score for the key
      const item = CacheItem.parse<T>(val)
      item.lastAccess = now // use the last access from the sorted set ranking.
      return item
    } else {
      await this.#getConnection().zrem(this.#keyPrefix, finalKey)
    }
  }

  async getRaw(key: string): Promise<CacheItem<T> | undefined> {
    const val = await this.#getConnection().get(key)
    if (val) {
      return CacheItem.parse<T>(val)
    }
  }

  async delete(key: string): Promise<boolean> {
    this.#getConnection().zrem(this.#keyPrefix, `${this.#keyPrefix}${key}`)
    return (await this.#getConnection().del(`${this.#keyPrefix}${key}`)) > 0
  }

  async clear(): Promise<void> {
    const keys = await this.#getConnection().zrange(this.#keyPrefix, 0, -1)
    keys.push(this.#keyPrefix)
    await this.#getConnection().del(...keys)
  }

  async getSize(): Promise<number> {
    return this.#getConnection().zcard(this.#keyPrefix)
  }

  async getOldestKey(): Promise<string | undefined> {
    const oldest = await this.#getConnection().zrange(this.#keyPrefix, 0, 0)
    if (oldest && oldest.length) {
      return oldest[0]
    }
  }

  async getKeys(): Promise<Set<string>> {
    const keys = await this.#getConnection().zrange(this.#keyPrefix, 0, -1)
    return new Set(keys)
  }

  async prune(maxSize: number): Promise<number> {
    if (maxSize === 0) {
      return 0
    }
    const size = await this.getSize()
    let pruned = 0
    if (maxSize < size) {
      pruned = size - maxSize
      const keys = await this.#getConnection().zrange(this.#keyPrefix, 0, pruned - 1)
      const pipeline = this.#getConnection().pipeline()
      pipeline.zrem(this.#keyPrefix, keys)
      pipeline.del(...keys)
      await pipeline.exec()
    }
    return pruned
  }
}

export class MemoryCacheEngine<T> implements CacheEngine<T> {
  protected cache: Map<string, CacheItem<T>> = new Map()
  protected cacheKeyOrder: Set<string> = new Set()

  async has(key: string): Promise<boolean> {
    return this.cache.has(key)
  }

  async set(key: string, data: T | CacheItem<T>) {
    if (!this.cache.has(key)) {
      this.cacheKeyOrder.add(key)
    }
    if (data instanceof CacheItem) {
      data.lastAccess = new Date().getTime()
      this.cache.set(key, data)
    } else {
      this.cache.set(key, new CacheItem<T>(data as T))
    }
  }

  async get(key: string): Promise<CacheItem<T> | undefined> {
    const item = this.cache.get(key)
    if (item) {
      item.lastAccess = new Date().getTime()
      this.cacheKeyOrder.delete(key)
      this.cacheKeyOrder.add(key)
    }
    return item
  }

  async getRaw(key: string): Promise<CacheItem<T> | undefined> {
    const item = this.cache.get(key)
    return item
  }

  async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.cacheKeyOrder.delete(key)
    }
    return deleted
  }

  async clear() {
    this.cache.clear()
    this.cacheKeyOrder.clear()
  }

  async getSize(): Promise<number> {
    return this.cache.size
  }

  async getOldestKey(): Promise<string | undefined> {
    return this.cacheKeyOrder.values().next().value
  }

  async getKeys(): Promise<Set<string>> {
    return this.cacheKeyOrder
  }

  async prune(maxSize: number): Promise<number> {
    if (maxSize === 0) {
      return 0
    }
    const size = await this.getSize()
    let pruned = 0
    let oldestKey: string | undefined
    while (size > maxSize) {
      oldestKey = await this.getOldestKey()
      oldestKey && this.delete(oldestKey)
      pruned += 1
    }
    return pruned
  }
}

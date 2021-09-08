import { string } from '@poppinss/utils/build/helpers'
import { RedisClusterConnectionContract, RedisConnectionContract } from '@ioc:Adonis/Addons/Redis'
import { CacheEngineContract, CacheItemContract } from '@ioc:Adonis/Addons/Zeytech/Cache'
import CacheItem from './CacheItem'

export default class RedisCacheEngine<T> implements CacheEngineContract<T> {
  private keyPrefix: string
  private _keyTtl: number | undefined
  private _redisConnection: RedisConnectionContract | RedisClusterConnectionContract

  constructor(private displayName?: string, keyTtl?: number) {
    this.keyPrefix = ''
    if (this.displayName) {
      this.keyPrefix = `${string.snakeCase(this.displayName)}_`
    }
    this.keyTtl = keyTtl
  }

  public set redisConnection(value: RedisConnectionContract | RedisClusterConnectionContract) {
    this._redisConnection = value
  }

  public set keyTtl(value: number | undefined) {
    this._keyTtl = value
  }

  public async has(key: string): Promise<boolean> {
    return (await this._redisConnection.exists(`${this.keyPrefix}${key}`)) === 1
  }

  public async set(key: string, data: T | CacheItemContract<T>): Promise<void> {
    const finalKey = `${this.keyPrefix}${key}`
    const now = new Date().getTime()
    let finalData: CacheItem<T>
    if (data instanceof CacheItem) {
      data.lastAccess = now
      finalData = data
    } else {
      finalData = new CacheItem<T>(data as T)
    }
    const pipeline = this._redisConnection.pipeline()
    if (this._keyTtl) {
      pipeline.setex(finalKey, this._keyTtl, finalData.serialize())
    } else {
      pipeline.set(finalKey, finalData.serialize())
    }
    pipeline.zadd(this.keyPrefix, now, finalKey)
    await pipeline.exec()
  }

  public async get(key: string): Promise<CacheItem<T> | undefined> {
    const finalKey = `${this.keyPrefix}${key}`
    const val = await this._redisConnection.get(finalKey)
    if (val) {
      const now = new Date().getTime()
      this._redisConnection.zadd(this.keyPrefix, now, finalKey) // update the rank score for the key
      const item = CacheItem.parse<T>(val)
      item.lastAccess = now // use the last access from the sorted set ranking.
      return item
    } else {
      await this._redisConnection.zrem(this.keyPrefix, finalKey)
    }
  }

  public async getRaw(key: string): Promise<CacheItem<T> | undefined> {
    const val = await this._redisConnection.get(key)
    if (val) {
      return CacheItem.parse<T>(val)
    }
  }

  public async delete(key: string): Promise<boolean> {
    this._redisConnection.zrem(this.keyPrefix, `${this.keyPrefix}${key}`)
    return (await this._redisConnection.del(`${this.keyPrefix}${key}`)) > 0
  }

  public async clear(): Promise<void> {
    const keys = await this._redisConnection.zrange(this.keyPrefix, 0, -1)
    keys.push(this.keyPrefix)
    await this._redisConnection.del(...keys)
  }

  public async getSize(): Promise<number> {
    return this._redisConnection.zcard(this.keyPrefix)
  }

  public async getOldestKey(): Promise<string | undefined> {
    const oldest = await this._redisConnection.zrange(this.keyPrefix, 0, 0)
    if (oldest && oldest.length) {
      return oldest[0]
    }
  }

  public async getKeys(): Promise<Set<string>> {
    const keys = await this._redisConnection.zrange(this.keyPrefix, 0, -1)
    return new Set(keys)
  }

  public async prune(maxSize: number): Promise<number> {
    if (maxSize === 0) {
      return 0
    }
    const size = await this.getSize()
    let pruned = 0
    if (maxSize < size) {
      pruned = size - maxSize
      const keys = await this._redisConnection.zrange(this.keyPrefix, 0, pruned - 1)
      const pipeline = this._redisConnection.pipeline()
      pipeline.zrem(this.keyPrefix, keys)
      pipeline.del(...keys)
      await pipeline.exec()
    }
    return pruned
  }
}

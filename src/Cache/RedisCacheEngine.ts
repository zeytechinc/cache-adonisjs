import { CacheEngine } from './CacheEngine'
import CacheItem from './CacheItem'
import { string } from '@ioc:Adonis/Core/Helpers'
import Redis, {
  RedisClusterConnectionContract,
  RedisConnectionContract,
} from '@ioc:Adonis/Addons/Redis'

export default class RedisCacheEngine<T> implements CacheEngine<T> {
  private keyPrefix: string
  private _keyTtl: number | undefined

  constructor(private displayName?: string, private connection?: string, keyTtl?: number) {
    if (this.displayName) {
      this.keyPrefix = `${string.snakeCase(this.displayName)}_`
    }
    this.keyPrefix = ''
    this.keyTtl = keyTtl
  }

  public set keyTtl(value: number | undefined) {
    this._keyTtl = value
  }

  private get redis(): RedisConnectionContract | RedisClusterConnectionContract {
    if (this.connection) {
      return Redis.connection(this.connection)
    }
    return Redis.connection()
  }

  public async has(key: string): Promise<boolean> {
    return (await this.redis.exists(`${this.keyPrefix}${key}`)) === 1
  }

  public async set(key: string, data: T | CacheItem<T>): Promise<void> {
    const finalKey = `${this.keyPrefix}${key}`
    const now = new Date().getTime()
    let finalData: CacheItem<T>
    if (data instanceof CacheItem) {
      data.lastAccess = now
      finalData = data
    } else {
      finalData = new CacheItem(data)
    }
    const pipeline = this.redis.pipeline()
    if (this._keyTtl) {
      pipeline.setex(finalKey, this._keyTtl, finalData.serialize())
    } else {
      pipeline.set(finalKey, finalData.serialize())
    }
    pipeline.zadd(this.keyPrefix, now, finalKey)
    await pipeline.exec()
  }

  public async get(key: string): Promise<CacheItem<T> | undefined> {
    const val = await this.redis.get(`${this.keyPrefix}${key}`)
    if (val) {
      const now = new Date().getTime()
      this.redis.zadd(this.keyPrefix, now, `${this.keyPrefix}${key}`) // update the rank score for the key
      const item = CacheItem.parse<T>(val)
      item.lastAccess = now // use the last access from the sorted set ranking.
      return item
    }
  }

  public async delete(key: string): Promise<boolean> {
    this.redis.zrem(this.keyPrefix, `${this.keyPrefix}${key}`)
    return (await this.redis.del(`${this.keyPrefix}${key}`)) > 0
  }

  public async clear(): Promise<void> {
    const keys = await this.redis.zrange(this.keyPrefix, 0, -1)
    keys.push(this.keyPrefix)
    await this.redis.del(...keys)
  }

  public async getSize(): Promise<number> {
    return this.redis.zcount(this.keyPrefix, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
  }

  public async getOldestKey(): Promise<string | undefined> {
    const oldest = await this.redis.zrange(this.keyPrefix, 0, 0)
    if (oldest && oldest.length) {
      return oldest[0]
    }
  }

  public async getKeys(): Promise<Set<string>> {
    const keys = await this.redis.zrange(this.keyPrefix, 0, -1)
    return new Set(keys)
  }

  public async prune(maxSize: number): Promise<number> {
    const size = await this.getSize()
    let pruned = 0
    if (maxSize < size) {
      pruned = size - maxSize
      const keys = await this.redis.zrange(this.keyPrefix, 0, pruned - 1)
      const pipeline = this.redis.pipeline()
      pipeline.zrem(this.keyPrefix, keys)
      pipeline.del(...keys)
      await pipeline.exec()
    }
    return pruned
  }
}

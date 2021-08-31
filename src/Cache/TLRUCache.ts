import { Duration } from 'luxon'
import { TLRUCacheContract, TLRUCacheHealthCheck } from '@ioc:Skrenek/Adonis/Cache/TLRUCache'
import { LRUCache } from './LRUCache'
import { CacheEngineTypes } from './CacheEngine'

/**
 * This implements a Timed Least Recently Used cache.  See https://en.wikipedia.org/wiki/Cache_replacement_policies#Time_aware_least_recently_used_(TLRU)
 * Basically, the cache has a max size, and if an item is added when the cache is full,
 * the least recently used item is removed.  In addition, the timed version enforces a
 * max age for cached items.  Any items who have been in the cache longer than the max
 * item age will not be returned and subsequently deleted from the cache, thus preventing stale data.
 * Note that this implementation has NO mechanism for automatically pruning expired items.  They are simply pruned
 * on the first expired access attempt.
 */
export class TLRUCache<T> extends LRUCache<T> implements TLRUCacheContract<T> {
  private maxItemAge: number

  /**
   * @param maxItems max number of cached items, 0 for infinite
   * @param maxItemAge max age of cached items in ms before they are purged.
   */
  constructor(
    maxItems: number = 0,
    maxItemAge: number = 0,
    storage = CacheEngineTypes.Memory,
    displayName?: string,
    connectionName?: string
  ) {
    super(maxItems, storage, displayName, connectionName)
    this.maxItemAge = maxItemAge
  }

  /**
   * Initializes (or re-initializes) the cache to the given size and max age.
   * Items are pruned until the max size is reached AND all expired items are gone.
   * @param maxItems max items
   * @param maxItemAge, max age in ms, 0 for infinite
   */
  public async initialize(maxItems: number, maxItemAge: number = 0) {
    await super.initialize(maxItems)
    this.maxItemAge = maxItemAge
  }

  public async get(key: string): Promise<T | undefined> {
    const item = await this.storageEngine.get(key)
    if (item) {
      if (new Date().getTime() < item.timestamp + this.maxItemAge) {
        return item.data
      } else if (this.maxItemAge > 0) {
        await this.delete(key) // cached item has expired.
      }
    }
  }

  public async getHealthCheckMeta(): Promise<object> {
    const size = await this.getSize()
    return {
      size: size,
      maxSize: this.maxSize,
      maxAge: this.maxItemAge,
      maxAgeDesc: `${this.maxItemAge} ms (${Duration.fromMillis(this.maxItemAge)
        .as('minutes')
        .toFixed(2)} min)`,
      purge_count: this._purged,
      last_cleared: this._lastCleared,
      items: await this.getHealthInfo(),
    }
  }

  protected async getHealthInfo(): Promise<TLRUCacheHealthCheck[]> {
    let info: TLRUCacheHealthCheck[] = []
    let now = new Date().getTime()
    const keys = await this.storageEngine.getKeys()
    for (const key of keys) {
      let item = await this.storageEngine.get(key)
      if (item) {
        let age = now - item.timestamp
        let ttl = this.maxItemAge !== 0 ? this.maxItemAge - age : Number.MAX_VALUE
        const accessInfo = await this.getItemHealthMetaData(key)
        info.push({
          key: key,
          age: age,
          ageDesc: `${now - item.timestamp} ms (${Duration.fromMillis(now - item.timestamp)
            .as('minutes')
            .toFixed(2)} min)`,
          ttl: ttl,
          ttlDesc:
            this.maxItemAge > 0
              ? `${ttl} ms (${Duration.fromMillis(ttl).as('minutes').toFixed(2)} min)`
              : 'Never expires',
          expired: now - item.timestamp > this.maxItemAge,
          lastAccess: accessInfo!.lastAccessed,
        })
      } else {
        info.push({
          key: key,
          age: 0,
          ageDesc: 'No value found in storage for key.',
          ttl: 0,
          ttlDesc: '',
          expired: true,
          lastAccess: {
            age: 0,
            ageDesc: '',
            utc: '',
          },
        })
      }
    }
    return info
  }

  public get maxAge(): number {
    return this.maxItemAge
  }
}

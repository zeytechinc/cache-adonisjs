import { Duration } from 'luxon'
import { TLRUCacheContract, TLRUCacheHealthCheck } from 'Skrenek/Adonis/Cache'
import { CacheItem, LRUCache } from './LRUCache'

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
  constructor(maxItems: number = 0, maxItemAge: number = 0) {
    super(maxItems)
    this.maxItemAge = maxItemAge
  }

  /**
   * Initializes (or re-initializes) the cache to the given size and max age.
   * Items are pruned until the max size is reached AND all expired items are gone.
   * @param maxItems max items, 0 for infinite
   * @param maxItemAge, max age in ms
   */
  public initialize(maxItems: number, maxItemAge: number = 0) {
    super.initialize(maxItems)
    this.maxItemAge = maxItemAge
    let now = new Date().getTime()
    for (const key of this.cacheKeyOrder) {
      const item = this.cache.get(key)!
      if (now - item.timestamp > this.maxItemAge) {
        this.delete(key)
      }
    }
  }

  public get(key: string): T | undefined {
    const item: CacheItem<T> | undefined = this.cache.get(key)
    if (item) {
      if (new Date().getTime() < item.timestamp + this.maxItemAge) {
        item.lastAccess = new Date().getTime()
        this.cacheKeyOrder.delete(key)
        this.cacheKeyOrder.add(key)
        return item.data
      } else if (this.maxItemAge > 0) {
        this.delete(key) // cached item has expired.
      }
    }
  }

  public getHealthCheckMeta(): object {
    return {
      size: this.size,
      maxSize: this.maxSize,
      maxAge: this.maxItemAge,
      maxAgeDesc: `${this.maxItemAge} ms (${Duration.fromMillis(this.maxItemAge)
        .as('minute')
        .toFixed(2)} min)`,
      purge_count: this._purged,
      last_cleared: this._lastCleared,
      items: this.getHealthInfo(),
    }
  }

  protected getHealthInfo(): TLRUCacheHealthCheck[] {
    let info: TLRUCacheHealthCheck[] = []
    let now = new Date().getTime()
    for (const key of this.cacheKeyOrder) {
      let item = this.cache.get(key)!
      let age = now - item.timestamp
      let ttl = this.maxItemAge !== 0 ? this.maxItemAge - age : Number.MAX_VALUE
      const accessInfo = this.getItemHealthMetaData(key)
      info.push({
        key: key,
        age: age,
        ageDesc: `${now - item.timestamp} ms (${Duration.fromMillis(now - item.timestamp)
          .as('minute')
          .toFixed(2)} min)`,
        ttl: ttl,
        ttlDesc: `${ttl} ms (${Duration.fromMillis(ttl).as('minute').toFixed(2)} min)`,
        expired: now - item.timestamp > this.maxItemAge,
        lastAccess: accessInfo!.lastAccessed,
      })
    }
    return info
  }

  public get maxAge(): number {
    return this.maxItemAge
  }
}

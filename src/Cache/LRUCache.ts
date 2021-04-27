import HealthCheckHelper from '../Helpers/HealthCheckHelper'

export class CacheItem<T> {
  public data: T
  public timestamp: number
  public lastAccess: number

  constructor(data: T) {
    this.data = data
    this.timestamp = new Date().getTime()
    this.lastAccess = this.timestamp
  }
}

/**
 * This class implements a least recently used in-memory cache specifically tailored toward use in AdonisJS.  While
 * it can be used outside of it, it provides health check mechanisms that can be used by the framework to inspect
 * the state of the cache at runtime.
 */
export class LRUCache<T> {
  protected cache: Map<string, CacheItem<T>> = new Map()
  protected cacheKeyOrder: Set<string> = new Set()
  protected maxItems: number = 0
  protected _purged: number = 0
  protected _lastCleared: string = 'never'

  constructor(maxItems: number = 0) {
    this.maxItems = maxItems
  }

  /**
   * Allows the cache to be initialized after construction or reinitialized with a new size.
   * When re-initializing, the oldest items will be pruned until the new max size is reached.
   * @param maxItems the max number of items to cache before purging old items.
   */
  public initialize(maxItems: number) {
    this.maxItems = maxItems
    while (this.cache.size > this.maxItems) {
      let deleteKey = this.cacheKeyOrder.values().next().value
      deleteKey && this.cache.delete(deleteKey)
    }
  }

  public set(key: string, data: T | CacheItem<T>) {
    if (!this.cache.has(key)) {
      this.cacheKeyOrder.add(key)
    }
    if (data instanceof CacheItem) {
      data.lastAccess = new Date().getTime()
      this.cache.set(key, data)
    } else {
      this.cache.set(key, new CacheItem(data))
    }

    if (this.cache.size > this.maxItems) {
      let deleteKey = this.cacheKeyOrder.values().next().value
      deleteKey && this.cache.delete(deleteKey)
    }
  }

  public get(key: string): T | undefined {
    const item = this.cache.get(key)
    if (item) {
      item.lastAccess = new Date().getTime()
      this.cacheKeyOrder.delete(key)
      this.cacheKeyOrder.add(key)
      return item.data
    }
  }

  public delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.cacheKeyOrder.delete(key)
      this._purged += 1
    }
    return deleted
  }

  public clear() {
    this.cache.clear()
    this.cacheKeyOrder.clear()
    this._purged = 0
    this._lastCleared = new Date().toISOString() // utc
  }

  public get size() {
    return this.cache.size
  }

  public get maxSize(): number {
    return this.maxItems
  }

  public get purged(): number {
    return this._purged
  }

  public get lastCleared(): string {
    return this._lastCleared
  }

  public getHealthCheckMessage(): string {
    return `Size ${this.size} of ${this.maxItems}`
  }

  public getHealthCheckMeta(includeItems?: boolean): object {
    const meta: any = {
      size: this.size,
      maxSize: this.maxItems,
      purge_count: this._purged,
      last_cleared: this._lastCleared,
    }

    if (includeItems) {
      const items: any = []
      for (const key of this.cacheKeyOrder) {
        items.push(this.getItemHealthMetaData(key))
      }
      meta.items = items
    }

    return meta
  }

  protected getItemHealthMetaData(key: string, dateFormat?: string) {
    const item = this.cache.get(key)
    if (key) {
      return {
        key: key,
        dateCreated: new Date(), //HealthCheckHelper.formatDate(new Date(item!.timestamp)),
        lastAccessed: HealthCheckHelper.getAccessInfo(item!.lastAccess, dateFormat),
      }
    }
  }
}

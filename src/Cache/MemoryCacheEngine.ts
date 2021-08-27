import { CacheEngine } from './CacheEngine'
import CacheItem from './CacheItem'

export default class MemoryCacheEngine<T> implements CacheEngine<T> {
  protected cache: Map<string, CacheItem<T>> = new Map()
  protected cacheKeyOrder: Set<string> = new Set()
  private maxItemAge: number = 0

  public async has(key: string): Promise<boolean> {
    return this.cache.has(key)
  }

  public async set(key: string, data: T | CacheItem<T>) {
    if (!this.cache.has(key)) {
      this.cacheKeyOrder.add(key)
    }
    if (data instanceof CacheItem) {
      data.lastAccess = new Date().getTime()
      this.cache.set(key, data)
    } else {
      this.cache.set(key, new CacheItem(data))
    }
  }

  public async get(key: string): Promise<CacheItem<T> | undefined> {
    const item = this.cache.get(key)
    if (item) {
      item.lastAccess = new Date().getTime()
      this.cacheKeyOrder.delete(key)
      this.cacheKeyOrder.add(key)
    }
    return item
  }

  public async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.cacheKeyOrder.delete(key)
    }
    return deleted
  }

  public async clear() {
    this.cache.clear()
    this.cacheKeyOrder.clear()
  }

  public async getSize(): Promise<number> {
    return this.cache.size
  }

  public async getOldestKey(): Promise<string | undefined> {
    return this.cacheKeyOrder.values().next().value
  }

  public async getKeys(): Promise<Set<string>> {
    return this.cacheKeyOrder
  }

  public async prune(maxSize: number): Promise<number> {
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

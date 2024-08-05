/*
 * File: lru_cache.ts
 * Created Date: Aug 02, 2024
 * Copyright (c) 2024 Zeytech Inc. (https://zeytech.com)
 * Author: Steve Krenek (https://github.com/skrenek)
 * -----
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { CacheItem } from './cache.js'
import { CacheEngine } from './engines/index.js'
import { HealthCheckHelper } from './health_check.js'

/**
 * This class implements a least recently used in-memory cache specifically tailored toward use in AdonisJS.  While
 * it can be used outside of it, it provides health check mechanisms that can be used by the framework to inspect
 * the state of the cache at runtime.
 */
export class LRUCache<T> {
  protected maxItems: number = 0
  protected _purged: number = 0
  protected _lastCleared: string = 'never'
  protected _displayName: string
  protected storageEngine: CacheEngine<T>
  healthCheckEnabled = true
  healthCheckItemsEnabled = true

  constructor(storage: CacheEngine<T>, maxItems: number = 0, displayName?: string) {
    this.maxItems = maxItems
    this._displayName = displayName || `cache_${Date.now()}`
    this.storageEngine = storage
  }

  /**
   * Allows the cache to be initialized after construction or reinitialized with a new size.
   * When re-initializing, the oldest items will be pruned until the new max size is reached.
   * @param maxItems the max number of items to cache before purging old items.
   */
  async initialize(maxItems: number) {
    this.maxItems = maxItems
    await this.storageEngine.prune(maxItems)
  }

  async set(key: string, data: T | CacheItem<T>) {
    this.storageEngine.set(key, data)
    await this.storageEngine.prune(this.maxItems)
  }

  async get(key: string): Promise<T | undefined> {
    const item = await this.storageEngine.get(key)
    if (item) {
      item.lastAccess = new Date().getTime()
    }
    return item?.data
  }

  async delete(key: string): Promise<boolean> {
    const deleted = await this.storageEngine.delete(key)
    if (deleted) {
      this._purged += 1
    }
    return deleted
  }

  async clear() {
    await this.storageEngine.clear()
    this._purged = 0
    this._lastCleared = new Date().toISOString() // utc
  }

  async getSize(): Promise<number> {
    return await this.storageEngine.getSize()
  }

  get maxSize(): number {
    return this.maxItems
  }

  get purged(): number {
    return this._purged
  }

  get lastCleared(): string {
    return this._lastCleared
  }

  async getHealthCheckMessage(): Promise<string> {
    const size = await this.getSize()
    return `Size ${size} of ${this.maxItems}`
  }

  async getHealthCheckMeta(dateFormat?: string): Promise<object> {
    const size = await this.getSize()
    const meta: any = {
      size: size,
      maxSize: this.maxItems,
      purgeCount: this._purged,
      lastCleared: this._lastCleared,
    }

    if (this.healthCheckItemsEnabled) {
      const items: any = []
      const keys = await this.storageEngine.getKeys()
      for (const key of keys) {
        items.push(this.getItemHealthMetaData(key, dateFormat))
      }
      meta.items = items
    }

    return meta
  }

  protected async getItemHealthMetaData(key: string, dateFormat?: string) {
    const item = await this.storageEngine.getRaw(key)
    if (item) {
      return {
        key: key,
        dateCreated: new Date(item.timestamp),
        lastAccessed: HealthCheckHelper.getAccessInfo(item.lastAccess, dateFormat),
      }
    } else {
      return {
        key: key,
        error: 'No value found for key.',
      }
    }
  }

  getStorageEngine(): CacheEngine<T> {
    return this.storageEngine
  }

  get isTimed(): boolean {
    return false
  }

  get displayName(): string {
    return this._displayName
  }
}

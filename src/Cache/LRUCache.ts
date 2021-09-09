/*
 * File: LRUCache.ts
 * Created Date: Apr 08, 2021
 * Copyright (c) 2021 Zeytech Inc. (https://zeytech.com)
 * Author: Steve Krenek (https://github.com/skrenek)
 * -----
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Checker } from '@ioc:Adonis/Core/HealthCheck'
import { LRUCacheContract } from '@ioc:Adonis/Addons/Zeytech/Cache/LRUCache'
import { HealthCheckHelper } from '../Helpers/HealthCheckHelper'
import CacheItem from './CacheItem'
import cuid from 'cuid'
import { CacheEngineContract } from '@ioc:Adonis/Addons/Zeytech/Cache'

/**
 * This class implements a least recently used in-memory cache specifically tailored toward use in AdonisJS.  While
 * it can be used outside of it, it provides health check mechanisms that can be used by the framework to inspect
 * the state of the cache at runtime.
 */
export class LRUCache<T> implements LRUCacheContract<T> {
  protected maxItems: number = 0
  protected _purged: number = 0
  protected _lastCleared: string = 'never'
  protected displayName: string
  protected storageEngine: CacheEngineContract<T>

  constructor(storage: CacheEngineContract<T>, maxItems: number = 0, displayName?: string) {
    this.maxItems = maxItems
    this.displayName = displayName || cuid()
    this.storageEngine = storage
  }

  /**
   * Allows the cache to be initialized after construction or reinitialized with a new size.
   * When re-initializing, the oldest items will be pruned until the new max size is reached.
   * @param maxItems the max number of items to cache before purging old items.
   */
  public async initialize(maxItems: number) {
    this.maxItems = maxItems
    await this.storageEngine.prune(maxItems)
  }

  public async set(key: string, data: T | CacheItem<T>) {
    this.storageEngine.set(key, data)
    await this.storageEngine.prune(this.maxItems)
  }

  public async get(key: string): Promise<T | undefined> {
    const item = await this.storageEngine.get(key)
    if (item) {
      item.lastAccess = new Date().getTime()
    }
    return item?.data
  }

  public async delete(key: string): Promise<boolean> {
    const deleted = await this.storageEngine.delete(key)
    if (deleted) {
      this._purged += 1
    }
    return deleted
  }

  public async clear() {
    await this.storageEngine.clear()
    this._purged = 0
    this._lastCleared = new Date().toISOString() // utc
  }

  public async getSize(): Promise<number> {
    return await this.storageEngine.getSize()
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

  public async getHealthCheckMessage(): Promise<string> {
    const size = await this.getSize()
    return `Size ${size} of ${this.maxItems}`
  }

  public async getHealthCheckMeta(includeItems?: boolean, dateFormat?: string): Promise<object> {
    const size = await this.getSize()
    const meta: any = {
      size: size,
      maxSize: this.maxItems,
      purge_count: this._purged,
      last_cleared: this._lastCleared,
    }

    if (includeItems) {
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

  public async getHealthChecker(includeItems?: boolean, dateFormat?: string): Promise<Checker> {
    return async () => {
      const size = await this.getSize()
      return {
        displayName: this.displayName,
        health: {
          healthy: this.maxSize === 0 ? true : size < this.maxSize,
          message: await this.getHealthCheckMessage(),
        },
        meta: await this.getHealthCheckMeta(includeItems, dateFormat),
      }
    }
  }

  public getStorageEngine(): CacheEngineContract<T> {
    return this.storageEngine
  }
}

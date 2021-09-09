/*
 * File: MemoryCacheEngine.ts
 * Created Date: Aug 25, 2021
 * Copyright (c) 2021 Zeytech Inc. (https://zeytech.com)
 * Author: Steve Krenek (https://github.com/skrenek)
 * -----
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { CacheEngineContract, CacheItemContract } from '@ioc:Adonis/Addons/Zeytech/Cache'
import CacheItem from './CacheItem'

export default class MemoryCacheEngine<T> implements CacheEngineContract<T> {
  protected cache: Map<string, CacheItem<T>> = new Map()
  protected cacheKeyOrder: Set<string> = new Set()

  public async has(key: string): Promise<boolean> {
    return this.cache.has(key)
  }

  public async set(key: string, data: T | CacheItemContract<T>) {
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

  public async get(key: string): Promise<CacheItem<T> | undefined> {
    const item = this.cache.get(key)
    if (item) {
      item.lastAccess = new Date().getTime()
      this.cacheKeyOrder.delete(key)
      this.cacheKeyOrder.add(key)
    }
    return item
  }

  public async getRaw(key: string): Promise<CacheItem<T> | undefined> {
    const item = this.cache.get(key)
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

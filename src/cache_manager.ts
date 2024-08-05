/*
 * File: cache_manager.ts
 * Created Date: Aug 02, 2024
 * Copyright (c) 2024 Zeytech Inc. (https://zeytech.com)
 * Author: Steve Krenek (https://github.com/skrenek)
 * -----
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { CacheEngineType } from './cache.js'
import { CacheEngine, MemoryCacheEngine, RedisCacheEngine } from './engines/index.js'
import { LRUCache } from './lru_cache.js'
import { TLRUCache } from './tlru_cache.js'
import { CacheManagerContract } from './types.js'

export class CacheManager implements CacheManagerContract {
  #caches: Map<string, LRUCache<any> | TLRUCache<any>>

  constructor() {
    this.#caches = new Map()
  }

  private buildCacheEngine<T>(
    storage: CacheEngineType,
    displayName?: string,
    connectionName?: string,
    maxItemAge?: number
  ): CacheEngine<T> {
    let engine: CacheEngine<T>
    if (storage === 'redis') {
      const redis = new RedisCacheEngine<T>(connectionName, displayName, maxItemAge)
      engine = redis
    } else {
      engine = new MemoryCacheEngine<T>()
    }
    return engine
  }

  createLRUCache<T>(
    key: string,
    maxItems = 0,
    storage: CacheEngineType = 'memory',
    displayName?: string,
    connectionName?: string
  ): LRUCache<T> {
    const engine = this.buildCacheEngine<T>(storage, displayName, connectionName)
    const cache = new LRUCache<T>(engine, maxItems, displayName)
    this.#caches.set(key, cache)
    return cache
  }

  createTLRUCache<T>(
    key: string,
    maxItems: number,
    maxItemAge: number,
    storage: CacheEngineType,
    displayName?: string,
    connectionName?: string
  ): TLRUCache<T> {
    const engine = this.buildCacheEngine<T>(storage, displayName, connectionName, maxItemAge)
    const cache = new TLRUCache<T>(engine, maxItems, maxItemAge, displayName)
    this.#caches.set(key, cache)
    return cache
  }

  getLRUCache<T>(key: string): LRUCache<T> | undefined {
    return this.#caches.get(key)
  }

  getTLRUCache<T>(key: string): TLRUCache<T> | undefined {
    return this.#caches.get(key) as TLRUCache<T> | undefined
  }

  getKeys(): string[] {
    return [...this.#caches.keys()]
  }

  async removeCache(key: string): Promise<boolean> {
    const cache = this.#caches.get(key)
    if (cache) {
      await cache.clear()
    }
    return this.#caches.delete(key)
  }

  async shutdown(): Promise<void> {
    const promises: Promise<boolean>[] = []
    for (const key of this.#caches.keys()) {
      promises.push(this.removeCache(key))
    }
    await Promise.all(promises)
  }
}

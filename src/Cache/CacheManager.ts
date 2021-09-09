/*
 * File: CacheManager.ts
 * Created Date: Aug 31, 2021
 * Copyright (c) 2021 Zeytech Inc. (https://zeytech.com)
 * Author: Steve Krenek (https://github.com/skrenek)
 * -----
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RedisManagerContract } from '@ioc:Adonis/Addons/Redis'
import { LRUCacheContract } from '@ioc:Adonis/Addons/Zeytech/Cache/LRUCache'
import { LRUCache } from './LRUCache'
import { TLRUCache } from './TLRUCache'
import { TLRUCacheContract } from '@ioc:Adonis/Addons/Zeytech/Cache/TLRUCache'
import RedisCacheEngine from './RedisCacheEngine'
import { CacheEngineContract, CacheEngineType } from '@ioc:Adonis/Addons/Zeytech/Cache'
import MemoryCacheEngine from './MemoryCacheEngine'

export default class CacheManager {
  constructor(protected _redisManager: RedisManagerContract) {
    this.caches = new Map()
  }

  private caches: Map<string, LRUCacheContract<any> | TLRUCacheContract<any>>

  private buildCacheEngine<T>(
    storage: CacheEngineType,
    displayName?: string,
    connectionName?: string,
    maxItemAge?: number
  ): CacheEngineContract<T> {
    let engine: CacheEngineContract<T>
    if (storage === 'redis') {
      const redis = new RedisCacheEngine<T>(displayName, maxItemAge)
      redis.redisConnection = connectionName
        ? this._redisManager.connection(connectionName)
        : this._redisManager.connection()
      engine = redis
    } else {
      engine = new MemoryCacheEngine<T>()
    }
    return engine
  }

  public createLRUCache<T>(
    key: string,
    maxItems = 0,
    storage: CacheEngineType = 'memory',
    displayName?: string,
    connectionName?: string
  ): LRUCacheContract<T> {
    const engine = this.buildCacheEngine<T>(storage, displayName, connectionName)
    const cache = new LRUCache<T>(engine, maxItems, displayName)
    this.caches.set(key, cache)
    return cache
  }

  public createTLRUCache<T>(
    key: string,
    maxItems: number,
    maxItemAge: number,
    storage: CacheEngineType,
    displayName?: string,
    connectionName?: string
  ): TLRUCacheContract<T> {
    const engine = this.buildCacheEngine<T>(storage, displayName, connectionName, maxItemAge)
    const cache = new TLRUCache<T>(engine, maxItems, maxItemAge, displayName)
    this.caches.set(key, cache)
    return cache
  }

  public getLRUCache<T>(key: string): LRUCacheContract<T> | undefined {
    return this.caches.get(key)
  }

  public getTLRUCache<T>(key: string): TLRUCacheContract<T> | undefined {
    return this.caches.get(key) as TLRUCacheContract<T> | undefined
  }

  public async removeCache(key: string): Promise<boolean> {
    const cache = this.caches.get(key)
    if (cache) {
      await cache.clear()
    }
    return this.caches.delete(key)
  }

  public async shutdown(): Promise<void> {
    const promises: Promise<boolean>[] = []
    for (const key of this.caches.keys()) {
      promises.push(this.removeCache(key))
    }
    await Promise.all(promises)
  }
}

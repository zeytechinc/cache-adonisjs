/*
 * File: cache.ts
 * Created Date: Apr 06, 2021
 * Copyright (c) 2021 Zeytech Inc. (https://zeytech.com)
 * Author: Steve Krenek (https://github.com/skrenek)
 * -----
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HealthCheckContract } from '@ioc:Adonis/Core/HealthCheck'

declare module '@ioc:Adonis/Addons/Zeytech/Cache' {
  import { LRUCacheContract } from '@ioc:Adonis/Addons/Zeytech/Cache/LRUCache'
  import { TLRUCacheContract } from '@ioc:Adonis/Addons/Zeytech/Cache/TLRUCache'
  export interface LastAccessInfoContract {
    utc: string
    age: number
    ageDesc: string
  }

  export interface CacheItemContract<T> {
    data: T
    timestamp: number
    lastAccess: number
    serialize(): string
  }

  export interface CacheEngineContract<T> {
    has(key: string): Promise<boolean>
    set(key: string, data: T | CacheItemContract<T>): Promise<void>
    get(key: string): Promise<CacheItemContract<T> | undefined>
    getRaw(key: string): Promise<CacheItemContract<T> | undefined>
    delete(key: string): Promise<boolean>
    clear(): Promise<void>
    getSize(): Promise<number>
    getOldestKey(): Promise<string | undefined>
    getKeys(): Promise<Set<string>>
    prune(maxSize: number): Promise<number>
  }

  export type CacheEngineType = 'memory' | 'redis'

  export interface CacheManagerContract {
    createLRUCache<T>(
      key: string,
      maxItems: number,
      storage: CacheEngineType,
      displayName?: string,
      connectionName?: string
    ): LRUCacheContract<T>

    createTLRUCache<T>(
      key: string,
      maxItems: number,
      maxItemAge: number,
      storage: CacheEngineType,
      displayName?: string,
      connectionName?: string
    ): TLRUCacheContract<T>

    getLRUCache<T>(key: string): LRUCacheContract<T> | undefined

    getTLRUCache<T>(key: string): TLRUCacheContract<T> | undefined

    removeCache(key: string): Promise<boolean>

    shutdown(): Promise<void>
  }

  export const CacheManager: CacheManagerContract
  export const CacheItem: CacheItemContract<any>
  export const HealthCheckHelper: HealthCheckContract
}

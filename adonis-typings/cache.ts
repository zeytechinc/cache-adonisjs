declare module '@ioc:Skrenek/Adonis/Cache' {
  import { LRUCacheContract } from '@ioc:Skrenek/Adonis/Cache/LRUCache'
  import { TLRUCacheContract } from '@ioc:Skrenek/Adonis/Cache/TLRUCache'
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
}

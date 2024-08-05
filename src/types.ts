import { CacheEngineType, CacheItem } from './cache.js'
import { LRUCache } from './lru_cache.js'
import { TLRUCache } from './tlru_cache.js'

export interface BaseHealthCheckMetadata {
  size: number
  maxSize: number
  purgeCount: number
  lastCleared: string
  items?: {
    key: string
    error?: string
    dateCreated?: Date
    lastAccessed?: {
      utc: string
      age: number
      ageDesc: string
    }
  }[]
}

export interface TLRUHealthCheckMetadataItem {
  key: string
  age: number
  ageDesc: string
  ttl: number
  ttlDesc: string
  expired: boolean
  lastAccessed?: {
    utc: string
    age: number
    ageDesc: string
  }
}

export interface TLRUHealthCheckMetadata extends BaseHealthCheckMetadata {
  maxAge: number
  maxAgeDesc: string
  items?: TLRUHealthCheckMetadataItem[]
}

export interface BaseCache<T> {
  initialize(maxItems: number): Promise<void>
  set(key: string, data: T | CacheItem<T>): Promise<void>
  get(key: string): Promise<T | undefined>
  delete(key: string): Promise<boolean>
  clear(): Promise<void>
  readonly maxSize: number
  readonly purged: number
  readonly lastCleared: string
  getHealthCheckMessage(): Promise<string>
  getHealthCheckMeta(includeItems?: boolean, dateFormat?: string): Promise<object>
}
export interface CacheManagerContract {
  createLRUCache<T>(
    key: string,
    maxItems: number,
    storage: CacheEngineType,
    displayName?: string,
    connectionName?: string
  ): LRUCache<T>
  createTLRUCache<T>(
    key: string,
    maxItems: number,
    maxItemAge: number,
    storage: CacheEngineType,
    displayName?: string,
    connectionName?: string
  ): TLRUCache<T>
  getLRUCache<T>(key: string): LRUCache<T> | undefined
  getTLRUCache<T>(key: string): TLRUCache<T> | undefined
  getKeys(): string[]
  removeCache(key: string): Promise<boolean>
  shutdown(): Promise<void>
}

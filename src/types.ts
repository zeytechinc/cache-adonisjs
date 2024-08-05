import { CacheItem } from './cache.js'

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

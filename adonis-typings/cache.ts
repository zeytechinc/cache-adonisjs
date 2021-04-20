declare module 'Skrenek/Adonis/Cache' {
  export interface HealthCheckHelperContract {
    getAccessInfo(ms?: number): LastAccessInfo
    formatDate(date: Date): string
    setDateFormat(value: string)
  }

  export interface TLRUCacheHealthCheck {
    key: string
    age: number
    ageDesc: string
    ttl: number
    ttlDesc: string
    expired: boolean
    lastAccess?: LastAccessInfo
  }

  export interface LastAccessInfo {
    utc: string
    age: number
    ageDesc: string
  }

  export const HealthCheckHelper: HealthCheckHelperContract

  export interface CacheItem<T> {
    data: T
    timestamp: number
    lastAccess: number
  }

  export interface LRUCacheContract<T> {
    initialize(maxItems: number): void
    set(key: string, data: T | CacheItem<T>): void
    get(key: string): T | undefined
    delete(key: string): boolean
    clear(): void
    readonly maxSize: number
    readonly purged: number
    readonly lastCleared: string
    getHealthCheckMessage(): string
    getHealthCheckMeta(includeItems?: boolean): object
  }

  export interface TLRUCacheContract<T> extends LRUCacheContract<T> {
    readonly maxAge: number
  }

  export type LRUCacheConstructorContract = {
    new <T>(maxItems?: number): LRUCacheContract<T>
  }

  export type TLRUCacheConstructorContract = {
    new <T>(maxItems?: number, maxItemAge?: number): TLRUCacheContract<T>
  }

  export const LRUCache: LRUCacheConstructorContract
  export const TLRUCache: TLRUCacheConstructorContract
}

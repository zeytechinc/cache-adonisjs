declare module '@ioc:Skrenek/Adonis/Cache' {
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
    delete(key: string): Promise<boolean>
    clear(): Promise<void>
    getSize(): Promise<number>
    getOldestKey(): Promise<string | undefined>
    getKeys(): Promise<Set<string>>
    prune(maxSize: number): Promise<number>
  }

  export type CacheEngineType = 'memory' | 'redis'
}

declare module '@ioc:Skrenek/Adonis/Cache/LRUCache' {
  import { CacheItemContract } from '@ioc:Skrenek/Adonis/Cache'
  import { Checker } from '@ioc:Adonis/Core/HealthCheck'

  export interface LRUCacheContract<T> {
    initialize(maxItems: number): void
    set(key: string, data: T | CacheItemContract<T>): void
    get(key: string): T | undefined
    delete(key: string): boolean
    clear(): void
    readonly maxSize: number
    readonly purged: number
    readonly lastCleared: string
    getHealthCheckMessage(): string
    getHealthCheckMeta(includeItems?: boolean, dateFormat?: string): object
    getHealthChecker(displayName: string): Checker
  }

  export type LRUCacheConstructorContract = {
    new <T>(maxItems?: number): LRUCacheContract<T>
  }

  export const LRUCache: LRUCacheConstructorContract
  export default LRUCache
}

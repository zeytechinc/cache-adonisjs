declare module '@ioc:Adonis/Addons/Zeytech/Cache/LRUCache' {
  import { CacheItemContract } from '@ioc:Adonis/Addons/Zeytech/Cache'
  import { Checker } from '@ioc:Adonis/Core/HealthCheck'

  export interface LRUCacheContract<T> {
    initialize(maxItems: number): Promise<void>
    set(key: string, data: T | CacheItemContract<T>): Promise<void>
    get(key: string): Promise<T | undefined>
    delete(key: string): Promise<boolean>
    clear(): Promise<void>
    readonly maxSize: number
    readonly purged: number
    readonly lastCleared: string
    getHealthCheckMessage(): Promise<string>
    getHealthCheckMeta(includeItems?: boolean, dateFormat?: string): Promise<object>
    getHealthChecker(includeItems?: boolean, dateFormat?: string): Promise<Checker>
  }

  // export type LRUCacheConstructorContract = {
  //   new <T>(
  //     maxItems: number,
  //     storage: CacheEngineContract<T>,
  //     displayName?: string
  //   ): LRUCacheContract<T>
  // }

  // export const LRUCache: LRUCacheConstructorContract
  // export default LRUCache
}

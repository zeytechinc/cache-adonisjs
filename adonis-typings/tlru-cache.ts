declare module '@ioc:Skrenek/Adonis/Cache/TLRUCache' {
  import { LRUCacheContract } from '@ioc:Skrenek/Adonis/Cache/LRUCache'
  import { LastAccessInfoContract } from '@ioc:Skrenek/Adonis/Cache'

  export interface TLRUCacheContract<T> extends LRUCacheContract<T> {
    readonly maxAge: number
  }

  export type TLRUCacheConstructorContract = {
    new <T>(displayName?: string, maxItems?: number, maxItemAge?: number): TLRUCacheContract<T>
  }

  export interface TLRUCacheHealthCheck {
    key: string
    age: number
    ageDesc: string
    ttl: number
    ttlDesc: string
    expired: boolean
    lastAccess?: LastAccessInfoContract
  }

  export const TLRUCache: TLRUCacheConstructorContract
  export default TLRUCache
}

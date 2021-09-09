/*
 * File: tlru-cache.ts
 * Created Date: May 20, 2021
 * Copyright (c) 2021 Zeytech Inc. (https://zeytech.com)
 * Author: Steve Krenek (https://github.com/skrenek)
 * -----
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Addons/Zeytech/Cache/TLRUCache' {
  import { LRUCacheContract } from '@ioc:Adonis/Addons/Zeytech/Cache/LRUCache'
  import { LastAccessInfoContract } from '@ioc:Adonis/Addons/Zeytech/Cache'

  export interface TLRUCacheContract<T> extends LRUCacheContract<T> {
    readonly maxAge: number
  }

  // export type TLRUCacheConstructorContract = {
  //   new <T>(
  //     maxItems: number,
  //     maxItemAge: number,
  //     storage?: CacheEngineContract<T>,
  //     displayName?: string,
  //     connectionName?: string
  //   ): TLRUCacheContract<T>
  // }

  export interface TLRUCacheHealthCheckContract {
    key: string
    age: number
    ageDesc: string
    ttl: number
    ttlDesc: string
    expired: boolean
    lastAccess?: LastAccessInfoContract
  }

  // export const TLRUCache: TLRUCacheConstructorContract
  // export default TLRUCache
}

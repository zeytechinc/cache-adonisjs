/*
 * File: cache.ts
 * Created Date: Aug 02, 2024
 * Copyright (c) 2024 Zeytech Inc. (https://zeytech.com)
 * Author: Steve Krenek (https://github.com/skrenek)
 * -----
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
export type CacheEngineType = 'memory' | 'redis'

export class CacheItem<T> {
  data: T
  timestamp: number
  lastAccess: number

  constructor(data: T) {
    this.data = data
    this.timestamp = new Date().getTime()
    this.lastAccess = this.timestamp
  }

  serialize(pretty?: boolean) {
    if (pretty) {
      return JSON.stringify(this, null, 2)
    }
    return JSON.stringify(this)
  }

  static parse<U>(data: string): CacheItem<U> {
    const temp = JSON.parse(data)
    const item = new CacheItem(temp.data)
    item.timestamp = temp.timestamp
    item.lastAccess = temp.lastAccess
    return item
  }
}

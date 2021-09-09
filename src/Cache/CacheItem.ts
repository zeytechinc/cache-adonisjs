/*
 * File: CacheItem.ts
 * Created Date: May 20, 2021
 * Copyright (c) 2021 Zeytech Inc. (https://zeytech.com)
 * Author: Steve Krenek (https://github.com/skrenek)
 * -----
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { CacheItemContract } from '@ioc:Adonis/Addons/Zeytech/Cache'

class CacheItem<T> implements CacheItemContract<T> {
  public data: T
  public timestamp: number
  public lastAccess: number

  constructor(data: T) {
    this.data = data
    this.timestamp = new Date().getTime()
    this.lastAccess = this.timestamp
  }

  public serialize() {
    return JSON.stringify(this)
  }

  public static parse<U>(data: string): CacheItem<U> {
    const temp = JSON.parse(data)
    const item = new CacheItem(temp.data)
    item.timestamp = temp.timestamp
    item.lastAccess = temp.lastAccess
    return item
  }
}

export default CacheItem

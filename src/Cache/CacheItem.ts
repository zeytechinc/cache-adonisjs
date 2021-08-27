import { CacheItemContract } from '@ioc:Skrenek/Adonis/Cache'

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

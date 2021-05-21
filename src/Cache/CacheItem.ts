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
}

export default CacheItem

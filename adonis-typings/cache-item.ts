declare module '@ioc:Skrenek/Adonis/Cache/CacheItem' {
  export interface CacheItem<T> {
    data: T
    timestamp: number
    lastAccess: number
  }

  export default CacheItem
}

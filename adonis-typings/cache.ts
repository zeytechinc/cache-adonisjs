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
  }
}

import CacheItem from '@ioc:Skrenek/Adonis/Cache/CacheItem'

export interface CacheEngine<T> {
  has(key: string): Promise<boolean>
  set(key: string, data: T | CacheItem<T>): Promise<void>
  get(key: string): Promise<CacheItem<T> | undefined>
  delete(key: string): Promise<boolean>
  clear(): Promise<void>
  getSize(): Promise<number>
  getOldestKey(): Promise<string | undefined>
  getKeys(): Promise<Set<string>>
  prune(maxSize: number): Promise<number>
}

import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class CacheProvider {
  constructor(protected app: ApplicationContract) {}
  public static needsApplication = true

  public register() {
    this.app.container.bind('@ioc:Skrenek/Adonis/Cache/HealthCheckHelper', () => {
      const { HealthCheckHelper } = require('../src/Helpers/HealthCheckHelper')
      return HealthCheckHelper
    })

    this.app.container.bind('@ioc:Skrenek/Adonis/Cache/LRUCache', () => {
      const { LRUCache } = require('../src/Cache/LRUCache')
      return LRUCache
    })

    this.app.container.bind('@ioc:Skrenek/Adonis/Cache/TLRUCache', () => {
      const { TLRUCache } = require('../src/Cache/TLRUCache')
      return TLRUCache
    })

    this.app.container.bind('@ioc:Skrenek/Adonis/Cache/CacheItem', () => {
      const CacheItem = require('../src/Cache/CacheItem')
      return CacheItem
    })
  }
}

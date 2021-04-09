import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { HealthCheckHelperContract } from 'Skrenek/Adonis/Cache'

export default class CacheProvider {
  constructor(protected app: ApplicationContract) {}
  public static needsApplication = true

  public register() {
    this.app.container.singleton('Skrenek/Adonis/Cache/HealthCheckHelper', () => {
      const { HealthCheckHelper } = require('../src/Helpers/HealthCheckHelper')
      return new HealthCheckHelper()
    })

    this.app.container.bind('Skrenek/Adonis/Cache/LRUCache', () => {
      const { LRUCache } = require('../src/Cache/LRUCache')
      return LRUCache
    })

    this.app.container.bind('Skrenek/Adonis/Cache/TLRUCache', () => {
      const { TLRUCache } = require('../src/Cache/TLRUCache')
      return TLRUCache
    })
  }

  public boot() {
    this.app.container.withBindings(
      ['Skrenek/Adonis/Cache/HealthCheckHelper'],
      (HealthCheckHelper: HealthCheckHelperContract) => {
        const Config = this.app.container.resolveBinding('Adonis/Core/Config')
        const dateFormat = Config.get('cache.dateFormat', 'yyyy-LL-dd HH:mm:ss ZZZZ')
        HealthCheckHelper.setDateFormat(dateFormat)
      }
    )
  }
}

import { RedisManagerContract } from '@ioc:Adonis/Addons/Redis'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import CacheManager from '../src/Cache/CacheManager'

export default class CacheProvider {
  constructor(protected app: ApplicationContract) {}
  public static needsApplication = true

  public register() {
    this.app.container.bind('Skrenek/Adonis/Cache/HealthCheckHelper', () => {
      const { HealthCheckHelper } = require('../src/Helpers/HealthCheckHelper')
      return HealthCheckHelper
    })

    this.app.container.bind('Skrenek/Adonis/Cache/CacheItem', () => {
      const CacheItem = require('../src/Cache/CacheItem')
      return CacheItem
    })
  }

  public boot() {
    this.app.container.singleton('Skrenek/Adonis/Cache/CacheManager', () => {
      const redis: RedisManagerContract = this.app.container.use('Adonis/Addons/Redis')
      return new CacheManager(redis)
    })
  }

  public async shutdown() {
    await this.app.container.resolveBinding('Skrenek/Adonis/Cache/CacheManager').shutdown()
  }
}

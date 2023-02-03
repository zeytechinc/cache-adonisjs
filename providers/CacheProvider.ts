/*
 * File: CacheProvider.ts
 * Created Date: Apr 08, 2021
 * Copyright (c) 2021 Zeytech Inc. (https://zeytech.com)
 * Author: Steve Krenek (https://github.com/skrenek)
 * -----
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RedisManagerContract } from '@ioc:Adonis/Addons/Redis'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import CacheManager from '../src/Cache/CacheManager'

export default class CacheProvider {
  constructor(protected app: ApplicationContract) {}
  public static needsApplication = true

  public register() {
    const Logger = this.app.container.resolveBinding('Adonis/Core/Logger')
    this.app.container.bind('Adonis/Addons/Zeytech/Cache/HealthCheckHelper', () => {
      const { HealthCheckHelper } = require('../src/Helpers/HealthCheckHelper')
      return HealthCheckHelper
    })

    this.app.container.bind('Adonis/Addons/Zeytech/Cache/CacheItem', () => {
      const CacheItem = require('../src/Cache/CacheItem')
      return CacheItem
    })

    this.app.container.singleton('Adonis/Addons/Zeytech/Cache/CacheManager', () => {
      let redisManager: RedisManagerContract | undefined
      try {
        redisManager = this.app.container.use('Adonis/Addons/Redis')
      } catch (err) {
        Logger.warn(
          'Zeytech-CacheManager: No redis manager found during initialization.  Creating redis caches will throw an exception.'
        )
      }
      return new CacheManager(redisManager)
    })
  }

  public boot() {}

  public async shutdown() {
    await this.app.container.resolveBinding('Adonis/Addons/Zeytech/Cache/CacheManager').shutdown()
  }
}

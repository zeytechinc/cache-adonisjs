/*
 * File: CacheProvider.ts
 * Created Date: Apr 08, 2021
 * Copyright (c) 2021 Zeytech Inc. (https://zeytech.com)
 * Author: Steve Krenek (https://github.com/skrenek)
 * -----
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import CacheManager from '../src/Cache/CacheManager'

export default class CacheProvider {
  constructor(protected app: ApplicationContract) {}
  public static needsApplication = true

  public register() {
    this.app.container.bind('Adonis/Addons/Zeytech/Cache/HealthCheckHelper', () => {
      const { HealthCheckHelper } = require('../src/Helpers/HealthCheckHelper')
      return HealthCheckHelper
    })

    this.app.container.bind('Adonis/Addons/Zeytech/Cache/CacheItem', () => {
      const CacheItem = require('../src/Cache/CacheItem')
      return CacheItem
    })
  }

  public boot() {
    this.app.container.singleton('Adonis/Addons/Zeytech/Cache/CacheManager', () => {
      const redis = this.app.container.use('Adonis/Addons/Redis')
      return new CacheManager(redis)
    })
  }

  public async shutdown() {
    await this.app.container.resolveBinding('Adonis/Addons/Zeytech/Cache/CacheManager').shutdown()
  }
}

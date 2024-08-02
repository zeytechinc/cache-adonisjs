/*
 * File: health_check.ts
 * Created Date: Aug 02, 2024
 * Copyright (c) 2024 Zeytech Inc. (https://zeytech.com)
 * Author: Steve Krenek (https://github.com/skrenek)
 * -----
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { DateTime, Duration } from 'luxon'
import { Result, BaseCheck } from '@adonisjs/core/health'
import type { HealthCheckResult } from '@adonisjs/core/types/health'
import app from '@adonisjs/core/services/app'

export interface LastAccessInfo {
  utc: string
  age: number
  ageDesc: string
}

export class HealthCheckHelper {
  static formatDate(date: Date, dateFormat = 'yyyy-LL-dd HH:mm:ss ZZZZ'): string {
    const dt = DateTime.fromJSDate(date)
    return `${dt.toFormat(dateFormat)}`
  }

  static getAccessInfo(ms?: number, dateFormat = 'yyyy-LL-dd HH:mm:ss ZZZZ'): LastAccessInfo {
    if (!ms) {
      return {
        utc: 'never',
        age: -1,
        ageDesc: 'none',
      }
    }
    const date = DateTime.fromMillis(ms)
    const now = DateTime.utc()
    const age = Duration.fromMillis(now.toMillis() - date.toMillis())
    return {
      utc: date.toUTC().toFormat(dateFormat),
      age: age.as('milliseconds'),
      ageDesc: `${age.as('milliseconds')} ms (${age.as('minutes').toFixed(2)} min)`,
    }
  }
}

export class CacheHealthCheck extends BaseCheck {
  name: string = 'cacheHealthCheck'

  async run(): Promise<HealthCheckResult> {
    const cacheManager = await app.container.make('cacheManager')
    const cacheKeys = cacheManager.getKeys()
    let cache
    let meta = []
    for (const key of cacheKeys) {
      cache = cacheManager.getLRUCache(key)
      if (cache?.healthCheckEnabled) {
        meta.push({
          displayName: cache.displayName,
          message: await cache.getHealthCheckMessage(),
          meta: await cache.getHealthCheckMeta(),
        })
      }
    }
    return Result.ok(`${meta.length} caches reporting statistics`).mergeMetaData(meta)
  }
}

/*
 * File: HealthCheckHelper.ts
 * Created Date: Apr 06, 2021
 * Copyright (c) 2021 Zeytech Inc. (https://zeytech.com)
 * Author: Steve Krenek (https://github.com/skrenek)
 * -----
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { DateTime, Duration } from 'luxon'
import { HealthCheckHelperContract } from '@ioc:Adonis/Addons/Zeytech/Cache/HealthCheckHelper'
import { LastAccessInfoContract } from '@ioc:Adonis/Addons/Zeytech/Cache'

export class HealthCheckHelper implements HealthCheckHelperContract {
  public static formatDate(date: Date, dateFormat = 'yyyy-LL-dd HH:mm:ss ZZZZ'): string {
    const dt = DateTime.fromJSDate(date)
    return `${dt.toFormat(dateFormat)}`
  }

  public static getAccessInfo(
    ms?: number,
    dateFormat = 'yyyy-LL-dd HH:mm:ss ZZZZ'
  ): LastAccessInfoContract {
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

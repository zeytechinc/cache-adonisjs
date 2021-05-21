import { DateTime, Duration } from 'luxon'
import { HealthCheckHelperContract } from '@ioc:Skrenek/Adonis/Cache/HealthCheckHelper'
import { LastAccessInfoContract } from '@ioc:Skrenek/Adonis/Cache'

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
      age: age.as('millisecond'),
      ageDesc: `${age.as('millisecond')} ms (${age.as('minute').toFixed(2)} min)`,
    }
  }
}

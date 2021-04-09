import { DateTime, Duration } from 'luxon'
import { HealthCheckHelperContract, LastAccessInfo } from 'Skrenek/Adonis/Cache'

export default class HealthCheckHelper implements HealthCheckHelperContract {
  private dateFormat: string

  public formatDate(date: Date): string {
    const dt = DateTime.fromJSDate(date)
    return `${dt.toFormat(this.dateFormat)}`
  }

  public getAccessInfo(ms?: number): LastAccessInfo {
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
      utc: date.toUTC().toFormat(this.dateFormat),
      age: age.as('millisecond'),
      ageDesc: `${age.as('millisecond')} ms (${age.as('minute').toFixed(2)} min)`,
    }
  }

  public setDateFormat(value: string) {
    this.dateFormat = value
  }
}

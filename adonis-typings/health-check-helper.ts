declare module '@ioc:Skrenek/Adonis/Cache/HealthCheckHelper' {
  import { LastAccessInfoContract } from '@ioc:Skrenek/Adonis/Cache'

  export class HealthCheckHelperContract {
    public static getAccessInfo(ms?: number): LastAccessInfoContract
    public static formatDate(date: Date): string
  }

  const HealthCheckHelper: HealthCheckHelperContract
  export default HealthCheckHelper
}

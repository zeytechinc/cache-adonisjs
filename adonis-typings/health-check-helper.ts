declare module '@ioc:Adonis/Addons/Zeytech/Cache/HealthCheckHelper' {
  import { LastAccessInfoContract } from '@ioc:Adonis/Addons/Zeytech/Cache'

  export class HealthCheckHelperContract {
    public static getAccessInfo(ms?: number): LastAccessInfoContract
    public static formatDate(date: Date): string
  }

  const HealthCheckHelper: HealthCheckHelperContract
  export default HealthCheckHelper
}

/*
 * File: health-check-helper.ts
 * Created Date: May 20, 2021
 * Copyright (c) 2021 Zeytech Inc. (https://zeytech.com)
 * Author: Steve Krenek (https://github.com/skrenek)
 * -----
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Addons/Zeytech/Cache/HealthCheckHelper' {
  import { LastAccessInfoContract } from '@ioc:Adonis/Addons/Zeytech/Cache'

  export class HealthCheckHelperContract {
    public static getAccessInfo(ms?: number): LastAccessInfoContract
    public static formatDate(date: Date): string
  }

  const HealthCheckHelper: HealthCheckHelperContract
  export default HealthCheckHelper
}

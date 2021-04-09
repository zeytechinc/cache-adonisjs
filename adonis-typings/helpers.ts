declare module 'Skrenek/Adonis/Cache' {
  export interface HealthCheckHelperContract {
    getAccessInfo(ms?: number): LastAccessInfo
    formatDate(date: Date): string
    setDateFormat(value: string)
  }

  export interface TLRUCacheHealthCheck {
    key: string
    age: number
    ageDesc: string
    ttl: number
    ttlDesc: string
    expired: boolean
    lastAccess?: LastAccessInfo
  }

  export interface LastAccessInfo {
    utc: string
    age: number
    ageDesc: string
  }

  export const HealthCheckHelper: HealthCheckHelperContract
}

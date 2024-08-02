import app from '@adonisjs/core/services/app'
import { CacheManager } from '../cache_manager.js'

let cacheManager: CacheManager

await app.booted(async () => {
  cacheManager = await app.container.make('cacheManager')
})

export { cacheManager as default }

import { ApplicationService } from '@adonisjs/core/types'
import { CacheManager } from '../src/cache_manager.js'

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    cacheManager: CacheManager
  }
}

export default class CacheProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton('cacheManager', async () => {
      return new CacheManager()
    })
  }

  async boot() {}

  async shutdown() {
    const cacheManager = await this.app.container.make('cacheManager')
    await cacheManager.shutdown()
  }
}

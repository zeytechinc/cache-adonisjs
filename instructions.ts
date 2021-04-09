import { join } from 'path'
import * as sinkStatic from '@adonisjs/sink'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

/**
 * Returns absolute path to the stub relative from the templates
 * directory
 */
function getStub(...relativePaths: string[]) {
  return join(__dirname, 'templates', ...relativePaths)
}

/**
 * Makes the auth config file
 */
function makeConfig(projectRoot: string, app: ApplicationContract, sink: typeof sinkStatic) {
  const configDirectory = app.directoriesMap.get('config') || 'config'
  const configPath = join(configDirectory, 'cache.ts')

  const template = new sink.files.MustacheFile(projectRoot, configPath, getStub('config/cache.txt'))
  template.overwrite = true
  template.apply().commit()
  sink.logger.action('create').succeeded(configPath)
}

/**
 * Instructions to be executed when setting up the package.
 */
export default async function instructions(
  projectRoot: string,
  app: ApplicationContract,
  sink: typeof sinkStatic
) {
  /**
   * Make config file
   */
  makeConfig(projectRoot, app, sink)
}

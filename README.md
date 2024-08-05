# @zeytech/cache-adonisjs

[![npm](https://img.shields.io/npm/v/@zeytech/cache-adonisjs.svg)](https://www.npmjs.com/package/@zeytech/cache-adonisjs)

[![npm-image]][npm-url] [![license-image]][license-url] [![typescript-image]][typescript-url]

This package provides LRU and TLRU caches for use inside AdonisJS using either an in-memory or Redis storage engine.  It also provides an AdonisJS health check to measure statistics about the cache(s).

## Installation

`npm install @zeytech/cache-adonisjs`

`node ace configure @zeytech/cache-adonisjs`

## Usage

### Importing
`import cacheManager from '@zeytech/cache-adonisjs/services/main'`

### Creating a Cache
```typescript
import cacheManager from '@zeytech/cache-adonisjs/services/main'

// Create a simple in-memory LRU cache with a max size of 50 items.
cacheManager.createLRUCache<User>('my-cache', 50, 'memory', 'My Example Cache')

// Create a timed LRU cache backed by Redis storage.  Items time out after 15 minutes (900 sec.)
// It will use the "user_cache" connection name in the app's Redis config.
const userCache = cacheManager.createTLRUCache<User>('users', 50, 900, 'redis', 'User Cache', 'user_cache')

// Similar to above, but use the default redis connection (omit param)
const roleCache = cacheManager.createTLRUCache<Role>('roles', 50, 900)
```

#### CacheManager.createLRUCache
Creates an LRU cache.

Parameters
* key - the key used to retrieve the cache later
* maxItems - the max number of items the cache will store before it starts purging least recently used items.  If 0, no purging occurs.
* storage - 'memory' or 'redis'.  The caching engine to use.  The Redis storage engine uses Adonis's built-in Redis support.
* displayName - human friendly name used in health checks.  Optional.
* connectionName - Ignored if storage is not 'redis'.  The configured Redis connection name to utilize for the cache.

#### CacheManager.createTLRUCache
Creates a timed LRU (TLRU) cache.  Note that the timeout is a max possible time a cached item can live, not since its last access.

Parameters
* key - the key used to retrieve the cache later
* maxItems - the max number of items the cache will store before it starts purging least recently used items.  If 0, no purging occurs.
* maxItemAge - the max age of an item in the cache before it expires, in milliseconds.
* storage - 'memory' or 'redis'.  The caching engine to use.  The Redis storage engine uses Adonis's built-in Redis support.
* displayName - human friendly name used in health checks.  Optional.
* connectionName - Ignored if storage is not 'redis'.  The configured Redis connection name to utilize for the cache.

> Note that the memory cache engine does not automatically remove items from the cache when they expire.  Instead, they are purged when an expired key is requested.  The redis engine does indeed utilize `setex` to automatically purge data when it expires.

### Retrieve a previously created cache from the manager
`const cache = cacheManager.getLRUCache('my-cache')`

### Remove (destroy) a cache from the manager
`const success = cacheManager.removeCache('my-cache')`

### Working with Caches
Once you have a cache instance available to you, you can work with cached items in it as follows.  Most functions are asynchronous in nature due to some storage engines requiring it.

#### (Re)Initializing a cache
If you so choose, you can reinitialize a cache to expand or shrink its max size.  If you shrink its max size, items will be pruned in LRU order until the new max size is reached.

`await cache.initialize(100)`

#### Get / Set Items
```typescript
await cache.set('some-key', { some: 'object' })
const myObj = await cache.get('some-key')
```

#### Deleting Items
```typescript
// Delete a single key
const result = await cache.delete('some-key')

// Clear the entire cache
await cache.clear()
```

#### Read Only Properties
* maxSize - the max number of items the cache can hold
* purged - how many keys have been deleted from the cache since its initialization
* lastCleared - ISO 8601 timestamp of when the cache was last cleared or the string "never" if it has never been cleared

## Health Checks
This module is compatible with AdonisJS's built-in health checks.  To utilize health checks you'll have to register the health check class as explained in [Registering custom health checks](https://docs.adonisjs.com/guides/digging-deeper/health-checks#registering-custom-health-check).  An example is shown below.

In `start/health.ts`
```typescript
import { CacheHealthCheck } from '@zeytech/cache-adonisjs'

export const healthChecks = new HealthChecks().register([
  new CacheHealthCheck()
])
```

By default, all caches and their items are included in the metadata of the health check.  To omit a cache from the health checks, set its `healthCheckEnabled` property to false.  Likewise, if you want basic info about the cache in the health check but do not want details on the items, set the cache's `healthCheckItemsEnabled` property to false.

---
One last note.  While you can create caches at any time during the lifespan of the AdonisJS app, we recommend creating them up front in your application's provider, usually during the boot process.  See the example below.

```typescript
export default class AppProvider {
  // ...
  public async boot() {
    // ...
    const userCache = cacheManager.createTLRUCache<User>('users', 50, 900, 'redis', 'User Cache', 'user_cache')

    // Example of omitting cache items from any registered health checks
    userCache.healthCheckItemsEnabled = false

    const roleCache = cacheManager.createLRUCache<Role>('roles', 50)
    // Example of turning off health check entirely.
    roleCache.healthCheckEnabled = false

    // ...
  }
  // ...
}
```

Below is an example output of health check metadata info for a user cache.  It is not recommended to configure the cache to include items if the cache size is large, as the health check data could become quite large.

```json
{
  "displayName": "User Cache",
  "message": "Size 1 of 50",
  "meta": {
    "size": 1,
    "maxSize": 50,
    "maxAge": 30000,
    "maxAgeDesc": "30000 ms (0.50 min)",
    "purgeCount": 0,
    "lastCleared": "never",
    "items": [
      {
        "key": "user_cache_some_user_id",
        "age": 15980,
        "ageDesc": "15980 ms (0.27 min)",
        "ttl": 14020,
        "ttlDesc": "14020 ms (0.23 min)",
        "expired": false,
        "lastAccess": {
          "utc": "2021-09-08 18:48:51 UTC",
          "age": 15989,
          "ageDesc": "15989 ms (0.27 min)"
        }
      }
    ]
  }
}
```

[npm-image]: https://img.shields.io/npm/v/@zeytech/cache-adonisjs.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/@zeytech/cache-adonisjs "npm"

[license-image]: https://img.shields.io/npm/l/@zeytech/cache-adonisjs?color=326D88&style=for-the-badge
[license-url]: License.md "license"

[typescript-image]: https://img.shields.io/badge/Typescript-326D88.svg?style=for-the-badge&logo=typescript
[typescript-url]:  "typescript"

# cache-adonisjs

[![npm](https://img.shields.io/npm/v/@zeytech/cache-adonisjs.svg)](https://www.npmjs.com/package/@zeytech/cache-adonisjs)


[![npm-image]][npm-url] [![license-image]][license-url] [![typescript-image]][typescript-url]

This package provides LRU and TLRU caches for use inside AdonisJS using either an in-memory or Redis storage engine.  It also provides built-in AdonisJS health checks.

## Installation

`npm install @zeytech/cache-adonisjs`

`node ace configure @zeytech/cache-adonisjs`

## Usage

### Importing
`import CacheManager from 'Adonis/Addons/Zeytech/Cache/CacheManager'`

### Creating a Cache
```
// Create a simple in-memory LRU cache with a max size of 50 items.
CacheManager.createLRUCache<User>('my-cache', 50, 'memory', 'My Example Cache')

// Create a timed LRU cache backed by Redis storage.  Items time out after 15 minutes (900 sec.)
// It will use the "user_cache" connection name in the app's Redis config.
const userCache = CacheManager.createTLRUCache<User>('users', 50, 900, 'redis', 'User Cache', 'user_cache')
```

### Retrieve a previously created cache from the manager
`const cache = CacheManager.getLRUCache('my-cache')`

### Remove (destroy) a cache from the manager
`const success = CacheManager.removeCache('my-cache')`

### Working with Caches
Once you have a cache instance available to you, you can work with cached items in it as follows.  Most functions are asynchronous in nature due to some storage engines requiring it.

#### (Re)Initializing a cache
If you so choose, you can reinitialize a cache to expand or shrink its max size.  If you shrink its max size, items will be pruned in LRU order until the new max size is reached.

`cache.initialize(100)`

#### Get / Set Items
```
await cache.set('some-key', { some: 'object' })
const myObj = await cache.get('some-key')
```

#### Deleting Items
```
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
This module is compatible with AdonisJS's built-in health checks.  Below is an example output of health check info for a user cache.

```
"userCache": {
  "displayName": "User Cache",
  "health": {
    "healthy": true,
    "message": "Size 1 of 50"
  },
  "meta": {
    "size": 1,
    "maxSize": 50,
    "maxAge": 30000,
    "maxAgeDesc": "30000 ms (0.50 min)",
    "purge_count": 0,
    "last_cleared": "never",
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
    ]
  }
}
```

[npm-image]: https://img.shields.io/npm/v/cache-adonisjs.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/cache-adonisjs "npm"

[license-image]: https://img.shields.io/npm/l/cache-adonisjs?color=326D88&style=for-the-badge
[license-url]: License.md "license"

[typescript-image]: https://img.shields.io/badge/Typescript-326D88.svg?style=for-the-badge&logo=typescript
[typescript-url]:  "typescript"

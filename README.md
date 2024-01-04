# Cache helper

A simple cache client for in memory or external cache allowing to use 1 simple interface regardless of final infrastructure.

Underline it uses:

- [node-cache](https://github.com/node-cache/node-cache) for in memory cache
- [ioredis](https://github.com/redis/ioredis) for connecting to Redis instance

The objective is to provide a simplified interface for basic cache usage and allow to switch between in memory and external cache without changing the code (for development/staging purpose or when the production system requires it).
In case the need si for advanced feature of Redis or other external, better to stick to the underline client (there are nice mock solution for unit testing).

## Installation

```cli
npm install @danielyaghil/cache-helper
```

## Usage

### Settings

if no settings are provided it will use in memory cache with [default settings](https://github.com/node-cache/node-cache#options) of node-cache.

To override memory cache settings you can provide the following settings:

```javascript
{
  useExternalCache: false,
  nodeCache: {
    stdTTL: 0,
    checkperiod: 600,
    etc...
  }
}
```

If you want to use external cache (Redis) you need to set the following settings :

```javascript
{
  useExternalCache: true,
  redis: {
    host: "<your host>",
    port: <your port>
  }
}
```

The settings are passes using static method "init":

```javascript
const CacheClient = require('@danielyaghil/cache-helper');
CacheClient.init({
  useExternalCache: true,
  redis: {
    host: 'localhost',
    port: 6379,
  },
});
```

### Simple Usage

#### Quick start

To simplify usage, the client provides a static method instance that uses singleton pattern to return the same instance of the client on each call - making easier to use the client in different parts of the code.

Also it is built so that object are provided a is regardless or their type and return in their original form

Sample for memory cache:

```javascript
const CacheClient = require('@danielyaghil/cache-helper');
const value = 'my value';
CacheClient.instance().set('key', 'value');
const retrievedValue = CacheClient.instance().get('key');
```

Sample for external cache:

```javascript
const CacheClient = require('@danielyaghil/cache-helper');
CacheClient.init({
  useExternalCache: true,
  redis: {
    host: 'localhost',
    port: 6379,
  },
});
const value = 'my value';
CacheClient.instance().set('key', 'value');
const retrievedValue = CacheClient.instance().get('key');
```

### Samples

You can refer to the unit test as samples:

- memory cache are [here](https://github.com/danielyaghil/cache-helper/blob/main/tests/memory-cache.test.js)
- external cache (Redis) are [here](https://github.com/danielyaghil/cache-helper/blob/main/tests/redis-cache.test.js)

NOTE: for running external cache test you can run locally [Redis using docker](https://redis.io/docs/install/install-stack/docker/)

### Reference

#### init (static)

This method is optional and should be used only if you want to override the default settings.
It is required for external use cache
I should be called only once when the application starts and on 1st call to instance the client will be initialized with the provided settings (or the default if none are provided).

Setting parameters are:

- useExternalCache - boolean - default false
- nodeCache - object - default settings of node-cache (see [here](<(https://github.com/node-cache/node-cache#options)>)
- redis - object - defined as:
  - host - string
  - port - number

```javascript
CacheClient.init({
  useExternalCache: true,
  redis: {
    host: 'localhost',
    port: 6379,
  },
});
```

#### instance (static)

This method is used to get the instance of the cache client from anywhere enuring access to the same instance.

```javascript
CacheClient.instance();
```

#### constructor

It should be avoided to use it, however it is available in cae you want to have multiple instances of the cach client.
It receives as parameter the settings object (same as init method).

```javascript
const cacheClient = new CacheClient({
  useExternalCache: true,
  redis: {
    host: 'localhost',
    port: 6379,
  },
});
```

#### set

It allows to set a value in the cache key-value pair.
Key is a string and value can be any type of object.

```javascript
// set string in cache
CacheClient.instance().set('key', 'value');
// set number in cache
CacheClient.instance().set('key', 123);
// set boolean in cache
CacheClient.instance().set('key', true);
// set object in cache
CacheClient.instance().set('key', { a: 1, b: 2 });
```

In addition it i possible to set a time to live for the key-value pair.
The time to live is in milliseconds and is optional. If not provided the value will be stored in the cache until it is deleted or the cache is flushed.

```javascript
CacheClient.instance().set('key', 'value', 1000);
```

#### get

It allows to get a value from the cache. The value can be any type of object and will be returned as is when retrieved.

```javascript
const retrieved = CacheClient.instance().get('key');
```

#### keys

It allows to get an array with all the keys in the cache.

```javascript
const keys = CacheClient.instance().keys();
```

#### setTtl

It allows to override the time to live for a specific key in the cache.

```javascript
CacheClient.instance().setTtl('key', 1000);
```

#### getTtl

It allows to get the time to live for a specific key in the cache.

```javascript
const ttl = CacheClient.instance().getTtl('key');
```

#### delete

It allows to delete a key-value pair from the cache.

```javascript
CacheClient.instance().delete('key');
```

#### flush

It allows to delete all the key-value pairs from the cache.

```javascript
CacheClient.instance().flush();
```

#### close

It allows to close & clean memory and handles used by the cache client.
I should be called only when the cache client is no longer needed.

```javascript
CacheClient.instance().close();
```

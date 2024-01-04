const IoRedis = require('ioredis');
const NodeCache = require('node-cache');

class CacheClient {
    #ioRedis = null;
    #nodeCache = null;

    static init(options) {
        if (options) {
            CacheClient.options = options;
        } else {
            CacheClient.options = { useExternalCache: false };
        }
    }

    static instance() {
        if (!CacheClient.options) {
            CacheClient.init();
        }

        if (!CacheClient.singleton) {
            CacheClient.singleton = Object.freeze(new CacheClient());
        }

        return CacheClient.singleton;
    }

    constructor() {
        if (
            CacheClient.options &&
            CacheClient.options.useExternalCache &&
            CacheClient.options.redis &&
            CacheClient.options.redis.host &&
            CacheClient.options.redis.port
        ) {
            console.log(
                `Initializing Cache Client for external cache with settings: ${JSON.stringify(CacheClient.options)}`
            );
            this.#ioRedis = new IoRedis(CacheClient.options.redis.host, CacheClient.options.redis.port);
        } else {
            if (CacheClient.options && CacheClient.options.nodeCache) {
                console.log(
                    `Initializing Cache Client for external cache with settings: ${JSON.stringify(CacheClient.options)}`
                );
                this.#nodeCache = new NodeCache(CacheClient.options.nodeCache);
            } else {
                console.log(`Initializing Cache Client for external cache with default settings`);
                this.#nodeCache = new NodeCache();
            }
        }
    }

    #encode(value) {
        let cachedObject = {};
        if (typeof value === 'string') {
            cachedObject.type = 'string';
            cachedObject.value = value;
        } else if (typeof value === 'number') {
            cachedObject.type = 'number';
            cachedObject.value = value;
        } else if (typeof value === 'boolean') {
            cachedObject.type = 'boolean';
            cachedObject.value = value;
        } else if (value.prop && value.prop.constructor === Array) {
            cachedObject.type = 'array';
            cachedObject.value = value;
        } else if (typeof value === 'object') {
            cachedObject.type = 'object';
            cachedObject.value = value;
        } else {
            console.log(`Value ${value} is not a supported type`);
            return '';
        }
        return JSON.stringify(cachedObject);
    }

    #decode(cachedValue) {
        if (!cachedValue) {
            return undefined;
        }

        const cacheObject = JSON.parse(cachedValue);
        return cacheObject.value;
    }

    async get(key) {
        try {
            let cachedValue = null;
            if (!CacheClient.options.useExternalCache) {
                cachedValue = this.#nodeCache.get(key);
            } else {
                cachedValue = await this.#ioRedis.get(key);
            }
            return CacheClient.options.useExternalCache ? this.#decode(cachedValue) : cachedValue;
        } catch (err) {
            console.error(err);
        }
    }

    async set(key, value, ttlInMilliseconds = 0) {
        try {
            let cachedValue = CacheClient.options.useExternalCache ? this.#encode(value) : value;

            if (!CacheClient.options.useExternalCache) {
                let ttlSeconds = ttlInMilliseconds / 1000;
                if (ttlSeconds <= 0) {
                    return this.#nodeCache.set(key, cachedValue);
                } else {
                    return this.#nodeCache.set(key, cachedValue, ttlSeconds);
                }
            } else {
                let result = '';
                if (ttlInMilliseconds <= 0) {
                    result = await this.#ioRedis.set(key, cachedValue);
                } else {
                    result = await this.#ioRedis.set(key, cachedValue, 'px', ttlInMilliseconds);
                }
                if (result === 'OK') {
                    return true;
                } else {
                    return false;
                }
            }
        } catch (err) {
            console.error(err);
        }
    }

    async setTtl(key, ttlInMilliseconds) {
        try {
            if (!CacheClient.options.useExternalCache) {
                let ttlSeconds = ttlInMilliseconds / 1000;
                if (ttlSeconds <= 0) {
                    this.#nodeCache.ttl(key, 0);
                } else {
                    this.#nodeCache.ttl(key, ttlSeconds);
                }
            } else {
                await this.#ioRedis.pexpire(key, ttlInMilliseconds);
                return true;
            }
        } catch (err) {
            console.error(err);
        }
        return false;
    }

    async getTtl(key) {
        try {
            if (!CacheClient.options.useExternalCache) {
                let ttl = this.#nodeCache.getTtl(key);
                return ttl;
            } else {
                let ttl = await this.#ioRedis.pttl(key);
                return ttl;
            }
        } catch (err) {
            console.error(err);
        }
        return -1;
    }

    async delete(key) {
        let result = '';
        try {
            if (!CacheClient.options.useExternalCache) {
                result = this.#nodeCache.del(key);
                if (result) {
                    return true;
                }
            } else {
                result = await this.#ioRedis.del(key);
                if (result === 'OK') {
                    return true;
                }
            }
        } catch (err) {
            console.error(err);
        }
        return false;
    }

    async flush() {
        try {
            if (!CacheClient.options.useExternalCache) {
                this.#nodeCache.flushAll();
            } else {
                await this.#ioRedis.flushall();
            }
        } catch (err) {
            console.error(err);
        }
    }

    async keys(pattern = '*') {
        let keys = null;
        try {
            if (!CacheClient.options.useExternalCache) {
                if (pattern !== '*') {
                    console.log(`listKeys: pattern ${pattern} is not supported for NodeCache ;  returning all keys`);
                }
                keys = this.#nodeCache.keys();
            } else {
                keys = await this.#ioRedis.keys(pattern);
            }
        } catch (err) {
            console.error(err);
        }
        return keys;
    }

    async close() {
        if (CacheClient.options.useExternalCache) {
            await this.#ioRedis.quit();
        }
    }
}

module.exports = CacheClient;

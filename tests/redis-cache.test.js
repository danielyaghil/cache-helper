const CacheClient = require('../src/index');

beforeAll(() => {
  CacheClient.init({
    useExternalCache: true,
    redis: {
      host: 'localhost',
      port: 6379,
    },
  });
});

afterAll(() => {
  CacheClient.instance().close();
});

beforeEach(async () => {
  console.log('flushing cache');
  await CacheClient.instance().flush();
});

describe('Node Cache Option', () => {
  test('cache empty - list keys empty', async () => {
    // Test code to check if the cache is empty
    const keys = await CacheClient.instance().keys();

    expect(keys).toEqual([]);
  });

  test('cache empty - list keys filled', async () => {
    // Test code to check if the cache is empty
    const key = 'myKey';
    const key2 = 'myKey2';
    const value = 'myValue';

    CacheClient.instance().set(key, value);
    CacheClient.instance().set(key2, value);

    const keys = await CacheClient.instance().keys();

    expect(keys.length).toEqual(2);
    expect(keys.includes(key)).toBe(true);
    expect(keys.includes(key2)).toBe(true);
  });

  test('should store and retrieve string from the cache', async () => {
    // Test code to store and retrieve data from the cache
    const key = 'myKey';
    const value = 'myValue';

    await CacheClient.instance().set(key, value);
    const retrievedValue = await CacheClient.instance().get(key);

    expect(retrievedValue).toEqual(value);
    expect(typeof retrievedValue).toEqual('string');
  });

  test('should store and retrieve number from the cache', async () => {
    // Test code to store and retrieve data from the cache
    const key = 'myKey';
    const value = 5;

    await CacheClient.instance().set(key, value);
    const retrievedValue = await CacheClient.instance().get(key);

    expect(retrievedValue).toEqual(value);
    expect(typeof retrievedValue).toEqual('number');
  });

  test('should store and retrieve boolean from the cache', async () => {
    // Test code to store and retrieve data from the cache
    const key = 'myKey';
    const value = true;

    await CacheClient.instance().set(key, value);
    const retrievedValue = await CacheClient.instance().get(key);

    expect(retrievedValue).toEqual(value);
    expect(typeof retrievedValue).toEqual('boolean');
  });

  test('should store and retrieve object from the cache', async () => {
    // Test code to store and retrieve data from the cache
    const key = 'myKey';
    const value = {
      prop1: 'value1',
      prop2: 2,
    };

    await CacheClient.instance().set(key, value);
    const retrievedValue = await CacheClient.instance().get(key);

    expect(retrievedValue.prop1).toEqual(value.prop1);
    expect(retrievedValue.prop2).toEqual(value.prop2);
    expect(typeof retrievedValue).toEqual('object');
    expect(typeof retrievedValue.prop1).toEqual('string');
    expect(typeof retrievedValue.prop2).toEqual('number');
  });

  test('should store with ttl and retrieve object from the cache up to ttl', async () => {
    const key = 'myKey';
    const value = {
      prop1: 'value1',
      prop2: 2,
    };
    const ttl = 3000; // Time to live in milliseconds

    await CacheClient.instance().set(key, value, ttl);
    const retrievedValue = await CacheClient.instance().get(key);

    expect(retrievedValue.prop1).toEqual(value.prop1);
    expect(retrievedValue.prop2).toEqual(value.prop2);
    expect(typeof retrievedValue).toEqual('object');
    expect(typeof retrievedValue.prop1).toEqual('string');
    expect(typeof retrievedValue.prop2).toEqual('number');

    // Wait for the TTL to expire
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve('');
      }, ttl)
    );

    const expiredValue = await CacheClient.instance().get(key);
    expect(expiredValue).toBeUndefined();
  });
});

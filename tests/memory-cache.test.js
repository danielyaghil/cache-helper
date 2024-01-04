const CacheClient = require('../src/index');

beforeAll(() => {
  CacheClient.init({
    useExternalCache: false,
    redis: {
      stdTTL: 10,
      checkperiod: 120,
    },
  });
});

afterAll(() => {});

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
    expect(keys[0]).toContain(key);
    expect(keys[1]).toContain(key2);
  });

  test('should store and retrieve string from the cache', async () => {
    // Test code to store and retrieve data from the cache
    const key = 'myKey';
    const value = 'myValue';

    CacheClient.instance().set(key, value);
    const retrievedValue = await CacheClient.instance().get(key);
    const keys = await CacheClient.instance().keys();

    expect(retrievedValue).toEqual(value);
    expect(typeof retrievedValue).toEqual('string');
    expect(keys.length).toEqual(1);
  });

  test('should store and retrieve number from the cache', async () => {
    // Test code to store and retrieve data from the cache
    const key = 'myKey';
    const value = 5;

    CacheClient.instance().set(key, value);
    const retrievedValue = await CacheClient.instance().get(key);

    expect(retrievedValue).toEqual(value);
    expect(typeof retrievedValue).toEqual('number');
  });

  test('should store and retrieve boolean from the cache', async () => {
    // Test code to store and retrieve data from the cache
    const key = 'myKey';
    const value = true;

    CacheClient.instance().set(key, value);
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

    CacheClient.instance().set(key, value);
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

    CacheClient.instance().set(key, value, ttl);
    const retrievedValue = await CacheClient.instance().get(key);

    expect(retrievedValue.prop1).toEqual(value.prop1);
    expect(retrievedValue.prop2).toEqual(value.prop2);
    expect(typeof retrievedValue).toEqual('object');
    expect(typeof retrievedValue.prop1).toEqual('string');
    expect(typeof retrievedValue.prop2).toEqual('number');

    // Wait for the TTL to expire
    await new Promise((resolve) => setTimeout(resolve, ttl));

    const expiredValue = await CacheClient.instance().get(key);
    expect(expiredValue).toBeUndefined();
  });
});

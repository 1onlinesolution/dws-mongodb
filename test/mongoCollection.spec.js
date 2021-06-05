const assert = require('assert');
const MongoCollection = require('../lib/mongoCollection');
const MongoDatabase = require('../lib/mongoDatabase');

describe('MongoCollection', () => {
  it('Ctor', () => {
    const connectionString = 'my connection string';
    const dbName = 'my database';
    const collName = 'my collection';
    const database = new MongoDatabase(connectionString, dbName);
    const collection = new MongoCollection(database, collName);
    assert(collection !== null);
    assert(typeof collection === 'object');
    assert(collection instanceof MongoCollection);
    assert(collection.database !== null);
    assert(collection.database instanceof MongoDatabase);
    assert(collection.name === collName);
  });
});

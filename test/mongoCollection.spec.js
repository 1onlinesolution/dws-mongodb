const assert = require('assert');
const MongoConnection = require('../lib/mongoConnection');
const MongoCollection = require('../lib/mongoCollection');
const MongoDatabase = require('../lib/mongoDatabase');

describe('MongoCollection', () => {
  it('Ctor', () => {
    const connectionString = 'my connection string';
    const dbName = 'my database';
    const collName = 'my collection';
    const conn = new MongoConnection(connectionString);
    const database = new MongoDatabase(conn, dbName);
    const collection = new MongoCollection(database, collName);
    assert(collection !== null);
    assert(typeof collection === 'object');
    assert(collection instanceof MongoCollection);
    assert(collection.database !== null);
    assert(collection.database instanceof MongoDatabase);
    assert(collection.name === collName);
  });
});

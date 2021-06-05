const assert = require('assert');
const MongoConnection = require('../lib/mongoConnection');
const MongoDatabase = require('../lib/mongoDatabase');

describe('MongoDatabase', () => {
  it('Ctor', () => {
    const connectionString = 'my connection string';
    const dbName = 'my database';
    const conn = new MongoConnection(connectionString);
    const database = new MongoDatabase(conn, dbName);
    assert(database !== null);
    assert(typeof database === 'object');
    assert(database instanceof MongoDatabase);
    assert(database.mongoConnection !== null);
    assert(database.name === dbName);
  });
});

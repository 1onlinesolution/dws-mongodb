const assert = require('assert');
const MongoDatabase = require('../lib/mongoDatabase');

describe('MongoDatabase', () => {
  it('Ctor', () => {
    const connectionString = 'my connection string';
    const dbName = 'my database';
    const database = new MongoDatabase(connectionString, dbName);
    assert(database !== null);
    assert(typeof database === 'object');
    assert(database instanceof MongoDatabase);
    assert(database.mongoConnection !== null);
    assert(database.mongoConnection.connectionString === connectionString);
    assert(database.name === dbName);
  });
});

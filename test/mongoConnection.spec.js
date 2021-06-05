const assert = require('assert');
const MongoConnection = require('../lib/mongoConnection');

describe('MongoConnection', () => {
  it('Ctor', () => {
    const connectionString = 'my connection string';
    const conn = new MongoConnection(connectionString);
    assert(conn !== null);
    assert(typeof conn === 'object');
    assert(conn instanceof MongoConnection);
    assert(conn.connectionString === connectionString);
    assert(typeof conn.options === 'object');
    assert(conn.options.useUnifiedTopology === true);
  });
});

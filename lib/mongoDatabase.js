const Validity = require('@1onlinesolution/dws-utils/lib/validity');
const MongoConnection = require('./mongoConnection');

class MongoDatabase {
  constructor(mongoConnection, name) {
    if (!mongoConnection || !(mongoConnection instanceof MongoConnection)) throw new Error('invalid connection object');
    if (!Validity.isValidString(mongoConnection.connectionString)) throw new Error('invalid connection string');

    if (!Validity.isValidString(name)) throw new Error('invalid database name');

    this._mongoConnection = mongoConnection;
    this._name = name;

    return this;
  }

  static get [Symbol.species]() {
    return this;
  }

  // Accessor Properties
  get mongoConnection() {
    return this._mongoConnection;
  }

  get name() {
    return this._name;
  }

  get isConnected() {
    return this._mongoConnection.isConnected();
  }

  get database() {
    return this._mongoConnection.database(this.name);
  }

  async createCollection(collectionName) {
    await this.ensureCollectionExists(collectionName);
  }

  async collectionExists(collectionName) {
    const collections = await this.database.listCollections({}, { nameOnly: true }).toArray();
    const collection = collections.find((o) => o.name === collectionName);
    return !!collection;
  }

  async ensureCollectionExists(collectionName) {
    if (!(await this.collectionExists(collectionName))) {
      await this.database.createCollection(collectionName);
    }
  }

  static async createDatabase({
    name,
    connectionString,
    connectionOptions = {
      useUnifiedTopology: true,
    },
  } = {}) {
    try {
      const connection = new MongoConnection(connectionString, connectionOptions);
      await connection.connect();
      return new MongoDatabase(connection, name);
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

module.exports = MongoDatabase;

const { MongoClient } = require('mongodb');
const Validity = require('@1onlinesolution/dws-utils/lib/validity');

class MongoConnection {
  constructor(
    connectionString,
    options = {
      useUnifiedTopology: true,
    },
  ) {
    if (!Validity.isValidString(connectionString)) {
      throw new Error('invalid database connection');
    }

    this._connectionString = connectionString;
    this._options = options;
    this._mongoClient = new MongoClient(this._connectionString, this._options);
    if (!this._mongoClient) {
      throw new Error('cannot create mongo connection');
    }

    return this;
  }

  static get [Symbol.species]() {
    return this;
  }

  get options() {
    return this._options;
  }

  get connectionString() {
    return this._connectionString;
  }

  get isConnected() {
    return this._mongoClient.isConnected();
  }

  // * * * * *
  // N O T E : https://www.compose.com/articles/connection-pooling-with-mongodb/
  //           Do not use connect/close pair per each db action.
  //           Instead use one connection throughout the application.
  // * * * * *
  async connect() {
    if (this.isConnected) {
      return Promise.reject(new Error('Mongo client is already connected'));
    }

    try {
      await this._mongoClient.connect();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async close() {
    if (!this.isConnected) {
      return Promise.reject(new Error('Mongo client is not connected'));
    }

    try {
      await this._mongoClient.close();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  database(
    name,
    options = {
      noListener: false, // Do not make the db an event listener to the original connection.
      returnNonCachedInstance: false, // Control if you want to return a cached instance or have a new one created
    },
  ) {
    if (!name || name.length <= 0) {
      throw new Error('invalid database name');
    }

    return this._mongoClient.db(name, options);
  }
}

module.exports = MongoConnection;

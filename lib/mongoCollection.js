const ObjectId = require('mongodb').ObjectID;
const Validity = require('@1onlinesolution/dws-utils/lib/validity');
const MongoDatabase = require('./mongoDatabase');
const DefaultWriteConcern = require('./defaultWriteConcern');

const DocumentsPerPage = 25;
const DefaultWriteOptions = { writeConcern: DefaultWriteConcern };

class MongoCollection {
  constructor(database, name) {
    if (!database || !(database instanceof MongoDatabase) || !Validity.isValidString(database.name)) {
      throw new Error('invalid database');
    }

    if (!Validity.isValidString(name)) {
      throw new Error('invalid collection name');
    }

    this._name = name;
    this._database = database;

    return this;
  }

  static get [Symbol.species]() {
    return this;
  }

  get name() {
    return this._name;
  }

  get database() {
    return this._database;
  }

  get collection() {
    return this.database.database.collection(this._name);
  }

  async createIndexes(indexMap) {
    if (!indexMap) return Promise.reject('Invalid collection index map');
    if (indexMap.size === 0) return;

    try {
      await this.ensureCollectionExists(this._name);
      let promises = [];
      indexMap.forEach((value, key /*, map*/) => {
        this.indexExists(key).then((exist) => {
          if (!exist) {
            promises.push(this.createIndex(value.fieldOrSpec, value.options));
          }
        });
      });

      // Wait for all Promises to complete
      Promise.all(promises)
        .then((results) => {
          // Handle results
          return Promise.resolve(results);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  indexExists(indexName) {
    return new Promise((resolve, reject) => {
      this.collection.indexExists(indexName, {}, (err, result) => {
        if (err) {
          // For any error detected
          reject(err);
        } else {
          // When task is finished
          resolve(result);
        }
      });
    });
  }

  createIndex(fieldOrSpec, options) {
    return new Promise((resolve, reject) => {
      this.collection.createIndex(fieldOrSpec, options, (err, result) => {
        if (err) {
          // For any error detected
          reject(err);
        } else {
          // When task is finished
          resolve(result);
        }
      });
    });
  }

  async ensureCollectionExists(name) {
    if (!(await this.database.collectionExists(name))) {
      await this.database.createCollection(name);
    }
  }

  // ===================================================================
  // insertOne operations
  async insertOne(document, options = {}) {
    // https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#insertOne
    // https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#~insertOneWriteOpResult
    await this.checkDocument(document);
    const operationResult = await this.collection.insertOne(document, options);
    const { result, insertedId, insertedCount } = operationResult;
    const success = result.ok === 1 && insertedCount === 1;
    return success ? insertedId : null;
  }

  async insertOneWithWriteConcern(document, options = DefaultWriteOptions) {
    return await this.insertOne(document, options);
  }

  // ===================================================================
  // insertMany operations
  async insertMany(documents, options = {}) {
    // https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#insertOne
    // https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#~insertOneWriteOpResult
    await this.checkDocuments(documents);
    const operationResult = await this.collection.insertMany(documents, options);
    const { result, insertedIds, insertedCount } = operationResult;
    const success = result.ok === 1 && insertedCount >= 1;
    return success ? insertedIds : null;
  }

  async insertManyWithWriteConcern(documents, options = DefaultWriteOptions) {
    return await this.insertMany(documents, options);
  }

  // ===================================================================
  // deleteOne operations
  async deleteOne(filter, options = undefined) {
    // https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#deleteOne
    // https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#~deleteWriteOpCallback
    await this.checkFilter(filter);
    const operationResult = await this.collection.deleteOne(filter, options);
    const { result, error } = operationResult;
    if (error) return Promise.reject(error);
    return Promise.resolve(result.ok === 1 && result.n === 1);
  }

  async deleteOneWithWriteConcern(filter, options = DefaultWriteOptions) {
    await this.checkFilter(filter);
    return await this.deleteOne(filter, options);
  }

  // ===================================================================
  // findOne operations
  async findOne(filter = {}, options = {}) {
    await this.checkFilter(filter);
    return await this.collection.findOne(filter, options);
  }

  async findDocumentById(id) {
    // id could be string !!!
    if (!id) return Promise.reject(new Error('invalid document id'));
    return await this.findOne({ _id: ObjectId(id) });
  }

  // ===================================================================
  // updateOne operations
  async updateOne(filter, update, options = { upsert: false }) {
    // https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#updateOne
    // https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#~updateWriteOpCallback
    await this.checkFilter(filter);
    const operationResult = await this.collection.updateOne(filter, update, options);
    const { result, matchedCount, modifiedCount } = operationResult;
    return result.ok === 1 && result.n === 1 && result.nModified === 1 && matchedCount === 1 && modifiedCount === 1;
  }

  async updateOneWithWriteConcern(
    filter,
    update,
    options = {
      upsert: false,
      writeConcern: DefaultWriteConcern,
    },
  ) {
    return await this.updateOne(filter, update, options);
  }

  // ===================================================================
  // count operations
  async count(filter = {}, options = {}) {
    // http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#countDocuments
    // http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#~countCallback
    await this.checkFilter(filter);
    try {
      // Returns the count of documents or error
      return await this.collection.countDocuments(filter, options);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // ===================================================================
  // find operations
  async find(filter = {}, options = {}) {
    // https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#find
    await this.checkFilter(filter);
    return await this.collection.find(filter, options).toArray();
  }

  async findAndSort(filter = {}, options = {}, sortOption = { }) {
    // https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#find
    await this.checkFilter(filter);
    return await this.collection.find(filter, options).sort(sortOption).toArray();
  }

  async findPage(filter = {}, documentsPerPage = DocumentsPerPage, page = 1) {
    await this.checkFilter(filter);
    const numItemsToSkip = (page - 1) * documentsPerPage;
    const newOptions = {
      limit: documentsPerPage,
      skip: numItemsToSkip,
    };
    return await this.find(filter, newOptions);
  }

  // ===================================================================
  // aggregate operations
  async aggregate(pipeline, options) {
    return await this.collection.aggregate(pipeline, options);
  }

  // ===================================================================

  checkDocument(document) {
    return document ? Promise.resolve(true) : MongoCollection.badRequestErrorAsPromise('document');
  }

  checkDocuments(documents) {
    if (!documents) return MongoCollection.badRequestErrorAsPromise('documents');
    let index = 0;
    documents.forEach((item) => {
      if (!item) return MongoCollection.badRequestErrorAsPromise(`invalid document with index ${index}`);
      ++index;
    });
    return Promise.resolve(true);
  }

  checkFilter(filter) {
    return filter ? Promise.resolve(true) : MongoCollection.badRequestErrorAsPromise('filter');
  }

  static badRequestErrorAsPromise(label) {
    const message = `Bad request: ${label}`;
    return Promise.reject(new Error(message));
  }
}

module.exports = MongoCollection;

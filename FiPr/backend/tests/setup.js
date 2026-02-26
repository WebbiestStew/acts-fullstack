const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = 'test_jwt_secret_key_2024';
  process.env.JWT_EXPIRES_IN = '1d';
  process.env.NODE_ENV = 'test';
  global.__MONGOD__ = mongod;
};

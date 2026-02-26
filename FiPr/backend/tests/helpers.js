const mongoose = require('mongoose');

/**
 * Conecta a la base de datos de prueba
 */
const connectTestDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
};

/**
 * Limpia todas las colecciones
 */
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Desconecta de la base de datos
 */
const disconnectTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

module.exports = { connectTestDB, clearDatabase, disconnectTestDB };

const mongoose = require("mongoose");

const clearChanges = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

const closeConnection = () => {
  return mongoose.connection.close();
};

module.exports = { clearChanges, closeConnection };

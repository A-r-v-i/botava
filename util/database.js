const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
  mongoClient
    .connect(
      "mongodb+srv://aravind:arvi2098@cluster-node-complete-sfr53.mongodb.net/shop?retryWrites=true&w=majority"
    )
    .then(client => {
      _db = client.db();
      console.log("mongo connection established");
      //console.log(client);
      callback();
    })
    .catch(err => {
      console.log(err);
    });
};

const getDb = () => {
  if(_db) {
    return _db;
  }
  else {
    throw 'No database found';
  }
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;

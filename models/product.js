{
  //   const db = require('../util/database');
  // const Cart = require('./cart');
  // const getProductsFromFile = cb => {
  //   fs.readFile(p, (err, fileContent) => {
  //     if (err) {
  //       cb([]);
  //     } else {
  //       cb(JSON.parse(fileContent));
  //     }
  //   });
  // };
  // module.exports = class Product {
  //   constructor(id, title, imageUrl, description, price) {
  //     this.id = id;
  //     this.title = title;
  //     this.imageUrl = imageUrl;
  //     this.description = description;
  //     this.price = price;
  //   }
  //   save() {
  //   }
  //   static deleteById(id) {
  //   }
  //   static fetchAll() {
  //     return db.execute('SELECT * FROM products');
  //   }
  //   static findById(id) {
  //   }
  // };
}

const mongodb = require('mongodb');
const getDb = require("../util/database").getDb;

//const mongoConnect = require("../util/database").mongoConnect;
class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new mongodb.ObjectID(id) : null;
    this.userId = userId;
  }

  save() {
    const db = getDb();
    let dbOperation;

    if(this._id) {
      dbOperation = db.collection('products').updateOne({'_id': this._id}, {  $set: this  });
    }
    else {
      dbOperation = db.collection('products').insertOne( this );
    }

    return dbOperation
        .then(result => {
        console.log(result);
      })
      .catch(err => {
        console.log(err);
      });
  }
  static fetchAllProducts() {
    const db = getDb();
    return db
      .collection("products")
      .find({})
      .toArray()
      .then(products => {
        console.log(products);
        return products;
      })
      .catch(err => {
        console.log(err);
      });
  }
  static fetchProductById(prodId) {
    const db = getDb();
    return db.collection('products')
      .find({ _id: new mongodb.ObjectId(prodId) })
      .next()
      .then(product => {
        console.log(product);
        return product;
      })
      .catch(err => {
        console.log(err);
      });
  }
  static deleteProductById(prodId) {
    const db = getDb();
    return db.collection('products')
      .deleteOne({  _id: new mongodb.ObjectId(prodId) })
      .then(  result => {
        console.log(result);
      })
      .catch( err => {
        console.log(err);
      });
  }
}

module.exports = Product;

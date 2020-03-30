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

const mongoConnect = require("../util/database");
class Product {
  constructor(title, price, description, imageUrl) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
  }

  save() {
    const db = getDb();
    return db
      .collection("products")
      .insertOne(this)
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
      .find({_id: new mongodb.ObjectID(prodId)})
      .next()
      .then(product => {
        console.log(product);
        return product;
      })
      .catch(err => {
        console.log(err);
      });
  }
}

module.exports = Product;

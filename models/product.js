//this code is worked well with mongodb drivers
{
  //   //   const db = require('../util/database');
  //   // const Cart = require('./cart');
  //   // const getProductsFromFile = cb => {
  //   //   fs.readFile(p, (err, fileContent) => {
  //   //     if (err) {
  //   //       cb([]);
  //   //     } else {
  //   //       cb(JSON.parse(fileContent));
  //   //     }
  //   //   });
  //   // };
  //   // module.exports = class Product {
  //   //   constructor(id, title, imageUrl, description, price) {
  //   //     this.id = id;
  //   //     this.title = title;
  //   //     this.imageUrl = imageUrl;
  //   //     this.description = description;
  //   //     this.price = price;
  //   //   }
  //   //   save() {
  //   //   }
  //   //   static deleteById(id) {
  //   //   }
  //   //   static fetchAll() {
  //   //     return db.execute('SELECT * FROM products');
  //   //   }
  //   //   static findById(id) {
  //   //   }
  //   // };
  // }
  // const mongodb = require('mongodb');
  // const getDb = require("../util/database").getDb;
  // //const mongoConnect = require("../util/database").mongoConnect;
  // class Product {
  //   constructor(title, price, description, imageUrl, id, userId) {
  //     this.title = title;
  //     this.price = price;
  //     this.description = description;
  //     this.imageUrl = imageUrl;
  //     this._id = id ? new mongodb.ObjectID(id) : null;
  //     this.userId = userId;
  //   }
  //   save() {
  //     const db = getDb();
  //     let dbOperation;
  //     if(this._id) {
  //       dbOperation = db.collection('products').updateOne({'_id': this._id}, {  $set: this  });
  //     }
  //     else {
  //       dbOperation = db.collection('products').insertOne( this );
  //     }
  //     return dbOperation
  //         .then(result => {
  //         console.log(result);
  //       })
  //       .catch(err => {
  //         console.log(err);
  //       });
  //   }
  //   static fetchAllProducts() {
  //     const db = getDb();
  //     return db
  //       .collection("products")
  //       .find({})
  //       .toArray()
  //       .then(products => {
  //         //console.log(products);
  //         return products;
  //       })
  //       .catch(err => {
  //         console.log(err);
  //       });
  //   }
  //   static fetchProductById(prodId) {
  //     console.log(prodId);
  //     const db = getDb();
  //     return db.collection('products')
  //       .findOne({ _id: new mongodb.ObjectId(prodId) })
  //       .then(product => {
  //         console.log(product);
  //         return product;
  //       })
  //       .catch(err => {
  //         console.log(err);
  //       });
  //   }
  //   static deleteProductById(prodId) {
  //     const db = getDb();
  //     return db.collection('products')
  //       .deleteOne({  _id: new mongodb.ObjectId(prodId) })
  //       .then(  result => {
  //         console.log(result);
  //       })
  //       .catch( err => {
  //         console.log(err);
  //       });
  //   }
  // }
  // module.exports = Product;
}

//this code is working with mongoose
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User", //reference defined for identify the id from where the id comes from, here it comes from the User model as this is a user id so...
    required: true
  }
});

//model is a complete product or object which having or using the properties of schema
const Product = mongoose.model("Product", productSchema);

module.exports = Product;

{
  // const mongodb = require("mongodb");
  // const getDb = require("../util/database").getDb;
  // class User {
  //   constructor(username, email, phoneNo, cart, id) {
  //     this.name = username;
  //     this.email = email;
  //     this.phoneNo = phoneNo;
  //     this.cart = cart; //{ item: [ {having product object} & total quantity ]}
  //     this._id = id;
  //   }
  //   //save or update user information in database
  //   save() {
  //     const db = getDb();
  //     let userDataOperation;
  //     if (this._id) {
  //       //update user information
  //       userDataOperation = db
  //         .collection("users")
  //         .updateOne({ _id: this._id }, { $set: this });
  //     } else {
  //       //insert new user into DB
  //       userDataOperation = db.collection("users").insertOne(this);
  //     }
  //     return userDataOperation
  //       .then(result => {
  //         console.log(result);
  //       })
  //       .catch(err => {
  //         console.log(err);
  //       });
  //   }
  //   //find user by their id
  //   static findUserById(userId) {
  //     const db = getDb();
  //     return db
  //       .collection("users")
  //       .findOne({ _id: new mongodb.ObjectId(userId) })
  //       .then(user => {
  //         return user;
  //       })
  //       .catch(err => {
  //         console.log(err);
  //       });
  //   }
  //   //add products to user cart
  //   addToCart(product) {
  //     const cartProductIndex = this.cart.items.findIndex(cartProduct => {
  //       return cartProduct.productId.toString() === product._id.toString();
  //     });
  //     let newQuantity = 1;
  //     const updatedCartItems = [...this.cart.items];
  //     if (cartProductIndex >= 0) {
  //       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
  //       updatedCartItems[cartProductIndex].quantity = newQuantity;
  //     } else {
  //       updatedCartItems.push({
  //         productId: new mongodb.ObjectId(product._id),
  //         quantity: newQuantity
  //       });
  //     }
  //     const updatedCart = {
  //       items: updatedCartItems
  //     };
  //     const db = getDb();
  //     return db
  //       .collection("users")
  //       .updateOne(
  //         { _id: new mongodb.ObjectId(this._id) },
  //         { $set: { cart: updatedCart } }
  //       );
  //   }
  //   getCart() {
  //     const db = getDb();
  //     const productIds = this.cart.items.map(i => {
  //       return i.productId;
  //     });
  //     return db
  //       .collection("products")
  //       .find({ _id: { $in: productIds } })
  //       .toArray()
  //       .then(products => {
  //         return products.map(product => {
  //           return {
  //             ...product,
  //             quantity: this.cart.items.find(i => {
  //               return i.productId.toString() === product._id.toString();
  //             }).quantity
  //           };
  //         });
  //       });
  //   }
  //   deleteProductFromCart(productId) {
  //     const db = getDb();
  //     const UpdatedCartItems = this.cart.items.filter(product => {
  //       return product.productId.toString() !== productId.toString();
  //     });
  //     return db
  //       .collection("users")
  //       .updateOne(
  //         { _id: new mongodb.ObjectId(this._id) },
  //         { $set: { cart: { items: UpdatedCartItems } } }
  //       );
  //   }
  //   addOrder() {
  //     const db = getDb();
  //     return this.getCart()
  //       .then(products => {
  //         const order = {
  //           items: products,
  //           user: {
  //             _id: new mongodb.ObjectId(this._id),
  //             name: this.name,
  //             email: this.email,
  //             phoneNo: this.phoneNo
  //           }
  //         };
  //         return db.collection("orders").insertOne(order);
  //       })
  //       .then(result => {
  //         this.cart = { items: [] };
  //         return db
  //           .collection("users")
  //           .updateOne(
  //             { _id: new mongodb.ObjectId(this._id) },
  //             { $set: { cart: { items: [] } } }
  //           );
  //       });
  //   }
  //   getOrders() {
  //     const db = getDb();
  //     return db
  //       .collection("orders")
  //       .find({ "user._id": new mongodb.ObjectId(this._id) })
  //       .toArray();
  //   }
  // }
  // module.exports = User;
}

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: Number,
    required: false
  },
  password: {
    type: String,
    required: true
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        name: {
          type: String,
          required: false
        },
        quantity: {
          type: Number,
          required: true
        }
      }
    ]
  },
  resetToken : {
    type: String,
    required: false
  },
  resetTokenExpiration : {
    type: Date,
    required: false
  } 
});

userSchema.methods.addToCart = function(product) {
  console.log(product);
  const cartProductIndex = this.cart.items.findIndex(cartProduct => {
    return cartProduct.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];
  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity
    });
  }
  const updatedCart = {
    items: updatedCartItems
  };
  //const db = getDb();

  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.deleteProductFromCart = function(productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  })
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function() {
  this.cart = {items: []};
  return this.save();
}

const User = mongoose.model("User", userSchema);

module.exports = User;

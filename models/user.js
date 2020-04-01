const mongodb = require("mongodb");
const getDb = require("../util/database").getDb;

class User {
  constructor(username, email, phoneNo, id, userId) {
    this.name = username;
    this.email = email;
    this.phoneNo = phoneNo;
    this._id = id ? new mongodb.ObjectId(id) : null;
    this.userId = userId;                             
  }

  save() {
    const db = getDb();
    let userDataOperation;
    if (this._id) {
      //update user information
      userDataOperation = db
        .collection("users")
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      //insert new user into DB
      userDataOperation = db.collection("users").insertOne(this);
    }
    return userDataOperation
      .then(result => {
        console.log(result);
      })
      .catch(err => {
        console.log(err);
      });
  }

  static findUserById(userId) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({ _id: new mongodb.ObjectId(userId) })
      .then(user => {
        return user;
      })
      .catch(err => {
        console.log(err);
      });
  }
}

module.exports = User;

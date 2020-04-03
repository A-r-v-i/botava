const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const path = require("path");

const mongoose = require("mongoose");

//const mongoConnect = require("./util/database").mongoConnect;
const User = require("./models/user");

//const db = require('./util/database');

const errorController = require("./controllers/error");

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", "views");
{
  // This db will give a promise object which shows the Response
  // whether it connects correctly or any error occured. So we can access this object using then() & catch()
  // db.execute('SELECT * FROM products')
  //   .then(  result => {
  //     console.log(result);
  //   })
  //   .catch( err => {
  //     console.log(err);
  //   });
}
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use((req, res, next) => {
  User.findById("5e870660be781143740104ad")
    .then(user => {
      //console.log(user);
      req.user = user;
      next();
    })
    .catch(err => {
      console.log(err);
    });
});
app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// mongoConnect(() => {
//   app.listen(port);
// });

mongoose
  .connect(
    "mongodb+srv://aravind:arvi2098@cluster-node-complete-sfr53.mongodb.net/shop?retryWrites=true&w=majority"
  )
  .then(result => {
    //console.log(result);
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: "Aravind",
          email: "aravind@gmail.com",
          phoneNumber: 9876543210,
          cart: {
            items: []
          }
        });

        user.save();
      }
    });
    app.listen(port);
  })
  .catch(err => {
    throw err;
  });

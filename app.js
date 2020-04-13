const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const app = express();

const path = require("path");

const mongoose = require("mongoose");
const csrf = require("csurf");
const flash = require('connect-flash');

const MONGODB_URI =
  "mongodb+srv://aravind:arvi2098@cluster-node-complete-sfr53.mongodb.net/shop";

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "session",
});

const csrfProtection = csrf();
//const mongoConnect = require("./util/database").mongoConnect;
const User = require("./models/user");

//const db = require('./util/database');

const errorController = require("./controllers/error");

const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "sample secret key",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user)
    .then((user) => {
      //console.log(user);
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isAuthenticated;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    //console.log(result);

    app.listen(port);
  })
  .catch((err) => {
    throw err;
  });



//404 page  
app.use(errorController.get404);

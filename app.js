const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

const app = express();
const path = require("path");

const port = process.env.PORT || 3000;

const MONGODB_URI =
  "mongodb+srv://aravind:arvi2098@cluster-node-complete-sfr53.mongodb.net/shop";

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});
// const fileFiltering = (req, file, cb) => {
//   if (
//     file.mimetype === "image/png" ||
//     file.mimetype === "image/jpg" ||
//     file.mimetype === "image/jpeg"
//   ) {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "session",
});

const csrfProtection = csrf();
//const mongoConnect = require("./util/database").mongoConnect;
const User = require("./models/user");
//const db = require('./util/database');

const errorController = require("./controllers/error");

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage}).single('images'));
app.use(express.static(path.join(__dirname, "public")));
// app.use("/images",express.static(path.join(__dirname, "images")));
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
      throw new Error(err);
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
//for technical error in client side or in data fetching
app.get("/500", errorController.get500);

//404 page
app.use(errorController.get404);

//requset with error arguments will directly take tha following route
app.use((error, req, res, next) => {
  res.redirect("/500");
});
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    //console.log(result);

    app.listen(port);
  })
  .catch((err) => {
    throw err;
  });

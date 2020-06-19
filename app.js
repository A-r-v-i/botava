const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const app = express();
const path = require("path");
const uuidv4 = require("uuid/v4");
const mongoose = require("mongoose");
const csrf = require("csurf");
const flash = require("connect-flash");
const fs = require("fs");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster-node-complete-sfr53.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "session",
});

const csrfProtection = csrf();
//const mongoConnect = require("./util/database").mongoConnect;
const User = require("./models/user");

//const db = require('./util/database');

const port = process.env.PORT || 3000;

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
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

const accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {
  flags: "a",
});

app.use(helmet());
app.use(compression());
app.use(morgan("combined", {stream: accessLogStream}));

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
const errorController = require("./controllers/error");

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

//404 page
app.use(errorController.get404);
app.get("/500", errorController.get500);

//requset with error arguments will directly take the following route
app.use((error, req, res, next) => {
  res.redirect("/500");
});
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log(`connected on ${port}`);

    app.listen(port);
  })
  .catch((err) => {
    throw err;
  });

const bcrypt = require("bcryptjs");
// const nodemailer = require('nodemailer');
// const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require("../models/user");

// const transport = nodemailer.createTransport(sendgridTransport({
//   auth: {
//     api_key: ,
//   }
// }))

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    pageTitle: "Botava | Login",
    path: "/login",
    isAuthenticated: false,
    error: message,
  });
};

exports.postLogin = (req, res, next) => {
  const uEmail = req.body.email;
  const uPassword = req.body.password;

  User.findOne({ email: uEmail })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password.");
        return res.redirect("/login");
      }
      bcrypt
        .compare(uPassword, user.password)
        .then((result) => {
          if (!result) {
            return res.redirect("/login");
          }
          req.session.isAuthenticated = true;
          req.session.user = user;
          return req.session.save((err) => {
            console.log(err);
            res.redirect("/");
          });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    pageTitle: "Botava | SignUp",
    path: "/signup",
    isAuthenticated: false,
    error: message
  });
};

exports.postSignup = (req, res, next) => {
  const userName = req.body.userName;
  const phoneNumber = req.body.phoneNumber;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash("error", "Email already exists.");
        res.redirect("/signup");
      }
      return bcrypt
        .hash(password, 12)
        .then((hashPassword) => {
          const newUser = new User({
            name: userName,
            email: email,
            phoneNumber: phoneNumber,
            password: hashPassword,
            cart: { items: [] },
          });
          return newUser.save();
        })
        .then((result) => {
          res.redirect("/login");
          // return transport.sendMail({
          //   to: email,
          //   from: 'shop@botava.com',
          //   subject: 'Account created successfully',
          //   html: `<h2>Hi ${name}, Your account created successfully</h2>`
          // });
        });
    })
    .catch((err) => console.log(err));
};

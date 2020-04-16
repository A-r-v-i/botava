const crypto = require("crypto");
const bcrypt = require("bcryptjs");
// const nodemailer = require('nodemailer');
// const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require("express-validator/check");
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
    oldKey: {
      email: "",
      password: ""
    }
  });
};

exports.postLogin = (req, res, next) => {
  const uEmail = req.body.email;
  const uPassword = req.body.password;
  const errors = validationResult(req);
  console.log(errors.array()[0]);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "Botava | Login",
      path: "/login",
      isAuthenticated: false,
      error: errors.array()[0].msg,
      oldKey: {
        email: uEmail,
        password: uPassword
      }
    });
  }
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
    error: message,
    oldKey: {
      userName: "",
      phoneNumber: "",
      email: ""
    }
  });
};

exports.postSignup = (req, res, next) => {
  const userName = req.body.userName;
  const phoneNumber = req.body.phoneNumber;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  console.log(errors.array());
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      pageTitle: "Botava | SignUp",
      path: "/signup",
      isAuthenticated: false,
      error: errors.array()[0].msg,
      oldKey : {
        userName: userName,
        phoneNumber: phoneNumber,
        email: email,
      }
    });
  }
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

exports.getResetPassword = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/resetPassword", {
    path: "/resetPassword",
    pageTitle: "Botava | Reset",
    error: message,
  });
};

exports.postResetPassword = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      res.redirect("/resetPassword");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          res.flash(
            "error",
            "Email id does not exist, Create an account for login."
          );
          res.redirect("/resetPassword");
        }
        user.requestToken = token;
        user.requestTokenExpiration = Date.now() + 3600000;
      })
      .then((result) => {
        res.flash("error", "Check your mail for the password reset link.");
        res.redirect("/resetPassword");
        transport.sendMail({
          to: req.body.mail,
          from: "shop@botava.com",
          subject: "Password Reset link",
          html: `
          <p>Hi,</p><br />
          <p>Here is your password link.</p>
          <code>Click <a href="http://www.localhost:3000/resetPassword/${token}">here</a> to reset your password.</code>
          `,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    requestToken: token,
    requestTokenExpiration: { $gt: Date.now() },
  })
    .then((result) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/resetPassword", {
        path: "/newPassword",
        pageTitle: "Botava | Reset",
        error: message,
        userId: user._id.toString(),
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const passwordToken = req.body.token;
  const userId = req.body.userId;
  const newPassword = req.body.password;
  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    requestTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashPassword) => {
      resetUser.password = hashPassword;
      resetUser.token = undefined;
      resetUser.requestTokenExpiration = undefined;

      return resetUser.save();
    })
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });
};

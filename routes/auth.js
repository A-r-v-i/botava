const express = require("express");

const { check, body } = require("express-validator/check");

const authController = require("../controllers/auth");

const router = express.Router();

router.get("/login", authController.getLogin);

router.post(
  "/login",
  check("email", "Enter valid email").isEmail().normalizeEmail(),
  body("password", "Enter valid password")
    .isAlphanumeric()
    .isLength({ min: 5 }).trim(),
  authController.postLogin
);

router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignup);

router.post(
  "/signup",
  check("email").isEmail().withMessage("Enter valid email").normalizeEmail(),
  body("password", "Enter alphanumberic password with atleast 5 characters")
    .isAlphanumeric()
    .isLength({ min: 5 }).trim(),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password have to match!");
    } else {
      return true;
    }
  }).trim(),
  authController.postSignup
);

router.get("/resetPassword", authController.getResetPassword);

router.post("/resetPassword", authController.postResetPassword);

router.get("/newPassword/:token", authController.getNewPassword);

router.post("/newPassword", authController.postNewPassword);

module.exports = router;

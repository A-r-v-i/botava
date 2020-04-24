const path = require("path");

const express = require("express");
const authMid = require("../middleware/auth-mid");
const { body, check } = require("express-validator");
const adminController = require("../controllers/admin");

const router = express.Router();

// //admin/products => GET
router.get("/products", adminController.getProducts);

// /admin/add-product => GET
router.get("/add-product", authMid, adminController.getAddProduct);

// /admin/add-product => POST
router.post(
  "/add-product",
  [
    check("title").isString().isLength({ min: 3 }).trim(),
    check("imageUrl").isURL(),
    check("price").isFloat(),
    check("description").isLength({ max: 400 }).trim(),
  ],
  authMid,
  adminController.postAddProduct
);

// //admin/edit-product/with id => GET
router.get("/edit-product/:productId", authMid, adminController.getEditProduct);

// //route to post the edited product in product page =>POST
router.post(
  "/edit-product",
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("imageUrl").isURL(),
    body("price").isFloat(),
    body("description").isLength({ max: 400 }).trim(),
  ],
  authMid,
  adminController.postEditProduct
);

// //route to delete the product => POST
router.post("/delete-product", adminController.postDeleteProduct);

module.exports = router;

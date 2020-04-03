const path = require("path");

const express = require("express");

const shopController = require("../controllers/shop");

const router = express.Router();

//route to get the index page or opening page of site
router.get("/", shopController.getIndex);

//route to get all the product list in shopping page
router.get("/products", shopController.getProducts);

//route for getting single product detail in shoppinng page
router.get("/products/:productId", shopController.getSingleProduct);

router.get("/cart", shopController.getCart);

router.post("/cart", shopController.postCart);

router.post("/cart-delete-item", shopController.postCartDeleteProduct);

router.post("/create-order", shopController.postOrder);

router.get("/orders", shopController.getOrders);

// router.get('/checkout', shopController.getCheckout);

module.exports = router;

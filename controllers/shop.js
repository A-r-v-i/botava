const Product = require("../models/product");
const Cart = require("../models/cart");
const Orders = require("../models/orders");

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render("shop/product-list", {
        path: "/products",
        prods: products,
        pageTitle: "Time to Show-Off"
      });
    })
    .catch(err => {
      console.log(err);
    });
};

//controller to get a single product detail page while user click a product in product list page
exports.getSingleProduct = (req, res, next) => {
  const prodId = req.params.productId;
  //console.log(prodId);
  Product.findById(prodId)
    .then(product => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products"
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/"
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
      //console.log(user.cart.items)
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Cart",
        products: products
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      //console.log(product);
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect("/cart");
    })
    .catch(err => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .deleteProductFromCart(prodId)
    .then(result => {
      console.log(result);
      res.redirect("/cart");
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
      console.log(user.cart.items);
      const products = user.cart.items.map(p => {
        return {
          quantity: p.quantity,
          product: { ...p.productId._doc }
        };
      });
      const order = new Orders({
        user: {
          name: req.user.name,
          userId: req.user
        },
        products: products
      });
      order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch(err => {
      console.log(err);
    });
};
exports.getOrders = (req, res, next) => {
  Orders.find({ "user.userId": req.user._id })
    .then(orders => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders
      });
    })
    .catch(err => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout"
  });
};

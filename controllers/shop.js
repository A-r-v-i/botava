const Product = require("../models/product");
const Cart = require("../models/cart");
const Orders = require("../models/orders");

//error handling function once throwing error
function errorFunc(err) {
  const error = new Error(err);
  error.httpStatusCode = 500;
  return next(error);
}

exports.getProducts = (req, res, next) => {
    try {
      Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        path: "/products",
        prods: products,
        pageTitle: "Botava | All Organic",
        isAuthenticated: req.session.isAuthenticated,
      });
    })
    .catch((err) => {
      console.log(err);
      errorFunc(err);
    });
    } catch (error) {
     errorFunc(error); 
    }
};

//controller to get a single product detail page while user click a product in product list page
exports.getSingleProduct = (req, res, next) => {
  const prodId = req.params.productId;
  //console.log(prodId);
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: `Botava | {product.title}`,
        path: "/products",
        isAuthenticated: req.session.isAuthenticated,
      });
    })
    .catch((err) => {
      console.log(err);
      errorFunc(err);
    });
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Botava | Shop",
        path: "/",
      });
    })
    .catch((err) => {
      console.log(err);
      errorFunc(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      //console.log(user.cart.items)
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Botava | Cart",
        products: products,
        isAuthenticated: req.session.isAuthenticated,
      });
    })
    .catch((err) => {
      console.log(err);
      errorFunc(err);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      //console.log(product);
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
      errorFunc(err);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .deleteProductFromCart(prodId)
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
      errorFunc(err);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      console.log(user.cart.items);
      const products = user.cart.items.map((p) => {
        return {
          quantity: p.quantity,
          product: { ...p.productId._doc },
        };
      });
      const order = new Orders({
        user: {
          email: req.user.email,
          name: req.user.name,
          userId: req.user,
        },
        products: products,
      });
      order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      console.log(err);
      errorFunc(err);
    });
};
exports.getOrders = (req, res, next) => {
  Orders.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Botava | Your Orders",
        orders: orders,
        isAuthenticated: req.session.isAuthenticated,
      });
    })
    .catch((err) => {
      console.log(err);
      errorFunc(err);
    });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Botava | Checkout",
    isAuthenticated: req.session.isAuthenticated,
  });
};

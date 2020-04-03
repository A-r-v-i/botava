const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getProducts = (req, res, next) => {
  Product.fetchAllProducts()
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
  Product.fetchProductById(prodId)
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
  Product.fetchAllProducts()
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
    .getCart()
    .then(products => {
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
  Product.fetchProductById(prodId)
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
  req.user.deleteProductFromCart(prodId)
  .then(result => {
    console.log(result);
    res.redirect('/cart');
  })
  .catch(err => {
    console.log(err);
  });
};

exports.postOrder = (req,res,next) => {
  let fectchedCart;
  req.user
    .addOrder()
    .then(result => {
      console.log(result);
      res.redirect('/orders');
    })
    .catch( err => console.log(err));
}
exports.getOrders = (req, res, next) => {
  req.user.getOrders()
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

const fs = require("fs");
const path = require("path");
const Product = require("../models/product");
const Cart = require("../models/cart");
const Orders = require("../models/orders");
const PdfDocument = require("pdfkit");
const { stripe_sk, stripe_pk } = require("../data/pk_key.json");
const stripe = require("stripe")(stripe_sk);

//no of products per page to display
const MAX_NO_OF_PRODUCTS = 2;

function errorFunc(err) {
  const error = new Error(err);
  error.httpStatusCode = 500;
  return next(error);
}

exports.getProducts = (req, res, next) => {
  try {
    console.log(stripe_sk);
    const page = +req.query.page || 1;
    let totalItems;
    Product.find()
      .countDocuments()
      .then((numOfProds) => {
        totalItems = numOfProds;
        return Product.find()
          .skip((page - 1) * MAX_NO_OF_PRODUCTS)
          .limit(MAX_NO_OF_PRODUCTS);
      })
      .then((products) => {
        res.render("shop/product-list", {
          prods: products,
          pageTitle: "Botava | Shop",
          path: "/products",
          currentPage: page,
          hasNextPage: MAX_NO_OF_PRODUCTS * page < totalItems,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / MAX_NO_OF_PRODUCTS),
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
      console.log(product);
      res.render("shop/product-detail", {
        product: product,
        pageTitle: `Botava | ${product.title}`,
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
  const page = +req.query.page || 1;
  let totalItems;
  Product.find()
    .countDocuments()
    .then((numOfProds) => {
      totalItems = numOfProds;
      return Product.find()
        .skip((page - 1) * MAX_NO_OF_PRODUCTS)
        .limit(MAX_NO_OF_PRODUCTS);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Botava | Shop",
        path: "/",
        currentPage: page,
        hasNextPage: MAX_NO_OF_PRODUCTS * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / MAX_NO_OF_PRODUCTS),
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
      const products = user.cart.items;
      //console.log(products)
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
  let products;
  let total = 0;

  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      products = user.cart.items;
      total = 0;
      products.forEach((p) => {
        total += p.quantity * p.productId.price;
      });
      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map(p => {
          return {
            name: p.productId.title,
            description: p.productId.description,
            amount: p.productId.price * 100,
            currency: 'usd',
            quantity: p.quantity
          };
        }),
        success_url: req.protocol+'://'+req.get('host')+'/checkout/success',
        cancel_url: req.protocol+'://'+req.get('host')+'/checkout/cancel'
      });
    })
    .then(session => {
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Botava | Checkout",
        products: products,
        totalSum: total,
        pk_key: stripe_pk,
        sessionId: session.id
      });
    })
    .catch((err) => {
      console.log(err);
      //errorFunc(err);
    });


  // req.user
  //   .populate("cart.items.productId")
  //   .execPopulate()
  //   .then((user) => {
  //     console.log(user.cart.items);
  //     const products = user.cart.items.map((p) => {
  //       return {
  //         quantity: p.quantity,
  //         product: { ...p.productId._doc },
  //       };
  //     });
  //     const order = new Orders({
  //       user: {
  //         email: req.user.email,
  //         name: req.user.name,
  //         userId: req.user,
  //       },
  //       products: products,
  //     });
  //     order.save();
  //   })
  //   .then((result) => {
  //     return req.user.clearCart();
  //   })
  //   .then(() => {
  //     res.redirect("/orders");
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     errorFunc(err);
  //   });
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

exports.getCheckOut = (req, res, next) => {
  let products;
  let total = 0;

  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      products = user.cart.items;
      total = 0;
      products.forEach((p) => {
        total += p.quantity * p.productId.price;
      });
      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map(p => {
          return {
            name: p.productId.title,
            description: p.productId.description,
            amount: p.productId.price * 100,
            currency: 'usd',
            quantity: p.quantity
          };
        }),
        success_url: req.protocol+'://'+req.get('host')+'/checkout/success',
        cancel_url: req.protocol+'://'+req.get('host')+'/checkout/cancel'
      });
    })
    .then(session => {
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Botava | Checkout",
        products: products,
        totalSum: total,
        pk_key: stripe_pk,
        sessionId: session.id
      });
    })
    .catch((err) => {
      console.log(err);
      //errorFunc(err);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Orders.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No such order placed."));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthourized."));
      }
      const invoiceName = "invoice" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PdfDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      pdfDoc.fontSize(26).text("Order Invoice", {
        underline: true,
        align: "center",
      });
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc.fontSize(20).text(`Product: ${prod.product.title}`);
        pdfDoc.fontSize(18).text(`Quantity: ${prod.quantity}`);
        pdfDoc.fontSize(18).text(`Price: ${prod.product.price}`);
      });
      pdfDoc
        .fontSize(14)
        .text(
          "----------------------------------------------------------------------------------------"
        );
      pdfDoc.fontSize(28).text(`Total amount: ${totalPrice}`);
      pdfDoc.end();
    })
    .catch((err) => {
      console.log(err);
      errorFunc(err);
    });
};

const fs = require("fs");
const path = require("path");
const Product = require("../models/product");
const Cart = require("../models/cart");
const Orders = require("../models/orders");
const PdfDocument = require("pdfkit");
const { stripe_sk, stripe_pk } = require("../data/pk_key.json");
const stripe = require("stripe")(stripe_sk);

// const logo = require('../public/icons/android-chrome-192x192.png')

//no of products per page to display
const MAX_NO_OF_PRODUCTS = 2;

function errorFunc(err) {
  const error = new Error(err);
  error.httpStatusCode = 500;
  return next(error);
}

exports.getProducts = (req, res, next) => {
  try {
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
  Product.findById(prodId)
    .then((product) => {
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
      return req.user.addToCart(product);
    })
    .then((result) => {
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

  // req.user
  //   .populate("cart.items.productId")
  //   .execPopulate()
  //   .then((user) => {
  //     products = user.cart.items;
  //     total = 0;
  //     products.forEach((p) => {
  //       total += p.quantity * p.productId.price;
  //     });
  //     return stripe.checkout.sessions.create({
  //       payment_method_types: ['card'],
  //       line_items: products.map(p => {
  //         return {
  //           name: p.productId.title,
  //           description: p.productId.description,
  //           amount: p.productId.price * 100,
  //           currency: 'usd',
  //           quantity: p.quantity
  //         };
  //       }),
  //       success_url: req.protocol+'://'+req.get('host')+'/checkout/success',
  //       cancel_url: req.protocol+'://'+req.get('host')+'/checkout/cancel'
  //     });
  //   })
  //   .then(session => {
  //     res.render("shop/checkout", {
  //       path: "/checkout",
  //       pageTitle: "Botava | Checkout",
  //       products: products,
  //       totalSum: total,
  //       pk_key: stripe_pk,
  //       sessionId: session.id
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     //errorFunc(err);
  //   });

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
        payment_method_types: ["card"],
        line_items: products.map((p) => {
          return {
            name: p.productId.title,
            description: p.productId.description,
            amount: p.productId.price * 100,
            currency: "usd",
            quantity: p.quantity,
          };
        }),
        success_url:
          req.protocol + "://" + req.get("host") + "/checkout/success",
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
      });
    })
    .then((session) => {
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Botava | Checkout",
        products: products,
        totalSum: total,
        pk_key: stripe_pk,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      console.log(err);
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
      pdfDoc.image("public/logo/APPLY-GREEN-LOGO.png", 50, 50, {
        width: 100,
        height: 100,
      });
      pdfDoc.fontSize(26).text("Aromati - Glow naturally", {
        align: "center",
        underline: true,
      });
      pdfDoc.moveDown(2);
      pdfDoc.fontSize(24).text("Order Invoice", {
        underline: true,
        align: "center",
      });
      pdfDoc.moveDown(1);
      pdfDoc
        .fontSize(14)
        .text("Order Id: ", { align: "left", continued: true })
        .text(`${orderId}`, { align: "right" });
      pdfDoc
        .fontSize(14)
        .text("Account name: ", { align: "left", continued: true })
        .text(`${order.user.name}`, { align: "right" });
      pdfDoc
        .fontSize(12)
        .text("Ordered on", { align: "left", continued: true })
        .text(order.createdAt.toString(), { align: "right" });
      pdfDoc.moveDown(3);

      pdfDoc
        .fontSize(20)
        .text("Product", { align: "left", continued: true })
        .text("Quantity", { align: "center", continued: true })
        .text("Price", { align: "right" });
      pdfDoc
        .fontSize(14)
        .text(
          "----------------------------------------------------------------------------------------------------"
        );
      let totalPrice = 0,
        sgst = 13.5,
        cgst = 13.5;
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(20)
          .text(`${prod.product.title}`, { align: "left", continued: true })
          .text(` ${prod.quantity}`, { align: "center", continued: true })
          .text(`${(prod.product.price + +0.001).toFixed(2)}`, {
            align: "right",
          });
      });
      pdfDoc
        .fontSize(14)
        .text(
          "----------------------------------------------------------------------------------------------------"
        );
      let gstAmount = (totalPrice / 100) * (sgst + cgst);
      pdfDoc
        .fontSize(18)
        .text("Total amount", { align: "center", continued: true })
        .text(`${(totalPrice + +0.001).toFixed(2)} `, { align: "right" });
      pdfDoc
        .fontSize(16)
        .text("CGST(13.5%) + SGST(13.5%)", { align: "center", continued: true })
        .fontSize(18)
        .text(`(+) ${gstAmount.toFixed(2)}`, { align: "right" });
      pdfDoc
        .fontSize(14)
        .text(
          "----------------------------------------------------------------------------------------------------"
        );
      let grossPrice = totalPrice + gstAmount;
      pdfDoc
        .fontSize(20)
        .text("Total", { align: "center", continued: true })
        .text(`${grossPrice.toFixed(2)}`, { align: "right" });
      pdfDoc.end();
    })
    .catch((err) => {
      console.log(err);
      errorFunc(err);
    });
};

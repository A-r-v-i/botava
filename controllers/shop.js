const fs = require('fs');
const path = require('path');
const Product = require("../models/product");
const Cart = require("../models/cart");
const Orders = require("../models/orders");
<<<<<<< Updated upstream
const PdfDoc = require('pdfkit');
=======
const PdfDocument = require("pdfkit");
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
exports.getInvoice = (req,res,next) => {
  const orderId = req.params.orderId;
  Orders.findById(orderId)
    .then(order => {
      if(!order) {
        return next(new Error("No such order placed."));
      }
      if(order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized."));
      }

      const invoiceName = "invoice-" + orderId +".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PdfDoc();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"' 
=======
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
      const invoiceName = "invoice" + orderId + "pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PdfDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
>>>>>>> Stashed changes
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      pdfDoc.fontSize(26).text("Order Invoice", {
        underline: true,
<<<<<<< Updated upstream
        align: "center"
      });
      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc.fontSize(20).text(`Product: ${prod.product.title}`);
        pdfDoc.fontSize(18).text(`Quantity: ${prod.quantity}`);
        pdfDoc.fontSize(18).text(`Price: ${prod.product.price}`);
      })
      pdfDoc.fontSize(14).text('----------------------------------------------------------------------------------------');
      pdfDoc.fontSize(28).text(`Total amount: ${totalPrice}`)
      pdfDoc.end();
    })
    .catch(err => {
      console.log(err);
      errorFunc(err);
    })
}
=======
        align: "center",
      });
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.price;
        pdfDoc.fontSize(20).text(`Product: ${prod.product.title}`);
        pdfDoc.fontSize(18).text(`Quantity: ${prod.product.quantity}`);
        pdfDoc.fontSize(18).text(`Price: ${prod.product.price}`);
      });
      pdfDoc
        .fontSize(14)
        .text(
          "----------------------------------------------------------------------------------------"
        );
      pdfDoc.fontSize(28).text(`Total amount: ` + totalPrice);
      pdfDoc.end();
      // fs.readFile(invoicePAth, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader("Content-Type", "application/pdf");
      //   res.setHeader(
      //     "Content-Disposition",
      //     'inline; filename="' + invoiceName + '"'
      //   );
      //   res.send(data);
      // });
      // const file = fs.createReadStream(invoicePath);
      //   file.pipe(res);
    })
    .catch((err) => {
      //console.log(err);
      next(err);
    });
};
>>>>>>> Stashed changes

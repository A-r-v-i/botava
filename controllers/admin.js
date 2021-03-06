const mongodb = require("mongodb");
const mongoose = require('mongoose');
const Product = require("../models/product");
const fileHelper = require("../util/file");
const { validationResult } = require("express-validator");
//get admin panel of products

function errorFunc(err) {
  const error = new Error(err);
  error.httpStatusCode = 500;
  return next(error);
}

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    // .select('title price')
    // .populate('userId')
    .then((products) => {
      //console.log(products);
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        errorMessage: null,
        //isAuthenticated: req.session.isAuthenticated,
      });
    })
    .catch((err) => {
      console.log(err);
      errorFunc(err);
    });
};

exports.getAddProduct = (req, res, next) => {
  // if (!req.session.isAuthenticated) {
  //   res.redirect("/login");
  // }
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasErrors: false,
    errorMessage: null,
    validationError: [],
  });
};

exports.postAddProduct = (req, res, next) => {
 // console.log(req);
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  console.log(image)
  //console.log(errors);
  
  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description
      },
      errorMessage: 'Attached file is not an image.',
      validationErrors: []
    });
  }
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasErrors: true,
      product: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      validationError: errors.array(),
    });
  }
  const imageUrl = image.path;

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      //console.log(result);
      console.log("Product added");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
      //res.redirect('/500');
      //errorFunc(err);
    });
};

//get edit page of product for admin
exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        hasErrors: false,
        errorMessage: null,
        validationError: [],
        //isAuthenticated: req.session.isAuthenticated,
      });
    })
    .catch((err) => {
      console.log(err);
      errorFunc(err);
    });
};

// post updated product to the DB from edit page
exports.postEditProduct = (req, res, next) => {
  console.log(req.body);
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasErrors: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId,
      },
      errorMessage: errors.array()[0].msg,
      validationError: errors.array(),
    });
  } 
    Product.findById(prodId)
      .then((product) => {
        if (product.userId.toString() !== req.user._id.toString()) {
          return res.redirect("/");
        }
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDesc;
        //product.imageUrl = updatedImageUrl;
        if (image) {
          fileHelper.deleteFile(product.imageUrl);
          product.imageUrl = image.path;
        }

        return product.save().then((result) => {
          //console.log(result);
          res.redirect("/admin/products");
        });
      })
      .catch((err) => {
        console.log(err);
        errorFunc(err);
      });
  
};

exports.deleteProduct = (req, res, next) => {
  //console.log(req.body);
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(product => {
    if(!product) {
      return next(new Error('Product not found.'));
    }
    return Product.deleteOne({ _id: prodId, userId: req.user._id });
  })
    .then(() => {
      console.log("Product deleted");
      res.status(200).json({message: 'Success.'});
    })
    .catch((err) => {
      res.status(500).json({message: 'Failed to delete.'});
    });
  };

{
  // exports.getEditProduct = (req, res, next) => {
  //   const editMode = req.query.edit;
  //   if (!editMode) {
  //     return res.redirect("/");
  //   }
  //   const prodId = req.params.productId;
  //   Product.findById(prodId, product => {
  //     if (!product) {
  //       return res.redirect("/");
  //     }
  //     res.render("admin/edit-product", {
  //       pageTitle: "Edit Product",
  //       path: "/admin/edit-product",
  //       editing: editMode,
  //       product: product
  //     });
  //   });
  // };
  // exports.postEditProduct = (req, res, next) => {
  //   const prodId = req.body.productId;
  //   const updatedTitle = req.body.title;
  //   const updatedPrice = req.body.price;
  //   const updatedImageUrl = req.body.imageUrl;
  //   const updatedDesc = req.body.description;
  //   const updatedProduct = new Product(
  //     prodId,
  //     updatedTitle,
  //     updatedImageUrl,
  //     updatedDesc,
  //     updatedPrice
  //   );
  //   updatedProduct.save();
  //   res.redirect('/admin/products');
  // };
  // exports.getProducts = (req, res, next) => {
  //   Product.fetchAll(products => {
  //     res.render('admin/products', {
  //       prods: products,
  //       pageTitle: 'Admin Products',
  //       path: '/admin/products'
  //     });
  //   });
  // };
  // exports.postDeleteProduct = (req, res, next) => {
  //   const prodId = req.body.productId;
  //   Product.deleteById(prodId);
  //   res.redirect('/admin/products');
  // };
}

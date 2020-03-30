// this file contailes function used to get data using file handling

// const fs = require('fs');
// const path = require('path');

// const p = path.join(
//   path.dirname(process.mainModule.filename),
//   'data',
//   'products.json'
// );

//save() {
// getProductsFromFile(products => {
//   if (this.id) {
//     const existingProductIndex = products.findIndex(
//       prod => prod.id === this.id
//     );
//     const updatedProducts = [...products];
//     updatedProducts[existingProductIndex] = this;
//     fs.writeFile(p, JSON.stringify(updatedProducts), err => {
//       console.log(err);
//     });
//   } else {
//     this.id = Math.random().toString();
//     products.push(this);
//     fs.writeFile(p, JSON.stringify(products), err => {
//       console.log(err);
//     });
//   }
// });
// }

// static deleteById(id) {
//   getProductsFromFile(products => {
//     const product = products.find(prod => prod.id === id);
//     const updatedProducts = products.filter(prod => prod.id !== id);
//     fs.writeFile(p, JSON.stringify(updatedProducts), err => {
//       if (!err) {
//         Cart.deleteProduct(id, product.price);
//       }
//     });
//   });
// }

// static fetchAll(cb) {
//   getProductsFromFile(cb);
// }

// static findById(id, cb) {
//   getProductsFromFile(products => {
//     const product = products.find(p => p.id === id);
//     cb(product);
//   });
// }

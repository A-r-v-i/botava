const mongoose = require('mongoose');
const { Timestamp } = require('mongodb');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  products: [{
    product: {
      type: Object,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }],
  user: {
    name: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }},
  {timestamps: true}
)

const Orders = mongoose.model('Orders', orderSchema);

module.exports = Orders;
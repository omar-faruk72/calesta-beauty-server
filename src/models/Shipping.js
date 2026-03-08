const mongoose = require("mongoose");

const ShippingSchema = new mongoose.Schema({
  customerInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String, default: 'Bangladesh' }
  },
  items: [
    {
      _id: String,
      name: String,
      quantity: Number,
      salePrice: Number,
      thumbnail: String
    }
  ],
  totalAmount: { type: Number, required: true },
  shippingFee: { type: Number, required: true },
  transactionId: { type: String, required: true, unique: true },
  paymentStatus: { type: String, default: 'pending' }, // pending, paid, failed
  orderStatus: { type: String, default: 'Processing' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Shipping", ShippingSchema);
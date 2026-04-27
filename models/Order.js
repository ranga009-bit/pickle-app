const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  items: Array,
  total: Number,
  customerName: String,
  phone: String,
  address: String,
  date: Date
});

module.exports = mongoose.model("Order", orderSchema);
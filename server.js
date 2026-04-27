const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ================= DB CONNECTION =================
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pickleDB")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));
// ================= MODELS =================

const Product = require("./models/Product");
const Order = require("./models/Order");

// ================= ROUTES =================

// GET PRODUCTS
app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// ADD PRODUCT
app.post("/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PLACE ORDER
app.post("/place-order", async (req, res) => {
  try {
    const { items, total, customerName, phone, address } = req.body;

    const order = new Order({
      items,
      total,
      customerName,
      phone,
      address,
      date: new Date()
    });

    await order.save();

    console.log("Order Saved:", order);

    res.json({
      success: true,
      orderId: order._id
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

// GET ORDERS
app.get("/orders", async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
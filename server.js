const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  address: String,
  phone: String
});

const User = mongoose.model("User", userSchema);
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();

// MIDDLEWARE
app.use(cors({
  origin: "*"
}));
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
app.delete("/products/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product deleted",
      product: deletedProduct
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ================= SERVER =================
// SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
  name,
  email,
  password: hashed,
  address,
  phone
});
    await user.save();

    res.json({
      success: true,
      message: "Signup successful"
    });

  } catch (err) {
    res.status(500).json({ message: "Signup failed" });
  }
});


// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      "pickleSecretKey",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      name: user.name
    });

  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

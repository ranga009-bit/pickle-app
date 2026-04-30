const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

/* ================== DATABASE ================== */
mongoose.connect("(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pickleDB"")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

/* ================== MODELS ================== */

// USER MODEL
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  address: String,
  phone: String
});
const User = mongoose.model("User", userSchema);

// PRODUCT MODEL
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String
});
const Product = mongoose.model("Product", productSchema);

// ORDER MODEL
const orderSchema = new mongoose.Schema({
  items: Array,
  total: Number,
  customerName: String,
  phone: String,
  address: String,
  email: String,
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model("Order", orderSchema);

/* ================== ROUTES ================== */

// TEST
app.get("/", (req, res) => {
  res.send("Server running");
});

// PRODUCTS
app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// ADD PRODUCT
app.post("/products", async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json(product);
});

// PLACE ORDER
app.post("/place-order", async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();

    // 🔥 SAVE ADDRESS TO USER
    if (req.body.email) {
      await User.updateOne(
        { email: req.body.email },
        {
          address: req.body.address,
          phone: req.body.phone
        }
      );
    }

    res.json({
      message: "Order placed",
      orderId: order._id
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ORDERS (ADMIN)
app.get("/orders", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

/* ================== AUTH ================== */

// SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashed
    });

    await user.save();

    res.json({ success: true, message: "Signup successful" });

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

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign({ id: user._id }, "secretkey");

    res.json({
      success: true,
      token,
      name: user.name,
      email: user.email
    });

  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

// GET USER (for auto-fill later)
app.get("/get-user", async (req, res) => {
  const user = await User.findOne({ email: req.query.email });
  res.json(user);
});

/* ================== SERVER ================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

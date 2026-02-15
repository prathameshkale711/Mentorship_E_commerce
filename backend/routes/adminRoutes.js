import express from "express";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Return from "../models/Return.js";
import multer from "multer";
import path from "path";

const router = express.Router();

/* ---------- MULTER CONFIG ---------- */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* ---------- ADD PRODUCT ---------- */
router.post("/product", upload.single("image"), async (req, res) => {
  try {
    const { name, price, stock } = req.body;

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    // Validation
    if (!name || isNaN(numericPrice) || isNaN(numericStock) || !req.file) {
      return res.status(400).json({
        message: "Valid name, numeric price, numeric stock and image required",
      });
    }

    const newProduct = new Product({
      name,
      price: numericPrice,
      stock: numericStock,
      image: req.file.filename,
    });

    await newProduct.save();

    res.status(201).json(newProduct);

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ---------- UPDATE PRODUCT ---------- */

router.put("/product/:id", async (req, res) => {
  const { name, price, stock } = req.body;

  await Product.findByIdAndUpdate(req.params.id, {
    name,
    price: Number(price),
    stock: Number(stock),
  });

  res.json({ message: "Product updated" });
});

/* ---------- DELETE PRODUCT ---------- */

router.delete("/product/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
});

/* ---------- INVENTORY ---------- */

router.get("/inventory", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

/* ---------- ORDERS ---------- */

router.get("/orders", async (req, res) => {
  const orders = await Order.find().populate("userId");
  res.json(orders);
});

/* ---------- DELETE ORDER ---------- */

router.delete("/order/:id", async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: "Order deleted" });
});

/* ---------- RETURNS ---------- */

router.get("/returns", async (req, res) => {
  const returns = await Return.find()
    .populate("userId")
    .populate("productId");
  res.json(returns);
});

/* ---------- APPROVE RETURN ---------- */

router.put("/returns/:id", async (req, res) => {
  await Return.findByIdAndUpdate(req.params.id, {
    status: "approved",
  });
  res.json({ message: "Return approved" });
});

export default router;

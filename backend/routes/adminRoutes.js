import express from "express";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Return from "../models/Return.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import multer from "multer";
import path from "path";

const router = express.Router();

/* ================= MULTER SETUP ================= */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req,file,cb)=>{
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({storage});

/* ================= ADD PRODUCT ================= */
router.post(
  "/product",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  async (req,res)=>{

    try{

      const {name,price,stock} = req.body;

      if(!name || !price || !stock){
        return res.status(400).json({message:"All fields required"});
      }

      const product = await Product.create({
        name,
        price:Number(price),
        stock:Number(stock),
        image:req.file ? req.file.path : ""
      });

      res.json(product);

    }catch(error){
      console.log("ADD PRODUCT ERROR:", error);
      res.status(500).json({message:"Server error"});
    }
});

/* ================= UPDATE PRODUCT ================= */
router.put(
  "/product/:id",
  authMiddleware,
  adminMiddleware,
  async(req,res)=>{
    try{
      const updated = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new:true}
      );
      res.json(updated);
    }catch(error){
      res.status(500).json({message:"Server error"});
    }
});

/* ================= DELETE PRODUCT ================= */
router.delete(
  "/product/:id",
  authMiddleware,
  adminMiddleware,
  async(req,res)=>{
    await Product.findByIdAndDelete(req.params.id);
    res.json({message:"Deleted"});
});

/* ================= INVENTORY ================= */
router.get(
  "/inventory",
  authMiddleware,
  adminMiddleware,
  async(req,res)=>{
    const products = await Product.find();
    res.json(products);
});

/* ================= DELETE ORDER ================= */
router.delete(
  "/order/:id",
  authMiddleware,
  adminMiddleware,
  async (req,res)=>{
    try{

      const order = await Order.findByIdAndDelete(req.params.id);

      if(!order){
        return res.status(404).json({message:"Order not found"});
      }

      res.json({message:"Order deleted successfully"});

    }catch(error){
      console.log(error);
      res.status(500).json({message:"Server error"});
    }
});


/* ================= VIEW ORDERS ================= */
router.get(
  "/orders",
  authMiddleware,
  adminMiddleware,
  async(req,res)=>{
    const orders = await Order.find()
      .populate("userId","email")
      .populate("items.productId","name price image")
      .sort({createdAt:-1});

    res.json(orders);
});

/* ================= RETURNS ================= */
router.get(
  "/returns",
  authMiddleware,
  adminMiddleware,
  async(req,res)=>{
    const returns = await Return.find()
      .populate("userId","email")
      .populate("productId","name image");

    res.json(returns);
});

/* ================= APPROVE RETURN ================= */
router.put(
  "/returns/:id",
  authMiddleware,
  adminMiddleware,
  async(req,res)=>{
    const updated = await Return.findByIdAndUpdate(
      req.params.id,
      {status:"approved"},
      {new:true}
    );

    res.json(updated);
});

export default router;

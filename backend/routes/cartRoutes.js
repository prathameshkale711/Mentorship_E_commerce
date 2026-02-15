import express from "express";
const router = express.Router();
import Cart from "../models/Cart.js";
import authMiddleware from "../middleware/authMiddleware.js";


//  Get Cart
router.get("/", authMiddleware, async (req,res)=>{
  try{
    const cart = await Cart.find({ userId:req.user.id })
      .populate("productId");

    res.json(cart);
  }catch(error){
    res.status(500).json({message:"Server error"});
  }
});


//  Add To Cart
router.post("/add", authMiddleware, async (req,res)=>{
  try{

    const {productId, quantity} = req.body;

    const existing = await Cart.findOne({
      userId:req.user.id,
      productId
    });

    if(existing){
      existing.quantity += quantity || 1;
      await existing.save();
      return res.json(existing);
    }

    const item = await Cart.create({
      userId:req.user.id,
      productId,
      quantity:quantity || 1
    });

    res.json(item);

  }catch(error){
    res.status(500).json({message:"Server error"});
  }
});


//  Update Quantity
router.put("/:id", authMiddleware, async (req,res)=>{
  try{

    const {quantity} = req.body;

    if(quantity < 1){
      return res.status(400).json({message:"Minimum quantity 1"});
    }

    const updated = await Cart.findByIdAndUpdate(
      req.params.id,
      {quantity},
      {new:true}
    );

    res.json(updated);

  }catch(error){
    console.log(error);
    res.status(500).json({message:"Server error"});
  }
});


//  Remove Item
router.delete("/:id", authMiddleware, async (req,res)=>{
  try{
    await Cart.findByIdAndDelete(req.params.id);
    res.json({message:"Removed"});
  }catch(error){
    res.status(500).json({message:"Server error"});
  }
});

export default router;

import express from "express";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
// GET MY ORDERS
router.get("/my-orders", authMiddleware, async (req,res)=>{
  try{

    const orders = await Order.find({ userId:req.user.id })
      .populate("items.productId","name price image")
      .sort({createdAt:-1});

    res.json(orders);

  }catch(error){
    console.log(error);
    res.status(500).json({message:"Server error"});
  }
});

//  CANCEL ORDER 
router.put("/cancel/:id", authMiddleware, async (req,res)=>{
  try{

    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if(!order){
      return res.status(404).json({message:"Order not found"});
    }

    
    if(order.status === "delivered"){
      return res.status(400).json({message:"Delivered order cannot be cancelled"});
    }

    order.status = "cancelled";
    await order.save();

    res.json(order);

  }catch(error){
    console.log(error);
    res.status(500).json({message:"Server error"});
  }
});

// PLACE ORDER
router.post("/place", authMiddleware, async (req,res)=>{

  try{

    const cartItems = await Cart.find({ userId:req.user.id })
      .populate("productId");

    if(cartItems.length === 0){
      return res.status(400).json({message:"Cart is empty"});
    }

    let total = 0;

    const items = [];

    for(let item of cartItems){

      if(!item.productId){
        return res.status(400).json({message:"Invalid product"});
      }

      total += item.quantity * item.productId.price;

      items.push({
        productId:item.productId._id,
        quantity:item.quantity
      });
    }

    const newOrder = await Order.create({
      userId:req.user.id,
      items,
      total
    });

    // Clear cart
    await Cart.deleteMany({ userId:req.user.id });

    console.log("ORDER SAVED:", newOrder); // IMPORTANT DEBUG

    res.json({
      message:"Order placed successfully",
      order:newOrder
    });

  }catch(error){
    console.log("ORDER ERROR:", error);
    res.status(500).json({message:"Server error"});
  }

});

export default router;

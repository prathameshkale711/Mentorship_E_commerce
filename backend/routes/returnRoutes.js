import express from "express";
import Return from "../models/Return.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// User Request Return
router.post("/request", authMiddleware, async (req,res)=>{

  const {productId, reason} = req.body;

  const newReturn = await Return.create({
    userId:req.user.id,
    productId,
    reason
  });

  res.json(newReturn);
});

export default router;

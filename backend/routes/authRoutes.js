import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

//  REGISTER 
router.post("/register", async (req,res)=>{
  try{

    const {name,email,password} = req.body;

    if(!name || !email || !password){
      return res.status(400).json({message:"All fields required"});
    }

    const existingUser = await User.findOne({email});
    if(existingUser){
      return res.status(400).json({message:"Email already registered"});
    }

    const hashedPassword = await bcrypt.hash(password,10);

    const newUser = await User.create({
      name,
      email,
      password:hashedPassword,
      role:"user"
    });

    res.json({message:"User registered successfully"});

  }catch(error){
    console.log("REGISTER ERROR:", error);
    res.status(500).json({message:"Server error"});
  }
});


//  LOGIN 
router.post("/login", async (req,res)=>{
  try{

    const {email,password} = req.body;

    const user = await User.findOne({email});
    if(!user){
      return res.status(400).json({message:"User not found"});
    }

    const match = await bcrypt.compare(password,user.password);
    if(!match){
      return res.status(400).json({message:"Wrong password"});
    }

    const token = jwt.sign(
      {id:user._id, role:user.role},
      process.env.JWT_SECRET,
      {expiresIn:"1d"}
    );

    res.json({
      token,
      role:user.role,
      name:user.name
    });

  }catch(error){
    console.log("LOGIN ERROR:", error);
    res.status(500).json({message:"Server error"});
  }
});

export default router;

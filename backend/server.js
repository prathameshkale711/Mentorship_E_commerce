import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import returnRoutes from "./routes/returnRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.use("/uploads", express.static("uploads"));

mongoose.connect(process.env.MONGO_URI)
  .then(()=>console.log("MongoDB Connected"))
  .catch(err=>console.log(err));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/returns", returnRoutes);

app.listen(process.env.PORT, ()=>{
  console.log("Server running on port", process.env.PORT);
});

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const imageUploadRoutes = require("./routes/imageupuloadRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const shippingRoutes = require("./routes/shippingRoutes");
const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173","https://calesta-beauty.vercel.app"],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/hello", (req, res) => {
  res.send("hello world");
});

app.use("/api/auth", authRoutes);
app.use("/api", imageUploadRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api/payment", orderRoutes);
app.use("/api/reviews", reviewRoutes);

// মিডলওয়্যার গুলোর নিচে এটি বসান
app.use("/api/shipping", shippingRoutes);

module.exports = app;

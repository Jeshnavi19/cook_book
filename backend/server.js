const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");


const multer = require("multer");
const path = require("path");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());


connectDB();




const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });


app.use("/uploads", express.static("uploads"));




app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/recipes", require("./routes/recipeRoutes"));
app.use("/api/cusins", require("./routes/cusinsRoutes"));
app.use("/api/cuisins", require("./routes/cusinsRoutes"));
app.use("/api/favorites", require("./routes/favoriteRoutes"));
app.use("/api/history", require("./routes/historyRoutes"));


app.use("/api", (req, res) => {
  res.status(404).json({
    message: "API route not found",
    method: req.method,
    path: req.originalUrl,
  });
});

app.get("/", (req, res) => {
  res.send("Server working");
});


app.listen(5050, () => console.log("Server running on port 5050"));

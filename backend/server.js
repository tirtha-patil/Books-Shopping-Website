require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const bookRoutes = require("./routes/books");

const app = express();

app.use(cors());
app.use(express.static(require('path').join(__dirname, '../frontend/dist')));
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/orders", require("./routes/orders"));
app.use("/api/payments", require("./routes/payments"));

app.get("*", (req, res) => {
  res.sendFile(require("path").join(__dirname, "../frontend/dist", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

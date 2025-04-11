const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

const seatRoutes = require("./routes/seats");
const authRoutes = require("./routes/auth");

app.use(cors());
app.use(express.json());

app.use("/api", seatRoutes);
app.use("/api", authRoutes);

app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

app.listen(PORT, () => {
  console.log(`Backend API is running on port ${PORT}`);
});

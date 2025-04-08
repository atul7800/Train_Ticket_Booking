const express = require("express");
const cors = require("cors");
const pool = require("./db");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const TOTAL_SEATS = 80;
const SEATS_PER_ROW = 7;

// Initialize seats
app.get("/seats", async (req, res) => {
  const result = await pool.query("SELECT * FROM seats ORDER BY id ASC");
  res.json(result.rows);
});

// Book seats
app.post("/book", async (req, res) => {
  const {count} = req.body;
  if (!count || count < 1 || count > 7) {
    return res.status(400).json({error: "Invalid seat count"});
  }

  const result = await pool.query(
    "SELECT * FROM seats WHERE booked = false ORDER BY id ASC"
  );
  const available = result.rows;

  if (available.length < count) {
    return res.status(400).json({error: "Not enough seats available"});
  }

  const toBook = available.slice(0, count);
  const seatIds = toBook.map((s) => s.id);

  for (let id of seatIds) {
    await pool.query("UPDATE seats SET booked = true WHERE id = $1", [id]);
  }

  res.json({success: true, bookedSeats: seatIds});
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port", process.env.PORT || 5000);
});

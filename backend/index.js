const express = require("express");
const cors = require("cors");
const pool = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//Health check
app.get("/", (req, res) => {
  res.send("Backend is up and running!");
});

//Get all seats
app.get("/seats", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM seats ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching seats:", err.message);
    res.status(500).json({error: "Failed to fetch seats"});
  }
});

//Book seats (smart booking: same row > nearby)
app.post("/book", async (req, res) => {
  const {count} = req.body;

  if (!count || count < 1 || count > 7) {
    return res
      .status(400)
      .json({error: "You can book between 1 to 7 seats only."});
  }

  try {
    const result = await pool.query(
      "SELECT * FROM seats WHERE booked = false ORDER BY id ASC"
    );
    const availableSeats = result.rows;

    if (availableSeats.length < count) {
      return res.status(400).json({
        error: `Booking failed, Only ${availableSeats.length} seats available to book.`,
      });
    }

    //Group seats by row
    const rows = {};
    availableSeats.forEach((seat) => {
      const row = seat.id <= 70 ? Math.ceil(seat.id / 7) : 11; //Last row = 71–73
      if (!rows[row]) rows[row] = [];
      rows[row].push(seat);
    });

    //Priority: Book seats in same row
    for (let row in rows) {
      const rowSeats = rows[row];

      for (let i = 0; i <= rowSeats.length - count; i++) {
        const chunk = rowSeats.slice(i, i + count);
        const isConsecutive = chunk.every(
          (seat, idx) => idx === 0 || seat.id === chunk[idx - 1].id + 1
        );

        if (isConsecutive) {
          //Book these seats
          for (let s of chunk) {
            await pool.query("UPDATE seats SET booked = true WHERE id = $1", [
              s.id,
            ]);
          }

          return res.json({
            success: true,
            bookedSeats: chunk.map((s) => s.id),
            inSameRow: true,
          });
        }
      }
    }

    //Fallback: Book nearest available seats
    const fallbackSeats = availableSeats.slice(0, count);
    for (let s of fallbackSeats) {
      await pool.query("UPDATE seats SET booked = true WHERE id = $1", [s.id]);
    }

    res.json({
      success: true,
      bookedSeats: fallbackSeats.map((s) => s.id),
      inSameRow: false,
      fallback: true,
    });
  } catch (err) {
    res.status(500).json({error: "Server error during booking."});
  }
});

//Reset all seats (admin/dev tool)
app.post("/reset", async (req, res) => {
  try {
    await pool.query("UPDATE seats SET booked = false");
    res.json({success: true, message: "All seats have been reset."});
  } catch (err) {
    res.status(500).json({error: "Failed to reset seats."});
  }
});

//Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

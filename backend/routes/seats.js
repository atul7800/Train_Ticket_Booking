const express = require("express");
const pool = require("../db");
const authenticateToken = require("../middleware/authToken");

const router = express.Router();

router.get("/seats", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM seats ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({error: "Failed to fetch seats"});
  }
});

router.post("/book", authenticateToken, async (req, res) => {
  const {count} = req.body;
  const userId = req.user.userId;

  if (!count || count < 1 || count > 7) {
    return res
      .status(400)
      .json({error: "You can book between 1 to 7 seats only."});
  }

  try {
    const result = await pool.query(
      "SELECT * FROM seats WHERE booked = false ORDER BY id ASC"
    );
    //console.log("available rows : ", result);
    const availableSeats = result.rows;

    if (availableSeats.length < count) {
      return res.status(400).json({error: "Not enough available seats."});
    }

    const rows = {};
    availableSeats.forEach((seat) => {
      const row = seat.id <= 70 ? Math.ceil(seat.id / 7) : 11;
      if (!rows[row]) rows[row] = [];
      rows[row].push(seat);
    });

    for (let row in rows) {
      const rowSeats = rows[row];
      for (let i = 0; i <= rowSeats.length - count; i++) {
        const chunk = rowSeats.slice(i, i + count);
        const isConsecutive = chunk.every(
          (seat, idx) => idx === 0 || seat.id === chunk[idx - 1].id + 1
        );
        if (isConsecutive) {
          for (let s of chunk) {
            await pool.query(
              "UPDATE seats SET booked = true, user_id = $1 WHERE id = $2",
              [userId, s.id]
            );
          }
          return res.json({
            success: true,
            bookedSeats: chunk.map((s) => s.id),
            inSameRow: true,
          });
        }
      }
    }

    const fallbackSeats = availableSeats.slice(0, count);
    for (let s of fallbackSeats) {
      await pool.query(
        "UPDATE seats SET booked = true, user_id = $1 WHERE id = $2",
        [userId, s.id]
      );
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

router.post("/reset", async (req, res) => {
  try {
    await pool.query("UPDATE seats SET booked = false, user_id = NULL");
    res.json({success: true, message: "All seats have been reset."});
  } catch (err) {
    res.status(500).json({error: "Failed to reset seats."});
  }
});

module.exports = router;

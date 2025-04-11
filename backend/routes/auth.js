const express = require("express");
const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const {username, password} = req.body;

  try {
    const existing = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({error: "Username already exists"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
      username,
      hashedPassword,
    ]);
    res.json({success: true, message: "Signup successfull"});
  } catch (err) {
    console.log("Unable to signup : ", err);
    res.status(500).json({error: "Signup error"});
  }
});

//login route
router.post("/login", async (req, res) => {
  const {username, password} = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({error: "Incorrect username"});

    const pwdValid = await bcrypt.compare(password, user.password);
    if (!pwdValid) return res.status(401).json({error: "Incorrect password"});

    const loginToken = jwt.sign({userId: user.id}, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({success: true, token: loginToken});
  } catch (error) {
    console.log("Login error : ", error);
    res.status(500).json({error: "Login error"});
  }
});

module.exports = router;

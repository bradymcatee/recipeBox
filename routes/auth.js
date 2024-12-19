const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { auth } = require("../middleware/auth");
const { check, validationResult } = require("express-validator");

// Register first admin for a restaurant
router.post(
  "/register-admin",
  [
    check("email").isEmail(),
    check("password").isLength({ min: 6 }),
    check("restaurantName").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, firstName, lastName, password, restaurantName } = req.body;

      // Start transaction
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        // Create restaurant
        const restaurantResult = await client.query(
          "INSERT INTO restaurants (name) VALUES ($1) RETURNING id",
          [restaurantName]
        );

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create admin user
        const userResult = await client.query(
          `INSERT INTO users (email, password_hash, first_name, last_name, 
          restaurant_id, role) VALUES ($1, $2, $3, $4, $5, 'admin') RETURNING *`,
          [
            email,
            passwordHash,
            firstName,
            lastName,
            restaurantResult.rows[0].id,
          ]
        );

        await client.query("COMMIT");

        // Generate token
        const token = jwt.sign(
          { userId: userResult.rows[0].id },
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
        );

        res.status(201).json({
          token,
          user: userResult.rows[0],
        });
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Register new user (requires auth)
router.post(
  "/register",
  [
    auth,
    [
      check("email").isEmail(),
      check("password").isLength({ min: 6 }),
      check("role").isIn(["line_cook", "chef", "manager"]),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, firstName, lastName, role } = req.body;

      // Check permissions
      if (!req.permissions.can_manage_users) {
        return res
          .status(403)
          .json({ error: "Not authorized to create users" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user with same restaurant_id as creator
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, 
        restaurant_id, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [email, passwordHash, firstName, lastName, req.user.restaurant_id, role]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Login
router.post(
  "/login",
  [check("email").isEmail(), check("password").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Get user
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const user = result.rows[0];

      // Check password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
          restaurantId: user.restaurant_id,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;

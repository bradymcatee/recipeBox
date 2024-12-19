const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const bcrypt = require("bcrypt");

// Input validation middleware
const validateUserInput = (req, res, next) => {
  const { email, password, first_name, last_name, role } = req.body;

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Password requirements
  if (!password || password.length < 8) {
    return res.status(400).json({
      error: "Password must be at least 8 characters long",
    });
  }

  // Role validation - using the user_role ENUM values from schema
  const validRoles = ["admin", "manager", "chef", "line_cook"];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({
      error: "Invalid role. Must be one of: admin, manager, chef, line_cook",
    });
  }

  next();
};

// Get all users with pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const getAllUsers = await pool.query(
      `SELECT id, email, first_name, last_name, restaurant_id, role, created_at 
       FROM users 
       ORDER BY last_name 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const totalUsers = await pool.query("SELECT COUNT(*) FROM users");

    res.json({
      users: getAllUsers.rows,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(totalUsers.rows[0].count / limit),
        total_users: parseInt(totalUsers.rows[0].count),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single user by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await pool.query(
      `SELECT id, email, first_name, last_name, restaurant_id, role, created_at 
       FROM users 
       WHERE id = $1`,
      [id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create user with validation
router.post("/", validateUserInput, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { email, password, first_name, last_name, restaurant_id, role } =
      req.body;

    // Check if email already exists
    const existingUser = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Email already exists" });
    }

    // If restaurant_id is provided, verify it exists
    if (restaurant_id) {
      const restaurantExists = await client.query(
        "SELECT id FROM restaurants WHERE id = $1",
        [restaurant_id]
      );
      if (restaurantExists.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Restaurant not found" });
      }
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashed_password = await bcrypt.hash(password, salt);

    const userResult = await client.query(
      `INSERT INTO users (
        email, password_hash, first_name, last_name, 
        restaurant_id, role
      ) 
      VALUES ($1, $2, $3, $4, $5, $6::user_role) 
      RETURNING id, email, first_name, last_name, restaurant_id, role, created_at`,
      [email, hashed_password, first_name, last_name, restaurant_id, role]
    );

    await client.query("COMMIT");
    res.status(201).json(userResult.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    if (error.code === "22P02") {
      res.status(400).json({ error: "Invalid role value" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  } finally {
    client.release();
  }
});

// Update user
router.put("/:id", validateUserInput, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const { email, password, first_name, last_name, restaurant_id, role } =
      req.body;

    // Check if user exists
    const existingUser = await client.query(
      "SELECT id FROM users WHERE id = $1",
      [id]
    );

    if (existingUser.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "User not found" });
    }

    // Check if email is already taken by another user
    const emailCheck = await client.query(
      "SELECT id FROM users WHERE email = $1 AND id != $2",
      [email, id]
    );

    if (emailCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Email already exists" });
    }

    // If restaurant_id is provided, verify it exists
    if (restaurant_id) {
      const restaurantExists = await client.query(
        "SELECT id FROM restaurants WHERE id = $1",
        [restaurant_id]
      );
      if (restaurantExists.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Restaurant not found" });
      }
    }

    let updateQuery = `
      UPDATE users 
      SET email = $1, first_name = $2, last_name = $3, 
          restaurant_id = $4, role = $5::user_role
    `;
    const queryParams = [email, first_name, last_name, restaurant_id, role];

    // Only update password if provided
    if (password) {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashed_password = await bcrypt.hash(password, salt);
      updateQuery += ", password_hash = $6";
      queryParams.push(hashed_password);
    }

    updateQuery +=
      " WHERE id = $" +
      (queryParams.length + 1) +
      " RETURNING id, email, first_name, last_name, restaurant_id, role, created_at";
    queryParams.push(id);

    const result = await client.query(updateQuery, queryParams);

    await client.query("COMMIT");
    res.json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    if (error.code === "22P02") {
      res.status(400).json({ error: "Invalid role value" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  } finally {
    client.release();
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;

    // Check if user exists
    const existingUser = await client.query(
      "SELECT id FROM users WHERE id = $1",
      [id]
    );

    if (existingUser.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "User not found" });
    }

    await client.query("DELETE FROM users WHERE id = $1", [id]);

    await client.query("COMMIT");
    res.status(204).send();
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
});

module.exports = router;

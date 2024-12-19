const jwt = require("jsonwebtoken");
const pool = require("../db");

const ROLE_PERMISSIONS = {
  admin: {
    can_manage_users: true,
    can_manage_recipes: true,
    can_delete_recipes: true,
    can_view_all: true,
  },
  manager: {
    can_manage_recipes: true,
    can_delete_recipes: true,
    can_view_all: true,
  },
  chef: {
    can_manage_recipes: true,
    can_view_all: true,
  },
  line_cook: {
    can_view_recipes: true,
  },
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      "SELECT id, email, restaurant_id, role FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      throw new Error();
    }

    req.user = result.rows[0];
    req.permissions = ROLE_PERMISSIONS[req.user.role];
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate" });
  }
};

module.exports = { auth: authMiddleware, ROLE_PERMISSIONS };

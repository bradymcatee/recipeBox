// routes/recipes.js
const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const pool = require("../db");

// Get all recipes (filtered by restaurant)
router.get("/", auth, async (req, res) => {
  try {
    const recipes = await pool.query(
      "SELECT * FROM recipes WHERE restaurant_id = $1",
      [req.user.restaurant_id]
    );
    res.json(recipes.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single recipe (with restaurant check)
router.get("/:id", auth, async (req, res) => {
  try {
    const recipe = await pool.query(
      "SELECT * FROM recipes WHERE id = $1 AND restaurant_id = $2",
      [req.params.id, req.user.restaurant_id]
    );

    if (recipe.rows.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const ingredients = await pool.query(
      "SELECT description FROM recipe_ingredients WHERE recipe_id = $1 ORDER BY sort_order",
      [req.params.id]
    );

    res.json({
      ...recipe.rows[0],
      ingredients: ingredients.rows.map((row) => row.description),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create recipe
router.post("/", auth, async (req, res) => {
  if (!req.permissions.can_manage_recipes) {
    return res.status(403).json({ error: "Not authorized" });
  }

  try {
    const {
      name,
      category,
      station,
      instructions,
      yield: recipeYield,
      ingredients,
    } = req.body;

    // Insert recipe into `recipes` table
    const recipe = await pool.query(
      `INSERT INTO recipes (name, category, station, instructions, yield, restaurant_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        name,
        category,
        station,
        instructions,
        recipeYield,
        req.user.restaurant_id,
      ]
    );

    const recipeId = recipe.rows[0].id;

    // Insert ingredients into `recipe_ingredients` table
    if (ingredients && Array.isArray(ingredients)) {
      const ingredientPromises = ingredients.map((ingredient, index) => {
        return pool.query(
          `INSERT INTO recipe_ingredients (recipe_id, description, sort_order) 
           VALUES ($1, $2, $3)`,
          [recipeId, ingredient, index]
        );
      });

      await Promise.all(ingredientPromises);
    }

    res.status(201).json({ success: true, recipeId });
  } catch (error) {
    console.error("Error creating recipe:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update recipe
router.put("/:id", auth, async (req, res) => {
  if (!req.permissions.can_manage_recipes) {
    return res.status(403).json({ error: "Not authorized" });
  }

  try {
    const {
      name,
      category,
      station,
      instructions,
      yield: recipeYield,
      ingredients,
    } = req.body;

    // Update recipe details in `recipes` table
    const recipe = await pool.query(
      `UPDATE recipes 
       SET name = $1, category = $2, station = $3, instructions = $4, yield = $5
       WHERE id = $6 AND restaurant_id = $7 
       RETURNING id`,
      [
        name,
        category,
        station,
        instructions,
        recipeYield,
        req.params.id,
        req.user.restaurant_id,
      ]
    );

    if (recipe.rows.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const recipeId = recipe.rows[0].id;

    // Clear old ingredients
    await pool.query(`DELETE FROM recipe_ingredients WHERE recipe_id = $1`, [
      recipeId,
    ]);

    // Insert updated ingredients into `recipe_ingredients` table
    if (ingredients && Array.isArray(ingredients)) {
      const ingredientPromises = ingredients.map((ingredient, index) => {
        return pool.query(
          `INSERT INTO recipe_ingredients (recipe_id, description, sort_order) 
           VALUES ($1, $2, $3)`,
          [recipeId, ingredient, index]
        );
      });

      await Promise.all(ingredientPromises);
    }

    res.json({ success: true, recipeId });
  } catch (error) {
    console.error("Error updating recipe:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete recipe
router.delete("/:id", auth, async (req, res) => {
  if (!req.permissions.can_delete_recipes) {
    return res.status(403).json({ error: "Not authorized" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM recipes WHERE id = $1 AND restaurant_id = $2 RETURNING *",
      [req.params.id, req.user.restaurant_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

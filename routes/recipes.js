const express = require("express");
const router = express.Router();
const pool = require("../db.js");

// Create recipe
router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { name, instructions, yield, category, station, ingredients } =
      req.body;

    // Create recipe
    const recipeResult = await client.query(
      "INSERT INTO recipes (name, instructions, yield, category, station) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [name, instructions, yield, category, station]
    );

    const recipeId = recipeResult.rows[0].id;

    // Add ingredients
    if (ingredients && ingredients.length > 0) {
      for (let i = 0; i < ingredients.length; i++) {
        await client.query(
          "INSERT INTO recipe_ingredients (recipe_id, description, sort_order) VALUES ($1, $2, $3)",
          [recipeId, ingredients[i], i + 1]
        );
      }
    }

    await client.query("COMMIT");
    res.json({ id: recipeId });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Get all recipes
router.get("/", async (req, res) => {
  try {
    const getAllRecipes = await pool.query(
      "SELECT * FROM recipes ORDER BY name"
    );
    res.json(getAllRecipes.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get a recipe with its ingredients
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const recipeResult = await pool.query(
      "SELECT * FROM recipes WHERE id = $1",
      [id]
    );

    if (recipeResult.rows.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const ingredientsResult = await pool.query(
      "SELECT description FROM recipe_ingredients WHERE recipe_id = $1 ORDER BY sort_order",
      [id]
    );

    const recipe = recipeResult.rows[0];
    recipe.ingredients = ingredientsResult.rows.map((row) => row.description);

    res.json(recipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update a recipe
router.put("/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const { name, instructions, yield, category, station, ingredients } =
      req.body;

    // Update recipe
    const updateRecipe = await client.query(
      "UPDATE recipes SET name = $1, instructions = $2, yield = $3, category = $4, station = $5 WHERE id = $6 RETURNING *",
      [name, instructions, yield, category, station, id]
    );

    if (updateRecipe.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Recipe not found" });
    }

    // Delete existing ingredients
    await client.query("DELETE FROM recipe_ingredients WHERE recipe_id = $1", [
      id,
    ]);

    // Add new ingredients
    if (ingredients && ingredients.length > 0) {
      for (let i = 0; i < ingredients.length; i++) {
        await client.query(
          "INSERT INTO recipe_ingredients (recipe_id, description, sort_order) VALUES ($1, $2, $3)",
          [id, ingredients[i], i + 1]
        );
      }
    }

    await client.query("COMMIT");
    res.json(updateRecipe.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Delete a recipe
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM recipes WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

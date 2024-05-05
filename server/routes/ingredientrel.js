const express = require("express");
const router = express.Router();
const pool = require("../db.js");

//create ingredientrel
router.post("/", async (req, res) => {
  try {
    const { recipe_id, ingredient_id, amount } = req.body;
    const newRel = await pool.query(
      "INSERT INTO ingredientrel(recipe_id, ingredient_id, amount) VALUES($1, $2, $3) RETURNING *",
      [recipe_id, ingredient_id, amount]
    );
    res.json(newRel.rows[0]);
  } catch (error) {
    console.log(error.message);
  }
});
//get all ingredientrels
router.get("/", async (req, res) => {
  try {
    const getAllRels = await pool.query("SELECT * FROM ingredientrel");
    res.json(getAllRels.rows);
  } catch (error) {
    console.log(error.message);
  }
});

//get ingredients for recipe
router.get("/recipes/:id/ingredients", async (req, res) => {
  try {
    const { id } = req.params;
    const ingredients = await pool.query(
      `SELECT r.recipe_id, r.name as recipe_name, i.ingredient_id, i.name as ingredient_name, ir.amount 
      FROM recipes r 
      JOIN ingredientrel ir ON r.recipe_id = ir.recipe_id 
      JOIN ingredients i ON ir.ingredient_id = i.ingredient_id 
      WHERE r.recipe_id = $1;`,
      [id]
    );
    res.json(ingredients.rows);
  } catch (error) {
    console.log(error.message);
  }
});
//get recipes for ingredients
router.get("/ingredients/:id/recipes", async (req, res) => {
  try {
    const { id } = req.params;
    const ingredients = await pool.query(
      `SELECT r.recipe_id, r.name as recipe_name, i.ingredient_id, i.name as ingredient_name, ir.amount 
      FROM recipes r JOIN ingredientrel ir 
      ON r.recipe_id = ir.recipe_id 
      JOIN ingredients i ON ir.ingredient_id = i.ingredient_id WHERE i.ingredient_id = $1;`,
      [id]
    );
    res.json(ingredients.rows);
  } catch (error) {
    console.log(error.message);
  }
});
//update an ingredientrel
router.put(
  "/recipes/:recipe_id/ingredients/:ingredient_id",
  async (req, res) => {
    const { recipe_id, ingredient_id } = req.params;
    const { amount } = req.body;
    try {
      const updateQuery = `
      UPDATE ingredientrel
      SET amount = $1
      WHERE recipe_id = $2 AND ingredient_id = $3;
    `;
      await pool.query(updateQuery, [amount, recipe_id, ingredient_id]);
      res.send("Ingredient amount updated successfully.");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
//delete an ingredientrel

router.delete(
  "/recipes/:recipe_id/ingredients/:ingredient_id",
  async (req, res) => {
    const { recipe_id, ingredient_id } = req.params;
    try {
      const deleteQuery = `
      DELETE FROM ingredientrel
      WHERE recipe_id = $1 AND ingredient_id = $2;
    `;
      await pool.query(deleteQuery, [recipe_id, ingredient_id]);
      res.send("Ingredient deleted successfully.");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
module.exports = router;

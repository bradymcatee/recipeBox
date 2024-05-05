const express = require("express");
const router = express.Router();
const pool = require("../db.js");

//create ingredient
router.post("/", async (req, res) => {
  try {
    const { name, category, price } = req.body;
    const newIngredient = await pool.query(
      "INSERT INTO ingredients(name, category, price) VALUES($1, $2, $3) RETURNING *",
      [name, category, price]
    );
    res.json(newIngredient.rows[0]);
  } catch (error) {
    console.log(error.message);
  }
});
//get all ingredients
router.get("/", async (req, res) => {
  try {
    const getAllIngredients = await pool.query("SELECT * FROM ingredients");
    res.json(getAllIngredients.rows);
  } catch (error) {
    console.log(error.message);
  }
});

//get an ingredient
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const ingredient = await pool.query(
      "SELECT * FROM ingredients WHERE ingredient_id=$1",
      [id]
    );
    res.json(ingredient.rows);
  } catch (error) {
    console.log(error.message);
  }
});

//update an ingredient
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price } = req.body;
    const updateIngredient = await pool.query(
      "UPDATE ingredients SET name=$1, category=$2, price=$3 WHERE ingredient_id=$4",
      [name, category, price, id]
    );
    res.json(`Ingredient with id: ${id} successfully updated`);
  } catch (error) {
    console.log(error.message);
  }
});

//delete an ingredient
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteIngredient = await pool.query(
      "DELETE FROM ingredients WHERE ingredient_id=$1",
      [id]
    );
    res.json(`Ingredient with id: ${id} successfully deleted`);
  } catch (error) {
    console.log(error.message);
  }
});

module.exports = router;

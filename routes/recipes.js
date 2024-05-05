const express = require("express");
const router = express.Router();
const pool = require("../db.js");

//create recipe
router.post("/", async (req, res) => {
  try {
    const { name, category, station, instructions, yield } = req.body;
    const newRecipe = await pool.query(
      "INSERT INTO recipes(name, category, station, instructions, yield ) VALUES($1, $2, $3, $4, $5) RETURNING *",
      [name, category, station, instructions, yield]
    );
    res.json(newRecipe.rows[0]);
  } catch (error) {
    console.log(error.message);
  }
});

//get all recipes
router.get("/", async (req, res) => {
  try {
    const getAllRecipes = await pool.query("SELECT * FROM recipes");
    res.json(getAllRecipes.rows);
  } catch (error) {
    console.log(error.message);
  }
});
//get a recipe
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await pool.query(
      "SELECT * FROM recipes WHERE recipe_id=$1",
      [id]
    );
    res.json(recipe.rows);
  } catch (error) {
    console.log(error.message);
  }
});

//update a recipe
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, station, instructions, yield } = req.body;
    const updateRecipe = await pool.query(
      "UPDATE recipes SET name=$1, category=$2, station=$3, instructions=$4, yield=$5 WHERE recipe_id=$6",
      [name, category, station, instructions, yield, id]
    );
    res.json(`Recipe with id: ${id} successfully updated`);
  } catch (error) {
    console.log(error.message);
  }
});
//delete a recipe

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteRecipe = await pool.query(
      "DELETE FROM recipes WHERE recipe_id=$1",
      [id]
    );
    res.json(`Recipe with id: ${id} successfully deleted`);
  } catch (error) {
    console.log(error.message);
  }
});

module.exports = router;

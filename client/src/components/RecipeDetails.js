import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const RecipeDetails = () => {
  const [recipe, setRecipe] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const { id } = useParams();

  const fetchRecipeAndIngredients = useCallback(async () => {
    try {
      const recipeResponse = await axios.get(`/recipes/${id}`);
      setRecipe(recipeResponse.data[0]);
      console.log("Recipe data:", recipeResponse.data[0]);

      const ingredientsResponse = await axios.get(
        `/ingredientrel/recipes/${id}/ingredients`
      );
      setIngredients(ingredientsResponse.data);
      console.log("Ingredients data:", ingredientsResponse.data);
    } catch (error) {
      console.error("Error fetching recipe details:", error);
    }
  }, [id]);

  useEffect(() => {
    fetchRecipeAndIngredients();
  }, [fetchRecipeAndIngredients]);

  if (!recipe) {
    return <div>Loading...</div>;
  }
  return (
    <div className="container mt-4">
      <h2>{recipe.name}</h2>
      <p>
        <strong>Category:</strong> {recipe.category}
      </p>
      <p>
        <strong>Station:</strong> {recipe.station}
      </p>
      <p>
        <strong>Yield:</strong> {recipe.yield}
      </p>
      <p>
        <strong>Instructions:</strong> {recipe.instructions}
      </p>
      <h3>Ingredients</h3>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Ingredient</th>
            <th scope="col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ingredient, index) => (
            <tr key={index}>
              <td>{ingredient.ingredient_name}</td>
              <td>{ingredient.amount}g</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecipeDetails;

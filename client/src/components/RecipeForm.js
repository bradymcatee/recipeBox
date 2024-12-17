import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const RecipeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState({
    name: "",
    category: "",
    station: "",
    instructions: "",
    yield: "",
    ingredients: "",
  });

  useEffect(() => {
    if (id) {
      fetchRecipe();
    }
  }, [id]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/recipes/${id}`);
      const fetchedRecipe = response.data;
      setRecipe({
        ...fetchedRecipe,
        ingredients: fetchedRecipe.ingredients.join("\n"),
      });
    } catch (error) {
      console.error("Error fetching recipe:", error);
      alert("Error loading recipe");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const ingredientsList = recipe.ingredients
        .split("\n")
        .filter((line) => line.trim());

      const recipeData = {
        ...recipe,
        ingredients: ingredientsList,
      };

      if (id) {
        await axios.put(`/recipes/${id}`, recipeData);
      } else {
        await axios.post("/recipes", recipeData);
      }

      navigate("/recipes");
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Error saving recipe");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mt-4">Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{id ? "Edit Recipe" : "Create Recipe"}</h2>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            value={recipe.name}
            onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={recipe.category}
            onChange={(e) => setRecipe({ ...recipe, category: e.target.value })}
          >
            <option value="">Choose...</option>
            <option value="Sauce">Sauce</option>
            <option value="Entree">Entree</option>
            <option value="Dessert">Dessert</option>
            <option value="Pasta">Pasta</option>
            <option value="Grain">Grain</option>
            <option value="Vegetable">Vegetable</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Station</label>
          <input
            type="text"
            className="form-control"
            value={recipe.station}
            onChange={(e) => setRecipe({ ...recipe, station: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Ingredients</label>
          <textarea
            className="form-control"
            rows="8"
            value={recipe.ingredients}
            onChange={(e) =>
              setRecipe({ ...recipe, ingredients: e.target.value })
            }
            placeholder="Enter each ingredient on a new line"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Instructions</label>
          <textarea
            className="form-control"
            rows="4"
            value={recipe.instructions}
            onChange={(e) =>
              setRecipe({ ...recipe, instructions: e.target.value })
            }
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Yield</label>
          <input
            type="text"
            className="form-control"
            value={recipe.yield}
            onChange={(e) => setRecipe({ ...recipe, yield: e.target.value })}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : id ? "Update Recipe" : "Create Recipe"}
        </button>
      </form>
    </div>
  );
};

export default RecipeForm;
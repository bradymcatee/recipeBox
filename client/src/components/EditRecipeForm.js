import React, { Fragment, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const EditRecipeForm = () => {
  const { recipeId } = useParams();
  const [ingredients, setIngredients] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deletedIngredients, setDeletedIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    category: "",
    price: "",
  });
  // Initialize recipe state with default structure
  const [recipe, setRecipe] = useState({
    name: "",
    category: "",
    station: "",
    instructions: "",
    yield: "",
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const recipeResponse = await axios.get(
          `http://localhost:9000/recipes/${recipeId}`
        );
        if (recipeResponse.data) {
          setRecipe(recipeResponse.data[0]);
        }

        const ingredientsResponse = await axios.get(
          `http://localhost:9000/ingredientrel/recipes/${recipeId}/ingredients`
        );
        const existingIngredients = ingredientsResponse.data.map((ing) => ({
          ...ing,
          status: "existing",
        }));
        setIngredients(existingIngredients);

        const allIngredientsResponse = await axios.get(
          "http://localhost:9000/ingredients"
        );
        setAllIngredients(allIngredientsResponse.data);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    fetchData();
  }, [recipeId]);

  const handleRecipeChange = (event) => {
    const { name, value } = event.target;
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      [name]: value,
    }));
  };
  const handleIngredientSelect = (index, event) => {
    const value = event.target.value;
    if (value === "new") {
      setShowModal(true); // This should trigger the modal to open
    } else {
      handleIngredientChange(index, event); // Handle changing the ingredient ID
    }
  };

  const handleIngredientChange = (index, event) => {
    const updatedIngredients = [...ingredients];
    const { name, value } = event.target;

    // Mark ingredient as updated if it already exists
    if (updatedIngredients[index].status === "existing" && name === "amount") {
      updatedIngredients[index].status = "updated";
    }

    updatedIngredients[index][name] = value;
    setIngredients(updatedIngredients);
  };
  const handleNewIngredientChange = (event) => {
    const { name, value } = event.target;
    setNewIngredient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const saveNewIngredient = async () => {
    try {
      const response = await axios.post(
        "http://localhost:9000/ingredients",
        newIngredient
      );
      setAllIngredients((prev) => [...prev, response.data]);
      setShowModal(false);
    } catch (error) {
      console.error("Error adding ingredient:", error);
      alert("Failed to add ingredient");
    }
  };
  const addIngredientField = () => {
    setIngredients((prev) => [
      ...prev,
      { ingredientId: "", amount: "", status: "new" }, // New ingredient starts with 'new' status
    ]);
  };
  const removeIngredientField = (index) => {
    const ingredient = ingredients[index];
    // Check if it's an existing ingredient that has been saved in the database
    if (ingredient.ingredient_id) {
      setDeletedIngredients((prev) => [...prev, ingredient.ingredient_id]); // Track ID for deletion
    }
    // Remove from UI immediately
    setIngredients((prev) => prev.filter((_, idx) => idx !== index));
  };
  const processDeletions = async () => {
    try {
      const deletePromises = deletedIngredients.map((ingredient_id) =>
        axios.delete(
          `http://localhost:9000/ingredientrel/recipes/${recipe.recipe_id}/ingredients/${ingredient_id}`
        )
      );
      await Promise.all(deletePromises);
      setDeletedIngredients([]); // Clear the deletion tracker after processing
    } catch (error) {
      console.error("Error processing deletions:", error);
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const updateRecipePromise = axios.put(
      `http://localhost:9000/recipes/${recipeId}`,
      recipe
    );
    const postPromises = ingredients
      .filter((ing) => ing.status === "new")
      .map((ing) =>
        axios.post(`http://localhost:9000/ingredientrel`, {
          recipe_id: recipeId,
          ingredient_id: ing.ingredientId,
          amount: ing.amount,
        })
      );
    const updatePromises = ingredients
      .filter((ing) => ing.status === "updated")
      .map((ing) =>
        axios.put(
          `http://localhost:9000/ingredientrel/recipes/${recipe.recipe_id}/ingredients/${ing.ingredient_id}`,
          {
            amount: ing.amount,
          }
        )
      );

    try {
      // Execute all the promises for POST, PUT, DELETE
      await Promise.all([
        updateRecipePromise,
        ...postPromises,
        ...updatePromises,
      ]);
      await processDeletions();
      alert("Recipe and ingredients updated successfully!");
    } catch (error) {
      console.error("Failed to update recipe and ingredients:", error);
      alert(
        "Failed to update the recipe and ingredients. Error: " + error.message
      );
    }
  };

  return (
    <Fragment>
      <div className="container">
        <h2 className="text-center mt-5">Edit Recipe</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="recipeName" className="form-label">
              Name:
            </label>
            <input
              type="text"
              className="form-control"
              id="recipeName"
              name="name"
              value={recipe.name}
              placeholder="Enter recipe name"
              onChange={handleRecipeChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="category" className="form-label">
              Category:
            </label>
            <select
              className="form-select"
              id="category"
              name="category"
              value={recipe.category}
              onChange={handleRecipeChange}
            >
              <option selected>Choose...</option>
              <option value="Sauce">Sauce</option>
              <option value="Entree">Entree</option>
              <option value="Dessert">Dessert</option>
              <option value="Pasta">Pasta</option>
              <option value="Grain">Grain</option>
              <option value="Vegetable">Vegetable</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="station" className="form-label">
              Station:
            </label>
            <input
              type="text"
              className="form-control"
              id="station"
              name="station"
              value={recipe.station}
              placeholder="Enter cooking station"
              onChange={handleRecipeChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="instructions" className="form-label">
              Instructions:
            </label>
            <textarea
              className="form-control"
              id="instructions"
              name="instructions"
              value={recipe.instructions}
              rows="4"
              placeholder="Enter cooking instructions"
              onChange={handleRecipeChange}
            ></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="yield" className="form-label">
              Yield:
            </label>
            <input
              type="text"
              className="form-control"
              id="yield"
              name="yield"
              value={recipe.yield}
              placeholder="Enter yield (e.g., number of servings)"
              onChange={handleRecipeChange}
            />
          </div>
          <h3>Ingredients</h3>
          {ingredients.map((ingredient, index) => (
            <div key={index} className="mb-3">
              <label htmlFor={`ingredient-${index}`} className="form-label">
                Ingredient:
              </label>
              <select
                className="form-select"
                id={`ingredient-${index}`}
                name="ingredientId"
                value={ingredient.ingredient_id}
                onChange={(event) => handleIngredientSelect(index, event)}
              >
                <option value="">Select Ingredient</option>
                {allIngredients.map((ing) => (
                  <option key={ing.ingredient_id} value={ing.ingredient_id}>
                    {ing.name}
                  </option>
                ))}
                <option value="new">Add New Ingredient</option>
              </select>
              <label htmlFor={`amount-${index}`} className="form-label mt-2">
                Amount (grams):
              </label>
              <input
                type="number"
                className="form-control"
                id={`amount-${index}`}
                name="amount"
                value={ingredient.amount}
                onChange={(event) => handleIngredientChange(index, event)}
                placeholder="Enter amount in grams"
              />
              {ingredients.length > 1 && (
                <button
                  type="button"
                  className="btn btn-danger mt-2"
                  onClick={() => removeIngredientField(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <div className="d-grid gap-2 d-md-flex justify-content-md-start">
            <button
              type="button"
              className="btn btn-primary me-md-2"
              onClick={addIngredientField}
            >
              Add Ingredient
            </button>
            <button type="submit" className="btn btn-success">
              Submit Recipe
            </button>
          </div>
        </form>
        <div
          className={`modal ${showModal ? "d-block" : "d-none"}`}
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Ingredient</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control mb-3"
                  name="name"
                  placeholder="Ingredient Name"
                  value={newIngredient.name}
                  onChange={handleNewIngredientChange}
                />
                <input
                  type="text"
                  className="form-control mb-3"
                  name="category"
                  placeholder="Category"
                  value={newIngredient.category}
                  onChange={handleNewIngredientChange}
                />
                <input
                  type="text"
                  className="form-control mb-3"
                  name="price"
                  placeholder="Price"
                  value={newIngredient.price}
                  onChange={handleNewIngredientChange}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={saveNewIngredient}
                >
                  Save Ingredient
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default EditRecipeForm;

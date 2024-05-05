import React, { Fragment, useState, useEffect } from "react";
import axios from "axios";

const RecipeInputForm = () => {
  const [ingredients, setIngredients] = useState([
    { ingredientId: "", amount: "" },
  ]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    category: "",
    price: "",
  });
  const [recipe, setRecipe] = useState({
    name: "",
    category: "",
    station: "",
    instructions: "",
    yield: "",
  });
  const handleRecipeChange = (event) => {
    const { name, value } = event.target;
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      [name]: value,
    }));
  };
  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await axios.get("http://localhost:9000/ingredients");
      setAllIngredients(response.data);
    } catch (error) {
      console.log(error.message);
    }
  };
  // Function to handle change in ingredients (both id and amount)
  const handleIngredientChange = (index, event) => {
    const values = [...ingredients];
    if (event.target.name === "ingredientId") {
      if (event.target.value === "new") {
        setShowModal(true);
        values[index].ingredientId = "";
      } else {
        values[index].ingredientId = event.target.value;
      }
    } else {
      values[index].amount = event.target.value;
    }
    setIngredients(values);
  };
  const handleNewIngredientChange = (event) => {
    setNewIngredient({
      ...newIngredient,
      [event.target.name]: event.target.value,
    });
  };
  const saveNewIngredient = () => {
    axios
      .post("http://localhost:9000/ingredients", newIngredient)
      .then((response) => {
        alert("Ingredient added successfully!");
        fetchIngredients();
        setShowModal(false);
      })
      .catch((error) => {
        console.error("Error adding ingredient:", error);
        alert("Failed to add ingredient");
      });
  };
  // Function to add new ingredient field
  const addIngredientField = () => {
    setIngredients([...ingredients, { ingredientId: "", amount: "" }]);
  };

  // Function to remove ingredient field
  const removeIngredientField = (index) => {
    const values = [...ingredients];
    values.splice(index, 1);
    setIngredients(values);
  };

  // Example handleSubmit function, adapt it to your actual submission logic
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const recipeResponse = await axios.post(
        "http://localhost:9000/recipes",
        recipe
      );
      const recipeId = recipeResponse.data.recipe_id;
      const ingredientPromises = ingredients.map((ingredient) => {
        if (!ingredient.ingredientId || !ingredient.amount) {
          throw new Error("Incomplete ingredient data");
        }
        return axios.post("http://localhost:9000/ingredientrel", {
          recipe_id: recipeId,
          ingredient_id: parseInt(ingredient.ingredientId, 10),
          amount: parseInt(ingredient.amount, 10),
        });
      });
      await Promise.all(ingredientPromises);
      alert("Recipe and ingredients saved successfully!");
    } catch (error) {
      console.error("Failed to submit recipe:", error);
      alert(
        "Failed to save the recipe and ingredients. Error: " + error.message
      );
    }
  };

  return (
    <Fragment>
      <div className="container">
        <h2 className="text-center mt-5">Add New Recipe</h2>
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
                onChange={(event) => handleIngredientChange(index, event)}
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

export default RecipeInputForm;

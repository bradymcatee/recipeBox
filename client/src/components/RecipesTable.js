import React, { Fragment, useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import NavBar from "./NavBar";

const RecipesTable = () => {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get("/recipes");
        setRecipes(response.data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchRecipes();
  }, []);

  const deleteRecipe = async (id) => {
    try {
      await axios.delete(`/recipes/${id}`);
      setRecipes(recipes.filter((recipe) => recipe.recipe_id !== id));
    } catch (error) {
      console.log("Error deleting recipe:", error);
    }
  };

  return (
    <Fragment>
      <NavBar />
      <div className="container mt-4">
        <h2>Recipes</h2>
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Category</th>
              <th scope="col">Station</th>
              <th scope="col"></th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((recipe) => (
              <tr key={recipe.recipe_id}>
                <td>
                  <Link to={`/recipe/${recipe.recipe_id}`}>{recipe.name}</Link>
                </td>
                <td>{recipe.category}</td>
                <td>{recipe.station}</td>
                <td>
                  <Link
                    to={`/recipes/edit/${recipe.recipe_id}`}
                    className="btn btn-primary btn-sm"
                  >
                    Edit
                  </Link>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target={`#deleteModal${recipe.recipe_id}`}
                  >
                    Delete
                  </button>
                  <div className="modal" id={`deleteModal${recipe.recipe_id}`}>
                    <div className="modal-dialog">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h4 className="modal-title">Are you sure?</h4>
                          <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                          ></button>
                        </div>
                        <div className="modal-body">
                          Do you really want to delete this recipe? This process
                          cannot be undone.
                        </div>
                        <div className="modal-footer">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            data-bs-dismiss="modal"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger"
                            data-bs-dismiss="modal"
                            onClick={() => deleteRecipe(recipe.recipe_id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="vertical-button-group">
          <Link to="/create-recipe" className="btn btn-success mt-5">
            Add New Recipe
          </Link>
          <Link to="/ingredients" className="btn btn-primary mt-5">
            Manage Ingredients
          </Link>
        </div>
      </div>
    </Fragment>
  );
};

export default RecipesTable;

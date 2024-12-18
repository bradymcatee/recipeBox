import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const RecipeCard = () => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/recipes/${id}`);
        setRecipe(response.data);
      } catch (error) {
        console.error("Error fetching recipe:", error);
        alert("Error loading recipe");
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">Recipe not found</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2 className="mb-0">{recipe.name}</h2>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>

        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Details</h5>
                  <dl className="row mb-0">
                    <dt className="col-sm-4">Category</dt>
                    <dd className="col-sm-8">{recipe.category}</dd>

                    <dt className="col-sm-4">Station</dt>
                    <dd className="col-sm-8">{recipe.station}</dd>

                    <dt className="col-sm-4">Yield</dt>
                    <dd className="col-sm-8">{recipe.yield}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="col-md-8">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Instructions</h5>
                  <p className="card-text" style={{ whiteSpace: "pre-line" }}>
                    {recipe.instructions}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Ingredients</h5>
              <ul className="list-group list-group-flush">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="list-group-item">
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 d-flex gap-2">
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/recipes/edit/${id}`)}
            >
              Edit Recipe
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => window.print()}
            >
              Print Recipe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;

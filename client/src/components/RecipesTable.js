import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const RecipesTable = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const categories = [
    "Sauce",
    "Entree",
    "Dessert",
    "Pasta",
    "Grain",
    "Vegetable",
  ];

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/recipes");
      setRecipes(response.data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      // alert("Error loading recipes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) {
      return;
    }

    try {
      await axios.delete(`/recipes/${id}`);
      setRecipes(recipes.filter((recipe) => recipe.id !== id));
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert("Error deleting recipe");
    }
  };

  const handleSort = (field) => {
    setSortDirection((current) => {
      if (sortField === field) {
        return current === "asc" ? "desc" : "asc";
      }
      return "asc";
    });
    setSortField(field);
  };

  const getSortedRecipes = () => {
    return recipes
      .filter((recipe) => {
        const matchesSearch = recipe.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesCategory =
          !filterCategory || recipe.category === filterCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const multiplier = sortDirection === "asc" ? 1 : -1;
        return multiplier * a[sortField].localeCompare(b[sortField]);
      });
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Recipes</h2>
        <div>
          <Link to="/recipes/new" className="btn btn-success me-2">
            Add New Recipe
          </Link>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th
                onClick={() => handleSort("name")}
                style={{ cursor: "pointer" }}
              >
                Name{" "}
                {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("category")}
                style={{ cursor: "pointer" }}
              >
                Category{" "}
                {sortField === "category" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("station")}
                style={{ cursor: "pointer" }}
              >
                Station{" "}
                {sortField === "station" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {getSortedRecipes().map((recipe) => (
              <tr key={recipe.id}>
                <td>
                  <Link to={`/recipe/${recipe.id}`}>{recipe.name}</Link>
                </td>
                <td>{recipe.category}</td>
                <td>{recipe.station}</td>
                <td className="text-end">
                  <Link
                    to={`/recipes/edit/${recipe.id}`}
                    className="btn btn-primary btn-sm me-2"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {recipes.length === 0 && (
        <div className="alert alert-info">
          No recipes found. Add your first recipe to get started!
        </div>
      )}
    </div>
  );
};

export default RecipesTable;

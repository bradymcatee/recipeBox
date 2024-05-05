import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RecipesTable from "./components/RecipesTable";
import RecipeDetails from "./components/RecipeDetails";
import InputRecipe from "./components/InputRecipe";
import EditRecipeForm from "./components/EditRecipeForm";
import IngredientsTable from "./components/IngredientsTable";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<RecipesTable />} index />
          <Route path="/recipe/:id" element={<RecipeDetails />} />
          <Route path="/create-recipe" element={<InputRecipe />} />
          <Route path="/recipes/edit/:recipeId" element={<EditRecipeForm />} />
          <Route path="/ingredients" element={<IngredientsTable />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

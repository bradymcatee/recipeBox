import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import RecipesTable from "./components/RecipesTable";
import RecipeCard from "./components/RecipeCard";
import RecipeForm from "./components/RecipeForm";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirect root to recipes */}
          <Route path="/" element={<Navigate to="/recipes" replace />} />

          {/* Recipe routes */}
          <Route path="/recipes" element={<RecipesTable />} />
          <Route path="/recipe/:id" element={<RecipeCard />} />
          <Route path="/recipes/new" element={<RecipeForm />} />
          <Route path="/recipes/edit/:id" element={<RecipeForm />} />

          {/* 404 route */}
          <Route
            path="*"
            element={
              <div className="container mt-5">
                <h2>404 - Page Not Found</h2>
                <p>The page you're looking for doesn't exist.</p>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

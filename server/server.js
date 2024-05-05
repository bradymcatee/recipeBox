const express = require("express");
const app = express();
const cors = require("cors");

//middleware

app.use(cors());
app.use(express.json());

//routes

const recipes = require("./routes/recipes");
const ingredients = require("./routes/ingredients");
const ingredientrel = require("./routes/ingredientrel");
app.use("/recipes", recipes);
app.use("/ingredients", ingredients);
app.use("/ingredientrel", ingredientrel);

app.listen(9000, () => {
  console.log("Server has started on port 9000");
});

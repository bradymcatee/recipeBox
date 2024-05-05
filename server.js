const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 9000;
const path = require("path");

//middleware

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
}

//routes

const recipes = require("./routes/recipes");
const ingredients = require("./routes/ingredients");
const ingredientrel = require("./routes/ingredientrel");
app.use("/recipes", recipes);
app.use("/ingredients", ingredients);
app.use("/ingredientrel", ingredientrel);
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});
app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});

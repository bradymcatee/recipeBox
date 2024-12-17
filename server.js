const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 9000;
const path = require("path");

// middleware
app.use(cors());
app.use(express.json());

// routes
const recipes = require("./routes/recipes");
app.use("/recipes", recipes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));

  // Handle React routing, return all requests to React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build/index.html"));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something broke!",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});

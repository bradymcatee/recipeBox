CREATE DATABASE recipebox;

CREATE TABLE recipes(
    recipe_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    category VARCHAR(255),
    station VARCHAR(255),
    instructions TEXT,
    yield INTEGER
);

CREATE TABLE ingredients(
    ingredient_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    category VARCHAR(255),
    price INTEGER
);

CREATE TABLE ingredientrel(
    recipe_id INTEGER,
    ingredient_id INTEGER,
    amount INTEGER,
    PRIMARY KEY(recipe_id, ingredient_id),
    FOREIGN KEY(recipe_id)
        REFERENCES recipes(recipe_id)
        ON DELETE CASCADE,
    FOREIGN KEY(ingredient_id)
        REFERENCES ingredients(ingredient_id)
        ON DELETE CASCADE
);
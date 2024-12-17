CREATE DATABASE recipebox;

CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    instructions TEXT,
    yield VARCHAR(100),
    category VARCHAR(100),
    station VARCHAR(100)
);

CREATE TABLE recipe_ingredients (
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    sort_order INTEGER,
    PRIMARY KEY (recipe_id, sort_order)
);
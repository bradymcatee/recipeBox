CREATE DATABASE recipebox;

CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    instructions TEXT,
    yield VARCHAR(100),
    category VARCHAR(100),
    station VARCHAR(100),
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE TABLE recipe_ingredients (
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    sort_order INTEGER,
    PRIMARY KEY (recipe_id, sort_order)
);

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'chef', 'line_cook');

CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
# RecipeBox

RecipeBox is a full-stack application built using the PERN stack (PostgreSQL, Express.js, React.js, and Node.js). Designed for restaurants, it allows users to manage their recipes and associated ingredients through a web interface.

## Features

- **Recipe Management**: Users can create, view, edit, and delete recipes.
- **Ingredient Tracking**: Manage the inventory of ingredients, update quantities, and track usage across different recipes.
- **Responsive Design**: The interface is fully responsive and works on various devices, ensuring accessibility from anywhere.

## Live Demo

Check out the live demo of recipeBox [here on Heroku](https://recipe-box-demo-1e9d214855ea.herokuapp.com/). Explore the functionality without needing to install anything!

## Getting Started

These instructions will guide you on setting up your project locally. To get a local copy up and running follow these simple steps.

### Prerequisites

Before starting, ensure you have the following installed:

- Node.js
- npm
- PostgreSQL

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bradymcatee/recipeBox.git
   ```
2. Install NPM packages:
   ```bash
   cd recipeBox
   npm install
   ```
3. Set up your PostgreSQL database and note your credentials.
4. Create a .env file in your project root and fill in your database details and any other configurations:
   ```plaintext
   DB_USER=yourUsername
   DB_PASSWORD=yourPassword
   DB_HOST=localhost
   DB_PORT=5432
   DB_DATABASE=recipeBox
   ```
5. Use the provided schema and seed files to set up your database tables and initial data.
6. To run both the server and the client simultaneously, navigate back to the root directory and run:
   ```bash
   npm start
   ```

### Usage

Once the application is running, you can navigate to localhost:3000 in your web browser to start managing recipes and ingredients. Add new recipes, modify existing ones, or review your ingredient inventory through intuitive forms and interfaces.

### License

This project is licensed under the MIT License - see the LICENSE file for details.

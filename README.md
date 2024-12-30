# Recipe Box

Recipe Box is a web application that allows restaurants to manage their recipes with user role-based permissions. Built with React, Node.js, Express, and PostgreSQL.

## Live Demo

Check out the live demo of this app here: https://recipecrate.app

## Features

- User authentication and authorization
- Role-based access control (Admin, Manager, Chef, Line Cook)
- Recipe management (create, read, update, delete)
- Restaurant-specific data separation
- Responsive design with Bootstrap

## Tech Stack

**Frontend:**

- React
- React Router
- Axios
- Bootstrap

**Backend:**

- Node.js
- Express
- PostgreSQL
- JWT for authentication
- Bcrypt for password hashing

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Database Setup

```sql
-- Create role enum
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'chef', 'line_cook');

-- Create tables
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

CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    station VARCHAR(255),
    instructions TEXT,
    yield VARCHAR(100),
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE
);
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/recipe-box.git
cd recipe-box
```

2. Install backend dependencies:

```bash
npm install
```

3. Install frontend dependencies:

```bash
cd client
npm install
```

4. Create environment files:
   Backend(.env):

```env
JWT_SECRET=your_secret_key
PG_USER=your_postgres_user
PG_HOST=localhost
PG_DATABASE=recipebox
PG_PASSWORD=your_postgres_password
PG_PORT=5432
PORT=9000
NODE_ENV=development
```

5. Start the development server and frontend (from the root directory):

```bash
npm start
```

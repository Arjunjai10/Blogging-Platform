# MERN Stack Blog Platform

A complete blogging platform built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- User authentication (register, login, JWT)
- Create, read, update, and delete blog posts
- Like and comment on posts
- User profiles
- Image uploads for posts and profiles
- Responsive design with Material-UI

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

### Clone the repository

```bash
git clone <repository-url>
cd Blog
```

### Set up the backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/blog
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
```

4. Create the uploads directory:
```bash
mkdir uploads
```

### Set up the frontend

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Start the backend server

```bash
cd backend
npm run dev
```

The server will run on http://localhost:5000

### Start the frontend development server

```bash
cd frontend
npm start
```

The React app will run on http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user (protected)

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create a post (protected)
- `PUT /api/posts/:id` - Update a post (protected)
- `DELETE /api/posts/:id` - Delete a post (protected)
- `PUT /api/posts/like/:id` - Like/unlike a post (protected)
- `POST /api/posts/comment/:id` - Comment on a post (protected)
- `DELETE /api/posts/comment/:id/:comment_id` - Delete a comment (protected)

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile (protected)
- `PUT /api/users/password/:id` - Update user password (protected)

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Multer for file uploads

### Frontend
- React.js
- React Router for routing
- Material-UI for UI components
- Axios for API requests
- JWT Decode for token handling

## License

This project is licensed under the MIT License.

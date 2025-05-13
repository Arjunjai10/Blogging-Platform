# Blog Backend API

This is the backend API for the MERN stack blogging platform.

## Deployment Instructions

### Render Deployment

1. Create an account on [Render](https://render.com/)
2. Create a new Web Service and connect your GitHub repository
3. Use the following settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Node Version**: 16.x or higher

4. Set the following environment variables in the Render dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `NODE_ENV`: production
   - `PORT`: 5000 (Render will override this with its own port)
   - `ADMIN_SECRET_KEY`: Your admin secret key
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g., https://blog-platform-arjunjai10.vercel.app)
   - `SESSION_SECRET`: Your session secret key

5. Deploy your service

### Important Notes

- The backend uses CORS to allow requests only from specified origins
- Make sure your MongoDB Atlas cluster is properly configured to accept connections from Render
- The API will be available at your Render service URL (e.g., https://blog-backend-api.onrender.com)

# Cookbook App

This is a simple recipe management application. Users can register, login, create their own recipes, view recipe details, add recipes to favorites, and keep track of their search history.

## Features

- User authentication (register and login)
- Create, edit, and delete recipes
- View detailed recipe information
- Add recipes to favorites
- Search and browse recipes by cuisine
- Track search history

## Tech Stack

- **Backend**: Node.js with Express framework, MongoDB database using Mongoose, JWT for authentication, Multer for file uploads
- **Frontend**: React with React Router for navigation, Axios for API calls, Sass for styling

## How to Run

### Prerequisites

- Node.js (version 14 or higher)
- MongoDB (local installation or cloud like MongoDB Atlas)

### Setup Instructions

1. **Clone or download the project** to your local machine.

2. **Set up the Backend**:
   - Open a terminal and navigate to the `backend` folder: `cd backend`
   - Install dependencies: `npm install`
   - Create a `.env` file in the backend folder with your MongoDB connection string:
     ```
     MONGODB_URI=mongodb://localhost:27017/cookbook
     JWT_SECRET=your_secret_key_here
     ```
     (Replace with your actual MongoDB URI and a secure JWT secret)
   - Start the backend server: `npm start`
     - The server will run on http://localhost:5050

3. **Set up the Frontend**:
   - Open another terminal and navigate to the `frontend` folder: `cd frontend`
   - Install dependencies: `npm install`
   - Start the React app: `npm start`
     - The app will open in your browser at http://localhost:3000

### Usage

- Register a new account or login with existing credentials.
- Create new recipes by filling out the recipe form.
- Browse recipes, view details, and add to favorites.
- Edit or delete your own recipes from the "My Recipes" page.

### Notes

- Make sure MongoDB is running before starting the backend.
- The frontend expects the backend to be running on port 5050.
- Uploaded images are stored in the `backend/uploads` folder.

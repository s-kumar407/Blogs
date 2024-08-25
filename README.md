# Blog Web Application

A full-stack blog web application built with ReactJS and Vite for the frontend, Node.js for the backend, and MongoDB for the database. This application allows users to create, read, update, and delete blog posts after logging in or signing up.

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Installation](#installation)
4. [Running the Project](#running-the-project)
5. [API Endpoints](#api-endpoints)
6. [Contributing](#contributing)


## Features

- User authentication (sign up and login)
- Create, read, update, and delete blog posts
- Upload and display featured images
- Responsive design for various devices

## Tech Stack

- **Frontend:** ReactJS, Vite, TailwindCSS, ShadcnUI
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** JWT

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud)

### Frontend

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   
2. Install dependencies:
   npm install

3. Make .env file:
   touch .env   
   
4. Start the frontend server:
   npm run dev
   
### Backend

1. Navigate to the 'backend' directory:
   ```bash
   cd backend

2. Install dependencies:
   npm install
   
3. Create .env file for environment variables:
   touch .env

4. Start the backend server:
   npm start

###  Running the Project

Explain how to run the full project:

```markdown
## Running the Project

1. Make sure MongoDB is running. If using a cloud service, ensure the connection string in your `.env` file is correct.

2. Start the backend server as described above.

3. Start the frontend server as described above.

4. Open `http://localhost:5173` in your browser to access the application.


## API Endpoints

- **POST** `/signup` - Create a new user
- **POST** `/login` - Authenticate user and obtain token
- **GET** `/blog/:id` - Get user-specific blog posts
- **POST** `/bloglist` - Create a new blog post
- **PUT** `/updateBlog/:id` - Update an existing blog post
- **DELETE** `/deleteBlog/:id` - Delete a blog post

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Create a new Pull Request.


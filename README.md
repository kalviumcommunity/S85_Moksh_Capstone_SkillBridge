# SkillBridge

A professional networking platform connecting companies, students, and working professionals to collaborate on real-world projects.

## Overview

SkillBridge is a full-stack web application that bridges the gap between talent and opportunity. It provides a platform where students gain hands-on experience, professionals mentor emerging talent, and companies access fresh perspectives for real-world challenges.

## Features

- **User Profiles**: Create comprehensive profiles for students, professionals, and companies
- **Project Collaboration**: Post and apply for real-world projects and opportunities
- **Smart Connections**: Connect with others based on skills, experience, and career goals
- **Real-time Messaging**: Instant communication with integrated chat system
- **Content Sharing**: Share posts, showcase projects, and build your professional presence
- **Authentication**: Secure login with email/password and Google OAuth
- **Notifications**: Stay updated with real-time notifications
- **Explore Section**: Discover trending content, hashtags, and suggested connections

## Tech Stack

### Frontend
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Hooks
- **Real-time**: Socket.IO Client
- **Authentication**: Google OAuth, JWT
- **Icons**: Lucide React
- **Animations**: Anime.js, Lottie React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcrypt
- **File Upload**: Multer, Cloudinary
- **Real-time**: Socket.IO
- **Validation**: Express Validator

### Deployment
- **Frontend**: Netlify
- **Backend**: Render
- **Database**: MongoDB Atlas
- **CDN**: Cloudinary (image storage)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kalviumcommunity/S85_Moksh_Capstone_SkillBridge.git
   cd S85_Moksh_Capstone_SkillBridge
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Configuration**
   
   **Backend** - Create `backend/.env`:
   ```env
   DB_URI=mongodb://localhost:27017/skillbridge
   JWT_SECRET=your_jwt_secret_key
   FRONTEND_URL=http://localhost:5173
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   ```
   
   **Frontend** - Create `frontend/.env` (optional):
   ```env
   VITE_API_URL=http://localhost:5000
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   Server runs on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   Application runs on `http://localhost:5173`

### Building for Production

**Frontend**:
```bash
cd frontend
npm run build
```

**Backend**:
```bash
cd backend
npm run start:prod
```

## Deployment

### Live Application
- **Frontend**: [https://skillbridgeweb.netlify.app](https://skillbridgeweb.netlify.app)
- **Backend**: [https://s85-moksh-capstone-skillbridge.onrender.com](https://s85-moksh-capstone-skillbridge.onrender.com)

### Deploy Your Own Instance

#### Backend (Render)
1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure build settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start:prod`
   - **Root Directory**: `backend`
4. Add environment variables in Render dashboard

#### Frontend (Netlify)
1. Create a new site on [Netlify](https://netlify.com)
2. Connect your GitHub repository
3. Configure build settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Base Directory**: `frontend`
4. The application automatically detects the environment and uses the correct API URLs

## Project Structure

```
SkillBridge/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Authentication & validation
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   └── app.js          # Server entry point
├── frontend/
│   ├── public/         # Static assets
│   ├── src/
│   │   ├── component/  # React components
│   │   ├── config/     # Configuration files
│   │   ├── utils/      # Utility functions
│   │   └── main.jsx    # Application entry point
│   └── netlify.toml    # Netlify configuration
└── README.md
```

## API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users` - Update user profile
- `GET /api/users/suggested` - Get suggested connections

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/trending` - Get trending posts
- `POST /api/posts/:id/like` - Like/unlike post

### Messages
- `GET /api/messages/conversations` - Get user conversations
- `POST /api/messages` - Send message
- `GET /api/messages/user/:userId` - Get messages with specific user

### Connections
- `GET /api/connections` - Get user connections
- `POST /api/connections/request` - Send connection request
- `PUT /api/connections/accept/:requestId` - Accept connection request

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Contact

**Moksh Sharma**  
Email: vsmokshsharma688@gmail.com  
GitHub: [@kalviumcommunity](https://github.com/kalviumcommunity)

---

*Connecting talent with opportunity, one project at a time.*

# SkillBridge

Live Demo: https://skillbridgeweb.netlify.app  
Backend API: https://s85-moksh-capstone-skillbridge.onrender.com  

## Overview
SkillBridge is a full-stack platform connecting students, professionals, and companies for real-world project collaboration.

## Key Features
- JWT + Google OAuth authentication  
- Real-time messaging (Socket.IO)  
- Project collaboration & connections  
- Content sharing & notifications  
- Scalable MERN architecture  

## Tech Stack
Frontend: React (Vite), Tailwind CSS, Socket.IO  
Backend: Node.js, Express.js, MongoDB, JWT  
Deployment: Netlify, Render, MongoDB Atlas  

## Setup

```bash
git clone https://github.com/kalviumcommunity/S85_Moksh_Capstone_SkillBridge.git
cd S85_Moksh_Capstone_SkillBridge
npm install
cd backend && npm install
cd ../frontend && npm install
```

## Run

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000  

## API Endpoints
- POST `/api/auth/login`, `/api/auth/register`  
- GET `/api/users/me`, PUT `/api/users`  
- GET `/api/posts`, POST `/api/posts`  
- GET `/api/messages/conversations`, POST `/api/messages`  
- POST `/api/connections/request`  

## Contact
Moksh Sharma  
Email: vsmokshsharma688@gmail.com  
LinkedIn: https://linkedin.com/in/moksh59022  

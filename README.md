# 🔁 Skill Swap Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![GitHub top language](https://img.shields.io/github/languages/top/your-username/skill_swap)
![GitHub last commit](https://img.shields.io/github/last-commit/your-username/skill_swap)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

A full-stack web application that connects people to **exchange skills** and knowledge. Whether you're a coder looking to learn guitar 🎸 or a designer wanting to master cooking 🍳 — this platform makes skill-swapping easy and fun!

---
## 🌐 Live Links

- 🧠 **Frontend (Vercel)**: [Skill Swap UI](https://skill-swap-platform-mocha.vercel.app/)
- 🚀 **Backend (Render)**: [Skill Swap API](https://skill-swap-platform-4ng2.onrender.com/api/health)


## 🚀 Features

- 🔐 **User Authentication** (JWT-based)
- 💬 **Skill Exchange Requests** system
- 👤 **Detailed User Profiles**
- 🔎 **Search & Filter** users by skill/location
- 📩 **Real-time Messaging**
- ⚙️ **Admin Dashboard** for full control
- 📱 **Mobile-Responsive** design

---

## 🛠️ Tech Stack

**Frontend**
- ⚛️ React 19 + TypeScript
- 💅 Chakra UI
- 📦 Axios + React Router

**Backend**
- 🧠 Node.js + Express
- 🌿 MongoDB + Mongoose
- 🔐 JWT Auth + Bcrypt
- 📁 Multer for uploads
- 🛡️ Helmet + Rate Limiter

---

##Project Structure 
```
Skill_Swap/
├── backend/                 
│   ├── middleware/         # Authentication, validation
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── utils/              # Helper functions
│   └── server.js           # Entry point
├── frontend/               
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React Context API
│   │   ├── pages/          # Main route pages
│   │   ├── services/       # API calls via Axios
│   │   └── App.tsx
│   └── public/             # Static assets
├── scripts/                # Setup/util scripts
└── package.json
```

## ⚙️ Getting Started

### 📦 Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

### 🚧 Installation

```bash
git clone https://github.com/9A-Ayush/skill_swap.git
cd skill_swap
npm run install-all
npm run setup
```

## 🔑 Environment Setup & Dev Mode
```bash
### Backend `.env`
env
PORT=5000
NODE_ENV=development
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d
```
```bash
### Frontend `.env`
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=Skill Swap
REACT_APP_VERSION=1.0.0
```

##Start Development Server
```bash
# Start both frontend and backend together
npm run dev

# OR start separately
cd backend && npm run server     # Backend (with nodemon)
cd frontend && npm start         # Frontend
```

## 🔌 API Endpoints

### 🔐 Authentication
| Method | Endpoint              | Description               |
|--------|-----------------------|---------------------------|
| POST   | `/api/auth/register`  | Register a new user       |
| POST   | `/api/auth/login`     | User login                |
| GET    | `/api/auth/me`        | Get current user profile  |
| POST   | `/api/auth/logout`    | Log out current user      |

### 👤 Users
| Method | Endpoint                 | Description                         |
|--------|--------------------------|-------------------------------------|
| GET    | `/api/users/search`      | Search users by skill / location    |
| GET    | `/api/users/:id`         | Get a specific user profile         |
| PUT    | `/api/users/:id`         | Update a user profile               |
| DELETE | `/api/users/:id`         | Delete a user account               |

### 🔄 Swap Requests
| Method | Endpoint                          | Description                       |
|--------|-----------------------------------|-----------------------------------|
| POST   | `/api/swaps`                      | Create a new swap request         |
| GET    | `/api/swaps`                      | Get current user’s swap requests  |
| PUT    | `/api/swaps/:id/accept`           | Accept a swap request             |
| PUT    | `/api/swaps/:id/reject`           | Reject a swap request             |
| PUT    | `/api/swaps/:id/complete`         | Mark a swap request as completed  |

### 🛡️ Admin
| Method | Endpoint                         | Description                        |
|--------|----------------------------------|------------------------------------|
| GET    | `/api/admin/dashboard`           | View platform-wide metrics         |
| GET    | `/api/admin/users`               | List all users                     |
| PUT    | `/api/admin/users/:id/ban`       | Ban or unban a user                |
| GET    | `/api/admin/requests`            | View all swap requests             |







# Skill Swap Platform - Complete Setup Guide

This guide will help you set up the complete Skill Swap platform with both frontend and backend.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env file with your configuration
# See backend/env.example for required variables

# Start development server
npm run dev
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm start
```

## 📋 Detailed Setup

### Backend Configuration

1. **Environment Variables** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/skill_swap
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
```

2. **MongoDB Setup**:
   - Install MongoDB locally, or
   - Use MongoDB Atlas (cloud)
   - Create a database named `skill_swap`

3. **Backend Features**:
   - ✅ User authentication (JWT)
   - ✅ User profiles and skills management
   - ✅ Skill swap requests
   - ✅ Feedback and rating system
   - ✅ Search and discovery
   - ✅ Admin panel
   - ✅ Security features (rate limiting, validation)

### Frontend Configuration

1. **API Connection**:
   - Frontend automatically connects to `http://localhost:5000/api`
   - Set `REACT_APP_API_URL` in frontend environment if needed

2. **Frontend Features**:
   - ✅ React with TypeScript
   - ✅ Chakra UI for styling
   - ✅ React Router for navigation
   - ✅ Axios for API calls
   - ✅ Authentication context

## 🗄️ Database Models

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  location: String,
  profilePhotoUrl: String,
  skillsOffered: [String],
  skillsWanted: [String],
  availability: [String],
  isPublic: Boolean,
  feedbackReceived: [Feedback],
  role: "user" | "admin",
  isBanned: Boolean,
  lastActive: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### SwapRequest
```javascript
{
  _id: ObjectId,
  fromUserId: ObjectId,
  toUserId: ObjectId,
  status: "pending" | "accepted" | "rejected" | "cancelled",
  skillOffered: String,
  skillWanted: String,
  proposedDate: Date,
  proposedLocation: String,
  message: String,
  completedAt: Date,
  feedbackFromRequester: Feedback,
  feedbackFromRecipient: Feedback,
  createdAt: Date,
  updatedAt: Date
}
```

### AdminMessage
```javascript
{
  _id: ObjectId,
  title: String,
  message: String,
  type: "announcement" | "warning" | "info",
  isActive: Boolean,
  expiresAt: Date,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/search` - Search users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user account
- `GET /api/users/:id/requests` - Get user's swap requests
- `GET /api/users/:id/stats` - Get user statistics

### Swap Requests
- `POST /api/swaps` - Create swap request
- `GET /api/swaps` - Get user's swap requests
- `GET /api/swaps/:id` - Get specific swap request
- `PUT /api/swaps/:id/accept` - Accept request
- `PUT /api/swaps/:id/reject` - Reject request
- `PUT /api/swaps/:id/cancel` - Cancel request
- `PUT /api/swaps/:id/complete` - Complete swap
- `POST /api/swaps/:id/feedback` - Submit feedback

### Admin (Admin only)
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - Manage users
- `PUT /api/admin/users/:id/ban` - Ban/unban user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/requests` - Manage swap requests
- `DELETE /api/admin/requests/:id` - Delete request
- `POST /api/admin/messages` - Create announcement
- `GET /api/admin/messages` - Get announcements
- `PUT /api/admin/messages/:id` - Update announcement
- `DELETE /api/admin/messages/:id` - Delete announcement
- `GET /api/admin/reports` - Get analytics

## 🚀 Deployment

### Backend Deployment

#### Railway (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

#### Render
1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables

#### Heroku
1. Create Heroku app
2. Add MongoDB add-on
3. Set environment variables
4. Deploy with Git

### Frontend Deployment

#### Vercel (Recommended)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Deploy automatically

#### Netlify
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: express-validator for request validation
- **Rate Limiting**: Prevent abuse with request limits
- **CORS Protection**: Configured for frontend integration
- **Helmet**: Security headers middleware
- **XSS Protection**: Input sanitization

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📁 Project Structure

```
Skill_Swap/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API route handlers
│   ├── middleware/      # Authentication & validation
│   ├── utils/           # Helper functions
│   ├── server.js        # Main server file
│   ├── package.json     # Dependencies
│   └── README.md        # Backend documentation
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   ├── services/    # API services
│   │   └── App.tsx      # Main app component
│   ├── package.json     # Frontend dependencies
│   └── README.md        # Frontend documentation
├── context.md           # Project requirements
└── SETUP.md            # This file
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Check network connectivity

2. **CORS Errors**:
   - Backend CORS is configured for `http://localhost:3000`
   - Update CORS settings in `server.js` if needed

3. **JWT Token Issues**:
   - Check JWT_SECRET in environment variables
   - Verify token expiration settings

4. **Port Conflicts**:
   - Backend runs on port 5000
   - Frontend runs on port 3000
   - Change ports in respective configs if needed

### Development Tips

1. **Backend Development**:
   - Use `npm run dev` for auto-restart
   - Check console for detailed error messages
   - Use MongoDB Compass for database inspection

2. **Frontend Development**:
   - Use React Developer Tools
   - Check browser console for errors
   - Use Network tab to debug API calls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check existing issues on GitHub
4. Create a new issue with detailed information

---

**Happy Skill Swapping! 🎉** 
# Skill Swap Backend API

A comprehensive Node.js/Express backend for the Skill Swap platform, providing user authentication, skill swapping, and admin management features.

## 🚀 Features

- **User Authentication**: JWT-based authentication with registration and login
- **User Management**: Profile creation, updates, and search functionality
- **Skill Swapping**: Request, accept, reject, and complete skill swaps
- **Feedback System**: Rating and commenting after completed swaps
- **Admin Panel**: User management, platform announcements, and analytics
- **Search & Discovery**: Find users by skills, location, and availability
- **Security**: Rate limiting, input validation, and secure password handling

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/skill_swap
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/login`
Login user
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET `/api/auth/me`
Get current user profile (requires authentication)

### User Endpoints

#### GET `/api/users/search`
Search users by skills, location, availability
```
/api/users/search?skill=javascript&location=NYC&availability=weekends&page=1&limit=10
```

#### GET `/api/users/:id`
Get user profile by ID

#### PUT `/api/users/:id`
Update user profile (requires authentication)
```json
{
  "name": "John Doe",
  "location": "New York",
  "skillsOffered": ["JavaScript", "React"],
  "skillsWanted": ["Python", "Machine Learning"],
  "availability": ["weekends", "evenings"],
  "isPublic": true
}
```

### Swap Request Endpoints

#### POST `/api/swaps`
Create a new swap request
```json
{
  "toUserId": "user_id_here",
  "skillOffered": "JavaScript",
  "skillWanted": "Python",
  "proposedDate": "2024-01-15T14:00:00Z",
  "proposedLocation": "Central Park",
  "message": "Would love to swap skills!"
}
```

#### PUT `/api/swaps/:id/accept`
Accept a swap request

#### PUT `/api/swaps/:id/reject`
Reject a swap request

#### PUT `/api/swaps/:id/cancel`
Cancel a swap request (sender only)

#### PUT `/api/swaps/:id/complete`
Mark swap as completed

#### POST `/api/swaps/:id/feedback`
Leave feedback for completed swap
```json
{
  "rating": 5,
  "comment": "Great experience! Learned a lot."
}
```

### Admin Endpoints

#### GET `/api/admin/dashboard`
Get admin dashboard statistics

#### GET `/api/admin/users`
Get all users with pagination and filters

#### PUT `/api/admin/users/:id/ban`
Ban/unban a user
```json
{
  "isBanned": true
}
```

#### POST `/api/admin/messages`
Create platform announcement
```json
{
  "title": "Platform Update",
  "message": "New features coming soon!",
  "type": "announcement",
  "expiresAt": "2024-02-01T00:00:00Z"
}
```

## 🗄️ Database Models

### User
- Basic info (name, email, password)
- Skills offered and wanted
- Availability preferences
- Public/private profile setting
- Feedback and ratings
- Role (user/admin)

### SwapRequest
- Request details (from/to users, skills)
- Status (pending/accepted/rejected/cancelled)
- Proposed date and location
- Completion tracking
- Feedback from both parties

### AdminMessage
- Platform announcements
- Message types (announcement/warning/info)
- Expiration dates
- Active/inactive status

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: express-validator for request validation
- **Rate Limiting**: Prevent abuse with request limits
- **CORS Protection**: Configured for frontend integration
- **Helmet**: Security headers middleware

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 📦 Scripts

- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
- `npm test`: Run test suite

## 🌐 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skill_swap
JWT_SECRET=your_production_jwt_secret
PORT=5000
```

### Deployment Platforms
- **Railway**: Easy deployment with MongoDB Atlas
- **Render**: Free tier available
- **Heroku**: Add MongoDB add-on
- **Vercel**: Serverless deployment

## 🔧 Development

### Project Structure
```
backend/
├── models/          # Database models
├── routes/          # API route handlers
├── middleware/      # Authentication & validation
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # This file
```

### Adding New Features
1. Create model in `models/` directory
2. Add validation in `middleware/validation.js`
3. Create routes in `routes/` directory
4. Update `server.js` to include new routes
5. Test thoroughly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details 
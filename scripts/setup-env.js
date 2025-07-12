const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Skill Swap environment...\n');

// Create backend .env file
const backendEnvPath = path.join(__dirname, '../backend/.env');
const backendEnvExample = path.join(__dirname, '../backend/env.example');

if (!fs.existsSync(backendEnvPath) && fs.existsSync(backendEnvExample)) {
  fs.copyFileSync(backendEnvExample, backendEnvPath);
  console.log('✅ Backend .env file created from env.example');
} else if (fs.existsSync(backendEnvPath)) {
  console.log('✅ Backend .env file already exists');
} else {
  console.log('⚠️  Backend env.example not found, creating basic .env');
  const basicBackendEnv = `# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/skill_swap

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;
  fs.writeFileSync(backendEnvPath, basicBackendEnv);
}

// Create frontend .env file
const frontendEnvPath = path.join(__dirname, '../frontend/.env');
if (!fs.existsSync(frontendEnvPath)) {
  const frontendEnv = `# Frontend Environment Variables
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=Skill Swap
REACT_APP_VERSION=1.0.0
`;
  fs.writeFileSync(frontendEnvPath, frontendEnv);
  console.log('✅ Frontend .env file created');
} else {
  console.log('✅ Frontend .env file already exists');
}

// Create uploads directory
const uploadsDir = path.join(__dirname, '../backend/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads directory created');
} else {
  console.log('✅ Uploads directory already exists');
}

console.log('\n🎉 Environment setup complete!');
console.log('\n📝 Next steps:');
console.log('1. Update backend/.env with your MongoDB connection string');
console.log('2. Update backend/.env with a secure JWT_SECRET');
console.log('3. Run "npm run dev" to start both frontend and backend');
console.log('4. Frontend will run on http://localhost:3000');
console.log('5. Backend will run on http://localhost:5000'); 
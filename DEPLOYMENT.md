# Deployment Guide

This guide covers deploying the Skill Swap platform to various platforms.

## 🚀 Quick Deployment Options

### 1. Local Development
```bash
# Clone and setup
git clone <repository-url>
cd Skill_Swap
npm run setup
npm run dev
```

### 2. Docker Deployment
```bash
# Using Docker Compose
docker-compose up -d

# Using Docker directly
docker build -t skill-swap .
docker run -p 5000:5000 skill-swap
```

## 🌐 Platform-Specific Deployment

### Heroku Deployment

1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Create Heroku App**
```bash
heroku create your-skill-swap-app
```

3. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set JWT_SECRET=your-super-secret-jwt-key
heroku config:set JWT_EXPIRE=7d
```

4. **Deploy**
```bash
git push heroku main
```

### Vercel Deployment

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Configure for Full-Stack**
Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/build/$1"
    }
  ]
}
```

3. **Deploy**
```bash
vercel --prod
```

### Railway Deployment

1. **Connect Repository**
- Connect your GitHub repository to Railway
- Railway will auto-detect the Node.js app

2. **Set Environment Variables**
```bash
railway variables set NODE_ENV=production
railway variables set MONGODB_URI=your-mongodb-uri
railway variables set JWT_SECRET=your-jwt-secret
```

3. **Deploy**
- Railway will automatically deploy on git push

### DigitalOcean App Platform

1. **Create App**
- Connect your GitHub repository
- Select Node.js as the environment

2. **Configure Build Command**
```bash
npm run install-all && npm run build
```

3. **Configure Run Command**
```bash
node backend/server.js
```

4. **Set Environment Variables**
- Add all required environment variables in the dashboard

### AWS EC2 Deployment

1. **Launch EC2 Instance**
```bash
# Connect to your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip
```

2. **Install Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2
```

3. **Clone and Setup**
```bash
git clone <your-repo-url>
cd Skill_Swap
npm run install-all
npm run build
```

4. **Configure Environment**
```bash
# Create .env file
nano backend/.env
# Add your environment variables
```

5. **Start with PM2**
```bash
pm2 start backend/server.js --name "skill-swap"
pm2 startup
pm2 save
```

6. **Configure Nginx (Optional)**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/skill-swap
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/skill-swap /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**
- Go to [MongoDB Atlas](https://cloud.mongodb.com)
- Create a free cluster

2. **Configure Network Access**
- Add your IP address or `0.0.0.0/0` for all IPs

3. **Create Database User**
- Create a user with read/write permissions

4. **Get Connection String**
- Copy the connection string
- Replace `<password>` with your user password

### Local MongoDB

```bash
# Install MongoDB
sudo apt install mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Connection string
MONGODB_URI=mongodb://localhost:27017/skill_swap
```

## 🔐 Environment Variables

### Required Variables
```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skill_swap

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Optional Variables
```env
# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com

# Admin Email
ADMIN_EMAIL=admin@skillswap.com
```

## 🔒 Security Checklist

- [ ] Use strong JWT secret
- [ ] Enable HTTPS in production
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable Helmet security headers
- [ ] Set up proper MongoDB authentication
- [ ] Configure file upload restrictions
- [ ] Set up monitoring and logging

## 📊 Monitoring

### Health Check Endpoint
```bash
curl https://your-domain.com/api/health
```

### Logs
```bash
# PM2 logs
pm2 logs skill-swap

# Docker logs
docker logs skill-swap-app

# Heroku logs
heroku logs --tail
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm run install-all
        
      - name: Build frontend
        run: npm run build
        
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: ${{ secrets.HEROKU_APP_NAME }}
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
```

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS configuration in server.js
   - Verify frontend URL in environment variables

2. **Database Connection Issues**
   - Verify MongoDB URI
   - Check network access settings
   - Ensure database user has correct permissions

3. **Build Failures**
   - Check Node.js version (requires 16+)
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

4. **Port Conflicts**
   - Change PORT environment variable
   - Check if port is already in use

### Performance Optimization

1. **Enable Compression**
```javascript
const compression = require('compression');
app.use(compression());
```

2. **Add Caching**
```javascript
const cache = require('memory-cache');
app.use('/api/*', (req, res, next) => {
  const key = '__express__' + req.originalUrl;
  const cachedBody = cache.get(key);
  if (cachedBody) {
    res.send(cachedBody);
    return;
  }
  res.sendResponse = res.send;
  res.send = (body) => {
    cache.put(key, body, 300000); // 5 minutes
    res.sendResponse(body);
  };
  next();
});
```

3. **Database Indexing**
- Ensure proper indexes are created
- Monitor query performance

## 📈 Scaling

### Horizontal Scaling
- Use load balancers
- Implement session sharing
- Use Redis for caching

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Use CDN for static assets

## 🔄 Updates and Maintenance

### Update Process
1. Pull latest changes
2. Install new dependencies
3. Run database migrations
4. Test thoroughly
5. Deploy to staging
6. Deploy to production

### Backup Strategy
- Regular database backups
- Version control for code
- Environment variable backups
- File upload backups 
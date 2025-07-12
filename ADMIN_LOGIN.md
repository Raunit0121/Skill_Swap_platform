# Admin Login Guide

## How to Login as Admin

### Option 1: Use the Default Admin Account

The application comes with a default admin account that should be created automatically:

**Email:** `admin@skillswap.com`  
**Password:** `password`

### Option 2: Create Admin User Manually

If the default admin account doesn't exist, you can create one using the script:

1. **Navigate to the project directory:**
   ```bash
   cd Skill_Swap
   ```

2. **Run the admin creation script:**
   ```bash
   node scripts/create-admin.js
   ```

3. **Login with the created credentials:**
   - Email: `admin@skillswap.com`
   - Password: `password`

### Option 3: Create Admin via Docker (if using Docker)

If you're using Docker, the admin user should be created automatically when the MongoDB container initializes:

```bash
docker-compose up
```

### Option 4: Create Admin via Database

You can also manually create an admin user in your database:

1. **Connect to your MongoDB database**
2. **Insert an admin user document:**

```javascript
db.users.insertOne({
  name: "Admin User",
  email: "admin@skillswap.com",
  password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password: password
  role: "admin",
  isPublic: false,
  skillsOffered: ["Administration", "Management"],
  skillsWanted: [],
  availability: ["Weekdays", "Weekends"],
  createdAt: new Date(),
  lastActive: new Date()
});
```

## Steps to Access Admin Panel

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Open your browser and go to:** `http://localhost:3000`

3. **Click "Login" in the navigation**

4. **Enter admin credentials:**
   - Email: `admin@skillswap.com`
   - Password: `password`

5. **After successful login, you'll see an "Admin" link in the navigation**

6. **Click "Admin" to access the admin panel**

## Admin Panel Features

Once logged in as admin, you'll have access to:

- **Dashboard**: View platform statistics
- **User Management**: Ban/unban users, delete accounts
- **Swap Requests**: Monitor and manage swap requests
- **Admin Messages**: Create announcements and warnings
- **Reports & Analytics**: View platform analytics
- **Recent Activity**: Monitor latest activity

## Troubleshooting

### "Admin link not showing"
- Make sure you're logged in with an admin account
- Check that the user has `role: "admin"` in the database
- Try logging out and logging back in

### "Access Denied" message
- Verify the user has admin role in the database
- Check that the backend is running properly
- Ensure the authentication token is valid

### "Cannot connect to database"
- Make sure MongoDB is running
- Check your database connection string in `.env`
- Verify the database exists and is accessible

## Security Notes

⚠️ **Important Security Considerations:**

1. **Change the default password** after first login
2. **Use a strong password** for production environments
3. **Limit admin access** to trusted users only
4. **Monitor admin actions** for security purposes
5. **Regularly review** admin user accounts

## Creating Additional Admin Users

To create additional admin users, you can either:

1. **Use the script** and modify the email/password
2. **Manually update** a regular user's role to "admin" in the database
3. **Use the admin panel** to promote users (if you implement this feature)

## Default Admin Credentials Summary

```
Email: admin@skillswap.com
Password: password
Role: admin
```

Remember to change these credentials in production! 🔐 
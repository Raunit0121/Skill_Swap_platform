// MongoDB initialization script for Docker
db = db.getSiblingDB('skill_swap');

// Create collections
db.createCollection('users');
db.createCollection('swaprequests');
db.createCollection('adminmessages');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "skillsOffered": 1 });
db.users.createIndex({ "skillsWanted": 1 });
db.users.createIndex({ "location": 1 });
db.users.createIndex({ "isPublic": 1 });

db.swaprequests.createIndex({ "fromUserId": 1 });
db.swaprequests.createIndex({ "toUserId": 1 });
db.swaprequests.createIndex({ "status": 1 });
db.swaprequests.createIndex({ "createdAt": 1 });

db.adminmessages.createIndex({ "isActive": 1 });
db.adminmessages.createIndex({ "expiresAt": 1 });

// Create admin user if it doesn't exist
const adminUser = {
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
};

// Check if admin user exists
const existingAdmin = db.users.findOne({ email: adminUser.email });
if (!existingAdmin) {
  db.users.insertOne(adminUser);
  print("✅ Admin user created successfully");
} else {
  print("ℹ️  Admin user already exists");
}

print("✅ MongoDB initialization completed"); 
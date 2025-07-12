
# Skill Swap Platform – Odoo Hackathon '25

## 🧠 Overview

A web application that allows users to exchange skills by offering what they know and requesting what they want to learn. The platform encourages collaborative learning, networking, and personal growth through peer-to-peer skill swaps.

---

## 🚀 Tech Stack

- **Frontend**: React.js (with React Router, Axios, Tailwind or Material UI)
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Authentication**: JWT (JSON Web Tokens)
- **File Uploads**: Multer (optional, for profile photos)
- **Deployment**: Render / Vercel (frontend), Railway / Cyclic / Render (backend)

---

## 👤 User Roles

### 1. Regular User
- Create and update their profile
- List skills they **offer** and **want**
- Set availability (e.g., evenings, weekends)
- Choose to make profile **public or private**
- Browse/search other users by skill
- Send/accept/reject/cancel skill swap requests
- Leave feedback after a swap

### 2. Admin
- View and moderate all user profiles and swap activity
- Reject inappropriate content
- Ban reported users
- Send platform-wide announcements
- Export reports (user activity, swap logs, feedback)

---

## 📋 Core Features

### 🔹 User Profile
- Name, location (optional), profile photo (optional)
- Skills Offered (add/edit/delete)
- Skills Wanted (add/edit/delete)
- Availability (multi-select input)
- Public/Private toggle

### 🔹 Skill Discovery
- Search users by skill
- View public user profiles
- Filter by availability

### 🔹 Swap Requests
- Send skill swap request
- Accept or reject requests
- Cancel pending requests
- View current and past swap history

### 🔹 Feedback & Rating
- Leave rating & short feedback after swap completion
- Users can view feedback given/received

---

## 🗃️ Database Models (MongoDB)

### ✅ User
```js
{
  _id,
  name,
  email,
  passwordHash,
  location,
  profilePhotoUrl,
  skillsOffered: [String],
  skillsWanted: [String],
  availability: [String],
  isPublic: Boolean,
  feedbackReceived: [{ fromUserId, rating, comment }],
  role: "user" | "admin"
}
```

### ✅ SwapRequest
```js
{
  _id,
  fromUserId,
  toUserId,
  status: "pending" | "accepted" | "rejected" | "cancelled",
  createdAt,
  updatedAt
}
```

### ✅ AdminMessage (optional)
```js
{
  _id,
  message,
  createdAt
}
```

---

## 📌 Pages (React Components)

- `/login`, `/register`
- `/dashboard` – user info, skills, requests
- `/profile/:id` – view other profiles
- `/search` – search by skill
- `/requests` – manage swap requests
- `/admin` – (admin only) user and swap management

---

## 🧪 Extra (if time permits)

- Add a real-time chat for accepted swaps (Socket.io)
- Notification bell for request updates
- User badges for frequent swappers

---

## 🏁 Goal

Build a working MVP of the Skill Swap Platform with:
- Authenticated user system
- Profile & skill management
- Skill-based search
- Request & feedback flow
- Admin moderation tools

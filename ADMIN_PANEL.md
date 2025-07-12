# Admin Panel Documentation

## Overview

The Skill Swap admin panel provides comprehensive management tools for platform administrators. It includes user management, swap request monitoring, admin messaging, and analytics.

## Features

### 1. Dashboard Overview
- **Real-time Statistics**: View total users, active users, banned users, total requests, pending requests, and completed swaps
- **Recent Activity**: See the latest user registrations and swap requests
- **Visual Indicators**: Color-coded badges and statistics for easy monitoring

### 2. User Management
- **User List**: View all users with pagination and search functionality
- **Filter Options**: Filter by status (active/banned) and role (user/admin)
- **User Actions**:
  - Ban/Unban users
  - Delete users (with confirmation)
  - Bulk actions for multiple users
- **User Details**: View user information including name, email, role, status, and creation date

### 3. Swap Request Management
- **Request List**: View all swap requests with pagination
- **Filter Options**: Filter by status (pending/accepted/rejected/cancelled/completed) and search by user names
- **Request Actions**:
  - Delete requests (with confirmation)
  - Bulk delete multiple requests
- **Request Details**: View request information including participants, skills, and status

### 4. Admin Messages
- **Message Creation**: Create announcements, warnings, and info messages
- **Message Management**:
  - Edit existing messages
  - Toggle message active/inactive status
  - Set expiration dates
  - Delete messages
- **Message Types**:
  - **Announcement**: General platform announcements (blue)
  - **Warning**: Important warnings or alerts (red)
  - **Info**: Informational messages (green)
- **Bulk Actions**: Delete multiple messages at once

### 5. Reports & Analytics
- **Period Selection**: Choose between 7, 30, or 90 days for reports
- **Top Skills Analysis**:
  - Most offered skills
  - Most wanted skills
- **User Registration Trends**: Daily user registration data
- **Swap Request Trends**: Request status trends over time

### 6. Recent Activity
- **Recent Users**: Latest user registrations
- **Recent Requests**: Latest swap requests with status

## Admin Message Display

Admin messages are automatically displayed to users on:
- Home page
- Dashboard page

### Message Features:
- **Dismissible**: Users can close messages they've read
- **Expiration**: Messages automatically hide when expired
- **Type-based Styling**: Different colors for different message types
- **Responsive**: Works on all device sizes

## Access Control

- **Admin Only**: All admin panel features require admin role
- **Authentication**: Users must be logged in with admin privileges
- **Route Protection**: Admin routes are protected at both frontend and backend

## API Endpoints

### Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics

### Users
- `GET /api/admin/users` - Get users with filters and pagination
- `PUT /api/admin/users/:id/ban` - Ban/unban user
- `DELETE /api/admin/users/:id` - Delete user

### Requests
- `GET /api/admin/requests` - Get swap requests with filters
- `DELETE /api/admin/requests/:id` - Delete swap request

### Messages
- `GET /api/admin/messages` - Get admin messages
- `POST /api/admin/messages` - Create new message
- `PUT /api/admin/messages/:id` - Update message
- `DELETE /api/admin/messages/:id` - Delete message

### Reports
- `GET /api/admin/reports` - Get analytics and reports

## Usage Instructions

### For Administrators:

1. **Accessing the Admin Panel**:
   - Log in with an admin account
   - Navigate to the "Admin" link in the navigation bar
   - You'll see the admin dashboard with statistics

2. **Managing Users**:
   - Go to the "User Management" tab
   - Use search and filters to find specific users
   - Click "Ban" to ban a user or "Unban" to restore access
   - Use bulk actions to manage multiple users at once

3. **Managing Swap Requests**:
   - Go to the "Swap Requests" tab
   - View all requests with their current status
   - Delete inappropriate or problematic requests
   - Use bulk actions for multiple requests

4. **Creating Admin Messages**:
   - Go to the "Admin Messages" tab
   - Click "Create Message" to add a new message
   - Choose message type (announcement, warning, info)
   - Set optional expiration date
   - Toggle active status as needed

5. **Viewing Reports**:
   - Go to the "Reports & Analytics" tab
   - Select the time period for reports
   - View trends in user registrations and swap requests
   - Analyze popular skills on the platform

### For Users:

- Admin messages will appear at the top of the Home and Dashboard pages
- Messages are color-coded by type for easy identification
- Users can dismiss messages they've read
- Expired messages automatically disappear

## Security Features

- **Role-based Access**: Only users with admin role can access admin features
- **Confirmation Dialogs**: Destructive actions require confirmation
- **Input Validation**: All forms include proper validation
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Audit Trail**: All admin actions are logged

## Best Practices

1. **User Management**:
   - Use ban sparingly and only for serious violations
   - Always review user details before taking action
   - Consider warning users before banning

2. **Message Management**:
   - Keep messages concise and clear
   - Use appropriate message types
   - Set expiration dates for time-sensitive messages
   - Regularly review and update active messages

3. **Monitoring**:
   - Regularly check the dashboard for unusual activity
   - Monitor user registration trends
   - Review swap request patterns
   - Keep an eye on popular skills for platform insights

## Troubleshooting

### Common Issues:

1. **Admin Panel Not Accessible**:
   - Ensure user has admin role
   - Check authentication status
   - Verify backend is running

2. **Messages Not Displaying**:
   - Check message active status
   - Verify expiration dates
   - Ensure frontend is properly connected to backend

3. **Data Not Loading**:
   - Check network connectivity
   - Verify API endpoints are working
   - Check browser console for errors

## Future Enhancements

Potential improvements for the admin panel:
- Email notifications for admin actions
- Advanced analytics and charts
- User activity logs
- Automated moderation tools
- Integration with external moderation services
- Advanced reporting and export features 
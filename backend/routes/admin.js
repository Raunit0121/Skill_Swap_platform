const express = require('express');
const User = require('../models/User');
const SwapRequest = require('../models/SwapRequest');
const AdminMessage = require('../models/AdminMessage');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateAdminMessage, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// Apply admin middleware to all routes
router.use(authenticateToken, requireAdmin);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Admin only
router.get('/dashboard', async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
    const bannedUsers = await User.countDocuments({ isBanned: true });

    // Swap request statistics
    const totalRequests = await SwapRequest.countDocuments();
    const pendingRequests = await SwapRequest.countDocuments({ status: 'pending' });
    const acceptedRequests = await SwapRequest.countDocuments({ status: 'accepted' });
    const completedRequests = await SwapRequest.countDocuments({ completedAt: { $exists: true, $ne: null } });

    // Recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');

    const recentRequests = await SwapRequest.find()
      .populate('fromUserId', 'name')
      .populate('toUserId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          banned: bannedUsers
        },
        requests: {
          total: totalRequests,
          pending: pendingRequests,
          accepted: acceptedRequests,
          completed: completedRequests
        }
      },
      recentActivity: {
        users: recentUsers,
        requests: recentRequests
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard data' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filters
// @access  Admin only
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, role } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'banned') {
      query.isBanned = true;
    } else if (status === 'active') {
      query.isBanned = false;
    }

    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: skip + users.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// @route   PUT /api/admin/users/:id/ban
// @desc    Ban/unban a user
// @access  Admin only
router.put('/users/:id/ban', validateObjectId, async (req, res) => {
  try {
    const { isBanned } = req.body;

    if (typeof isBanned !== 'boolean') {
      return res.status(400).json({ message: 'isBanned must be a boolean' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
      user
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ message: 'Server error while updating user status' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user (admin only)
// @access  Admin only
router.delete('/users/:id', validateObjectId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all swap requests involving this user
    await SwapRequest.deleteMany({
      $or: [
        { fromUserId: user._id },
        { toUserId: user._id }
      ]
    });

    // Remove user from feedback received by other users
    await User.updateMany(
      { 'feedbackReceived.fromUserId': user._id },
      { $pull: { feedbackReceived: { fromUserId: user._id } } }
    );

    // Delete the user
    await User.findByIdAndDelete(user._id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
});

// @route   GET /api/admin/requests
// @desc    Get all swap requests with filters
// @access  Admin only
router.get('/requests', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      // Search by user names
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      const userIds = users.map(user => user._id);
      query.$or = [
        { fromUserId: { $in: userIds } },
        { toUserId: { $in: userIds } }
      ];
    }

    const requests = await SwapRequest.find(query)
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SwapRequest.countDocuments(query);

    res.json({
      requests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRequests: total,
        hasNext: skip + requests.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Server error while fetching requests' });
  }
});

// @route   DELETE /api/admin/requests/:id
// @desc    Delete a swap request (admin only)
// @access  Admin only
router.delete('/requests/:id', validateObjectId, async (req, res) => {
  try {
    const request = await SwapRequest.findByIdAndDelete(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    res.json({ message: 'Swap request deleted successfully' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ message: 'Server error while deleting request' });
  }
});

// @route   POST /api/admin/messages
// @desc    Create a new admin message
// @access  Admin only
router.post('/messages', validateAdminMessage, async (req, res) => {
  try {
    const { title, message, type, expiresAt } = req.body;

    const adminMessage = new AdminMessage({
      title,
      message,
      type,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user._id
    });

    await adminMessage.save();

    res.status(201).json({
      message: 'Admin message created successfully',
      adminMessage
    });
  } catch (error) {
    console.error('Create admin message error:', error);
    res.status(500).json({ message: 'Server error while creating admin message' });
  }
});

// @route   GET /api/admin/messages
// @desc    Get all admin messages
// @access  Admin only
router.get('/messages', async (req, res) => {
  try {
    const { page = 1, limit = 20, active } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (active === 'true') {
      query.isActive = true;
      query.$or = [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ];
    }

    const messages = await AdminMessage.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AdminMessage.countDocuments(query);

    res.json({
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMessages: total,
        hasNext: skip + messages.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get admin messages error:', error);
    res.status(500).json({ message: 'Server error while fetching admin messages' });
  }
});

// @route   PUT /api/admin/messages/:id
// @desc    Update an admin message
// @access  Admin only
router.put('/messages/:id', validateObjectId, validateAdminMessage, async (req, res) => {
  try {
    const { title, message, type, expiresAt, isActive } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (message !== undefined) updateData.message = message;
    if (type !== undefined) updateData.type = type;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const adminMessage = await AdminMessage.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    if (!adminMessage) {
      return res.status(404).json({ message: 'Admin message not found' });
    }

    res.json({
      message: 'Admin message updated successfully',
      adminMessage
    });
  } catch (error) {
    console.error('Update admin message error:', error);
    res.status(500).json({ message: 'Server error while updating admin message' });
  }
});

// @route   DELETE /api/admin/messages/:id
// @desc    Delete an admin message
// @access  Admin only
router.delete('/messages/:id', validateObjectId, async (req, res) => {
  try {
    const adminMessage = await AdminMessage.findByIdAndDelete(req.params.id);
    
    if (!adminMessage) {
      return res.status(404).json({ message: 'Admin message not found' });
    }

    res.json({ message: 'Admin message deleted successfully' });
  } catch (error) {
    console.error('Delete admin message error:', error);
    res.status(500).json({ message: 'Server error while deleting admin message' });
  }
});

// @route   GET /api/admin/reports
// @desc    Get system reports and analytics
// @access  Admin only
router.get('/reports', async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    // User registration trends
    const userRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Swap request trends
    const swapRequests = await SwapRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]);

    // Top skills
    const topSkillsOffered = await User.aggregate([
      {
        $unwind: "$skillsOffered"
      },
      {
        $group: {
          _id: "$skillsOffered",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    const topSkillsWanted = await User.aggregate([
      {
        $unwind: "$skillsWanted"
      },
      {
        $group: {
          _id: "$skillsWanted",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      period: parseInt(period),
      userRegistrations,
      swapRequests,
      topSkillsOffered,
      topSkillsWanted
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error while generating reports' });
  }
});

module.exports = router; 
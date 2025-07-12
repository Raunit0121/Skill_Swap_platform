const express = require('express');
const User = require('../models/User');
const SwapRequest = require('../models/SwapRequest');
const { authenticateToken, optionalAuth, requireOwnershipOrAdmin } = require('../middleware/auth');
const { validateProfileUpdate, validateSearch, validateObjectId } = require('../middleware/validation');
const upload = require('../utils/upload');

const router = express.Router();

// @route   GET /api/users/search
// @desc    Search users by skills, location, availability
// @access  Public (with optional auth)
router.get('/search', optionalAuth, validateSearch, async (req, res) => {
  try {
    const { skill, location, availability, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    let query = { isPublic: true, isBanned: false };

    if (skill) {
      query.$or = [
        { skillsOffered: { $regex: skill, $options: 'i' } },
        { skillsWanted: { $regex: skill, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (availability) {
      query.availability = availability;
    }

    // Exclude current user from search results
    if (req.user) {
      query._id = { $ne: req.user._id };
    }

    const users = await User.find(query)
      .select('name location profilePhotoUrl skillsOffered skillsWanted availability averageRating feedbackCount createdAt')
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
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error during search' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public (if public profile) or Private (if own profile)
router.get('/:id', validateObjectId, optionalAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('feedbackReceived.fromUserId', 'name');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If profile is private, only allow access to own profile
    if (!user.isPublic && (!req.user || req.user._id.toString() !== user._id.toString())) {
      return res.status(403).json({ message: 'Profile is private' });
    }

    // Return public profile data
    const profileData = user.getPublicProfile();
    profileData.feedbackReceived = user.feedbackReceived;

    res.json({ user: profileData });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private (own profile only)
router.put(
  '/:id',
  validateObjectId,
  authenticateToken,
  requireOwnershipOrAdmin('id'),
  upload.single('profileImage'),
  async (req, res) => {
    try {
      // Support both JSON and multipart/form-data
      let data = req.body;
      // Parse arrays if sent as string (from multipart)
      const parseArray = (val) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') {
          try {
            // Try JSON parse
            const arr = JSON.parse(val);
            if (Array.isArray(arr)) return arr;
          } catch {
            // Fallback: comma split
            return val.split(',').map((v) => v.trim()).filter(Boolean);
          }
        }
        return [];
      };
      
      // Handle FormData arrays properly
      const getArrayFromFormData = (data, fieldName) => {
        if (Array.isArray(data[fieldName])) {
          return data[fieldName];
        }
        // For FormData, multiple values with same name come as array
        const values = data[fieldName];
        if (Array.isArray(values)) {
          return values;
        }
        if (typeof values === 'string') {
          return parseArray(values);
        }
        return [];
      };
      const updateData = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.skillsOffered !== undefined) updateData.skillsOffered = getArrayFromFormData(data, 'skillsOffered');
      if (data.skillsWanted !== undefined) updateData.skillsWanted = getArrayFromFormData(data, 'skillsWanted');
      if (data.availability !== undefined) updateData.availability = getArrayFromFormData(data, 'availability');
      if (data.isPublic !== undefined) updateData.isPublic = data.isPublic === 'true' || data.isPublic === true;
      
      // Debug logging
      console.log('Update data:', updateData);
      console.log('Raw skillsOffered:', data.skillsOffered);
      console.log('Raw skillsWanted:', data.skillsWanted);
      if (req.file) {
        updateData.profilePhotoUrl = `/uploads/${req.file.filename}`;
      }
      const user = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('feedbackReceived.fromUserId', 'name');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({
        message: 'Profile updated successfully',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          location: user.location,
          profilePhotoUrl: user.profilePhotoUrl,
          skillsOffered: user.skillsOffered,
          skillsWanted: user.skillsWanted,
          availability: user.availability,
          isPublic: user.isPublic,
          role: user.role,
          feedbackReceived: user.feedbackReceived,
          averageRating: user.getAverageRating(),
          createdAt: user.createdAt,
          lastActive: user.lastActive
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error while updating profile' });
    }
  }
);

// @route   DELETE /api/users/:id
// @desc    Delete user account
// @access  Private (own profile only) or Admin
router.delete('/:id', validateObjectId, authenticateToken, requireOwnershipOrAdmin('id'), async (req, res) => {
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

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error while deleting account' });
  }
});

// @route   GET /api/users/:id/requests
// @desc    Get user's swap requests
// @access  Private (own requests only)
router.get('/:id/requests', validateObjectId, authenticateToken, requireOwnershipOrAdmin('id'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {
      $or: [
        { fromUserId: req.params.id },
        { toUserId: req.params.id }
      ]
    };

    if (status) {
      query.status = status;
    }

    const requests = await SwapRequest.find(query)
      .populate('fromUserId', 'name profilePhotoUrl')
      .populate('toUserId', 'name profilePhotoUrl')
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

// @route   GET /api/users/:id/stats
// @desc    Get user statistics
// @access  Private (own stats only)
router.get('/:id/stats', validateObjectId, authenticateToken, requireOwnershipOrAdmin('id'), async (req, res) => {
  try {
    const userId = req.params.id;

    // Get swap request statistics
    const totalRequests = await SwapRequest.countDocuments({
      $or: [{ fromUserId: userId }, { toUserId: userId }]
    });

    const pendingRequests = await SwapRequest.countDocuments({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
      status: 'pending'
    });

    const acceptedRequests = await SwapRequest.countDocuments({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
      status: 'accepted'
    });

    const completedRequests = await SwapRequest.countDocuments({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
      status: 'accepted',
      completedAt: { $exists: true, $ne: null }
    });

    // Get user data
    const user = await User.findById(userId);
    const averageRating = user.getAverageRating();
    const feedbackCount = user.feedbackReceived.length;

    res.json({
      stats: {
        totalRequests,
        pendingRequests,
        acceptedRequests,
        completedRequests,
        averageRating: parseFloat(averageRating),
        feedbackCount,
        skillsOfferedCount: user.skillsOffered.length,
        skillsWantedCount: user.skillsWanted.length
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
});

module.exports = router; 
const express = require('express');
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');
const { authenticateToken, requireOwnershipOrAdmin } = require('../middleware/auth');
const { validateSwapRequest, validateFeedback, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/swaps
// @desc    Create a new swap request
// @access  Private
router.post('/', authenticateToken, validateSwapRequest, async (req, res) => {
  try {
    const { toUserId, skillOffered, skillWanted, proposedDate, proposedLocation, message } = req.body;

    // Check if target user exists and is not banned
    const targetUser = await User.findById(toUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    if (targetUser.isBanned) {
      return res.status(400).json({ message: 'Cannot send request to banned user' });
    }

    // Check if target user is public
    if (!targetUser.isPublic) {
      return res.status(403).json({ message: 'Cannot send request to private profile' });
    }

    // Check if there's already a pending request between these users
    const existingRequest = await SwapRequest.findOne({
      $or: [
        { fromUserId: req.user._id, toUserId: toUserId, status: 'pending' },
        { fromUserId: toUserId, toUserId: req.user._id, status: 'pending' }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'A pending request already exists between these users' });
    }

    // Create new swap request
    const swapRequest = new SwapRequest({
      fromUserId: req.user._id,
      toUserId,
      skillOffered,
      skillWanted,
      proposedDate: new Date(proposedDate),
      proposedLocation,
      message
    });

    await swapRequest.save();

    // Populate user data for response
    await swapRequest.populate('fromUserId', 'name profilePhotoUrl');
    await swapRequest.populate('toUserId', 'name profilePhotoUrl');

    res.status(201).json({
      message: 'Swap request sent successfully',
      request: swapRequest
    });
  } catch (error) {
    console.error('Create swap request error:', error);
    res.status(500).json({ message: 'Server error while creating swap request' });
  }
});

// @route   GET /api/swaps/:id
// @desc    Get swap request by ID
// @access  Private (participants only)
router.get('/:id', validateObjectId, authenticateToken, async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id)
      .populate('fromUserId', 'name profilePhotoUrl')
      .populate('toUserId', 'name profilePhotoUrl');

    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if user is a participant
    if (swapRequest.fromUserId._id.toString() !== req.user._id.toString() && 
        swapRequest.toUserId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ request: swapRequest });
  } catch (error) {
    console.error('Get swap request error:', error);
    res.status(500).json({ message: 'Server error while fetching swap request' });
  }
});

// @route   PUT /api/swaps/:id/accept
// @desc    Accept a swap request
// @access  Private (recipient only)
router.put('/:id/accept', validateObjectId, authenticateToken, async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if user is the recipient
    if (swapRequest.toUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the recipient can accept requests' });
    }

    // Check if request is pending
    if (swapRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    swapRequest.status = 'accepted';
    await swapRequest.save();

    await swapRequest.populate('fromUserId', 'name profilePhotoUrl');
    await swapRequest.populate('toUserId', 'name profilePhotoUrl');

    res.json({
      message: 'Swap request accepted successfully',
      request: swapRequest
    });
  } catch (error) {
    console.error('Accept swap request error:', error);
    res.status(500).json({ message: 'Server error while accepting request' });
  }
});

// @route   PUT /api/swaps/:id/reject
// @desc    Reject a swap request
// @access  Private (recipient only)
router.put('/:id/reject', validateObjectId, authenticateToken, async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if user is the recipient
    if (swapRequest.toUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the recipient can reject requests' });
    }

    // Check if request is pending
    if (swapRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    swapRequest.status = 'rejected';
    await swapRequest.save();

    await swapRequest.populate('fromUserId', 'name profilePhotoUrl');
    await swapRequest.populate('toUserId', 'name profilePhotoUrl');

    res.json({
      message: 'Swap request rejected successfully',
      request: swapRequest
    });
  } catch (error) {
    console.error('Reject swap request error:', error);
    res.status(500).json({ message: 'Server error while rejecting request' });
  }
});

// @route   PUT /api/swaps/:id/cancel
// @desc    Cancel a swap request
// @access  Private (sender only)
router.put('/:id/cancel', validateObjectId, authenticateToken, async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if user is the sender
    if (swapRequest.fromUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the sender can cancel requests' });
    }

    // Check if request is pending
    if (swapRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    swapRequest.status = 'cancelled';
    await swapRequest.save();

    await swapRequest.populate('fromUserId', 'name profilePhotoUrl');
    await swapRequest.populate('toUserId', 'name profilePhotoUrl');

    res.json({
      message: 'Swap request cancelled successfully',
      request: swapRequest
    });
  } catch (error) {
    console.error('Cancel swap request error:', error);
    res.status(500).json({ message: 'Server error while cancelling request' });
  }
});

// @route   PUT /api/swaps/:id/complete
// @desc    Mark swap as completed
// @access  Private (participants only)
router.put('/:id/complete', validateObjectId, authenticateToken, async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if user is a participant
    if (swapRequest.fromUserId.toString() !== req.user._id.toString() && 
        swapRequest.toUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if request is accepted and not completed
    if (swapRequest.status !== 'accepted') {
      return res.status(400).json({ message: 'Request must be accepted to complete' });
    }

    if (swapRequest.completedAt) {
      return res.status(400).json({ message: 'Swap is already completed' });
    }

    swapRequest.completedAt = new Date();
    await swapRequest.save();

    await swapRequest.populate('fromUserId', 'name profilePhotoUrl');
    await swapRequest.populate('toUserId', 'name profilePhotoUrl');

    res.json({
      message: 'Swap completed successfully',
      request: swapRequest
    });
  } catch (error) {
    console.error('Complete swap error:', error);
    res.status(500).json({ message: 'Server error while completing swap' });
  }
});

// @route   POST /api/swaps/:id/feedback
// @desc    Leave feedback for a completed swap
// @access  Private (participants only)
router.post('/:id/feedback', validateObjectId, authenticateToken, validateFeedback, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if user is a participant
    if (swapRequest.fromUserId.toString() !== req.user._id.toString() && 
        swapRequest.toUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if swap is completed
    if (!swapRequest.completedAt) {
      return res.status(400).json({ message: 'Swap must be completed before leaving feedback' });
    }

    // Check if user can give feedback
    if (!swapRequest.canGiveFeedback(req.user._id)) {
      return res.status(400).json({ message: 'Feedback already provided or not eligible' });
    }

    // Determine which feedback field to update
    const isRequester = swapRequest.fromUserId.toString() === req.user._id.toString();
    const feedbackField = isRequester ? 'feedbackFromRequester' : 'feedbackFromRecipient';

    // Update feedback
    swapRequest[feedbackField] = {
      rating,
      comment,
      createdAt: new Date()
    };

    await swapRequest.save();

    // If both parties have given feedback, update user ratings
    if (swapRequest.feedbackFromRequester.rating && swapRequest.feedbackFromRecipient.rating) {
      const recipientUser = await User.findById(swapRequest.toUserId);
      const requesterUser = await User.findById(swapRequest.fromUserId);

      // Add feedback to recipient
      recipientUser.feedbackReceived.push({
        fromUserId: swapRequest.fromUserId,
        rating: swapRequest.feedbackFromRequester.rating,
        comment: swapRequest.feedbackFromRequester.comment
      });

      // Add feedback to requester
      requesterUser.feedbackReceived.push({
        fromUserId: swapRequest.toUserId,
        rating: swapRequest.feedbackFromRecipient.rating,
        comment: swapRequest.feedbackFromRecipient.comment
      });

      await recipientUser.save();
      await requesterUser.save();
    }

    await swapRequest.populate('fromUserId', 'name profilePhotoUrl');
    await swapRequest.populate('toUserId', 'name profilePhotoUrl');

    res.json({
      message: 'Feedback submitted successfully',
      request: swapRequest
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Server error while submitting feedback' });
  }
});

// @route   GET /api/swaps
// @desc    Get user's swap requests with filters
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {
      $or: [
        { fromUserId: req.user._id },
        { toUserId: req.user._id }
      ]
    };

    if (status) {
      query.status = status;
    }

    if (type === 'sent') {
      query.fromUserId = req.user._id;
    } else if (type === 'received') {
      query.toUserId = req.user._id;
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
    console.error('Get swaps error:', error);
    res.status(500).json({ message: 'Server error while fetching swap requests' });
  }
});

module.exports = router; 
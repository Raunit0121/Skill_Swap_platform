const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot be more than 500 characters'],
    default: ''
  },
  skillOffered: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Skill name cannot be more than 50 characters']
  },
  skillWanted: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Skill name cannot be more than 50 characters']
  },
  proposedDate: {
    type: Date,
    required: true
  },
  proposedLocation: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot be more than 200 characters']
  },
  completedAt: {
    type: Date,
    default: null
  },
  feedbackFromRequester: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot be more than 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  feedbackFromRecipient: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot be more than 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
swapRequestSchema.index({ fromUserId: 1, status: 1 });
swapRequestSchema.index({ toUserId: 1, status: 1 });
swapRequestSchema.index({ status: 1, createdAt: -1 });

// Pre-save middleware to prevent self-requests
swapRequestSchema.pre('save', function(next) {
  if (this.fromUserId.toString() === this.toUserId.toString()) {
    return next(new Error('Cannot send swap request to yourself'));
  }
  next();
});

// Method to check if request can be completed
swapRequestSchema.methods.canComplete = function() {
  return this.status === 'accepted' && !this.completedAt;
};

// Method to check if feedback can be given
swapRequestSchema.methods.canGiveFeedback = function(userId) {
  if (!this.completedAt) return false;
  
  if (this.fromUserId.toString() === userId.toString()) {
    return !this.feedbackFromRequester.rating;
  }
  
  if (this.toUserId.toString() === userId.toString()) {
    return !this.feedbackFromRecipient.rating;
  }
  
  return false;
};

// Method to get request summary
swapRequestSchema.methods.getSummary = function() {
  return {
    _id: this._id,
    status: this.status,
    skillOffered: this.skillOffered,
    skillWanted: this.skillWanted,
    proposedDate: this.proposedDate,
    proposedLocation: this.proposedLocation,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('SwapRequest', swapRequestSchema); 
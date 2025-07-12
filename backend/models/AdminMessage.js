const mongoose = require('mongoose');

const adminMessageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Message title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  type: {
    type: String,
    enum: ['announcement', 'warning', 'info'],
    default: 'announcement'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
adminMessageSchema.index({ isActive: 1, expiresAt: 1 });
adminMessageSchema.index({ createdAt: -1 });

// Method to check if message is still valid
adminMessageSchema.methods.isValid = function() {
  if (!this.isActive) return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  return true;
};

// Method to get public message data
adminMessageSchema.methods.getPublicData = function() {
  return {
    _id: this._id,
    title: this.title,
    message: this.message,
    type: this.type,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('AdminMessage', adminMessageSchema); 
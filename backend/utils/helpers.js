// Utility helper functions for the Skill Swap backend

/**
 * Generate a random string for tokens or IDs
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calculate time difference in human readable format
 * @param {Date} date - Date to compare
 * @returns {string} Time difference string
 */
const timeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Create pagination object
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {object} Pagination object
 */
const createPagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    currentPage: parseInt(page),
    totalPages,
    totalItems: total,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    itemsPerPage: limit
  };
};

/**
 * Generate search query for users
 * @param {object} filters - Search filters
 * @returns {object} MongoDB query object
 */
const generateUserSearchQuery = (filters) => {
  const query = { isPublic: true, isBanned: false };

  if (filters.skill) {
    query.$or = [
      { skillsOffered: { $regex: filters.skill, $options: 'i' } },
      { skillsWanted: { $regex: filters.skill, $options: 'i' } }
    ];
  }

  if (filters.location) {
    query.location = { $regex: filters.location, $options: 'i' };
  }

  if (filters.availability) {
    query.availability = filters.availability;
  }

  return query;
};

/**
 * Calculate average rating from feedback array
 * @param {Array} feedback - Array of feedback objects
 * @returns {number} Average rating
 */
const calculateAverageRating = (feedback) => {
  if (!feedback || feedback.length === 0) return 0;
  
  const totalRating = feedback.reduce((sum, item) => sum + item.rating, 0);
  return (totalRating / feedback.length).toFixed(1);
};

/**
 * Check if a date is in the future
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is in the future
 */
const isFutureDate = (date) => {
  return new Date(date) > new Date();
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid ObjectId
 */
const isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Get file extension from filename
 * @param {string} filename - Filename to check
 * @returns {string} File extension
 */
const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Check if file type is allowed
 * @param {string} filename - Filename to check
 * @param {Array} allowedTypes - Array of allowed file extensions
 * @returns {boolean} True if file type is allowed
 */
const isAllowedFileType = (filename, allowedTypes = ['jpg', 'jpeg', 'png', 'gif']) => {
  const extension = getFileExtension(filename).toLowerCase();
  return allowedTypes.includes(extension);
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

module.exports = {
  generateRandomString,
  formatDate,
  timeAgo,
  isValidEmail,
  sanitizeInput,
  createPagination,
  generateUserSearchQuery,
  calculateAverageRating,
  isFutureDate,
  isValidObjectId,
  getFileExtension,
  isAllowedFileType,
  truncateText
}; 
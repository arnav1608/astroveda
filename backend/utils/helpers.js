// Generate unique username from first name + random 4-digit number
const generateUsername = (name) => {
  const first = name.trim().split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
  const num = Math.floor(1000 + Math.random() * 9000);
  return first + num;
};

// Generate booking ID
const generateBookingId = () => {
  return 'AV' + Date.now().toString().slice(-6).toUpperCase();
};

// Paginate helper
const paginate = (query, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

// Format price
const formatPrice = (price) => {
  if (price === 0) return 'FREE';
  return '₹' + price.toLocaleString('en-IN');
};

module.exports = { generateUsername, generateBookingId, paginate, formatPrice };

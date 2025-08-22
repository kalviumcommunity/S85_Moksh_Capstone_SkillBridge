const multer = require('multer');

let storage;

try {
  // Try to use Cloudinary storage
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  const cloudinary = require('./cloudinary');

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'skillbridge-posts',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto' }]
    }
  });
  
  console.log('Using Cloudinary storage');
} catch (error) {
  // Fallback to memory storage if Cloudinary fails
  console.error('Cloudinary storage failed, using memory storage:', error.message);
  storage = multer.memoryStorage();
}

module.exports = multer({ storage });

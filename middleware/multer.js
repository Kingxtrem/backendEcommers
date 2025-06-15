const multer = require('multer');

const storage = multer.memoryStorage(); // 🟢 IN-MEMORY storage

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = upload;

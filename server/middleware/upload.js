const multer = require('multer');
const path = require('path');

// Store file in memory to allow processing with Sharp before saving
const storage = multer.memoryStorage();

// Check file type
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only image files (jpeg, jpg, png, gif, webp) are allowed'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB per file
        files: 10                     // max 10 files per request
    }
});

module.exports = upload;

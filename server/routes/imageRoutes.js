const express = require('express');
const router = express.Router();
const { uploadImages, getImages, deleteImage } = require('../controllers/imageController');
const upload = require('../middleware/upload');

router.post('/upload', upload.array('images', 10), uploadImages);
router.get('/', getImages);
router.delete('/:id', deleteImage);

module.exports = router;

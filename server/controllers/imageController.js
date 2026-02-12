const Image = require('../models/Image');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure directories exist
const uploadDirs = [
    'uploads/original',
    'uploads/small',
    'uploads/medium',
    'uploads/large'
];

uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// @desc    Upload images and resize
// @route   POST /api/images/upload
// @access  Public
const uploadImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const uploadedImages = [];

        for (const file of req.files) {
            const ext = path.extname(file.originalname).toLowerCase();
            const filename = `${uuidv4()}${ext}`;

            // Paths
            const originalPath = path.join('uploads', 'original', filename);
            const smallPath = path.join('uploads', 'small', filename);
            const mediumPath = path.join('uploads', 'medium', filename);
            const largePath = path.join('uploads', 'large', filename);

            // Save original
            await fs.promises.writeFile(path.join(__dirname, '..', originalPath), file.buffer);

            // Resize and save small (150x150) — fit inside, preserve aspect ratio
            await sharp(file.buffer)
                .resize(150, 150, { fit: 'inside', withoutEnlargement: true })
                .toFile(path.join(__dirname, '..', smallPath));

            // Resize and save medium (500x500)
            await sharp(file.buffer)
                .resize(500, 500, { fit: 'inside', withoutEnlargement: true })
                .toFile(path.join(__dirname, '..', mediumPath));

            // Resize and save large (1000x1000)
            await sharp(file.buffer)
                .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
                .toFile(path.join(__dirname, '..', largePath));

            // Save to DB
            const image = new Image({
                originalName: file.originalname,
                original: originalPath.replace(/\\/g, '/'),
                small: smallPath.replace(/\\/g, '/'),
                medium: mediumPath.replace(/\\/g, '/'),
                large: largePath.replace(/\\/g, '/')
            });

            await image.save();
            uploadedImages.push(image);
        }

        res.status(201).json({
            message: 'Images uploaded and processed successfully',
            images: uploadedImages
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server Error during image processing' });
    }
};

// @desc    Get all images
// @route   GET /api/images
// @access  Public
const getImages = async (req, res) => {
    try {
        const images = await Image.find().sort({ createdAt: -1 });
        res.status(200).json(images);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete an image and its files
// @route   DELETE /api/images/:id
// @access  Public
const deleteImage = async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);

        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Delete all associated files from disk
        const filePaths = [image.original, image.small, image.medium, image.large];
        for (const filePath of filePaths) {
            const fullPath = path.join(__dirname, '..', filePath);
            try {
                await fs.promises.unlink(fullPath);
            } catch (err) {
                // File may already be deleted — log and continue
                console.warn(`Could not delete file ${fullPath}:`, err.message);
            }
        }

        // Delete from DB
        await Image.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    uploadImages,
    getImages,
    deleteImage
};

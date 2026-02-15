const express = require('express');
const router = express.Router();
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const Project = require('../models/Project');
const Property = require('../models/Property');
const auth = require('../middleware/auth');
const path = require('path');

// Configure S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'damrideals-assets';

// Configure Multer (memory storage for S3 upload)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Upload project main image
router.post('/project-image/:projectId', [auth, upload.single('image')], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No image file provided' });
        }

        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        const fileExt = path.extname(req.file.originalname).toLowerCase();
        const key = `projects/${req.params.projectId}/main${fileExt}`;

        // Upload to S3
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        });

        await s3Client.send(command);

        const imageUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;

        // Update project with image info
        project.imageName = req.file.originalname;
        project.imageUrl = imageUrl;
        await project.save();

        res.json({
            msg: 'Image uploaded successfully',
            imageUrl,
            imageName: req.file.originalname
        });

    } catch (err) {
        console.error('Upload error:', err.message);
        res.status(500).json({ msg: 'Upload failed', error: err.message });
    }
});

// Upload gallery images
router.post('/project-gallery/:projectId', [auth, upload.array('images', 10)], async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ msg: 'No gallery images provided' });
        }

        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        const uploadedUrls = [];

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const fileExt = path.extname(file.originalname).toLowerCase();
            const key = `projects/${req.params.projectId}/gallery/${Date.now()}-${i}${fileExt}`;

            const command = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype
            });

            await s3Client.send(command);

            const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;
            uploadedUrls.push(url);
        }

        // Append to existing gallery
        project.gallery = [...(project.gallery || []), ...req.files.map(f => f.originalname)];
        project.galleryUrls = [...(project.galleryUrls || []), ...uploadedUrls];
        await project.save();

        res.json({
            msg: 'Gallery uploaded successfully',
            galleryUrls: uploadedUrls
        });

    } catch (err) {
        console.error('Gallery upload error:', err.message);
        res.status(500).json({ msg: 'Gallery upload failed', error: err.message });
    }
});

// Multer config for PDF uploads
const pdfUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit for PDFs
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// Upload project brochure PDF
router.post('/project-brochure/:projectId', [auth, pdfUpload.single('brochure')], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No PDF file provided' });
        }

        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        const key = `projects/${req.params.projectId}/brochure.pdf`;

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: req.file.buffer,
            ContentType: 'application/pdf'
        });

        await s3Client.send(command);

        const brochureUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;

        project.brochureUrl = brochureUrl;
        await project.save();

        res.json({
            msg: 'Brochure uploaded successfully',
            brochureUrl
        });

    } catch (err) {
        console.error('Brochure upload error:', err.message);
        res.status(500).json({ msg: 'Brochure upload failed', error: err.message });
    }
});

// --- PROPERTY UPLOADS ---

// Upload property main image
router.post('/property-image/:propertyId', [auth, upload.single('image')], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No image file provided' });
        }

        const property = await Property.findById(req.params.propertyId);
        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }

        const fileExt = path.extname(req.file.originalname).toLowerCase();
        const key = `properties/${req.params.propertyId}/main${fileExt}`;

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        });

        await s3Client.send(command);

        const imageUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;

        property.imageName = req.file.originalname;
        property.imageUrl = imageUrl;
        await property.save();

        res.json({
            msg: 'Image uploaded successfully',
            imageUrl,
            imageName: req.file.originalname
        });

    } catch (err) {
        console.error('Upload error:', err.message);
        res.status(500).json({ msg: 'Upload failed', error: err.message });
    }
});

// Upload property gallery images
router.post('/property-gallery/:propertyId', [auth, upload.array('images', 10)], async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ msg: 'No gallery images provided' });
        }

        const property = await Property.findById(req.params.propertyId);
        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }

        const uploadedUrls = [];

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const fileExt = path.extname(file.originalname).toLowerCase();
            const key = `properties/${req.params.propertyId}/gallery/${Date.now()}-${i}${fileExt}`;

            const command = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype
            });

            await s3Client.send(command);

            const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;
            uploadedUrls.push(url);
        }

        // Append to existing gallery
        property.galleryUrls = [...(property.galleryUrls || []), ...uploadedUrls];
        await property.save();

        res.json({
            msg: 'Gallery uploaded successfully',
            galleryUrls: uploadedUrls
        });

    } catch (err) {
        console.error('Gallery upload error:', err.message);
        res.status(500).json({ msg: 'Gallery upload failed', error: err.message });
    }
});



module.exports = router;

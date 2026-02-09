// Upload existing project assets to S3 and update database
// Run with: node scripts/upload-assets-to-s3.js

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Project = require('../models/Project');
const { uploadToS3, CDN_BASE_URL } = require('../utils/s3');

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Path to frontend assets
const ASSETS_PATH = path.join(__dirname, '../../damrideals/assets');

// Map of image names to their S3 keys
const imageMapping = {};

const uploadAssets = async () => {
    try {
        console.log('🚀 Starting asset upload to S3...\n');

        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, { family: 4 });
        console.log('✅ MongoDB connected\n');

        // Get all projects
        const projects = await Project.find();
        console.log(`Found ${projects.length} projects to process\n`);

        // First, upload all unique images and create mapping
        console.log('📤 Uploading images to S3...\n');

        for (const project of projects) {
            const projectId = project._id.toString();

            // Upload main image
            if (project.imageName) {
                const imagePath = path.join(ASSETS_PATH, project.imageName);

                if (fs.existsSync(imagePath)) {
                    const s3Key = `projects/images/${project.imageName}`;

                    if (!imageMapping[project.imageName]) {
                        const result = await uploadToS3(imagePath, s3Key);
                        if (result.success) {
                            imageMapping[project.imageName] = result.url;
                        }
                    }
                } else {
                    console.log(`⚠️  Image not found: ${project.imageName}`);
                }
            }

            // Upload gallery images
            if (project.gallery && project.gallery.length > 0) {
                for (const galleryImage of project.gallery) {
                    const galleryPath = path.join(ASSETS_PATH, galleryImage);

                    if (fs.existsSync(galleryPath)) {
                        const s3Key = `projects/gallery/${galleryImage}`;

                        if (!imageMapping[galleryImage]) {
                            const result = await uploadToS3(galleryPath, s3Key);
                            if (result.success) {
                                imageMapping[galleryImage] = result.url;
                            }
                        }
                    } else {
                        console.log(`⚠️  Gallery image not found: ${galleryImage}`);
                    }
                }
            }
        }

        console.log('\n📝 Updating project records with S3 URLs...\n');

        // Now update all projects with S3 URLs
        for (const project of projects) {
            const updates = {};

            // Update main image URL
            if (project.imageName && imageMapping[project.imageName]) {
                updates.imageUrl = imageMapping[project.imageName];
            }

            // Update gallery URLs
            if (project.gallery && project.gallery.length > 0) {
                updates.galleryUrls = project.gallery
                    .map(img => imageMapping[img])
                    .filter(url => url); // Filter out undefined
            }

            // Update brochure URL (assuming it's a PDF in assets or a URL)
            if (project.brochureUrl && !project.brochureUrl.startsWith('http')) {
                const brochurePath = path.join(ASSETS_PATH, project.brochureUrl);
                if (fs.existsSync(brochurePath)) {
                    const s3Key = `projects/brochures/${project._id}_brochure${path.extname(project.brochureUrl)}`;
                    const result = await uploadToS3(brochurePath, s3Key);
                    if (result.success) {
                        updates.brochureUrl = result.url;
                    }
                }
            }

            // Apply updates
            if (Object.keys(updates).length > 0) {
                await Project.findByIdAndUpdate(project._id, updates);
                console.log(`✅ Updated: ${project.title}`);
                console.log(`   - Image URL: ${updates.imageUrl || 'N/A'}`);
                if (updates.galleryUrls) {
                    console.log(`   - Gallery: ${updates.galleryUrls.length} images`);
                }
            }
        }

        console.log('\n========================================');
        console.log('✅ Asset upload complete!');
        console.log('========================================');
        console.log(`\nImages uploaded: ${Object.keys(imageMapping).length}`);
        console.log(`S3 Base URL: ${CDN_BASE_URL}`);
        console.log('\nImage Mapping:');
        Object.entries(imageMapping).forEach(([name, url]) => {
            console.log(`  ${name} => ${url}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

uploadAssets();

// AWS S3 Configuration and Utilities
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Initialize S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'damrideals-assets';
const CDN_BASE_URL = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com`;

/**
 * Upload a file to S3
 * @param {string} filePath - Local path to the file
 * @param {string} s3Key - Key (path) in S3 bucket
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
const uploadToS3 = async (filePath, s3Key) => {
    try {
        const fileContent = fs.readFileSync(filePath);
        const contentType = getContentType(filePath);

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: fileContent,
            ContentType: contentType
        });

        await s3Client.send(command);

        const url = `${CDN_BASE_URL}/${s3Key}`;
        console.log(`✅ Uploaded: ${s3Key}`);
        return { success: true, url };
    } catch (error) {
        console.error(`❌ Upload failed for ${s3Key}:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Upload a buffer to S3
 * @param {Buffer} buffer - File buffer
 * @param {string} s3Key - Key (path) in S3 bucket
 * @param {string} contentType - MIME type
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
const uploadBufferToS3 = async (buffer, s3Key, contentType) => {
    try {
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: buffer,
            ContentType: contentType
        });

        await s3Client.send(command);

        const url = `${CDN_BASE_URL}/${s3Key}`;
        return { success: true, url };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Get content type based on file extension
 */
const getContentType = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    return types[ext] || 'application/octet-stream';
};

/**
 * Generate a unique S3 key for a project asset
 * @param {string} projectId - MongoDB project ID
 * @param {string} fileName - Original file name
 * @param {string} type - 'image' | 'gallery' | 'brochure'
 * @returns {string} S3 key
 */
const generateS3Key = (projectId, fileName, type = 'image') => {
    const timestamp = Date.now();
    const ext = path.extname(fileName);
    const baseName = path.basename(fileName, ext);
    const sanitizedName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');

    return `projects/${projectId}/${type}/${sanitizedName}_${timestamp}${ext}`;
};

/**
 * Get S3 URL from key
 */
const getS3Url = (s3Key) => {
    return `${CDN_BASE_URL}/${s3Key}`;
};

module.exports = {
    s3Client,
    uploadToS3,
    uploadBufferToS3,
    getContentType,
    generateS3Key,
    getS3Url,
    BUCKET_NAME,
    CDN_BASE_URL
};

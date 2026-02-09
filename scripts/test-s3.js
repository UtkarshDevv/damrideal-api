require('dotenv').config();
const { uploadBufferToS3 } = require('../utils/s3');

const testS3 = async () => {
    console.log('Testing S3 Upload...');
    const buffer = Buffer.from('This is a test upload from Damrideal API verification.', 'utf-8');
    const s3Key = `test/verification_${Date.now()}.txt`;
    const contentType = 'text/plain';

    try {
        const result = await uploadBufferToS3(buffer, s3Key, contentType);
        if (result.success) {
            console.log('✅ Upload Successful!');
            console.log('URL:', result.url);
        } else {
            console.error('❌ Upload Failed:', result.error);
        }
    } catch (error) {
        console.error('❌ Unexpected Error:', error.message);
    }
};

testS3();

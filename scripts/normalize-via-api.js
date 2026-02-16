// Simple script to trigger city normalization via API
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function normalizeCities() {
    try {
        console.log('🔄 Starting city normalization...\n');

        // Note: This endpoint requires authentication
        // If you have an admin token, add it here
        // Otherwise, use the Admin Panel UI

        const response = await axios.post(`${API_BASE_URL}/admin/utils/normalize-cities`);

        if (response.data.success) {
            console.log('✅ NORMALIZATION COMPLETE!\n');
            console.log('📦 Projects updated:', response.data.projectsUpdated);
            console.log('🏠 Properties updated:', response.data.propertiesUpdated);
            console.log('📊 Total updates:', response.data.projectsUpdated + response.data.propertiesUpdated);
            console.log('\nDetails:', response.data.message);
        } else {
            console.error('❌ Error:', response.data.error);
        }

    } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('\n⚠️  Authentication required!');
            console.log('\n📌 Please use the Admin Panel instead:');
            console.log('   1. Open http://localhost:5173');
            console.log('   2. Go to Settings page');
            console.log('   3. Scroll to "Database Utilities"');
            console.log('   4. Click "Normalize All Cities" button\n');
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

normalizeCities();

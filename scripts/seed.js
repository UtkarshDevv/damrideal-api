// Seed script to populate initial project data from frontend JSON
// Run with: npm run seed

require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('../models/Project');

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Existing projects from frontend (damrideals/data/projects/projects.json)
const projects = [
    {
        title: "Sunrise Greens Project",
        imageName: "property-image-1.png",
        gallery: ["property-image-1.png", "property-img-2.jpg"],
        type: "Featured",
        location: "Sector 150, Noida",
        priceRange: "₹1.5 cr onwards",
        about: "A premium residential project offering sustainable living.",
        description: "Upcoming luxury project in the greenest sector of Noida. World-class amenities including golf course and clubhouse.",
        projectSize: "10 Acres",
        launchDate: "Jan 2024",
        topAmenities: ["Golf Course", "Clubhouse", "Swimming Pool", "Gym", "Power Backup"],
        brochureUrl: "https://example.com/brochure.pdf",
        tags: ["New Launch", "Under Construction"],
        status: "Active"
    },
    {
        title: "Golden Palms Residency",
        imageName: "property-img-2.jpg",
        gallery: ["property-img-2.jpg"],
        type: "Lead",
        location: "Sector 110, Noida",
        priceRange: "₹2.2 cr to 3 cr",
        about: "Luxury apartments with modern amenities.",
        description: "Premium residential complex with smart home features. 70% open area.",
        projectSize: "5 Acres",
        launchDate: "Feb 2023",
        topAmenities: ["Smart Home", "Park", "Security", "Parking"],
        brochureUrl: "https://example.com/brochure.pdf",
        tags: ["Ready to Move"],
        status: "Active"
    },
    {
        title: "City Centre Commercial",
        imageName: "property-image-1.png",
        gallery: ["property-image-1.png"],
        type: "EOI",
        location: "Noida Extension",
        priceRange: "₹80 Lacs onwards",
        about: "Commercial hub for business and retail.",
        description: "High street retail shops and office spaces in integrated commercial hub.",
        projectSize: "20000 Sq/ft",
        launchDate: "Mar 2024",
        topAmenities: ["High Speed Elevators", "Fire Safety", "CCTV", "Power Backup"],
        brochureUrl: "https://example.com/brochure.pdf",
        tags: ["Commercial"],
        status: "Active"
    }
];

const seedDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, { family: 4 });
        console.log('MongoDB connected');

        // Clear existing projects
        await Project.deleteMany({});
        console.log('Cleared existing projects');

        // Insert new projects
        const insertedProjects = await Project.insertMany(projects);
        console.log(`Inserted ${insertedProjects.length} projects`);

        console.log('\nSeeded Projects:');
        insertedProjects.forEach(p => {
            console.log(`- ${p.title} (ID: ${p._id})`);
        });

        console.log('\n✅ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        process.exit(1);
    }
};

seedDatabase();

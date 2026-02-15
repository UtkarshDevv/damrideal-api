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
        type: "Ready to Move",
        location: {
            place: "Sector 150",
            city: "Noida"
        },
        priceRange: "₹1.5 cr onwards",
        about: "A premium residential project offering sustainable living.",
        description: "Upcoming luxury project in the greenest sector of Noida. World-class amenities including golf course and clubhouse.",
        options: "3BHK, 4BHK",
        totalUnits: 150,
        launchDate: "15-01-2024",
        topAmenities: "Golf Course, Clubhouse, Swimming Pool, Gym, Power Backup",
        brochureUrl: "https://example.com/brochure.pdf",
        tags: "New Launch, Under Construction",
        videoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        status: "Active"
    },
    {
        title: "Golden Palms Residency",
        imageName: "property-img-2.jpg",
        gallery: ["property-img-2.jpg"],
        type: "Ready to Move",
        location: {
            place: "Sector 110",
            city: "Noida"
        },
        priceRange: "₹2.2 cr to 3 cr",
        about: "Luxury apartments with modern amenities.",
        description: "Premium residential complex with smart home features. 70% open area.",
        options: "2BHK, 3BHK",
        totalUnits: 80,
        launchDate: "10-02-2023",
        topAmenities: "Smart Home, Park, Security, Parking",
        brochureUrl: "https://example.com/brochure.pdf",
        tags: "Ready to Move, Luxury",
        videoLink: "",
        status: "Active"
    },
    {
        title: "City Centre Commercial",
        imageName: "property-image-1.png",
        gallery: ["property-image-1.png"],
        type: "Pre-Launch",
        location: {
            place: "Extension",
            city: "Noida"
        },
        priceRange: "₹80 Lacs onwards",
        about: "Commercial hub for business and retail.",
        description: "High street retail shops and office spaces in integrated commercial hub.",
        options: "Shops, Offices",
        totalUnits: 50,
        launchDate: "05-03-2024",
        topAmenities: "High Speed Elevators, Fire Safety, CCTV, Power Backup",
        brochureUrl: "https://example.com/brochure.pdf",
        tags: "Commercial, Investment",
        videoLink: "",
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

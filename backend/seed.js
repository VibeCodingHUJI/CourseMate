const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Course = require('./models/Course');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coursemate';

async function seedDatabase() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // 2. Read the courses.json file from the parent directory
    const jsonPath = path.join(__dirname, '..', 'courses.json');
    if (!fs.existsSync(jsonPath)) {
      console.error('Error: courses.json not found in the project root.');
      process.exit(1);
    }

    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const scrapedCourses = JSON.parse(rawData);

    console.log(`Found ${scrapedCourses.length} courses in JSON.`);

    // 3. Map the scraped data to your Course model
    // Scraped keys: "Course ID", "Course Name", "Credits", "Semester", "Teacher"
    // Model keys: "title", "code", "description"
    const coursesToInsert = scrapedCourses.map(course => ({
      title: course["Course Name"],
      code: course["Course ID"],
      description: `Credits: ${course["Credits"]} | Semester: ${course["Semester"]} | Lecturer: ${course["Teacher"]}`,
      averageRating: 0,
      averageDifficulty: 0
    }));

    // 4. Insert into database
    // Using upsert (update if exists, insert if not) to avoid duplicates
    let insertCount = 0;
    for (const courseData of coursesToInsert) {
      await Course.findOneAndUpdate(
        { code: courseData.code },
        courseData,
        { upsert: true, new: true }
      );
      insertCount++;
    }

    console.log(`Successfully processed/updated ${insertCount} courses in the database.`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

seedDatabase();

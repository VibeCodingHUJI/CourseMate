const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Course = require('./models/Course');
const Review = require('./models/Review');
const Question = require('./models/Question');
const Material = require('./models/Material');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, track } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ name, email, password, track });
    await user.save();
    
    res.status(201).json({ 
      name: user.name, 
      email: user.email, 
      track: user.track, 
      isGuest: false 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({ 
      name: user.name, 
      email: user.email, 
      track: user.track, 
      isGuest: false 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Routes
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    res.json(course);
  } catch (err) {
    res.status(404).json({ message: 'Course not found' });
  }
});

app.get('/api/courses/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ courseId: req.params.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  const review = new Review({
    courseId: req.body.courseId,
    rating: req.body.rating,
    difficulty: req.body.difficulty,
    comment: req.body.comment
  });

  try {
    const newReview = await review.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/coursemate')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

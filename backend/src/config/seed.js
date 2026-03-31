const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Task = require('../models/Task');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB for seeding...');

  await User.deleteMany({});
  await Task.deleteMany({});

  const user = new User({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
});
await user.save();

  await Task.insertMany([
    {
      title: 'Design Landing Page',
      description: 'Create wireframes and mockups for the new landing page',
      status: 'pending',
      category: 'Design',
      priority: 'High',
      dueDate: new Date('2026-04-15'),
      user: user._id,
    },
    {
      title: 'Review Pull Requests',
      description: 'Review and merge pending PRs from the team',
      status: 'completed',
      category: 'Development',
      priority: 'Medium',
      dueDate: new Date('2026-03-28'),
      user: user._id,
    },
    {
      title: 'Update Documentation',
      description: 'Add new API endpoints to documentation',
      status: 'pending',
      category: 'Documentation',
      priority: 'Low',
      dueDate: new Date('2026-04-05'),
      user: user._id,
    },
    {
      title: 'Team Meeting Preparation',
      description: 'Prepare slides and agenda for quarterly review',
      status: 'pending',
      category: 'Management',
      priority: 'High',
      dueDate: new Date('2026-03-30'),
      user: user._id,
    },
  ]);

  console.log('Seed data inserted successfully!');
  console.log('Login: john@example.com / password123');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

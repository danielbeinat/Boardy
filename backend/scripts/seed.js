require('dotenv').config();
const User = require('../models/User');
const Board = require('../models/Board');
const mongoose = require('mongoose');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB with longer timeouts
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    // Clear existing data
    await User.deleteMany({});
    await Board.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create sample users one by one
    const users = [];
    const userData = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        avatarColor: '#3b82f6'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'Password123',
        avatarColor: '#ec4899'
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: 'Password123',
        avatarColor: '#10b981'
      }
    ];

    for (const user of userData) {
      const createdUser = await User.create(user);
      users.push(createdUser);
    }

    console.log(`👥 Created ${users.length} users`);

    // Create sample boards
    const boards = await Board.create([
      {
        title: 'Project Management',
        description: 'Main project board for team collaboration',
        createdBy: users[0]._id,
        members: [
          { user: users[0]._id, role: 'owner' },
          { user: users[1]._id, role: 'admin' },
          { user: users[2]._id, role: 'member' }
        ],
        lists: [
          {
            title: 'Backlog',
            createdBy: users[0]._id,
            position: 0,
            cards: [
              {
                title: 'Setup project infrastructure',
                description: 'Configure CI/CD pipeline and deployment',
                createdBy: users[0]._id,
                position: 0,
                labels: [
                  { id: '1', text: 'Infrastructure', color: '#ef4444' },
                  { id: '2', text: 'High Priority', color: '#f97316' }
                ]
              },
              {
                title: 'Design database schema',
                description: 'Create ERD and define relationships',
                createdBy: users[1]._id,
                position: 1,
                labels: [
                  { id: '3', text: 'Design', color: '#3b82f6' }
                ]
              }
            ]
          },
          {
            title: 'In Progress',
            createdBy: users[0]._id,
            position: 1,
            cards: [
              {
                title: 'Implement authentication',
                description: 'JWT-based auth with refresh tokens',
                createdBy: users[0]._id,
                position: 0,
                labels: [
                  { id: '4', text: 'Backend', color: '#8b5cf6' },
                  { id: '5', text: 'Security', color: '#ef4444' }
                ],
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
              }
            ]
          },
          {
            title: 'Review',
            createdBy: users[1]._id,
            position: 2,
            cards: [
              {
                title: 'Code review - API endpoints',
                description: 'Review REST API implementation',
                createdBy: users[2]._id,
                position: 0,
                labels: [
                  { id: '6', text: 'Review', color: '#eab308' }
                ]
              }
            ]
          },
          {
            title: 'Done',
            createdBy: users[0]._id,
            position: 3,
            cards: [
              {
                title: 'Project setup',
                description: 'Initial project structure and dependencies',
                createdBy: users[0]._id,
                position: 0,
                labels: [
                  { id: '7', text: 'Completed', color: '#22c55e' }
                ]
              }
            ]
          }
        ]
      },
      {
        title: 'Marketing Campaign',
        description: 'Q1 2024 marketing initiatives',
        createdBy: users[1]._id,
        members: [
          { user: users[1]._id, role: 'owner' },
          { user: users[2]._id, role: 'member' }
        ],
        lists: [
          {
            title: 'Ideas',
            createdBy: users[1]._id,
            position: 0,
            cards: [
              {
                title: 'Social media strategy',
                description: 'Plan Instagram and TikTok content',
                createdBy: users[1]._id,
                position: 0,
                labels: [
                  { id: '8', text: 'Marketing', color: '#ec4899' },
                  { id: '9', text: 'Social Media', color: '#06b6d4' }
                ]
              }
            ]
          },
          {
            title: 'In Progress',
            createdBy: users[1]._id,
            position: 1,
            cards: []
          },
          {
            title: 'Completed',
            createdBy: users[1]._id,
            position: 2,
            cards: [
              {
                title: 'Brand guidelines',
                description: 'Create comprehensive brand book',
                createdBy: users[2]._id,
                position: 0,
                labels: [
                  { id: '10', text: 'Branding', color: '#8b5cf6' },
                  { id: '11', text: 'Completed', color: '#22c55e' }
                ]
              }
            ]
          }
        ]
      }
    ]);

    console.log(`📋 Created ${boards.length} boards`);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📧 Sample users:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} - ${user.email} (Password: Password123)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run the seeding
seedData();

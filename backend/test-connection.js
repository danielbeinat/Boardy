require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('🔍 Testing MongoDB connection...');
    console.log('📡 Connection string:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    
    console.log('✅ Connected to MongoDB successfully!');
    
    // Test database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📊 Collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected successfully');
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    
    if (error.name === 'MongoServerError') {
      console.error('🔍 MongoDB Server Error:', error.codeKey);
    }
    
    if (error.name === 'MongooseServerSelectionError') {
      console.error('🌐 Network/Access issue - Check IP whitelist in Atlas');
    }
    
    process.exit(1);
  }
}

testConnection();

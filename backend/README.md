# Trello Clone Backend

Backend API for Trello Clone application built with Node.js, Express, MongoDB, and JWT authentication.

## 🚀 Features

- **Authentication**: JWT-based login/register system
- **User Management**: Profile management and password changes
- **Board Management**: Create, read, update, delete boards
- **List & Card Management**: Full CRUD operations for lists and cards
- **Labels & Due Dates**: Rich card features
- **Member Management**: Add/remove members with role-based permissions
- **Security**: Password hashing, rate limiting, input validation
- **Data Seeding**: Sample data for testing

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

1. Clone the repository
2. Navigate to backend directory
3. Install dependencies:
   ```bash
   npm install
   ```

## ⚙️ Configuration

1. Create a `.env` file in the root directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/trello-clone
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   ```

2. Update the `MONGODB_URI` with your MongoDB connection string

## 🗄️ Database Setup

### Option 1: Local MongoDB
```bash
# Start MongoDB service
mongod
```

### Option 2: MongoDB Atlas
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get your connection string
4. Update the `MONGODB_URI` in your `.env` file

## 🌱 Database Seeding

To populate the database with sample data:

```bash
npm run seed
```

This will create:
- 3 sample users
- 2 sample boards with lists and cards
- Sample labels and due dates

**Sample Users:**
- john@example.com (Password: Password123)
- jane@example.com (Password: Password123)
- bob@example.com (Password: Password123)

## 🚀 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Boards
- `GET /api/board` - Get user's boards
- `POST /api/board` - Create new board
- `GET /api/board/:id` - Get specific board
- `PUT /api/board/:id` - Update board
- `DELETE /api/board/:id` - Delete board
- `POST /api/board/:id/lists` - Add list to board
- `POST /api/board/:id/lists/:listId/cards` - Add card to list

### User
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/password` - Change password
- `DELETE /api/user/account` - Delete account

### Health Check
- `GET /api/health` - Server health status

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Login/Register**: Returns a JWT token
2. **Protected Routes**: Include `Authorization: Bearer <token>` header
3. **Token Expiration**: Tokens expire after 7 days (configurable)

## 🛡️ Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: express-validator for request validation
- **Rate Limiting**: Prevents brute force attacks
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **JWT Security**: Token expiration and validation

## 📊 Data Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  avatarColor: String,
  isActive: Boolean,
  lastLogin: Date
}
```

### Board
```javascript
{
  title: String,
  description: String,
  lists: [List],
  members: [{ user: ObjectId, role: String }],
  isPublic: Boolean,
  createdBy: ObjectId
}
```

### List
```javascript
{
  title: String,
  cards: [Card],
  position: Number,
  createdBy: ObjectId
}
```

### Card
```javascript
{
  title: String,
  description: String,
  labels: [{ id: String, text: String, color: String }],
  dueDate: Date,
  position: Number,
  createdBy: ObjectId
}
```

## 🧪 Testing

You can test the API using:
- Postman
- curl commands
- Any HTTP client

Example curl commands:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password123"}'

# Get boards (with token)
curl -X GET http://localhost:5000/api/board \
  -H "Authorization: Bearer <your-jwt-token>"
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/trello-clone
JWT_SECRET=your-production-secret-key
JWT_EXPIRE=7d
```

### Recommended Hosting
- **Backend**: Heroku, Vercel, DigitalOcean, AWS
- **Database**: MongoDB Atlas
- **Environment**: Always use environment variables for sensitive data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please:
1. Check the existing issues
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## 🔄 Next Steps

- Add email verification
- Implement password reset functionality
- Add real-time updates with WebSockets
- Add file attachments for cards
- Implement board templates
- Add activity logs and notifications

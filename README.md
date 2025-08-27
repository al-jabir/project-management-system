# Project Management System

A robust RESTful API service designed to support collaborative project management. Built with Node.js, Express, and MongoDB.

## Features

### 🔐 Authentication & Authorization

- Complete user authentication system
- JWT-based authorization
- Email verification
- Password reset functionality
- Role-based access control (Admin, Project Admin, Member)

### 📋 Project Management

- Create and manage projects
- Assign roles to team members
- Project member management
- Role-based permissions
- Project archiving capability

### ✅ Task Management

- Create and assign tasks
- File attachments support
- Priority levels (Low, Medium, High)
- Status tracking (Todo, In Progress, Done)
- Task completion monitoring
- Multiple file attachments per task

### 📝 Subtask Management

- Break down tasks into subtasks
- Track subtask completion
- Automatic task status updates based on subtasks
- Member completion tracking

### 📌 Project Notes

- Admin-only creation and modification
- Shared viewing for all project members
- Rich text content support
- Note archiving system

### 🛠️ Technical Features

- Input validation using Zod
- Error handling middleware
- File upload support with Multer
- MongoDB integration with Mongoose
- JWT authentication
- Email service integration
- API response standardization

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT
- **Validation**: Zod
- **File Upload**: Multer
- **Email Service**: Nodemailer

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/al-jabir/project-management-system.git
   cd project-management-system
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a .env file in the root directory with the following variables:
   \`\`\`env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRY=1d
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   CORS_ORIGIN=http://localhost:5173
   \`\`\`

4. Start the server:
   \`\`\`bash

# Development

npm run dev

# Production

npm start
\`\`\`

## API Documentation

### Authentication Endpoints

\`\`\`
POST /api/v1/auth/register - Register a new user
POST /api/v1/auth/login - Login user
GET /api/v1/auth/verify-email - Verify email
POST /api/v1/auth/forgot-password - Request password reset
POST /api/v1/auth/reset-password - Reset password
POST /api/v1/auth/logout - Logout user
\`\`\`

### Project Endpoints

\`\`\`
GET /api/v1/projects - List all accessible projects
POST /api/v1/projects - Create a new project
GET /api/v1/projects/:id - Get project details
PUT /api/v1/projects/:id - Update project
DELETE /api/v1/projects/:id - Delete project
POST /api/v1/projects/:id/members - Add project member
DELETE /api/v1/projects/:id/members/:memberId - Remove member
PATCH /api/v1/projects/:id/members/:memberId - Update member role
\`\`\`

### Task Endpoints

\`\`\`
POST /api/v1/tasks - Create a task
GET /api/v1/tasks/project/:id - List project tasks
GET /api/v1/tasks/:id - Get task details
PUT /api/v1/tasks/:id - Update task
DELETE /api/v1/tasks/:id - Delete task
DELETE /api/v1/tasks/:id/attachments/:attachmentId - Remove attachment
\`\`\`

### Subtask Endpoints

\`\`\`
POST /api/v1/tasks/:id/subtasks - Add subtask
PATCH /api/v1/tasks/:id/subtasks/:subtaskId - Update subtask
DELETE /api/v1/tasks/:id/subtasks/:subtaskId - Delete subtask
\`\`\`

### Note Endpoints

\`\`\`
POST /api/v1/notes - Create a note
GET /api/v1/notes/project/:id - List project notes
GET /api/v1/notes/:id - Get note details
PUT /api/v1/notes/:id - Update note
DELETE /api/v1/notes/:id - Delete note
\`\`\`

### System Endpoints

\`\`\`
GET /api/v1/healthcheck - System health status
\`\`\`

## Error Handling

The API uses standard HTTP status codes and returns errors in the following format:

\`\`\`json
{
"success": false,
"message": "Error message",
"error": "Detailed error information",
"statusCode": 400
}
\`\`\`

## Success Response Format

All successful responses follow this structure:

\`\`\`json
{
"success": true,
"message": "Operation successful",
"data": {},
"statusCode": 200
}
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

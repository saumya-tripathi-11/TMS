# Task Manager — Backend API

Node.js + Express + MongoDB backend for the Task Management System frontend.

---

## Tech Stack

| Layer       | Technology                         |
|-------------|-------------------------------------|
| Runtime     | Node.js                             |
| Framework   | Express.js                          |
| Database    | MongoDB (Mongoose ODM)              |
| Auth        | JWT (jsonwebtoken) + bcryptjs       |
| Validation  | express-validator                   |
| Dev server  | nodemon                             |

---

## Project Structure

```
backend/
├── src/
│   ├── server.js               # Entry point
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── seed.js             # Demo data seeder
│   ├── models/
│   │   ├── User.js             # User schema (ER diagram)
│   │   └── Task.js             # Task schema (ER diagram)
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, Profile
│   │   └── taskController.js   # Full CRUD + subtasks + comments
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── taskRoutes.js
│   └── middleware/
│       └── authMiddleware.js   # JWT protect middleware
├── .env.example
├── package.json
└── README.md
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env from example
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET

# 3. (Optional) Seed demo data
npm run seed

# 4. Start dev server
npm run dev

# 5. Production
npm start
```

---

## Environment Variables

| Variable       | Description                          | Default                    |
|----------------|--------------------------------------|----------------------------|
| PORT           | Server port                          | 5000                       |
| MONGO_URI      | MongoDB connection string            | mongodb://localhost/taskmanager |
| JWT_SECRET     | Secret key for signing JWTs          | (required)                 |
| JWT_EXPIRES_IN | JWT expiry duration                  | 7d                         |
| CLIENT_URL     | Frontend URL for CORS                | http://localhost:5173       |

---

## API Reference

### Auth  `/api/auth`

| Method | Endpoint         | Access  | Description          |
|--------|-----------------|---------|----------------------|
| POST   | /register       | Public  | Create account       |
| POST   | /login          | Public  | Login, get JWT       |
| GET    | /me             | Private | Get logged-in user   |
| PUT    | /me             | Private | Update profile       |

**Register / Login body:**
```json
{ "name": "John Doe", "email": "john@example.com", "password": "password123" }
```

**Response (login/register):**
```json
{
  "success": true,
  "token": "<JWT>",
  "user": { "id": "...", "name": "John Doe", "email": "john@example.com" }
}
```

---

### Tasks  `/api/tasks`  *(all routes require `Authorization: Bearer <token>`)*

| Method | Endpoint                         | Description                    |
|--------|----------------------------------|--------------------------------|
| GET    | /                                | Get all tasks (with filters)   |
| POST   | /                                | Create a task                  |
| GET    | /:id                             | Get a single task              |
| PUT    | /:id                             | Update a task                  |
| DELETE | /:id                             | Delete a task                  |
| PATCH  | /:id/complete                    | Mark task as completed         |
| POST   | /:id/subtasks                    | Add a subtask                  |
| PATCH  | /:id/subtasks/:subtaskId         | Toggle subtask done/undone     |
| POST   | /:id/comments                    | Add a comment                  |

**GET /api/tasks — query params:**
```
?status=pending|completed
?priority=Low|Medium|High
?category=Design
?search=landing
?sort=dueDate|-dueDate|createdAt|-createdAt
```

**Create / Update task body:**
```json
{
  "title": "Design Landing Page",
  "description": "Create wireframes...",
  "category": "Design",
  "priority": "High",
  "dueDate": "2026-04-15",
  "status": "pending",
  "assignedTo": "John Doe"
}
```

---

## Connecting to Frontend

In your React frontend, replace the mock data with real API calls.

**1. Install axios (or use fetch):**
```bash
npm install axios
```

**2. Create `src/lib/api.js`:**
```js
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

**3. Replace mock data in TaskDashboard:**
```js
import api from '../lib/api';

// In useEffect:
const { data } = await api.get('/tasks');
setTasks(data.tasks);
setStats(data.stats);
```

**4. Replace handleDelete:**
```js
await api.delete(`/tasks/${id}`);
```

**5. Replace handleMarkCompleted in TaskDetail:**
```js
await api.patch(`/tasks/${id}/complete`);
```

**6. Replace handleSubmit in AddTaskForm:**
```js
await api.post('/tasks', formData);         // create
await api.put(`/tasks/${id}`, formData);    // edit
```

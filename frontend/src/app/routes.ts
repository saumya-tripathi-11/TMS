import { createBrowserRouter } from 'react-router'
import { TaskDashboard } from './components/TaskDashboard'
import { AddTaskForm } from './components/AddTaskForm'
import { TaskDetail } from './components/TaskDetail'
import { Login } from './components/Login'
import { Register } from './components/Register'

export const router = createBrowserRouter([
  { path: '/',              Component: TaskDashboard },
  { path: '/login',         Component: Login         },
  { path: '/register',      Component: Register      },
  { path: '/add-task',      Component: AddTaskForm   },
  { path: '/task/:id',      Component: TaskDetail    },
  { path: '/edit-task/:id', Component: AddTaskForm   },
])
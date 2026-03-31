const express = require('express');
const { body } = require('express-validator');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  markComplete,
  addSubtask,
  toggleSubtask,
  addComment,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All task routes require authentication
router.use(protect);

// ─── Validation rules ─────────────────────────────────────────
const createTaskRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'completed']).withMessage('Status must be pending or completed'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High'),
];

// ─── Core CRUD ────────────────────────────────────────────────
router.route('/')
  .get(getTasks)
  .post(createTaskRules, createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

// ─── Management actions (from ER diagram) ────────────────────
router.patch('/:id/complete',                    markComplete);   // Marks Complete
router.post('/:id/subtasks',                     addSubtask);
router.patch('/:id/subtasks/:subtaskId',         toggleSubtask);
router.post('/:id/comments',                     addComment);

module.exports = router;

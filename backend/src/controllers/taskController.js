const { validationResult } = require('express-validator');
const Task = require('../models/Task');

// ─── @route   GET /api/tasks ──────────────────────────────────
// ─── @access  Private
// Supports: ?status=pending|completed  ?priority=Low|Medium|High
//           ?category=...  ?search=...  ?sort=dueDate|-dueDate|createdAt|-createdAt
const getTasks = async (req, res) => {
  try {
    const { status, priority, category, search, sort } = req.query;

    // Always scope to the logged-in user
    const filter = { user: req.user._id };

    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = new RegExp(category, 'i');
    if (search) {
      filter.$or = [
        { title:       new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    // Sorting
    const sortMap = {
      dueDate:    { dueDate: 1 },
      '-dueDate': { dueDate: -1 },
      createdAt:  { createdAt: 1 },
      '-createdAt': { createdAt: -1 },
    };
    const sortBy = sortMap[sort] || { createdAt: -1 };

    const tasks = await Task.find(filter).sort(sortBy);

    // Stats for the dashboard header cards
    const total     = await Task.countDocuments({ user: req.user._id });
    const pending   = await Task.countDocuments({ user: req.user._id, status: 'pending' });
    const completed = await Task.countDocuments({ user: req.user._id, status: 'completed' });

    res.json({
      success: true,
      count: tasks.length,
      stats: { total, pending, completed },
      tasks,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @route   GET /api/tasks/:id ─────────────────────────────
// ─── @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @route   POST /api/tasks ────────────────────────────────
// ─── @access  Private
const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, description, category, priority, dueDate, status, assignedTo } = req.body;

    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      category,
      priority,
      dueDate: dueDate || null,
      status,
      assignedTo,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @route   PUT /api/tasks/:id ─────────────────────────────
// ─── @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const allowed = ['title', 'description', 'category', 'priority', 'dueDate', 'status', 'assignedTo'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    await task.save();

    res.json({
      success: true,
      message: 'Task updated.',
      task,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @route   DELETE /api/tasks/:id ──────────────────────────
// ─── @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @route   PATCH /api/tasks/:id/complete ──────────────────
// ─── @access  Private  (Management → Marks Complete from ER diagram)
const markComplete = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    task.status = 'completed';
    await task.save();

    res.json({
      success: true,
      message: 'Task marked as completed.',
      task,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @route   POST /api/tasks/:id/subtasks ───────────────────
// ─── @access  Private
const addSubtask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Subtask title is required.' });
    }

    task.subtasks.push({ title: title.trim() });
    await task.save();

    res.status(201).json({
      success: true,
      message: 'Subtask added.',
      subtasks: task.subtasks,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @route   PATCH /api/tasks/:id/subtasks/:subtaskId ───────
// ─── @access  Private
const toggleSubtask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({ success: false, message: 'Subtask not found.' });
    }

    subtask.isCompleted = !subtask.isCompleted;
    await task.save();

    res.json({
      success: true,
      message: `Subtask marked as ${subtask.isCompleted ? 'completed' : 'pending'}.`,
      subtasks: task.subtasks,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @route   POST /api/tasks/:id/comments ───────────────────
// ─── @access  Private
const addComment = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required.' });
    }

    task.comments.push({
      user: req.user.name,
      content: content.trim(),
    });
    await task.save();

    res.status(201).json({
      success: true,
      message: 'Comment added.',
      comments: task.comments,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  markComplete,
  addSubtask,
  toggleSubtask,
  addComment,
};

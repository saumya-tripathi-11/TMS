const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    // FK → User.user_id (from ER diagram)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
    },

    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    // ENUM from ER diagram
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },

    // Extra fields from the frontend
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },

    category: {
      type: String,
      trim: true,
      default: '',
    },

    dueDate: {
      type: Date,
      default: null,
    },

    assignedTo: {
      type: String,
      trim: true,
      default: '',
    },

    subtasks: [subtaskSchema],

    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);


taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);

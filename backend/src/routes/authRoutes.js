const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, updateMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();


const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];


router.post('/register', registerRules, register);
router.post('/login',    loginRules,    login);
router.get('/me',        protect,       getMe);
router.put('/me',        protect,       updateMe);

module.exports = router;

const express = require('express');
const { body } = require('express-validator');
const { chat, getInsights } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/insights', getInsights);
router.post(
  '/chat',
  [body('message').trim().notEmpty().withMessage('Message is required')],
  validate,
  chat
);

module.exports = router;

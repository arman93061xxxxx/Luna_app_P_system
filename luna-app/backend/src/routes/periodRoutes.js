const express = require('express');
const { body } = require('express-validator');
const { createLog, updateLog, deleteLog, getLogs, getPredictions } = require('../controllers/periodController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/predictions/latest', getPredictions);
router.get('/', getLogs);
router.post(
  '/',
  [body('startDate').isISO8601().withMessage('Valid start date required')],
  validate,
  createLog
);
router.put('/:id', updateLog);
router.delete('/:id', deleteLog);

module.exports = router;

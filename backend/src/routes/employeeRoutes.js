const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin'), getAllEmployees);
router.get('/:id', authenticate, authorize('admin'), getEmployeeById);
router.post('/', authenticate, authorize('admin'), createEmployee);
router.put('/:id', authenticate, authorize('admin'), updateEmployee);
router.delete('/:id', authenticate, authorize('admin'), deleteEmployee);

module.exports = router;

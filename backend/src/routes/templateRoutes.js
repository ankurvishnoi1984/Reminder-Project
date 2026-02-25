const express = require('express');

const { templateUpload } = require('../middleware/upload');
const router = express.Router();
const {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate
} = require('../controllers/templateController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin'), getAllTemplates);
router.get('/:id', authenticate, authorize('admin'), getTemplateById);
router.post('/', authenticate, authorize('admin'), templateUpload.array('attachments', 5), createTemplate);
router.put('/:id', authenticate, authorize('admin'),templateUpload.array('attachments', 5), updateTemplate);
router.delete('/:id', authenticate, authorize('admin'), deleteTemplate);

module.exports = router;

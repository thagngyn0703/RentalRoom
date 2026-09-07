const express = require('express');
const { faqController } = require('../controllers/faqController');
const { verifyAdmin } = require('../middleware/middlewareControllers');

const router = express.Router();
router.get('/', verifyAdmin, faqController.listAdmin);
router.post('/', verifyAdmin, faqController.create);
router.put('/:id', verifyAdmin, faqController.update);
router.patch('/:id/status', verifyAdmin, faqController.updateStatus);
router.delete('/:id', verifyAdmin, faqController.remove);

module.exports = router;

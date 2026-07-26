const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const { verifyToken, verifyAdmin } = require('../middleware/middlewareControllers');

router.post('/', verifyToken, withdrawalController.create);
router.get('/mine', verifyToken, withdrawalController.listMine);
router.put('/:id/cancel', verifyToken, withdrawalController.cancel);

router.get('/admin/pending', verifyAdmin, withdrawalController.listPendingAdmin);
router.put('/admin/:id/approve', verifyAdmin, withdrawalController.approve);
router.put('/admin/:id/reject', verifyAdmin, withdrawalController.reject);

module.exports = router;

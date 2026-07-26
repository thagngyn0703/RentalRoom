const middlewareControllers = require('../middleware/middlewareControllers');
const userControllers = require('../controllers/userController');

const router = require('express').Router();

router.get('/', middlewareControllers.verifyAdmin, userControllers.getAllUsers);
router.get('/:id', middlewareControllers.verifyToken, userControllers.getUser);
router.put('/:id', middlewareControllers.verifyToken, userControllers.updateUser);
router.put('/:id/ban', middlewareControllers.verifyAdmin, userControllers.banUser);
router.put('/:id/unban', middlewareControllers.verifyAdmin, userControllers.unbanUser);
router.delete('/:id', middlewareControllers.verifyAdmin, userControllers.deleteUser);

module.exports = router;

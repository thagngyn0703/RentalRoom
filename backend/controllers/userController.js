const User = require('../models/Users');

const userController = {
    getUser: async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) return res.status(404).send('User not found');
            res.status(200).json(user);
        } catch (error) {
            res.status(500).send('Error fetching user');
        }
    },
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find().select('-password'); // Loại bỏ password khỏi response
            res.status(200).json(users);
        } catch (error) {
            res.status(500).send('Error fetching users');
        }
    },
    updateUser: async (req, res) => {
        try {
            const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!user) return res.status(404).send('User not found');
            res.status(200).json(user);
        } catch (error) {
            res.status(500).send('Error updating user');
        }
    },
    deleteUser: async (req, res) => {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            return res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting user' });
        }
    },
    banUser: async (req, res) => {
        try {
            const user = await User.findByIdAndUpdate(
                req.params.id,
                { isBanned: true },
                { new: true }
            ).select('-password');
            if (!user) return res.status(404).json({ message: 'User not found' });
            return res.status(200).json({ message: 'Đã cấm tài khoản', user });
        } catch (error) {
            return res.status(500).json({ message: 'Error banning user' });
        }
    },
    unbanUser: async (req, res) => {
        try {
            const user = await User.findByIdAndUpdate(
                req.params.id,
                { isBanned: false },
                { new: true }
            ).select('-password');
            if (!user) return res.status(404).json({ message: 'User not found' });
            return res.status(200).json({ message: 'Đã mở khóa tài khoản', user });
        } catch (error) {
            return res.status(500).json({ message: 'Error unbanning user' });
        }
    }
}


module.exports = userController;

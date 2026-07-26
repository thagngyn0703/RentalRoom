import { getUserFailure, getUserStart, getUserSuccess, deleteUserStart, deleteUserSuccess, deleteUserFailure } from '../../redux/slices/userSlice';
import axiosJWT from '../../config/axiosJWT';

// Get all users (for admin)
export const getAllUsers = async (dispatch) => {
    dispatch(getUserStart());
    try {
        console.log("👥 Getting all users...");
        // axiosJWT will automatically add token via interceptor
        const res = await axiosJWT.get('/api/users');
        dispatch(getUserSuccess(res.data));
        console.log("✅ Users fetched successfully");
        return res.data;
    } catch (error) {
        dispatch(getUserFailure());
        console.error('Error getting all users:', error);
        throw error;
    }
}

// Delete user
export const deleteUser = async (userId, dispatch) => {
    dispatch(deleteUserStart());
    try {
        const res = await axiosJWT.delete(`/api/users/${userId}`);
        dispatch(deleteUserSuccess(res.data));
        return res.data;
    } catch (error) {
        dispatch(deleteUserFailure());
        console.error('Error deleting user:', error);
        throw error;
    }
};

// Cấm tài khoản (chỉ admin)
export const banUser = async (userId) => {
    try {
        const res = await axiosJWT.put(`/api/users/${userId}/ban`);
        return res.data;
    } catch (error) {
        console.error('Error banning user:', error);
        throw error;
    }
};

// Mở khóa tài khoản (chỉ admin)
export const unbanUser = async (userId) => {
    try {
        const res = await axiosJWT.put(`/api/users/${userId}/unban`);
        return res.data;
    } catch (error) {
        console.error('Error unbanning user:', error);
        throw error;
    }
};
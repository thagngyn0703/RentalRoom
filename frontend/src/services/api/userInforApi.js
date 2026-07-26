import axiosJWT from '../../config/axiosJWT';
import { getUserInforFailure, getUserInforStart, getUserInforSuccess, updateInforStart, updateInforSuccess, updateInforFailure } from '../../redux/slices/userInforSlice';

// Get user information 
export const getUserInfor = async (userId, dispatch) => {
    dispatch(getUserInforStart());
    try {
        const res = await axiosJWT.get(`/api/user-info/me`);
        dispatch(getUserInforSuccess(res.data));
        return res.data;
    } catch (error) {
        dispatch(getUserInforFailure());
        return null;
    }
};
// Update user information
export const updateUserInfor = async ( userData, dispatch) => {
    dispatch(updateInforStart());   
    try {
        const res = await axiosJWT.post(`/api/user-info`, userData);
        dispatch(updateInforSuccess(res.data));
        return res.data;
    } catch (error) {
        dispatch(updateInforFailure());
        return null;
    }
};

import axios from '../../config/axios';
import { loginStart, loginSuccess, loginFailure, registerFailure, registerStart, registerSuccess, logout } from '../../redux/slices/authSlice';

export const loginUser = async (user, dispatch, navigate) => {
    //login
    dispatch(loginStart());
    try {
        const res = await axios.post('/api/auth/login', user);
        dispatch(loginSuccess({
            user: res.data.user,
            accessToken: res.data.accessToken
        }));
        if (res.data.user.role === 'admin') {
            navigate("/admin");
        }
        if (res.data.user.role === 'user') {
            navigate("/");
        }
    } catch (error) {
        dispatch(loginFailure());
    }
}

//register
export const registerUser = async (user, dispatch, navigate) => {
    dispatch(registerStart());
    try {
        const res = await axios.post('/api/auth/register', user);
        dispatch(registerSuccess(res.data));
        navigate("/login");
    } catch (error) {
        dispatch(registerFailure());
    }
}

//logout
export const logoutUser = async (dispatch, navigate) => {
    try {
        await axios.post('/api/auth/logout');
        dispatch(logout());
        navigate('/');
    } catch (error) {
        // Ngay cả khi API call thất bại, vẫn logout ở frontend
        dispatch(logout());
        navigate('/');
    }
}
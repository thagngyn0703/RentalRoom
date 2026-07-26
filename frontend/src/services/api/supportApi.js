import axiosJWT from '../../config/axiosJWT';

const supportApi = {
    // Admin APIs
    getAllSupports: (params = {}) => {
        const { page = 1, limit = 10, status = 'all' } = params;
        return axiosJWT.get(`/api/support/admin/all?page=${page}&limit=${limit}&status=${status}`);
    },

    updateSupportStatus: (id, status) => {
        return axiosJWT.put(`/api/support/admin/${id}/status`, { status });
    },

    replySupport: (id, reply) => {
        return axiosJWT.put(`/api/support/admin/${id}/reply`, { reply });
    },

    // User APIs
    createSupport: (data) => {
        return axiosJWT.post('/api/support', data);
    },

    getMySupports: () => {
        return axiosJWT.get('/api/support/mine');
    },

    getCaptcha: () => {
        return axiosJWT.get('/api/support/captcha');
    }
};

export default supportApi;

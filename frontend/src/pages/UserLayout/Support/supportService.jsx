import axiosJWT from '../../../config/axiosJWT';

export const getCaptcha = async () => {
    return await axiosJWT.get('/api/support/captcha');
};

export const sendSupport = async (form, captchaToken) => {
    const payload = {
        name: form.name?.trim() || '',
        phone: form.phone?.trim() || '',
        message: form.message?.trim() || '',
        captcha: {
            code: (form.captchaCode || '').trim(),
            token: captchaToken || '',
        },
    };
    return await axiosJWT.post('/api/support', payload);
};

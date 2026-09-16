import axios from 'axios';
import axiosJWT from '../../config/axiosJWT';
import {
    fetchPostsStart,
    fetchPostsSuccess,
    fetchPostsFailure,
    deletePostStart,
    deletePostSuccess,
    deletePostFailure,
    fetchPostStart,
    fetchPostSuccess,
    fetchPostFailure,
    createPostStart,
    createPostSuccess,
    createPostFailure,
} from '../../redux/slices/postSlice';

// --- Cloudinary upload helpers (module-level, standalone) ---
const getSignature = async (folderSuffix = '') => {
    const q = folderSuffix ? `?folder=${encodeURIComponent(folderSuffix)}` : '';
    const res = await axiosJWT.get(`/api/cloudinary/sign${q}`);
    return res.data;
};

const uploadOneToCloudinary = async (file, sigParam) => {
    const sig = sigParam || await getSignature();
    const fd = new FormData();
    fd.append('file', file);
    fd.append('api_key', sig.apiKey);
    fd.append('timestamp', sig.timestamp);
    fd.append('signature', sig.signature);
    if (sig.folder) fd.append('folder', sig.folder);
    const cloudUrl = `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`;
    const cfg = { withCredentials: false };
    const r = await axios.post(cloudUrl, fd, cfg);
    return r.data;
};

const moduleUploadFiles = async (files = [], folder = 'posts', concurrency = 3) => {
    if (!Array.isArray(files) || files.length === 0) return [];
    let batchSig = null;
    try {
        const parts = String(folder || '').split('/').filter(Boolean);
        const suffix = parts.length ? parts[parts.length - 1] : '';
        batchSig = await getSignature(suffix);
        console.log('Cloudinary batch signature:', { folder: batchSig.folder, apiKey: batchSig.apiKey, timestamp: batchSig.timestamp });
    } catch (e) {
        console.error('Failed to obtain Cloudinary signature for batch upload', e);
        throw e;
    }

    const results = new Array(files.length);
    let idx = 0;
    const worker = async () => {
        while (true) {
            const i = idx++;
            if (i >= files.length) return;
            try {
                const res = await uploadOneToCloudinary(files[i], batchSig);
                const url = res.secure_url || res.url || res.secureUrl || null;
                // Do not perform server-side verification; accept returned URL as-is
                results[i] = url;
            } catch (e) {
                results[i] = { __uploadError: e };
            }
        }
    };
    const workers = Array(Math.min(concurrency, files.length)).fill().map(() => worker());
    await Promise.all(workers);

    const errors = [];
    const urls = results.map((r, idx) => {
        if (r && r.__uploadError) {
            const e = r.__uploadError;
            errors.push({ index: idx, message: e?.message, status: e?.response?.status, body: e?.response?.data });
            return null;
        }
        return (typeof r === 'string' && r) ? r : null;
    });

    if (errors.length) {
        const err = new Error('One or more uploads failed');
        err.details = { errors, partialUrls: urls };
        throw err;
    }
    return urls;
};

// lấy danh sách bài đăng đơn giản (không dùng redux)
export const fetchPosts = async () => {
    const res = await axios.get('/api/posts');
    return res.data.posts || [];
};

// Lấy danh sách tất cả phòng trọ từ database
export const fetchHomeSummary = async (statsIds = []) => {
    const res = await axios.get('/api/posts/rooms', { params: { homeSummary: 1, statsIds: statsIds.slice(0, 50).join(',') } });
    return res.data;
};

export const fetchAllRooms = async ({ page = 1, limit = 2000 } = {}) => {
    try {
        const res = await axios.get('/api/posts/rooms', { params: { page, limit } });
        return res.data?.rooms || [];
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return [];
    }
};

// Admin: lấy tất cả bài đăng (kể cả rejected) để quản lý / xóa
export const fetchAllPostsAdmin = async () => {
    const res = await axiosJWT.get('/api/posts/admin/all');
    return res.data?.posts || [];
};

// Fetch rooms with server-side pagination and filters
export const fetchRooms = async ({ page = 1, limit = 12, search = '', searchType, minPrice, maxPrice, minArea, maxArea, minRating, city, district, ward, types, utilities, sort, postType, textSearchAI, checkInDate, checkOutDate } = {}) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (searchType) params.searchType = searchType;
    if (minPrice !== undefined) params.minPrice = minPrice;
    if (maxPrice !== undefined) params.maxPrice = maxPrice;
    if (minArea !== undefined) params.minArea = minArea;
    if (maxArea !== undefined) params.maxArea = maxArea;
    if (minRating !== undefined && minRating !== null && minRating !== '') params.minRating = minRating;
    if (city) params.city = city;
    if (district) params.district = district;
    if (ward) params.ward = ward;
    if (types) params.types = Array.isArray(types) ? types.join(',') : types;
    if (utilities) params.utilities = Array.isArray(utilities) ? utilities.join(',') : utilities;
    if (sort) params.sort = sort;
    if (postType) params.postType = postType;
    if (textSearchAI) params.textSearchAI = textSearchAI;
    if (checkInDate) params.checkInDate = checkInDate;
    if (checkOutDate) params.checkOutDate = checkOutDate;

    console.log('📡 [FRONTEND API] fetchRooms API call with params:', params);
    console.log('📡 [FRONTEND API] postType value:', postType, 'type:', typeof postType);
    console.log('📡 [FRONTEND API] utilities value:', utilities, 'type:', typeof utilities);
    console.log('📡 [FRONTEND API] textSearchAI value:', textSearchAI);

    try {
        const res = await axios.get('/api/posts/rooms', { params });
        console.log('📡 [FRONTEND API] Response:', res.data?.success, 'rooms count:', res.data?.rooms?.length);
        if (res.data?.aiMessage) {
            console.log('🤖 [FRONTEND API] AI Message:', res.data.aiMessage);
        }
        if (res.data?.aiStats) {
            console.log('🤖 [FRONTEND API] AI Stats:', res.data.aiStats);
        }
        return res.data || { success: false, rooms: [], total: 0 };
    } catch (error) {
        console.error('fetchRooms error:', error);
        return { success: false, rooms: [], total: 0 };
    }
};

// Lấy chi tiết phòng trọ theo ID từ database
export const fetchRoomById = async (id) => {
    try {
        const res = await axios.get(`/api/posts/rooms/${id}`);
        return res.data?.room || null;
    } catch (error) {
        console.error('Error fetching room by ID:', error);
        return null;
    }
};

// fetch posts có dispatch (dùng redux)
export const fetchPostsAction = async (dispatch) => {
    dispatch(fetchPostsStart());
    try {
        const res = await axios.get('/api/posts');
        dispatch(fetchPostsSuccess(res.data.posts || []));
        return res.data.posts || [];
    } catch (error) {
        dispatch(fetchPostsFailure());
        return [];
    }
};

export const fetchPostById = async (id) => {
    // Public post detail endpoint (invite-roommate only)
    const res = await axios.get(`/api/posts/postdetail-public/${id}`);
    return res.data.post;
};

// Authenticated post detail endpoint (owner/admin) - used by edit flows
export const fetchPostByIdAuth = async (id) => {
    const res = await axiosJWT.get(`/api/posts/postdetail/${id}`);
    return res.data.post;
};

export const fetchPostByIdAction = async (id, dispatch) => {
    dispatch(fetchPostStart());
    try {
        const post = await fetchPostByIdAuth(id);
        dispatch(fetchPostSuccess(post));
        return post;
    } catch (error) {
        dispatch(fetchPostFailure());
        return null;
    }
};

// Update a post (authenticated) - uses axiosJWT so interceptor handles tokens
export const updatePost = async (postId, payload) => {
    const res = await axiosJWT.put(`/api/posts/${postId}`, payload);
    return res.data; // { success: true, post }
};

export const updatePostAction = async (postId, payload, dispatch) => {
    dispatch(fetchPostStart());
    try {
        const data = await updatePost(postId, payload);
        const post = data?.post || null;
        dispatch(fetchPostSuccess(post));
        return { success: true, post };
    } catch (error) {
        console.error('updatePostAction error:', error.response?.data || error.message);
        dispatch(fetchPostFailure());
        return { error: true, message: error.message, status: error.response?.status };
    }
};

// createPost dùng axiosJWT nên token + refresh được xử lý bởi interceptor
// (form, imageFiles, videoFiles, onProgress?) — URL lists belong in form.images / form.videos after optional upload of File[] here.
export const createPost = async (form, imageFiles = [], videoFiles = [], onProgress = null) => {
    const safeForm = { ...form };
    const notString = (arr) => Array.isArray(arr) && arr.some(i => typeof i !== 'string');
    if (Array.isArray(safeForm.images) && notString(safeForm.images)) {
        throw new Error('form.images must be an array of URL strings. Upload files first using uploadFiles().');
    }
    if (Array.isArray(safeForm.videos) && notString(safeForm.videos)) {
        throw new Error('form.videos must be an array of URL strings. Upload files first using uploadFiles().');
    }
    if ('contractImages' in safeForm) delete safeForm.contractImages;

    const imageFilesArr = Array.isArray(imageFiles) ? imageFiles : [];
    const videoFilesArr = Array.isArray(videoFiles) ? videoFiles : [];

    if (imageFilesArr.length) {
        const res = await uploadFiles(imageFilesArr, 'posts/media');
        safeForm.images = res.filter(x => typeof x === 'string');
    }
    if (videoFilesArr.length) {
        const res = await uploadFiles(videoFilesArr, 'posts/media');
        safeForm.videos = res.filter(x => typeof x === 'string');
    }

    const payload = { form: safeForm };
    // send object directly - backend will see req.body.form
    const res = await axiosJWT.post('/api/posts', payload);
    return res.data;
};



// createPost có dispatch (dùng redux)
export const createPostAction = async (form, imageFiles = [], videoFiles = [], dispatch, onProgress = null) => {
    dispatch(createPostStart());
    try {
        const data = await createPost(form, imageFiles, videoFiles, onProgress);
        dispatch(createPostSuccess(data));
        return data;
    } catch (error) {
        // log backend error body if present to help debugging
        try {
            console.error('createPostAction error response:', error.response && error.response.data ? error.response.data : error.message);
        } catch (e) {
            console.error('createPostAction unexpected error:', e);
        }
        dispatch(createPostFailure());
        // return structured error info so callers (UI) can show details
        return { error: true, status: error.response?.status, data: error.response?.data, message: error.message };
    }
};

// cũng xuất uploadFiles helper để upload ngay khi chọn file
export const uploadFiles = (files, folder = 'posts', concurrency = 3) => {
    console.log('ảnh đã chạy vào đây rồi nè');
    return moduleUploadFiles(files, folder, concurrency);
};

// Fetch posts for a specific user (authenticated)
export const fetchUserPosts = async (userId) => {
    // fetch all posts for the given user (backend returns full list); frontend will filter by postType
    const res = await axiosJWT.get(`/api/posts/user/${userId}`);
    return res.data;
};

// Fetch user posts with redux dispatch
export const fetchUserPostsAction = async (userId, dispatch) => {
    dispatch(fetchPostsStart());
    try {
        const data = await fetchUserPosts(userId);
        const posts = Array.isArray(data.posts) ? data.posts : [];
        dispatch(fetchPostsSuccess(posts));
        return { posts, total: data.total };
    } catch (error) {
        console.error('fetchUserPostsAction error:', error.response?.data || error.message);
        dispatch(fetchPostsFailure());
        return { error: true, message: error.message, status: error.response?.status };
    }
};

// --- Helpers for the *current authenticated user* ---
// fetchMyPosts: convenience function to get posts for the current user
// Uses the protected '/api/posts/mine' endpoint which reads the user id from the
// access token (req.user). This is the recommended call for dashboard pages.
export const fetchMyPosts = async () => {
    const res = await axiosJWT.get('/api/posts/mine');
    return res.data; // { success: true, posts: [...] }
};

// fetchMyPostsAction: same as fetchUserPostsAction but for the authenticated user
// - dispatches redux actions (fetchPostsStart/Success/Failure)
// - returns { posts, total } on success or { error: true, ... } on failure
export const fetchMyPostsAction = async (dispatch) => {
    dispatch(fetchPostsStart());
    try {
        const data = await fetchMyPosts();
        const posts = Array.isArray(data.posts) ? data.posts : [];
        dispatch(fetchPostsSuccess(posts));
        return { posts, total: data.total };
    } catch (error) {
        console.error('fetchMyPostsAction error:', error.response?.data || error.message);
        dispatch(fetchPostsFailure());
        return { error: true, message: error.message, status: error.response?.status };
    }
};

// Fetch a post by its room id (public)
export const fetchPostByRoom = async (roomId) => {
    const res = await axios.get(`/api/posts/by-room/${roomId}`);
    return res.data; // { success: true, post }
};

// Fetch post by room with redux dispatch
export const fetchPostByRoomAction = async (roomId, dispatch) => {
    dispatch(fetchPostStart());
    try {
        const data = await fetchPostByRoom(roomId);
        const post = data?.post || null;
        dispatch(fetchPostSuccess(post));
        return post;
    } catch (error) {
        console.error('fetchPostByRoomAction error:', error.response?.data || error.message);
        dispatch(fetchPostFailure());
        return null;
    }
};

// Delete a post (owner or admin) - authenticated
export const deletePost = async (postId) => {
    const res = await axiosJWT.delete(`/api/posts/${postId}`);
    return res.data; // { success: true }
};

// deletePostAction: call delete and refresh current user's posts in redux
export const deletePostAction = async (postId, dispatch) => {
    dispatch(deletePostStart());
    try {
        const data = await deletePost(postId);
        dispatch(deletePostSuccess({ postId }));
        return { success: true, data };
    } catch (error) {
        console.error('deletePostAction error:', error.response?.data || error.message);
        dispatch(deletePostFailure());
        return { error: true, message: error.message, status: error.response?.status };
    }



};
export const fetchHomeData = async () => {
    try {
        const res = await axios.get('/api/posts/home-data');
        return res.data.data;
    } catch (error) {
        console.error('fetchHomeData error:', error);
        throw error;
    }
};



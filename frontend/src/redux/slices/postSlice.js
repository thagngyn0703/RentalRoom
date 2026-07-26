import { createSlice } from '@reduxjs/toolkit';

const postSlice = createSlice({
  name: 'post',
  initialState: {
    posts: {
      list: [],
      isFetching: false,
      error: false,
    },
    singlePost: {
      data: null,
      isFetching: false,
      error: false,
        progress: {
          percent: 0,
          perFile: []
        }
    },
    message: {
      text: '',
      type: '',
    },
  },
  reducers: {
    // fetch posts
    fetchPostsStart: (state) => {
      state.posts.isFetching = true;
      state.posts.error = false;
    },
    fetchPostsSuccess: (state, action) => {
      state.posts.isFetching = false;
      state.posts.list = action.payload || [];
      state.posts.error = false;
    },
    fetchPostsFailure: (state) => {
      state.posts.isFetching = false;
      state.posts.error = true;
    },

    // fetch single post
    fetchPostStart: (state) => {
      state.singlePost.isFetching = true;
      state.singlePost.error = false;
    },
    fetchPostSuccess: (state, action) => {
      state.singlePost.isFetching = false;
      state.singlePost.data = action.payload;
      state.singlePost.error = false;
    },
    fetchPostFailure: (state) => {
      state.singlePost.isFetching = false;
      state.singlePost.error = true;
    },

    // create post
    createPostStart: (state) => {
      state.singlePost.isFetching = true;
      state.singlePost.error = false;
      state.singlePost.progress = { percent: 0, perFile: [] };
    },
    createPostSuccess: (state, action) => {
      state.singlePost.isFetching = false;
      state.singlePost.data = action.payload;
      state.singlePost.error = false;
      state.message.text = action.payload?.message || 'Post created successfully';
      state.message.type = 'success';
    },
    createPostFailure: (state) => {
      state.singlePost.isFetching = false;
      state.singlePost.error = true;
      state.message.text = 'Failed to create post';
      state.message.type = 'error';
    },
    // delete post
    deletePostStart: (state) => {
      state.posts.isFetching = true;
      state.posts.error = false;
    },
    deletePostSuccess: (state, action) => {
      state.posts.isFetching = false;
      state.posts.error = false;
      const removedId = action.payload?.postId;
      if (removedId) {
        state.posts.list = state.posts.list.filter(p => String(p._id || p.id) !== String(removedId));
      }
      state.message.text = 'Post deleted successfully';
      state.message.type = 'success';
    },
    deletePostFailure: (state) => {
      state.posts.isFetching = false;
      state.posts.error = true;
      state.message.text = 'Failed to delete post';
      state.message.type = 'error';
    },
    // progress update (optional)
    createPostProgress: (state, action) => {
      const payload = action.payload || {};
      state.singlePost.progress.percent = payload.percent ?? state.singlePost.progress.percent;
      if (Array.isArray(payload.perFile)) state.singlePost.progress.perFile = payload.perFile;
    },
  },
});

export const {
  fetchPostsStart,
  fetchPostsSuccess,
  fetchPostsFailure,
  fetchPostStart,
  fetchPostSuccess,
  fetchPostFailure,
  createPostStart,
  createPostSuccess,
  createPostFailure,
  deletePostStart,
  deletePostSuccess,
  deletePostFailure,
  createPostProgress,
} = postSlice.actions;

export default postSlice.reducer;

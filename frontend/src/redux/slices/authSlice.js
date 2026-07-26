const { createSlice } = require('@reduxjs/toolkit');

const authSlice = createSlice({
  name: "auth",
  initialState: {
    login: {
      currentUser: null,
      accessToken: "",
      isFetching: false,
      error: false,
    },
    register: {
      isFetching: false,
      error: false,
      success: false,
    },
  },
  reducers: {
    loginStart: (state) => {
      state.login.isFetching = true;
    },
    loginSuccess: (state, action) => {
      state.login.isFetching = false;
      state.login.currentUser = action.payload.user;
      state.login.accessToken = action.payload.accessToken;
      state.login.error = false;
    },
    loginFailure: (state) => {
      state.login.isFetching = false;
      state.login.error = true;
    },
    registerStart: (state) => {
      state.register.isFetching = true;
    },
    registerSuccess: (state) => {
      state.register.isFetching = false;
      state.register.success = true;
      state.register.error = false;
    },
    registerFailure: (state) => {
      state.register.isFetching = false;
      state.register.error = true;
    },
    logout: (state) => {
      state.login.currentUser = null;
      state.login.accessToken = "";
      state.login.isFetching = false;
      state.login.error = false;
      state.register.isFetching = false;
      state.register.error = false;
      state.register.success = false;
    },
    clearAuth: (state) => {
      return {
        login: {
          currentUser: null,
          accessToken: "",
          isFetching: false,
          error: false,
        },
        register: {
          isFetching: false,
          error: false,
          success: false,
        },
      };
    },

    // ✅ Thêm mới reducer này để Verify.jsx không bị lỗi
    setCredentials: (state, action) => {
      state.login.currentUser = action.payload.user || null;
      state.login.accessToken = action.payload.accessToken || "";
      state.login.isFetching = false;
      state.login.error = false;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  clearAuth,
  setCredentials, // ✅ Export thêm dòng này
} = authSlice.actions;

export default authSlice.reducer;

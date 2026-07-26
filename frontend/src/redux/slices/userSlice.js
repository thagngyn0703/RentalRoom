import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        users: {
            allUser: null,
            isFetching: false,
            error: false,
        },
        message: {
            text: "",
            type: "",             
        }
    },
    reducers: {
        //get all user
        getUserStart: (state) => {
            state.users.isFetching = true;
        },
        getUserSuccess: (state, action) => {
            state.users.isFetching = false;
            state.users.allUser = action.payload;
            state.users.error = false;
        },
        getUserFailure: (state) => {
            state.users.isFetching = false;
            state.users.error = true;
        },

        //delete user
        deleteUserStart: (state) => {
            state.users.isFetching = true;
        },
        deleteUserSuccess: (state, action) => {
            state.users.isFetching = false;
            state.message.text = action.payload.message || "User deleted successfully";
            state.message.type = "success";
            state.users.error = false;
        },
        deleteUserFailure: (state) => {
            state.users.isFetching = false;
            state.users.error = true;
            state.message.text = "Failed to delete user";
            state.message.type = "error";
        },
        
        //clear message
        clearMessage: (state) => {
            state.message.text = "";
            state.message.type = "";
        }
    }
});

export const {
    getUserStart,
    getUserSuccess,
    getUserFailure,
    deleteUserStart,
    deleteUserSuccess,
    deleteUserFailure,
    clearMessage
} = userSlice.actions;
export default userSlice.reducer;
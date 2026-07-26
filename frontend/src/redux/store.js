import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import userInforReducer from './slices/userInforSlice';
import postReducer from './slices/postSlice';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';

import storage from 'redux-persist/lib/storage';
import { createTransform } from 'redux-persist';

const EMPTY_AUTH = {
    login: {
        currentUser: null,
        accessToken: '',
        isFetching: false,
        error: false,
    },
    register: {
        isFetching: false,
        error: false,
        success: false,
    },
};

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    whitelist: ['auth'],
    transforms: [
        createTransform(
            // inbound: khi PERSIST (state → storage): không lưu accessToken vào localStorage
            (inboundState, key) => {
                if (!inboundState) return inboundState;
                const next = { ...inboundState };
                if (next.login) {
                    return {
                        ...next,
                        login: { ...next.login, accessToken: '' },
                    };
                }
                return next;
            },
            // outbound: khi REHYDRATE (storage → state). Tab mới = logout; F5 = giữ đăng nhập
            (outboundState, key) => {
                if (!outboundState) return outboundState;
                const isNewSession = !sessionStorage.getItem('app_session');
                if (isNewSession) {
                    sessionStorage.setItem('app_session', '1');
                    return EMPTY_AUTH;
                }
                return outboundState;
            },
            { whitelist: ['auth'] }
        ),
    ],
};
const rootReducer = combineReducers({
    auth: authReducer,
    user: userReducer,
    userInfor: userInforReducer,
    post: postReducer,

});
const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer, // Enable persist với whitelist
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);
export default store;

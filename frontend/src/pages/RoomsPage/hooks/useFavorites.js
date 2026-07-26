import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FavoriteApi } from '../../../services/api';
import { MAX_FAVORITES } from '../constants/filterOptions';

export const useFavorites = (showToast) => {
    const [favorites, setFavorites] = useState(new Set());
    const accessToken = useSelector((s) => s?.auth?.login?.accessToken);

    // Nếu user đã login => load favorites từ backend
    useEffect(() => {
        (async () => {
            if (!accessToken) {
                // Không dùng localStorage; anonymous users sẽ có favorites chỉ trong bộ nhớ
                setFavorites(new Set());
                return;
            }
            try {
                const res = await FavoriteApi.getMyFavorites();
                const ids = (res?.favorites || []).map(f => String(f.room?._id || f.clientRoomId || f.room));
                setFavorites(new Set(ids));
            } catch (err) {
                console.error('Error loading favorites:', err);
                setFavorites(new Set());
            }
        })();
    }, [accessToken]);

    const toggleFavorite = (id) => {
        setFavorites((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
                // Nếu đã login thì gọi backend, ngược lại chỉ cập nhật local state (no storage)
                if (accessToken) FavoriteApi.removeFavorite(id).catch(() => { });
            } else {
                if (next.size >= MAX_FAVORITES) {
                    if (showToast) showToast(`Bạn chỉ có thể lưu tối đa ${MAX_FAVORITES} phòng yêu thích.`, 'warning');
                    return prev;
                }
                next.add(id);
                if (accessToken) FavoriteApi.addFavorite(id).catch(() => { });
            }
            try {
                window.dispatchEvent(new Event('favoritesUpdated'));
            } catch (err) {
                console.error('Error dispatching favoritesUpdated event:', err);
            }
            return next;
        });
    };

    return { favorites, toggleFavorite };
};

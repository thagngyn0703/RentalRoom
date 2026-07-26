import React from 'react';
import { Stack, Pagination, Box } from '@mui/material';
import RoomCard from '../RoomCard/RoomCard';

const RoomList = ({
    currentItems,
    filters,
    total,
    favorites,
    toggleFavorite,
    handleViewDetails,
    totalPages,
    page,
    handlePageChange
}) => {
    return (
        <>

          
            {/* Room Cards */}
            <Stack spacing={2}>
                {currentItems.map((room) => (
                    <RoomCard
                        key={room.id}
                        room={room}
                        favorites={favorites}
                        toggleFavorite={toggleFavorite}
                        handleViewDetails={handleViewDetails}
                    />
                ))}
            </Stack>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, width: '100%', minWidth: 0 }}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    shape="rounded"
                    size="large"
                    showFirstButton
                    showLastButton
                />
            </Box>
        </>
    );
};

export default RoomList;

import {
    Box,
    Typography,
    Grid,
    FormControl,
    Select,
    MenuItem,
    TextField,
} from "@mui/material";
import React from "react";

const BasicInfoSection = ({ 
    selectedCategory, 
    setSelectedCategory,
    selectedPrice, 
    setSelectedPrice,
    selectedArea,
    setSelectedArea,
    selectedBeds,
    setSelectedBeds,
    selectedBaths,
    setSelectedBaths
}) => {
    return (
        <>
            {/* Loại chuyên mục */}
            <Typography
                variant="subtitle1"
                fontWeight="bold"
                mb={1}
                sx={{ textAlign: 'left' }}
            >
                Loại chuyên mục
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4} md={3} lg={3}>
                    <Box sx={{ mb: 2 }}>
                        <Typography
                            variant="body2"
                            mb={0.5}
                            sx={{ textAlign: 'left' }}
                        >
                            Kiểu phòng
                        </Typography>

                        <FormControl fullWidth size="small" sx={{ bgcolor: '#fff' }}>
                            <Select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                displayEmpty
                                placeholder="Chọn kiểu phòng"
                                sx={{
                                    '& .MuiSelect-select': {
                                        color: selectedCategory ? 'inherit' : '#999',
                                    }
                                }}
                            >
                                <MenuItem value="" disabled sx={{ color: '#999' }}>
                                    Chọn kiểu phòng
                                </MenuItem>
                                <MenuItem value="phong-tro">Phòng trọ</MenuItem>
                                <MenuItem value="nha-tro">Nhà trọ</MenuItem>
                                <MenuItem value="nha-nguyen-can">Nhà nguyên căn</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>
            </Grid>

            {/* Giá & Diện tích */}
            <Box sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4} md={3} lg={3}>
                        <Typography
                            variant="body2"
                            mb={0.5}
                            sx={{ textAlign: 'left' }}
                        >
                            Giá
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            inputProps={{ min: 0, step: 50000 }}
                            value={selectedPrice === undefined || selectedPrice === null ? '' : selectedPrice}
                            placeholder="Nhập giá (VNĐ)"
                            onChange={(e) => {
                                const v = e.target.value === '' ? '' : Number(e.target.value);
                                setSelectedPrice(v);
                            }}
                            sx={{ bgcolor: '#fff' }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4} md={3} lg={3}>
                        <Typography
                            variant="body2"
                            mb={0.5}
                            sx={{ textAlign: 'left' }}
                        >
                            Diện tích
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            inputProps={{ min: 0, step: 1 }}
                            value={selectedArea === undefined || selectedArea === null ? '' : selectedArea}
                            placeholder="Nhập diện tích (m²)"
                            onChange={(e) => {
                                const v = e.target.value === '' ? '' : Number(e.target.value);
                                setSelectedArea(v);
                            }}
                            sx={{ bgcolor: '#fff' }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4} md={3} lg={3}>
                        <Typography
                            variant="body2"
                            mb={0.5}
                            sx={{ textAlign: 'left' }}
                        >
                            Số phòng ngủ
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            inputProps={{ min: 0, step: 1 }}
                            value={selectedBeds === undefined || selectedBeds === null ? '' : selectedBeds}
                            placeholder="Số phòng ngủ"
                            onChange={(e) => {
                                const v = e.target.value === '' ? 0 : Number(e.target.value);
                                setSelectedBeds(v);
                            }}
                            sx={{ bgcolor: '#fff' }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4} md={3} lg={3}>
                        <Typography
                            variant="body2"
                            mb={0.5}
                            sx={{ textAlign: 'left' }}
                        >
                            Số phòng WC
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            inputProps={{ min: 0, step: 1 }}
                            value={selectedBaths === undefined || selectedBaths === null ? '' : selectedBaths}
                            placeholder="Số phòng WC"
                            onChange={(e) => {
                                const v = e.target.value === '' ? 0 : Number(e.target.value);
                                setSelectedBaths(v);
                            }}
                            sx={{ bgcolor: '#fff' }}
                        />
                    </Grid>
                </Grid>
            </Box>
        </>
    );
};

export default BasicInfoSection;
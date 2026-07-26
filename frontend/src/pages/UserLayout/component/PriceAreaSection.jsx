import {
    Box,
    Typography,
    Grid,
    FormControl,
    Select,
    MenuItem,
} from "@mui/material";
import React from "react";

const PriceAreaSection = ({ 
    selectedPrice, 
    setSelectedPrice,
    selectedArea,
    setSelectedArea
}) => {
    return (
        <Box sx={{ mb: 2 }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4, md: 3, lg: 3 }}>
                    <Typography
                        variant="body2"
                        mb={0.5}
                        sx={{ textAlign: 'left' }}
                    >
                        Giá
                    </Typography>
                    <FormControl fullWidth size="small" sx={{ bgcolor: '#fff' }}>
                        <Select
                            value={selectedPrice}
                            onChange={(e) => setSelectedPrice(e.target.value)}
                            displayEmpty
                            placeholder="Chọn khoảng giá"
                            sx={{
                                '& .MuiSelect-select': {
                                    color: selectedPrice ? 'inherit' : '#999',
                                }
                            }}
                        >
                            <MenuItem value="" disabled sx={{ color: '#999' }}>
                                Chọn khoảng giá
                            </MenuItem>
                            <MenuItem value="1000000">1.000.000 VNĐ</MenuItem>
                            <MenuItem value="2000000">2.000.000 VNĐ</MenuItem>
                            <MenuItem value="2500000">2.500.000 VNĐ</MenuItem>
                            <MenuItem value="3000000">3.000.000 VNĐ</MenuItem>
                            <MenuItem value="5000000">5.000.000 VNĐ</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 3, lg: 3 }}>
                    <Typography
                        variant="body2"
                        mb={0.5}
                        sx={{ textAlign: 'left' }}
                    >
                        Diện tích
                    </Typography>
                    <FormControl fullWidth size="small" sx={{ bgcolor: '#fff' }}>
                        <Select
                            value={selectedArea}
                            onChange={(e) => setSelectedArea(e.target.value)}
                            displayEmpty
                            placeholder="Chọn diện tích"
                            sx={{
                                '& .MuiSelect-select': {
                                    color: selectedArea ? 'inherit' : '#999',
                                }
                            }}
                        >
                            <MenuItem value="" disabled sx={{ color: '#999' }}>
                                Chọn diện tích
                            </MenuItem>
                            <MenuItem value="15">15 m²</MenuItem>
                            <MenuItem value="20">20 m²</MenuItem>
                            <MenuItem value="25">25 m²</MenuItem>
                            <MenuItem value="30">30 m²</MenuItem>
                            <MenuItem value="40">40 m²</MenuItem>
                            <MenuItem value="50">50 m²</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PriceAreaSection;
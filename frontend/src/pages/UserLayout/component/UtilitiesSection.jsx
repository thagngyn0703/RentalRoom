import {
    Box,
    Typography,
    Grid,
    Checkbox,
    FormControlLabel
} from "@mui/material";
import React from "react";

const UtilitiesSection = ({ 
    selectedUtilities,
    handleUtilityChange
}) => {
    const utilitiesList = [
        'Đầy đủ nội thất', 'Gác xếp', 'Kệ bếp', 'Máy lạnh',
        'Máy giặt', 'Tủ lạnh', 'Thang máy', 'Không chung chủ',
        'Giờ giấc tự do', 'Có bảo vệ 24/24', 'Hầm để xe', 'Chỗ để xe',
        'Tủ quần áo', 'Phòng cháy chữa cháy  nhiệm thu', 'Có camera an ninh', 'Khóa vân tay'
    ];
    

    return (
        <Box sx={{ mb: 2 }}>
            <Typography
                variant="subtitle1"
                fontWeight="bold"
                mb={1}
                sx={{ textAlign: 'left' }}
            >
                Tiện ích & Nội thất
            </Typography>
            
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Grid container spacing={1}>
                        {utilitiesList.map((item, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={selectedUtilities.includes(item)}
                                            onChange={() => handleUtilityChange(item)}
                                            size="small"
                                        />
                                    }
                                    label={item}
                                    sx={{
                                        margin: 0,
                                        width: '100%',
                                        '& .MuiFormControlLabel-label': {
                                            fontSize: '0.8rem',
                                        }
                                    }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};

export default UtilitiesSection;
import {
    Box,
    Typography,
    Grid,
    TextField,
    useTheme
} from "@mui/material";
import React from "react";

const HouseRulesSection = ({ 
    houseRules,
    setHouseRules
}) => {
    const theme = useTheme();

    return (
        <Box sx={{ mb: 2 }}>
            <Typography
                variant="subtitle1"
                fontWeight="bold"
                mb={1}
                sx={{ textAlign: 'left' }}
            >
                Nội quy
            </Typography>
            
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="body2" mb={1} sx={{ fontWeight: 'medium' }}>
                        Nhập nội quy của trọ 
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={6}
                        placeholder={`Ví dụ:
- Không hút thuốc trong phòng
- Giữ yên tĩnh sau 22h
- Không mang bạn về qua đêm
- Giữ gìn vệ sinh chung
- Báo trước khi về muộn
- Không nuôi thú cưng`}
                        value={houseRules}
                        onChange={(e) => setHouseRules(e.target.value)}
                        sx={{ 
                            bgcolor: '#f9f9f9',
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: '#ddd',
                                },
                                '&:hover fieldset': {
                                    borderColor: theme.palette.primary.main,
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: theme.palette.primary.main,
                                },
                            },
                        }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default HouseRulesSection;
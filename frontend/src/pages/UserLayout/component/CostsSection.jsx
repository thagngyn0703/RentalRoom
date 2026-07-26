import {
    Box,
    Typography,
    Grid,
    TextField,
    Button,
    useTheme
} from "@mui/material";
import React from "react";

const CostsSection = ({ 
    additionalCosts,
    newCost,
    setNewCost,
    handleAddCost,
    handleRemoveCost
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
                Chi phí phụ
            </Typography>
            
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    {/* Form thêm chi phí */}
                    <Grid container spacing={2} mb={2}>
                        <Grid item xs={12} sm={6} md={5} lg={5}>
                            <Typography variant="body2" mb={0.5} sx={{ fontWeight: 'medium' }}>
                                Loại chi phí
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="VD: Vệ sinh, Điện, Nước, Internet..."
                                value={newCost.type}
                                onChange={(e) => setNewCost(prev => ({ ...prev, type: e.target.value }))}
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
                        <Grid item xs={12} sm={6} md={4} lg={4}>
                            <Typography variant="body2" mb={0.5} sx={{ fontWeight: 'medium' }}>
                                Tần xuất
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="VD: 4k/số, 100k/tháng..."
                                value={newCost.frequency}
                                onChange={(e) => setNewCost(prev => ({ ...prev, frequency: e.target.value }))}
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
                        <Grid item xs={12} sm={4} md={3} lg={3}>
                            <Typography variant="body2" mb={0.5} sx={{ color: 'transparent' }}>
                                .
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={handleAddCost}
                                sx={{
                                    height: '40px',
                                    width: '100%',
                                    fontSize: '0.8rem',
                                    bgcolor: theme.palette.primary.main,
                                    '&:hover': {
                                        bgcolor: theme.palette.primary.dark,
                                    }
                                }}
                            >
                                Thêm +
                            </Button>
                        </Grid>
                    </Grid>

                    {/* Danh sách chi phí đã thêm */}
                    {additionalCosts.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" mb={1} sx={{ fontWeight: 'medium' }}>
                                Danh sách chi phí:
                            </Typography>
                            {additionalCosts.map((cost) => (
                                <Box
                                    key={cost.id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 1,
                                        mb: 1,
                                        bgcolor: '#f5f5f5',
                                        borderRadius: 1,
                                        border: '1px solid #ddd'
                                    }}
                                >
                                    <Typography variant="body2">
                                        {cost.type} - {cost.frequency}
                                    </Typography>
                                    <Button
                                        size="small"
                                        color="error"
                                        onClick={() => handleRemoveCost(cost.id)}
                                        sx={{ minWidth: 'auto', p: 0.5 }}
                                    >
                                        ✕
                                    </Button>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default CostsSection;
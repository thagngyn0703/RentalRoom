import React from 'react';
import { Box, Typography, FormControl, FormGroup, FormControlLabel, Checkbox, Paper, Button } from '@mui/material';
import { FEATURE_OPTIONS } from '../../constants/filterOptions';

const UtilityPanel = ({ draftUtilities, toggleUtility, applyUtilities }) => {
    const handleApplyClick = () => {
        console.log('🎯 UtilityPanel apply button clicked, draftUtilities:', draftUtilities);
        applyUtilities();
    };

    return (
        <Box
            sx={{
                position: 'sticky',
                top: '70px',
                alignSelf: 'flex-start',
            }}
        >
            <Paper
                elevation={2}
                sx={{
                    p: 2.5,
                    borderRadius: 2,
                    backgroundColor: '#fff',
                }}
            >
                <Typography 
                    variant="h6" 
                    sx={{ 
                        fontWeight: 600, 
                        mb: 2, 
                        color: 'primary.main',
                        fontSize: '1.1rem',
                        borderBottom: '2px solid',
                        borderColor: 'primary.main',
                        pb: 1
                    }}
                >
                    Tiện ích / Nội thất
                </Typography>
                <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <FormGroup>
                        {FEATURE_OPTIONS.map((utility) => (
                            <FormControlLabel
                                key={utility}
                                control={
                                    <Checkbox
                                        checked={draftUtilities.includes(utility)}
                                        onChange={() => toggleUtility(utility)}
                                        size="small"
                                        sx={{
                                            color: 'primary.main',
                                            '&.Mui-checked': {
                                                color: 'primary.main',
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                        {utility}
                                    </Typography>
                                }
                                sx={{
                                    mb: 0.5,
                                    '& .MuiFormControlLabel-label': {
                                        lineHeight: 1.4,
                                    },
                                }}
                            />
                        ))}
                    </FormGroup>
                </FormControl>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleApplyClick}
                    sx={{
                        mt: 2,
                        backgroundColor: 'primary.main',
                        '&:hover': {
                            backgroundColor: 'primary.dark',
                        },
                    }}
                >
                    Áp dụng
                </Button>
            </Paper>
        </Box>
    );
};

export default UtilityPanel;

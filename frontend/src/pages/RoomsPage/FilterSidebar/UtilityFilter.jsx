import React from 'react';
import { Box, FormControl, FormGroup, FormControlLabel, Checkbox, Typography } from '@mui/material';
import { FEATURE_OPTIONS } from '../../../data/filterOptions';

const UtilityFilter = ({ draftUtilities, toggleUtility }) => {
    return (
        <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
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
        </Box>
    );
};

export default UtilityFilter;

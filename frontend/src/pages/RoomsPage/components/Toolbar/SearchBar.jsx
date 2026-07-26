import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ search, setSearch, setPage }) => {
  return (
    <TextField
      value={search}
      onChange={(e) => {
        setSearch(e.target.value);
        setPage(1);
      }}
      size="small"
      placeholder="Search for..."
      sx={{ minWidth: { xs: 220, md: 240, lg: 260 }, bgcolor: '#eee', borderRadius: 5 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        )
      }}
    />
  );
};

export default SearchBar;

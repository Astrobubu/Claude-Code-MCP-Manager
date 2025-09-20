import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Minimize, CropSquare, Close } from '@mui/icons-material';

function TitleBar() {
  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.windowMinimize();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.windowMaximize();
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.windowClose();
    }
  };

  return (
    <Box
      sx={{
        height: '32px',
        backgroundColor: '#1e1e1e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        borderBottom: '1px solid #333',
        WebkitAppRegion: 'drag', // Allow dragging the window
        userSelect: 'none'
      }}
    >
      <Typography 
        variant="body2" 
        sx={{ 
          color: '#fff',
          fontSize: '12px',
          fontWeight: 500
        }}
      >
        Claude MCP Manager
      </Typography>
      
      <Box sx={{ display: 'flex', WebkitAppRegion: 'no-drag' }}>
        <IconButton
          size="small"
          onClick={handleMinimize}
          sx={{
            color: '#fff',
            width: '32px',
            height: '32px',
            borderRadius: 0,
            '&:hover': {
              backgroundColor: '#444'
            }
          }}
        >
          <Minimize sx={{ fontSize: '14px' }} />
        </IconButton>
        
        <IconButton
          size="small"
          onClick={handleMaximize}
          sx={{
            color: '#fff',
            width: '32px',
            height: '32px',
            borderRadius: 0,
            '&:hover': {
              backgroundColor: '#444'
            }
          }}
        >
          <CropSquare sx={{ fontSize: '12px' }} />
        </IconButton>
        
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{
            color: '#fff',
            width: '32px',
            height: '32px',
            borderRadius: 0,
            '&:hover': {
              backgroundColor: '#e74c3c'
            }
          }}
        >
          <Close sx={{ fontSize: '14px' }} />
        </IconButton>
      </Box>
    </Box>
  );
}

export default TitleBar;
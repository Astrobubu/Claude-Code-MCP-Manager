import React from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { FolderOpen } from '@mui/icons-material';

function ProjectSelector({ selectedProject, onProjectSelect, scope }) {
  const handleBrowse = async () => {
    try {
      if (window.electronAPI) {
        const directory = await window.electronAPI.selectDirectory();
        if (directory) {
          onProjectSelect(directory);
        }
      }
    } catch (error) {
      console.error('Failed to select directory:', error);
    }
  };

  if (scope === 'user') {
    return (
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          User scope MCPs are installed globally and available across all projects.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <TextField
        fullWidth
        label={`${scope === 'local' ? 'Local' : 'Project'} Directory`}
        value={selectedProject}
        InputProps={{ readOnly: true }}
        placeholder="Select a project directory..."
      />
      <Button
        variant="outlined"
        startIcon={<FolderOpen />}
        onClick={handleBrowse}
      >
        Browse
      </Button>
    </Box>
  );
}

export default ProjectSelector;
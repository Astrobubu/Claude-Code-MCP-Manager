import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { GitHub, GetApp, Delete, Info } from '@mui/icons-material';

function MCPCard({ mcp, isInstalled, onInstall, onUninstall, loading }) {
  const [showDetails, setShowDetails] = useState(false);

  const handleInstall = () => {
    onInstall(mcp.id);
  };

  const handleUninstall = () => {
    onUninstall(mcp.id);
  };

  const openRepository = () => {
    if (window.electronAPI) {
      // Would open external browser
      console.log('Opening:', mcp.repository);
    }
  };

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              {mcp.name}
            </Typography>
            <Chip 
              label={mcp.category} 
              size="small" 
              color="primary"
              variant="outlined"
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            {mcp.description}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              ~{mcp.estimatedTokens} tokens
            </Typography>
            {isInstalled && (
              <Chip label="Installed" color="success" size="small" />
            )}
          </Box>
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between' }}>
          <Box>
            <Button 
              size="small" 
              startIcon={<GitHub />}
              onClick={openRepository}
            >
              GitHub
            </Button>
            <Button 
              size="small" 
              startIcon={<Info />}
              onClick={() => setShowDetails(true)}
            >
              Details
            </Button>
          </Box>
          
          <Box>
            {isInstalled ? (
              <Button 
                size="small" 
                color="error"
                startIcon={<Delete />}
                onClick={handleUninstall}
                disabled={loading}
              >
                Uninstall
              </Button>
            ) : (
              <Button 
                size="small" 
                color="primary"
                startIcon={<GetApp />}
                onClick={handleInstall}
                disabled={loading}
              >
                Install
              </Button>
            )}
          </Box>
        </CardActions>
      </Card>

      <Dialog open={showDetails} onClose={() => setShowDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>{mcp.name} - Configuration Details</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom>Command:</Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
            {mcp.config.command} {mcp.config.args.join(' ')}
          </Typography>

          {Object.keys(mcp.config.env).length > 0 && (
            <>
              <Typography variant="subtitle2" gutterBottom>Environment Variables:</Typography>
              <Box sx={{ fontFamily: 'monospace', mb: 2 }}>
                {Object.entries(mcp.config.env).map(([key, value]) => (
                  <Typography key={key} variant="body2">
                    {key}: {value || '<required>'}
                  </Typography>
                ))}
              </Box>
            </>
          )}

          <Typography variant="subtitle2" gutterBottom>Installation:</Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            npm install {mcp.installation.package}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function MCPList({ mcps, categories, installedMCPs, onInstall, onUninstall, showOnlyInstalled = false, loading = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredMCPs = mcps.filter(mcp => {
    const matchesSearch = mcp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mcp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || mcp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Search MCPs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ flexGrow: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map(category => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {filteredMCPs.length === 0 ? (
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
          {showOnlyInstalled ? 'No MCPs installed' : 'No MCPs found'}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredMCPs.map(mcp => {
            const isInstalled = installedMCPs.includes(mcp.id);
            return (
              <Grid item xs={12} sm={6} md={4} key={mcp.id}>
                <MCPCard
                  mcp={mcp}
                  isInstalled={isInstalled}
                  onInstall={onInstall}
                  onUninstall={onUninstall}
                  loading={loading}
                />
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}

export default MCPList;
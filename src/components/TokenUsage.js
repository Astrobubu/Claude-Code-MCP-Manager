import React from 'react';
import { Box, Typography, LinearProgress, Tooltip } from '@mui/material';

const CLAUDE_SESSION_TOKEN_LIMIT = 100000; // Approximate token limit per session

function TokenUsage({ totalTokens }) {
  const percentage = Math.min((totalTokens / CLAUDE_SESSION_TOKEN_LIMIT) * 100, 100);
  
  const getColor = () => {
    if (percentage < 50) return 'success';
    if (percentage < 80) return 'warning';
    return 'error';
  };

  return (
    <Tooltip 
      title={`${totalTokens.toLocaleString()} tokens used (~${percentage.toFixed(1)}% of session limit)`}
      arrow
    >
      <Box sx={{ minWidth: 200, ml: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="inherit">
            Token Usage
          </Typography>
          <Typography variant="caption" color="inherit">
            {totalTokens.toLocaleString()}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={percentage}
          color={getColor()}
          sx={{ height: 8, borderRadius: 4 }}
        />
        <Typography variant="caption" color="inherit" sx={{ fontSize: '0.65rem' }}>
          {percentage.toFixed(1)}% of session limit
        </Typography>
      </Box>
    </Tooltip>
  );
}

export default TokenUsage;
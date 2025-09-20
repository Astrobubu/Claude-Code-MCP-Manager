import React from 'react';
import { Badge } from './ui/badge';
import { Zap } from 'lucide-react';

const CLAUDE_SESSION_TOKEN_LIMIT = 200000; // Claude context window limit

function TokenUsage({ totalTokens }) {
  const percentage = Math.min((totalTokens / CLAUDE_SESSION_TOKEN_LIMIT) * 100, 100);
  
  const getVariant = () => {
    if (percentage < 50) return 'success';
    if (percentage < 80) return 'warning';
    return 'destructive';
  };

  const getColor = () => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center gap-3 min-w-48">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {totalTokens.toLocaleString()}/{CLAUDE_SESSION_TOKEN_LIMIT.toLocaleString()}
        </span>
      </div>
      
      <div className="flex-1">
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      
      <Badge variant={getVariant()} className="text-xs">
        {percentage.toFixed(1)}%
      </Badge>
    </div>
  );
}

export default TokenUsage;
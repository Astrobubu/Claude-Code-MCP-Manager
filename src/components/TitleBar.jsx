import React from 'react';
import { Button } from './ui/button';
import { Minus, Square, X } from 'lucide-react';

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
    <div
      className="h-8 bg-background border-b border-border flex items-center justify-between px-4 select-none"
      style={{ WebkitAppRegion: 'drag' }}
    >
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-primary rounded-full" />
        <span className="text-sm font-medium text-foreground">
          Claude Code MCP Manager
        </span>
      </div>
      
      <div className="flex" style={{ WebkitAppRegion: 'no-drag' }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMinimize}
          className="h-8 w-8 rounded-none hover:bg-muted"
        >
          <Minus className="h-3 w-3" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMaximize}
          className="h-8 w-8 rounded-none hover:bg-muted"
        >
          <Square className="h-3 w-3" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="h-8 w-8 rounded-none hover:bg-destructive hover:text-destructive-foreground"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export default TitleBar;
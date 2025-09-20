const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script is running');

try {
  contextBridge.exposeInMainWorld('electronAPI', {
    // Window controls
    windowMinimize: () => ipcRenderer.invoke('window-minimize'),
    windowMaximize: () => ipcRenderer.invoke('window-maximize'),
    windowClose: () => ipcRenderer.invoke('window-close'),
    
    // Directory selection
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    
    // MCP management
    installMCP: (mcpConfig, scope, projectPath) => 
      ipcRenderer.invoke('install-mcp', mcpConfig, scope, projectPath),
    
    uninstallMCP: (mcpName, scope, projectPath) => 
      ipcRenderer.invoke('uninstall-mcp', mcpName, scope, projectPath),
    
    getInstalledMCPs: (scope, projectPath) => 
      ipcRenderer.invoke('get-installed-mcps', scope, projectPath),
    
    // Utility functions
    ensureGitignore: (projectPath) => 
      ipcRenderer.invoke('ensure-gitignore', projectPath),
    
    openExternal: (url) => 
      ipcRenderer.invoke('open-external', url)
  });
  
  console.log('electronAPI exposed successfully');
} catch (error) {
  console.error('Error exposing electronAPI:', error);
}
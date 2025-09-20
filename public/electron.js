const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;

// Simple development detection
const isDev = process.env.NODE_ENV === 'development' || 
              process.argv.includes('--dev') || 
              !app.isPackaged;

let mainWindow;

function createWindow() {
  const preloadPath = isDev 
    ? path.join(__dirname, 'preload.js')
    : path.join(__dirname, '../build/preload.js');

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    frame: false, // Custom title bar
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: preloadPath
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1e1e1e',
      symbolColor: '#ffffff'
    }
  });

  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
    
  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Debug: Log when window is ready
  mainWindow.webContents.once('dom-ready', () => {
    console.log('Window DOM ready, preload should be loaded');
  });
}

// Window controls
ipcMain.handle('window-minimize', () => {
  mainWindow.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle('window-close', () => {
  mainWindow.close();
});

// Directory selection
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// MCP configuration management
ipcMain.handle('install-mcp', async (event, mcpConfig, scope, projectPath) => {
  try {
    if (scope === 'project' && projectPath) {
      await installProjectMCP(mcpConfig, projectPath);
    } else if (scope === 'user' || scope === 'global') {
      await installGlobalMCP(mcpConfig);
    } else if (scope === 'local' && projectPath) {
      await installLocalMCP(mcpConfig, projectPath);
    }
    return { success: true };
  } catch (error) {
    console.error('Install MCP error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('uninstall-mcp', async (event, mcpName, scope, projectPath) => {
  try {
    if (scope === 'project' && projectPath) {
      await uninstallProjectMCP(mcpName, projectPath);
    } else if (scope === 'user' || scope === 'global') {
      await uninstallGlobalMCP(mcpName);
    } else if (scope === 'local' && projectPath) {
      await uninstallLocalMCP(mcpName, projectPath);
    }
    return { success: true };
  } catch (error) {
    console.error('Uninstall MCP error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-installed-mcps', async (event, scope, projectPath) => {
  try {
    if (scope === 'project' && projectPath) {
      return await getProjectMCPs(projectPath);
    } else if (scope === 'user' || scope === 'global') {
      return await getGlobalMCPs();
    } else if (scope === 'local' && projectPath) {
      return await getLocalMCPs(projectPath);
    }
    return [];
  } catch (error) {
    console.error('Get installed MCPs error:', error);
    return [];
  }
});

ipcMain.handle('ensure-gitignore', async (event, projectPath) => {
  try {
    await ensureGitignoreEntry(projectPath);
    return { success: true };
  } catch (error) {
    console.error('Ensure gitignore error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-external', async (event, url) => {
  try {
    const { shell } = require('electron');
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error('Open external error:', error);
    return { success: false, error: error.message };
  }
});

// MCP installation functions
async function installProjectMCP(mcpConfig, projectPath) {
  const mcpFilePath = path.join(projectPath, '.mcp.json');
  
  let mcpData = { mcpServers: {} };
  try {
    const existing = await fs.readFile(mcpFilePath, 'utf8');
    mcpData = JSON.parse(existing);
  } catch (error) {
    // File doesn't exist, will create new
  }
  
  mcpData.mcpServers[mcpConfig.id] = mcpConfig.config;
  
  await fs.writeFile(mcpFilePath, JSON.stringify(mcpData, null, 2));
}

async function installGlobalMCP(mcpConfig) {
  // Claude Desktop config path
  const os = require('os');
  const configPath = process.platform === 'win32' 
    ? path.join(os.homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json')
    : path.join(os.homedir(), '.config', 'claude', 'claude_desktop_config.json');
  
  let configData = { mcpServers: {} };
  try {
    const existing = await fs.readFile(configPath, 'utf8');
    configData = JSON.parse(existing);
  } catch (error) {
    // File doesn't exist or is invalid, will create new
    await fs.mkdir(path.dirname(configPath), { recursive: true });
  }
  
  if (!configData.mcpServers) {
    configData.mcpServers = {};
  }
  
  configData.mcpServers[mcpConfig.id] = mcpConfig.config;
  
  await fs.writeFile(configPath, JSON.stringify(configData, null, 2));
}

async function installLocalMCP(mcpConfig, projectPath) {
  // For local scope, we create a project-specific config that's not version controlled
  const mcpFilePath = path.join(projectPath, '.claude', 'mcp.json');
  
  await fs.mkdir(path.dirname(mcpFilePath), { recursive: true });
  
  let mcpData = { mcpServers: {} };
  try {
    const existing = await fs.readFile(mcpFilePath, 'utf8');
    mcpData = JSON.parse(existing);
  } catch (error) {
    // File doesn't exist, will create new
  }
  
  mcpData.mcpServers[mcpConfig.id] = mcpConfig.config;
  
  await fs.writeFile(mcpFilePath, JSON.stringify(mcpData, null, 2));
}

async function uninstallProjectMCP(mcpName, projectPath) {
  const mcpFilePath = path.join(projectPath, '.mcp.json');
  
  try {
    const existing = await fs.readFile(mcpFilePath, 'utf8');
    const mcpData = JSON.parse(existing);
    
    if (mcpData.mcpServers && mcpData.mcpServers[mcpName]) {
      delete mcpData.mcpServers[mcpName];
      await fs.writeFile(mcpFilePath, JSON.stringify(mcpData, null, 2));
    }
  } catch (error) {
    // File doesn't exist or is invalid
  }
}

async function uninstallGlobalMCP(mcpName) {
  const os = require('os');
  const configPath = process.platform === 'win32' 
    ? path.join(os.homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json')
    : path.join(os.homedir(), '.config', 'claude', 'claude_desktop_config.json');
  
  try {
    const existing = await fs.readFile(configPath, 'utf8');
    const configData = JSON.parse(existing);
    
    if (configData.mcpServers && configData.mcpServers[mcpName]) {
      delete configData.mcpServers[mcpName];
      await fs.writeFile(configPath, JSON.stringify(configData, null, 2));
    }
  } catch (error) {
    // File doesn't exist or is invalid
  }
}

async function uninstallLocalMCP(mcpName, projectPath) {
  const mcpFilePath = path.join(projectPath, '.claude', 'mcp.json');
  
  try {
    const existing = await fs.readFile(mcpFilePath, 'utf8');
    const mcpData = JSON.parse(existing);
    
    if (mcpData.mcpServers && mcpData.mcpServers[mcpName]) {
      delete mcpData.mcpServers[mcpName];
      await fs.writeFile(mcpFilePath, JSON.stringify(mcpData, null, 2));
    }
  } catch (error) {
    // File doesn't exist or is invalid
  }
}

async function getProjectMCPs(projectPath) {
  const mcpFilePath = path.join(projectPath, '.mcp.json');
  
  try {
    const existing = await fs.readFile(mcpFilePath, 'utf8');
    const mcpData = JSON.parse(existing);
    return Object.keys(mcpData.mcpServers || {});
  } catch (error) {
    return [];
  }
}

async function getGlobalMCPs() {
  const os = require('os');
  const configPath = process.platform === 'win32' 
    ? path.join(os.homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json')
    : path.join(os.homedir(), '.config', 'claude', 'claude_desktop_config.json');
  
  try {
    const existing = await fs.readFile(configPath, 'utf8');
    const configData = JSON.parse(existing);
    return Object.keys(configData.mcpServers || {});
  } catch (error) {
    return [];
  }
}

async function getLocalMCPs(projectPath) {
  const mcpFilePath = path.join(projectPath, '.claude', 'mcp.json');
  
  try {
    const existing = await fs.readFile(mcpFilePath, 'utf8');
    const mcpData = JSON.parse(existing);
    return Object.keys(mcpData.mcpServers || {});
  } catch (error) {
    return [];
  }
}

async function ensureGitignoreEntry(projectPath) {
  const gitignorePath = path.join(projectPath, '.gitignore');
  const mcpEntry = '.mcp.json';
  
  try {
    let gitignoreContent = '';
    try {
      gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
    } catch (error) {
      // File doesn't exist, will create new
    }
    
    // Check if .mcp.json is already in .gitignore
    const lines = gitignoreContent.split('\n');
    const hasEntry = lines.some(line => line.trim() === mcpEntry);
    
    if (!hasEntry) {
      // Add .mcp.json to .gitignore
      const newContent = gitignoreContent.trim() + '\n\n# MCP configuration\n.mcp.json\n';
      await fs.writeFile(gitignorePath, newContent);
    }
  } catch (error) {
    console.error('Failed to update .gitignore:', error);
    throw error;
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
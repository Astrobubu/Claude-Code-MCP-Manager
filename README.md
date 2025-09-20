# Claude MCP Manager

A GUI application to manage MCP (Model Context Protocol) servers for Claude Code projects.

## Features

### ✅ Fully Implemented
- **MCP Registry**: Curated list of popular MCP servers from [awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)
- **Custom Title Bar**: Native window controls (minimize, maximize, close)
- **Visual Interface**: Clean, dark-themed Material-UI interface with professional design
- **Token Usage Tracking**: Shows estimated token consumption and percentage of Claude session limit
- **Search & Filter**: Find MCPs by name, description, or category
- **Real Installation**: Actually modifies MCP configuration files
- **Multiple Scopes**: 
  - **Project**: Creates `.mcp.json` (version controlled, shared with team)
  - **Local**: Creates `.claude/mcp.json` (private, not version controlled)
  - **Global**: Modifies Claude Desktop config (available across all projects)
- **Directory Selection**: Browse and select target project directories
- **Live Status**: Real-time display of installed MCPs per scope
- **File System Integration**: Complete integration with Claude Code configuration system

### 📋 Planned Features
- Real-time MCP status monitoring
- Configuration validation
- Backup/restore functionality
- Import/export MCP collections
- Automated MCP discovery from GitHub
- Comprehensive testing

## Current MCP Registry

The proof of concept includes 5 popular MCPs:

1. **Playwright MCP** - Browser automation using Playwright
2. **Browserbase** - Cloud browser automation
3. **AWS MCP** - AWS services integration
4. **Cloudflare MCP** - Cloudflare services integration
5. **Metatool** - Unified MCP middleware

## Installation

```bash
npm install
```

## Development

```bash
npm start
```

This runs both the React development server and Electron application concurrently.

## Key Features Demonstration

1. **Scope Selection**: Choose installation target (Project/Local/Global)
2. **Directory Browser**: Select project directories for targeted installations
3. **Real File Modification**: 
   - Project scope → Creates/modifies `.mcp.json`
   - Local scope → Creates/modifies `.claude/mcp.json`
   - Global scope → Modifies Claude Desktop configuration
4. **Live Updates**: See installed MCPs update in real-time
5. **Token Tracking**: Visual representation of context usage

## Build

```bash
npm run build
npm run electron-build
```

## Architecture

- **Frontend**: React + Material-UI for the interface
- **Backend**: Electron main process for file system operations
- **Configuration**: JSON-based MCP registry and configuration management
- **Token Counting**: Built-in estimation system for context usage

## Next Steps

1. Implement actual file system operations for MCP configuration
2. Add automated fetching of MCP information from GitHub repositories
3. Expand the MCP registry with more servers
4. Add real-time status monitoring
5. Create comprehensive testing suite

## Contributing

This is a proof of concept. Future versions will include automated MCP discovery and a more comprehensive registry.
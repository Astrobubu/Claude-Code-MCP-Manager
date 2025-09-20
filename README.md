# 🚀 Claude Code MCP Manager

A modern, intuitive desktop application for managing Model Context Protocol (MCP) servers with ease. Built with React + Electron and featuring a beautiful shadcn/ui interface.

![Claude Code MCP Manager](https://img.shields.io/badge/Built%20with-Claude%20Code-blue?style=for-the-badge&logo=anthropic)
![Version](https://img.shields.io/github/v/release/Astrobubu/Claude-Code-MCP-Manager?style=for-the-badge)
![License](https://img.shields.io/github/license/Astrobubu/Claude-Code-MCP-Manager?style=for-the-badge)

## ✨ Features

### 🎯 **MCP Management Made Simple**
- **Browse & Install**: Discover MCPs from our curated registry
- **Multiple Scopes**: Project, Local, and Global installation support
- **Universal Display**: See ALL installed MCPs, even those not in our registry
- **Smart Detection**: Automatically detects existing MCP configurations

### 🎨 **Modern UI/UX**
- **Professional Design**: Clean interface with custom SVG logo and branding
- **Smart Notifications**: Toast notifications that don't disrupt your workflow
- **Single Scrollbar**: Themed scrollbar with proper overflow handling
- **Visual Feedback**: Special styling for MCPs not in registry

### 📧 **Community Features**
- **Request MCPs**: One-click email to request new MCPs for the registry
- **Report Missing**: Easy reporting for installed MCPs not in registry
- **Email Integration**: Pre-filled templates for quick communication

### ✅ **Fully Implemented**
- **Real Installation**: Actually modifies MCP configuration files
- **Multiple Scopes**: 
  - **Project**: Creates `.mcp.json` (version controlled, shared with team)
  - **Local**: Creates `.claude/mcp.json` (private, not version controlled)
  - **Global**: Modifies Claude Desktop config (available across all projects)
- **Directory Selection**: Browse and select target project directories
- **Live Status**: Real-time display of installed MCPs per scope
- **Token Usage Tracking**: Exact token numbers with Claude context window limits
- **Search & Filter**: Find MCPs by name, description, or category

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
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Search, Heart, Star, Settings, FolderOpen, Download, Trash2, Eye, EyeOff, Zap, Shield, RefreshCw, Mail } from 'lucide-react';
import TitleBar from './components/TitleBar';
import MCPCard from './components/MCPCard';
import MCPSettings from './components/MCPSettings';
import TokenUsage from './components/TokenUsage';
import Logo from './components/Logo';
import { Toaster } from './components/ui/toaster';
import { useToast } from './hooks/use-toast';
import mcpRegistry from './data/mcp-registry.json';
import './globals.css';

function App() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [recentlyUsed, setRecentlyUsed] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [scope, setScope] = useState('project');
  const [installedMCPs, setInstalledMCPs] = useState([]);
  const [totalTokens, setTotalTokens] = useState(0);
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedMCP, setSelectedMCP] = useState(null);
  const [mcpConfigs, setMcpConfigs] = useState({});

  // Load data from localStorage on mount
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('mcp-favorites') || '[]');
    const savedRecent = JSON.parse(localStorage.getItem('mcp-recent') || '[]');
    const savedConfigs = JSON.parse(localStorage.getItem('mcp-configs') || '{}');
    
    setFavorites(savedFavorites);
    setRecentlyUsed(savedRecent);
    setMcpConfigs(savedConfigs);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('mcp-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('mcp-recent', JSON.stringify(recentlyUsed));
  }, [recentlyUsed]);


  useEffect(() => {
    localStorage.setItem('mcp-configs', JSON.stringify(mcpConfigs));
  }, [mcpConfigs]);

  useEffect(() => {
    loadInstalledMCPs();
  }, [scope, selectedProject]);

  useEffect(() => {
    const total = installedMCPs.reduce((sum, mcpId) => {
      const registryMCP = mcpRegistry.mcps.find(m => m.id === mcpId);
      return sum + (registryMCP?.estimatedTokens || 0);
    }, 0);
    setTotalTokens(total);
  }, [installedMCPs]);

  const loadInstalledMCPs = async () => {
    if (!window.electronAPI) return;
    
    try {
      const installed = await window.electronAPI.getInstalledMCPs(scope, selectedProject);
      setInstalledMCPs(installed);
    } catch (error) {
      console.error('Failed to load installed MCPs:', error);
    }
  };

  const handleInstallMCP = async (mcpId) => {
    if (!window.electronAPI) {
      toast({
        title: 'Error',
        description: 'Electron API not available',
        variant: 'destructive',
      });
      return;
    }

    if ((scope === 'project' || scope === 'local') && !selectedProject) {
      toast({
        title: 'Warning',
        description: 'Please select a project directory first',
        variant: 'default',
      });
      return;
    }

    setLoading(true);
    try {
      const mcp = mcpRegistry.mcps.find(m => m.id === mcpId);
      if (!mcp) throw new Error('MCP not found in registry');

      // Apply saved configuration
      const configWithValues = { ...mcp };
      if (mcpConfigs[mcpId]) {
        configWithValues.config.env = { ...mcp.config.env, ...mcpConfigs[mcpId] };
      }

      const result = await window.electronAPI.installMCP(configWithValues, scope, selectedProject);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: `${mcp.name} installed successfully!`,
          variant: 'default',
        });
        await loadInstalledMCPs();
        addToRecentlyUsed(mcpId);
        
        // Auto-create/modify .gitignore if needed
        if (scope === 'project' && selectedProject) {
          await ensureGitignore();
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to install MCP: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const ensureGitignore = async () => {
    try {
      // This would be implemented in electron main process
      if (window.electronAPI && window.electronAPI.ensureGitignore) {
        await window.electronAPI.ensureGitignore(selectedProject);
      }
    } catch (error) {
      console.warn('Failed to update .gitignore:', error);
    }
  };

  const handleUninstallMCP = async (mcpId) => {
    if (!window.electronAPI) return;

    setLoading(true);
    try {
      const result = await window.electronAPI.uninstallMCP(mcpId, scope, selectedProject);
      
      if (result.success) {
        const mcp = mcpRegistry.mcps.find(m => m.id === mcpId);
        toast({
          title: 'Success',
          description: `${mcp?.name} uninstalled successfully!`,
          variant: 'default',
        });
        await loadInstalledMCPs();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to uninstall MCP: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectProjectDirectory = async () => {
    if (!window.electronAPI) return;

    try {
      const directory = await window.electronAPI.selectDirectory();
      if (directory) {
        setSelectedProject(directory);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to select directory',
        variant: 'destructive',
      });
    }
  };

  const toggleFavorite = (mcpId) => {
    setFavorites(prev => 
      prev.includes(mcpId) 
        ? prev.filter(id => id !== mcpId)
        : [...prev, mcpId]
    );
  };


  const addToRecentlyUsed = (mcpId) => {
    setRecentlyUsed(prev => {
      const filtered = prev.filter(id => id !== mcpId);
      return [mcpId, ...filtered].slice(0, 10); // Keep last 10
    });
  };

  const openSettings = (mcp) => {
    setSelectedMCP(mcp);
    setSettingsOpen(true);
  };

  const saveSettings = (mcpId, config) => {
    setMcpConfigs(prev => ({
      ...prev,
      [mcpId]: config
    }));
  };

  const requestNewMCP = () => {
    const subject = 'Request for New MCP Server';
    const body = encodeURIComponent(`Hello,

I would like to request the addition of a new MCP server to the Claude Code MCP Manager.

MCP Details:
- Name: 
- Description: 
- Repository URL: 
- Package: 
- Category: 
- Tags: 

Additional Information:
Please provide any additional details about the MCP server functionality and why it would be valuable to include.

Thank you!`);
    
    const mailtoLink = `mailto:ahmad6093@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
    
    if (window.electronAPI && window.electronAPI.openExternal) {
      window.electronAPI.openExternal(mailtoLink);
    } else {
      // Fallback for development
      window.open(mailtoLink, '_blank');
    }
  };

  const getFilteredMCPs = (mcps) => {
    return mcps.filter(mcp => {
      const matchesSearch = mcp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           mcp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           mcp.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = !selectedCategory || mcp.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  };

  // Create placeholder MCP objects for installed MCPs not in registry
  const createPlaceholderMCP = (mcpId) => ({
    id: mcpId,
    name: mcpId.charAt(0).toUpperCase() + mcpId.slice(1).replace(/[-_]/g, ' '),
    description: `Installed MCP server: ${mcpId}. This MCP is not in our registry - click "Report Missing" to help us add it!`,
    category: "Installed",
    repository: "#",
    requiresApi: false,
    config: {},
    apiFields: [],
    estimatedTokens: 0,
    installation: {
      type: "external",
      package: mcpId
    },
    tags: ["installed", "external", "missing-info"],
    popularity: 0,
    isPlaceholder: true
  });

  const reportMissingMCP = (mcpId) => {
    const subject = `Missing MCP in Registry: ${mcpId}`;
    const body = encodeURIComponent(`Hello,

I found an installed MCP server that's not in the registry:

MCP ID: ${mcpId}
Project Path: ${selectedProject || 'Not specified'}

Please consider adding this MCP to the registry with proper information:
- Name: 
- Description: 
- Repository URL: 
- Package/Installation Info: 
- Category: 
- Tags: 
- API Requirements: 

Additional Details:
Please provide any additional information about this MCP server that would help others discover and use it.

Thank you!`);
    
    const mailtoLink = `mailto:ahmad6093@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
    
    if (window.electronAPI && window.electronAPI.openExternal) {
      window.electronAPI.openExternal(mailtoLink);
    } else {
      window.open(mailtoLink, '_blank');
    }
  };

  // Get all MCPs for installed tab (registry + placeholders)
  const getAllInstalledMCPs = () => {
    const registryMCPs = mcpRegistry.mcps.filter(mcp => installedMCPs.includes(mcp.id));
    const missingMCPs = installedMCPs
      .filter(mcpId => !mcpRegistry.mcps.find(mcp => mcp.id === mcpId))
      .map(createPlaceholderMCP);
    
    return [...registryMCPs, ...missingMCPs];
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <TitleBar />
      
      <div className="flex-1 flex flex-col min-h-0 p-6">

        {/* Logo and App Title */}
        <div className="flex items-center justify-center mb-6">
          <Logo className="w-12 h-12 text-primary mr-4" />
          <h1 className="text-3xl font-bold text-foreground">Claude Code MCP Manager</h1>
        </div>

        {/* Configuration Panel */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              Installation Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center justify-between">
              <div className="flex gap-4 items-center flex-1">
                <div className="flex gap-2">
                  <Button
                    variant={scope === 'project' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setScope('project')}
                  >
                    Project
                  </Button>
                  <Button
                    variant={scope === 'local' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setScope('local')}
                  >
                    Local
                  </Button>
                  <Button
                    variant={scope === 'user' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setScope('user')}
                  >
                    Global
                  </Button>
                </div>

                {(scope === 'local' || scope === 'project') && (
                  <div className="flex gap-2 flex-1">
                    <Input
                      placeholder="Select project directory..."
                      value={selectedProject}
                      readOnly
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={selectProjectDirectory}>
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <Button variant="outline" onClick={loadInstalledMCPs} size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              <TokenUsage totalTokens={totalTokens} />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="search" className="flex flex-col flex-1 min-h-0">
          <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Favorites ({favorites.length})
            </TabsTrigger>
            <TabsTrigger value="installed" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Installed ({installedMCPs.length})
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Recent ({recentlyUsed.length})
            </TabsTrigger>
          </TabsList>

          {/* Search Filters */}
          <div className="flex gap-4 mb-4 mt-4 flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search MCPs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
              <option value="">All Categories</option>
              {mcpRegistry.categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <Button variant="outline" onClick={requestNewMCP} size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Request MCP
            </Button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <TabsContent value="search" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                {getFilteredMCPs(mcpRegistry.mcps).map(mcp => (
                  <MCPCard
                    key={mcp.id}
                    mcp={mcp}
                    isInstalled={installedMCPs.includes(mcp.id)}
                    isFavorite={favorites.includes(mcp.id)}
                    onInstall={handleInstallMCP}
                    onUninstall={handleUninstallMCP}
                    onToggleFavorite={toggleFavorite}
                    onSettings={openSettings}
                    loading={loading}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="favorites" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                {getFilteredMCPs(mcpRegistry.mcps.filter(mcp => favorites.includes(mcp.id))).map(mcp => (
                  <MCPCard
                    key={mcp.id}
                    mcp={mcp}
                    isInstalled={installedMCPs.includes(mcp.id)}
                    isFavorite={true}
                    onInstall={handleInstallMCP}
                    onUninstall={handleUninstallMCP}
                    onToggleFavorite={toggleFavorite}
                    onSettings={openSettings}
                    loading={loading}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="installed" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                {getAllInstalledMCPs().map(mcp => (
                  <MCPCard
                    key={mcp.id}
                    mcp={mcp}
                    isInstalled={true}
                    isFavorite={favorites.includes(mcp.id)}
                    onInstall={handleInstallMCP}
                    onUninstall={handleUninstallMCP}
                    onToggleFavorite={toggleFavorite}
                    onSettings={openSettings}
                    onReportMissing={mcp.isPlaceholder ? reportMissingMCP : undefined}
                    loading={loading}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                {recentlyUsed.map(mcpId => {
                  const mcp = mcpRegistry.mcps.find(m => m.id === mcpId);
                  if (!mcp) return null;
                  
                  return (
                    <MCPCard
                      key={mcp.id}
                      mcp={mcp}
                      isInstalled={installedMCPs.includes(mcp.id)}
                      isFavorite={favorites.includes(mcp.id)}
                      onInstall={handleInstallMCP}
                      onUninstall={handleUninstallMCP}
                      onToggleFavorite={toggleFavorite}
                      onSettings={openSettings}
                      loading={loading}
                    />
                  );
                })}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {selectedMCP && (
        <MCPSettings
          mcp={selectedMCP}
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onSave={saveSettings}
          currentConfig={mcpConfigs[selectedMCP.id] || {}}
        />
      )}
      <Toaster />
    </div>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { X, Save, Settings, Shield, Zap, Eye, EyeOff } from 'lucide-react';

function MCPSettings({ mcp, isOpen, onClose, onSave, currentConfig }) {
  const [config, setConfig] = useState({});
  const [showPasswords, setShowPasswords] = useState({});

  useEffect(() => {
    if (isOpen && mcp) {
      // Initialize config with current values or defaults
      const initialConfig = {};
      if (mcp.apiFields) {
        mcp.apiFields.forEach(field => {
          initialConfig[field.name] = currentConfig[field.name] || '';
        });
      }
      setConfig(initialConfig);
    }
  }, [isOpen, mcp, currentConfig]);

  const handleConfigChange = (fieldName, value) => {
    setConfig(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const togglePasswordVisibility = (fieldName) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const handleSave = () => {
    onSave(mcp.id, config);
    onClose();
  };

  if (!isOpen || !mcp) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5" />
              <div>
                <CardTitle>{mcp.name} Configuration</CardTitle>
                <CardDescription>Configure settings and API keys for this MCP</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* MCP Info */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">MCP Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Category:</span>
                <p>{mcp.category}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Token Usage:</span>
                <p>~{mcp.estimatedTokens.toLocaleString()} tokens</p>
              </div>
              <div>
                <span className="text-muted-foreground">Package:</span>
                <p className="font-mono text-xs">{mcp.installation.package}</p>
              </div>
              <div>
                <span className="text-muted-foreground">API Required:</span>
                <Badge variant={mcp.requiresApi ? "warning" : "success"} className="gap-1">
                  {mcp.requiresApi ? (
                    <>
                      <Shield className="h-3 w-3" />
                      Yes
                    </>
                  ) : (
                    <>
                      <Zap className="h-3 w-3" />
                      No
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>

          {/* Command Configuration */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Command Configuration</h3>
            <div className="bg-muted/50 p-3 rounded-lg">
              <code className="text-sm">
                {mcp.config.command} {mcp.config.args.join(' ')}
              </code>
            </div>
          </div>

          {/* API Configuration */}
          {mcp.requiresApi && mcp.apiFields && mcp.apiFields.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">API Configuration</h3>
              <div className="space-y-4">
                {mcp.apiFields.map(field => (
                  <div key={field.name} className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      {field.label}
                      {field.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </label>
                    
                    {field.type === 'select' ? (
                      <select
                        value={config[field.name] || ''}
                        onChange={(e) => handleConfigChange(field.name, e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="">Select {field.label}</option>
                        {field.options?.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="relative">
                        <Input
                          type={field.type === 'password' && !showPasswords[field.name] ? 'password' : 'text'}
                          placeholder={`Enter ${field.label}`}
                          value={config[field.name] || ''}
                          onChange={(e) => handleConfigChange(field.name, e.target.value)}
                          className="pr-10"
                        />
                        {field.type === 'password' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full w-10"
                            onClick={() => togglePasswordVisibility(field.name)}
                          >
                            {showPasswords[field.name] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                    
                    {field.description && (
                      <p className="text-xs text-muted-foreground">{field.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Environment Variables (Non-API) */}
          {!mcp.requiresApi && Object.keys(mcp.config.env).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Environment Variables</h3>
              <div className="space-y-3">
                {Object.entries(mcp.config.env).map(([key, defaultValue]) => (
                  <div key={key} className="space-y-2">
                    <label className="text-sm font-medium">{key}</label>
                    <Input
                      placeholder={`Enter ${key}`}
                      value={config[key] || defaultValue || ''}
                      onChange={(e) => handleConfigChange(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {mcp.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default MCPSettings;
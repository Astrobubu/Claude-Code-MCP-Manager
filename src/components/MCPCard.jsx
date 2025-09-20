import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Heart, 
  Download, 
  Trash2, 
  Settings, 
  ExternalLink,
  Zap,
  Shield,
  CheckCircle,
  Clock,
  Mail,
  AlertTriangle
} from 'lucide-react';

function MCPCard({ 
  mcp, 
  isInstalled, 
  isFavorite, 
  onInstall, 
  onUninstall, 
  onToggleFavorite, 
  onSettings,
  onReportMissing,
  loading 
}) {
  const handleInstall = () => onInstall(mcp.id);
  const handleUninstall = () => onUninstall(mcp.id);
  const handleToggleFavorite = () => onToggleFavorite(mcp.id);
  const handleSettings = () => onSettings(mcp);
  const handleReportMissing = () => onReportMissing && onReportMissing(mcp.id);

  const openRepository = () => {
    if (window.electronAPI && window.electronAPI.openExternal) {
      window.electronAPI.openExternal(mcp.repository);
    } else {
      // Fallback for development
      console.log('Opening:', mcp.repository);
    }
  };

  const getApiStatusBadge = () => {
    if (mcp.requiresApi) {
      return (
        <Badge variant="warning" className="gap-1">
          <Shield className="h-3 w-3" />
          API Required
        </Badge>
      );
    } else {
      return (
        <Badge variant="success" className="gap-1">
          <Zap className="h-3 w-3" />
          No API
        </Badge>
      );
    }
  };

  const getPopularityColor = () => {
    if (mcp.popularity >= 90) return 'text-green-400';
    if (mcp.popularity >= 80) return 'text-blue-400';
    if (mcp.popularity >= 70) return 'text-yellow-400';
    return 'text-gray-400';
  };

  return (
    <Card className={`h-full flex flex-col hover:border-primary/50 transition-colors ${mcp.isPlaceholder ? 'border-orange-500/50 bg-orange-500/5' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {mcp.isPlaceholder && <AlertTriangle className="h-4 w-4 text-orange-500" />}
              {mcp.name}
              {isInstalled && (
                <CheckCircle className="h-4 w-4 text-green-400" />
              )}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={mcp.isPlaceholder ? "secondary" : "outline"} className="text-xs">
                {mcp.category}
              </Badge>
              {mcp.isPlaceholder ? (
                <Badge variant="outline" className="text-xs text-orange-500 border-orange-500">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Missing Info
                </Badge>
              ) : (
                getApiStatusBadge()
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleToggleFavorite}
            >
              <Heart 
                className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
              />
            </Button>
            <div className={`text-xs font-medium ${getPopularityColor()}`}>
              {mcp.popularity}%
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <CardDescription className="text-sm leading-relaxed mb-3">
          {mcp.description}
        </CardDescription>

        <div className="flex flex-wrap gap-1 mb-3">
          {mcp.tags.slice(0, 4).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {mcp.tags.length > 4 && (
            <Badge variant="secondary" className="text-xs">
              +{mcp.tags.length - 4}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {mcp.isPlaceholder ? 'Unknown tokens' : `~${mcp.estimatedTokens.toLocaleString()} tokens`}
          </span>
          <span className="truncate max-w-32">
            {mcp.installation.package}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex-col gap-2">
        <div className="flex w-full gap-2">
          {mcp.isPlaceholder ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReportMissing}
              className="flex-1 text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white"
            >
              <Mail className="h-3 w-3 mr-1" />
              Report Missing
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={openRepository}
                className="flex-1"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                GitHub
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSettings}
                className="flex-1"
              >
                <Settings className="h-3 w-3 mr-1" />
                Settings
              </Button>
            </>
          )}
        </div>

        <div className="flex w-full gap-2">
          {isInstalled ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleUninstall}
              disabled={loading}
              className="flex-1"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Uninstall
            </Button>
          ) : (
            <Button
              onClick={handleInstall}
              disabled={loading}
              size="sm"
              className="flex-1"
            >
              <Download className="h-3 w-3 mr-1" />
              Install
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default MCPCard;
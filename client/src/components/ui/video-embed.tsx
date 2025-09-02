import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Play, 
  Clock, 
  ExternalLink, 
  Volume2, 
  Maximize,
  BookOpen,
  FileText,
  Edit,
  Save,
  X
} from "lucide-react";

export interface VideoContent {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  category: 'getting-started' | 'properties' | 'financial' | 'advanced';
  thumbnail?: string;
  videoUrl?: string;
  embedId?: string;
  platform: 'youtube' | 'vimeo' | 'loom' | 'custom';
  hasScript?: boolean;
  scriptContent?: string;
  relatedTutorial?: string;
}

interface VideoEmbedProps {
  video: VideoContent;
  showScript?: boolean;
  onWatchComplete?: () => void;
  allowEdit?: boolean;
  onVideoUpdate?: (videoId: string, embedId: string) => void;
}

export function VideoEmbed({ video, showScript = false, onWatchComplete, allowEdit = false, onVideoUpdate }: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showScriptDialog, setShowScriptDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editEmbedId, setEditEmbedId] = useState(video.embedId || '');

  const getEmbedUrl = () => {
    if (video.videoUrl) return video.videoUrl;
    
    switch (video.platform) {
      case 'youtube':
        return `https://www.youtube.com/embed/${video.embedId}?autoplay=1&rel=0`;
      case 'vimeo':
        return `https://player.vimeo.com/video/${video.embedId}?autoplay=1`;
      case 'loom':
        return `https://www.loom.com/embed/${video.embedId}?autoplay=1`;
      default:
        return '';
    }
  };

  const handlePlayClick = () => {
    if (video.embedId && video.embedId !== 'placeholder') {
      setIsPlaying(true);
      // Track video start for analytics
    }
  };

  const handleSaveEmbed = () => {
    if (onVideoUpdate && editEmbedId.trim()) {
      // Extract YouTube video ID from various URL formats
      const youtubeId = extractYouTubeId(editEmbedId.trim());
      if (youtubeId) {
        onVideoUpdate(video.id, youtubeId);
        setIsEditing(false);
      }
    }
  };

  const extractYouTubeId = (url: string): string => {
    // Handle direct video ID
    if (url.length === 11 && !url.includes('/')) {
      return url;
    }
    
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return url; // Return as-is if no pattern matches
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        {!isPlaying ? (
          // Thumbnail with play button
          <div 
            className="relative bg-gray-900 aspect-video flex items-center justify-center cursor-pointer group"
            onClick={handlePlayClick}
          >
            {video.thumbnail ? (
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="h-16 w-16 mx-auto mb-4 opacity-80" />
                  <p className="text-lg font-medium">{video.title}</p>
                </div>
              </div>
            )}
            
            {/* Play overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-30 transition-all">
              <div className="bg-white bg-opacity-90 rounded-full p-4 group-hover:scale-110 transition-transform">
                {video.embedId && video.embedId !== 'placeholder' ? (
                  <Play className="h-8 w-8 text-gray-900 ml-1" />
                ) : (
                  <div className="h-8 w-8 flex items-center justify-center text-gray-600">
                    <FileText className="h-6 w-6" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Duration badge */}
            <Badge className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white border-0">
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(video.duration)}
            </Badge>
          </div>
        ) : (
          // Video embed
          <div className="aspect-video">
            {getEmbedUrl() ? (
              <iframe
                src={getEmbedUrl()}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; encrypted-media"
                onLoad={() => onWatchComplete?.()}
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white">
                <div className="text-center">
                  <Volume2 className="h-12 w-12 mx-auto mb-4 opacity-60" />
                  <p className="text-lg">Video Coming Soon</p>
                  <p className="text-sm opacity-80 mt-2">Add a YouTube link to embed this video</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{video.title}</CardTitle>
            <p className="text-gray-600 text-sm mt-1">{video.description}</p>
          </div>
          <div className="flex flex-col gap-2 ml-4">
            <div className="flex gap-2">
              {video.hasScript && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowScriptDialog(true)}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Script
                </Button>
              )}
              {video.relatedTutorial && (
                <Button variant="outline" size="sm">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Tutorial
                </Button>
              )}
            </div>
            {allowEdit && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-1" />
                YT Link
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      {showScript && video.scriptContent && (
        <CardContent className="border-t bg-gray-50">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Video Script
            </h4>
            <div className="prose prose-sm max-w-none text-gray-700">
              <pre className="whitespace-pre-wrap text-sm">{video.scriptContent}</pre>
            </div>
          </div>
        </CardContent>
      )}
      
      {/* Edit Video Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Video: {video.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="embedId">YouTube Video URL or ID</Label>
              <Input
                id="embedId"
                value={editEmbedId}
                onChange={(e) => setEditEmbedId(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or video ID"
                className="mt-1"
              />
              <p className="text-sm text-gray-600 mt-2">
                Paste a YouTube video URL or just the 11-character video ID
              </p>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button onClick={handleSaveEmbed}>
                <Save className="h-4 w-4 mr-1" />
                Save Video
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Script Dialog */}
      <Dialog open={showScriptDialog} onOpenChange={setShowScriptDialog}>
        <DialogContent className="max-w-4xl w-[95vw] h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Video Script: {video.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            <div className="prose prose-gray max-w-none">
              <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg">
                {video.scriptContent || 'Script content not available.'}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

interface VideoLibraryProps {
  videos: VideoContent[];
  category?: VideoContent['category'];
  onVideoSelect?: (video: VideoContent) => void;
}

export function VideoLibrary({ videos, category, onVideoSelect }: VideoLibraryProps) {
  const filteredVideos = category 
    ? videos.filter(video => video.category === category)
    : videos;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {filteredVideos.map((video) => (
        <VideoEmbed 
          key={video.id} 
          video={video} 
          onWatchComplete={() => onVideoSelect?.(video)}
        />
      ))}
    </div>
  );
}